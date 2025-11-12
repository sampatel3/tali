import { prisma } from '../server.js';
import * as nebrasService from '../features/banking/services/nebrasService.js';
import { addJob } from '../services/jobs/queueService.js';

export async function createLinkToken(req, res) {
  try {
    const userId = req.user.userId;
    const linkToken = await nebrasService.createLinkToken(userId);

    res.json({ link_token: linkToken.link_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function exchangeToken(req, res) {
  try {
    const { public_token } = req.body;
    const userId = req.user.userId;

    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    // Exchange token
    const { accessToken, itemId } = await nebrasService.exchangePublicToken(public_token);

    // Get account details
    const accounts = await nebrasService.getAccounts(accessToken);

    // Encrypt and store
    const encryptedToken = nebrasService.encryptAccessToken(accessToken);

    // Save accounts to database
    const savedAccounts = await Promise.all(
      accounts.map(account =>
        prisma.bankAccount.create({
          data: {
            userId,
            nebrasAccountId: itemId,
            nebrasAccessToken: encryptedToken,
            accountId: account.account_id,
            institutionId: account.institution_id,
            institutionName: account.institution_name,
            accountName: account.name,
            accountType: account.type,
            accountSubtype: account.subtype,
            mask: account.mask,
            currentBalance: account.balances?.current || 0,
            availableBalance: account.balances?.available || 0,
            currency: account.balances?.iso_currency_code || 'AED',
            lastSyncedAt: new Date(),
          },
        })
      )
    );

    // Trigger initial transaction sync
    await addJob('sync-transactions', { userId, itemId });

    res.json({ success: true, accounts: savedAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAccounts(req, res) {
  try {
    const userId = req.user.userId;

    const accounts = await prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        institutionName: true,
        accountName: true,
        accountType: true,
        mask: true,
        currentBalance: true,
        availableBalance: true,
        currency: true,
        lastSyncedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function syncAccount(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const account = await prisma.bankAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Trigger sync job
    await addJob('sync-transactions', {
      userId,
      accountId: account.id,
      itemId: account.nebrasAccountId,
    });

    res.json({ success: true, message: 'Sync initiated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const account = await prisma.bankAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Decrypt and remove from Nebras
    if (account.nebrasAccessToken) {
      const accessToken = nebrasService.decryptAccessToken(account.nebrasAccessToken);
      await nebrasService.removeItem(accessToken);
    }

    // Soft delete
    await prisma.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

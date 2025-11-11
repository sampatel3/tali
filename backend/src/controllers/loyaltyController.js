import { prisma } from '../server.js';
import * as loyaltyService from '../services/loyalty/loyaltyService.js';

export async function getLoyaltyPrograms(req, res) {
  try {
    const { category, country } = req.query;

    const where = { isActive: true };
    if (category) {
      where.category = category;
    }

    const programs = await prisma.loyaltyProgram.findMany({
      where,
      orderBy: { popularityScore: 'desc' }
    });

    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserLoyaltyCards(req, res) {
  try {
    const userId = req.user.userId;

    const cards = await prisma.userLoyaltyCard.findMany({
      where: { userId },
      include: {
        loyaltyProgram: true,
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { currentPoints: 'desc' }
    });

    // Calculate total value
    const totalValue = cards.reduce((sum, card) => {
      return sum + parseFloat(card.currentBalanceAed);
    }, 0);

    res.json({
      cards,
      summary: {
        totalCards: cards.length,
        totalValue: totalValue.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getLoyaltyCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const card = await prisma.userLoyaltyCard.findFirst({
      where: { id, userId },
      include: {
        loyaltyProgram: true,
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 20
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Loyalty card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addLoyaltyCard(req, res) {
  try {
    const userId = req.user.userId;
    const {
      loyaltyProgramId,
      membershipNumber,
      memberTier,
      currentPoints
    } = req.body;

    // Check if card already exists
    const existing = await prisma.userLoyaltyCard.findFirst({
      where: {
        userId,
        loyaltyProgramId,
        membershipNumber
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Loyalty card already exists' });
    }

    // Get program details for conversion
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: loyaltyProgramId }
    });

    const currentBalanceAed = program?.pointsToCurrencyRatio
      ? parseFloat(currentPoints || 0) * parseFloat(program.pointsToCurrencyRatio)
      : 0;

    const card = await prisma.userLoyaltyCard.create({
      data: {
        userId,
        loyaltyProgramId,
        membershipNumber,
        memberTier,
        currentPoints: currentPoints || 0,
        currentBalanceAed,
        isManual: true,
        status: 'active'
      },
      include: {
        loyaltyProgram: true
      }
    });

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateLoyaltyCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const existing = await prisma.userLoyaltyCard.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Loyalty card not found' });
    }

    // Recalculate AED value if points changed
    if (updates.currentPoints) {
      const program = await prisma.loyaltyProgram.findUnique({
        where: { id: existing.loyaltyProgramId }
      });

      if (program?.pointsToCurrencyRatio) {
        updates.currentBalanceAed = parseFloat(updates.currentPoints) * parseFloat(program.pointsToCurrencyRatio);
      }
    }

    const card = await prisma.userLoyaltyCard.update({
      where: { id },
      data: updates,
      include: {
        loyaltyProgram: true
      }
    });

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteLoyaltyCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const card = await prisma.userLoyaltyCard.findFirst({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Loyalty card not found' });
    }

    await prisma.userLoyaltyCard.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getLoyaltyTransactions(req, res) {
  try {
    const userId = req.user.userId;
    const { cardId, limit = 50 } = req.query;

    const where = {};
    if (cardId) {
      // Verify ownership
      const card = await prisma.userLoyaltyCard.findFirst({
        where: { id: cardId, userId }
      });
      if (!card) {
        return res.status(404).json({ error: 'Loyalty card not found' });
      }
      where.userLoyaltyCardId = cardId;
    } else {
      // Get all user's cards
      const cards = await prisma.userLoyaltyCard.findMany({
        where: { userId },
        select: { id: true }
      });
      where.userLoyaltyCardId = { in: cards.map(c => c.id) };
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: parseInt(limit),
      include: {
        userLoyaltyCard: {
          include: {
            loyaltyProgram: true
          }
        }
      }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function syncLoyaltyCard(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const card = await prisma.userLoyaltyCard.findFirst({
      where: { id, userId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Loyalty card not found' });
    }

    // TODO: Implement actual API sync with loyalty programs
    // For now, just update lastSyncedAt
    await prisma.userLoyaltyCard.update({
      where: { id },
      data: { lastSyncedAt: new Date() }
    });

    res.json({ success: true, message: 'Sync completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSuggestions(req, res) {
  try {
    const userId = req.user.userId;

    const suggestions = await loyaltyService.detectLoyaltyFromTransactions(userId);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

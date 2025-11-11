import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = { userId };

    if (accountId) {
      where.bankAccountId = accountId;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        subscription: {
          select: {
            id: true,
            merchantName: true,
            billingFrequency: true
          }
        }
      }
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        bankAccount: true,
        subscription: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

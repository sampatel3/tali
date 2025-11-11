import express from 'express';
import { prisma } from '../../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      accountId,
      startDate,
      endDate,
      category,
      type,
      searchQuery,
      limit = 100,
      offset = 0
    } = req.query;

    const where = { userId };

    if (accountId) {
      where.bankAccountId = accountId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (searchQuery) {
      where.OR = [
        { merchantName: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        bankAccount: {
          select: {
            id: true,
            accountName: true,
            bankName: true,
            mask: true
          }
        },
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

    // Calculate summary stats
    const stats = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true
      }
    });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      stats: {
        totalAmount: stats._sum.amount || 0,
        count: total
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

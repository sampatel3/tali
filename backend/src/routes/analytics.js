import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get active subscriptions total
    const subscriptions = await prisma.subscription.findMany({
      where: { userId, status: 'active' }
    });

    const monthlyTotal = subscriptions.reduce((sum, sub) => {
      if (sub.billingFrequency === 'monthly') {
        return sum + parseFloat(sub.amount);
      } else if (sub.billingFrequency === 'yearly') {
        return sum + (parseFloat(sub.amount) / 12);
      }
      return sum;
    }, 0);

    // Get loyalty cards value
    const loyaltyCards = await prisma.userLoyaltyCard.findMany({
      where: { userId, status: 'active' }
    });

    const loyaltyValue = loyaltyCards.reduce((sum, card) => {
      return sum + parseFloat(card.currentBalanceAed);
    }, 0);

    // Get transaction stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: thirtyDaysAgo }
      }
    });

    const totalSpent = recentTransactions.reduce((sum, txn) => {
      return sum + Math.abs(parseFloat(txn.amount));
    }, 0);

    res.json({
      subscriptions: {
        count: subscriptions.length,
        monthlyTotal: monthlyTotal.toFixed(2),
        yearlyProjected: (monthlyTotal * 12).toFixed(2)
      },
      loyalty: {
        cardsCount: loyaltyCards.length,
        totalValue: loyaltyValue.toFixed(2)
      },
      spending: {
        last30Days: totalSpent.toFixed(2),
        transactionCount: recentTransactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/spending-by-category', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const where = { userId };
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({ where });

    const byCategory = {};
    transactions.forEach(txn => {
      const category = txn.category || 'uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = { category, total: 0, count: 0 };
      }
      byCategory[category].total += Math.abs(parseFloat(txn.amount));
      byCategory[category].count += 1;
    });

    const result = Object.values(byCategory)
      .sort((a, b) => b.total - a.total)
      .map(item => ({
        ...item,
        total: item.total.toFixed(2)
      }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

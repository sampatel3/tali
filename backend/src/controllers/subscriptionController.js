import { prisma } from '../server.js';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function getSubscriptions(req, res) {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { nextChargeDate: 'asc' },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    // Calculate totals
    const totals = {
      monthly: 0,
      yearly: 0,
      total: 0,
      count: subscriptions.length
    };

    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        const amount = parseFloat(sub.amount);
        if (sub.billingFrequency === 'monthly') {
          totals.monthly += amount;
          totals.total += amount;
        } else if (sub.billingFrequency === 'yearly') {
          totals.yearly += amount;
          totals.total += (amount / 12);
        }
      }
    });

    res.json({
      subscriptions,
      totals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 10
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createSubscription(req, res) {
  try {
    const userId = req.user.userId;
    const {
      merchantName,
      amount,
      billingFrequency,
      nextChargeDate,
      category,
      notes
    } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        merchantName,
        amount,
        currency: 'AED',
        billingFrequency,
        nextChargeDate: nextChargeDate ? new Date(nextChargeDate) : null,
        category,
        notes,
        isManual: true,
        status: 'active'
      }
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Update
    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...updates,
        nextChargeDate: updates.nextChargeDate ? new Date(updates.nextChargeDate) : undefined
      }
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const subscription = await prisma.subscription.findFirst({
      where: { id, userId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Soft delete by setting status to cancelled
    await prisma.subscription.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function detectSubscriptions(req, res) {
  try {
    const userId = req.user.userId;

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        isSubscription: false,
        transactionDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // Last 6 months
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 500
    });

    const detectedSubscriptions = [];

    // Process each transaction through ML service
    for (const transaction of transactions) {
      try {
        // Get transaction history for the same merchant
        const history = await prisma.transaction.findMany({
          where: {
            userId,
            merchantName: transaction.merchantName,
            transactionDate: {
              lt: transaction.transactionDate
            }
          },
          orderBy: { transactionDate: 'desc' },
          take: 12
        });

        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/detect`, {
          transaction: {
            merchant_name: transaction.merchantName,
            amount: parseFloat(transaction.amount),
            date: transaction.transactionDate.toISOString()
          },
          history: history.map(t => ({
            merchant_name: t.merchantName,
            amount: parseFloat(t.amount),
            date: t.transactionDate.toISOString()
          }))
        }, {
          timeout: 5000
        });

        if (mlResponse.data.is_subscription && mlResponse.data.confidence > 0.7) {
          // Check if subscription already exists
          const existing = await prisma.subscription.findFirst({
            where: {
              userId,
              merchantName: transaction.merchantName,
              status: 'active'
            }
          });

          if (!existing) {
            const subscription = await prisma.subscription.create({
              data: {
                userId,
                merchantName: transaction.merchantName,
                amount: transaction.amount,
                currency: transaction.currency,
                billingFrequency: mlResponse.data.frequency,
                category: mlResponse.data.category,
                subcategory: mlResponse.data.subcategory,
                nextChargeDate: mlResponse.data.next_charge_date ? new Date(mlResponse.data.next_charge_date) : null,
                detectionConfidence: mlResponse.data.confidence,
                firstChargeDate: transaction.transactionDate,
                lastChargeDate: transaction.transactionDate,
                status: 'active',
                isManual: false
              }
            });

            detectedSubscriptions.push(subscription);

            // Mark transaction as subscription
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                isSubscription: true,
                subscriptionId: subscription.id
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error.message);
      }
    }

    res.json({
      success: true,
      detected: detectedSubscriptions.length,
      subscriptions: detectedSubscriptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

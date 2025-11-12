import { prisma } from '../../../server.js';
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
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Calculate statistics
    const transactions = subscription.transactions || [];
    const totalPaid = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const averageAmount = transactions.length > 0 ? totalPaid / transactions.length : 0;
    const firstPayment = transactions.length > 0 ? transactions[transactions.length - 1].date : null;
    const lastPayment = transactions.length > 0 ? transactions[0].date : null;

    res.json({
      ...subscription,
      stats: {
        totalPaid,
        averageAmount,
        paymentCount: transactions.length,
        firstPayment,
        lastPayment
      }
    });
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

    // Get transactions (prioritize recent ones but include all for better detection)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        isSubscription: false
      },
      orderBy: { date: 'desc' },
      take: 1000 // Increased limit to catch more subscriptions
    });

    const detectedSubscriptions = [];

    // Group transactions by merchant for efficient processing
    const merchantGroups = {};
    for (const txn of transactions) {
      const key = txn.merchantName.toUpperCase();
      if (!merchantGroups[key]) {
        merchantGroups[key] = [];
      }
      merchantGroups[key].push(txn);
    }

    // Process each merchant group
    for (const [merchant, txnGroup] of Object.entries(merchantGroups)) {
      // Sort by date
      const sorted = txnGroup.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Use the most recent transaction
      const latest = sorted[sorted.length - 1];
      const history = sorted.slice(0, -1);

      try {
        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/detect`, {
          transaction: {
            merchant_name: latest.merchantName,
            amount: parseFloat(latest.amount),
            date: latest.date.toISOString()
          },
          history: history.map(t => ({
            merchant_name: t.merchantName,
            amount: parseFloat(t.amount),
            date: t.date.toISOString()
          }))
        }, {
          timeout: 5000
        });

        if (mlResponse.data.is_subscription && mlResponse.data.confidence > 0.7) {
          // Check if subscription already exists
          const existing = await prisma.subscription.findFirst({
            where: {
              userId,
              merchantName: latest.merchantName,
              status: { in: ['active', 'paused'] }
            }
          });

          if (!existing) {
            const subscription = await prisma.subscription.create({
              data: {
                userId,
                merchantName: latest.merchantName,
                amount: latest.amount,
                currency: latest.currency || 'AED',
                billingFrequency: mlResponse.data.frequency,
                category: mlResponse.data.category,
                subcategory: mlResponse.data.subcategory,
                nextChargeDate: mlResponse.data.next_charge_date ? new Date(mlResponse.data.next_charge_date) : null,
                detectionConfidence: mlResponse.data.confidence,
                firstChargeDate: sorted[0]?.date || latest.date,
                lastChargeDate: latest.date,
                status: 'active',
                isManual: false,
                transactionCount: txnGroup.length
              }
            });

            detectedSubscriptions.push(subscription);

            // Mark all transactions for this merchant as subscriptions
            await prisma.transaction.updateMany({
              where: {
                id: { in: txnGroup.map(t => t.id) },
                isSubscription: false
              },
              data: {
                isSubscription: true,
                subscriptionId: subscription.id
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error detecting subscription for ${merchant}:`, error.message);
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

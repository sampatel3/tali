import { statementProcessingQueue } from '../../../services/jobs/queueService.js';
import { prisma } from '../../../server.js';
import { parseStatement } from '../services/statementParser.js';
import { categorizeTransaction, generateTransactionHash, validateTransaction } from '../../../shared/utils/helpers.js';
import axios from 'axios';
import fs from 'fs';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Ensure upload directory exists (same as controller)
const uploadDir = process.env.UPLOAD_DIR || process.env.NODE_ENV === 'production' 
  ? '/app/uploads/statements' 
  : 'uploads/statements';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Process uploaded bank statement
 */
statementProcessingQueue.process(async (job) => {
  const { statementId, userId, filepath, mimeType } = job.data;

  console.log(`Processing statement ${statementId} for user ${userId}`);

  try {
    // Update status to processing
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: { status: 'processing' },
    });

    // Parse the statement
    job.progress(10);
    let parseResult;
    try {
      parseResult = await parseStatement(filepath, mimeType);
      console.log(`Parsed ${parseResult.totalCount} transactions from ${parseResult.bankName}`);
    } catch (parseError) {
      console.error('Statement parsing error:', parseError);
      await prisma.bankStatement.update({
        where: { id: statementId },
        data: {
          status: 'failed',
          errorMessage: `Parsing failed: ${parseError.message}`,
        },
      });
      throw parseError;
    }

    if (parseResult.totalCount === 0) {
      // Log detailed information for debugging
      console.warn(`No transactions found in statement ${statementId}`, {
        bankName: parseResult.bankName,
        mimeType,
        filepath,
      });
      
      // Update status with helpful message
      await prisma.bankStatement.update({
        where: { id: statementId },
        data: {
          status: 'completed',
          transactionCount: 0,
          errorMessage: mimeType === 'application/pdf' 
            ? `No transactions extracted from PDF. Bank detected: ${parseResult.bankName}. Please verify the PDF format or try uploading as CSV.`
            : 'No transactions found in statement. Please verify the file format.',
        },
      });
      
      // Don't throw error - allow user to see the statement and try again
      return;
    }

    // Get or create bank account
    job.progress(20);
    const bankAccount = await getOrCreateBankAccount(userId, parseResult.bankName);

    // Store transactions
    job.progress(30);
    const storedTransactions = await storeTransactions(
      parseResult.transactions,
      userId,
      bankAccount.id,
      statementId
    );

    console.log(`Stored ${storedTransactions.length} transactions`);

    // Detect subscriptions
    job.progress(60);
    const subscriptions = await detectSubscriptions(storedTransactions, userId);
    console.log(`Detected ${subscriptions.length} subscriptions`);

    // Update statement status
    job.progress(90);
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        status: 'completed',
        bankName: parseResult.bankName,
        transactionCount: storedTransactions.length,
        processedAt: new Date(),
      },
    });

    job.progress(100);

    return {
      success: true,
      transactionCount: storedTransactions.length,
      subscriptionCount: subscriptions.length,
      bankName: parseResult.bankName,
    };
  } catch (error) {
    console.error('Statement processing error:', error);

    // Update statement with error
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });

    throw error;
  }
});

/**
 * Get or create bank account for user
 */
async function getOrCreateBankAccount(userId, bankName) {
  // Try to find existing account by institution name
  let account = await prisma.bankAccount.findFirst({
    where: {
      userId,
      institutionName: bankName,
    },
  });

  if (!account) {
    // Create new account with required fields
    account = await prisma.bankAccount.create({
      data: {
        userId,
        institutionName: bankName,
        accountId: `manual_${Date.now()}`, // Required field
        accountName: `${bankName} Account`,
        accountType: 'checking',
        currency: 'AED',
        isActive: true,
      },
    });
  }

  return account;
}

/**
 * Store transactions in database with deduplication
 */
async function storeTransactions(transactions, userId, bankAccountId, statementId) {
  const stored = [];

  for (const txn of transactions) {
    try {
      // Validate transaction
      const validation = validateTransaction(txn);
      if (!validation.isValid) {
        console.warn('Invalid transaction:', validation.errors);
        continue;
      }

      // Generate hash for deduplication
      const hash = generateTransactionHash(txn.date, txn.merchantName, txn.amount);

      // Check if transaction already exists
      const existing = await prisma.transaction.findUnique({
        where: { transactionHash: hash },
      });

      if (existing) {
        console.log(`Transaction already exists: ${hash}`);
        stored.push(existing);
        continue;
      }

      // Categorize transaction
      const { category, subcategory } = categorizeTransaction(
        txn.merchantName,
        txn.amount,
        txn.description
      );

      // Store transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          bankAccountId,
          statementId,
          transactionHash: hash,
          date: txn.date,
          merchantName: txn.merchantName,
          description: txn.description,
          amount: txn.amount,
          currency: 'AED',
          type: txn.type,
          category,
          subcategory,
          balance: txn.balance,
          metadata: txn.rawData,
        },
      });

      stored.push(transaction);
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  }

  return stored;
}

/**
 * Detect subscriptions from transactions using ML service
 */
async function detectSubscriptions(transactions, userId) {
  const subscriptions = [];

  // Group transactions by merchant for pattern detection
  const merchantGroups = {};
  for (const txn of transactions) {
    const key = txn.merchantName.toUpperCase();
    if (!merchantGroups[key]) {
      merchantGroups[key] = [];
    }
    merchantGroups[key].push(txn);
  }

  // Check each merchant group for subscription patterns
  for (const [merchant, txnGroup] of Object.entries(merchantGroups)) {
    // Sort by date
    const sorted = txnGroup.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Check the most recent transaction
    const latest = sorted[sorted.length - 1];
    const history = sorted.slice(0, -1);

    try {
      // Call ML service
      const response = await axios.post(`${ML_SERVICE_URL}/detect`, {
        transaction: {
          merchant_name: latest.merchantName,
          amount: parseFloat(latest.amount),
          date: latest.date.toISOString(),
        },
        history: history.map((t) => ({
          merchant_name: t.merchantName,
          amount: parseFloat(t.amount),
          date: t.date.toISOString(),
        })),
      });

      const detection = response.data;

      if (detection.is_subscription && detection.confidence >= 0.75) {
        // Check if subscription already exists
        const existing = await prisma.subscription.findFirst({
          where: {
            userId,
            merchantName: latest.merchantName,
            status: { in: ['active', 'paused'] },
          },
        });

        if (existing) {
          // Update existing subscription
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              amount: latest.amount,
              billingFrequency: detection.frequency,
              nextChargeDate: detection.next_charge_date
                ? new Date(detection.next_charge_date)
                : null,
              lastChargeDate: latest.date,
              detectionConfidence: detection.confidence,
              category: detection.category,
              subcategory: detection.subcategory,
            },
          });
          subscriptions.push(existing);
        } else {
          // Create new subscription
          const subscription = await prisma.subscription.create({
            data: {
              userId,
              merchantName: latest.merchantName,
              amount: latest.amount,
              currency: 'AED',
              billingFrequency: detection.frequency,
              nextChargeDate: detection.next_charge_date
                ? new Date(detection.next_charge_date)
                : null,
              lastChargeDate: latest.date,
              status: 'active',
              detectionConfidence: detection.confidence,
              detectionMethod: 'ml_service',
              category: detection.category,
              subcategory: detection.subcategory,
            },
          });
          subscriptions.push(subscription);
        }
      }
    } catch (error) {
      console.error(`Error detecting subscription for ${merchant}:`, error.message);
    }
  }

  return subscriptions;
}

console.log('Statement processor worker started');

export default statementProcessingQueue;

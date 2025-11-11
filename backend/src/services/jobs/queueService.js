import Bull from 'bull';
import { redis } from '../../server.js';

// Create queues
export const transactionSyncQueue = new Bull('transaction-sync', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export const subscriptionDetectionQueue = new Bull('subscription-detection', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export const statementProcessingQueue = new Bull('statement-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export const notificationQueue = new Bull('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

/**
 * Add a job to the appropriate queue
 */
export async function addJob(jobType, data, options = {}) {
  const defaultOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  switch (jobType) {
    case 'sync-transactions':
      return transactionSyncQueue.add(data, mergedOptions);
    case 'detect-subscriptions':
      return subscriptionDetectionQueue.add(data, mergedOptions);
    case 'process-statement':
      return statementProcessingQueue.add(data, mergedOptions);
    case 'send-notification':
      return notificationQueue.add(data, mergedOptions);
    default:
      throw new Error(`Unknown job type: ${jobType}`);
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId, queueName) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  return {
    id: job.id,
    data: job.data,
    progress: job.progress(),
    state: await job.getState(),
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
  };
}

function getQueue(queueName) {
  switch (queueName) {
    case 'transaction-sync':
      return transactionSyncQueue;
    case 'subscription-detection':
      return subscriptionDetectionQueue;
    case 'statement-processing':
      return statementProcessingQueue;
    case 'notifications':
      return notificationQueue;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
}

// Export queues for worker processes
export default {
  transactionSyncQueue,
  subscriptionDetectionQueue,
  statementProcessingQueue,
  notificationQueue,
  addJob,
  getJobStatus,
};

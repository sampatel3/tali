import axios from 'axios';
import crypto from 'crypto';

const NEBRAS_CONFIG = {
  apiUrl: process.env.NEBRAS_API_URL || 'https://api.nebrasfinance.com/v1',
  apiKey: process.env.NEBRAS_API_KEY,
};

const nebrasClient = axios.create({
  baseURL: NEBRAS_CONFIG.apiUrl,
  headers: {
    'Authorization': `Bearer ${NEBRAS_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Initialize account linking
 */
export async function createLinkToken(userId) {
  try {
    const response = await nebrasClient.post('/link/token/create', {
      user_id: userId,
      client_name: 'TALI',
      products: ['accounts', 'transactions'],
      country_codes: ['AE'],
      language: 'en',
      webhook: `${process.env.API_URL}/api/v1/webhooks/nebras`,
    });

    return response.data;
  } catch (error) {
    throw new Error(`Nebras link token creation failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(publicToken) {
  try {
    const response = await nebrasClient.post('/item/public_token/exchange', {
      public_token: publicToken,
    });

    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    throw new Error(`Token exchange failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get account details
 */
export async function getAccounts(accessToken) {
  try {
    const response = await nebrasClient.post('/accounts/get', {
      access_token: accessToken,
    });

    return response.data.accounts;
  } catch (error) {
    throw new Error(`Failed to fetch accounts: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get transactions
 */
export async function getTransactions(accessToken, startDate, endDate, options = {}) {
  try {
    const response = await nebrasClient.post('/transactions/get', {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: options.count || 500,
        offset: options.offset || 0,
      },
    });

    return response.data.transactions;
  } catch (error) {
    throw new Error(`Failed to fetch transactions: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get real-time balance
 */
export async function getBalance(accessToken) {
  try {
    const response = await nebrasClient.post('/accounts/balance/get', {
      access_token: accessToken,
    });

    return response.data.accounts;
  } catch (error) {
    throw new Error(`Failed to fetch balance: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Remove account connection
 */
export async function removeItem(accessToken) {
  try {
    await nebrasClient.post('/item/remove', {
      access_token: accessToken,
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to remove account: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Encrypt access token before storing
 */
export function encryptAccessToken(token) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt access token
 */
export function decryptAccessToken(encryptedToken) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

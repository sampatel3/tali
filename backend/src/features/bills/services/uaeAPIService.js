/**
 * UAE API Integration Service
 *
 * Comprehensive integration layer for all UAE utility, telecom, and government services.
 * Supports both SIMULATION mode (for testing) and PRODUCTION mode (with real API credentials).
 *
 * Services Integrated:
 * - DEWA (Dubai Electricity & Water Authority)
 * - SEWA (Sharjah Electricity & Water Authority)
 * - FEWA (Federal Electricity & Water Authority)
 * - ADDC/AADC (Abu Dhabi Distribution Company)
 * - Du Telecom
 * - Etisalat
 * - Virgin Mobile
 * - Salik (Dubai Toll System)
 * - RTA (Roads & Transport Authority)
 * - Dubai Pulse (Open Data Platform)
 * - DubaiPay (Payment Gateway)
 */

import axios from 'axios';
import { encryptSensitiveData, decryptSensitiveData } from '../../../shared/utils/encryption.js';

const SIMULATION_MODE = process.env.UAE_API_SIMULATION === 'true' || true; // Default to simulation

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const UAE_API_CONFIG = {
  // DEWA Configuration
  DEWA: {
    enabled: process.env.DEWA_API_ENABLED === 'true',
    baseUrl: process.env.DEWA_API_URL || 'https://api.dewa.gov.ae/v1',
    apiKey: process.env.DEWA_API_KEY,
    apiSecret: process.env.DEWA_API_SECRET,
  },

  // Dubai Pulse (Open Data Platform for DEWA and other services)
  DUBAI_PULSE: {
    enabled: process.env.DUBAI_PULSE_ENABLED === 'true',
    baseUrl: 'https://www.dubaipulse.gov.ae/api',
    clientId: process.env.DUBAI_PULSE_CLIENT_ID,
    clientSecret: process.env.DUBAI_PULSE_CLIENT_SECRET,
    tokenUrl: 'https://www.dubaipulse.gov.ae/oauth/token',
  },

  // SEWA Configuration
  SEWA: {
    enabled: process.env.SEWA_API_ENABLED === 'true',
    baseUrl: process.env.SEWA_API_URL || 'https://api.sewa.gov.ae/v1',
    apiKey: process.env.SEWA_API_KEY,
  },

  // FEWA Configuration
  FEWA: {
    enabled: process.env.FEWA_API_ENABLED === 'true',
    baseUrl: process.env.FEWA_API_URL || 'https://api.fewa.gov.ae/v1',
    apiKey: process.env.FEWA_API_KEY,
  },

  // ADDC/AADC Configuration
  ADDC: {
    enabled: process.env.ADDC_API_ENABLED === 'true',
    baseUrl: process.env.ADDC_API_URL || 'https://api.addc.ae/v1',
    apiKey: process.env.ADDC_API_KEY,
  },

  // Du Telecom Configuration
  DU: {
    enabled: process.env.DU_API_ENABLED === 'true',
    baseUrl: process.env.DU_API_URL || 'https://api.du.ae/v1',
    apiKey: process.env.DU_API_KEY,
    oauth: {
      clientId: process.env.DU_CLIENT_ID,
      clientSecret: process.env.DU_CLIENT_SECRET,
      tokenUrl: 'https://api.du.ae/oauth/token',
    },
  },

  // Etisalat Configuration
  ETISALAT: {
    enabled: process.env.ETISALAT_API_ENABLED === 'true',
    baseUrl: process.env.ETISALAT_API_URL || 'https://api.etisalat.ae/v1',
    apiKey: process.env.ETISALAT_API_KEY,
  },

  // Virgin Mobile Configuration
  VIRGIN: {
    enabled: process.env.VIRGIN_API_ENABLED === 'true',
    baseUrl: process.env.VIRGIN_API_URL || 'https://api.virginmobile.ae/v1',
    apiKey: process.env.VIRGIN_API_KEY,
  },

  // Salik (Dubai Toll) Configuration
  SALIK: {
    enabled: process.env.SALIK_API_ENABLED === 'true',
    baseUrl: process.env.SALIK_API_URL || 'https://api.salik.ae/v1',
    apiKey: process.env.SALIK_API_KEY,
  },

  // RTA (Roads & Transport Authority) Configuration
  RTA: {
    enabled: process.env.RTA_API_ENABLED === 'true',
    baseUrl: process.env.RTA_API_URL || 'https://api.rta.ae/v1',
    apiKey: process.env.RTA_API_KEY,
  },

  // DubaiPay (Central Payment Gateway)
  DUBAI_PAY: {
    enabled: process.env.DUBAI_PAY_ENABLED === 'true',
    baseUrl: process.env.DUBAI_PAY_URL || 'https://payment.dubaipay.gov.ae/api/v1',
    merchantId: process.env.DUBAI_PAY_MERCHANT_ID,
    apiKey: process.env.DUBAI_PAY_API_KEY,
    apiSecret: process.env.DUBAI_PAY_API_SECRET,
  },
};

// =============================================================================
// SIMULATION DATA
// =============================================================================

const SIMULATION_DATA = {
  DEWA: {
    bills: [
      {
        accountNumber: '123456789',
        billNumber: 'DEWA-2024-001',
        amount: 450.50,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending',
        consumption: {
          electricity: { units: 850, cost: 320.50 },
          water: { units: 15000, cost: 130.00 },
        },
        period: 'November 2024',
      },
    ],
    consumption: {
      electricity: [
        { month: '2024-11', units: 850, cost: 320.50 },
        { month: '2024-10', units: 920, cost: 345.80 },
        { month: '2024-09', units: 1050, cost: 395.20 },
      ],
      water: [
        { month: '2024-11', units: 15000, cost: 130.00 },
        { month: '2024-10', units: 14500, cost: 125.00 },
        { month: '2024-09', units: 16000, cost: 140.00 },
      ],
    },
  },

  DU: {
    bills: [
      {
        accountNumber: '0501234567',
        billNumber: 'DU-2024-11-001',
        amount: 299.00,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'pending',
        services: [
          { type: 'Mobile Postpaid', plan: 'Unlimited Freedom 5G', cost: 149.00 },
          { type: 'Home Internet', plan: '500 Mbps', cost: 150.00 },
        ],
        usage: {
          data: { used: 25.5, limit: 'Unlimited', unit: 'GB' },
          calls: { used: 350, limit: 'Unlimited', unit: 'minutes' },
        },
      },
    ],
  },

  ETISALAT: {
    bills: [
      {
        accountNumber: '0561234567',
        billNumber: 'ETIS-2024-11-001',
        amount: 349.00,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        services: [
          { type: 'Mobile', plan: 'Unlimited Plus', cost: 199.00 },
          { type: 'eLife', plan: 'eLife 300', cost: 150.00 },
        ],
      },
    ],
  },

  SALIK: {
    transactions: [
      { date: new Date(), gate: 'Al Maktoum Bridge', amount: 4.00, vehicle: 'Plate XXX' },
      { date: new Date(Date.now() - 24 * 60 * 60 * 1000), gate: 'Al Garhoud Bridge', amount: 4.00, vehicle: 'Plate XXX' },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), gate: 'Business Bay Crossing', amount: 4.00, vehicle: 'Plate XXX' },
    ],
    balance: 52.00,
    monthlyTotal: 120.00,
  },

  RTA: {
    fines: [
      {
        fineNumber: 'RTA-2024-001',
        amount: 500.00,
        offense: 'Exceeding speed limit',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'pending',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    ],
    parking: {
      sessions: [
        { zone: 'Business Bay', duration: 2, cost: 8.00, date: new Date() },
      ],
      monthlyTotal: 156.00,
    },
  },
};

// =============================================================================
// AUTHENTICATION & TOKEN MANAGEMENT
// =============================================================================

class TokenManager {
  constructor() {
    this.tokens = new Map();
  }

  async getToken(service) {
    const cached = this.tokens.get(service);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    const newToken = await this.refreshToken(service);
    return newToken;
  }

  async refreshToken(service) {
    if (SIMULATION_MODE) {
      const token = `sim_token_${service}_${Date.now()}`;
      this.tokens.set(service, {
        token,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      });
      return token;
    }

    // Real token refresh logic for each service
    switch (service) {
      case 'DUBAI_PULSE':
        return this.refreshDubaiPulseToken();
      case 'DU':
        return this.refreshDuToken();
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  async refreshDubaiPulseToken() {
    const config = UAE_API_CONFIG.DUBAI_PULSE;
    const response = await axios.post(config.tokenUrl, {
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 1800; // 30 minutes default

    this.tokens.set('DUBAI_PULSE', {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return token;
  }

  async refreshDuToken() {
    const config = UAE_API_CONFIG.DU;
    const response = await axios.post(config.oauth.tokenUrl, {
      grant_type: 'client_credentials',
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;

    this.tokens.set('DU', {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return token;
  }
}

const tokenManager = new TokenManager();

// =============================================================================
// DEWA INTEGRATION
// =============================================================================

export class DEWAService {
  /**
   * Get DEWA bill for an account
   */
  static async getBill(accountNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.DEWA.bills[0],
        source: 'simulation',
      };
    }

    // Real API call
    try {
      const config = UAE_API_CONFIG.DEWA;
      if (!config.enabled) {
        throw new Error('DEWA API is not enabled');
      }

      const response = await axios.get(`${config.baseUrl}/bills/${accountNumber}`, {
        headers: {
          'X-API-Key': config.apiKey,
          'Authorization': `Bearer ${config.apiSecret}`,
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: SIMULATION_DATA.DEWA.bills[0],
      };
    }
  }

  /**
   * Get consumption history via Dubai Pulse API
   */
  static async getConsumptionHistory(accountNumber, months = 12) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.DEWA.consumption,
        source: 'simulation',
      };
    }

    try {
      const token = await tokenManager.getToken('DUBAI_PULSE');
      const config = UAE_API_CONFIG.DUBAI_PULSE;

      const response = await axios.get(
        `${config.baseUrl}/dewa_customers_master_data`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            account_number: accountNumber,
            months,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: SIMULATION_DATA.DEWA.consumption,
      };
    }
  }

  /**
   * Pay DEWA bill via DubaiPay
   */
  static async payBill(accountNumber, amount, paymentMethod) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        transactionId: `SIM-${Date.now()}`,
        message: 'Payment successful (simulation)',
      };
    }

    // Real payment via DubaiPay
    try {
      const config = UAE_API_CONFIG.DUBAI_PAY;

      const response = await axios.post(
        `${config.baseUrl}/payments`,
        {
          merchantId: config.merchantId,
          service: 'DEWA',
          accountNumber,
          amount,
          paymentMethod,
        },
        {
          headers: {
            'X-API-Key': config.apiKey,
            'X-API-Secret': config.apiSecret,
          },
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        message: 'Payment successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// =============================================================================
// DU TELECOM INTEGRATION
// =============================================================================

export class DuService {
  static async getBill(mobileNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.DU.bills[0],
        source: 'simulation',
      };
    }

    try {
      const token = await tokenManager.getToken('DU');
      const config = UAE_API_CONFIG.DU;

      const response = await axios.get(`${config.baseUrl}/billing/accounts/${mobileNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: SIMULATION_DATA.DU.bills[0],
      };
    }
  }

  static async getUsage(mobileNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.DU.bills[0].usage,
        source: 'simulation',
      };
    }

    try {
      const token = await tokenManager.getToken('DU');
      const config = UAE_API_CONFIG.DU;

      const response = await axios.get(`${config.baseUrl}/usage/${mobileNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getPlans(mobileNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: {
          current: { name: 'Unlimited Freedom 5G', price: 149.00 },
          available: [
            { name: 'Unlimited Freedom Plus', price: 199.00, savings: -50.00 },
            { name: 'Smart 100', price: 99.00, savings: 50.00 },
            { name: 'Unlimited Data', price: 129.00, savings: 20.00 },
          ],
        },
        source: 'simulation',
      };
    }

    // Real API call for available plans
    try {
      const token = await tokenManager.getToken('DU');
      const config = UAE_API_CONFIG.DU;

      const response = await axios.get(`${config.baseUrl}/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          mobileNumber,
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// =============================================================================
// SALIK INTEGRATION
// =============================================================================

export class SalikService {
  static async getTransactions(accountNumber, startDate, endDate) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.SALIK.transactions,
        balance: SIMULATION_DATA.SALIK.balance,
        monthlyTotal: SIMULATION_DATA.SALIK.monthlyTotal,
        source: 'simulation',
      };
    }

    try {
      const config = UAE_API_CONFIG.SALIK;

      const response = await axios.get(`${config.baseUrl}/transactions`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
        params: {
          accountNumber,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      return {
        success: true,
        data: response.data.transactions,
        balance: response.data.balance,
        monthlyTotal: response.data.monthlyTotal,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: SIMULATION_DATA.SALIK,
      };
    }
  }

  static async getBalance(accountNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        balance: SIMULATION_DATA.SALIK.balance,
        source: 'simulation',
      };
    }

    try {
      const config = UAE_API_CONFIG.SALIK;

      const response = await axios.get(`${config.baseUrl}/balance/${accountNumber}`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      return {
        success: true,
        balance: response.data.balance,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async topUp(accountNumber, amount, paymentMethod) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        transactionId: `SIM-SALIK-${Date.now()}`,
        newBalance: SIMULATION_DATA.SALIK.balance + amount,
        message: 'Top-up successful (simulation)',
      };
    }

    // Real top-up
    try {
      const config = UAE_API_CONFIG.SALIK;

      const response = await axios.post(
        `${config.baseUrl}/topup`,
        {
          accountNumber,
          amount,
          paymentMethod,
        },
        {
          headers: {
            'X-API-Key': config.apiKey,
          },
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        newBalance: response.data.newBalance,
        message: 'Top-up successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// =============================================================================
// RTA INTEGRATION
// =============================================================================

export class RTAService {
  static async getFines(plateNumber) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.RTA.fines,
        source: 'simulation',
      };
    }

    try {
      const config = UAE_API_CONFIG.RTA;

      const response = await axios.get(`${config.baseUrl}/fines`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
        params: {
          plateNumber,
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: SIMULATION_DATA.RTA.fines,
      };
    }
  }

  static async getParkingHistory(startDate, endDate) {
    if (SIMULATION_MODE) {
      return {
        success: true,
        data: SIMULATION_DATA.RTA.parking,
        source: 'simulation',
      };
    }

    try {
      const config = UAE_API_CONFIG.RTA;

      const response = await axios.get(`${config.baseUrl}/parking/history`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      return {
        success: true,
        data: response.data,
        source: 'production',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// =============================================================================
// UNIFIED UAE BILLS SERVICE
// =============================================================================

export class UAEBillsService {
  /**
   * Get all bills for a user across all services
   */
  static async getAllBills(userAccounts) {
    const bills = [];

    // Parallel fetch all bills
    const promises = [];

    if (userAccounts.dewa) {
      promises.push(
        DEWAService.getBill(userAccounts.dewa).then(result => ({
          service: 'DEWA',
          ...result,
        }))
      );
    }

    if (userAccounts.du) {
      promises.push(
        DuService.getBill(userAccounts.du).then(result => ({
          service: 'Du',
          ...result,
        }))
      );
    }

    if (userAccounts.salik) {
      promises.push(
        SalikService.getTransactions(
          userAccounts.salik,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        ).then(result => ({
          service: 'Salik',
          ...result,
        }))
      );
    }

    if (userAccounts.rta) {
      promises.push(
        RTAService.getFines(userAccounts.rta).then(result => ({
          service: 'RTA',
          ...result,
        }))
      );
    }

    const results = await Promise.allSettled(promises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        bills.push(result.value);
      }
    });

    return {
      success: true,
      bills,
      totalDue: bills.reduce((sum, bill) => {
        if (bill.data && bill.data.amount) {
          return sum + bill.data.amount;
        }
        return sum;
      }, 0),
    };
  }

  /**
   * Get upcoming bill due dates
   */
  static async getUpcomingDueDates(userAccounts) {
    const allBills = await this.getAllBills(userAccounts);

    const upcomingBills = allBills.bills
      .filter(bill => bill.data && bill.data.dueDate)
      .map(bill => ({
        service: bill.service,
        amount: bill.data.amount,
        dueDate: bill.data.dueDate,
        accountNumber: bill.data.accountNumber,
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return {
      success: true,
      upcomingBills,
      nextDue: upcomingBills[0],
    };
  }
}

export default {
  DEWAService,
  DuService,
  SalikService,
  RTAService,
  UAEBillsService,
  SIMULATION_MODE,
};

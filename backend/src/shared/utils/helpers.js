import { parse, parseISO, isValid } from 'date-fns';
import crypto from 'crypto';

/**
 * Parse date from various formats used by UAE banks
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;

  // Clean the date string
  const cleaned = dateStr.toString().trim();

  // Try different date formats common in UAE
  const formats = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'dd/MM/yy',
    'dd-MM-yy',
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    'dd MMM yyyy',
    'dd-MMM-yyyy',
  ];

  for (const format of formats) {
    try {
      const parsed = parse(cleaned, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch (err) {
      continue;
    }
  }

  // Try ISO format
  try {
    const parsed = parseISO(cleaned);
    if (isValid(parsed)) {
      return parsed;
    }
  } catch (err) {
    // Continue
  }

  // Try native Date parsing as last resort
  try {
    const parsed = new Date(cleaned);
    if (isValid(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Unable to parse date:', dateStr);
    return null;
  }

  return null;
}

/**
 * Normalize amount to positive number
 */
export function normalizeAmount(amountStr) {
  if (typeof amountStr === 'number') return Math.abs(amountStr);

  const cleaned = amountStr.toString().replace(/[^\d.-]/g, '');
  return Math.abs(parseFloat(cleaned) || 0);
}

/**
 * Extract and normalize merchant name from transaction description
 */
export function normalizeMerchant(description) {
  if (!description) return 'Unknown';

  let merchant = description.toString().trim().toUpperCase();

  // Remove common transaction codes and patterns
  merchant = merchant.replace(/^(POS|ATM|INT|FEE|CHG|TRF|TRANSFER|PAYMENT)\s*/i, '');
  merchant = merchant.replace(/\d{4}X+\d{4}/g, ''); // Remove card numbers
  merchant = merchant.replace(/\d{2}\/\d{2}\/\d{4}/g, ''); // Remove dates
  merchant = merchant.replace(/\d{2}-\d{2}-\d{4}/g, ''); // Remove dates
  merchant = merchant.replace(/[A-Z]{3}\s*[\d,]+\.\d{2}/g, ''); // Remove amounts with currency
  merchant = merchant.replace(/REF:\s*\S+/gi, ''); // Remove reference numbers
  merchant = merchant.replace(/AUTH:\s*\S+/gi, ''); // Remove auth codes
  merchant = merchant.replace(/\s+/g, ' '); // Normalize whitespace

  // Extract merchant name from common patterns
  const patterns = [
    /(?:POS|PURCHASE)\s+(.+?)(?:\s+\d{2}\/\d{2}|$)/i,
    /^(.+?)\s+(?:DUBAI|ABU DHABI|SHARJAH|AJMAN|UAE)/i,
    /^(.+?)\s+(?:AE|UAE|UNITED ARAB)/i,
  ];

  for (const pattern of patterns) {
    const match = merchant.match(pattern);
    if (match && match[1]) {
      merchant = match[1].trim();
      break;
    }
  }

  // Remove trailing location info
  merchant = merchant.replace(/\s+(DUBAI|ABU DHABI|SHARJAH|AJMAN|UAE|AE)\s*$/i, '');
  merchant = merchant.replace(/\s+AED?\s*$/i, '');

  // Clean up
  merchant = merchant.trim();

  return merchant || 'Unknown';
}

/**
 * Categorize transaction based on merchant name
 */
export function categorizeTransaction(merchantName, amount, description) {
  const merchant = merchantName.toUpperCase();
  const desc = description.toUpperCase();

  // Utilities
  if (/DEWA|SEWA|FEWA|ADDC|AADC|ELECTRICITY|WATER/.test(merchant)) {
    return { category: 'utilities', subcategory: 'electricity_water' };
  }
  if (/DU\s|ETISALAT|VIRGIN MOBILE|TELECOM/.test(merchant)) {
    return { category: 'utilities', subcategory: 'telecom' };
  }

  // Entertainment & Streaming
  if (/NETFLIX|SPOTIFY|AMAZON PRIME|APPLE MUSIC|YOUTUBE|DISNEY|HBO|SHAHID|OSN|STARZPLAY|ANGHAMI/.test(merchant)) {
    return { category: 'entertainment', subcategory: 'streaming' };
  }

  // Food & Dining
  if (/CAREEM|TALABAT|DELIVEROO|ZOMATO|NOON FOOD|RESTAURANT|CAFE|COFFEE/.test(merchant)) {
    return { category: 'food_dining', subcategory: 'delivery' };
  }
  if (/MCDONALDS|KFC|BURGER|PIZZA|STARBUCKS|COSTA/.test(merchant)) {
    return { category: 'food_dining', subcategory: 'fast_food' };
  }

  // Transportation
  if (/UBER|CAREEM|TAXI|RTA|SALIK|TOLL|PARKING/.test(merchant)) {
    return { category: 'transportation', subcategory: 'ride_share' };
  }
  if (/ADNOC|ENOC|EPPCO|PETROL|FUEL|GAS STATION/.test(merchant)) {
    return { category: 'transportation', subcategory: 'fuel' };
  }

  // Shopping
  if (/AMAZON|NOON|NAMSHI|SHEIN|CARREFOUR|LUL|SPINNEYS|WEST ZONE|SUPERMARKET/.test(merchant)) {
    return { category: 'shopping', subcategory: 'online' };
  }
  if (/MALL|IKEA|HOME CENTRE|ACE HARDWARE/.test(merchant)) {
    return { category: 'shopping', subcategory: 'retail' };
  }

  // Fitness & Health
  if (/GYM|FITNESS|YOGA|PILATES|CROSSFIT|FITNESS FIRST|GOLD'S GYM/.test(merchant)) {
    return { category: 'fitness', subcategory: 'gym' };
  }
  if (/HOSPITAL|CLINIC|PHARMACY|DOCTOR|MEDICAL|HEALTH/.test(merchant)) {
    return { category: 'health', subcategory: 'medical' };
  }

  // BNPL Services
  if (/TABBY|POSTPAY|SPOTII|TAMARA/.test(merchant)) {
    return { category: 'financial', subcategory: 'bnpl' };
  }

  // Education
  if (/SCHOOL|UNIVERSITY|COURSE|TUITION|UDEMY|COURSERA/.test(merchant)) {
    return { category: 'education', subcategory: 'learning' };
  }

  // Insurance
  if (/INSURANCE/.test(merchant)) {
    return { category: 'insurance', subcategory: 'general' };
  }

  // Default
  return { category: 'other', subcategory: 'uncategorized' };
}

/**
 * Generate unique hash for transaction (for deduplication)
 */
export function generateTransactionHash(date, merchantName, amount) {
  const data = `${date.toISOString()}_${merchantName}_${amount}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Validate transaction data
 */
export function validateTransaction(transaction) {
  const errors = [];

  if (!transaction.date || !isValid(new Date(transaction.date))) {
    errors.push('Invalid or missing date');
  }

  if (!transaction.merchantName || transaction.merchantName === 'Unknown') {
    errors.push('Invalid or missing merchant name');
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Invalid or missing amount');
  }

  if (!['debit', 'credit'].includes(transaction.type)) {
    errors.push('Invalid transaction type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

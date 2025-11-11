import csv from 'csv-parser';
import fs from 'fs';
import pdf from 'pdf-parse';
import { parseDate, normalizeAmount, normalizeMerchant } from '../../utils/helpers.js';

/**
 * Parse bank statement and extract transactions
 * Supports multiple UAE bank formats
 */
export async function parseStatement(filepath, mimeType, bankName = 'auto') {
  if (mimeType === 'text/csv') {
    return parseCSVStatement(filepath, bankName);
  } else if (mimeType === 'application/pdf') {
    return parsePDFStatement(filepath, bankName);
  } else {
    throw new Error('Unsupported file type');
  }
}

/**
 * Parse CSV bank statements from various UAE banks
 */
async function parseCSVStatement(filepath, bankName) {
  const transactions = [];
  const bankDetected = bankName === 'auto' ? detectBankFromCSV(filepath) : bankName;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const transaction = parseRowByBank(row, bankDetected);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (err) {
          console.error('Error parsing row:', err);
        }
      })
      .on('end', () => {
        resolve({
          transactions,
          bankName: bankDetected,
          totalCount: transactions.length,
        });
      })
      .on('error', reject);
  });
}

/**
 * Detect bank from CSV headers or first few rows
 */
function detectBankFromCSV(filepath) {
  // Read first line to check headers
  const firstLine = fs.readFileSync(filepath, 'utf8').split('\n')[0];
  const headers = firstLine.toLowerCase();

  if (headers.includes('emirates nbd') || headers.includes('enbd')) {
    return 'ENBD';
  } else if (headers.includes('adcb') || headers.includes('abu dhabi commercial')) {
    return 'ADCB';
  } else if (headers.includes('mashreq')) {
    return 'MASHREQ';
  } else if (headers.includes('fab') || headers.includes('first abu dhabi')) {
    return 'FAB';
  } else if (headers.includes('cbd') || headers.includes('commercial bank of dubai')) {
    return 'CBD';
  } else if (headers.includes('dib') || headers.includes('dubai islamic')) {
    return 'DIB';
  } else if (headers.includes('adib') || headers.includes('abu dhabi islamic')) {
    return 'ADIB';
  } else if (headers.includes('rakbank') || headers.includes('rak')) {
    return 'RAKBANK';
  }

  return 'GENERIC';
}

/**
 * Parse row based on bank format
 */
function parseRowByBank(row, bank) {
  const parsers = {
    ENBD: parseENBDRow,
    ADCB: parseADCBRow,
    MASHREQ: parseMashreqRow,
    FAB: parseFABRow,
    CBD: parseCBDRow,
    DIB: parseDIBRow,
    ADIB: parseADIBRow,
    RAKBANK: parseRAKBANKRow,
    GENERIC: parseGenericRow,
  };

  const parser = parsers[bank] || parseGenericRow;
  return parser(row);
}

/**
 * Emirates NBD CSV format parser
 * Typical format: Date,Description,Debit,Credit,Balance
 */
function parseENBDRow(row) {
  const date = parseDate(row.Date || row.date || row['Transaction Date']);
  const description = row.Description || row.description || row.Particulars || '';
  const debit = parseFloat(row.Debit || row.debit || 0);
  const credit = parseFloat(row.Credit || row.credit || 0);
  const balance = parseFloat(row.Balance || row.balance || 0);

  if (!date || (!debit && !credit)) return null;

  return {
    date,
    description: description.trim(),
    merchantName: normalizeMerchant(description),
    amount: debit || credit,
    type: debit > 0 ? 'debit' : 'credit',
    balance: balance || null,
    rawData: row,
  };
}

/**
 * ADCB CSV format parser
 */
function parseADCBRow(row) {
  const date = parseDate(row['Transaction Date'] || row.Date);
  const description = row.Description || row.Narrative || '';
  const debit = parseFloat(row['Debit Amount'] || row.Debit || 0);
  const credit = parseFloat(row['Credit Amount'] || row.Credit || 0);

  if (!date || (!debit && !credit)) return null;

  return {
    date,
    description: description.trim(),
    merchantName: normalizeMerchant(description),
    amount: debit || credit,
    type: debit > 0 ? 'debit' : 'credit',
    balance: null,
    rawData: row,
  };
}

/**
 * Mashreq Bank CSV format parser
 */
function parseMashreqRow(row) {
  const date = parseDate(row.Date || row['Txn Date']);
  const description = row.Description || row['Txn Description'] || '';
  const amount = parseFloat(row.Amount || 0);
  const type = row['Dr/Cr'] || (amount < 0 ? 'debit' : 'credit');

  if (!date || !amount) return null;

  return {
    date,
    description: description.trim(),
    merchantName: normalizeMerchant(description),
    amount: Math.abs(amount),
    type: type.toLowerCase().includes('dr') || type.toLowerCase().includes('debit') ? 'debit' : 'credit',
    balance: null,
    rawData: row,
  };
}

/**
 * FAB (First Abu Dhabi Bank) CSV format parser
 */
function parseFABRow(row) {
  const date = parseDate(row['Transaction Date'] || row.Date);
  const description = row.Description || row.Particulars || '';
  const debit = parseFloat(row['Withdrawal'] || row.Debit || 0);
  const credit = parseFloat(row['Deposit'] || row.Credit || 0);

  if (!date || (!debit && !credit)) return null;

  return {
    date,
    description: description.trim(),
    merchantName: normalizeMerchant(description),
    amount: debit || credit,
    type: debit > 0 ? 'debit' : 'credit',
    balance: null,
    rawData: row,
  };
}

/**
 * Commercial Bank of Dubai CSV format parser
 */
function parseCBDRow(row) {
  return parseGenericRow(row);
}

/**
 * Dubai Islamic Bank CSV format parser
 */
function parseDIBRow(row) {
  return parseGenericRow(row);
}

/**
 * Abu Dhabi Islamic Bank CSV format parser
 */
function parseADIBRow(row) {
  return parseGenericRow(row);
}

/**
 * RAKBANK CSV format parser
 */
function parseRAKBANKRow(row) {
  return parseGenericRow(row);
}

/**
 * Generic CSV format parser (fallback)
 * Attempts to intelligently detect columns
 */
function parseGenericRow(row) {
  // Try to find date column
  const dateKeys = ['date', 'transaction date', 'txn date', 'posting date', 'value date'];
  const dateKey = Object.keys(row).find(k => dateKeys.includes(k.toLowerCase()));
  const date = dateKey ? parseDate(row[dateKey]) : null;

  // Try to find description column
  const descKeys = ['description', 'narrative', 'particulars', 'details', 'merchant'];
  const descKey = Object.keys(row).find(k => descKeys.includes(k.toLowerCase()));
  const description = descKey ? row[descKey] : '';

  // Try to find amount columns
  const debitKeys = ['debit', 'withdrawal', 'debit amount', 'dr'];
  const creditKeys = ['credit', 'deposit', 'credit amount', 'cr'];
  const debitKey = Object.keys(row).find(k => debitKeys.includes(k.toLowerCase()));
  const creditKey = Object.keys(row).find(k => creditKeys.includes(k.toLowerCase()));

  const debit = debitKey ? parseFloat(row[debitKey] || 0) : 0;
  const credit = creditKey ? parseFloat(row[creditKey] || 0) : 0;

  // If no separate debit/credit, look for amount column
  if (!debit && !credit) {
    const amountKeys = ['amount', 'transaction amount', 'txn amount'];
    const amountKey = Object.keys(row).find(k => amountKeys.includes(k.toLowerCase()));
    if (amountKey) {
      const amount = parseFloat(row[amountKey] || 0);
      if (!date || !amount) return null;

      return {
        date,
        description: description.trim(),
        merchantName: normalizeMerchant(description),
        amount: Math.abs(amount),
        type: amount < 0 ? 'debit' : 'credit',
        balance: null,
        rawData: row,
      };
    }
  }

  if (!date || (!debit && !credit)) return null;

  return {
    date,
    description: description.trim(),
    merchantName: normalizeMerchant(description),
    amount: debit || credit,
    type: debit > 0 ? 'debit' : 'credit',
    balance: null,
    rawData: row,
  };
}

/**
 * Parse PDF bank statements (basic text extraction)
 */
async function parsePDFStatement(filepath, bankName) {
  const dataBuffer = fs.readFileSync(filepath);
  const pdfData = await pdf(dataBuffer);

  const text = pdfData.text;
  const transactions = extractTransactionsFromPDFText(text, bankName);

  return {
    transactions,
    bankName: bankName === 'auto' ? 'PDF' : bankName,
    totalCount: transactions.length,
  };
}

/**
 * Extract transactions from PDF text
 * This is a basic implementation - PDF parsing is complex and varies by bank
 */
function extractTransactionsFromPDFText(text, bankName) {
  const transactions = [];
  const lines = text.split('\n');

  // Basic pattern matching for common transaction formats
  // Format: DD/MM/YYYY Description Amount
  const transactionPattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([\d,]+\.\d{2})/g;

  let match;
  while ((match = transactionPattern.exec(text)) !== null) {
    const [_, dateStr, description, amountStr] = match;

    try {
      const date = parseDate(dateStr);
      const amount = parseFloat(amountStr.replace(/,/g, ''));

      if (date && amount) {
        transactions.push({
          date,
          description: description.trim(),
          merchantName: normalizeMerchant(description),
          amount,
          type: 'debit', // Default to debit, might need smarter detection
          balance: null,
          rawData: { line: match[0] },
        });
      }
    } catch (err) {
      console.error('Error parsing PDF transaction:', err);
    }
  }

  return transactions;
}

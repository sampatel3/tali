import csv from 'csv-parser';
import fs from 'fs';
import pdf from 'pdf-parse';
import { parseDate, normalizeAmount, normalizeMerchant } from '../../../shared/utils/helpers.js';

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
 * Parse PDF bank statements (production-ready with bank-specific parsers)
 */
async function parsePDFStatement(filepath, bankName) {
  const dataBuffer = fs.readFileSync(filepath);
  const pdfData = await pdf(dataBuffer);

  const text = pdfData.text;
  const pages = pdfData.numpages;
  
  // Detect bank from PDF content if not specified
  const detectedBank = bankName === 'auto' ? detectBankFromPDF(text) : bankName;
  
  console.log(`Parsing PDF: ${pages} pages, detected bank: ${detectedBank}`);

  // Use bank-specific parser or fallback to generic
  let transactions;
  switch (detectedBank) {
    case 'ENBD':
      transactions = parseENBDPDF(text);
      break;
    case 'ADCB':
      transactions = parseADCBPDF(text);
      break;
    case 'FAB':
      transactions = parseFABPDF(text);
      break;
    case 'MASHREQ':
      transactions = parseMashreqPDF(text);
      break;
    case 'DIB':
      transactions = parseDIBPDF(text);
      break;
    case 'ADIB':
      transactions = parseADIBPDF(text);
      break;
    case 'RAKBANK':
      transactions = parseRAKBANKPDF(text);
      break;
    default:
      transactions = parseGenericPDF(text);
  }

  console.log(`Extracted ${transactions.length} transactions from PDF`);

  return {
    transactions,
    bankName: detectedBank,
    totalCount: transactions.length,
  };
}

/**
 * Detect bank from PDF text content
 */
function detectBankFromPDF(text) {
  const upperText = text.toUpperCase();
  
  if (upperText.includes('EMIRATES NBD') || upperText.includes('ENBD')) {
    return 'ENBD';
  } else if (upperText.includes('ADCB') || upperText.includes('ABU DHABI COMMERCIAL BANK')) {
    return 'ADCB';
  } else if (upperText.includes('FIRST ABU DHABI BANK') || upperText.includes('FAB')) {
    return 'FAB';
  } else if (upperText.includes('MASHREQ BANK') || upperText.includes('MASHREQ')) {
    return 'MASHREQ';
  } else if (upperText.includes('DUBAI ISLAMIC BANK') || upperText.includes('DIB')) {
    return 'DIB';
  } else if (upperText.includes('ABU DHABI ISLAMIC BANK') || upperText.includes('ADIB')) {
    return 'ADIB';
  } else if (upperText.includes('RAKBANK') || upperText.includes('NATIONAL BANK OF RAS AL KHAIMAH')) {
    return 'RAKBANK';
  }
  
  return 'GENERIC';
}

/**
 * Parse Emirates NBD PDF statements
 * Format: Date | Description | Debit | Credit | Balance
 */
function parseENBDPDF(text) {
  const transactions = [];
  const lines = text.split('\n');
  
  // ENBD typically has table format with headers
  // Look for transaction rows (date, description, amounts)
  // Pattern: DD/MM/YYYY or DD-MM-YYYY followed by description and amounts
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip headers and empty lines
    if (!line || 
        line.includes('Date') && line.includes('Description') ||
        line.includes('Opening Balance') ||
        line.includes('Closing Balance') ||
        line.match(/^[A-Z\s]+$/)) {
      continue;
    }
    
    // Match date patterns: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{1,2}\s+[A-Z]{3}\s+\d{4})/);
    if (!dateMatch) continue;
    
    // Extract date
    const dateStr = dateMatch[0];
    const date = parseDate(dateStr);
    if (!date) continue;
    
    // Extract amounts (look for currency patterns: 1,234.56 or 1234.56)
    const amountMatches = line.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches || amountMatches.length === 0) continue;
    
    // Find description (between date and first amount)
    const dateIndex = line.indexOf(dateStr);
    const firstAmountIndex = line.indexOf(amountMatches[0]);
    const description = line.substring(dateIndex + dateStr.length, firstAmountIndex).trim();
    
    if (!description || description.length < 3) continue;
    
    // Determine debit/credit and amount
    // ENBD format: Date | Description | Debit | Credit | Balance
    // If multiple amounts, typically: Debit, Credit, Balance
    let amount = 0;
    let type = 'debit';
    let balance = null;
    
    if (amountMatches.length >= 2) {
      // Usually: Debit, Credit, Balance
      const debit = parseFloat(amountMatches[0].replace(/,/g, ''));
      const credit = parseFloat(amountMatches[1].replace(/,/g, ''));
      
      if (debit > 0) {
        amount = debit;
        type = 'debit';
      } else if (credit > 0) {
        amount = credit;
        type = 'credit';
      }
      
      if (amountMatches.length >= 3) {
        balance = parseFloat(amountMatches[2].replace(/,/g, ''));
      }
    } else {
      // Single amount - check if negative (debit) or positive (credit)
      amount = parseFloat(amountMatches[0].replace(/,/g, ''));
      type = amount < 0 ? 'debit' : 'credit';
      amount = Math.abs(amount);
    }
    
    if (amount > 0 && description.length >= 3) {
      transactions.push({
        date,
        description: description.replace(/\s+/g, ' ').trim(),
        merchantName: normalizeMerchant(description),
        amount,
        type,
        balance,
        rawData: { line, bank: 'ENBD' },
      });
    }
  }
  
  return transactions;
}

/**
 * Parse ADCB PDF statements
 */
function parseADCBPDF(text) {
  const transactions = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip headers
    if (!line || 
        line.includes('Transaction Date') ||
        line.includes('Value Date') ||
        line.includes('Opening') ||
        line.includes('Closing')) {
      continue;
    }
    
    // ADCB format: Date | Description | Debit Amount | Credit Amount
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (!dateMatch) continue;
    
    const dateStr = dateMatch[0];
    const date = parseDate(dateStr);
    if (!date) continue;
    
    const amountMatches = line.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches || amountMatches.length === 0) continue;
    
    const dateIndex = line.indexOf(dateStr);
    const firstAmountIndex = line.indexOf(amountMatches[0]);
    const description = line.substring(dateIndex + dateStr.length, firstAmountIndex).trim();
    
    if (!description || description.length < 3) continue;
    
    let amount = 0;
    let type = 'debit';
    
    if (amountMatches.length >= 2) {
      const debit = parseFloat(amountMatches[0].replace(/,/g, ''));
      const credit = parseFloat(amountMatches[1].replace(/,/g, ''));
      
      if (debit > 0) {
        amount = debit;
        type = 'debit';
      } else if (credit > 0) {
        amount = credit;
        type = 'credit';
      }
    } else {
      amount = parseFloat(amountMatches[0].replace(/,/g, ''));
      type = amount < 0 ? 'debit' : 'credit';
      amount = Math.abs(amount);
    }
    
    if (amount > 0) {
      transactions.push({
        date,
        description: description.replace(/\s+/g, ' ').trim(),
        merchantName: normalizeMerchant(description),
        amount,
        type,
        balance: null,
        rawData: { line, bank: 'ADCB' },
      });
    }
  }
  
  return transactions;
}

/**
 * Parse FAB (First Abu Dhabi Bank) PDF statements
 */
function parseFABPDF(text) {
  const transactions = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || 
        line.includes('Transaction Date') ||
        line.includes('Posting Date') ||
        line.includes('Opening') ||
        line.includes('Closing')) {
      continue;
    }
    
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (!dateMatch) continue;
    
    const date = parseDate(dateMatch[0]);
    if (!date) continue;
    
    const amountMatches = line.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches) continue;
    
    const dateIndex = line.indexOf(dateMatch[0]);
    const firstAmountIndex = line.indexOf(amountMatches[0]);
    const description = line.substring(dateIndex + dateMatch[0].length, firstAmountIndex).trim();
    
    if (!description || description.length < 3) continue;
    
    // FAB format: Date | Description | Withdrawal | Deposit
    let amount = 0;
    let type = 'debit';
    
    if (amountMatches.length >= 2) {
      const withdrawal = parseFloat(amountMatches[0].replace(/,/g, ''));
      const deposit = parseFloat(amountMatches[1].replace(/,/g, ''));
      
      if (withdrawal > 0) {
        amount = withdrawal;
        type = 'debit';
      } else if (deposit > 0) {
        amount = deposit;
        type = 'credit';
      }
    } else {
      amount = Math.abs(parseFloat(amountMatches[0].replace(/,/g, '')));
    }
    
    if (amount > 0) {
      transactions.push({
        date,
        description: description.replace(/\s+/g, ' ').trim(),
        merchantName: normalizeMerchant(description),
        amount,
        type,
        balance: null,
        rawData: { line, bank: 'FAB' },
      });
    }
  }
  
  return transactions;
}

/**
 * Parse Mashreq Bank PDF statements
 */
function parseMashreqPDF(text) {
  const transactions = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.includes('Txn Date') || line.includes('Opening') || line.includes('Closing')) {
      continue;
    }
    
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (!dateMatch) continue;
    
    const date = parseDate(dateMatch[0]);
    if (!date) continue;
    
    const amountMatches = line.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches) continue;
    
    const dateIndex = line.indexOf(dateMatch[0]);
    const firstAmountIndex = line.indexOf(amountMatches[0]);
    const description = line.substring(dateIndex + dateMatch[0].length, firstAmountIndex).trim();
    
    if (!description || description.length < 3) continue;
    
    const amount = Math.abs(parseFloat(amountMatches[0].replace(/,/g, '')));
    const type = line.toLowerCase().includes('dr') || line.toLowerCase().includes('debit') ? 'debit' : 'credit';
    
    if (amount > 0) {
      transactions.push({
        date,
        description: description.replace(/\s+/g, ' ').trim(),
        merchantName: normalizeMerchant(description),
        amount,
        type,
        balance: null,
        rawData: { line, bank: 'MASHREQ' },
      });
    }
  }
  
  return transactions;
}

/**
 * Parse Dubai Islamic Bank (DIB) PDF statements
 */
function parseDIBPDF(text) {
  return parseGenericPDF(text, 'DIB');
}

/**
 * Parse Abu Dhabi Islamic Bank (ADIB) PDF statements
 */
function parseADIBPDF(text) {
  return parseGenericPDF(text, 'ADIB');
}

/**
 * Parse RAKBANK PDF statements
 */
function parseRAKBANKPDF(text) {
  return parseGenericPDF(text, 'RAKBANK');
}

/**
 * Generic PDF parser (fallback for unknown formats)
 * Uses multiple pattern matching strategies
 */
function parseGenericPDF(text, bankName = 'GENERIC') {
  const transactions = [];
  const lines = text.split('\n');

  // Multiple patterns to try
  const patterns = [
    // Pattern 1: DD/MM/YYYY Description Amount
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})/g,
    // Pattern 2: DD-MM-YYYY Description Amount
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})/g,
    // Pattern 3: Date at start, amount at end
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})$/,
  ];
  
  for (const pattern of patterns) {
  let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
    const [_, dateStr, description, amountStr] = match;

      const date = parseDate(dateStr);
      const amount = parseFloat(amountStr.replace(/,/g, ''));

        if (date && amount && amount > 0 && description && description.trim().length >= 3) {
          // Check if transaction already exists (avoid duplicates)
          const exists = transactions.some(t => 
            t.date.getTime() === date.getTime() &&
            Math.abs(t.amount - amount) < 0.01 &&
            t.description === description.trim()
          );
          
          if (!exists) {
            transactions.push({
              date,
              description: description.trim().replace(/\s+/g, ' '),
              merchantName: normalizeMerchant(description),
              amount: Math.abs(amount),
              type: amount < 0 ? 'debit' : 'credit',
              balance: null,
              rawData: { line: match[0], bank: bankName },
            });
          }
        }
      } catch (err) {
        // Continue to next match
        continue;
      }
    }
  }
  
  // Also try line-by-line parsing for table formats
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip headers and empty lines
    if (!line || 
        line.length < 10 ||
        line.match(/^(Date|Description|Amount|Debit|Credit|Balance)/i) ||
        line.match(/^[A-Z\s]+$/) && !line.match(/\d/)) {
      continue;
    }
    
    // Look for date followed by description and amount
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (!dateMatch) continue;
    
    const date = parseDate(dateMatch[0]);
    if (!date) continue;
    
    const amountMatches = line.match(/[\d,]+\.\d{2}/g);
    if (!amountMatches || amountMatches.length === 0) continue;
    
    const dateIndex = line.indexOf(dateMatch[0]);
    const firstAmountIndex = line.indexOf(amountMatches[0]);
    const description = line.substring(dateIndex + dateMatch[0].length, firstAmountIndex).trim();
    
    if (description.length < 3) continue;
    
    const amount = Math.abs(parseFloat(amountMatches[0].replace(/,/g, '')));
    
    if (amount > 0) {
      const exists = transactions.some(t => 
        t.date.getTime() === date.getTime() &&
        Math.abs(t.amount - amount) < 0.01 &&
        t.description === description
      );
      
      if (!exists) {
        transactions.push({
          date,
          description: description.replace(/\s+/g, ' '),
          merchantName: normalizeMerchant(description),
          amount,
          type: line.toLowerCase().includes('cr') || line.toLowerCase().includes('credit') ? 'credit' : 'debit',
          balance: null,
          rawData: { line, bank: bankName },
        });
      }
    }
  }
  
  // Sort by date (oldest first)
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return transactions;
}

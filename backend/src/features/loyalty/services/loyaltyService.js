import axios from 'axios';
import { prisma } from '../../../server.js';

/**
 * Detect loyalty programs from transactions
 */
export async function detectLoyaltyFromTransactions(userId) {
  // Get recent transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    orderBy: { transactionDate: 'desc' }
  });

  // Loyalty merchant mappings (UAE/GCC specific)
  const loyaltyMerchants = {
    'CARREFOUR': 'SHARE',
    'CITY CENTRE': 'SHARE',
    'VOX CINEMAS': 'SHARE',
    'MAGIC PLANET': 'SHARE',
    'MALL OF EMIRATES': 'SHARE',
    'LULU': 'Shukran',
    'ETISALAT': 'Smiles',
    'DU': 'Smiles',
    'ENOC': 'ENOC LINK',
    'EPPCO': 'ENOC LINK',
    'ADNOC': 'ADNOC Rewards',
    'EMARAT': 'EMARAT Rewards',
    'VIRGIN MEGASTORE': 'SHARE',
    'SHARAF DG': 'Shukran',
    'NOON': 'noon credits',
    'EMIRATES': 'Skywards',
    'ETIHAD': 'Guest',
  };

  // Count spending at each merchant
  const merchantSpending = {};

  for (const txn of transactions) {
    const merchantUpper = txn.merchantName?.toUpperCase() || '';

    for (const [merchant, program] of Object.entries(loyaltyMerchants)) {
      if (merchantUpper.includes(merchant)) {
        if (!merchantSpending[program]) {
          merchantSpending[program] = {
            transactionCount: 0,
            totalSpend: 0,
            program: program
          };
        }
        merchantSpending[program].transactionCount++;
        merchantSpending[program].totalSpend += Math.abs(parseFloat(txn.amount));
      }
    }
  }

  // Generate suggestions for programs with 3+ transactions or 300+ AED spend
  const suggestions = [];

  for (const [programName, stats] of Object.entries(merchantSpending)) {
    if (stats.transactionCount >= 3 || stats.totalSpend >= 300) {
      // Check if user already has this program
      const program = await prisma.loyaltyProgram.findFirst({
        where: { name: programName }
      });

      if (program) {
        const existing = await prisma.userLoyaltyCard.findFirst({
          where: {
            userId,
            loyaltyProgramId: program.id
          }
        });

        if (!existing) {
          suggestions.push({
            program,
            stats,
            reason: `You spent AED ${stats.totalSpend.toFixed(0)} at ${programName} partners in the last 3 months`
          });
        }
      }
    }
  }

  return suggestions;
}

/**
 * Calculate potential points user could have earned
 */
export async function calculatePotentialPoints(userId, programId) {
  const program = await prisma.loyaltyProgram.findUnique({
    where: { id: programId }
  });

  if (!program || !program.pointsToCurrencyRatio) {
    return 0;
  }

  // Get transactions that would have earned points
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    }
  });

  let totalPotentialPoints = 0;

  // Simple assumption: 1 point per AED spent (can be refined per program)
  for (const txn of transactions) {
    totalPotentialPoints += Math.abs(parseFloat(txn.amount));
  }

  return totalPotentialPoints * parseFloat(program.pointsToCurrencyRatio);
}

/**
 * Seed initial loyalty programs for UAE/GCC
 */
export async function seedLoyaltyPrograms() {
  const programs = [
    {
      name: 'SHARE',
      nameArabic: 'شير',
      provider: 'Majid Al Futtaim',
      type: 'points',
      category: 'retail',
      countries: ['UAE', 'Egypt', 'Saudi Arabia', 'Kuwait', 'Bahrain'],
      pointsCurrency: 'SHARE Points',
      pointsToCurrencyRatio: 0.01,
      description: 'Earn and redeem points at MAF properties including Carrefour, VOX Cinemas, and more',
      websiteUrl: 'https://www.sharemaf.com',
      isActive: true,
      popularityScore: 100
    },
    {
      name: 'Shukran',
      nameArabic: 'شكراً',
      provider: 'Lulu Group',
      type: 'points',
      category: 'retail',
      countries: ['UAE', 'Saudi Arabia', 'Kuwait', 'Oman', 'Qatar'],
      pointsCurrency: 'Shukran Points',
      pointsToCurrencyRatio: 0.01,
      description: 'Loyalty program for LuLu Hypermarket shoppers',
      websiteUrl: 'https://www.luluhypermarket.com/shukran',
      isActive: true,
      popularityScore: 95
    },
    {
      name: 'Smiles',
      nameArabic: 'سمايلز',
      provider: 'Etisalat by e&',
      type: 'points',
      category: 'telecom',
      countries: ['UAE'],
      pointsCurrency: 'Smiles',
      pointsToCurrencyRatio: 0.01,
      description: 'Earn Smiles on telecom bills and use across partners',
      websiteUrl: 'https://www.smiles.ae',
      isActive: true,
      popularityScore: 90
    },
    {
      name: 'ENOC LINK',
      provider: 'ENOC',
      type: 'points',
      category: 'fuel',
      countries: ['UAE'],
      pointsCurrency: 'LINK Points',
      description: 'Fuel loyalty program for ENOC and EPPCO stations',
      websiteUrl: 'https://www.enoclink.com',
      isActive: true,
      popularityScore: 85
    },
    {
      name: 'ADNOC Rewards',
      provider: 'ADNOC',
      type: 'points',
      category: 'fuel',
      countries: ['UAE'],
      pointsCurrency: 'ADNOC Points',
      description: 'Loyalty program for ADNOC fuel and services',
      websiteUrl: 'https://www.adnoc.ae/rewards',
      isActive: true,
      popularityScore: 85
    },
    {
      name: 'Skywards',
      nameArabic: 'سكاي واردز',
      provider: 'Emirates',
      type: 'points',
      category: 'travel',
      countries: ['UAE'],
      pointsCurrency: 'Skywards Miles',
      description: 'Emirates frequent flyer program',
      websiteUrl: 'https://www.emirates.com/skywards',
      isActive: true,
      popularityScore: 100
    },
    {
      name: 'Etihad Guest',
      provider: 'Etihad Airways',
      type: 'points',
      category: 'travel',
      countries: ['UAE'],
      pointsCurrency: 'Etihad Guest Miles',
      description: 'Etihad Airways loyalty program',
      websiteUrl: 'https://www.etihadguest.com',
      isActive: true,
      popularityScore: 95
    }
  ];

  const created = [];
  for (const programData of programs) {
    const existing = await prisma.loyaltyProgram.findFirst({
      where: { name: programData.name }
    });

    if (!existing) {
      const program = await prisma.loyaltyProgram.create({
        data: {
          ...programData,
          countries: programData.countries || null
        }
      });
      created.push(program);
    }
  }

  return created;
}

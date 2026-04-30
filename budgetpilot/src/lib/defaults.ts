import type { BpCategory, AllocationGroup } from '../types'

export const ONBOARDING_CATEGORIES: Omit<BpCategory, 'id'>[] = [
  // Needs
  { name: 'Housing',        group: 'needs' },
  { name: 'Groceries',      group: 'needs' },
  { name: 'Utilities',      group: 'needs' },
  { name: 'Transport',      group: 'needs' },
  { name: 'Health',         group: 'needs' },
  // Wants
  { name: 'Dining Out',     group: 'wants' },
  { name: 'Entertainment',  group: 'wants' },
  { name: 'Shopping',       group: 'wants' },
  { name: 'Personal Care',  group: 'wants' },
  // Savings
  { name: 'Emergency Fund', group: 'savings' },
  { name: 'Investments',    group: 'savings' },
  { name: 'Vacation Fund',  group: 'savings' },
]

export const CSV_CATEGORY_SEED: Record<string, string | null> = {
  starbucks: null, stbks: null, 'dunkin': null,
  'peets coffee': null, 'dutch bros': null,
  'whole foods': null, wholefds: null, 'trader joes': null,
  kroger: null, safeway: null, 'walmart grocery': null,
  'target grocery': null, costco: null, aldi: null, publix: null,
  doordash: null, 'uber eats': null, grubhub: null,
  instacart: null, chipotle: null, mcdonalds: null, 'chick-fil-a': null,
  uber: null, lyft: null, metro: null, transit: null,
  shell: null, chevron: null, exxon: null, 'circle k': null,
  amazon: null, amzn: null, ebay: null, etsy: null,
  netflix: null, spotify: null, 'apple com bill': null,
  'google storage': null, hulu: null, disney: null, 'youtube premium': null,
  cvs: null, walgreens: null, 'rite aid': null,
  'at&t': null, verizon: null, 't-mobile': null,
  comcast: null, xfinity: null,
  zelle: null, venmo: null, paypal: null,
}

export const SEED_INTENT_MAP: Record<string, string> = {
  starbucks: 'Dining Out', stbks: 'Dining Out', dunkin: 'Dining Out',
  'peets coffee': 'Dining Out', 'dutch bros': 'Dining Out',
  'whole foods': 'Groceries', wholefds: 'Groceries', 'trader joes': 'Groceries',
  kroger: 'Groceries', safeway: 'Groceries', 'walmart grocery': 'Groceries',
  'target grocery': 'Groceries', costco: 'Groceries', aldi: 'Groceries', publix: 'Groceries',
  doordash: 'Dining Out', 'uber eats': 'Dining Out', grubhub: 'Dining Out',
  instacart: 'Groceries', chipotle: 'Dining Out', mcdonalds: 'Dining Out', 'chick-fil-a': 'Dining Out',
  uber: 'Transport', lyft: 'Transport', metro: 'Transport', transit: 'Transport',
  shell: 'Transport', chevron: 'Transport', exxon: 'Transport', 'circle k': 'Transport',
  amazon: 'Shopping', amzn: 'Shopping', ebay: 'Shopping', etsy: 'Shopping',
  netflix: 'Entertainment', spotify: 'Entertainment', 'apple com bill': 'Entertainment',
  'google storage': 'Entertainment', hulu: 'Entertainment', disney: 'Entertainment',
  'youtube premium': 'Entertainment',
  cvs: 'Health', walgreens: 'Health', 'rite aid': 'Health',
  'at&t': 'Utilities', verizon: 'Utilities', 't-mobile': 'Utilities',
  comcast: 'Utilities', xfinity: 'Utilities',
}

// Suppress unused import warning — AllocationGroup is used by callers who import from this file
export type { AllocationGroup }

export interface BankMapping {
  date: string
  amount: string
  description: string
  creditColumn?: string
  // true = positive amounts are expenses (AMEX convention); false/absent = negative amounts are expenses (Chase, etc.)
  signInverted?: boolean
}

export interface BankFingerprint {
  bank: string
  headers: string[]          // normalized (lowercase) header names
  mapping: BankMapping
  strict?: boolean           // if true: CSV must have exactly these headers, no more
}

export const BANK_FINGERPRINTS: BankFingerprint[] = [
  {
    bank: 'Chase',
    headers: ['transaction date', 'post date', 'description', 'category', 'type', 'amount', 'memo'],
    mapping: { date: 'transaction date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Bank of America',
    headers: ['posted date', 'reference number', 'payee', 'address', 'amount'],
    mapping: { date: 'posted date', amount: 'amount', description: 'payee' },
  },
  {
    bank: 'Wells Fargo',
    headers: ['date', 'amount', 'asterisk', 'check number', 'description'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Citi',
    headers: ['date', 'description', 'debit', 'credit'],
    mapping: { date: 'date', amount: 'debit', description: 'description', creditColumn: 'credit' },
  },
  {
    bank: 'Capital One',
    headers: ['transaction date', 'posted date', 'card no.', 'description', 'category', 'debit', 'credit'],
    mapping: { date: 'transaction date', amount: 'debit', description: 'description', creditColumn: 'credit' },
  },
  // 3-column format (strict — must be exactly these 3 columns)
  {
    bank: 'American Express',
    headers: ['date', 'description', 'amount'],
    mapping: { date: 'date', amount: 'amount', description: 'description', signInverted: true },
    strict: true,
  },
  // 5-column format (older export with Card Member + Account #)
  {
    bank: 'American Express',
    headers: ['date', 'description', 'card member', 'account #', 'amount'],
    mapping: { date: 'date', amount: 'amount', description: 'description', signInverted: true },
  },
  {
    bank: 'Discover',
    headers: ['trans. date', 'post date', 'description', 'amount', 'category'],
    mapping: { date: 'trans. date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'USAA',
    headers: ['date', 'description', 'original description', 'category', 'amount', 'status'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
]

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
}

export function detectBank(rawHeaders: string[]): BankFingerprint | null {
  const normalized = rawHeaders.map(normalizeHeader)
  let bestMatch: BankFingerprint | null = null
  let bestCount = 0

  for (const fp of BANK_FINGERPRINTS) {
    const allPresent = fp.headers.every(h => normalized.includes(h))
    if (!allPresent) continue
    if (fp.strict && normalized.length !== fp.headers.length) continue
    if (fp.headers.length > bestCount) {
      bestMatch = fp
      bestCount = fp.headers.length
    }
  }
  return bestMatch
}

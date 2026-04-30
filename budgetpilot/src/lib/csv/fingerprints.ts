export interface BankMapping {
  date: string
  amount: string
  description: string
  creditColumn?: string
}

export interface BankFingerprint {
  bank: string
  headers: string[]
  mapping: BankMapping
}

export const BANK_FINGERPRINTS: BankFingerprint[] = [
  {
    bank: 'Chase',
    headers: ['transaction date', 'post date', 'description', 'category', 'type', 'amount', 'memo'],
    mapping: { date: 'transaction date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Bank of America',
    headers: ['date', 'description', 'amount', 'running bal.'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
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
  {
    bank: 'American Express',
    headers: ['date', 'description', 'amount'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
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
  for (const fp of BANK_FINGERPRINTS) {
    const allMatch = fp.headers.every(h => normalized.includes(h))
    if (allMatch) return fp
  }
  return null
}

export type TransactionType = 'expense' | 'income'
export type AllocationGroup = 'needs' | 'wants' | 'savings'
export type ImportSource = 'manual' | 'csv'
export type ViewName =
  | 'dashboard'
  | 'transactions'
  | 'import'
  | 'budget'
  | 'debts'
  | 'settings'
  | 'export-import'
  | 'import-rules'

export interface BpProfile {
  id?: number
  name: string
  currency: string
  createdAt: string
}

export interface BpCategory {
  id: string
  name: string
  group: AllocationGroup
}

export interface BpBudget {
  id?: number
  month: string
  monthlyIncome: number
  allocation: {
    needs: number
    wants: number
    savings: number
  }
  categoryLimits: {
    categoryId: string
    limit: number
  }[]
  categories?: BpCategory[]
}

export interface BpTransaction {
  id: string
  date: string
  amount: number
  type: TransactionType
  categoryId: string | null
  note: string
  importSource: ImportSource
}

export interface BpDebt {
  id: string
  name: string
  balance: number
  apr: number
  minPayment: number
}

export interface BpSetting {
  key: string
  value: unknown
}

export interface BpTheme {
  id: string
  name: string
  description: string
  version: string
  tokens: Record<string, string>
  icons?: Record<string, string>   // slot name → raw SVG string (sanitized on validate)
}

export interface BpCsvCategoryMap {
  normalizedDescription: string  // primary key
  categoryId: string
  createdAt?: number             // ms timestamp — undefined for pre-existing entries
}

export interface MappedTransaction {
  row: Record<string, string>
  date: string
  amount: number
  type: 'expense' | 'income'
  note: string
  categoryId: string | null
}

// Derived / computed types used by hooks
export interface MonthlyTotals {
  totalIncome: number
  totalExpenses: number
  remaining: number
  savingsRate: number
}

export interface CategorySpend {
  spent: number
  limit: number
  pct: number
}

export interface DailySpendMap {
  [date: string]: number
}

export interface PayoffEntry {
  debtId: string
  debtName: string
  monthsToPayoff: number
  totalInterest: number
  payoffDate: string
}

export interface InterestComparison {
  totalInterestMethod: number
  totalInterestMinOnly: number
  saved: number
}

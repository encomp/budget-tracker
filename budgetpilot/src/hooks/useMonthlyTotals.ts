import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { MonthlyTotals } from '../types'

export function useMonthlyTotals(month: string): MonthlyTotals {
  return useLiveQuery(async () => {
    const txns = await db.transactions
      .where('date').startsWith(month)
      .toArray()

    const totalIncome = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const remaining = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0

    return { totalIncome, totalExpenses, remaining, savingsRate }
  }, [month], { totalIncome: 0, totalExpenses: 0, remaining: 0, savingsRate: 0 })!
}

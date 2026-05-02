import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { CategorySpend } from '../types'

export function useCategorySpend(month: string, categoryId: string): CategorySpend | undefined {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    const limit = budget?.categoryLimits.find(cl => cl.categoryId === categoryId)?.limit ?? 0

    const txns = await db.transactions
      .where('date').startsWith(month)
      .filter(t => t.categoryId === categoryId && t.type === 'expense')
      .toArray()

    const spent = txns.reduce((sum, t) => sum + t.amount, 0)
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0

    return { spent, limit, pct }
  }, [month, categoryId])
}

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

export interface CategorySpendEntry {
  categoryId: string
  spent: number
  limit: number
}

export function useAllCategorySpend(month: string): CategorySpendEntry[] {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    if (!budget?.categories?.length) return []

    const txns = await db.transactions
      .where('date').startsWith(month)
      .filter(t => t.type === 'expense')
      .toArray()

    return budget.categories.map(cat => {
      const limit = budget.categoryLimits.find(cl => cl.categoryId === cat.id)?.limit ?? 0
      const spent = txns.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0)
      return { categoryId: cat.id, spent, limit }
    })
  }, [month], []) ?? []
}

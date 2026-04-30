import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { BpCategory } from '../types'

export function useMonthCategories(month: string): BpCategory[] {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    if (!budget) return []
    return budget.categories ?? []
  }, [month], [])!
}

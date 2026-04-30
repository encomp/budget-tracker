import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { BpBudget } from '../types'
import { ONBOARDING_CATEGORIES } from '../lib/defaults'

export function useActiveBudget(month: string): BpBudget | null {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    if (budget) return budget

    return {
      month,
      monthlyIncome: 0,
      allocation: { needs: 50, wants: 30, savings: 20 },
      categoryLimits: ONBOARDING_CATEGORIES.map(() => ({
        categoryId: crypto.randomUUID(),
        limit: 0,
      })),
      categories: [],
    } as BpBudget
  }, [month], null)!
}

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { DailySpendMap } from '../types'

export function useDailySpend(month: string): DailySpendMap {
  return useLiveQuery(async () => {
    const txns = await db.transactions
      .where('date').startsWith(month)
      .filter(t => t.type === 'expense')
      .toArray()

    return txns.reduce<DailySpendMap>((map, t) => {
      map[t.date] = (map[t.date] ?? 0) + t.amount
      return map
    }, {})
  }, [month], {})!
}

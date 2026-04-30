import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { BpTransaction } from '../types'

export function useRecentTransactions(month: string, limit = 8): BpTransaction[] {
  return useLiveQuery(async () => {
    return db.transactions
      .where('date').startsWith(month)
      .reverse()
      .sortBy('date')
      .then(txns => txns.slice(0, limit))
  }, [month, limit], [])!
}

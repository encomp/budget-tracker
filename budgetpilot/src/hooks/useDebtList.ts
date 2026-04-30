import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { BpDebt } from '../types'

export function useDebtList(): BpDebt[] {
  return useLiveQuery(() => db.debts.toArray(), [], [])!
}

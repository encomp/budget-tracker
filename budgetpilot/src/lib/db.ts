import Dexie, { type EntityTable } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import 'dexie-export-import'
import type {
  BpProfile,
  BpBudget,
  BpTransaction,
  BpDebt,
  BpSetting,
  BpCsvCategoryMap,
} from '../types'

export class BudgetPilotDB extends Dexie {
  profile!: EntityTable<BpProfile, 'id'>
  budgets!: EntityTable<BpBudget, 'id'>
  transactions!: EntityTable<BpTransaction, 'id'>
  debts!: EntityTable<BpDebt, 'id'>
  settings!: EntityTable<BpSetting, 'key'>
  csvCategoryMap!: EntityTable<BpCsvCategoryMap, 'normalizedDescription'>

  constructor() {
    super('BudgetPilotDB')
    this.version(1).stores({
      profile: '++id',
      budgets: '++id, month',
      transactions: 'id, date, categoryId, importSource',
      debts: 'id',
      settings: 'key',
      csvCategoryMap: 'normalizedDescription',
    })
    this.version(2)
      .stores({
        profile:        '++id',
        budgets:        '++id, month',
        transactions:   'id, date, categoryId, importSource',
        debts:          'id',
        settings:       'key',
        csvCategoryMap: 'normalizedDescription, createdAt',
      })
      .upgrade(tx =>
        tx.table('csvCategoryMap').toCollection().modify((entry: BpCsvCategoryMap) => {
          if (!entry.createdAt) entry.createdAt = Date.now()
        })
      )
  }
}

export const db = new BudgetPilotDB()

export function useLiveRules() {
  return useLiveQuery(
    () => db.csvCategoryMap.orderBy('createdAt').reverse().toArray(),
    []
  )
}

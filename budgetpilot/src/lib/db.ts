import Dexie, { type EntityTable } from 'dexie'
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
  }
}

export const db = new BudgetPilotDB()

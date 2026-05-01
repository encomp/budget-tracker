import { describe, it, expect } from 'vitest'
import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { detectBank } from '../fingerprints'
import { heuristicMap } from '../heuristics'
import { buildPreviewRows } from '../categorize'
import type { HeuristicMapping } from '../heuristics'

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8')
}

function parseCSV(csv: string): { headers: string[]; rows: Record<string, string>[] } {
  const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true })
  return { headers: result.meta.fields ?? [], rows: result.data }
}

describe('buildPreview per-bank end-to-end', () => {
  it('AMEX 3-col: detected, first row is expense', () => {
    const { headers, rows } = parseCSV(loadFixture('amex.csv'))
    const bank = detectBank(headers)
    expect(bank?.bank).toBe('American Express')
    const m: HeuristicMapping = { date: bank!.mapping.date, amount: bank!.mapping.amount, description: bank!.mapping.description }
    const items = buildPreviewRows(rows, m, bank!.mapping.signInverted ?? false, {}, {})
    expect(items[0].date).toBe('2024-01-15')
    expect(items[0].note).toContain('ANTHROPIC')
    expect(items[0].amount).toBe(24)
    expect(items[0].type).toBe('expense')
  })

  it('AMEX 3-col: online payment row is income', () => {
    const { headers, rows } = parseCSV(loadFixture('amex.csv'))
    const bank = detectBank(headers)!
    const m: HeuristicMapping = { date: bank.mapping.date, amount: bank.mapping.amount, description: bank.mapping.description }
    const items = buildPreviewRows(rows, m, bank.mapping.signInverted ?? false, {}, {})
    const payment = items.find(r => r.note.includes('ONLINE PAYMENT'))
    expect(payment?.type).toBe('income')
  })

  it('AMEX 5-col: detected, first row is expense', () => {
    const { headers, rows } = parseCSV(loadFixture('amex-5col.csv'))
    const bank = detectBank(headers)
    expect(bank?.bank).toBe('American Express')
    const m: HeuristicMapping = { date: bank!.mapping.date, amount: bank!.mapping.amount, description: bank!.mapping.description }
    const items = buildPreviewRows(rows, m, bank!.mapping.signInverted ?? false, {}, {})
    expect(items[0].type).toBe('expense')
    expect(items[0].amount).toBe(24)
  })

  it('Chase: detected, expense and income correctly typed', () => {
    const { headers, rows } = parseCSV(loadFixture('chase.csv'))
    const bank = detectBank(headers)
    expect(bank?.bank).toBe('Chase')
    const m: HeuristicMapping = { date: bank!.mapping.date, amount: bank!.mapping.amount, description: bank!.mapping.description }
    const items = buildPreviewRows(rows, m, bank!.mapping.signInverted ?? false, {}, {})
    expect(items[0].date).toBe('2024-01-15')
    expect(items[0].note).toContain('WHOLEFDS')
    expect(items[0].type).toBe('expense')
    const payroll = items.find(r => r.note.includes('PAYROLL'))
    expect(payroll?.type).toBe('income')
  })

  it('BofA: detected, first row is expense', () => {
    const { headers, rows } = parseCSV(loadFixture('bofa.csv'))
    const bank = detectBank(headers)
    expect(bank?.bank).toBe('Bank of America')
    const m: HeuristicMapping = { date: bank!.mapping.date, amount: bank!.mapping.amount, description: bank!.mapping.description }
    const items = buildPreviewRows(rows, m, bank!.mapping.signInverted ?? false, {}, {})
    expect(items[0].date).toBe('2024-01-15')
    expect(items[0].note).toContain('WHOLEFDS')
    expect(items[0].type).toBe('expense')
  })

  it('Citi: detected, purchases are expense, payments are income', () => {
    const { headers, rows } = parseCSV(loadFixture('citi.csv'))
    const bank = detectBank(headers)
    expect(bank?.bank).toBe('Citi')
    const m: HeuristicMapping = {
      date: bank!.mapping.date,
      amount: bank!.mapping.amount,
      description: bank!.mapping.description,
      credit: bank!.mapping.creditColumn,
    }
    const items = buildPreviewRows(rows, m, bank!.mapping.signInverted ?? false, {}, {})
    expect(items[0].type).toBe('expense')
    const payment = items.find(r => r.note.includes('ONLINE PAYMENT'))
    expect(payment?.type).toBe('income')
  })

  it('Alliant: falls to heuristics (not AMEX), deposits show as income', () => {
    const { headers, rows } = parseCSV(loadFixture('alliant.csv'))
    const bank = detectBank(headers)
    expect(bank).toBeNull()  // Alliant not detected as AMEX (strict mode blocks it)

    const m = heuristicMap(headers, rows.slice(0, 5))
    expect(m.date).toBeTruthy()
    expect(m.amount).toBeTruthy()
    expect(m.description).toBeTruthy()

    const items = buildPreviewRows(rows, m, false, {}, {})
    const deposit = items.find(r => r.note.includes('PAYROLL'))
    expect(deposit?.type).toBe('income')
    const purchase = items.find(r => r.note.includes('WHOLEFDS'))
    expect(purchase?.type).toBe('expense')
  })
})

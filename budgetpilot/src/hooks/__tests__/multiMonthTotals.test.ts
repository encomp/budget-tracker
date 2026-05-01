import { describe, it, expect } from 'vitest'
import { buildMonthRange, computeMultiMonthTotals } from '../useMultiMonthTotals'

describe('buildMonthRange', () => {
  it("count=3, anchor='2026-04' → ['2026-02','2026-03','2026-04']", () => {
    expect(buildMonthRange(3, '2026-04')).toEqual(['2026-02', '2026-03', '2026-04'])
  })
  it('count=1 → single-element array', () => {
    expect(buildMonthRange(1, '2026-04')).toEqual(['2026-04'])
  })
  it("anchor='2026-01' → wraps to previous year correctly", () => {
    expect(buildMonthRange(3, '2026-01')).toEqual(['2025-11', '2025-12', '2026-01'])
  })
})

describe('computeMultiMonthTotals', () => {
  it('empty txns → all months return income=0, expenses=0', () => {
    const result = computeMultiMonthTotals([], ['2026-01', '2026-02'])
    expect(result).toEqual([
      { month: '2026-01', label: 'Jan', income: 0, expenses: 0 },
      { month: '2026-02', label: 'Feb', income: 0, expenses: 0 },
    ])
  })

  it('income txns counted correctly per month', () => {
    const txns = [
      { date: '2026-01-05', type: 'income' as const, amount: 1000 },
      { date: '2026-02-10', type: 'income' as const, amount: 2000 },
    ]
    const result = computeMultiMonthTotals(txns, ['2026-01', '2026-02'])
    expect(result[0].income).toBe(1000)
    expect(result[1].income).toBe(2000)
  })

  it('expense txns counted correctly per month', () => {
    const txns = [
      { date: '2026-01-15', type: 'expense' as const, amount: 300 },
      { date: '2026-02-20', type: 'expense' as const, amount: 500 },
    ]
    const result = computeMultiMonthTotals(txns, ['2026-01', '2026-02'])
    expect(result[0].expenses).toBe(300)
    expect(result[1].expenses).toBe(500)
  })

  it('txns from outside the month list are ignored', () => {
    const txns = [
      { date: '2025-12-31', type: 'expense' as const, amount: 999 },
      { date: '2026-03-01', type: 'income' as const, amount: 999 },
    ]
    const result = computeMultiMonthTotals(txns, ['2026-01', '2026-02'])
    result.forEach(m => {
      expect(m.income).toBe(0)
      expect(m.expenses).toBe(0)
    })
  })

  it("label format: '2026-01' → 'Jan', '2026-12' → 'Dec'", () => {
    const result = computeMultiMonthTotals([], ['2026-01', '2026-12'])
    expect(result[0].label).toBe('Jan')
    expect(result[1].label).toBe('Dec')
  })

  it('mixed income+expense in same month split correctly', () => {
    const txns = [
      { date: '2026-01-01', type: 'income' as const, amount: 5000 },
      { date: '2026-01-15', type: 'expense' as const, amount: 1500 },
    ]
    const result = computeMultiMonthTotals(txns, ['2026-01'])
    expect(result[0].income).toBe(5000)
    expect(result[0].expenses).toBe(1500)
  })

  it('multiple txns in same month summed correctly', () => {
    const txns = [
      { date: '2026-01-01', type: 'expense' as const, amount: 100 },
      { date: '2026-01-10', type: 'expense' as const, amount: 200 },
      { date: '2026-01-20', type: 'expense' as const, amount: 300 },
    ]
    const result = computeMultiMonthTotals(txns, ['2026-01'])
    expect(result[0].expenses).toBe(600)
  })
})

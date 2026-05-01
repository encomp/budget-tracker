import { describe, it, expect } from 'vitest'
import { computeSavingsRate } from '../useMonthlyTotals'

describe('computeSavingsRate', () => {
  it('income=0 → 0%', () => {
    expect(computeSavingsRate(0, 0)).toBe(0)
    expect(computeSavingsRate(0, 500)).toBe(0)
  })

  it('expenses=0, income>0 → 100%', () => {
    expect(computeSavingsRate(5000, 0)).toBe(100)
  })

  it('expenses < income → correct positive %', () => {
    expect(computeSavingsRate(5000, 4000)).toBe(20)
  })

  it('expenses === income → 0%', () => {
    expect(computeSavingsRate(5000, 5000)).toBe(0)
  })

  it('expenses > income → 0% (clamped, not negative)', () => {
    expect(computeSavingsRate(3000, 5000)).toBe(0)
  })

  it('result is always integer (Math.round applied)', () => {
    const rate = computeSavingsRate(3000, 2000)
    expect(Number.isInteger(rate)).toBe(true)
  })

  it('result never exceeds 100', () => {
    expect(computeSavingsRate(1000, 0)).toBe(100)
    expect(computeSavingsRate(100, 0)).toBe(100)
  })
})

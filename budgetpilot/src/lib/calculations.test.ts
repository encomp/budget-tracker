import { describe, it, expect } from 'vitest'
import {
  calculateAllocation,
  calculateSnowball,
  calculateAvalanche,
  calculateMonthlyPayoff,
  calculateInterestSaved,
  clampAllocationSliders,
} from './calculations'

describe('calculateAllocation', () => {
  it('50/30/20 split on $5000', () => {
    const result = calculateAllocation(5000, { needs: 50, wants: 30, savings: 20 })
    expect(result.needs).toBe(2500)
    expect(result.wants).toBe(1500)
    expect(result.savings).toBe(1000)
  })
  it('custom split sums to 100', () => {
    const result = calculateAllocation(4000, { needs: 60, wants: 25, savings: 15 })
    expect(result.needs + result.wants + result.savings).toBeCloseTo(4000)
  })
  it('throws when splits do not sum to 100', () => {
    expect(() =>
      calculateAllocation(5000, { needs: 50, wants: 30, savings: 30 })
    ).toThrow()
  })
})

describe('calculateSnowball', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 3000, apr: 15, minPayment: 60 },
    { id: 'b', name: 'Card B', balance: 1000, apr: 22, minPayment: 25 },
    { id: 'c', name: 'Card C', balance: 2000, apr: 18, minPayment: 40 },
  ]
  it('orders by lowest balance first', () => {
    const result = calculateSnowball(debts, 0)
    expect(result[0].debtId).toBe('b')
    expect(result[1].debtId).toBe('c')
    expect(result[2].debtId).toBe('a')
  })
  it('with extra payment reduces total months', () => {
    const withExtra = calculateSnowball(debts, 200)
    const withoutExtra = calculateSnowball(debts, 0)
    const maxWithExtra = Math.max(...withExtra.map(e => e.monthsToPayoff))
    const maxWithout = Math.max(...withoutExtra.map(e => e.monthsToPayoff))
    expect(maxWithExtra).toBeLessThan(maxWithout)
  })
  it('tiebreak by name alphabetically', () => {
    const tieDebts = [
      { id: 'x', name: 'Zebra', balance: 500, apr: 10, minPayment: 20 },
      { id: 'y', name: 'Alpha', balance: 500, apr: 20, minPayment: 20 },
    ]
    const result = calculateSnowball(tieDebts, 0)
    expect(result[0].debtId).toBe('y') // Alpha before Zebra
  })
})

describe('calculateAvalanche', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 3000, apr: 15, minPayment: 60 },
    { id: 'b', name: 'Card B', balance: 1000, apr: 22, minPayment: 25 },
    { id: 'c', name: 'Card C', balance: 2000, apr: 18, minPayment: 40 },
  ]
  it('orders by highest APR first', () => {
    const result = calculateAvalanche(debts, 0)
    expect(result[0].debtId).toBe('b') // 22% first
    expect(result[1].debtId).toBe('c') // 18% second
    expect(result[2].debtId).toBe('a') // 15% last
  })
})

describe('calculateMonthlyPayoff', () => {
  it('known amortization result: $1000 at 12% APR with $100/month', () => {
    const result = calculateMonthlyPayoff(1000, 12, 100)
    expect(result.months).toBeGreaterThanOrEqual(10)
    expect(result.months).toBeLessThanOrEqual(12)
    expect(result.totalInterest).toBeGreaterThan(0)
    expect(result.totalInterest).toBeLessThan(100)
  })
  it('single month payoff when payment > balance', () => {
    const result = calculateMonthlyPayoff(500, 12, 600)
    expect(result.months).toBe(1)
  })
  it('caps at 600 months', () => {
    const result = calculateMonthlyPayoff(10000, 24, 201)
    expect(result.months).toBeLessThanOrEqual(600)
  })
})

describe('calculateInterestSaved', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 2000, apr: 20, minPayment: 50 },
    { id: 'b', name: 'Card B', balance: 3000, apr: 15, minPayment: 60 },
  ]
  it('extra payment reduces interest vs minimum-only', () => {
    const result = calculateInterestSaved(debts, 200, 'snowball')
    expect(result.saved).toBeGreaterThan(0)
    expect(result.totalInterestMethod).toBeLessThan(result.totalInterestMinOnly)
  })
  it('zero extra payment results in zero savings', () => {
    const result = calculateInterestSaved(debts, 0, 'avalanche')
    expect(result.saved).toBeCloseTo(0)
  })
})

describe('clampAllocationSliders', () => {
  it('changing needs adjusts wants and savings proportionally', () => {
    const result = clampAllocationSliders(
      'needs', 60, { needs: 50, wants: 30, savings: 20 }
    )
    expect(result.needs).toBe(60)
    expect(result.wants + result.savings).toBeCloseTo(40)
  })
  it('always sums to 100', () => {
    const result = clampAllocationSliders(
      'savings', 35, { needs: 50, wants: 30, savings: 20 }
    )
    expect(result.needs + result.wants + result.savings).toBeCloseTo(100)
  })
  it('when one other slider is 0, the remaining absorbs the full delta', () => {
    const result = clampAllocationSliders(
      'needs', 70, { needs: 50, wants: 50, savings: 0 }
    )
    expect(result.needs).toBe(70)
    expect(result.savings).toBe(0)
    expect(result.wants).toBeCloseTo(30)
  })
})

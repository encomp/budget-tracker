import { addMonths, format } from 'date-fns'
import type { BpDebt, PayoffEntry, InterestComparison } from '../types'

export function calculateAllocation(
  income: number,
  splits: { needs: number; wants: number; savings: number }
): { needs: number; wants: number; savings: number } {
  const total = splits.needs + splits.wants + splits.savings
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Splits must sum to 100, got ${total}`)
  }
  return {
    needs: income * (splits.needs / 100),
    wants: income * (splits.wants / 100),
    savings: income * (splits.savings / 100),
  }
}

export function calculateMonthlyPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number
): {
  months: number
  totalInterest: number
  schedule: {
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }[]
} {
  const monthlyRate = apr / 12 / 100
  const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = []
  let currentBalance = balance
  let totalInterest = 0
  let month = 0

  while (currentBalance > 0 && month < 600) {
    month++
    const interest = currentBalance * monthlyRate
    totalInterest += interest
    const payment = Math.min(monthlyPayment, currentBalance + interest)
    const principal = payment - interest
    currentBalance = Math.max(0, currentBalance + interest - payment)
    schedule.push({ month, payment, principal, interest, balance: currentBalance })
  }

  return { months: month, totalInterest, schedule }
}

function simulatePayoff(
  sortedDebts: BpDebt[],
  extraPayment: number,
  today: Date
): PayoffEntry[] {
  const queue = [...sortedDebts]
  const balances = new Map(sortedDebts.map(d => [d.id, d.balance]))
  const interestAccum = new Map(sortedDebts.map(d => [d.id, 0]))
  const results: PayoffEntry[] = []
  let availableExtra = extraPayment
  let month = 0

  while (queue.length > 0 && month < 600) {
    month++
    const focusId = queue[0].id

    for (const debt of queue) {
      const rate = debt.apr / 12 / 100
      const bal = balances.get(debt.id)!
      const interest = bal * rate
      interestAccum.set(debt.id, interestAccum.get(debt.id)! + interest)

      let payment = debt.minPayment
      if (debt.id === focusId) payment += availableExtra
      payment = Math.min(payment, bal + interest)

      balances.set(debt.id, Math.max(0, bal + interest - payment))
    }

    while (queue.length > 0 && balances.get(queue[0].id)! <= 0) {
      const paid = queue.shift()!
      results.push({
        debtId: paid.id,
        debtName: paid.name,
        monthsToPayoff: month,
        totalInterest: interestAccum.get(paid.id)!,
        payoffDate: format(addMonths(today, month), 'yyyy-MM-dd'),
      })
      availableExtra += paid.minPayment
    }
  }

  for (const remaining of queue) {
    results.push({
      debtId: remaining.id,
      debtName: remaining.name,
      monthsToPayoff: 600,
      totalInterest: interestAccum.get(remaining.id)!,
      payoffDate: format(addMonths(today, 600), 'yyyy-MM-dd'),
    })
  }

  return results
}

export function calculateSnowball(
  debts: BpDebt[],
  extraPayment: number
): PayoffEntry[] {
  const sorted = [...debts].sort((a, b) =>
    a.balance !== b.balance ? a.balance - b.balance : a.name.localeCompare(b.name)
  )
  return simulatePayoff(sorted, extraPayment, new Date())
}

export function calculateAvalanche(
  debts: BpDebt[],
  extraPayment: number
): PayoffEntry[] {
  const sorted = [...debts].sort((a, b) =>
    a.apr !== b.apr ? b.apr - a.apr : a.name.localeCompare(b.name)
  )
  return simulatePayoff(sorted, extraPayment, new Date())
}

export function calculateInterestSaved(
  debts: BpDebt[],
  extraPayment: number,
  method: 'snowball' | 'avalanche'
): InterestComparison {
  const fn = method === 'snowball' ? calculateSnowball : calculateAvalanche
  const withExtra = fn(debts, extraPayment)
  const minOnly = fn(debts, 0)

  const totalInterestMethod = withExtra.reduce((sum, e) => sum + e.totalInterest, 0)
  const totalInterestMinOnly = minOnly.reduce((sum, e) => sum + e.totalInterest, 0)

  return {
    totalInterestMethod,
    totalInterestMinOnly,
    saved: totalInterestMinOnly - totalInterestMethod,
  }
}

export function clampAllocationSliders(
  changed: 'needs' | 'wants' | 'savings',
  newValue: number,
  current: { needs: number; wants: number; savings: number }
): { needs: number; wants: number; savings: number } {
  const result = { ...current, [changed]: newValue }
  const others = (['needs', 'wants', 'savings'] as const).filter(k => k !== changed)
  const othersTotal = others.reduce((sum, k) => sum + current[k], 0)
  const delta = newValue - current[changed]

  if (othersTotal === 0) return result

  for (const other of others) {
    result[other] = Math.max(0, current[other] - delta * (current[other] / othersTotal))
  }

  // Fix floating-point rounding so sum is exactly 100
  const total = result.needs + result.wants + result.savings
  const diff = 100 - total
  if (Math.abs(diff) > 0.0001) {
    const adjustable = others.find(k => result[k] + diff >= 0) ?? others[0]
    result[adjustable] = Math.max(0, result[adjustable] + diff)
  }

  return result
}

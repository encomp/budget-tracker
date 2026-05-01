import { useLiveQuery } from 'dexie-react-hooks'
import { format, parseISO, subMonths } from 'date-fns'
import { db } from '../lib/db'

export interface MonthSummary {
  month: string
  label: string
  income: number
  expenses: number
}

export function buildMonthRange(count: number, anchor: string): string[] {
  const end = parseISO(`${anchor}-01`)
  return Array.from({ length: count }, (_, i) =>
    format(subMonths(end, count - 1 - i), 'yyyy-MM')
  )
}

export function computeMultiMonthTotals(
  txns: { date: string; type: 'income' | 'expense'; amount: number }[],
  months: string[]
): MonthSummary[] {
  return months.map(month => {
    const monthTxns = txns.filter(t => t.date.startsWith(month))
    const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const label = format(parseISO(`${month}-01`), 'MMM')
    return { month, label, income, expenses }
  })
}

export function useMultiMonthTotals(months: string[]): MonthSummary[] {
  return useLiveQuery(async () => {
    if (months.length === 0) return []
    const earliest = months[0]
    const latest = months[months.length - 1]
    const txns = await db.transactions
      .where('date')
      .between(earliest, latest + '-31', true, true)
      .toArray()
    return computeMultiMonthTotals(txns, months)
  }, [months.join(',')], []) ?? []
}

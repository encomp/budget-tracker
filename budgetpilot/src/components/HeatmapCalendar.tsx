import * as React from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  getDaysInMonth,
  parseISO,
} from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { useDailySpend } from '../hooks/useDailySpend'
import { useActiveBudget } from '../hooks/useActiveBudget'
import type { BpTransaction } from '../types'

export interface HeatmapCalendarProps {
  month: string // "YYYY-MM"
  dailySpendOverride?: Record<string, number>
  dailyBudgetOverride?: number
}

type HeatLevel = 'none' | 'low' | 'mid' | 'high'

function getHeatLevel(spend: number, dailyBudget: number): HeatLevel {
  if (spend === 0) return 'none'
  if (dailyBudget <= 0) return 'low'
  if (spend < dailyBudget * 0.95) return 'low'
  if (spend <= dailyBudget * 1.05) return 'mid'
  return 'high'
}

const HEAT_BG: Record<HeatLevel, string> = {
  none: 'var(--bp-heat-none)',
  low: 'var(--bp-heat-low)',
  mid: 'var(--bp-heat-mid)',
  high: 'var(--bp-heat-high)',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface TooltipData {
  dateStr: string
  spend: number
  inTopRows: boolean
  anchorRect: { left: number; top: number; width: number; height: number }
}

function DayTooltip({ data }: { data: TooltipData }) {
  const txns = useLiveQuery(
    () =>
      db.transactions
        .where('date')
        .equals(data.dateStr)
        .filter((t: BpTransaction) => t.type === 'expense')
        .toArray(),
    [data.dateStr],
    [] as BpTransaction[]
  )!

  const categoryNames = useLiveQuery(
    async () => {
      const budgets = await db.budgets.toArray()
      const map: Record<string, string> = {}
      budgets.forEach((b) => {
        ;(b.categories ?? []).forEach((c) => {
          map[c.id] = c.name
        })
      })
      return map
    },
    [],
    {} as Record<string, string>
  )!

  const top3 = React.useMemo(() => {
    const spendByCat: Record<string, number> = {}
    txns.forEach((t) => {
      const catId = t.categoryId ?? '__uncategorized__'
      spendByCat[catId] = (spendByCat[catId] ?? 0) + t.amount
    })
    return Object.entries(spendByCat)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, amt]) => ({
        name: id === '__uncategorized__' ? 'Uncategorized' : (categoryNames[id] ?? id),
        amt,
      }))
  }, [txns, categoryNames])

  const displayDate = format(parseISO(data.dateStr), 'MMM d')
  const { anchorRect, inTopRows } = data

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left + anchorRect.width / 2,
    ...(inTopRows
      ? { top: anchorRect.top + anchorRect.height + 8, transform: 'translateX(-50%)' }
      : { top: anchorRect.top - 8, transform: 'translateX(-50%) translateY(-100%)' }),
    background: 'var(--bp-bg-surface)',
    border: '1px solid var(--bp-border)',
    borderRadius: 'var(--bp-radius-md)',
    padding: '10px 12px',
    zIndex: 200,
    minWidth: '140px',
    pointerEvents: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  }

  return (
    <div style={tooltipStyle}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--bp-text-primary)',
          fontFamily: 'var(--bp-font-ui)',
          marginBottom: '4px',
        }}
      >
        {displayDate}
      </div>
      <div
        style={{
          fontSize: '13px',
          fontFamily: 'var(--bp-font-mono)',
          color: 'var(--bp-accent)',
          marginBottom: top3.length > 0 ? '6px' : 0,
        }}
      >
        ${data.spend.toFixed(2)} Total
      </div>
      {top3.map(({ name, amt }) => (
        <div
          key={name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--bp-text-secondary)',
            fontFamily: 'var(--bp-font-ui)',
          }}
        >
          <span>{name}</span>
          <span style={{ fontFamily: 'var(--bp-font-mono)' }}>${amt.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

export function HeatmapCalendar({
  month,
  dailySpendOverride,
  dailyBudgetOverride,
}: HeatmapCalendarProps) {
  const liveSpend = useDailySpend(month)
  const budget = useActiveBudget(month)
  const dailySpend = dailySpendOverride ?? liveSpend

  const [tooltip, setTooltip] = React.useState<TooltipData | null>(null)
  const dismissTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const monthDate = parseISO(`${month}-01`)
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)
  const days = eachDayOfInterval({ start, end })
  const daysInMonth = getDaysInMonth(monthDate)

  const dailyBudget =
    dailyBudgetOverride ??
    (budget && budget.monthlyIncome > 0 ? budget.monthlyIncome / daysInMonth : 0)

  const firstDayOfWeek = getDay(start)
  const cells: (Date | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...days,
  ]

  function openTooltip(day: Date, el: HTMLElement, rowIndex: number) {
    const rect = el.getBoundingClientRect()
    const dateStr = format(day, 'yyyy-MM-dd')
    const spend = dailySpend[dateStr] ?? 0
    if (spend === 0) {
      setTooltip(null)
      return
    }
    setTooltip({
      dateStr,
      spend,
      inTopRows: rowIndex < 2,
      anchorRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    })
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
  }

  function handleTouch(day: Date, el: HTMLElement, rowIndex: number) {
    openTooltip(day, el, rowIndex)
    dismissTimerRef.current = setTimeout(() => setTooltip(null), 3000)
  }

  React.useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '2px',
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: 'var(--bp-text-muted)',
              fontFamily: 'var(--bp-font-ui)',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, rowIdx) => (
        <div
          key={rowIdx}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
        >
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            if (!day) {
              return <div key={colIdx} style={{ aspectRatio: '1' }} />
            }
            const dateStr = format(day, 'yyyy-MM-dd')
            const spend = dailySpend[dateStr] ?? 0
            const level = getHeatLevel(spend, dailyBudget)

            return (
              <div
                key={colIdx}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--bp-radius-sm)',
                  background: HEAT_BG[level],
                  cursor: 'pointer',
                  transition: 'background-color var(--bp-duration-normal) var(--bp-easing-default)',
                }}
                onMouseEnter={(e) => openTooltip(day, e.currentTarget as HTMLElement, rowIdx)}
                onMouseLeave={() => setTooltip(null)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleTouch(day, e.currentTarget as HTMLElement, rowIdx)
                }}
              />
            )
          })}
        </div>
      ))}

      {tooltip && <DayTooltip data={tooltip} />}
    </div>
  )
}

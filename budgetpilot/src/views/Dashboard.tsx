import * as React from 'react'
import { format, addMonths, subMonths, parseISO, differenceInMonths } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveBar } from '@nivo/bar'
import { motion } from 'motion/react'
import { useAppStore } from '../store/useAppStore'
import { useMonthlyTotals } from '../hooks/useMonthlyTotals'
import { useRecentTransactions } from '../hooks/useRecentTransactions'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useActiveBudget } from '../hooks/useActiveBudget'
import { useMultiMonthTotals, buildMonthRange } from '../hooks/useMultiMonthTotals'
import { useAllCategorySpend } from '../hooks/useAllCategorySpend'
import { HeatmapCalendar } from '../components/HeatmapCalendar'
import { TransactionModal } from '../components/TransactionModal'
import { BpCard } from '../components/ui/BpCard'
import { BpBadge } from '../components/ui/BpBadge'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpToast, useToast } from '../components/ui/BpToast'
import { useNivoTheme } from '../components/ui/NivoTheme'
import { Settings } from '../lib/settings'
import { db } from '../lib/db'
import type { BpTransaction, BpCategory } from '../types'

type TrendRange = '3m' | '6m' | 'ytd'

interface BudgetBarDatum {
  category: string
  spent: number
  remaining: number
  isOver: boolean
  actualSpent: number
  limit: number
}

function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    let start: number | null = null
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

function MetricCard({
  label,
  value,
  prefix = '$',
  suffix = '',
  color,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  color: string
}) {
  const isNegative = value < 0
  const displayed = useCountUp(Math.abs(value))
  return (
    <BpCard padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--bp-text-muted)',
            fontFamily: 'var(--bp-font-ui)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '24px',
            fontFamily: 'var(--bp-font-mono)',
            color,
            fontWeight: 500,
          }}
        >
          {isNegative ? '-' : ''}{prefix}{displayed.toLocaleString()}{suffix}
        </span>
      </div>
    </BpCard>
  )
}

function MonthPicker({
  month,
  onChange,
}: {
  month: string
  onChange: (m: string) => void
}) {
  const date = parseISO(`${month}-01`)
  const label = format(date, 'MMMM yyyy')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => onChange(format(subMonths(date, 1), 'yyyy-MM'))}
        style={navBtnStyle}
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>
      <span
        style={{
          fontFamily: 'var(--bp-font-ui)',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--bp-text-primary)',
          minWidth: '130px',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      <button
        onClick={() => onChange(format(addMonths(date, 1), 'yyyy-MM'))}
        style={navBtnStyle}
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'var(--bp-bg-surface-alt)',
  border: '1px solid var(--bp-border)',
  borderRadius: 'var(--bp-radius-sm)',
  color: 'var(--bp-text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '4px 6px',
}

const SLICE_COLORS = [
  'var(--bp-accent)',
  'var(--bp-warning)',
  'var(--bp-positive)',
  '#8b5cf6',
  '#3b82f6',
  '#ec4899',
  '#f97316',
  '#06b6d4',
]

const sectionLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--bp-text-secondary)',
  fontFamily: 'var(--bp-font-ui)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function BudgetLabelLayer(props: Record<string, unknown>) {
  const bars = props.bars as Array<{
    key: string
    x: number
    y: number
    width: number
    height: number
    data: { id: string | number; data: BudgetBarDatum }
  }>
  const innerWidth = props.innerWidth as number

  return (
    <>
      {bars
        .filter(bar => bar.data.id === 'spent')
        .map(bar => {
          const d = bar.data.data
          const label = `$${d.actualSpent.toFixed(0)} / $${d.limit.toFixed(0)}${d.isOver ? ' ⚠' : ''}`
          return (
            <text
              key={bar.key}
              x={innerWidth + 8}
              y={bar.y + bar.height / 2}
              textAnchor="start"
              dominantBaseline="middle"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--bp-font-ui)',
                fill: d.isOver ? 'var(--bp-danger)' : 'var(--bp-text-secondary)',
              }}
            >
              {label}
            </text>
          )
        })}
    </>
  )
}

export default function Dashboard() {
  const activeMonth = useAppStore((s) => s.activeMonth)
  const setActiveMonth = useAppStore((s) => s.setActiveMonth)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const transactionModalOpen = useAppStore((s) => s.transactionModalOpen)
  const setTransactionModalOpen = useAppStore((s) => s.setTransactionModalOpen)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const totals = useMonthlyTotals(activeMonth)
  const categories = useMonthCategories(activeMonth)
  const recentTxns = useRecentTransactions(activeMonth, 8)
  const nivoTheme = useNivoTheme()
  const budget = useActiveBudget(activeMonth)
  const allCategorySpend = useAllCategorySpend(activeMonth)

  const [trendRange, setTrendRange] = React.useState<TrendRange>('6m')
  const [lastExport, setLastExport] = React.useState<string | null>(null)
  const [filteredCategoryId, setFilteredCategoryId] = React.useState<string | null>(null)
  const [editTxn, setEditTxn] = React.useState<BpTransaction | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const { toast, showToast, dismiss } = useToast()

  React.useEffect(() => {
    Settings.get<string>('lastExport').then((val) => {
      if (val) setLastExport(val)
    })
  }, [])

  // Trend chart months
  const trendMonths = React.useMemo(() => {
    if (trendRange === '3m') return buildMonthRange(3, activeMonth)
    if (trendRange === 'ytd') {
      const year = activeMonth.slice(0, 4)
      const start = `${year}-01`
      const end = activeMonth
      const count = differenceInMonths(parseISO(`${end}-01`), parseISO(`${start}-01`)) + 1
      return buildMonthRange(count, end)
    }
    return buildMonthRange(6, activeMonth)
  }, [trendRange, activeMonth])

  const trendData = useMultiMonthTotals(trendMonths)

  const isTrendEmpty = trendData.every(m => m.income === 0 && m.expenses === 0)
  const trendChartHeight = isMobile ? 180 : 240

  // Category spend data
  const categoryExpenses = useLiveQuery(
    async () => {
      const txns = await db.transactions
        .where('date')
        .startsWith(activeMonth)
        .filter((t) => t.type === 'expense')
        .toArray()
      const map: Record<string, number> = {}
      txns.forEach((t) => {
        const id = t.categoryId ?? '__none__'
        map[id] = (map[id] ?? 0) + t.amount
      })
      return map
    },
    [activeMonth],
    {} as Record<string, number>
  )!

  const catMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    categories.forEach((c: BpCategory) => {
      m[c.id] = c.name
    })
    return m
  }, [categories])

  const pieData = React.useMemo(
    () =>
      Object.entries(categoryExpenses)
        .filter(([, v]) => v > 0)
        .map(([id, value], i) => ({
          id,
          label: catMap[id] ?? (id === '__none__' ? 'Uncategorized' : id),
          value,
          color: SLICE_COLORS[i % SLICE_COLORS.length],
        })),
    [categoryExpenses, catMap]
  )

  const sortedPieData = React.useMemo(
    () => [...pieData].sort((a, b) => b.value - a.value),
    [pieData]
  )
  const top5PieData = sortedPieData.slice(0, 5)
  const extraPieCount = Math.max(0, sortedPieData.length - 5)

  // Budget vs Actual
  const budgetCatMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    budget?.categories?.forEach(c => { m[c.id] = c.name })
    return m
  }, [budget])

  const budgetBarData = React.useMemo((): BudgetBarDatum[] => {
    return allCategorySpend
      .filter(cs => cs.limit > 0)
      .map(cs => {
        const catName = budgetCatMap[cs.categoryId] ?? catMap[cs.categoryId] ?? cs.categoryId
        const displayName = isMobile && catName.length > 12 ? catName.slice(0, 12) + '…' : catName
        const isOver = cs.spent > cs.limit
        return {
          category: displayName,
          spent: isOver ? cs.limit : cs.spent,
          remaining: isOver ? 0 : cs.limit - cs.spent,
          isOver,
          actualSpent: cs.spent,
          limit: cs.limit,
        }
      })
  }, [allCategorySpend, budgetCatMap, catMap, isMobile])

  const hasBudgetCategories = (budget?.categories?.length ?? 0) > 0
  const budgetChartHeight = Math.max(120, budgetBarData.length * 44)

  const displayedTxns = React.useMemo(
    () =>
      filteredCategoryId
        ? recentTxns.filter((t) => t.categoryId === filteredCategoryId)
        : recentTxns,
    [recentTxns, filteredCategoryId]
  )

  async function handleDelete(id: string) {
    await db.transactions.delete(id)
    showToast('Transaction deleted.', 'info')
  }

  function formatRelativeExport(isoDate: string): string {
    const diff = Math.floor(
      (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 0) return 'today'
    if (diff === 1) return '1d ago'
    return `${diff}d ago`
  }

  return (
    <div
      style={{
        padding: isMobile ? '16px' : '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1400px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--bp-font-ui)',
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: 'var(--bp-text-primary)',
            }}
          >
            Dashboard
          </h1>
          <MonthPicker month={activeMonth} onChange={setActiveMonth} />
        </div>
        {lastExport && (
          <BpBadge variant="muted">Last Export: {formatRelativeExport(lastExport)}</BpBadge>
        )}
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        <MetricCard label="Income" value={totals.totalIncome} color="var(--bp-positive)" />
        <MetricCard label="Expenses" value={totals.totalExpenses} color="var(--bp-danger)" />
        <MetricCard
          label="Remaining"
          value={totals.remaining}
          color={totals.remaining >= 0 ? 'var(--bp-positive)' : 'var(--bp-danger)'}
        />
        <MetricCard
          label="Savings Rate"
          value={totals.savingsRate}
          prefix=""
          suffix="%"
          color="var(--bp-accent)"
        />
      </div>

      {/* Heatmap + Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: '16px',
        }}
      >
        <BpCard padding="md">
          <div style={{ ...sectionLabel, marginBottom: '12px' }}>Spending Heatmap</div>
          <HeatmapCalendar month={activeMonth} />
        </BpCard>

        <BpCard padding="md">
          <div style={{ ...sectionLabel, marginBottom: '12px' }}>
            Spending by Category
            {filteredCategoryId && (
              <button
                onClick={() => setFilteredCategoryId(null)}
                style={{
                  marginLeft: '8px',
                  fontSize: '11px',
                  color: 'var(--bp-accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--bp-font-ui)',
                }}
              >
                Clear filter
              </button>
            )}
          </div>
          {pieData.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              {/* Donut */}
              <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                <ResponsivePie
                  data={pieData}
                  theme={nivoTheme}
                  margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  innerRadius={0.55}
                  padAngle={2}
                  cornerRadius={4}
                  animate
                  motionConfig="wobbly"
                  colors={(d) => d.data.color}
                  borderWidth={0}
                  enableArcLinkLabels={false}
                  arcLabelsTextColor="var(--bp-bg-base)"
                  arcLabelsSkipAngle={15}
                  onClick={(datum) =>
                    setFilteredCategoryId(
                      filteredCategoryId === datum.id ? null : String(datum.id)
                    )
                  }
                  legends={[]}
                />
              </div>
              {/* Custom legend */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  paddingTop: '4px',
                  minWidth: 0,
                }}
              >
                {top5PieData.map(item => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setFilteredCategoryId(
                        filteredCategoryId === String(item.id) ? null : String(item.id)
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        filteredCategoryId === String(item.id)
                          ? 'var(--bp-accent-muted)'
                          : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--bp-radius-sm)',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: 'var(--bp-font-ui)',
                        fontSize: '12px',
                        color: 'var(--bp-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--bp-font-mono)',
                        fontSize: '12px',
                        color: 'var(--bp-text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      ${item.value.toFixed(0)}
                    </span>
                  </button>
                ))}
                {extraPieCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--bp-text-muted)',
                      fontFamily: 'var(--bp-font-ui)',
                      padding: '2px 6px',
                    }}
                  >
                    · {extraPieCount} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bp-text-muted)',
                fontFamily: 'var(--bp-font-ui)',
                fontSize: '13px',
              }}
            >
              No expenses this month
            </div>
          )}
        </BpCard>
      </div>

      {/* Monthly Trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <BpCard padding="md">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={sectionLabel}>Monthly Trend</div>
            {/* Range picker */}
            <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
              {(['3m', '6m', 'ytd'] as TrendRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  style={{
                    position: 'relative',
                    padding: '3px 10px',
                    borderRadius: 'var(--bp-radius-sm)',
                    border: '1px solid var(--bp-border)',
                    background: 'transparent',
                    color: trendRange === r ? 'var(--bp-bg-base)' : 'var(--bp-text-muted)',
                    fontFamily: 'var(--bp-font-ui)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    zIndex: 1,
                    transition: `color var(--bp-duration-fast) var(--bp-easing-default)`,
                  }}
                >
                  {trendRange === r && (
                    <motion.span
                      layoutId="trend-range-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'var(--bp-radius-sm)',
                        background: 'var(--bp-accent)',
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: `${trendChartHeight}px` }}>
            {isTrendEmpty ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bp-text-muted)',
                  fontFamily: 'var(--bp-font-ui)',
                  fontSize: '13px',
                }}
              >
                No transactions in this range
              </div>
            ) : (
              <ResponsiveBar
                data={trendData.map(m => ({
                  month: m.label,
                  Income: m.income,
                  Expenses: m.expenses,
                }))}
                keys={['Income', 'Expenses']}
                indexBy="month"
                groupMode="grouped"
                theme={nivoTheme}
                colors={['var(--bp-positive)', 'var(--bp-danger)']}
                margin={{ top: 16, right: 16, bottom: 40, left: 56 }}
                padding={0.3}
                innerPadding={3}
                borderRadius={3}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 8,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  format: (v) => `$${(Number(v) / 1000).toFixed(0)}k`,
                }}
                enableLabel={false}
                enableGridX={false}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 36,
                    itemWidth: 80,
                    itemHeight: 14,
                    itemTextColor: 'var(--bp-text-secondary)',
                    symbolSize: 10,
                    symbolShape: 'circle',
                  },
                ]}
                animate
                motionConfig="gentle"
              />
            )}
          </div>
        </BpCard>
      </motion.div>

      {/* Budget vs Actual */}
      {hasBudgetCategories && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.08 }}
        >
          <BpCard padding="md">
            <div style={{ ...sectionLabel, marginBottom: '16px' }}>Budget vs Actual</div>
            {budgetBarData.length > 0 ? (
              <div style={{ height: `${budgetChartHeight}px` }}>
                <ResponsiveBar<BudgetBarDatum>
                  data={budgetBarData}
                  keys={['spent', 'remaining']}
                  indexBy="category"
                  layout="horizontal"
                  groupMode="stacked"
                  theme={nivoTheme}
                  colors={(bar) => {
                    if (bar.id === 'remaining') return 'var(--bp-border)'
                    return bar.data.isOver ? 'var(--bp-danger)' : 'var(--bp-positive)'
                  }}
                  margin={{ top: 4, right: 140, bottom: 4, left: 88 }}
                  padding={0.3}
                  borderRadius={3}
                  axisBottom={null}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 8,
                  }}
                  enableLabel={false}
                  enableGridX={false}
                  enableGridY={false}
                  animate
                  motionConfig="gentle"
                  layers={[
                    'grid',
                    'axes',
                    'bars',
                    'markers',
                    'legends',
                    'annotations',
                    BudgetLabelLayer as (props: Record<string, unknown>) => React.ReactNode,
                  ]}
                />
              </div>
            ) : (
              <BpEmptyState
                heading="No budget limits set"
                subtext="Go to Budget to set spending limits and track progress here."
                action={{ label: 'Set up Budget', onClick: () => setActiveView('budget') }}
              />
            )}
          </BpCard>
        </motion.div>
      )}

      {/* Recent transactions */}
      <BpCard padding="md">
        <div
          style={{
            ...sectionLabel,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Recent Transactions</span>
          {filteredCategoryId && (
            <span style={{ color: 'var(--bp-accent)', fontSize: '11px' }}>
              Filtered: {catMap[filteredCategoryId] ?? filteredCategoryId}
            </span>
          )}
        </div>

        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayedTxns.length === 0 ? (
              <EmptyTxnState />
            ) : (
              displayedTxns.map((t) => (
                <TransactionCard
                  key={t.id}
                  txn={t}
                  catName={t.categoryId ? catMap[t.categoryId] : undefined}
                  onEdit={() => {
                    setEditTxn(t)
                    setTransactionModalOpen(true)
                  }}
                  onDelete={() => setDeleteTarget(t.id)}
                />
              ))
            )}
          </div>
        ) : (
          <TransactionTable
            txns={displayedTxns}
            catMap={catMap}
            onEdit={(t) => {
              setEditTxn(t)
              setTransactionModalOpen(true)
            }}
            onDelete={(id) => setDeleteTarget(id)}
          />
        )}
      </BpCard>

      <TransactionModal
        open={transactionModalOpen}
        onOpenChange={(open) => {
          setTransactionModalOpen(open)
          if (!open) setEditTxn(undefined)
        }}
        activeMonth={activeMonth}
        editTransaction={editTxn}
      />

      <BpConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete transaction?"
        description="This will permanently remove this transaction."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget)
          setDeleteTarget(null)
        }}
      />

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

function EmptyTxnState() {
  return (
    <BpEmptyState
      heading="No transactions yet"
      subtext="Add your first one using the + button."
    />
  )
}

function TransactionCard({
  txn,
  catName,
  onEdit,
  onDelete,
}: {
  txn: BpTransaction
  catName?: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      style={{
        background: 'var(--bp-bg-surface-alt)',
        borderRadius: 'var(--bp-radius-md)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--bp-text-primary)',
            fontFamily: 'var(--bp-font-ui)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {txn.note || 'No description'}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}
        >
          {txn.categoryId === null ? (
            <BpBadge variant="warning">Uncategorized</BpBadge>
          ) : catName ? (
            <BpBadge variant="default">{catName}</BpBadge>
          ) : null}
          <BpBadge variant={txn.importSource === 'csv' ? 'csv' : 'manual'} />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--bp-text-muted)',
              fontFamily: 'var(--bp-font-ui)',
            }}
          >
            {txn.date}
          </span>
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--bp-font-mono)',
          fontSize: '15px',
          fontWeight: 500,
          color: txn.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)',
          flexShrink: 0,
        }}
      >
        {txn.type === 'expense' ? '-' : '+'}${txn.amount.toFixed(2)}
      </span>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <IconBtn onClick={onEdit} label="Edit">
          <Pencil size={13} />
        </IconBtn>
        <IconBtn onClick={onDelete} label="Delete" danger>
          <Trash2 size={13} />
        </IconBtn>
      </div>
    </div>
  )
}

function TransactionTable({
  txns,
  catMap,
  onEdit,
  onDelete,
}: {
  txns: BpTransaction[]
  catMap: Record<string, string>
  onEdit: (t: BpTransaction) => void
  onDelete: (id: string) => void
}) {
  if (txns.length === 0) return <EmptyTxnState />

  const colStyle: React.CSSProperties = {
    fontFamily: 'var(--bp-font-ui)',
    fontSize: '12px',
    color: 'var(--bp-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '6px 10px',
    textAlign: 'left',
    borderBottom: '1px solid var(--bp-border)',
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={colStyle}>Date</th>
          <th style={colStyle}>Category</th>
          <th style={colStyle}>Description</th>
          <th style={{ ...colStyle, textAlign: 'right' }}>Amount</th>
          <th style={colStyle}>Source</th>
          <th style={colStyle} />
        </tr>
      </thead>
      <tbody>
        {txns.map((t) => (
          <tr key={t.id} style={{ borderBottom: '1px solid var(--bp-border)' }}>
            <td style={cellStyle}>{t.date}</td>
            <td style={cellStyle}>
              {t.categoryId && catMap[t.categoryId] ? (
                <BpBadge variant="default">{catMap[t.categoryId]}</BpBadge>
              ) : (
                <BpBadge variant="warning">Uncategorized</BpBadge>
              )}
            </td>
            <td
              style={{
                ...cellStyle,
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {(t.note || '—').slice(0, 30)}
            </td>
            <td
              style={{
                ...cellStyle,
                textAlign: 'right',
                fontFamily: 'var(--bp-font-mono)',
                color: t.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)',
              }}
            >
              {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
            </td>
            <td style={cellStyle}>
              <BpBadge variant={t.importSource === 'csv' ? 'csv' : 'manual'} />
            </td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <IconBtn onClick={() => onEdit(t)} label="Edit">
                  <Pencil size={13} />
                </IconBtn>
                <IconBtn onClick={() => onDelete(t.id)} label="Delete" danger>
                  <Trash2 size={13} />
                </IconBtn>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const cellStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '13px',
  color: 'var(--bp-text-primary)',
  padding: '10px 10px',
}

function IconBtn({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void
  label: string
  danger?: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? danger
            ? 'var(--bp-danger-muted)'
            : 'var(--bp-accent-muted)'
          : 'transparent',
        border: 'none',
        borderRadius: 'var(--bp-radius-sm)',
        color: danger ? 'var(--bp-danger)' : 'var(--bp-text-muted)',
        cursor: 'pointer',
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background var(--bp-duration-fast) var(--bp-easing-default)',
      }}
    >
      {children}
    </button>
  )
}

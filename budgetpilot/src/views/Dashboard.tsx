import * as React from 'react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'
import { useAppStore } from '../store/useAppStore'
import { useMonthlyTotals } from '../hooks/useMonthlyTotals'
import { useRecentTransactions } from '../hooks/useRecentTransactions'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
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
          {prefix}
          {displayed.toLocaleString()}
          {suffix}
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

export default function Dashboard() {
  const activeMonth = useAppStore((s) => s.activeMonth)
  const setActiveMonth = useAppStore((s) => s.setActiveMonth)
  const transactionModalOpen = useAppStore((s) => s.transactionModalOpen)
  const setTransactionModalOpen = useAppStore((s) => s.setTransactionModalOpen)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const totals = useMonthlyTotals(activeMonth)
  const categories = useMonthCategories(activeMonth)
  const recentTxns = useRecentTransactions(activeMonth, 8)
  const nivoTheme = useNivoTheme()

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
          gridTemplateColumns: isMobile
            ? 'repeat(2, 1fr)'
            : 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        <MetricCard
          label="Income"
          value={totals.totalIncome}
          color="var(--bp-positive)"
        />
        <MetricCard
          label="Expenses"
          value={totals.totalExpenses}
          color="var(--bp-danger)"
        />
        <MetricCard
          label="Remaining"
          value={totals.remaining}
          color="var(--bp-text-primary)"
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
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--bp-text-secondary)',
              fontFamily: 'var(--bp-font-ui)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Spending Heatmap
          </div>
          <HeatmapCalendar month={activeMonth} />
        </BpCard>

        <BpCard padding="md">
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--bp-text-secondary)',
              fontFamily: 'var(--bp-font-ui)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
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
            <div style={{ height: '220px' }}>
              <ResponsivePie
                data={pieData}
                theme={nivoTheme}
                margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
                innerRadius={0.55}
                padAngle={2}
                cornerRadius={4}
                animate
                motionConfig="wobbly"
                colors={(d) => d.data.color}
                borderWidth={0}
                enableArcLinkLabels={!isMobile}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLinkLabelsTextColor="var(--bp-text-secondary)"
                arcLinkLabelsDiagonalLength={8}
                arcLinkLabelsStraightLength={12}
                arcLabelsTextColor="var(--bp-bg-base)"
                arcLabelsSkipAngle={15}
                onClick={(datum) =>
                  setFilteredCategoryId(
                    filteredCategoryId === datum.id ? null : String(datum.id)
                  )
                }
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateY: 36,
                    itemWidth: 80,
                    itemHeight: 14,
                    itemTextColor: 'var(--bp-text-secondary)',
                    symbolSize: 10,
                    symbolShape: 'circle',
                    itemsSpacing: 4,
                  },
                ]}
              />
            </div>
          ) : (
            <div
              style={{
                height: '180px',
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

      {/* Recent transactions */}
      <BpCard padding="md">
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--bp-text-secondary)',
            fontFamily: 'var(--bp-font-ui)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
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
          <tr
            key={t.id}
            style={{ borderBottom: '1px solid var(--bp-border)' }}
          >
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

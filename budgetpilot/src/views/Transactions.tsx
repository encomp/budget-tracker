import * as React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, Filter, Trash2, Pencil } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { TransactionModal } from '../components/TransactionModal'
import { BpCard } from '../components/ui/BpCard'
import { BpBadge } from '../components/ui/BpBadge'
import { BpButton } from '../components/ui/BpButton'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpInput } from '../components/ui/BpInput'
import { BpSelect } from '../components/ui/BpSelect'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpToast, useToast } from '../components/ui/BpToast'
import { db } from '../lib/db'
import { normalize } from '../lib/csv/categorize'
import { categoryNameToSlot } from '../lib/themeUtils'
import { ThemeIcon } from '../components/ThemeIcon'
import type { BpTransaction, BpCategory } from '../types'

export default function Transactions() {
  const activeMonth = useAppStore((s) => s.activeMonth)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const categories = useMonthCategories(activeMonth)
  const { toast, showToast, dismiss } = useToast()

  const [search, setSearch] = React.useState('')
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [filterCategory, setFilterCategory] = React.useState('')
  const [filterStart, setFilterStart] = React.useState('')
  const [filterEnd, setFilterEnd] = React.useState('')
  const [editTxn, setEditTxn] = React.useState<BpTransaction | undefined>(undefined)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const [swipedId, setSwipedId] = React.useState<string | null>(null)

  const allTxns = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray(),
    [],
    [] as BpTransaction[]
  )!

  const catMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    categories.forEach((c: BpCategory) => { m[c.id] = c.name })
    return m
  }, [categories])

  const filtered = React.useMemo(() => {
    return allTxns.filter((t) => {
      if (search && !t.note?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCategory && t.categoryId !== filterCategory) return false
      if (filterStart && t.date < filterStart) return false
      if (filterEnd && t.date > filterEnd) return false
      return true
    })
  }, [allTxns, search, filterCategory, filterStart, filterEnd])

  const filteredTotal = React.useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filtered]
  )

  async function handleDelete(id: string) {
    await db.transactions.delete(id)
    showToast('Transaction deleted.', 'info')
  }

  async function handleAssignCategory(txn: BpTransaction, categoryId: string) {
    await db.transactions.update(txn.id, { categoryId })
    await db.csvCategoryMap.put({
      normalizedDescription: normalize(txn.note || ''),
      categoryId,
    })
  }

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--bp-font-ui)', fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--bp-text-primary)' }}>
          Transactions
        </h1>
        {!isMobile && filtered.length > 0 && (
          <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '14px', color: 'var(--bp-text-muted)' }}>
            Filtered Total: <span style={{ color: 'var(--bp-danger)' }}>${filteredTotal.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--bp-text-muted)', pointerEvents: 'none' }} />
          <input
            data-testid="txn-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            style={{
              width: '100%',
              background: 'var(--bp-bg-surface-alt)',
              border: '1px solid var(--bp-border)',
              borderRadius: 'var(--bp-radius-sm)',
              color: 'var(--bp-text-primary)',
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '14px',
              padding: '8px 12px 8px 32px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <BpButton variant="secondary" size="sm" icon={<Filter size={13} />} onClick={() => setFilterOpen(!filterOpen)}>
          Filter
        </BpButton>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <BpCard padding="sm">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <BpSelect options={categoryOptions} value={filterCategory} onValueChange={setFilterCategory} placeholder="Category" />
            <BpInput type="date" label="From" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
            <BpInput type="date" label="To" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
            <BpButton variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setFilterStart(''); setFilterEnd('') }}>
              Clear
            </BpButton>
          </div>
        </BpCard>
      )}

      {/* Content */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? <EmptyState /> : filtered.map((t) => (
            <SwipeCard
              key={t.id}
              txn={t}
              catName={t.categoryId ? catMap[t.categoryId] : undefined}
              isSwipped={swipedId === t.id}
              onSwipe={() => setSwipedId(swipedId === t.id ? null : t.id)}
              onEdit={() => { setEditTxn(t); setModalOpen(true) }}
              onDelete={() => setDeleteTarget(t.id)}
              onAssignCategory={(catId) => handleAssignCategory(t, catId)}
              categoryOptions={categoryOptions.filter(o => o.value)}
            />
          ))}
        </div>
      ) : (
        <BpCard padding="md">
          <TxnTable
            txns={filtered}
            catMap={catMap}
            categoryOptions={categoryOptions.filter(o => o.value)}
            onEdit={(t) => { setEditTxn(t); setModalOpen(true) }}
            onDelete={(id) => setDeleteTarget(id)}
            onAssignCategory={handleAssignCategory}
          />
        </BpCard>
      )}

      <TransactionModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditTxn(undefined) }}
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
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); setDeleteTarget(null) }}
      />

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

function EmptyState() {
  return (
    <BpEmptyState
      heading="No transactions found"
      subtext="Try adjusting your filters or add a new transaction."
    />
  )
}

function SwipeCard({
  txn, catName, isSwipped, onSwipe, onEdit, onDelete, onAssignCategory: _onAssignCategory, categoryOptions: _categoryOptions,
}: {
  txn: BpTransaction; catName?: string; isSwipped: boolean; onSwipe: () => void
  onEdit: () => void; onDelete: () => void
  onAssignCategory: (id: string) => void; categoryOptions: { value: string; label: string }[]
}) {
  const touchStartX = React.useRef(0)

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--bp-radius-md)' }}>
      {/* Delete reveal */}
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '72px',
          background: 'var(--bp-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={onDelete}
      >
        <Trash2 size={20} style={{ color: '#fff' }} />
      </div>

      {/* Card */}
      <div
        style={{
          background: 'var(--bp-bg-surface-alt)',
          borderRadius: 'var(--bp-radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transform: isSwipped ? 'translateX(-72px)' : 'translateX(0)',
          transition: 'transform var(--bp-duration-fast) var(--bp-easing-default)',
          position: 'relative',
          zIndex: 1,
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => { const dx = touchStartX.current - e.changedTouches[0].clientX; if (dx > 40) onSwipe() }}
        onClick={() => { if (isSwipped) onSwipe(); else onEdit() }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--bp-text-primary)', fontFamily: 'var(--bp-font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {txn.note || 'No description'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            {txn.categoryId === null ? (
              <BpBadge variant="warning">Uncategorized</BpBadge>
            ) : catName ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ThemeIcon
                  slot={categoryNameToSlot(catName)}
                  size={14}
                  style={{ color: 'var(--bp-text-secondary)', flexShrink: 0 }}
                />
                <BpBadge variant="default">{catName}</BpBadge>
              </span>
            ) : null}
            <span style={{ fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)' }}>{txn.date}</span>
          </div>
        </div>
        <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '15px', fontWeight: 500, color: txn.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)', flexShrink: 0 }}>
          {txn.type === 'expense' ? '-' : '+'}${txn.amount.toFixed(2)}
        </span>
        <BpBadge variant={txn.importSource === 'csv' ? 'csv' : 'manual'} />
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)', fontSize: '12px', color: 'var(--bp-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.04em', padding: '6px 10px',
  textAlign: 'left', borderBottom: '1px solid var(--bp-border)',
}
const tdStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-primary)',
  padding: '10px 10px', borderBottom: '1px solid var(--bp-border)',
}

function TxnTable({
  txns, catMap, categoryOptions, onEdit, onDelete, onAssignCategory,
}: {
  txns: BpTransaction[]; catMap: Record<string, string>
  categoryOptions: { value: string; label: string }[]
  onEdit: (t: BpTransaction) => void; onDelete: (id: string) => void
  onAssignCategory: (txn: BpTransaction, catId: string) => void
}) {
  if (txns.length === 0) return <EmptyState />

  return (
    <table data-testid="transactions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={thStyle}>Date</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Description</th>
          <th style={thStyle}>Note</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
          <th style={thStyle}>Source</th>
          <th style={thStyle} />
        </tr>
      </thead>
      <tbody>
        {txns.map((t) => (
          <tr key={t.id} data-testid="transaction-row">
            <td style={tdStyle}>{t.date}</td>
            <td style={tdStyle}>
              {t.categoryId === null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BpBadge variant="warning" data-testid="badge-uncategorized">Uncategorized</BpBadge>
                  <BpSelect
                    options={categoryOptions}
                    value=""
                    onValueChange={(catId) => onAssignCategory(t, catId)}
                    placeholder="Assign…"
                  />
                </div>
              ) : catMap[t.categoryId] ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ThemeIcon
                    slot={categoryNameToSlot(catMap[t.categoryId])}
                    size={14}
                    style={{ color: 'var(--bp-text-secondary)', flexShrink: 0 }}
                  />
                  <BpBadge variant="default">{catMap[t.categoryId]}</BpBadge>
                </span>
              ) : (
                <BpBadge variant="muted">Unknown</BpBadge>
              )}
            </td>
            <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(t.note || '—').slice(0, 30)}
            </td>
            <td style={{ ...tdStyle, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--bp-text-muted)' }}>
              {(t.note || '').slice(0, 20) || '—'}
            </td>
            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--bp-font-mono)', color: t.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)' }}>
              {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
            </td>
            <td style={tdStyle}>
              <BpBadge variant={t.importSource === 'csv' ? 'csv' : 'manual'} data-testid="badge-source" />
            </td>
            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <IconBtn onClick={() => onEdit(t)} label="Edit"><Pencil size={13} /></IconBtn>
                <IconBtn onClick={() => onDelete(t.id)} label="Delete" danger><Trash2 size={13} /></IconBtn>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function IconBtn({ onClick, label, danger, children }: { onClick: () => void; label: string; danger?: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button onClick={onClick} aria-label={label} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? (danger ? 'var(--bp-danger-muted)' : 'var(--bp-accent-muted)') : 'transparent', border: 'none', borderRadius: 'var(--bp-radius-sm)', color: danger ? 'var(--bp-danger)' : 'var(--bp-text-muted)', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'background var(--bp-duration-fast) var(--bp-easing-default)' }}>
      {children}
    </button>
  )
}

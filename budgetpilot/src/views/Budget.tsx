import * as React from 'react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { categoryNameToSlot } from '../lib/themeUtils'
import { ThemeIcon } from '../components/ThemeIcon'
import { useAppStore } from '../store/useAppStore'
import { useActiveBudget } from '../hooks/useActiveBudget'
import { useCategorySpend } from '../hooks/useCategorySpend'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpInput } from '../components/ui/BpInput'
import { BpProgressBar } from '../components/ui/BpProgressBar'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpToast, useToast } from '../components/ui/BpToast'
import { clampAllocationSliders } from '../lib/calculations'
import { ONBOARDING_CATEGORIES } from '../lib/defaults'
import { db } from '../lib/db'
import type { BpBudget, BpCategory, AllocationGroup } from '../types'

const GROUP_LABELS: Record<AllocationGroup, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
}

const GROUP_COLORS: Record<AllocationGroup, string> = {
  needs: 'var(--bp-accent)',
  wants: 'var(--bp-warning)',
  savings: 'var(--bp-positive)',
}

function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const date = parseISO(`${month}-01`)
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
        {format(date, 'MMMM yyyy')}
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

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--bp-text-muted)',
  cursor: 'pointer',
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 'var(--bp-radius-sm)',
}

function CategoryRow({
  category,
  month,
  onRename,
  onDelete,
  onLimitChange,
}: {
  category: BpCategory
  month: string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onLimitChange: (id: string, limit: number) => void
}) {
  const spend = useCategorySpend(month, category.id)
  const [editing, setEditing] = React.useState(false)
  const [nameVal, setNameVal] = React.useState(category.name)
  const [limitVal, setLimitVal] = React.useState('0')

  React.useEffect(() => { setNameVal(category.name) }, [category.name])
  React.useEffect(() => { if (spend !== undefined) setLimitVal(String(spend.limit)) }, [spend?.limit])

  return (
    <div
      data-testid={`category-row-${category.id}`}
      style={{
        background: 'var(--bp-bg-surface-alt)',
        borderRadius: 'var(--bp-radius-md)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {editing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={() => { onRename(category.id, nameVal.trim() || category.name); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onRename(category.id, nameVal.trim() || category.name); setEditing(false) } }}
            style={{
              flex: 1,
              background: 'var(--bp-bg-surface)',
              border: '1px solid var(--bp-accent)',
              borderRadius: 'var(--bp-radius-sm)',
              color: 'var(--bp-text-primary)',
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '13px',
              padding: '4px 8px',
              outline: 'none',
            }}
          />
        ) : (
          <span
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => setEditing(true)}
          >
            <ThemeIcon
              slot={categoryNameToSlot(category.name)}
              size={16}
              style={{ color: 'var(--bp-text-secondary)', flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--bp-text-primary)', fontFamily: 'var(--bp-font-ui)' }}>
              {category.name}
            </span>
          </span>
        )}
        <input
          type="number"
          min="0"
          step="1"
          value={limitVal}
          onChange={(e) => setLimitVal(e.target.value)}
          onBlur={() => onLimitChange(category.id, parseFloat(limitVal) || 0)}
          style={{
            width: '80px',
            background: 'var(--bp-bg-surface)',
            border: '1px solid var(--bp-border)',
            borderRadius: 'var(--bp-radius-sm)',
            color: 'var(--bp-text-primary)',
            fontFamily: 'var(--bp-font-mono)',
            fontSize: '13px',
            padding: '4px 8px',
            textAlign: 'right',
            outline: 'none',
          }}
        />
        <button onClick={() => setEditing(true)} aria-label="Rename" style={iconBtnStyle}>
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(category.id)} aria-label="Delete" style={{ ...iconBtnStyle, color: 'var(--bp-danger)' }}>
          <Trash2 size={12} />
        </button>
      </div>
      <BpProgressBar
        value={spend?.pct ?? 0}
        data-testid={spend !== undefined ? `progress-bar-${category.id}` : undefined}
        aria-valuenow={spend !== undefined ? Math.round(spend.pct) : undefined}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-mono)' }}>
        <span>${(spend?.spent ?? 0).toFixed(0)} spent</span>
        <span>${(spend?.limit ?? 0).toFixed(0)} limit</span>
      </div>
    </div>
  )
}

function GroupSection({
  group, budget, month, isMobile, onRename, onDelete, onAddCategory, onLimitChange,
}: {
  group: AllocationGroup; budget: BpBudget; month: string; isMobile: boolean
  onRename: (id: string, name: string) => void; onDelete: (id: string) => void
  onAddCategory: (group: AllocationGroup) => void; onLimitChange: (id: string, limit: number) => void
}) {
  const [collapsed, setCollapsed] = React.useState(false)
  const groupCats = (budget.categories ?? []).filter((c) => c.group === group)
  const alloc = budget.allocation[group]
  const amount = Math.round((budget.monthlyIncome * alloc) / 100)

  const headerContent = (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile && !collapsed ? '12px' : '0', cursor: isMobile ? 'pointer' : 'default' }}
      onClick={isMobile ? () => setCollapsed(!collapsed) : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: GROUP_COLORS[group], flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--bp-text-primary)' }}>
          {GROUP_LABELS[group]}
        </span>
        <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '12px', color: GROUP_COLORS[group] }}>
          {alloc}% · ${amount.toLocaleString()}
        </span>
      </div>
      {isMobile && <div style={{ color: 'var(--bp-text-muted)' }}>{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</div>}
    </div>
  )

  const bodyContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {groupCats.map((cat) => (
        <CategoryRow key={cat.id} category={cat} month={month} onRename={onRename} onDelete={onDelete} onLimitChange={onLimitChange} />
      ))}
      <BpButton variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => onAddCategory(group)} data-testid={`add-category-${group}`}>
        Add Category
      </BpButton>
    </div>
  )

  if (isMobile) {
    return (
      <BpCard padding="md">
        {headerContent}
        {!collapsed && bodyContent}
      </BpCard>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {headerContent}
      {bodyContent}
    </div>
  )
}

export default function Budget() {
  const activeMonth = useAppStore((s) => s.activeMonth)
  const setActiveMonth = useAppStore((s) => s.setActiveMonth)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const budget = useActiveBudget(activeMonth)
  const { toast, showToast, dismiss } = useToast()
  const [income, setIncome] = React.useState('')
  const [sliders, setSliders] = React.useState({ needs: 50, wants: 30, savings: 20 })
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (budget) {
      setIncome(String(budget.monthlyIncome || ''))
      setSliders(budget.allocation)
    }
  }, [budget])

  async function ensureMonthBudget(): Promise<BpBudget> {
    const existing = await db.budgets.where('month').equals(activeMonth).first()
    if (existing) return existing

    const prior = await db.budgets.orderBy('month').reverse().filter(b => b.month < activeMonth).first()

    const newBudget: Omit<BpBudget, 'id'> = prior
      ? {
          month: activeMonth,
          monthlyIncome: prior.monthlyIncome,
          allocation: prior.allocation,
          categoryLimits: (prior.categories ?? []).map((c) => ({ categoryId: c.id, limit: 0 })),
          categories: prior.categories ?? [],
        }
      : {
          month: activeMonth,
          monthlyIncome: 0,
          allocation: { needs: 50, wants: 30, savings: 20 },
          categoryLimits: [],
          categories: ONBOARDING_CATEGORIES.map((c) => ({ id: crypto.randomUUID(), name: c.name, group: c.group })),
        }

    const id = await db.budgets.add(newBudget as BpBudget)
    showToast('New month created. Customize your budget below.', 'info')
    return { ...newBudget, id } as BpBudget
  }

  async function updateBudgetField(patch: Partial<Omit<BpBudget, 'id'>>) {
    const current = await ensureMonthBudget()
    if (current.id == null) return
    await db.budgets.update(current.id, patch)
  }

  async function handleIncomeBlur() {
    await updateBudgetField({ monthlyIncome: parseFloat(income) || 0 })
  }

  function handleSliderChange(key: 'needs' | 'wants' | 'savings', value: number) {
    setSliders(clampAllocationSliders(key, value, sliders))
  }

  async function handleSliderCommit() {
    await updateBudgetField({ allocation: sliders })
  }

  async function handleAddCategory(group: AllocationGroup) {
    const current = await ensureMonthBudget()
    if (current.id == null) return
    const newCat: BpCategory = { id: crypto.randomUUID(), name: 'New Category', group }
    await db.budgets.update(current.id, {
      categories: [...(current.categories ?? []), newCat],
      categoryLimits: [...(current.categoryLimits ?? []), { categoryId: newCat.id, limit: 0 }],
    })
  }

  async function handleRenameCategory(id: string, name: string) {
    const current = await ensureMonthBudget()
    if (current.id == null) return
    await db.budgets.update(current.id, {
      categories: (current.categories ?? []).map((c) => c.id === id ? { ...c, name } : c),
    })
  }

  async function handleDeleteCategory(id: string) {
    const current = await ensureMonthBudget()
    if (current.id == null) return
    await db.budgets.update(current.id, {
      categories: (current.categories ?? []).filter((c) => c.id !== id),
      categoryLimits: (current.categoryLimits ?? []).filter((cl) => cl.categoryId !== id),
    })
    await db.csvCategoryMap.where('categoryId').equals(id).delete()
  }

  async function handleLimitChange(categoryId: string, limit: number) {
    const current = await ensureMonthBudget()
    if (current.id == null) return
    const updatedLimits = [...(current.categoryLimits ?? [])]
    const idx = updatedLimits.findIndex((cl) => cl.categoryId === categoryId)
    if (idx >= 0) updatedLimits[idx] = { ...updatedLimits[idx], limit }
    else updatedLimits.push({ categoryId, limit })
    await db.budgets.update(current.id, { categoryLimits: updatedLimits })
  }

  const incomeNum = parseFloat(income) || 0
  const leftToAssign = incomeNum - Math.round(incomeNum * (sliders.needs + sliders.wants + sliders.savings) / 100)
  const groups: AllocationGroup[] = ['needs', 'wants', 'savings']

  if (!budget) return null

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--bp-font-ui)', fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--bp-text-primary)' }}>
          Budget Planner
        </h1>
        <MonthPicker month={activeMonth} onChange={setActiveMonth} />
      </div>

      {/* Mobile sticky income-left card */}
      {isMobile && (
        <BpCard padding="sm">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-secondary)' }}>Income Left to Assign</span>
            <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '18px', fontWeight: 600, color: leftToAssign < 0 ? 'var(--bp-danger)' : 'var(--bp-accent)' }}>
              ${leftToAssign.toLocaleString()}
            </span>
          </div>
        </BpCard>
      )}

      {/* Income + sliders card */}
      <BpCard padding="md">
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', alignItems: isMobile ? 'stretch' : 'flex-start' }}>
          <div style={{ flex: '0 0 auto', minWidth: '200px' }}>
            <BpInput mono label="Expected Monthly Income" type="number" min="0" step="100" value={income} onChange={(e) => setIncome(e.target.value)} onBlur={handleIncomeBlur} placeholder="0" data-testid="budget-income-input" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groups.map((key) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: GROUP_COLORS[key], fontFamily: 'var(--bp-font-ui)', fontWeight: 500 }}>
                    {GROUP_LABELS[key]} (<span data-testid={`allocation-value-${key}`}>{sliders[key]}</span>%)
                  </span>
                  <span style={{ fontSize: '13px', fontFamily: 'var(--bp-font-mono)', color: GROUP_COLORS[key] }}>
                    ${Math.round(incomeNum * sliders[key] / 100).toLocaleString()}
                  </span>
                </div>
                <input
                  data-testid={`slider-${key}`}
                  type="range" min={0} max={100} step={1} value={sliders[key]}
                  onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                  onMouseUp={handleSliderCommit} onTouchEnd={handleSliderCommit}
                  style={{ width: '100%', accentColor: GROUP_COLORS[key], cursor: 'pointer', height: '44px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </BpCard>

      {/* Empty categories state */}
      {(budget.categories ?? []).length === 0 && (
        <BpEmptyState
          heading="Add categories to start tracking spending"
          subtext="Use the Add Category buttons below each group to create budget categories."
        />
      )}

      {/* Category groups */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map((g) => (
            <GroupSection key={g} group={g} budget={budget} month={activeMonth} isMobile onRename={handleRenameCategory} onDelete={(id) => setDeleteTarget(id)} onAddCategory={handleAddCategory} onLimitChange={handleLimitChange} />
          ))}
        </div>
      ) : (
        <BpCard padding="md">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {groups.map((g) => (
              <GroupSection key={g} group={g} budget={budget} month={activeMonth} isMobile={false} onRename={handleRenameCategory} onDelete={(id) => setDeleteTarget(id)} onAddCategory={handleAddCategory} onLimitChange={handleLimitChange} />
            ))}
          </div>
        </BpCard>
      )}

      <BpConfirmDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete category?" description="This will remove the category and its spending limit." confirmLabel="Delete" variant="danger" onConfirm={() => { if (deleteTarget) handleDeleteCategory(deleteTarget); setDeleteTarget(null) }} />
      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { ResponsiveBar } from '@nivo/bar'
import { Pencil, Trash2, CreditCard } from 'lucide-react'
import { useDebtList } from '../hooks/useDebtList'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNivoTheme } from '../components/ui/NivoTheme'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpModal } from '../components/ui/BpModal'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpInput } from '../components/ui/BpInput'
import { BpToast, useToast } from '../components/ui/BpToast'
import { DebtSlider } from '../components/DebtSlider'
import { DebtSchema, type DebtFormValues } from '../lib/schemas'
import { calculateSnowball, calculateAvalanche, calculateInterestSaved } from '../lib/calculations'
import { db } from '../lib/db'
import type { BpDebt } from '../types'

function MetricPill({
  label,
  value,
  valueColor,
  testId,
  valueTestId,
}: {
  label: string
  value: string
  valueColor?: string
  testId?: string
  valueTestId?: string
}) {
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'var(--bp-bg-surface)',
        border: '1px solid var(--bp-border)',
        borderRadius: 'var(--bp-radius-md)',
        minWidth: '140px',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--bp-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'var(--bp-font-ui)',
        }}
      >
        {label}
      </span>
      <span
        data-testid={valueTestId}
        style={{
          fontSize: '18px',
          fontFamily: 'var(--bp-font-mono)',
          fontWeight: 500,
          color: valueColor ?? 'var(--bp-text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

interface DebtFormProps {
  initial?: BpDebt
  onSave: () => void
  onCancel: () => void
}

function DebtForm({ initial, onSave, onCancel }: DebtFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(DebtSchema),
    defaultValues: initial
      ? { name: initial.name, balance: initial.balance, apr: initial.apr, minPayment: initial.minPayment }
      : undefined,
  })

  const onSubmit = async (data: DebtFormValues) => {
    if (initial) {
      await db.debts.update(initial.id, data)
    } else {
      await db.debts.add({ id: crypto.randomUUID(), ...data })
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <BpInput
        label="Debt Name"
        placeholder="e.g. Visa, Car Loan"
        error={errors.name?.message}
        {...register('name')}
      />
      <BpInput
        label="Balance ($)"
        type="number"
        step="0.01"
        mono
        placeholder="3000.00"
        error={errors.balance?.message}
        {...register('balance', { valueAsNumber: true })}
      />
      <BpInput
        label="APR (%)"
        type="number"
        step="0.01"
        mono
        placeholder="19.99"
        error={errors.apr?.message}
        {...register('apr', { valueAsNumber: true })}
      />
      <BpInput
        label="Minimum Payment ($)"
        type="number"
        step="0.01"
        mono
        placeholder="60.00"
        error={errors.minPayment?.message}
        {...register('minPayment', { valueAsNumber: true })}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <BpButton variant="ghost" onClick={onCancel} type="button">Cancel</BpButton>
        <BpButton variant="primary" loading={isSubmitting} type="submit">
          {initial ? 'Save Changes' : 'Add Debt'}
        </BpButton>
      </div>
    </form>
  )
}

export default function Debts() {
  const debts = useDebtList()
  const breakpoint = useBreakpoint()
  const nivoTheme = useNivoTheme()
  const { toast, showToast, dismiss } = useToast()

  const [method, setMethod] = React.useState<'snowball' | 'avalanche'>('snowball')
  const [extraPayment, setExtraPayment] = React.useState(0)
  const [addingDebt, setAddingDebt] = React.useState(false)
  const [editingDebt, setEditingDebt] = React.useState<BpDebt | null>(null)
  const [deletingDebtId, setDeletingDebtId] = React.useState<string | null>(null)

  const payoffSchedule = React.useMemo(() => {
    if (!debts.length) return []
    return method === 'snowball'
      ? calculateSnowball(debts, extraPayment)
      : calculateAvalanche(debts, extraPayment)
  }, [debts, extraPayment, method])

  const interestComparison = React.useMemo(
    () =>
      debts.length
        ? calculateInterestSaved(debts, extraPayment, method)
        : { totalInterestMethod: 0, totalInterestMinOnly: 0, saved: 0 },
    [debts, extraPayment, method]
  )

  const sortedDebts = React.useMemo(() => {
    if (method === 'snowball') return [...debts].sort((a, b) => a.balance - b.balance)
    return [...debts].sort((a, b) => b.apr - a.apr)
  }, [debts, method])

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const sliderMax = Math.max(500, Math.round(totalDebt * 0.1 / 25) * 25)

  const debtFreeDate = payoffSchedule.length
    ? payoffSchedule[payoffSchedule.length - 1]?.payoffDate
    : null

  const chartData = payoffSchedule.map((e) => ({
    debt: e.debtName,
    months: e.monthsToPayoff,
  }))

  const handleDelete = async (id: string) => {
    await db.debts.delete(id)
    showToast('Debt removed.', 'info')
    setDeletingDebtId(null)
  }

  const isMobile = breakpoint === 'mobile'
  const isDesktop = breakpoint === 'desktop'

  if (!debts.length) {
    return (
      <div style={{ padding: '2rem', color: 'var(--bp-text-primary)' }}>
        <BpEmptyState
          icon={<CreditCard size={48} />}
          heading="No debts tracked yet"
          subtext="Add your debts to start planning your payoff strategy."
          action={{ label: 'Add Your First Debt', onClick: () => setAddingDebt(true) }}
        />
        <BpModal
          open={addingDebt}
          onOpenChange={setAddingDebt}
          title="Add Debt"
          size="sm"
        >
          <DebtForm onSave={() => setAddingDebt(false)} onCancel={() => setAddingDebt(false)} />
        </BpModal>
        <BpToast {...toast} onDismiss={dismiss} />
      </div>
    )
  }

  const summaryBar = (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: isMobile ? 'center' : 'flex-start',
        marginBottom: '24px',
      }}
    >
      <MetricPill
        label="Total Debt"
        value={`$${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <MetricPill
        label="Interest Saved"
        value={`$${interestComparison.saved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        valueColor="var(--bp-positive)"
        valueTestId="interest-saved-value"
      />
      <MetricPill
        label="Debt-Free Date"
        value={debtFreeDate ? format(parseISO(debtFreeDate), 'MMM yyyy') : '—'}
        valueTestId="debt-free-date"
      />
    </div>
  )

  const methodToggle = (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
      <BpButton
        variant={method === 'snowball' ? 'primary' : 'secondary'}
        onClick={() => setMethod('snowball')}
        size="sm"
        data-testid="method-toggle-snowball"
      >
        Snowball
      </BpButton>
      <BpButton
        variant={method === 'avalanche' ? 'primary' : 'secondary'}
        onClick={() => setMethod('avalanche')}
        size="sm"
        data-testid="method-toggle-avalanche"
      >
        Avalanche
      </BpButton>
      <div style={{ flex: 1 }} />
      <BpButton variant="secondary" size="sm" onClick={() => setAddingDebt(true)}>
        + Add Debt
      </BpButton>
    </div>
  )

  const debtList = (
    <div
      data-testid="debt-list"
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr',
        gap: '12px',
        overflowY: isDesktop ? 'auto' : undefined,
        maxHeight: isDesktop ? 'calc(100vh - 320px)' : undefined,
        paddingRight: isDesktop ? '4px' : undefined,
      }}
    >
      {sortedDebts.map((debt) => (
        <BpCard key={debt.id} padding="sm" data-testid={`debt-card-${debt.id}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--bp-font-ui)', fontWeight: 600, color: 'var(--bp-text-primary)', fontSize: '14px' }}>
                {debt.name}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setEditingDebt(debt)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bp-text-muted)', padding: '2px' }}
                  aria-label="Edit debt"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeletingDebtId(debt.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bp-danger)', padding: '2px' }}
                  aria-label="Delete debt"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '16px', color: 'var(--bp-text-primary)' }}>
              ${debt.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-mono)' }}>
              <span>{debt.apr}% APR</span>
              <span>${debt.minPayment}/mo min</span>
            </div>
          </div>
        </BpCard>
      ))}
    </div>
  )

  const barChart = (
    <div data-testid="chart-payoff" style={{ height: isMobile ? '200px' : '320px', width: '100%' }}>
      {chartData.length > 0 && (
        <ResponsiveBar
          data={chartData}
          keys={['months']}
          indexBy="debt"
          theme={nivoTheme}
          colors={['var(--bp-accent)']}
          animate
          motionConfig="wobbly"
          axisBottom={{ tickRotation: chartData.length > 4 ? -30 : 0 }}
          axisLeft={{ legend: 'Months', legendOffset: -40, legendPosition: 'middle' }}
          enableLabel={false}
          borderRadius={4}
          padding={0.3}
          margin={{ top: 16, right: 16, bottom: 48, left: 56 }}
          tooltip={({ data, value }) => (
            <div
              style={{
                background: 'var(--bp-bg-surface)',
                border: '1px solid var(--bp-border)',
                borderRadius: 'var(--bp-radius-sm)',
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--bp-text-primary)',
                fontFamily: 'var(--bp-font-ui)',
              }}
            >
              <strong>{data.debt}</strong>: {value} months
            </div>
          )}
        />
      )}
    </div>
  )

  const sliderCard = (
    <BpCard padding="md">
      <DebtSlider
        value={extraPayment}
        min={0}
        max={sliderMax}
        step={25}
        onChange={setExtraPayment}
      />
    </BpCard>
  )

  const content = isDesktop ? (
    // Desktop: 40/60 split
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 220px)' }}>
      <div style={{ flex: '0 0 40%', overflowY: 'auto' }}>
        {debtList}
      </div>
      <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {barChart}
        {sliderCard}
      </div>
    </div>
  ) : isMobile ? (
    // Mobile: chart → debt cards → sticky slider at bottom
    <div style={{ paddingBottom: '120px' }}>
      {barChart}
      <div style={{ marginTop: '16px' }}>
        {debtList}
      </div>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--bp-bg-base)',
          padding: '16px',
          paddingBottom: '80px',
          borderTop: '1px solid var(--bp-border)',
          marginTop: '16px',
          marginLeft: '-16px',
          marginRight: '-16px',
        }}
      >
        <DebtSlider
          value={extraPayment}
          min={0}
          max={sliderMax}
          step={25}
          onChange={setExtraPayment}
        />
      </div>
    </div>
  ) : (
    // Tablet: full-width chart → slider card → 2-col debt grid
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {barChart}
      {sliderCard}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {debts.map((debt) => (
          <BpCard key={debt.id} padding="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--bp-font-ui)', fontWeight: 600, color: 'var(--bp-text-primary)', fontSize: '14px' }}>
                  {debt.name}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setEditingDebt(debt)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bp-text-muted)', padding: '2px' }}
                    aria-label="Edit debt"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingDebtId(debt.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bp-danger)', padding: '2px' }}
                    aria-label="Delete debt"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '16px', color: 'var(--bp-text-primary)' }}>
                ${debt.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-mono)' }}>
                <span>{debt.apr}% APR</span>
                <span>${debt.minPayment}/mo min</span>
              </div>
            </div>
          </BpCard>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', color: 'var(--bp-text-primary)' }}>
      <h1
        style={{
          fontFamily: 'var(--bp-font-ui)',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--bp-text-primary)',
        }}
      >
        Debt Payoff Planner
      </h1>

      {summaryBar}
      {methodToggle}
      {content}

      {/* Add Debt Modal */}
      <BpModal
        open={addingDebt}
        onOpenChange={setAddingDebt}
        title="Add Debt"
        size="sm"
      >
        <DebtForm onSave={() => setAddingDebt(false)} onCancel={() => setAddingDebt(false)} />
      </BpModal>

      {/* Edit Debt Modal */}
      <BpModal
        open={editingDebt !== null}
        onOpenChange={(open) => { if (!open) setEditingDebt(null) }}
        title="Edit Debt"
        size="sm"
      >
        {editingDebt && (
          <DebtForm
            initial={editingDebt}
            onSave={() => setEditingDebt(null)}
            onCancel={() => setEditingDebt(null)}
          />
        )}
      </BpModal>

      {/* Delete Confirm */}
      <BpConfirmDialog
        open={deletingDebtId !== null}
        onOpenChange={(open) => { if (!open) setDeletingDebtId(null) }}
        title="Delete Debt"
        description="This debt will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deletingDebtId) handleDelete(deletingDebtId) }}
      />

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

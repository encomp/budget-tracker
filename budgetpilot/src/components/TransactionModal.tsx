import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { BpModal } from './ui/BpModal'
import { BpButton } from './ui/BpButton'
import { BpInput } from './ui/BpInput'
import { BpSelect } from './ui/BpSelect'
import { BpToast, useToast } from './ui/BpToast'
import { AnimatedIcon } from './ui/AnimatedIcon'
import { TransactionSchema, type TransactionFormValues } from '../lib/schemas'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { db } from '../lib/db'
import type { BpTransaction } from '../types'

export interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeMonth: string
  editTransaction?: BpTransaction
  testId?: string
}

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫']

export function TransactionModal({
  open,
  onOpenChange,
  activeMonth,
  editTransaction,
  testId,
}: TransactionModalProps) {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const categories = useMonthCategories(activeMonth)
  const { toast, showToast, dismiss } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [numpadAmount, setNumpadAmount] = React.useState('0')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      date: editTransaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
      amount: editTransaction?.amount ?? 0,
      type: editTransaction?.type ?? 'expense',
      categoryId: editTransaction?.categoryId ?? '',
      note: editTransaction?.note ?? '',
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        date: editTransaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
        amount: editTransaction?.amount ?? 0,
        type: editTransaction?.type ?? 'expense',
        categoryId: editTransaction?.categoryId ?? '',
        note: editTransaction?.note ?? '',
      })
      setNumpadAmount(editTransaction ? String(editTransaction.amount) : '0')
    }
  }, [open, editTransaction, reset])

  function handleNumpadKey(key: string) {
    setNumpadAmount((prev) => {
      if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0'
      if (key === '.' && prev.includes('.')) return prev
      if (prev === '0' && key !== '.') return key
      const next = prev + key
      if (next.split('.')[1]?.length > 2) return prev
      return next
    })
  }

  React.useEffect(() => {
    const parsed = parseFloat(numpadAmount)
    if (!isNaN(parsed)) setValue('amount', parsed)
  }, [numpadAmount, setValue])

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  async function onSubmit(values: TransactionFormValues) {
    setSaving(true)
    try {
      if (editTransaction) {
        await db.transactions.update(editTransaction.id, {
          ...values,
          importSource: editTransaction.importSource,
        })
      } else {
        await db.transactions.add({
          id: crypto.randomUUID(),
          ...values,
          importSource: 'manual',
        })
      }
      showToast(editTransaction ? 'Transaction updated.' : 'Transaction added.', 'success')
      setTimeout(() => {
        onOpenChange(false)
      }, 800)
    } finally {
      setSaving(false)
    }
  }

  if (isMobile) {
    if (!open) return null
    return (
      <>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bp-bg-overlay)',
            zIndex: 99,
          }}
          onClick={() => onOpenChange(false)}
        />
        <div
          data-testid={testId}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bp-bg-surface)',
            borderRadius: 'var(--bp-radius-lg) var(--bp-radius-lg) 0 0',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90dvh',
            overflow: 'hidden',
          }}
        >
          {/* Mobile sheet header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px 8px',
              borderBottom: '1px solid var(--bp-border)',
            }}
          >
            <button
              data-testid="txn-cancel"
              onClick={() => onOpenChange(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--bp-text-muted)',
                fontFamily: 'var(--bp-font-ui)',
                fontSize: '15px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Cancel
            </button>
            <span
              style={{
                color: 'var(--bp-text-primary)',
                fontFamily: 'var(--bp-font-ui)',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </span>
            <BpButton
              data-testid="txn-save"
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSubmit(onSubmit)}
            >
              {saving ? '' : 'Add'}
            </BpButton>
          </div>

          {/* Currency display */}
          <div
            style={{
              textAlign: 'center',
              padding: '20px 20px 8px',
              fontFamily: 'var(--bp-font-mono)',
              fontSize: '48px',
              fontWeight: 500,
              color: 'var(--bp-text-primary)',
              letterSpacing: '-1px',
            }}
          >
            ${numpadAmount}
          </div>
          {/* Visually hidden input so Playwright can fill the amount via data-testid="txn-amount" */}
          <input
            data-testid="txn-amount"
            type="text"
            value={numpadAmount}
            onChange={(e) => setNumpadAmount(e.target.value || '0')}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              opacity: 0.01,
              border: 'none',
              padding: 0,
              overflow: 'hidden',
            }}
          />

          {/* Type toggle */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '0 20px 12px',
                  justifyContent: 'center',
                }}
              >
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    data-testid={t === 'expense' ? 'txn-type-expense' : 'txn-type-income'}
                    onClick={() => field.onChange(t)}
                    style={{
                      flex: 1,
                      maxWidth: '140px',
                      padding: '10px',
                      borderRadius: 'var(--bp-radius-md)',
                      border: '1px solid var(--bp-border)',
                      background:
                        field.value === t ? 'var(--bp-accent)' : 'var(--bp-bg-surface-alt)',
                      color: field.value === t ? 'var(--bp-bg-base)' : 'var(--bp-text-secondary)',
                      fontFamily: 'var(--bp-font-ui)',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          />

          {/* Category + Date */}
          <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <BpSelect
                  data-testid="txn-category"
                  options={categoryOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Category"
                />
              )}
            />
            {errors.categoryId && (
              <span style={{ fontSize: '12px', color: 'var(--bp-danger)' }}>
                {errors.categoryId.message}
              </span>
            )}
            <BpInput type="date" {...register('date')} error={errors.date?.message} />
          </div>

          {/* Numeric keypad */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--bp-border)',
              borderTop: '1px solid var(--bp-border)',
              flex: 1,
            }}
          >
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleNumpadKey(key)}
                style={{
                  background: 'var(--bp-bg-surface)',
                  border: 'none',
                  color: 'var(--bp-text-primary)',
                  fontFamily: key === '⌫' ? 'system-ui' : 'var(--bp-font-mono)',
                  fontSize: '22px',
                  padding: '18px',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  margin: '1px',
                  transition: 'background var(--bp-duration-fast) var(--bp-easing-default)',
                }}
                onMouseDown={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bp-bg-surface-alt)'
                }}
                onMouseUp={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bp-bg-surface)'
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <BpToast {...toast} onDismiss={dismiss} />
      </>
    )
  }

  // Desktop/tablet modal
  const footer = (
    <>
      <BpButton variant="ghost" onClick={() => onOpenChange(false)} data-testid="txn-cancel">
        Cancel
      </BpButton>
      <BpButton variant="primary" loading={saving} onClick={handleSubmit(onSubmit)} data-testid="txn-save">
        {saving ? '' : editTransaction ? 'Save Changes' : 'Add Transaction'}
      </BpButton>
    </>
  )

  return (
    <>
      <BpModal
        open={open}
        onOpenChange={onOpenChange}
        title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="md"
        footer={footer}
        data-testid={testId}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Type toggle */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['expense', 'income'] as const).map((t) => (
                  <BpButton
                    key={t}
                    variant={field.value === t ? 'primary' : 'ghost'}
                    onClick={() => field.onChange(t)}
                    data-testid={t === 'expense' ? 'txn-type-expense' : 'txn-type-income'}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </BpButton>
                ))}
              </div>
            )}
          />

          {/* Amount */}
          <BpInput
            mono
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            data-testid="txn-amount"
            {...register('amount', { valueAsNumber: true })}
          />

          {/* Date */}
          <BpInput
            label="Date"
            type="date"
            error={errors.date?.message}
            data-testid="txn-date"
            {...register('date')}
          />

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontSize: '13px',
                color: 'var(--bp-text-secondary)',
                fontFamily: 'var(--bp-font-ui)',
              }}
            >
              Category
            </label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <BpSelect
                  options={categoryOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select category..."
                  data-testid="txn-category"
                />
              )}
            />
            {errors.categoryId && (
              <span style={{ fontSize: '12px', color: 'var(--bp-danger)' }}>
                {errors.categoryId.message}
              </span>
            )}
          </div>

          {/* Note */}
          <BpInput
            label="Note (optional)"
            placeholder="What was this for?"
            data-testid="txn-note"
            {...register('note')}
          />

          {saving && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bp-text-muted)' }}>
              <AnimatedIcon type="LoaderCircle" size={16} />
              <span style={{ fontSize: '13px', fontFamily: 'var(--bp-font-ui)' }}>Saving…</span>
            </div>
          )}
        </form>
      </BpModal>

      <BpToast {...toast} onDismiss={dismiss} />
    </>
  )
}

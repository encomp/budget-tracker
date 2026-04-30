import * as React from 'react'

export type BpBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'csv' | 'manual'

export interface BpBadgeProps {
  variant?: BpBadgeVariant
  children?: React.ReactNode
  className?: string
}

const variantStyles: Record<BpBadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--bp-accent-muted)', color: 'var(--bp-accent)' },
  success: { background: 'var(--bp-positive-muted)', color: 'var(--bp-positive)' },
  warning: { background: 'var(--bp-warning-muted)', color: 'var(--bp-warning)' },
  danger: { background: 'var(--bp-danger-muted)', color: 'var(--bp-danger)' },
  muted: { background: 'var(--bp-bg-surface-alt)', color: 'var(--bp-text-muted)' },
  csv: { background: 'var(--bp-warning-muted)', color: 'var(--bp-warning)' },
  manual: { background: 'var(--bp-accent-muted)', color: 'var(--bp-accent)' },
}

const fixedLabels: Partial<Record<BpBadgeVariant, string>> = {
  csv: 'CSV',
  manual: 'Manual',
}

export function BpBadge({ variant = 'default', children, className }: BpBadgeProps) {
  const label = fixedLabels[variant] ?? children

  const style: React.CSSProperties = {
    ...variantStyles[variant],
    borderRadius: 'var(--bp-radius-sm)',
    fontSize: '11px',
    padding: '2px 8px',
    fontWeight: 500,
    fontFamily: 'var(--bp-font-ui)',
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  }

  return (
    <span style={style} className={className}>
      {label}
    </span>
  )
}

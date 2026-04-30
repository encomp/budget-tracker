import * as React from 'react'
import { BpButton } from './BpButton'

export interface BpEmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function BpEmptyState({ icon, heading, subtext, action }: BpEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        gap: '12px',
      }}
    >
      {icon && (
        <div style={{ color: 'var(--bp-text-muted)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ color: 'var(--bp-text-primary)', fontFamily: 'var(--bp-font-ui)', fontSize: '16px', fontWeight: 600 }}>
          {heading}
        </p>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '14px' }}>
          {subtext}
        </p>
      </div>
      {action && (
        <BpButton variant="primary" onClick={action.onClick}>
          {action.label}
        </BpButton>
      )}
    </div>
  )
}

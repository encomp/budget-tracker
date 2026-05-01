import * as React from 'react'
import { AnimatedIcon } from './AnimatedIcon'

export type BpToastVariant = 'info' | 'success' | 'error' | 'bell'

export interface BpToastProps {
  variant: BpToastVariant
  message: string
  visible: boolean
  onDismiss: () => void
  autoDismissMs?: number
  action?: { label: string; onClick: () => void }
}

const accentMap: Record<BpToastVariant, string> = {
  info: 'var(--bp-accent)',
  success: 'var(--bp-positive)',
  error: 'var(--bp-danger)',
  bell: 'var(--bp-warning)',
}

export function BpToast({ variant, message, visible, onDismiss, autoDismissMs = 4000, action }: BpToastProps) {
  React.useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(t)
  }, [visible, onDismiss, autoDismissMs])

  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 9999,
    background: 'var(--bp-bg-surface)',
    border: '1px solid var(--bp-border)',
    borderLeft: `4px solid ${accentMap[variant]}`,
    borderRadius: 'var(--bp-radius-md)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--bp-font-ui)',
    fontSize: '14px',
    color: 'var(--bp-text-primary)',
    maxWidth: '360px',
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transition: `transform var(--bp-duration-normal) var(--bp-easing-spring), opacity var(--bp-duration-normal) var(--bp-easing-spring)`,
  }

  return (
    <div style={style} role="alert">
      {variant === 'bell' && <AnimatedIcon type="BellRing" size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      {action && (
        <button
          onClick={() => { action.onClick(); onDismiss() }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--bp-accent)',
            cursor: 'pointer',
            fontFamily: 'var(--bp-font-ui)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '0 8px',
            transition: `opacity var(--bp-duration-fast) var(--bp-easing-default)`,
          }}
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--bp-text-muted)',
          cursor: 'pointer',
          padding: '0 0 0 8px',
          fontSize: '16px',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

export interface ToastState {
  message: string
  variant: BpToastVariant
  visible: boolean
  action?: { label: string; onClick: () => void }
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>({ message: '', variant: 'info', visible: false })

  const showToast = React.useCallback(
    (message: string, variant: BpToastVariant = 'info', action?: { label: string; onClick: () => void }) => {
      setState({ message, variant, visible: true, action })
    },
    []
  )

  const dismiss = React.useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }))
  }, [])

  return { toast: state, showToast, dismiss }
}

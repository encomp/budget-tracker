import * as React from 'react'
import { useId } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { getMotionConfig } from '../../lib/animation'

export interface BpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  'data-testid'?: string
}

const sizeMap = { sm: '400px', md: '560px', lg: '720px' }

const modalCss = `
@keyframes bp-modal-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes bp-modal-out {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to   { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}
.bp-modal-content[data-state="open"] {
  animation: bp-modal-in var(--bp-modal-duration, 300ms) var(--bp-modal-easing, cubic-bezier(0.34,1.56,0.64,1)) forwards;
}
.bp-modal-content[data-state="closed"] {
  animation: bp-modal-out var(--bp-modal-duration, 300ms) var(--bp-modal-easing, cubic-bezier(0.34,1.56,0.64,1)) forwards;
}
`

let modalStyleInjected = false
function injectModalStyles() {
  if (modalStyleInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = modalCss
  document.head.appendChild(el)
  modalStyleInjected = true
}

export function BpModal({ open, onOpenChange, title, description, children, footer, size = 'md', 'data-testid': testId }: BpModalProps) {
  const titleId = useId()
  const descId = useId()

  React.useEffect(() => {
    injectModalStyles()
    const cfg = getMotionConfig()
    document.documentElement.style.setProperty('--bp-modal-duration', `${cfg.duration * 1000}ms`)
    document.documentElement.style.setProperty('--bp-modal-easing', `cubic-bezier(${cfg.ease.join(',')})`)
  }, [])

  const contentStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: sizeMap[size],
    background: 'var(--bp-bg-surface)',
    border: '1px solid var(--bp-border)',
    borderRadius: 'var(--bp-radius-lg)',
    padding: '24px',
    zIndex: 100,
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '90vh',
    overflowY: 'auto',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--bp-bg-overlay)',
    zIndex: 99,
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay style={overlayStyle} />
        <DialogPrimitive.Content style={contentStyle} className="bp-modal-content" data-testid={testId} aria-labelledby={titleId} aria-describedby={description ? descId : undefined}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <DialogPrimitive.Title
                id={titleId}
                style={{ color: 'var(--bp-text-primary)', fontFamily: 'var(--bp-font-ui)', fontSize: '18px', fontWeight: 600, margin: 0 }}
              >
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description
                  id={descId}
                  style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '14px', marginTop: '4px' }}
                >
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--bp-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              <X size={16} />
            </DialogPrimitive.Close>
          </div>
          <div>{children}</div>
          {footer && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--bp-border)' }}>
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

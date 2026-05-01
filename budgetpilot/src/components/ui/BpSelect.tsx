import * as React from 'react'
import { Select as SelectPrimitive } from 'radix-ui'
import { ChevronDown, Check } from 'lucide-react'

export interface BpSelectOption {
  value: string
  label: string
}

export interface BpSelectProps {
  options: BpSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BpSelect({ options, value, onValueChange, placeholder, disabled, className }: BpSelectProps) {
  const triggerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    background: 'var(--bp-bg-surface-alt)',
    border: '1px solid var(--bp-border)',
    borderRadius: 'var(--bp-radius-sm)',
    color: value ? 'var(--bp-text-primary)' : 'var(--bp-text-muted)',
    fontFamily: 'var(--bp-font-ui)',
    fontSize: '14px',
    padding: '8px 12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    minWidth: '160px',
    outline: 'none',
    transition: `border-color var(--bp-duration-fast) var(--bp-easing-default)`,
  }

  const contentStyle: React.CSSProperties = {
    background: 'var(--bp-bg-surface)',
    border: '1px solid var(--bp-border)',
    borderRadius: 'var(--bp-radius-sm)',
    overflow: 'hidden',
    zIndex: 1000,
    minWidth: '160px',
  }

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger style={triggerStyle} className={className}>
        <SelectPrimitive.Value placeholder={placeholder ?? 'Select...'} />
        <SelectPrimitive.Icon>
          <ChevronDown size={14} style={{ color: 'var(--bp-text-muted)', flexShrink: 0 }} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content style={contentStyle} position="popper" sideOffset={4}>
          <SelectPrimitive.Viewport>
            {options.filter((opt) => opt.value !== '').map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'var(--bp-font-ui)',
                  color: opt.value === value ? 'var(--bp-accent)' : 'var(--bp-text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bp-accent-muted)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={12} style={{ color: 'var(--bp-accent)' }} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

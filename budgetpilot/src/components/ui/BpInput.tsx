import * as React from 'react'

export interface BpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
  error?: string
  label?: string
}

export function BpInput({ mono = false, error, label, id, className, style, ...props }: BpInputProps) {
  const [focused, setFocused] = React.useState(false)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bp-bg-surface-alt)',
    border: `1px solid ${error ? 'var(--bp-danger)' : focused ? 'var(--bp-accent)' : 'var(--bp-border)'}`,
    borderRadius: 'var(--bp-radius-sm)',
    color: 'var(--bp-text-primary)',
    fontFamily: mono ? 'var(--bp-font-mono)' : 'var(--bp-font-ui)',
    fontSize: '14px',
    padding: '8px 12px',
    outline: 'none',
    boxShadow: focused && !error ? '0 0 0 2px var(--bp-accent-muted)' : 'none',
    transition: `all var(--bp-duration-fast) var(--bp-easing-default)`,
    ...style,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--bp-danger)', fontFamily: 'var(--bp-font-ui)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

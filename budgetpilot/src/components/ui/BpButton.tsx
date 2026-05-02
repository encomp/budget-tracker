import * as React from 'react'
import { AnimatedIcon } from './AnimatedIcon'

type BpButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BpButtonSize = 'sm' | 'md' | 'lg'

export interface BpButtonProps {
  variant?: BpButtonVariant
  size?: BpButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'data-testid'?: string
}

const variantStyles: Record<BpButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--bp-accent)',
    color: 'var(--bp-bg-base)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--bp-bg-surface-alt)',
    color: 'var(--bp-text-primary)',
    border: '1px solid var(--bp-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--bp-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--bp-danger-muted)',
    color: 'var(--bp-danger)',
    border: '1px solid var(--bp-danger)',
  },
}

const sizeStyles: Record<BpButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--bp-radius-sm)' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--bp-radius-md)' },
  lg: { padding: '12px 20px', fontSize: '16px', borderRadius: 'var(--bp-radius-md)' },
}

export function BpButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  onClick,
  disabled,
  className,
  type = 'button',
  'data-testid': testId,
}: BpButtonProps) {
  const [hovered, setHovered] = React.useState(false)

  const isDisabled = disabled || loading

  const hoverOverlay: React.CSSProperties =
    hovered && !isDisabled
      ? variant === 'primary'
        ? { filter: 'brightness(0.88)' }
        : variant === 'ghost'
          ? { background: 'var(--bp-accent-muted)' }
          : { filter: 'brightness(1.08)' }
      : {}

  const style: React.CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...hoverOverlay,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--bp-font-ui)',
    fontWeight: 500,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: `all var(--bp-duration-fast) var(--bp-easing-default)`,
    outline: 'none',
    userSelect: 'none',
  }

  return (
    <button
      type={type}
      style={style}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      data-testid={testId}
    >
      {loading ? (
        <AnimatedIcon type="LoaderCircle" size={16} />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}

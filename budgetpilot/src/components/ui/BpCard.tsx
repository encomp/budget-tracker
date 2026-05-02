import * as React from 'react'

export interface BpCardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
  'data-testid'?: string
}

const paddingMap = { sm: '12px', md: '20px', lg: '28px' }

export function BpCard({ children, padding = 'md', hoverable = false, className, 'data-testid': testId }: BpCardProps) {
  const [hovered, setHovered] = React.useState(false)

  const style: React.CSSProperties = {
    background: 'var(--bp-bg-surface)',
    border: `1px solid ${hovered && hoverable ? 'var(--bp-border-strong)' : 'var(--bp-border)'}`,
    borderRadius: 'var(--bp-radius-md)',
    padding: paddingMap[padding],
    transform: hovered && hoverable ? 'translateY(-1px)' : 'translateY(0)',
    transition: `all var(--bp-duration-fast) var(--bp-easing-default)`,
  }

  return (
    <div
      style={style}
      className={className}
      data-testid={testId}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
    >
      {children}
    </div>
  )
}

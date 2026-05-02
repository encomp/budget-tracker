export interface BpProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  className?: string
  'data-testid'?: string
  'aria-valuenow'?: number
}

function getFillColor(value: number): string {
  if (value >= 100) return 'var(--bp-danger)'
  if (value >= 85) return 'var(--bp-warning)'
  return 'var(--bp-positive)'
}

export function BpProgressBar({ value, label, showValue = false, className, 'data-testid': testId, 'aria-valuenow': ariaValueNow }: BpProgressBarProps) {
  const fillWidth = Math.min(value, 100)
  const fillColor = getFillColor(value)

  return (
    <div className={className} style={{ width: '100%' }} data-testid={testId} aria-valuenow={ariaValueNow}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            fontSize: '12px',
            color: 'var(--bp-text-secondary)',
            fontFamily: 'var(--bp-font-ui)',
          }}
        >
          {label && <span>{label}</span>}
          {showValue && <span>{value}%</span>}
        </div>
      )}
      <div
        style={{
          background: 'var(--bp-bg-surface-alt)',
          borderRadius: 'var(--bp-radius-sm)',
          height: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${fillWidth}%`,
            height: '100%',
            background: fillColor,
            borderRadius: 'var(--bp-radius-sm)',
            transition: `width var(--bp-duration-normal) var(--bp-easing-default)`,
          }}
        />
      </div>
    </div>
  )
}

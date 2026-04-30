import { BpSlider } from './ui/BpSlider'

export interface DebtSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  currencySymbol?: string
}

export function DebtSlider({
  value,
  min,
  max,
  step = 25,
  onChange,
  label = 'Extra Monthly Payment',
  currencySymbol = '$',
}: DebtSliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {label && (
        <span
          style={{
            fontSize: '13px',
            color: 'var(--bp-text-secondary)',
            fontFamily: 'var(--bp-font-ui)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          fontSize: '28px',
          fontFamily: 'var(--bp-font-mono)',
          color: 'var(--bp-accent)',
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {currencySymbol}{value.toLocaleString()} / month
      </div>
      <BpSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        variant="premium"
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--bp-text-muted)',
          fontFamily: 'var(--bp-font-mono)',
        }}
      >
        <span>{currencySymbol}{min}</span>
        <span>{currencySymbol}{max.toLocaleString()}</span>
      </div>
    </div>
  )
}

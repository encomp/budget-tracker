import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'

export interface BpSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  variant?: 'standard' | 'premium'
  disabled?: boolean
  className?: string
}

const sliderCss = `
.bp-slider-standard [data-slot="slider-track"] {
  height: 6px;
  background: var(--bp-bg-surface-alt);
  border-radius: var(--bp-radius-sm);
}
.bp-slider-standard [data-slot="slider-range"] {
  background: var(--bp-accent);
}
.bp-slider-standard [data-slot="slider-thumb"] {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bp-accent);
  border: 2px solid var(--bp-bg-surface);
  transition: all var(--bp-duration-fast) var(--bp-easing-default);
  outline: none;
  cursor: pointer;
}
.bp-slider-premium [data-slot="slider-track"] {
  height: 8px;
  background: var(--bp-bg-surface-alt);
  border-radius: var(--bp-radius-sm);
}
.bp-slider-premium [data-slot="slider-range"] {
  background: var(--bp-accent);
}
.bp-slider-premium [data-slot="slider-thumb"] {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bp-accent);
  border: none;
  transition: all var(--bp-duration-fast) var(--bp-easing-spring);
  outline: none;
  cursor: pointer;
}
.bp-slider-premium [data-slot="slider-thumb"]:focus,
.bp-slider-premium [data-slot="slider-thumb"]:active {
  transform: scale(1.15);
  box-shadow: 0 0 0 8px var(--bp-accent-glow);
}
`

let sliderStyleInjected = false
function injectSliderStyles() {
  if (sliderStyleInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = sliderCss
  document.head.appendChild(el)
  sliderStyleInjected = true
}

export function BpSlider({ value, min, max, step = 1, onChange, variant = 'standard', disabled, className }: BpSliderProps) {
  React.useEffect(() => { injectSliderStyles() }, [])

  const cls = `${variant === 'premium' ? 'bp-slider-premium' : 'bp-slider-standard'} ${className ?? ''}`

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={`relative flex w-full touch-none items-center select-none ${cls}`}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      disabled={disabled}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative grow overflow-hidden rounded-full data-horizontal:h-full data-horizontal:w-full">
        <SliderPrimitive.Range data-slot="slider-range" className="absolute data-horizontal:h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb data-slot="slider-thumb" className="block shrink-0" />
    </SliderPrimitive.Root>
  )
}

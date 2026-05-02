import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BpProgressBar } from './BpProgressBar'

// Ensure i18n is initialized for t() calls
import '../../lib/i18n'

describe('BpProgressBar accessibility', () => {
  it('has role="progressbar"', () => {
    const { getByRole } = render(<BpProgressBar value={50} />)
    expect(getByRole('progressbar')).toBeTruthy()
  })

  it('aria-valuenow reflects value', () => {
    const { getByRole } = render(<BpProgressBar value={72} />)
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('72')
  })

  it('aria-valuenow caps at 100 when value exceeds', () => {
    const { getByRole } = render(<BpProgressBar value={120} />)
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('has aria-valuemin=0 and aria-valuemax=100', () => {
    const { getByRole } = render(<BpProgressBar value={50} />)
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })
})

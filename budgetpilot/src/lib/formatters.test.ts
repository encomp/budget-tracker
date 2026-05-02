import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDisplayDate,
  formatMonthYear,
  getWeekdayNames,
} from './formatters'

describe('formatCurrency', () => {
  it('formats USD for en locale with comma separator', () => {
    expect(formatCurrency(1234.5, '$', 'en')).toBe('$1,234.50')
  })

  it('formats EUR for fr locale with symbol after number', () => {
    expect(formatCurrency(1234.5, '€', 'fr')).toBe('1\u202f234,50 €')
  })

  it('formats USD for es locale', () => {
    expect(formatCurrency(1234.5, '$', 'es')).toBe('$1,234.50')
  })

  it('handles zero', () => {
    expect(formatCurrency(0, '$', 'en')).toBe('$0.00')
  })

  it('handles signed option for positive values', () => {
    expect(formatCurrency(500, '$', 'en', { signed: true })).toBe('+$500.00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-100, '$', 'en')).toBe('-$100.00')
  })

  it('always uses 2 decimal places', () => {
    expect(formatCurrency(100, '$', 'en')).toBe('$100.00')
    expect(formatCurrency(99.9, '$', 'en')).toBe('$99.90')
    expect(formatCurrency(99.999, '$', 'en')).toBe('$100.00')
  })
})

describe('formatDisplayDate', () => {
  it('formats YYYY-MM-DD as long date in English', () => {
    const result = formatDisplayDate('2026-04-15', 'en')
    expect(result).toContain('April')
    expect(result).toContain('15')
    expect(result).toContain('2026')
  })

  it('formats in Spanish using Spanish month names', () => {
    const result = formatDisplayDate('2026-04-15', 'es')
    expect(result).toContain('abril')
  })

  it('formats in French using French month names', () => {
    const result = formatDisplayDate('2026-04-15', 'fr')
    expect(result).toContain('avril')
  })

  it('returns raw string for invalid date', () => {
    expect(formatDisplayDate('not-a-date', 'en')).toBe('not-a-date')
  })
})

describe('formatMonthYear', () => {
  it('formats month as full month name + year in English', () => {
    const result = formatMonthYear('2026-04', 'en')
    expect(result).toContain('April')
    expect(result).toContain('2026')
  })

  it('formats in Spanish', () => {
    const result = formatMonthYear('2026-04', 'es')
    expect(result.toLowerCase()).toContain('abril')
  })

  it('formats in French', () => {
    const result = formatMonthYear('2026-04', 'fr')
    expect(result.toLowerCase()).toContain('avril')
  })
})

describe('getWeekdayNames', () => {
  it('returns 7 names for English', () => {
    const names = getWeekdayNames('en')
    expect(names).toHaveLength(7)
    expect(names[0]).toMatch(/sun/i)
    expect(names[6]).toMatch(/sat/i)
  })

  it('returns 7 names for French', () => {
    const names = getWeekdayNames('fr')
    expect(names).toHaveLength(7)
  })

  it('returns 7 names for Spanish', () => {
    const names = getWeekdayNames('es')
    expect(names).toHaveLength(7)
  })

  it('returns different names per locale', () => {
    const en = getWeekdayNames('en')
    const fr = getWeekdayNames('fr')
    expect(en.join('')).not.toBe(fr.join(''))
  })
})

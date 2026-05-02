import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  passesAA,
  validateThemeContrast,
  themePassesContrast,
} from './contrast'

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    expect(hexToRgb('#14b8a6')).toEqual([20, 184, 166])
  })

  it('parses 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb('#000')).toEqual([0, 0, 0])
  })

  it('handles hex without hash', () => {
    expect(hexToRgb('ffffff')).toEqual([255, 255, 255])
  })

  it('returns null for invalid input', () => {
    expect(hexToRgb('not-a-color')).toBeNull()
    expect(hexToRgb('rgba(0,0,0,0)')).toBeNull()
  })
})

describe('getRelativeLuminance', () => {
  it('white has luminance 1', () => {
    expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 2)
  })

  it('black has luminance 0', () => {
    expect(getRelativeLuminance(0, 0, 0)).toBeCloseTo(0.0, 2)
  })
})

describe('getContrastRatio', () => {
  it('black on white is 21:1', () => {
    const ratio = getContrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('white on white is 1:1', () => {
    const ratio = getContrastRatio('#ffffff', '#ffffff')
    expect(ratio).toBeCloseTo(1, 1)
  })

  it('Midnight accent (#14b8a6) on bg-base (#040810) passes AA', () => {
    const ratio = getContrastRatio('#14b8a6', '#040810')
    expect(ratio).not.toBeNull()
    expect(ratio!).toBeGreaterThanOrEqual(3.0)
  })

  it('returns null when color is not a valid hex', () => {
    expect(getContrastRatio('rgba(0,0,0)', '#fff')).toBeNull()
  })
})

describe('passesAA', () => {
  it('black on white passes AA normal', () => {
    expect(passesAA('#000000', '#ffffff', 'normal')).toBe(true)
  })

  it('light grey on white fails AA normal', () => {
    expect(passesAA('#cccccc', '#ffffff', 'normal')).toBe(false)
  })

  it('uses 3:1 threshold for ui size', () => {
    expect(passesAA('#767676', '#ffffff', 'ui')).toBe(true)
  })
})

describe('validateThemeContrast', () => {
  it('THEME_MIDNIGHT tokens all pass', () => {
    const midnightTokens = {
      '--bp-text-primary': '#f1f5f9',
      '--bp-text-secondary': '#94a3b8',
      '--bp-bg-base': '#040810',
      '--bp-bg-surface': '#070d1a',
      '--bp-accent': '#14b8a6',
    }
    const results = validateThemeContrast(midnightTokens)
    results.forEach(r => {
      if (r.ratio !== null) {
        expect(r.passes).toBe(true)
      }
    })
  })

  it('returns failing result for low-contrast token pair', () => {
    const lowContrastTokens = {
      '--bp-text-primary': '#888888',
      '--bp-text-secondary': '#aaaaaa',
      '--bp-bg-base': '#999999',
      '--bp-bg-surface': '#aaaaaa',
      '--bp-accent': '#bbbbbb',
    }
    const results = validateThemeContrast(lowContrastTokens)
    const failures = results.filter(r => !r.passes)
    expect(failures.length).toBeGreaterThan(0)
  })

  it('returns non-passing result for missing token', () => {
    const incompleteTokens = {
      '--bp-text-primary': '#ffffff',
      '--bp-bg-surface': '#000000',
      '--bp-text-secondary': '#cccccc',
      '--bp-accent': '#14b8a6',
    }
    const results = validateThemeContrast(incompleteTokens)
    const nullRatio = results.find(r => r.ratio === null)
    expect(nullRatio).toBeTruthy()
  })
})

describe('themePassesContrast', () => {
  it('returns true for Midnight tokens', () => {
    expect(themePassesContrast({
      '--bp-text-primary': '#f1f5f9',
      '--bp-text-secondary': '#94a3b8',
      '--bp-bg-base': '#040810',
      '--bp-bg-surface': '#070d1a',
      '--bp-accent': '#14b8a6',
    })).toBe(true)
  })

  it('returns false when any pair fails', () => {
    expect(themePassesContrast({
      '--bp-text-primary': '#888888',
      '--bp-text-secondary': '#999999',
      '--bp-bg-base': '#777777',
      '--bp-bg-surface': '#888888',
      '--bp-accent': '#999999',
    })).toBe(false)
  })
})

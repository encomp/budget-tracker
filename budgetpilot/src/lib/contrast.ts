/**
 * WCAG 2.1 contrast ratio calculation.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** Parse a hex color string to [r, g, b] in 0–255 range. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return [r, g, b]
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    return [r, g, b]
  }
  return null
}

/** Convert a single sRGB channel value (0–255) to linear light. */
function toLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** Calculate relative luminance of an RGB color per WCAG 2.1. */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * Returns a ratio in the range 1–21.
 * Returns null if either color cannot be parsed.
 */
export function getContrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return null

  const l1 = getRelativeLuminance(...rgb1)
  const l2 = getRelativeLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG AA minimum contrast ratios */
export const WCAG_AA = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponent: 3.0,
} as const

/** WCAG AAA minimum contrast ratios */
export const WCAG_AAA = {
  normalText: 7.0,
  largeText: 4.5,
} as const

export type ContrastSize = 'normal' | 'large' | 'ui'

/** Returns true if the contrast ratio meets WCAG AA requirements. */
export function passesAA(
  foreground: string,
  background: string,
  size: ContrastSize = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  if (ratio === null) return false
  const threshold =
    size === 'normal' ? WCAG_AA.normalText :
    size === 'large'  ? WCAG_AA.largeText :
    WCAG_AA.uiComponent
  return ratio >= threshold
}

export interface ContrastResult {
  pair: string
  ratio: number | null
  passes: boolean
  threshold: number
}

/**
 * The critical color pairs that every BudgetPilot theme must pass at WCAG AA.
 */
export const CRITICAL_PAIRS: Array<{
  foreground: string
  background: string
  size: ContrastSize
  label: string
}> = [
  {
    foreground: '--bp-text-primary',
    background: '--bp-bg-base',
    size: 'normal',
    label: 'Primary text on base background',
  },
  {
    foreground: '--bp-text-primary',
    background: '--bp-bg-surface',
    size: 'normal',
    label: 'Primary text on card surface',
  },
  {
    foreground: '--bp-text-secondary',
    background: '--bp-bg-surface',
    size: 'normal',
    label: 'Secondary text on card surface',
  },
  {
    foreground: '--bp-accent',
    background: '--bp-bg-base',
    size: 'ui',
    label: 'Accent color on base background',
  },
  {
    foreground: '--bp-accent',
    background: '--bp-bg-surface',
    size: 'ui',
    label: 'Accent color on card surface',
  },
]

/**
 * Validates all critical contrast pairs in a theme's token set.
 */
export function validateThemeContrast(
  tokens: Record<string, string>
): ContrastResult[] {
  return CRITICAL_PAIRS.map(pair => {
    const fg = tokens[pair.foreground]
    const bg = tokens[pair.background]
    const threshold =
      pair.size === 'normal' ? WCAG_AA.normalText :
      pair.size === 'large'  ? WCAG_AA.largeText :
      WCAG_AA.uiComponent

    if (!fg || !bg) {
      return { pair: pair.label, ratio: null, passes: false, threshold }
    }

    const ratio = getContrastRatio(fg, bg)
    return {
      pair: pair.label,
      ratio,
      passes: ratio !== null && ratio >= threshold,
      threshold,
    }
  })
}

/** Returns true if ALL critical pairs pass WCAG AA. */
export function themePassesContrast(tokens: Record<string, string>): boolean {
  return validateThemeContrast(tokens).every(r => r.passes)
}

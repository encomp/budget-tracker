import type { BpTheme } from '../types'
import { Settings } from './settings'
import { z } from 'zod'

export const THEME_MIDNIGHT: BpTheme = {
  id: 'midnight',
  name: 'Midnight',
  description: 'Sleek dark dashboard. Elegant. Finance-grade.',
  version: '1.0',
  tokens: {
    '--bp-bg-base': '#040810',
    '--bp-bg-surface': '#070d1a',
    '--bp-bg-surface-alt': '#0a1220',
    '--bp-bg-overlay': 'rgba(0,0,0,0.72)',
    '--bp-border': '#1e293b',
    '--bp-border-strong': '#334155',
    '--bp-accent': '#14b8a6',
    '--bp-accent-muted': 'rgba(20,184,166,0.12)',
    '--bp-accent-glow': 'rgba(20,184,166,0.25)',
    '--bp-positive': '#14b8a6',
    '--bp-warning': '#f59e0b',
    '--bp-danger': '#ef4444',
    '--bp-positive-muted': 'rgba(20,184,166,0.1)',
    '--bp-warning-muted': 'rgba(245,158,11,0.1)',
    '--bp-danger-muted': 'rgba(239,68,68,0.1)',
    '--bp-text-primary': '#f1f5f9',
    '--bp-text-secondary': '#94a3b8',
    '--bp-text-muted': '#475569',
    '--bp-font-ui': "'DM Sans', system-ui, sans-serif",
    '--bp-font-mono': "'DM Mono', 'Courier New', monospace",
    '--bp-radius-sm': '6px',
    '--bp-radius-md': '10px',
    '--bp-radius-lg': '16px',
    '--bp-heat-none': '#0f172a',
    '--bp-heat-low': '#134e4a',
    '--bp-heat-mid': '#f59e0b',
    '--bp-heat-high': '#ef4444',
    '--bp-duration-fast': '150ms',
    '--bp-duration-normal': '300ms',
    '--bp-duration-slow': '600ms',
    '--bp-easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--bp-easing-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--bp-easing-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    '--bp-motion-intensity': '1',
    '--bp-sidebar-width-full': '240px',
    '--bp-sidebar-width-rail': '64px',
  },
}

const REQUIRED_TOKENS = [
  '--bp-bg-base',
  '--bp-accent',
  '--bp-text-primary',
  '--bp-border',
  '--bp-positive',
  '--bp-danger',
]

const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  tokens: z.record(z.string(), z.string()).refine(
    (tokens) => REQUIRED_TOKENS.every((t) => t in tokens),
    { message: `Theme must include: ${REQUIRED_TOKENS.join(', ')}` }
  ),
})

export function applyTheme(theme: BpTheme): void {
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  Settings.set('activeTheme', theme)
}

export function validateTheme(json: unknown): BpTheme | null {
  const result = ThemeSchema.safeParse(json)
  return result.success ? (result.data as BpTheme) : null
}

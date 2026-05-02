import type { Meta, StoryObj } from '@storybook/react'
import { ThemeIcon } from './ThemeIcon'
import { THEME_MIDNIGHT } from '../lib/themes/midnight'
import type { BpTheme } from '../types'

const ALL_SLOTS = [
  'logo',
  'nav-dashboard', 'nav-transactions', 'nav-import',
  'nav-budget', 'nav-debts', 'nav-settings', 'nav-export',
  'category-food', 'category-coffee', 'category-transport',
  'category-shopping', 'category-subscriptions',
  'category-health', 'category-utilities', 'category-savings',
]

const meta: Meta<typeof ThemeIcon> = {
  title: 'Components/ThemeIcon',
  component: ThemeIcon,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta

export const AllSlotsMidnight: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '24px' }}>
      {ALL_SLOTS.map((slot) => (
        <div key={slot} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <ThemeIcon slot={slot} size={24} style={{ color: 'var(--bp-text-primary)' }} />
          <span style={{ fontSize: '10px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-mono)' }}>
            {slot}
          </span>
        </div>
      ))}
    </div>
  ),
}

// Forest theme with nav-dashboard and category-savings custom SVG overrides
const THEME_FOREST_INLINE: BpTheme = {
  id: 'forest',
  name: 'Forest',
  description: 'Organic. Unhurried. Rooted in calm.',
  version: '1.0',
  tokens: {
    '--bp-bg-base': '#0a1a0e',
    '--bp-bg-surface': '#0f2218',
    '--bp-bg-surface-alt': '#142b1f',
    '--bp-bg-overlay': 'rgba(0,0,0,0.75)',
    '--bp-border': '#1a3828',
    '--bp-border-strong': '#2d5a40',
    '--bp-accent': '#4ade80',
    '--bp-accent-muted': 'rgba(74,222,128,0.12)',
    '--bp-accent-glow': 'rgba(74,222,128,0.2)',
    '--bp-positive': '#4ade80',
    '--bp-warning': '#fbbf24',
    '--bp-danger': '#f87171',
    '--bp-positive-muted': 'rgba(74,222,128,0.1)',
    '--bp-warning-muted': 'rgba(251,191,36,0.1)',
    '--bp-danger-muted': 'rgba(248,113,113,0.1)',
    '--bp-text-primary': '#ecfdf5',
    '--bp-text-secondary': '#86efac',
    '--bp-text-muted': '#4d7c60',
    '--bp-font-ui': "'Literata', Georgia, serif",
    '--bp-font-mono': "'JetBrains Mono', 'Courier New', monospace",
    '--bp-radius-sm': '8px',
    '--bp-radius-md': '14px',
    '--bp-radius-lg': '20px',
    '--bp-heat-none': '#0a1a0e',
    '--bp-heat-low': '#14532d',
    '--bp-heat-mid': '#fbbf24',
    '--bp-heat-high': '#f87171',
    '--bp-duration-fast': '200ms',
    '--bp-duration-normal': '500ms',
    '--bp-duration-slow': '900ms',
    '--bp-easing-default': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '--bp-easing-spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--bp-easing-bounce': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
    '--bp-motion-intensity': '0.85',
    '--bp-sidebar-width-full': '256px',
    '--bp-sidebar-width-rail': '68px',
    '--bp-icon-stroke': '1.5',
    '--bp-icon-size-sm': '16px',
    '--bp-icon-size-md': '20px',
    '--bp-icon-size-lg': '26px',
  },
  icons: {
    'nav-dashboard': "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>",
    'category-savings': "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'><path d='M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z'/><circle cx='12' cy='9' r='2.5'/></svg>",
  },
}

export const ForestOverrides: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--bp-text-muted)', marginBottom: '8px' }}>Midnight (Lucide)</div>
        <ThemeIcon slot="nav-dashboard" size={24} themeOverride={THEME_MIDNIGHT} style={{ color: 'var(--bp-text-primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--bp-text-muted)', marginBottom: '8px' }}>Forest (SVG override)</div>
        <ThemeIcon slot="nav-dashboard" size={24} themeOverride={THEME_FOREST_INLINE} style={{ color: '#4ade80' }} />
      </div>
    </div>
  ),
}

export const UnknownSlotReturnsNull: StoryObj = {
  render: () => (
    <div>
      <ThemeIcon slot="non-existent-slot" />
      <span style={{ color: 'var(--bp-text-muted)', fontSize: '12px' }}>
        (nothing should render above this line)
      </span>
    </div>
  ),
}

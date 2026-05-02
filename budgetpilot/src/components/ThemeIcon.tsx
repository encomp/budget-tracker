import * as React from 'react'
import DOMPurify from 'dompurify'
import {
  Navigation,
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  PieChart,
  TrendingDown,
  Settings,
  Download,
  UtensilsCrossed,
  Coffee,
  Car,
  ShoppingBag,
  Repeat,
  Heart,
  Zap,
  PiggyBank,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { BpTheme } from '../types'

type LucideComponent = React.FC<LucideProps>

// Maps every defined icon slot to its Lucide fallback.
// If a theme does not override a slot, this is what renders.
const LUCIDE_FALLBACKS: Record<string, LucideComponent> = {
  'logo':                   Navigation,
  'nav-dashboard':          LayoutDashboard,
  'nav-transactions':       ArrowLeftRight,
  'nav-import':             Upload,
  'nav-budget':             PieChart,
  'nav-debts':              TrendingDown,
  'nav-settings':           Settings,
  'nav-export':             Download,
  'category-food':          UtensilsCrossed,
  'category-coffee':        Coffee,
  'category-transport':     Car,
  'category-shopping':      ShoppingBag,
  'category-subscriptions': Repeat,
  'category-health':        Heart,
  'category-utilities':     Zap,
  'category-savings':       PiggyBank,
}

interface ThemeIconProps {
  slot: string
  // Override rendered size in px. Defaults to --bp-icon-size-md from CSS.
  size?: number
  className?: string
  style?: React.CSSProperties
  // Used by ThemePreviewPanel to render icons with a non-active theme's overrides.
  themeOverride?: BpTheme
}

export function ThemeIcon({
  slot,
  size,
  className,
  style,
  themeOverride,
}: ThemeIconProps) {
  const activeTheme = useAppStore((s) => s.activeTheme)
  const theme = themeOverride ?? activeTheme

  const computedStyle = getComputedStyle(document.documentElement)
  const iconSize =
    size ??
    parseInt(computedStyle.getPropertyValue('--bp-icon-size-md').trim() || '20', 10)
  const stroke = parseFloat(
    computedStyle.getPropertyValue('--bp-icon-stroke').trim() || '2'
  )

  if (theme.icons?.[slot]) {
    // Belt-and-suspenders sanitization — validateTheme already sanitized on upload,
    // but we sanitize again at render to guard against any path that bypasses validation.
    const sanitized = DOMPurify.sanitize(theme.icons[slot], {
      USE_PROFILES: { svg: true, svgFilters: true },
    })
    return (
      <span
        className={className}
        style={{
          width: iconSize,
          height: iconSize,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    )
  }

  const LucideIcon = LUCIDE_FALLBACKS[slot]
  if (!LucideIcon) return null

  return (
    <LucideIcon
      size={iconSize}
      strokeWidth={stroke}
      className={className}
      style={style}
    />
  )
}

import DOMPurify from 'dompurify'
import { z } from 'zod'
import type { BpTheme } from '../types'
import { Settings } from './settings'
import { BUNDLED_THEME_IDS } from './themes'

export { THEME_MIDNIGHT } from './themes'
export { THEME_FOCUS } from './themes'
export { BUNDLED_THEMES } from './themes'

// ─── Font loading ─────────────────────────────────────────────────────────────

const FONT_URLS: Record<string, string> = {
  'Literata':
    'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,300..700;1,7..72,300..700&display=swap',
  'Fraunces':
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap',
  'Space Mono':
    'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap',
  'Atkinson Hyperlegible':
    'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap',
  'JetBrains Mono':
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
}

export function extractFontName(fontStack: string): string | null {
  const match = fontStack.match(/['"]?([^,'"\s][^,'"]*?)['"]?\s*(?:,|$)/)
  return match ? match[1].trim() : null
}

function loadThemeFont(fontStack: string): void {
  const fontName = extractFontName(fontStack)
  if (!fontName || !FONT_URLS[fontName]) return
  if (document.querySelector(`link[data-bp-font="${fontName}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = FONT_URLS[fontName]
  link.setAttribute('data-bp-font', fontName)
  document.head.appendChild(link)
  // Fire-and-forget. A failed network request must not throw.
}

// ─── Theme application ────────────────────────────────────────────────────────

export function applyTheme(theme: BpTheme): void {
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  const fontUi = theme.tokens['--bp-font-ui']
  if (fontUi) loadThemeFont(fontUi)
  Settings.set('activeTheme', theme)
}

// ─── Validation ───────────────────────────────────────────────────────────────

const REQUIRED_TOKENS = [
  '--bp-bg-base',
  '--bp-accent',
  '--bp-text-primary',
  '--bp-border',
  '--bp-positive',
  '--bp-danger',
]

function sanitizeIcons(icons: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [slot, svg] of Object.entries(icons)) {
    result[slot] = DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
    })
  }
  return result
}

const ThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  version: z.string(),
  tokens: z
    .record(z.string(), z.string())
    .refine((tokens) => REQUIRED_TOKENS.every((t) => t in tokens), {
      message: `Theme must include: ${REQUIRED_TOKENS.join(', ')}`,
    }),
  icons: z.record(z.string(), z.string()).optional(),
})

export function validateTheme(json: unknown): BpTheme | null {
  const result = ThemeSchema.safeParse(json)
  if (!result.success) return null
  const theme = result.data as BpTheme

  if (BUNDLED_THEME_IDS.has(theme.id)) {
    // Reserved IDs cannot be uploaded — they are always bundled
    return null
  }

  if (theme.icons) {
    theme.icons = sanitizeIcons(theme.icons)
  }

  return theme
}

export { THEME_MIDNIGHT } from './midnight'
export { THEME_FOCUS } from './focus'
import { THEME_MIDNIGHT } from './midnight'
import { THEME_FOCUS } from './focus'
import type { BpTheme } from '../../types'

export const BUNDLED_THEMES: BpTheme[] = [THEME_MIDNIGHT, THEME_FOCUS]
export const BUNDLED_THEME_IDS = new Set(BUNDLED_THEMES.map((t) => t.id))

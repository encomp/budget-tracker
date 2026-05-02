import { db } from './db'
import type { BpTheme } from '../types'

export const Settings = {
  get: <T>(key: string): Promise<T | undefined> =>
    db.settings.get(key).then((r) => r?.value as T | undefined),
  set: (key: string, value: unknown): Promise<string> =>
    db.settings.put({ key, value }),
  delete: (key: string): Promise<void> =>
    db.settings.delete(key),
}

// Typed helpers for theme library persistence
export const ThemeLibrary = {
  getAll: (): Promise<BpTheme[]> =>
    Settings.get<BpTheme[]>('installedThemes').then((r) => r ?? []),

  add: async (theme: BpTheme): Promise<void> => {
    const current = await ThemeLibrary.getAll()
    const exists = current.some((t) => t.id === theme.id)
    const next = exists
      ? current.map((t) => (t.id === theme.id ? theme : t))
      : [...current, theme]
    await Settings.set('installedThemes', next)
  },

  remove: async (id: string): Promise<void> => {
    const current = await ThemeLibrary.getAll()
    await Settings.set('installedThemes', current.filter((t) => t.id !== id))
  },
}

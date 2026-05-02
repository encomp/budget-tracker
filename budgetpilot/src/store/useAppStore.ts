import { create } from 'zustand'
import { format } from 'date-fns'
import type { BpTheme } from '../types'
import type { ViewName } from '../types'
import { THEME_MIDNIGHT } from '../lib/themes'

interface AppState {
  activeMonth: string
  activeView: ViewName
  activeTheme: BpTheme
  sidebarExpanded: boolean
  backupReminderShown: boolean
  transactionModalOpen: boolean
  // Theme library — uploaded packs only. Bundled themes are always available
  // from BUNDLED_THEMES constant and are never stored here.
  installedThemes: BpTheme[]
  setActiveMonth: (month: string) => void
  setActiveView: (view: ViewName) => void
  setActiveTheme: (theme: BpTheme) => void
  setSidebarExpanded: (expanded: boolean) => void
  setBackupReminderShown: (shown: boolean) => void
  setTransactionModalOpen: (open: boolean) => void
  setInstalledThemes: (themes: BpTheme[]) => void
  addInstalledTheme: (theme: BpTheme) => void
  removeInstalledTheme: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeMonth: format(new Date(), 'yyyy-MM'),
  activeView: 'dashboard',
  activeTheme: THEME_MIDNIGHT,
  sidebarExpanded: false,
  backupReminderShown: false,
  transactionModalOpen: false,
  installedThemes: [],
  setActiveMonth: (month) => set({ activeMonth: month }),
  setActiveView: (view) => set({ activeView: view }),
  setActiveTheme: (theme) => set({ activeTheme: theme }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setBackupReminderShown: (shown) => set({ backupReminderShown: shown }),
  setTransactionModalOpen: (open) => set({ transactionModalOpen: open }),
  setInstalledThemes: (themes) => set({ installedThemes: themes }),
  addInstalledTheme: (theme) =>
    set((state) => {
      const exists = state.installedThemes.some((t) => t.id === theme.id)
      return {
        installedThemes: exists
          ? state.installedThemes.map((t) => (t.id === theme.id ? theme : t))
          : [...state.installedThemes, theme],
      }
    }),
  removeInstalledTheme: (id) =>
    set((state) => ({
      installedThemes: state.installedThemes.filter((t) => t.id !== id),
    })),
}))

import { create } from 'zustand'
import { format } from 'date-fns'
import type { BpTheme } from '../types'
import type { ViewName } from '../types'
import { THEME_MIDNIGHT } from '../lib/theme'

interface AppState {
  activeMonth: string
  activeView: ViewName
  activeTheme: BpTheme
  sidebarExpanded: boolean
  backupReminderShown: boolean
  transactionModalOpen: boolean
  setActiveMonth: (month: string) => void
  setActiveView: (view: ViewName) => void
  setActiveTheme: (theme: BpTheme) => void
  setSidebarExpanded: (expanded: boolean) => void
  setBackupReminderShown: (shown: boolean) => void
  setTransactionModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeMonth: format(new Date(), 'yyyy-MM'),
  activeView: 'dashboard',
  activeTheme: THEME_MIDNIGHT,
  sidebarExpanded: false,
  backupReminderShown: false,
  transactionModalOpen: false,
  setActiveMonth: (month) => set({ activeMonth: month }),
  setActiveView: (view) => set({ activeView: view }),
  setActiveTheme: (theme) => set({ activeTheme: theme }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setBackupReminderShown: (shown) => set({ backupReminderShown: shown }),
  setTransactionModalOpen: (open) => set({ transactionModalOpen: open }),
}))

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Must initialize before any component uses t()
import { Settings } from './lib/settings'
import { applyTheme, THEME_MIDNIGHT } from './lib/theme'
import { useAppStore } from './store/useAppStore'
import i18n from './lib/i18n'
import type { BpTheme } from './types'

async function boot() {
  const [storedTheme, installedThemes, savedLocale] = await Promise.all([
    Settings.get<BpTheme>('activeTheme'),
    Settings.get<BpTheme[]>('installedThemes'),
    Settings.get<string>('locale'),
  ])

  if (savedLocale) {
    await i18n.changeLanguage(savedLocale)
    useAppStore.getState().setLocale(savedLocale)
  }

  const themeToApply = storedTheme ?? THEME_MIDNIGHT
  applyTheme(themeToApply)

  // Hydrate store before render so components read correct initial state
  const store = useAppStore.getState()
  store.setActiveTheme(themeToApply)
  store.setInstalledThemes(installedThemes ?? [])

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

boot()

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Settings } from './lib/settings'
import { applyTheme, THEME_MIDNIGHT } from './lib/theme'
import { useAppStore } from './store/useAppStore'
import type { BpTheme } from './types'

async function boot() {
  const [storedTheme, installedThemes] = await Promise.all([
    Settings.get<BpTheme>('activeTheme'),
    Settings.get<BpTheme[]>('installedThemes'),
  ])

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

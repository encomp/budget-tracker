import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Settings } from './lib/settings'
import { applyTheme, THEME_MIDNIGHT } from './lib/theme'
import type { BpTheme } from './types'

async function boot() {
  const storedTheme = await Settings.get<BpTheme>('activeTheme')
  applyTheme(storedTheme ?? THEME_MIDNIGHT)

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

boot()

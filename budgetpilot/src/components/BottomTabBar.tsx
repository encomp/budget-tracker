import { useAppStore } from '../store/useAppStore'
import { ThemeIcon } from './ThemeIcon'
import type { ViewName } from '../types'

interface TabItem {
  view: ViewName
  label: string
  slot: string
}

const TABS: TabItem[] = [
  { view: 'dashboard',    label: 'Home',         slot: 'nav-dashboard' },
  { view: 'transactions', label: 'Transactions', slot: 'nav-transactions' },
  { view: 'budget',       label: 'Budget',       slot: 'nav-budget' },
  { view: 'settings',     label: 'Settings',     slot: 'nav-settings' },
]

export function BottomTabBar() {
  const activeView = useAppStore(s => s.activeView)
  const setActiveView = useAppStore(s => s.setActiveView)

  return (
    <nav
      data-testid="bottom-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--bp-bg-surface)',
        borderTop: '1px solid var(--bp-border)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 50,
      }}
    >
      {TABS.map(tab => {
        const isActive = activeView === tab.view
        return (
          <button
            key={tab.view}
            onClick={() => setActiveView(tab.view)}
            data-testid={`nav-${tab.view}`}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? 'var(--bp-accent)' : 'var(--bp-text-muted)',
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '0.65rem',
            }}
          >
            <ThemeIcon slot={tab.slot} size={22} />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

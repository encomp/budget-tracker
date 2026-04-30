import { Home, ArrowLeftRight, PieChart, Settings } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { ViewName } from '../types'

interface TabItem {
  view: ViewName
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const TABS: TabItem[] = [
  { view: 'dashboard', label: 'Home', icon: Home },
  { view: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { view: 'budget', label: 'Budget', icon: PieChart },
  { view: 'settings', label: 'Settings', icon: Settings },
]

export function BottomTabBar() {
  const activeView = useAppStore(s => s.activeView)
  const setActiveView = useAppStore(s => s.setActiveView)

  return (
    <nav
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
        const Icon = tab.icon
        const isActive = activeView === tab.view
        return (
          <button
            key={tab.view}
            onClick={() => setActiveView(tab.view)}
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
            <Icon size={22} strokeWidth={1.5} />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

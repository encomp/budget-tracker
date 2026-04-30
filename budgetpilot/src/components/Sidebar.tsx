import { useRef } from 'react'
import { animate } from 'motion/react'
import {
  Home,
  ArrowLeftRight,
  Upload,
  PieChart,
  CreditCard,
  Settings,
  Download,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { ViewName } from '../types'
import type { Breakpoint } from '../hooks/useBreakpoint'
import { getMotionConfig } from '../lib/animation'

interface NavItem {
  view: ViewName
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: Home },
  { view: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { view: 'import', label: 'Import', icon: Upload },
  { view: 'budget', label: 'Budget', icon: PieChart },
  { view: 'debts', label: 'Debts', icon: CreditCard },
  { view: 'settings', label: 'Settings', icon: Settings },
  { view: 'export-import', label: 'Export/Import', icon: Download },
]

interface SidebarProps {
  breakpoint: Breakpoint
}

export function Sidebar({ breakpoint }: SidebarProps) {
  const activeView = useAppStore(s => s.activeView)
  const setActiveView = useAppStore(s => s.setActiveView)
  const sidebarExpanded = useAppStore(s => s.sidebarExpanded)
  const setSidebarExpanded = useAppStore(s => s.setSidebarExpanded)
  const overlayRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)

  if (breakpoint === 'mobile') return null

  function toggleExpand() {
    const cfg = getMotionConfig()
    if (sidebarExpanded) {
      if (overlayRef.current) {
        animate(overlayRef.current, { opacity: 0, x: -240 }, { duration: cfg.duration, ease: cfg.ease })
          .then(() => setSidebarExpanded(false))
      } else {
        setSidebarExpanded(false)
      }
    } else {
      setSidebarExpanded(true)
      requestAnimationFrame(() => {
        if (overlayRef.current) {
          animate(overlayRef.current, { opacity: [0, 1], x: [-240, 0] }, { duration: cfg.duration, ease: cfg.ease })
        }
      })
    }
  }

  if (breakpoint === 'tablet') {
    return (
      <>
        <nav
          ref={railRef}
          style={{
            width: 'var(--bp-sidebar-width-rail)',
            flexShrink: 0,
            background: 'var(--bp-bg-surface)',
            borderRight: '1px solid var(--bp-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '0.5rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <button
            onClick={toggleExpand}
            aria-label="Expand sidebar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--bp-text-secondary)',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              borderRadius: 'var(--bp-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={20} />
          </button>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                title={item.label}
                style={{
                  width: '48px',
                  height: '48px',
                  background: isActive ? 'var(--bp-accent-muted)' : 'none',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--bp-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? 'var(--bp-accent)' : 'var(--bp-text-secondary)',
                  borderRadius: 'var(--bp-radius-sm)',
                  marginBottom: '4px',
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
              </button>
            )
          })}
        </nav>

        {sidebarExpanded && (
          <>
            <div
              onClick={toggleExpand}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--bp-bg-overlay)',
                zIndex: 99,
              }}
            />
            <div
              ref={overlayRef}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 'var(--bp-sidebar-width-full)',
                background: 'var(--bp-bg-surface)',
                borderRight: '1px solid var(--bp-border)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem 0',
              }}
            >
              <div style={{ padding: '0.5rem 1rem 1rem', color: 'var(--bp-text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
                BudgetPilot
              </div>
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = activeView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setSidebarExpanded(false) }}
                    style={{
                      width: '100%',
                      background: isActive ? 'var(--bp-accent-muted)' : 'none',
                      border: 'none',
                      borderLeft: isActive ? '2px solid var(--bp-accent)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1.25rem',
                      color: isActive ? 'var(--bp-accent)' : 'var(--bp-text-secondary)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--bp-font-ui)',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </>
    )
  }

  // Desktop — full 240px sidebar
  return (
    <nav
      style={{
        width: 'var(--bp-sidebar-width-full)',
        flexShrink: 0,
        background: 'var(--bp-bg-surface)',
        borderRight: '1px solid var(--bp-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0',
      }}
    >
      <div style={{ padding: '0.5rem 1.25rem 1.5rem', color: 'var(--bp-text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
        BudgetPilot
      </div>
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.view
        return (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            style={{
              width: '100%',
              background: isActive ? 'var(--bp-accent-muted)' : 'none',
              border: 'none',
              borderLeft: isActive ? '2px solid var(--bp-accent)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.25rem',
              color: isActive ? 'var(--bp-accent)' : 'var(--bp-text-secondary)',
              fontSize: '0.9rem',
              fontFamily: 'var(--bp-font-ui)',
              textAlign: 'left',
            }}
          >
            <Icon size={18} strokeWidth={1.5} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

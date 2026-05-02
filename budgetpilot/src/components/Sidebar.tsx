import { useRef } from 'react'
import { animate } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { ThemeIcon } from './ThemeIcon'
import type { ViewName } from '../types'
import type { Breakpoint } from '../hooks/useBreakpoint'
import { getMotionConfig } from '../lib/animation'

interface NavItem {
  view: ViewName
  labelKey: string
  slot: string
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard',    labelKey: 'nav.dashboard',    slot: 'nav-dashboard' },
  { view: 'transactions', labelKey: 'nav.transactions', slot: 'nav-transactions' },
  { view: 'import',       labelKey: 'nav.import',       slot: 'nav-import' },
  { view: 'budget',       labelKey: 'nav.budget',       slot: 'nav-budget' },
  { view: 'debts',        labelKey: 'nav.debts',        slot: 'nav-debts' },
  { view: 'settings',     labelKey: 'nav.settings',     slot: 'nav-settings' },
  { view: 'export-import',labelKey: 'nav.exportImport', slot: 'nav-export' },
]

interface SidebarProps {
  breakpoint: Breakpoint
}

export function Sidebar({ breakpoint }: SidebarProps) {
  const { t } = useTranslation()
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
          data-testid="sidebar"
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
          {/* Logo mark — rail mode, mark only */}
          <div style={{ padding: '12px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ThemeIcon slot="logo" size={28} style={{ color: 'var(--bp-accent)' }} />
          </div>

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
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                title={t(item.labelKey)}
                data-testid={`nav-${item.view}`}
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
                <ThemeIcon slot={item.slot} size={20} />
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
                padding: '0',
              }}
            >
              {/* Logo area — full overlay mode */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px 16px 16px',
                  borderBottom: '1px solid var(--bp-border)',
                }}
              >
                <ThemeIcon slot="logo" size={28} style={{ color: 'var(--bp-accent)', flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: 'var(--bp-font-ui)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--bp-accent)',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  BudgetPilot
                </span>
              </div>

              {NAV_ITEMS.map(item => {
                const isActive = activeView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setSidebarExpanded(false) }}
                    data-testid={`nav-${item.view}`}
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
                    <ThemeIcon slot={item.slot} size={18} />
                    {t(item.labelKey)}
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
  const isRail = false
  return (
    <nav
      data-testid="sidebar"
      style={{
        width: 'var(--bp-sidebar-width-full)',
        flexShrink: 0,
        background: 'var(--bp-bg-surface)',
        borderRight: '1px solid var(--bp-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--bp-border)',
        }}
      >
        <ThemeIcon slot="logo" size={28} style={{ color: 'var(--bp-accent)', flexShrink: 0 }} />
        {!isRail && (
          <span
            style={{
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--bp-accent)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            BudgetPilot
          </span>
        )}
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = activeView === item.view
        return (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            data-testid={`nav-${item.view}`}
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
            <ThemeIcon slot={item.slot} size={18} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

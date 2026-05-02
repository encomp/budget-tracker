import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import { Settings } from './lib/settings'
import { useBreakpoint } from './hooks/useBreakpoint'
import { Sidebar } from './components/Sidebar'
import { BottomTabBar } from './components/BottomTabBar'
import { Onboarding } from './views/Onboarding'
import { TransactionModal } from './components/TransactionModal'
import {
  Dashboard,
  Transactions,
  Import,
  Budget,
  Debts,
  Settings as SettingsView,
  ExportImport,
} from './views'
import ImportRules from './views/ImportRules'
import type { ViewName } from './types'
import { Plus } from 'lucide-react'

const VIEW_MAP: Record<ViewName, React.ReactNode> = {
  dashboard: <Dashboard />,
  transactions: <Transactions />,
  import: <Import />,
  budget: <Budget />,
  debts: <Debts />,
  settings: <SettingsView />,
  'export-import': <ExportImport />,
  'import-rules': <ImportRules />,
}

export default function App() {
  const activeView = useAppStore(s => s.activeView)
  const activeMonth = useAppStore(s => s.activeMonth)
  const transactionModalOpen = useAppStore(s => s.transactionModalOpen)
  const setTransactionModalOpen = useAppStore(s => s.setTransactionModalOpen)
  const breakpoint = useBreakpoint()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)

  useEffect(() => {
    Settings.get<boolean>('onboardingCompleted').then(val => {
      setOnboardingDone(val === true)
    })
  }, [])

  if (onboardingDone === null) return null

  if (!onboardingDone) {
    return (
      <Onboarding
        breakpoint={breakpoint}
        onComplete={() => setOnboardingDone(true)}
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        background: 'var(--bp-bg-base)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Sidebar breakpoint={breakpoint} />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: breakpoint === 'mobile' ? '80px' : 0,
          transition: `opacity var(--bp-duration-normal) var(--bp-easing-default)`,
        }}
      >
        {VIEW_MAP[activeView]}
      </main>

      {/* Floating + FAB */}
      <button
        data-testid="fab-add-transaction"
        aria-label="Add transaction"
        onClick={() => setTransactionModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: breakpoint === 'mobile' ? '80px' : '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--bp-accent)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bp-bg-base)',
          boxShadow: '0 0 0 4px var(--bp-accent-glow)',
          zIndex: 60,
        }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <TransactionModal
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
        activeMonth={activeMonth}
        testId="transaction-modal"
      />

      {breakpoint === 'mobile' && <BottomTabBar />}
    </div>
  )
}

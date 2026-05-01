import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { animate } from 'motion/react'
import { useAppStore } from '../store/useAppStore'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpInput } from '../components/ui/BpInput'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpToast, useToast } from '../components/ui/BpToast'
import { ProfileSchema, type ProfileFormValues } from '../lib/schemas'
import { THEME_MIDNIGHT, applyTheme, validateTheme } from '../lib/theme'
import { getMotionConfig } from '../lib/animation'
import { Settings as SettingsStore } from '../lib/settings'
import { ChevronRight } from 'lucide-react'
import { db } from '../lib/db'
import type { BpTheme } from '../types'

function SwatchStrip() {
  const CSS_VARS = [
    '--bp-accent',
    '--bp-positive',
    '--bp-warning',
    '--bp-danger',
    '--bp-bg-surface-alt',
  ]
  return (
    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
      {CSS_VARS.map((v) => (
        <div
          key={v}
          title={v}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: `var(${v})`,
            border: '1px solid var(--bp-border)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

function ThemePreviewPanel({
  theme,
  onApply,
  onCancel,
}: {
  theme: BpTheme
  onApply: () => void
  onCancel: () => void
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!panelRef.current) return
    const cfg = getMotionConfig()
    animate(
      panelRef.current,
      { x: ['100%', '0%'], opacity: [0, 1] },
      { duration: cfg.duration, ease: cfg.ease }
    )
  }, [])

  const inlineVars = Object.entries(theme.tokens).reduce<React.CSSProperties>(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {}
  )

  return (
    <div
      ref={panelRef}
      style={{
        border: '1px solid var(--bp-border)',
        borderRadius: 'var(--bp-radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: 'var(--bp-text-muted)',
          fontFamily: 'var(--bp-font-ui)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Preview — {theme.name}
      </div>

      {/* Mini mockup rendered with theme tokens applied inline */}
      <div style={{ ...inlineVars, background: `var(--bp-bg-surface)`, borderRadius: 'var(--bp-radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: `var(--bp-text-primary)`, fontFamily: `var(--bp-font-ui)` }}>
          Sample Card
        </div>
        <div style={{ fontFamily: `var(--bp-font-mono)`, fontSize: '20px', color: `var(--bp-accent)`, fontWeight: 500 }}>
          $1,800.00
        </div>
        <div style={{ height: '8px', background: `var(--bp-bg-surface-alt)`, borderRadius: `var(--bp-radius-sm)`, overflow: 'hidden' }}>
          <div style={{ width: '65%', height: '100%', background: `var(--bp-positive)`, borderRadius: `var(--bp-radius-sm)` }} />
        </div>
        <button
          style={{
            background: `var(--bp-accent)`,
            border: 'none',
            borderRadius: `var(--bp-radius-md)`,
            color: '#000',
            fontFamily: `var(--bp-font-ui)`,
            fontSize: '13px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 500,
            alignSelf: 'flex-start',
          }}
        >
          Apply Theme
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <BpButton variant="primary" onClick={onApply}>
          Apply Theme
        </BpButton>
        <BpButton variant="ghost" onClick={onCancel}>
          Cancel
        </BpButton>
      </div>
    </div>
  )
}

const settingsRowStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--bp-border)',
  cursor: 'pointer',
  textAlign: 'left',
}

const settingsRowLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

const settingsRowTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--bp-text-primary)',
}

const settingsRowSubStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '12px',
  color: 'var(--bp-text-muted)',
}

export default function Settings() {
  const setActiveTheme = useAppStore((s) => s.setActiveTheme)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const activeTheme = useAppStore((s) => s.activeTheme)
  const { toast, showToast, dismiss } = useToast()
  const [clearConfirmOpen, setClearConfirmOpen] = React.useState(false)
  const [pendingTheme, setPendingTheme] = React.useState<BpTheme | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: '', currency: '$' },
  })

  React.useEffect(() => {
    db.profile.toCollection().first().then((p) => {
      if (p) resetForm({ name: p.name, currency: p.currency })
    })
  }, [resetForm])

  async function onProfileSave(values: ProfileFormValues) {
    await db.profile.put({ name: values.name, currency: values.currency, createdAt: new Date().toISOString() })
    showToast('Profile saved.', 'success')
  }

  function handleThemeFile(file: File) {
    if (!file.name.endsWith('.json')) {
      showToast('Please upload a .json file.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        const validated = validateTheme(parsed)
        if (!validated) {
          showToast('Invalid theme file. Missing required tokens.', 'error')
          return
        }
        setPendingTheme(validated)
      } catch {
        showToast('Invalid theme file. Missing required tokens.', 'error')
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleThemeFile(file)
  }

  function handleApplyTheme() {
    if (!pendingTheme) return
    applyTheme(pendingTheme)
    setActiveTheme(pendingTheme)
    setPendingTheme(null)
    showToast(`Theme "${pendingTheme.name}" applied.`, 'success')
  }

  function handleResetTheme() {
    applyTheme(THEME_MIDNIGHT)
    setActiveTheme(THEME_MIDNIGHT)
    SettingsStore.delete('activeTheme')
    showToast('Reset to Midnight theme.', 'info')
  }

  async function handleClearData() {
    await db.delete()
    window.location.reload()
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '24px', fontWeight: 700, color: 'var(--bp-text-primary)' }}>
        Settings
      </h1>

      {/* Profile */}
      <BpCard padding="md">
        <SectionTitle>Profile</SectionTitle>
        <form onSubmit={handleSubmit(onProfileSave)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <BpInput label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
          <BpInput label="Currency Symbol" placeholder="$" maxLength={3} error={errors.currency?.message} {...register('currency')} />
          <div>
            <BpButton variant="primary" size="sm" onClick={handleSubmit(onProfileSave)}>
              Save Profile
            </BpButton>
          </div>
        </form>
      </BpCard>

      {/* Import Rules */}
      <BpCard padding="md">
        <SectionTitle>Data</SectionTitle>
        <div style={{ marginTop: '8px' }}>
          <button onClick={() => setActiveView('import-rules')} style={settingsRowStyle}>
            <div style={settingsRowLabelStyle}>
              <span style={settingsRowTitleStyle}>Import Rules</span>
              <span style={settingsRowSubStyle}>
                Manage category rules applied automatically during CSV import
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--bp-text-muted)', flexShrink: 0 }} />
          </button>
        </div>
      </BpCard>

      {/* Appearance */}
      <BpCard padding="md">
        <SectionTitle>Appearance</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)' }}>
              Active theme: <strong style={{ color: 'var(--bp-text-primary)' }}>{activeTheme.name}</strong>
            </div>
            <SwatchStrip />
          </div>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--bp-border)',
              borderRadius: 'var(--bp-radius-md)',
              background: 'var(--bp-bg-surface-alt)',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--bp-text-muted)',
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '13px',
              transition: 'border-color var(--bp-duration-fast) var(--bp-easing-default)',
            }}
          >
            Drop a Theme Pack (.json) or click to browse
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThemeFile(f) }}
          />

          {pendingTheme && (
            <ThemePreviewPanel
              theme={pendingTheme}
              onApply={handleApplyTheme}
              onCancel={() => setPendingTheme(null)}
            />
          )}

          <div>
            <BpButton variant="secondary" size="sm" onClick={handleResetTheme}>
              Reset to Midnight
            </BpButton>
          </div>
        </div>
      </BpCard>

      {/* Danger Zone */}
      <BpCard padding="md">
        <SectionTitle>Danger Zone</SectionTitle>
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', marginBottom: '12px' }}>
            Permanently erase all transactions, budgets, and settings.
          </p>
          <BpButton variant="danger" onClick={() => setClearConfirmOpen(true)}>
            Clear All Data
          </BpButton>
        </div>
      </BpCard>

      <BpConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Delete everything?"
        description="This will permanently erase all transactions, budgets, and settings. This cannot be undone."
        confirmLabel="Delete Everything"
        variant="danger"
        onConfirm={handleClearData}
      />

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  )
}

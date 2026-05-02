import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { animate } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpInput } from '../components/ui/BpInput'
import { BpSelect } from '../components/ui/BpSelect'
import { BpConfirmDialog } from '../components/ui/BpConfirmDialog'
import { BpToast, useToast } from '../components/ui/BpToast'
import { ThemeIcon } from '../components/ThemeIcon'
import { ProfileSchema, type ProfileFormValues } from '../lib/schemas'
import { THEME_MIDNIGHT, applyTheme, validateTheme } from '../lib/theme'
import { BUNDLED_THEMES } from '../lib/themes'
import { ThemeLibrary } from '../lib/settings'
import { SUPPORTED_LOCALES } from '../lib/i18n'
import { extractFontName } from '../lib/themeUtils'
import { getMotionConfig } from '../lib/animation'
import { ChevronRight } from 'lucide-react'
import { db } from '../lib/db'
import type { BpTheme } from '../types'

// ─── ThemeSwatchStrip ────────────────────────────────────────────────────────

function ThemeSwatchStrip({ theme }: { theme: BpTheme }) {
  const SWATCH_VARS = [
    '--bp-accent',
    '--bp-positive',
    '--bp-warning',
    '--bp-danger',
    '--bp-bg-surface-alt',
  ]
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {SWATCH_VARS.map((v) => (
        <div
          key={v}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: theme.tokens[v] ?? 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// ─── ThemeCard ───────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  isRemovable,
  onApply,
  onRemove,
}: {
  theme: BpTheme
  isActive: boolean
  isRemovable: boolean
  onApply: () => void
  onRemove?: () => void
}) {
  const fontName = extractFontName(theme.tokens['--bp-font-ui'] ?? '') ?? 'System'

  return (
    <div
      data-testid={`theme-card-${theme.id}`}
      style={{
        border: isActive
          ? '2px solid var(--bp-accent)'
          : '1px solid var(--bp-border)',
        borderRadius: 'var(--bp-radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: isActive ? 'var(--bp-accent-muted)' : 'var(--bp-bg-surface-alt)',
        position: 'relative',
        transition:
          'border-color var(--bp-duration-fast) var(--bp-easing-default), ' +
          'background var(--bp-duration-fast) var(--bp-easing-default)',
        minWidth: '160px',
        flex: '1 1 160px',
        maxWidth: '220px',
      }}
    >
      {/* Active checkmark */}
      {isActive && (
        <div
          data-testid={`theme-card-active-${theme.id}`}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--bp-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4l3 3 5-6"
              stroke="var(--bp-bg-base)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Theme name */}
      <div
        style={{
          fontFamily: 'var(--bp-font-ui)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--bp-text-primary)',
          paddingRight: isActive ? '24px' : '0',
        }}
      >
        {theme.name}
      </div>

      {/* Swatch strip */}
      <ThemeSwatchStrip theme={theme} />

      {/* Font name */}
      <div
        style={{
          fontFamily: 'var(--bp-font-ui)',
          fontSize: '11px',
          color: 'var(--bp-text-muted)',
        }}
      >
        {fontName}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
        {!isActive && (
          <BpButton variant="secondary" size="sm" onClick={onApply} data-testid={`theme-card-apply-${theme.id}`}>
            Apply
          </BpButton>
        )}
        {isRemovable && onRemove && (
          <BpButton variant="ghost" size="sm" onClick={onRemove} data-testid={`theme-card-remove-${theme.id}`}>
            Remove
          </BpButton>
        )}
      </div>
    </div>
  )
}

// ─── ThemePreviewPanel ───────────────────────────────────────────────────────

function ThemePreviewPanel({
  theme,
  onSaveToLibrary,
  onSaveAndApply,
  onCancel,
}: {
  theme: BpTheme
  onSaveToLibrary: () => void
  onSaveAndApply: () => void
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

  const fontName = extractFontName(theme.tokens['--bp-font-ui'] ?? '') ?? 'System font'
  const inlineVars = Object.entries(theme.tokens).reduce<React.CSSProperties>(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {}
  )

  return (
    <div
      ref={panelRef}
      data-testid="theme-preview-panel"
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
      <div style={{ ...inlineVars, background: 'var(--bp-bg-surface)', borderRadius: 'var(--bp-radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bp-text-primary)', fontFamily: 'var(--bp-font-ui)' }}>
          Sample Card
        </div>
        <div style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '20px', color: 'var(--bp-accent)', fontWeight: 500 }}>
          $1,800.00
        </div>
        <div style={{ height: '8px', background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-sm)', overflow: 'hidden' }}>
          <div style={{ width: '65%', height: '100%', background: 'var(--bp-positive)', borderRadius: 'var(--bp-radius-sm)' }} />
        </div>
      </div>

      {/* Font label */}
      <div data-testid="theme-preview-font-label" style={{ fontSize: '12px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)' }}>
        Typography: <strong>{fontName}</strong>
      </div>

      {/* Icon slot previews — 3 nav icons rendered with this theme's overrides */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)' }}>
          Icons:
        </span>
        {(['nav-dashboard', 'nav-transactions', 'nav-budget'] as const).map((slot, idx) => (
          <ThemeIcon
            key={slot}
            slot={slot}
            size={18}
            themeOverride={theme}
            style={{ color: 'var(--bp-text-secondary)' }}
            data-testid={`theme-preview-icon-${idx + 1}`}
          />
        ))}
      </div>

      {/* Three-button footer */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <BpButton variant="primary" onClick={onSaveAndApply} data-testid="theme-save-and-apply-button">
          Save &amp; Apply
        </BpButton>
        <BpButton variant="secondary" onClick={onSaveToLibrary} data-testid="theme-save-to-library-button">
          Save to Library
        </BpButton>
        <BpButton variant="ghost" onClick={onCancel} data-testid="theme-preview-cancel">
          Cancel
        </BpButton>
      </div>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────────────────

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

// ─── Settings view ───────────────────────────────────────────────────────────

export default function Settings() {
  const { t, i18n } = useTranslation()
  const setActiveView = useAppStore((s) => s.setActiveView)
  const activeTheme = useAppStore((s) => s.activeTheme)
  const setActiveTheme = useAppStore((s) => s.setActiveTheme)
  const installedThemes = useAppStore((s) => s.installedThemes)
  const addInstalledTheme = useAppStore((s) => s.addInstalledTheme)
  const removeInstalledTheme = useAppStore((s) => s.removeInstalledTheme)
  const setLocale = useAppStore((s) => s.setLocale)
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
          showToast('Invalid theme file. Missing required tokens or reserved ID.', 'error')
          return
        }
        setPendingTheme(validated)
      } catch {
        showToast('Invalid theme file. Missing required tokens or reserved ID.', 'error')
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleThemeFile(file)
  }

  async function handleSaveToLibrary() {
    if (!pendingTheme) return
    await ThemeLibrary.add(pendingTheme)
    addInstalledTheme(pendingTheme)
    setPendingTheme(null)
    showToast(`"${pendingTheme.name}" added to your themes.`, 'success')
  }

  async function handleSaveAndApply() {
    if (!pendingTheme) return
    applyTheme(pendingTheme)
    setActiveTheme(pendingTheme)
    setPendingTheme(null)
    showToast(`"${pendingTheme.name}" applied.`, 'success')
    await ThemeLibrary.add(pendingTheme)
    addInstalledTheme(pendingTheme)
  }

  function handleApplyFromGallery(theme: BpTheme) {
    applyTheme(theme)
    setActiveTheme(theme)
    showToast(`"${theme.name}" applied.`, 'success')
  }

  async function handleRemoveTheme(theme: BpTheme) {
    await ThemeLibrary.remove(theme.id)
    removeInstalledTheme(theme.id)
    if (activeTheme.id === theme.id) {
      applyTheme(THEME_MIDNIGHT)
      setActiveTheme(THEME_MIDNIGHT)
    }
    showToast(`"${theme.name}" removed.`, 'info')
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
          <BpInput label="Name" placeholder="Your name" error={errors.name?.message} data-testid="settings-profile-name" {...register('name')} />
          <BpInput label="Currency Symbol" placeholder="$" maxLength={3} error={errors.currency?.message} data-testid="settings-profile-currency" {...register('currency')} />
          <div>
            <BpButton variant="primary" size="sm" onClick={handleSubmit(onProfileSave)} data-testid="settings-profile-save">
              Save Profile
            </BpButton>
          </div>
        </form>
      </BpCard>

      {/* Language */}
      <BpCard padding="md">
        <SectionTitle>{t('settings.language')}</SectionTitle>
        <div style={{ marginTop: '16px' }}>
          <BpSelect
            options={SUPPORTED_LOCALES.map((l) => ({ value: l.code, label: l.label }))}
            value={i18n.language.split('-')[0]}
            onValueChange={(code) => setLocale(code)}
            data-testid="settings-language-select"
          />
        </div>
      </BpCard>

      {/* Data / Import Rules */}
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
      <BpCard padding="md" data-testid="theme-gallery">
        <SectionTitle>Appearance</SectionTitle>

        {/* BUNDLED themes */}
        <div data-testid="theme-gallery-bundled" style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Bundled
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {BUNDLED_THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={activeTheme.id === theme.id}
                isRemovable={false}
                onApply={() => handleApplyFromGallery(theme)}
              />
            ))}
          </div>
        </div>

        {/* YOUR THEMES — only if user has installed themes */}
        {installedThemes.length > 0 && (
          <div data-testid="theme-gallery-installed" style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Your Themes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {installedThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={activeTheme.id === theme.id}
                  isRemovable={true}
                  onApply={() => handleApplyFromGallery(theme)}
                  onRemove={() => handleRemoveTheme(theme)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Theme Pack drop zone */}
        <div style={{ marginTop: '20px' }}>
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--bp-border)',
              borderRadius: 'var(--bp-radius-md)',
              background: 'var(--bp-bg-surface-alt)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--bp-text-muted)',
              fontFamily: 'var(--bp-font-ui)',
              fontSize: '13px',
              transition: 'border-color var(--bp-duration-fast) var(--bp-easing-default)',
            }}
          >
            + Add Theme Pack (.json) — drop or click
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            data-testid="theme-dropzone"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleThemeFile(f)
              e.target.value = ''
            }}
          />
        </div>

        {/* Preview panel */}
        {pendingTheme && (
          <ThemePreviewPanel
            theme={pendingTheme}
            onSaveToLibrary={handleSaveToLibrary}
            onSaveAndApply={handleSaveAndApply}
            onCancel={() => setPendingTheme(null)}
          />
        )}
      </BpCard>

      {/* Danger Zone */}
      <BpCard padding="md">
        <SectionTitle>Danger Zone</SectionTitle>
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', marginBottom: '12px' }}>
            Permanently erase all transactions, budgets, and settings.
          </p>
          <BpButton variant="danger" onClick={() => setClearConfirmOpen(true)} data-testid="danger-clear-data">
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

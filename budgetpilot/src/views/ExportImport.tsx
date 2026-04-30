import * as React from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpModal } from '../components/ui/BpModal'
import { BpToast, useToast } from '../components/ui/BpToast'
import { AnimatedIcon } from '../components/ui/AnimatedIcon'
import { BackupSchema } from '../lib/schemas'
import { Settings } from '../lib/settings'
import { db } from '../lib/db'

export default function ExportImport() {
  const backupReminderShown = useAppStore((s) => s.backupReminderShown)
  const setBackupReminderShown = useAppStore((s) => s.setBackupReminderShown)
  const { toast, showToast, dismiss } = useToast()

  const [lastExportDate, setLastExportDate] = React.useState<string | null>(null)
  const [exporting, setExporting] = React.useState(false)
  const [importing, setImporting] = React.useState(false)
  const [importFile, setImportFile] = React.useState<File | null>(null)
  const [importPreview, setImportPreview] = React.useState<{ tableName: string; rowCount: number }[] | null>(null)
  const [confirmImportOpen, setConfirmImportOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const init = async () => {
      const stored = await Settings.get<string>('lastExport')
      setLastExportDate(stored ?? null)

      if (!backupReminderShown && stored) {
        const daysSince = differenceInDays(new Date(), parseISO(stored))
        if (daysSince > 7) {
          showToast('Your last backup was over a week ago. Consider exporting.', 'bell')
          setBackupReminderShown(true)
        }
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await db.export({ prettyJson: true })
      const today = format(new Date(), 'yyyy-MM-dd')
      const filename = `budgetpilot-backup-${today}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      await Settings.set('lastExport', today)
      setLastExportDate(today)
      showToast('Backup exported successfully.', 'success')
    } catch {
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const result = BackupSchema.safeParse(json)
      if (!result.success) {
        showToast('Invalid backup file.', 'error')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const data = result.data
      const preview: { tableName: string; rowCount: number }[] = []

      if (data.tables) {
        for (const t of data.tables) {
          preview.push({ tableName: t.name, rowCount: t.rowCount })
        }
      } else if (data.data) {
        for (const [tableName, rows] of Object.entries(data.data)) {
          preview.push({ tableName, rowCount: (rows as unknown[]).length })
        }
      }

      setImportFile(file)
      setImportPreview(preview)
      setConfirmImportOpen(true)
    } catch {
      showToast('Invalid backup file.', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setImporting(true)
    setConfirmImportOpen(false)
    try {
      await db.import(importFile, { clearTablesBeforeImport: true })
      showToast('Data restored successfully. Reloading…', 'success')
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      showToast('Restore failed. The file may be corrupted.', 'error')
      setImporting(false)
    }
  }

  const lastExportLabel = lastExportDate
    ? `Last exported: ${format(parseISO(lastExportDate), 'MMMM d, yyyy')}`
    : 'Never exported'

  return (
    <div style={{ padding: '24px', maxWidth: '640px', color: 'var(--bp-text-primary)' }}>
      <h1
        style={{
          fontFamily: 'var(--bp-font-ui)',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '24px',
          color: 'var(--bp-text-primary)',
        }}
      >
        Export / Import
      </h1>

      {/* Export Section */}
      <BpCard padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} style={{ color: 'var(--bp-accent)' }} />
            <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '16px', fontWeight: 600 }}>
              Export Data
            </span>
          </div>
          <p style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '14px', color: 'var(--bp-text-secondary)', lineHeight: 1.6 }}>
            Downloads a full JSON backup of all your transactions, budget settings, debts, categories, and app settings.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)' }}>
              {lastExportLabel}
            </span>
            <BpButton
              variant="primary"
              icon={<Download size={14} />}
              loading={exporting}
              onClick={handleExport}
            >
              Export Backup
            </BpButton>
          </div>
        </div>
      </BpCard>

      <div style={{ marginTop: '16px' }}>
        <BpCard padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={20} style={{ color: 'var(--bp-warning)' }} />
              <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '16px', fontWeight: 600 }}>
                Restore from Backup
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                background: 'var(--bp-warning-muted)',
                border: '1px solid var(--bp-warning)',
                borderRadius: 'var(--bp-radius-sm)',
                padding: '10px 12px',
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--bp-warning)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', lineHeight: 1.5 }}>
                Restoring a backup will replace <strong>ALL</strong> current data.
              </span>
            </div>

            <p style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '14px', color: 'var(--bp-text-secondary)', lineHeight: 1.6 }}>
              Select a <code>.json</code> backup file exported from BudgetPilot.
            </p>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="import-file-input"
              />
              <BpButton
                variant="secondary"
                icon={importing ? <AnimatedIcon type="LoaderCircle" size={14} /> : <Upload size={14} />}
                loading={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Backup File
              </BpButton>
            </div>
          </div>
        </BpCard>
      </div>

      {/* Import Confirmation Modal */}
      <BpModal
        open={confirmImportOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmImportOpen(false)
            setImportFile(null)
            setImportPreview(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }
        }}
        title="Restore Backup"
        description="Review what will be restored before confirming."
        size="sm"
        footer={
          <>
            <BpButton
              variant="ghost"
              onClick={() => {
                setConfirmImportOpen(false)
                setImportFile(null)
                setImportPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            >
              Cancel
            </BpButton>
            <BpButton variant="danger" onClick={handleConfirmImport}>
              Restore
            </BpButton>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {importFile && (
            <p style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)' }}>
              File: <span style={{ fontFamily: 'var(--bp-font-mono)', color: 'var(--bp-text-primary)' }}>{importFile.name}</span>
            </p>
          )}

          {importPreview && importPreview.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--bp-font-ui)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: 'var(--bp-text-muted)', padding: '6px 0', borderBottom: '1px solid var(--bp-border)' }}>Table</th>
                  <th style={{ textAlign: 'right', color: 'var(--bp-text-muted)', padding: '6px 0', borderBottom: '1px solid var(--bp-border)' }}>Rows</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row) => (
                  <tr key={row.tableName}>
                    <td style={{ color: 'var(--bp-text-primary)', padding: '6px 0', fontFamily: 'var(--bp-font-mono)' }}>{row.tableName}</td>
                    <td style={{ color: 'var(--bp-text-secondary)', textAlign: 'right', padding: '6px 0', fontFamily: 'var(--bp-font-mono)' }}>{row.rowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)' }}>
              No table metadata in this backup file.
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              background: 'var(--bp-danger-muted)',
              border: '1px solid var(--bp-danger)',
              borderRadius: 'var(--bp-radius-sm)',
              padding: '10px 12px',
            }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--bp-danger)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '13px', color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)' }}>
              This will permanently replace your current data.
            </span>
          </div>
        </div>
      </BpModal>

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

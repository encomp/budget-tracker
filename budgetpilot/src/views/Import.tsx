import * as React from 'react'
import Papa from 'papaparse'
import { CheckCircle, Upload } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAppStore } from '../store/useAppStore'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { BpCard } from '../components/ui/BpCard'
import { BpButton } from '../components/ui/BpButton'
import { BpBadge } from '../components/ui/BpBadge'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpSelect } from '../components/ui/BpSelect'
import { BpToast, useToast } from '../components/ui/BpToast'
import { AnimatedIcon } from '../components/ui/AnimatedIcon'
import { detectBank } from '../lib/csv/fingerprints'
import { heuristicMap, isMappingComplete } from '../lib/csv/heuristics'
import { normalize, hydrateCSVSeed, deriveRuleKey, buildRuleEntries, buildPreviewRows } from '../lib/csv/categorize'
import { db } from '../lib/db'
import type { BpTransaction, MappedTransaction } from '../types'
import type { HeuristicMapping } from '../lib/csv/heuristics'

type Stage = 'upload' | 'map' | 'review'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

function Stepper({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'map', label: '2. Map' },
    { key: 'review', label: '3. Review' },
  ]
  return (
    <div data-testid="import-stepper" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const isActive = s.key === stage
        const isDone = steps.findIndex((x) => x.key === stage) > i
        return (
          <React.Fragment key={s.key}>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--bp-radius-md)',
                background: isActive ? 'var(--bp-accent)' : isDone ? 'var(--bp-accent-muted)' : 'var(--bp-bg-surface-alt)',
                color: isActive ? 'var(--bp-bg-base)' : isDone ? 'var(--bp-accent)' : 'var(--bp-text-muted)',
                fontFamily: 'var(--bp-font-ui)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? '0 0 0 3px var(--bp-accent-glow)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isDone && <CheckCircle size={12} />}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: '24px', height: '1px', background: 'var(--bp-border)' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function normalizeDate(raw: string): string {
  const parts = raw.trim().split(/[-\/]/)
  if (parts.length !== 3) return raw
  const [a, b, c] = parts
  if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
  return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
}

const REQUIRED_FIELDS: (keyof HeuristicMapping)[] = ['date', 'amount', 'description']

export default function Import() {
  const activeMonth = useAppStore((s) => s.activeMonth)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const monthCategories = useMonthCategories(activeMonth)
  // Fall back to the most recent budget's categories when the active month has none
  const fallbackCategories = useLiveQuery(async () => {
    if (monthCategories.length > 0) return []
    const latest = await db.budgets.orderBy('month').reverse().first()
    return latest?.categories ?? []
  }, [monthCategories.length], []) ?? []
  const categories = monthCategories.length > 0 ? monthCategories : fallbackCategories
  const { toast, showToast, dismiss } = useToast()

  const [stage, setStage] = React.useState<Stage>('upload')
  const [parsed, setParsed] = React.useState<ParsedCSV | null>(null)
  const [detectedBank, setDetectedBank] = React.useState<string | null>(null)
  const [mapping, setMapping] = React.useState<HeuristicMapping>({})
  const [preview, setPreview] = React.useState<MappedTransaction[]>([])
  const [categoryOverrides, setCategoryOverrides] = React.useState<Record<number, string>>({})
  const [saveAsRule, setSaveAsRule] = React.useState<Record<number, boolean>>({})
  const [ruleKeyOverrides, setRuleKeyOverrides] = React.useState<Record<number, string>>({})
  const [ruleConflicts, setRuleConflicts] = React.useState<string[]>([])
  const [processing, setProcessing] = React.useState(false)
  const [importing, setImporting] = React.useState(false)
  const [showConflictWarning, setShowConflictWarning] = React.useState(false)
  const conflictRowRefs = React.useRef<Record<number, HTMLTableRowElement | HTMLDivElement | null>>({})
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  // Conflict detection — runs on every change to categoryOverrides, saveAsRule, ruleKeyOverrides
  React.useEffect(() => {
    if (preview.length === 0) return
    const { conflicts } = buildRuleEntries(preview, categoryOverrides, saveAsRule, ruleKeyOverrides)
    setRuleConflicts(conflicts)
  }, [preview, categoryOverrides, saveAsRule, ruleKeyOverrides])

  const rulesToSaveCount = Object.entries(categoryOverrides).filter(
    ([i]) => saveAsRule[Number(i)] !== false
  ).length

  function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please upload a .csv file.', 'error')
      return
    }
    setProcessing(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? []
        const rows = result.data

        const bank = detectBank(headers)
        if (bank) {
          setDetectedBank(bank.bank)
          showToast(`${bank.bank} detected. Mapping applied automatically.`, 'success')
          // Fingerprint keys are lowercase; resolve to actual CSV header names (preserving original casing)
          const headerByNormalized: Record<string, string> = {}
          headers.forEach((h) => { headerByNormalized[h.toLowerCase().trim()] = h })
          const bankMapping: HeuristicMapping = {
            date: headerByNormalized[bank.mapping.date] ?? bank.mapping.date,
            amount: headerByNormalized[bank.mapping.amount] ?? bank.mapping.amount,
            description: headerByNormalized[bank.mapping.description] ?? bank.mapping.description,
            credit: bank.mapping.creditColumn
              ? (headerByNormalized[bank.mapping.creditColumn] ?? bank.mapping.creditColumn)
              : undefined,
            signInverted: bank.mapping.signInverted,
          }
          setParsed({ headers, rows })
          setMapping(bankMapping)
          buildPreview({ headers, rows }, bankMapping, bank.mapping.signInverted)
          setStage('review')
        } else {
          const heuristic = heuristicMap(headers, rows.slice(0, 5))
          setParsed({ headers, rows })
          setMapping(heuristic)
          setStage('map')
        }
        setProcessing(false)
      },
      error: () => {
        showToast('Failed to parse CSV file.', 'error')
        setProcessing(false)
      },
    })
  }

  async function buildPreview(data: ParsedCSV, m: HeuristicMapping, signInverted?: boolean) {
    if (!isMappingComplete(m)) return
    const csvMap = await db.csvCategoryMap.toArray()
    const persistedMap: Record<string, string> = {}
    csvMap.forEach((e) => { persistedMap[e.normalizedDescription] = e.categoryId })
    const seeded = hydrateCSVSeed(categories)
    const items = buildPreviewRows(data.rows, m, signInverted ?? false, persistedMap, seeded)
    setPreview(items)
    setCategoryOverrides({})
    setSaveAsRule({})
    setRuleKeyOverrides({})
    setRuleConflicts([])
  }

  async function handleConfirmMapping() {
    if (!parsed) return
    await buildPreview(parsed, mapping)
    setStage('review')
  }

  async function handleImport() {
    if (!preview.length) return
    setImporting(true)
    const records: BpTransaction[] = preview.map((item, i) => ({
      id: crypto.randomUUID(),
      date: item.date,
      amount: item.amount,
      type: item.type,
      categoryId: categoryOverrides[i] ?? item.categoryId,
      note: item.note,
      importSource: 'csv',
    }))

    await db.transactions.bulkAdd(records)

    const { entries } = buildRuleEntries(preview, categoryOverrides, saveAsRule, ruleKeyOverrides)
    if (entries.length > 0) {
      await db.csvCategoryMap.bulkPut(entries)
    }
    const ruleMsg = entries.length > 0 ? ` · ${entries.length} rule${entries.length > 1 ? 's' : ''} saved` : ''
    showToast(`${records.length} transactions imported${ruleMsg}`, 'success')
    setImporting(false)
    setTimeout(() => {
      setActiveView('transactions')
    }, 1200)
  }

  function handleStartOver() {
    setStage('upload')
    setDetectedBank(null)
    setParsed(null)
    setPreview([])
    setCategoryOverrides({})
    setSaveAsRule({})
    setRuleKeyOverrides({})
    setRuleConflicts([])
    setShowConflictWarning(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleImportWithoutRules() {
    const allFalse: Record<number, boolean> = {}
    Object.keys(categoryOverrides).forEach((k) => { allFalse[Number(k)] = false })
    setSaveAsRule(allFalse)
    setShowConflictWarning(false)
  }

  function handleReviewConflicts() {
    setShowConflictWarning(false)
    // Find first conflicting row index and scroll to it
    const conflictIdx = preview.findIndex((item, i) => {
      const key = ruleKeyOverrides[i] ?? deriveRuleKey(normalize(item.note))
      return ruleConflicts.includes(key) && categoryOverrides[i] !== undefined
    })
    if (conflictIdx >= 0 && conflictRowRefs.current[conflictIdx]) {
      conflictRowRefs.current[conflictIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function getRuleKey(i: number, item: MappedTransaction): string {
    return ruleKeyOverrides[i] ?? deriveRuleKey(normalize(item.note))
  }

  function isConflictRow(i: number, item: MappedTransaction): boolean {
    const key = getRuleKey(i, item)
    return ruleConflicts.includes(key) && categoryOverrides[i] !== undefined && saveAsRule[i] !== false
  }

  const isComplete = isMappingComplete(mapping)

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--bp-font-ui)', fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--bp-text-primary)' }}>
          Smart CSV Import
        </h1>
        <Stepper stage={stage} />
      </div>

      {/* Detected bank toast banner */}
      {detectedBank && (
        <div data-testid="toast-bank-detected" style={{ background: 'var(--bp-bg-surface)', border: '1px solid var(--bp-border)', borderLeft: '4px solid var(--bp-positive)', borderRadius: 'var(--bp-radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} style={{ color: 'var(--bp-positive)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-primary)' }}>
            {detectedBank} detected. Mapping applied automatically.
          </span>
        </div>
      )}

      {/* Stage 1: Upload */}
      {stage === 'upload' && (
        <BpCard padding="md">
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <p style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '14px', color: 'var(--bp-text-secondary)', textAlign: 'center' }}>
                Import transactions from your bank's CSV export.
              </p>
              <input ref={fileInputRef} data-testid="import-file-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
              <div style={{ width: '80%' }}>
                <BpButton variant="primary" icon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>
                  Select File from Device
                </BpButton>
              </div>
            </div>
          ) : (
            <div
              ref={dropZoneRef}
              data-testid="import-dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--bp-border)', borderRadius: 'var(--bp-radius-md)', background: 'var(--bp-bg-surface-alt)', padding: '48px', textAlign: 'center', cursor: 'pointer', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', fontSize: '14px' }}
            >
              {processing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <AnimatedIcon type="LoaderCircle" size={20} />
                  <span>Processing…</span>
                </div>
              ) : (
                <>
                  <Upload size={32} style={{ margin: '0 auto 12px', color: 'var(--bp-accent)', display: 'block' }} />
                  <div>Drag and drop your bank CSV here, or <span style={{ color: 'var(--bp-accent)' }}>click to browse</span></div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>Supports Chase, Bank of America, Wells Fargo, Citi, Capital One, Amex, Discover, USAA</div>
                </>
              )}
            </div>
          )}
          <input ref={!isMobile ? fileInputRef : undefined} data-testid="import-file-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
        </BpCard>
      )}

      {/* Stage 2: Manual mapping */}
      {stage === 'map' && parsed && (
        <BpCard padding="md">
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
            Map CSV Columns
          </div>

          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {REQUIRED_FIELDS.map((field) => (
                <div key={field} style={{ background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-md)', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {field}
                  </div>
                  <BpSelect
                    options={parsed.headers.map((h) => ({ value: h, label: h }))} placeholder="Select column…"
                    value={mapping[field] ?? ''}
                    onValueChange={(v) => setMapping((prev) => ({ ...prev, [field]: v }))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '40%' }}>CSV Column</th>
                  <th style={thStyle}>Maps To</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {REQUIRED_FIELDS.map((field) => (
                  <tr key={field}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '12px', color: 'var(--bp-text-muted)' }}>
                        {mapping[field] ?? '(unmapped)'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <BpSelect
                        options={parsed.headers.map((h) => ({ value: h, label: h }))} placeholder="Select column…"
                        value={mapping[field] ?? ''}
                        onValueChange={(v) => setMapping((prev) => ({ ...prev, [field]: v }))}
                      />
                    </td>
                    <td style={tdStyle}>
                      {mapping[field] ? (
                        <BpBadge variant="success">MAPPED</BpBadge>
                      ) : (
                        <BpBadge variant="warning">UNMAPPED</BpBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
            <BpButton variant="primary" disabled={!isComplete} onClick={handleConfirmMapping} data-testid="import-confirm-mapping">
              Confirm Mapping
            </BpButton>
          </div>
        </BpCard>
      )}

      {/* Stage 3: Review */}
      {stage === 'review' && (
        <BpCard padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Preview — {preview.length} transactions
            </div>
            {processing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--bp-text-muted)' }}>
                <AnimatedIcon type="LoaderCircle" size={14} />
                <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '12px' }}>Categorizing…</span>
              </div>
            )}
          </div>

          {preview.length === 0 && (
            <BpEmptyState
              heading="No rows found in this CSV"
              subtext="The file may be empty or could not be parsed correctly."
            />
          )}

          {/* Mobile card list */}
          {isMobile && preview.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {preview.slice(0, 20).map((item, i) => {
                const catId = categoryOverrides[i] ?? item.categoryId
                const catName = catId ? categories.find((c) => c.id === catId)?.name : null
                const hasCatOverride = categoryOverrides[i] !== undefined
                const ruleKey = getRuleKey(i, item)
                const isConflict = isConflictRow(i, item)

                return (
                  <div
                    key={i}
                    ref={(el) => { conflictRowRefs.current[i] = el }}
                    style={{
                      background: 'var(--bp-bg-surface-alt)',
                      borderRadius: 'var(--bp-radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      borderLeft: isConflict ? '3px solid var(--bp-warning)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note.slice(0, 30)}</span>
                      <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '13px', color: item.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)', flexShrink: 0, marginLeft: '8px' }}>
                        {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)' }}>{item.date}</span>
                      {catName ? (
                        <BpBadge variant="default">{catName}</BpBadge>
                      ) : (
                        <BpBadge variant="warning">Uncategorized</BpBadge>
                      )}
                      <BpBadge variant="csv" />
                    </div>
                    <BpSelect
                      options={[{ value: '', label: catName ? 'Change category…' : 'Assign category…' }, ...categoryOptions]}
                      value={categoryOverrides[i] ?? ''}
                      onValueChange={(v) => setCategoryOverrides((p) => ({ ...p, [i]: v }))}
                      placeholder={catName ? 'Change category…' : 'Assign category…'}
                    />
                    {/* Save-as-rule toggle — only shown when category override is set */}
                    {hasCatOverride && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          overflow: 'hidden',
                          maxHeight: hasCatOverride ? '40px' : '0',
                          opacity: hasCatOverride ? 1 : 0,
                          transition: 'max-height 150ms ease, opacity 150ms ease',
                          marginTop: '2px',
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`save-rule-${i}`}
                          checked={saveAsRule[i] !== false}
                          onChange={(e) => setSaveAsRule((p) => ({ ...p, [i]: e.target.checked }))}
                          style={{ cursor: 'pointer', accentColor: 'var(--bp-accent)' }}
                        />
                        <label htmlFor={`save-rule-${i}`} style={{ fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', cursor: 'pointer' }}>
                          Save &ldquo;
                        </label>
                        {saveAsRule[i] !== false && (
                          <input
                            type="text"
                            maxLength={30}
                            value={ruleKey}
                            readOnly={ruleKeyOverrides[i] === undefined}
                            onClick={(e) => {
                              if (ruleKeyOverrides[i] === undefined) {
                                setRuleKeyOverrides((p) => ({ ...p, [i]: ruleKey }))
                              }
                              e.currentTarget.focus()
                            }}
                            onChange={(e) => setRuleKeyOverrides((p) => ({ ...p, [i]: e.target.value }))}
                            onBlur={(e) => setRuleKeyOverrides((p) => ({ ...p, [i]: e.target.value.trim() || ruleKey }))}
                            style={{
                              background: 'transparent',
                              border: ruleKeyOverrides[i] !== undefined ? '1px solid var(--bp-accent)' : 'none',
                              borderRadius: 'var(--bp-radius-sm)',
                              color: 'var(--bp-text-muted)',
                              fontFamily: 'var(--bp-font-ui)',
                              fontSize: '12px',
                              padding: ruleKeyOverrides[i] !== undefined ? '2px 4px' : '0',
                              outline: 'none',
                              cursor: ruleKeyOverrides[i] === undefined ? 'pointer' : 'text',
                              maxWidth: '120px',
                            }}
                          />
                        )}
                        <label htmlFor={`save-rule-${i}`} style={{ fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', cursor: 'pointer' }}>
                          &rdquo; as a rule
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Desktop table */}
          {!isMobile && preview.length > 0 && (
            <div data-testid="import-preview-table" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Category</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                    <th style={thStyle}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((item, i) => {
                    const catId = categoryOverrides[i] ?? item.categoryId
                    const catName = catId ? categories.find((c) => c.id === catId)?.name : null
                    const hasCatOverride = categoryOverrides[i] !== undefined
                    const ruleKey = getRuleKey(i, item)
                    const isConflict = isConflictRow(i, item)

                    return (
                      <tr
                        key={i}
                        ref={(el) => { conflictRowRefs.current[i] = el }}
                        data-testid="preview-row"
                        style={{ borderLeft: isConflict ? '3px solid var(--bp-warning)' : undefined }}
                      >
                        <td style={tdStyle}>{item.date}</td>
                        <td style={{ ...tdStyle, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note.slice(0, 30)}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {catName ? (
                                <BpBadge variant="default">{catName}</BpBadge>
                              ) : (
                                <BpBadge variant="warning">Uncategorized</BpBadge>
                              )}
                              <BpSelect
                                options={[{ value: '', label: catName ? 'Change…' : 'Assign…' }, ...categoryOptions]}
                                value={categoryOverrides[i] ?? ''}
                                onValueChange={(v) => setCategoryOverrides((p) => ({ ...p, [i]: v }))}
                                placeholder={catName ? 'Change…' : 'Assign…'}
                              />
                            </div>
                            {/* Save-as-rule toggle */}
                            {hasCatOverride && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  maxHeight: hasCatOverride ? '28px' : '0',
                                  overflow: 'hidden',
                                  opacity: hasCatOverride ? 1 : 0,
                                  transition: 'max-height 150ms ease, opacity 150ms ease',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id={`save-rule-desktop-${i}`}
                                  checked={saveAsRule[i] !== false}
                                  onChange={(e) => setSaveAsRule((p) => ({ ...p, [i]: e.target.checked }))}
                                  style={{ cursor: 'pointer', accentColor: 'var(--bp-accent)' }}
                                />
                                <label htmlFor={`save-rule-desktop-${i}`} style={{ fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  Save &ldquo;
                                </label>
                                {saveAsRule[i] !== false && (
                                  <input
                                    type="text"
                                    maxLength={30}
                                    value={ruleKey}
                                    readOnly={ruleKeyOverrides[i] === undefined}
                                    onClick={(e) => {
                                      if (ruleKeyOverrides[i] === undefined) {
                                        setRuleKeyOverrides((p) => ({ ...p, [i]: ruleKey }))
                                      }
                                      e.currentTarget.focus()
                                    }}
                                    onChange={(e) => setRuleKeyOverrides((p) => ({ ...p, [i]: e.target.value }))}
                                    onBlur={(e) => setRuleKeyOverrides((p) => ({ ...p, [i]: e.target.value.trim() || ruleKey }))}
                                    style={{
                                      background: 'transparent',
                                      border: ruleKeyOverrides[i] !== undefined ? '1px solid var(--bp-accent)' : 'none',
                                      borderRadius: 'var(--bp-radius-sm)',
                                      color: 'var(--bp-text-muted)',
                                      fontFamily: 'var(--bp-font-ui)',
                                      fontSize: '12px',
                                      padding: ruleKeyOverrides[i] !== undefined ? '2px 4px' : '0',
                                      outline: 'none',
                                      cursor: ruleKeyOverrides[i] === undefined ? 'pointer' : 'text',
                                      maxWidth: '140px',
                                    }}
                                  />
                                )}
                                <label htmlFor={`save-rule-desktop-${i}`} style={{ fontSize: '12px', color: 'var(--bp-text-muted)', fontFamily: 'var(--bp-font-ui)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  &rdquo; as a rule
                                </label>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--bp-font-mono)', color: item.type === 'expense' ? 'var(--bp-danger)' : 'var(--bp-positive)' }}>
                          {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
                        </td>
                        <td style={tdStyle}><BpBadge variant="csv" /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary counter + action buttons */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Conflict warning */}
            {showConflictWarning && ruleConflicts.length > 0 && (
              <div style={{ background: 'var(--bp-bg-surface-alt)', border: '1px solid var(--bp-warning)', borderRadius: 'var(--bp-radius-md)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-warning)', fontWeight: 600 }}>
                  ⚠ {ruleConflicts.length} rule conflict{ruleConflicts.length > 1 ? 's' : ''} detected: {ruleConflicts.map(k => `"${k}"`).join(', ')}
                </div>
                <div style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '12px', color: 'var(--bp-text-secondary)' }}>
                  Two rows map the same keyword to different categories.
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <BpButton variant="secondary" size="sm" onClick={handleReviewConflicts}>Review Conflicts</BpButton>
                  <BpButton variant="ghost" size="sm" onClick={handleImportWithoutRules}>Import without saving rules</BpButton>
                  <BpButton variant="ghost" size="sm" onClick={() => setShowConflictWarning(false)}>Cancel</BpButton>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'stretch' : 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              {rulesToSaveCount > 0 && (
                <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-muted)' }}>
                  {preview.length} transactions · {rulesToSaveCount} rule{rulesToSaveCount > 1 ? 's' : ''} will be saved
                </span>
              )}
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                <BpButton variant="ghost" onClick={handleStartOver}>
                  Start Over
                </BpButton>
                <BpButton
                  variant="primary"
                  loading={importing}
                  data-testid="import-confirm-button"
                  onClick={() => {
                    if (ruleConflicts.length > 0) {
                      setShowConflictWarning(true)
                    } else {
                      handleImport()
                    }
                  }}
                >
                  {importing ? '' : `Import ${preview.length} Transactions`}
                </BpButton>
              </div>
            </div>
          </div>
        </BpCard>
      )}

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)', fontSize: '12px', color: 'var(--bp-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.04em', padding: '6px 10px',
  textAlign: 'left', borderBottom: '1px solid var(--bp-border)',
}
const tdStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-primary)',
  padding: '10px 10px', borderBottom: '1px solid var(--bp-border)',
}

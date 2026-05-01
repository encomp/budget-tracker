import * as React from 'react'
import Papa from 'papaparse'
import { CheckCircle, Upload } from 'lucide-react'
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
import { lookupCategory, hydrateCSVSeed } from '../lib/csv/categorize'
import { db } from '../lib/db'
import type { BpTransaction } from '../types'
import type { HeuristicMapping } from '../lib/csv/heuristics'

type Stage = 'upload' | 'map' | 'review'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

interface MappedTransaction {
  row: Record<string, string>
  date: string
  amount: number
  type: 'expense' | 'income'
  note: string
  categoryId: string | null
}

function Stepper({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'map', label: '2. Map' },
    { key: 'review', label: '3. Review' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
  const categories = useMonthCategories(activeMonth)
  const { toast, showToast, dismiss } = useToast()

  const [stage, setStage] = React.useState<Stage>('upload')
  const [parsed, setParsed] = React.useState<ParsedCSV | null>(null)
  const [detectedBank, setDetectedBank] = React.useState<string | null>(null)
  const [mapping, setMapping] = React.useState<HeuristicMapping>({})
  const [preview, setPreview] = React.useState<MappedTransaction[]>([])
  const [categoryOverrides, setCategoryOverrides] = React.useState<Record<number, string>>({})
  const [processing, setProcessing] = React.useState(false)
  const [importing, setImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

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
          buildPreview({ headers, rows }, bankMapping)
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

  async function buildPreview(data: ParsedCSV, m: HeuristicMapping) {
    if (!isMappingComplete(m)) return
    const csvMap = await db.csvCategoryMap.toArray()
    const persistedMap: Record<string, string> = {}
    csvMap.forEach((e) => { persistedMap[e.normalizedDescription] = e.categoryId })
    const seeded = hydrateCSVSeed(categories)

    const items: MappedTransaction[] = data.rows.map((row) => {
      const rawAmt = row[m.amount!] ?? '0'
      const debitAmt = parseFloat(rawAmt.replace(/[^0-9.-]/g, '')) || 0
      const creditAmt = m.credit ? parseFloat((row[m.credit] ?? '0').replace(/[^0-9.-]/g, '')) || 0 : 0
      const netAmount = Math.abs(debitAmt || creditAmt)
      // signInverted (AMEX): positive = expense, negative = income
      // default (Chase, etc.): negative = expense, positive = income
      const type: 'expense' | 'income' =
        creditAmt > 0 && debitAmt === 0 ? 'income' :
        m.signInverted ? (debitAmt > 0 ? 'expense' : 'income') :
        (debitAmt < 0 ? 'expense' : 'income')
      const note = row[m.description!] ?? ''
      const catId = lookupCategory(note, persistedMap) ?? lookupCategory(note, seeded) ?? null

      return {
        row,
        date: normalizeDate(row[m.date!] ?? ''),
        amount: netAmount,
        type,
        note,
        categoryId: catId,
      }
    })
    setPreview(items)
    setCategoryOverrides({})
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

    const uncatCount = records.filter((r) => r.categoryId === null).length
    showToast(`${records.length} transactions imported. ${uncatCount > 0 ? `${uncatCount} need categorization.` : 'All categorized.'}`, 'success')
    setImporting(false)
    setTimeout(() => {
      setActiveView('transactions')
    }, 1200)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
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
        <div style={{ background: 'var(--bp-bg-surface)', border: '1px solid var(--bp-border)', borderLeft: '4px solid var(--bp-positive)', borderRadius: 'var(--bp-radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
              <div style={{ width: '80%' }}>
                <BpButton variant="primary" icon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>
                  Select File from Device
                </BpButton>
              </div>
            </div>
          ) : (
            <div
              ref={dropZoneRef}
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
          <input ref={!isMobile ? fileInputRef : undefined} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
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
                    options={[{ value: '', label: 'Select column…' }, ...parsed.headers.map((h) => ({ value: h, label: h }))]}
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
                        options={[{ value: '', label: 'Select column…' }, ...parsed.headers.map((h) => ({ value: h, label: h }))]}
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
            <BpButton variant="primary" disabled={!isComplete} onClick={handleConfirmMapping}>
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

          {isMobile && preview.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {preview.slice(0, 20).map((item, i) => {
                const catId = categoryOverrides[i] ?? item.categoryId
                const catName = catId ? categories.find((c) => c.id === catId)?.name : null
                return (
                  <div key={i} style={{ background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    {!catId && (
                      <BpSelect options={categoryOptions} value="" onValueChange={(v) => setCategoryOverrides((p) => ({ ...p, [i]: v }))} placeholder="Assign category…" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!isMobile && preview.length > 0 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                    return (
                      <tr key={i}>
                        <td style={tdStyle}>{item.date}</td>
                        <td style={{ ...tdStyle, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note.slice(0, 30)}</td>
                        <td style={tdStyle}>
                          {catName ? (
                            <BpBadge variant="default">{catName}</BpBadge>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BpBadge variant="warning">Uncategorized</BpBadge>
                              <BpSelect options={categoryOptions} value="" onValueChange={(v) => setCategoryOverrides((p) => ({ ...p, [i]: v }))} placeholder="Assign…" />
                            </div>
                          )}
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

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', gap: '8px' }}>
            <BpButton variant="ghost" onClick={() => { setStage('upload'); setDetectedBank(null); setParsed(null); setPreview([]) }}>
              Start Over
            </BpButton>
            <BpButton variant="primary" loading={importing} onClick={handleImport}>
              {importing ? '' : `Import ${preview.length} Transactions`}
            </BpButton>
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

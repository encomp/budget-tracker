import * as React from 'react'
import { ChevronLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { useLiveRules, db } from '../lib/db'
import { useMonthCategories } from '../hooks/useMonthCategories'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useAppStore } from '../store/useAppStore'
import { BpButton } from '../components/ui/BpButton'
import { BpInput } from '../components/ui/BpInput'
import { BpSelect } from '../components/ui/BpSelect'
import { BpEmptyState } from '../components/ui/BpEmptyState'
import { BpToast, useToast } from '../components/ui/BpToast'
import { normalize } from '../lib/csv/categorize'
import type { BpCsvCategoryMap } from '../types'

export default function ImportRules() {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const activeMonth = useAppStore((s) => s.activeMonth)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'

  const rules = useLiveRules() ?? []
  const categories = useMonthCategories(activeMonth)

  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [editingKey, setEditingKey] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState<{ keyword: string; categoryId: string }>({ keyword: '', categoryId: '' })
  const [addForm, setAddForm] = React.useState<{ keyword: string; categoryId: string } | null>(null)
  const [confirmDeleteKey, setConfirmDeleteKey] = React.useState<string | null>(null)
  const [pendingUndo, setPendingUndo] = React.useState<BpCsvCategoryMap[] | null>(null)
  const [undoTimer, setUndoTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null)
  const [selectionMode, setSelectionMode] = React.useState(false)
  const longPressTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const { toast, showToast, dismiss } = useToast()

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  const filtered = rules.filter(r =>
    r.normalizedDescription.includes(search.toLowerCase().trim())
  )

  // Commit delete when navigating away
  React.useEffect(() => {
    if (activeView !== 'import-rules' && pendingUndo) {
      setPendingUndo(null)
      if (undoTimer) clearTimeout(undoTimer)
    }
  }, [activeView])

  async function performDelete(keys: string[]) {
    const snapshot = rules.filter(r => keys.includes(r.normalizedDescription))
    await db.csvCategoryMap.bulkDelete(keys)
    setPendingUndo(snapshot)
    setSelected(new Set())
    setSelectionMode(false)

    const timer = setTimeout(() => setPendingUndo(null), 10000)
    setUndoTimer(prev => { if (prev) clearTimeout(prev); return timer })

    showToast(
      `Deleted ${keys.length} rule${keys.length > 1 ? 's' : ''}.`,
      'info',
      { label: 'Undo', onClick: handleUndo }
    )
  }

  async function handleUndo() {
    if (!pendingUndo) return
    await db.csvCategoryMap.bulkPut(pendingUndo)
    setPendingUndo(null)
    if (undoTimer) clearTimeout(undoTimer)
    showToast('Rules restored.', 'success')
  }

  function handleSingleDeleteClick(key: string) {
    if (confirmDeleteKey === key) {
      performDelete([key])
      setConfirmDeleteKey(null)
    } else {
      setConfirmDeleteKey(key)
      setTimeout(() => setConfirmDeleteKey(null), 3000)
    }
  }

  function handleBulkDelete() {
    performDelete(Array.from(selected))
  }

  function startEdit(rule: BpCsvCategoryMap) {
    setEditingKey(rule.normalizedDescription)
    setEditDraft({ keyword: rule.normalizedDescription, categoryId: rule.categoryId })
    setAddForm(null)
  }

  async function saveEdit() {
    if (!editingKey || !editDraft.keyword.trim() || !editDraft.categoryId) return
    const normKey = normalize(editDraft.keyword)
    if (!normKey) return

    if (normKey !== editingKey) {
      await db.csvCategoryMap.delete(editingKey)
    }
    await db.csvCategoryMap.put({
      normalizedDescription: normKey,
      categoryId: editDraft.categoryId,
      createdAt: Date.now(),
    })
    setEditingKey(null)
  }

  async function saveAdd() {
    if (!addForm || !addForm.keyword.trim() || !addForm.categoryId) return
    const normKey = normalize(addForm.keyword)
    if (!normKey || normKey.length < 2) return
    await db.csvCategoryMap.put({
      normalizedDescription: normKey,
      categoryId: addForm.categoryId,
      createdAt: Date.now(),
    })
    setAddForm(null)
  }

  function toggleSelect(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(r => r.normalizedDescription)))
    }
  }

  function handleLongPressStart(key: string) {
    longPressTimers.current[key] = setTimeout(() => {
      setSelectionMode(true)
      setSelected(new Set([key]))
    }, 500)
  }

  function handleLongPressEnd(key: string) {
    clearTimeout(longPressTimers.current[key])
  }

  function getCategoryName(id: string): string {
    return categories.find(c => c.id === id)?.name ?? id
  }

  function getDuplicateWarning(keyword: string, currentKey: string | null): string | null {
    const norm = normalize(keyword)
    const existing = rules.find(r => r.normalizedDescription === norm && r.normalizedDescription !== currentKey)
    if (existing) {
      return `Already maps to ${getCategoryName(existing.categoryId)}. Saving will overwrite it.`
    }
    return null
  }

  // ---- Desktop / Tablet Table ----
  function renderTable() {
    const allSelected = filtered.length > 0 && selected.size === filtered.length

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bp-border)' }}>
              <th style={{ ...thStyle, width: '40px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', accentColor: 'var(--bp-accent)' }}
                />
              </th>
              <th style={{ ...thStyle, width: '40%' }}>KEYWORD</th>
              <th style={thStyle}>CATEGORY</th>
              <th style={{ ...thStyle, width: '140px' }}></th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {addForm !== null && (
              <tr style={{ background: 'var(--bp-bg-surface-alt)' }}>
                <td style={tdStyle} />
                <td style={tdStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input
                      autoFocus
                      type="text"
                      maxLength={30}
                      placeholder="Keyword…"
                      value={addForm.keyword}
                      onChange={(e) => setAddForm(f => f ? { ...f, keyword: e.target.value } : f)}
                      style={inlineInputStyle}
                    />
                    {addForm.keyword && getDuplicateWarning(addForm.keyword, null) && (
                      <span style={warningStyle}>{getDuplicateWarning(addForm.keyword, null)}</span>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <BpSelect
                    options={[{ value: '', label: 'Select category…' }, ...categoryOptions]}
                    value={addForm.categoryId}
                    onValueChange={(v) => setAddForm(f => f ? { ...f, categoryId: v } : f)}
                  />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <BpButton variant="primary" size="sm" onClick={saveAdd} disabled={!addForm.keyword.trim() || !addForm.categoryId}>Save</BpButton>
                    <BpButton variant="ghost" size="sm" onClick={() => setAddForm(null)}>Cancel</BpButton>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((rule) => {
              const isEditing = editingKey === rule.normalizedDescription
              const isConfirmingDelete = confirmDeleteKey === rule.normalizedDescription
              const catName = getCategoryName(rule.categoryId)

              if (isEditing) {
                return (
                  <tr key={rule.normalizedDescription} style={{ background: 'var(--bp-bg-surface-alt)' }}>
                    <td style={tdStyle} />
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          autoFocus
                          type="text"
                          maxLength={30}
                          value={editDraft.keyword}
                          onChange={(e) => setEditDraft(d => ({ ...d, keyword: e.target.value }))}
                          style={inlineInputStyle}
                        />
                        {editDraft.keyword && getDuplicateWarning(editDraft.keyword, editingKey) && (
                          <span style={warningStyle}>{getDuplicateWarning(editDraft.keyword, editingKey)}</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <BpSelect
                        options={[{ value: '', label: 'Select category…' }, ...categoryOptions]}
                        value={editDraft.categoryId}
                        onValueChange={(v) => setEditDraft(d => ({ ...d, categoryId: v }))}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <BpButton variant="primary" size="sm" onClick={saveEdit} disabled={!editDraft.keyword.trim() || !editDraft.categoryId}>Save</BpButton>
                        <BpButton variant="ghost" size="sm" onClick={() => setEditingKey(null)}>Cancel</BpButton>
                      </div>
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={rule.normalizedDescription} style={{ borderBottom: '1px solid var(--bp-border)' }}>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selected.has(rule.normalizedDescription)}
                      onChange={() => toggleSelect(rule.normalizedDescription)}
                      style={{ cursor: 'pointer', accentColor: 'var(--bp-accent)' }}
                    />
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--bp-font-mono)', fontSize: '13px' }}>
                    {rule.normalizedDescription}
                  </td>
                  <td style={tdStyle}>{catName}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {isTablet ? (
                        <>
                          <button
                            onClick={() => startEdit(rule)}
                            title="Edit"
                            style={iconBtnStyle}
                          >
                            <Pencil size={14} />
                          </button>
                          {isConfirmingDelete ? (
                            <>
                              <button onClick={() => handleSingleDeleteClick(rule.normalizedDescription)} style={{ ...iconBtnStyle, color: 'var(--bp-danger)', fontFamily: 'var(--bp-font-ui)', fontSize: '12px' }}>Confirm?</button>
                              <button onClick={() => setConfirmDeleteKey(null)} style={iconBtnStyle}>Cancel</button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSingleDeleteClick(rule.normalizedDescription)}
                              title="Delete"
                              style={{ ...iconBtnStyle, color: 'var(--bp-danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <BpButton variant="ghost" size="sm" onClick={() => startEdit(rule)}>Edit</BpButton>
                          {isConfirmingDelete ? (
                            <>
                              <BpButton variant="danger" size="sm" onClick={() => handleSingleDeleteClick(rule.normalizedDescription)}>Confirm?</BpButton>
                              <BpButton variant="ghost" size="sm" onClick={() => setConfirmDeleteKey(null)}>Cancel</BpButton>
                            </>
                          ) : (
                            <BpButton variant="danger" size="sm" onClick={() => handleSingleDeleteClick(rule.normalizedDescription)}>Del</BpButton>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // ---- Mobile Card List ----
  function renderMobileCards() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Add card */}
        {addForm !== null && (
          <div style={{ background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--bp-accent)' }}>
            <input
              autoFocus
              type="text"
              maxLength={30}
              placeholder="Keyword…"
              value={addForm.keyword}
              onChange={(e) => setAddForm(f => f ? { ...f, keyword: e.target.value } : f)}
              style={{ ...inlineInputStyle, width: '100%' }}
            />
            {addForm.keyword && getDuplicateWarning(addForm.keyword, null) && (
              <span style={warningStyle}>{getDuplicateWarning(addForm.keyword, null)}</span>
            )}
            <BpSelect
              options={[{ value: '', label: 'Select category…' }, ...categoryOptions]}
              value={addForm.categoryId}
              onValueChange={(v) => setAddForm(f => f ? { ...f, categoryId: v } : f)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <BpButton variant="primary" size="sm" onClick={saveAdd} disabled={!addForm.keyword.trim() || !addForm.categoryId}>Save</BpButton>
              <BpButton variant="ghost" size="sm" onClick={() => setAddForm(null)}>Cancel</BpButton>
            </div>
          </div>
        )}

        {filtered.map((rule) => {
          const isEditing = editingKey === rule.normalizedDescription
          const catName = getCategoryName(rule.categoryId)

          if (isEditing) {
            return (
              <div key={rule.normalizedDescription} style={{ background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflow: 'hidden', transition: 'max-height 200ms ease', border: '1px solid var(--bp-accent)' }}>
                <input
                  autoFocus
                  type="text"
                  maxLength={30}
                  value={editDraft.keyword}
                  onChange={(e) => setEditDraft(d => ({ ...d, keyword: e.target.value }))}
                  style={{ ...inlineInputStyle, width: '100%' }}
                />
                {editDraft.keyword && getDuplicateWarning(editDraft.keyword, editingKey) && (
                  <span style={warningStyle}>{getDuplicateWarning(editDraft.keyword, editingKey)}</span>
                )}
                <BpSelect
                  options={[{ value: '', label: 'Select category…' }, ...categoryOptions]}
                  value={editDraft.categoryId}
                  onValueChange={(v) => setEditDraft(d => ({ ...d, categoryId: v }))}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <BpButton variant="primary" size="sm" onClick={saveEdit} disabled={!editDraft.keyword.trim() || !editDraft.categoryId}>Save</BpButton>
                  <BpButton variant="ghost" size="sm" onClick={() => setEditingKey(null)}>Cancel</BpButton>
                </div>
              </div>
            )
          }

          return (
            <div
              key={rule.normalizedDescription}
              style={{ background: 'var(--bp-bg-surface-alt)', borderRadius: 'var(--bp-radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              onTouchStart={() => handleLongPressStart(rule.normalizedDescription)}
              onTouchEnd={() => handleLongPressEnd(rule.normalizedDescription)}
              onMouseDown={() => handleLongPressStart(rule.normalizedDescription)}
              onMouseUp={() => handleLongPressEnd(rule.normalizedDescription)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                {selectionMode && (
                  <input
                    type="checkbox"
                    checked={selected.has(rule.normalizedDescription)}
                    onChange={() => toggleSelect(rule.normalizedDescription)}
                    style={{ cursor: 'pointer', accentColor: 'var(--bp-accent)', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: 'var(--bp-font-mono)', fontSize: '13px', color: 'var(--bp-text-primary)', display: 'block' }}>
                    {rule.normalizedDescription}
                  </span>
                  <span style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '12px', color: 'var(--bp-text-muted)' }}>
                    {catName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <BpButton variant="ghost" size="sm" onClick={() => startEdit(rule)}>Edit</BpButton>
                  <BpButton variant="danger" size="sm" onClick={() => handleSingleDeleteClick(rule.normalizedDescription)}>
                    {confirmDeleteKey === rule.normalizedDescription ? 'Confirm?' : 'Delete'}
                  </BpButton>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', paddingBottom: isMobile ? '100px' : undefined }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveView('settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bp-text-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: 'var(--bp-radius-sm)' }}
            aria-label="Back to Settings"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--bp-font-ui)', fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: 'var(--bp-text-primary)', margin: 0 }}>
              Import Rules
            </h1>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--bp-font-ui)', fontSize: '13px', color: 'var(--bp-text-muted)', margin: '2px 0 0' }}>
                Manage category rules applied during CSV import
              </p>
            )}
          </div>
        </div>
        <BpButton
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => { setAddForm({ keyword: '', categoryId: '' }); setEditingKey(null) }}
        >
          {isMobile ? 'Add' : 'Add Rule'}
        </BpButton>
      </div>

      {/* Search + bulk delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <BpInput
            placeholder="Search rules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.size > 0 && (
          <BpButton variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleBulkDelete}>
            Delete {selected.size}
          </BpButton>
        )}
        {selectionMode && selected.size === 0 && (
          <BpButton variant="ghost" size="sm" onClick={() => { setSelectionMode(false); setSelected(new Set()) }}>
            Cancel
          </BpButton>
        )}
      </div>

      {/* Content */}
      {rules.length === 0 && addForm === null ? (
        <BpEmptyState
          heading="No import rules yet"
          subtext="Rules are created automatically when you assign categories during CSV import, or add one manually."
          action={{ label: '+ Add your first rule', onClick: () => setAddForm({ keyword: '', categoryId: '' }) }}
        />
      ) : filtered.length === 0 && search && addForm === null ? (
        <BpEmptyState
          heading={`No rules matching "${search}"`}
          subtext="Try a different keyword."
        />
      ) : isMobile ? (
        renderMobileCards()
      ) : (
        renderTable()
      )}

      {/* Mobile bulk delete bottom action bar */}
      {isMobile && selectionMode && selected.size > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bp-bg-surface)', borderTop: '1px solid var(--bp-border)', padding: '12px 16px', display: 'flex', gap: '8px', zIndex: 50, transform: 'translateY(0)', transition: 'transform 200ms ease' }}>
          <BpButton variant="danger" onClick={handleBulkDelete} style={{ flex: 1 }}>
            Delete {selected.size} rule{selected.size > 1 ? 's' : ''}
          </BpButton>
          <BpButton variant="ghost" onClick={() => { setSelectionMode(false); setSelected(new Set()) }}>
            Cancel
          </BpButton>
        </div>
      )}

      <BpToast {...toast} onDismiss={dismiss} />
    </div>
  )
}

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '11px',
  color: 'var(--bp-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
}

const tdStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '13px',
  color: 'var(--bp-text-primary)',
  padding: '10px 10px',
  borderBottom: '1px solid var(--bp-border)',
  verticalAlign: 'middle',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--bp-text-muted)',
  padding: '4px',
  borderRadius: 'var(--bp-radius-sm)',
  display: 'flex',
  alignItems: 'center',
}

const inlineInputStyle: React.CSSProperties = {
  background: 'var(--bp-bg-surface)',
  border: '1px solid var(--bp-accent)',
  borderRadius: 'var(--bp-radius-sm)',
  color: 'var(--bp-text-primary)',
  fontFamily: 'var(--bp-font-mono)',
  fontSize: '13px',
  padding: '6px 8px',
  outline: 'none',
}

const warningStyle: React.CSSProperties = {
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '11px',
  color: 'var(--bp-warning)',
}

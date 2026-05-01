import { CSV_CATEGORY_SEED, SEED_INTENT_MAP } from '../defaults'
import type { BpCategory, BpCsvCategoryMap, MappedTransaction } from '../../types'
import type { HeuristicMapping } from './heuristics'
import { parseAmount } from './parseAmount'

export function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}

export function lookupCategory(
  description: string,
  categoryMap: Record<string, string>
): string | null {
  if (!description) return null
  const norm = normalize(description)
  if (!norm) return null
  const entry = Object.entries(categoryMap).find(
    ([key]) => key && (norm.includes(key) || key.includes(norm))
  )
  return entry?.[1] ?? null
}

export function hydrateCSVSeed(
  userCategories: BpCategory[]
): Record<string, string> {
  const hydrated: Record<string, string> = {}

  for (const [key] of Object.entries(CSV_CATEGORY_SEED)) {
    const intentName = SEED_INTENT_MAP[key]
    if (!intentName) continue

    const match = userCategories.find(c =>
      c.name.toLowerCase().includes(intentName.toLowerCase()) ||
      intentName.toLowerCase().includes(c.name.toLowerCase())
    )

    if (match) {
      hydrated[key] = match.id
    }
  }

  return hydrated
}

export function deriveRuleKey(normalizedDescription: string): string {
  if (!normalizedDescription) return ''
  const meaningful = normalizedDescription.split(' ').filter(w => w.length > 2)
  if (meaningful.length === 0) return normalizedDescription.trim().slice(0, 30)
  return meaningful.slice(0, 2).join(' ')
}

function normalizeDate(raw: string): string {
  const parts = raw.trim().split(/[-\/]/)
  if (parts.length !== 3) return raw
  const [a, b, c] = parts
  if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
  return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
}

// Case-insensitive row field access — bank fingerprint keys are lowercase but
// PapaParse returns row keys with the original CSV header casing.
function getRowValue(row: Record<string, string>, key: string): string {
  if (key in row) return row[key] ?? ''
  const normKey = key.toLowerCase().trim()
  const found = Object.keys(row).find(k => k.toLowerCase().trim() === normKey)
  return (found ? row[found] : '') ?? ''
}

export function buildPreviewRows(
  rows: Record<string, string>[],
  m: HeuristicMapping,
  signInverted: boolean,
  persistedMap: Record<string, string>,
  seededMap: Record<string, string>
): MappedTransaction[] {
  return rows.map((row) => {
    const rawAmt = getRowValue(row, m.amount!)
    const debitAmt = parseAmount(rawAmt)
    const creditAmt = m.credit ? parseAmount(getRowValue(row, m.credit)) : 0
    const netAmount = Math.abs(debitAmt || creditAmt)
    const type: 'expense' | 'income' = m.credit
      ? (debitAmt !== 0 ? 'expense' : 'income')
      : signInverted
      ? (debitAmt > 0 ? 'expense' : 'income')
      : (debitAmt < 0 ? 'expense' : 'income')
    const note = getRowValue(row, m.description!)
    const catId = lookupCategory(note, persistedMap) ?? lookupCategory(note, seededMap) ?? null

    return {
      row,
      date: normalizeDate(getRowValue(row, m.date!)),
      amount: netAmount,
      type,
      note,
      categoryId: catId,
    }
  })
}

export function buildRuleEntries(
  preview: MappedTransaction[],
  categoryOverrides: Record<number, string>,
  saveAsRule: Record<number, boolean>,
  ruleKeyOverrides: Record<number, string>
): { entries: BpCsvCategoryMap[]; conflicts: string[] } {
  const seen = new Map<string, { categoryId: string; idx: number }>()
  const conflicts: string[] = []

  for (const [idxStr, categoryId] of Object.entries(categoryOverrides)) {
    const i = Number(idxStr)
    if (saveAsRule[i] === false) continue

    const rawKey = ruleKeyOverrides[i] ?? deriveRuleKey(normalize(preview[i].note))
    const key = rawKey.trim()
    if (!key) continue

    if (seen.has(key) && seen.get(key)!.categoryId !== categoryId) {
      if (!conflicts.includes(key)) conflicts.push(key)
    } else if (!seen.has(key)) {
      seen.set(key, { categoryId, idx: i })
    }
  }

  const entries: BpCsvCategoryMap[] = Array.from(seen.entries())
    .filter(([key]) => !conflicts.includes(key))
    .map(([normalizedDescription, { categoryId }]) => ({
      normalizedDescription,
      categoryId,
      createdAt: Date.now(),
    }))

  return { entries, conflicts }
}

import { describe, it, expect, vi } from 'vitest'
import { buildRuleEntries } from '../categorize'
import type { MappedTransaction } from '../../../../types'

function makeItem(note: string): MappedTransaction {
  return { row: {}, date: '2024-01-01', amount: 10, type: 'expense', note, categoryId: null }
}

describe('buildRuleEntries()', () => {
  const preview: MappedTransaction[] = [
    makeItem('ANTHROPIC SAN FRANCISCO CA'),
    makeItem('PEETS COFFEE & TEA BERKELEY'),
    makeItem('NETFLIX.COM 866-579-7172'),
    makeItem('WHOLE FOODS MARKET'),
    makeItem('ANTHROPIC CLOUD'),
  ]

  it('skips rows without categoryOverrides[i]', () => {
    const { entries } = buildRuleEntries(preview, {}, {}, {})
    expect(entries).toHaveLength(0)
  })

  it('skips rows where saveAsRule[i] === false', () => {
    const { entries } = buildRuleEntries(preview, { 0: 'cat-a' }, { 0: false }, {})
    expect(entries).toHaveLength(0)
  })

  it('uses ruleKeyOverrides[i] when set', () => {
    const { entries } = buildRuleEntries(preview, { 0: 'cat-a' }, {}, { 0: 'custom key' })
    expect(entries[0].normalizedDescription).toBe('custom key')
  })

  it('falls back to deriveRuleKey(normalize(note))', () => {
    const { entries } = buildRuleEntries(preview, { 0: 'cat-a' }, {}, {})
    expect(entries[0].normalizedDescription).toBe('anthropic san')
  })

  it('skips rows where resolved key is empty', () => {
    const emptyKeyPreview = [makeItem('')]
    const { entries } = buildRuleEntries(emptyKeyPreview, { 0: 'cat-a' }, {}, {})
    expect(entries).toHaveLength(0)
  })

  it('same key + same category → one entry (no duplicate)', () => {
    // rows 0 and 4 both normalize to "anthropic san" / "anthropic cloud" but
    // let's force same key via overrides
    const { entries } = buildRuleEntries(
      preview,
      { 0: 'cat-a', 4: 'cat-a' },
      {},
      { 0: 'anthropic', 4: 'anthropic' }
    )
    expect(entries.filter(e => e.normalizedDescription === 'anthropic')).toHaveLength(1)
  })

  it('same key + different category → flagged as conflict, excluded from entries', () => {
    const { entries, conflicts } = buildRuleEntries(
      preview,
      { 0: 'cat-a', 4: 'cat-b' },
      {},
      { 0: 'anthropic', 4: 'anthropic' }
    )
    expect(conflicts).toContain('anthropic')
    expect(entries.find(e => e.normalizedDescription === 'anthropic')).toBeUndefined()
  })

  it('returns correct { normalizedDescription, categoryId, createdAt } shape', () => {
    const before = Date.now()
    const { entries } = buildRuleEntries(preview, { 1: 'cat-dining' }, {}, {})
    const after = Date.now()
    expect(entries[0]).toMatchObject({ normalizedDescription: 'peets coffee', categoryId: 'cat-dining' })
    expect(entries[0].createdAt).toBeGreaterThanOrEqual(before)
    expect(entries[0].createdAt).toBeLessThanOrEqual(after)
  })

  it('multiple clean entries returned correctly', () => {
    const { entries, conflicts } = buildRuleEntries(
      preview,
      { 0: 'cat-a', 1: 'cat-b', 2: 'cat-c' },
      {},
      {}
    )
    expect(conflicts).toHaveLength(0)
    expect(entries).toHaveLength(3)
  })
})

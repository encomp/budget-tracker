import { describe, it, expect } from 'vitest'
import { normalize, deriveRuleKey, lookupCategory } from '../categorize'

describe('normalize()', () => {
  it('lowercases and trims', () => expect(normalize('  Hello World  ')).toBe('hello world'))
  it('strips special characters', () => expect(normalize('peets coffee & tea')).toBe('peets coffee tea'))
  it('collapses multiple spaces', () => expect(normalize('foo  bar   baz')).toBe('foo bar baz'))
  it('empty string → empty string', () => expect(normalize('')).toBe(''))
})

describe('deriveRuleKey()', () => {
  it('"anthropic san francisco ca" → "anthropic san"', () =>
    expect(deriveRuleKey('anthropic san francisco ca')).toBe('anthropic san'))

  it('"peets coffee tea berkeley" → "peets coffee"', () =>
    expect(deriveRuleKey('peets coffee tea berkeley')).toBe('peets coffee'))

  it('"interest charged on purchases" → "interest charged"', () =>
    expect(deriveRuleKey('interest charged on purchases')).toBe('interest charged'))

  it('"online payment from chk 1125" → "online payment"', () =>
    expect(deriveRuleKey('online payment from chk 1125')).toBe('online payment'))

  it('"netflix com 866 579 71" → "netflix com"', () =>
    expect(deriveRuleKey('netflix com 866 579 71')).toBe('netflix com'))

  it('single meaningful word → that word', () =>
    expect(deriveRuleKey('amazon')).toBe('amazon'))

  it('all words ≤2 chars → full string trimmed to 30', () => {
    const input = 'ab cd ef'
    expect(deriveRuleKey(input)).toBe(input.trim().slice(0, 30))
  })

  it('empty string → empty string', () => expect(deriveRuleKey('')).toBe(''))
})

describe('lookupCategory()', () => {
  const map = {
    'anthropic': 'cat-work',
    'netflix': 'cat-entertainment',
    'peets coffee': 'cat-dining',
  }

  it('exact key match returns correct categoryId', () =>
    expect(lookupCategory('netflix', map)).toBe('cat-entertainment'))

  it('norm.includes(key) partial match works', () =>
    expect(lookupCategory('ANTHROPIC SAN FRANCISCO CA', map)).toBe('cat-work'))

  it('key.includes(norm) reverse match works', () =>
    expect(lookupCategory('peets', { 'peets coffee': 'cat-dining' })).toBe('cat-dining'))

  it('no match → null', () =>
    expect(lookupCategory('whole foods market', map)).toBeNull())

  it('REGRESSION: empty description + non-empty map → null (not first entry)', () =>
    expect(lookupCategory('', map)).toBeNull())
})

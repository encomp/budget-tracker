import { describe, it, expect } from 'vitest'
import { parseAmount } from '../parseAmount'

describe('parseAmount', () => {
  it('parses standard positive',  () => expect(parseAmount('10.00')).toBe(10))
  it('parses negative',           () => expect(parseAmount('-242.19')).toBe(-242.19))
  it('parses dollar prefix',      () => expect(parseAmount('$0.46')).toBe(0.46))
  it('parses parenthetical neg',  () => expect(parseAmount('($0.11)')).toBe(-0.11))
  it('parses large parenth neg',  () => expect(parseAmount('($5,750.00)')).toBe(-5750))
  it('handles empty string',      () => expect(parseAmount('')).toBe(0))
  it('handles undefined-ish',     () => expect(parseAmount('  ')).toBe(0))
})

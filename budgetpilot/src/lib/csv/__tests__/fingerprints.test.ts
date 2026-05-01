import { describe, it, expect } from 'vitest'
import { detectBank } from '../fingerprints'

describe('detectBank', () => {
  it('detects Chase', () => {
    expect(detectBank(['Transaction Date','Post Date','Description','Category','Type','Amount','Memo'])?.bank).toBe('Chase')
  })

  it('detects AMEX 3-col (exact headers)', () => {
    expect(detectBank(['Date','Description','Amount'])?.bank).toBe('American Express')
  })

  it('detects AMEX 5-col', () => {
    expect(detectBank(['Date','Description','Card Member','Account #','Amount'])?.bank).toBe('American Express')
  })

  it('detects BofA', () => {
    expect(detectBank(['Posted Date','Reference Number','Payee','Address','Amount'])?.bank).toBe('Bank of America')
  })

  it('detects Citi', () => {
    expect(detectBank(['Date','Description','Debit','Credit'])?.bank).toBe('Citi')
  })

  it('detects Capital One', () => {
    expect(detectBank(['Transaction Date','Posted Date','Card No.','Description','Category','Debit','Credit'])?.bank).toBe('Capital One')
  })

  it('detects Discover', () => {
    expect(detectBank(['Trans. Date','Post Date','Description','Amount','Category'])?.bank).toBe('Discover')
  })

  it('detects USAA', () => {
    expect(detectBank(['Date','Description','Original Description','Category','Amount','Status'])?.bank).toBe('USAA')
  })

  it('does NOT detect AMEX for Alliant (Date,Description,Amount,Balance)', () => {
    expect(detectBank(['Date','Description','Amount','Balance'])).toBeNull()
  })

  it('picks fingerprint with most matching headers when multiple qualify', () => {
    // AMEX 5-col has more headers than AMEX 3-col, so should win
    const result = detectBank(['Date','Description','Card Member','Account #','Amount'])
    expect(result?.headers.length).toBe(5)
  })

  it('matches Chase headers regardless of capitalisation', () => {
    expect(detectBank(['Transaction Date','Post Date','Description','Category','Type','Amount','Memo'])?.bank).toBe('Chase')
  })

  it('detects Citi when CSV has extra Status and Member Name columns', () => {
    expect(detectBank(['Status','Date','Description','Debit','Credit','Member Name'])?.bank).toBe('Citi')
  })

  it('returns null for unrecognized headers', () => {
    expect(detectBank(['Foo','Bar','Baz'])).toBeNull()
  })

  it('returns null for empty headers', () => {
    expect(detectBank([])).toBeNull()
  })
})

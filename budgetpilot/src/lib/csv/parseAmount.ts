export function parseAmount(raw: string): number {
  const t = (raw ?? '').trim()
  // Parenthetical accounting notation: ($5,750.00) → -5750
  const isNegative = t.startsWith('(') && t.endsWith(')')
  const value = parseFloat(t.replace(/[^0-9.-]/g, '')) || 0
  return isNegative ? -value : value
}

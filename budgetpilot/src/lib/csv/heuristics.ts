export interface HeuristicMapping {
  date?: string
  amount?: string
  description?: string
  credit?: string
}

interface FieldHeuristic {
  headerPatterns: RegExp[]
  valuePattern: RegExp | null
}

const HEURISTICS: Record<string, FieldHeuristic> = {
  date: {
    headerPatterns: [/date/i, /time/i, /posted/i, /transaction/i],
    valuePattern: /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/,
  },
  amount: {
    headerPatterns: [/amount/i, /debit/i, /charge/i, /withdrawal/i, /sum/i],
    valuePattern: /^-?[\$£€]?\d+(\.\d{1,2})?$/,
  },
  credit: {
    headerPatterns: [/credit/i, /deposit/i, /payment/i],
    valuePattern: /^[\$£€]?\d+(\.\d{1,2})?$/,
  },
  description: {
    headerPatterns: [/desc/i, /memo/i, /merchant/i, /payee/i, /name/i, /narrative/i],
    valuePattern: null,
  },
}

function sampleMatches(
  header: string,
  rows: Record<string, string>[],
  pattern: RegExp
): boolean {
  const sample = rows.slice(0, 5)
  const matches = sample.filter(r => pattern.test((r[header] ?? '').trim()))
  return matches.length >= 3
}

export function heuristicMap(
  headers: string[],
  sampleRows: Record<string, string>[]
): HeuristicMapping {
  const mapping: HeuristicMapping = {}
  const normalized = headers.map(h => h.toLowerCase().trim())

  for (const [field, heuristic] of Object.entries(HEURISTICS)) {
    const matchedIdx = normalized.findIndex(h =>
      heuristic.headerPatterns.some(p => p.test(h))
    )
    if (matchedIdx !== -1) {
      mapping[field as keyof HeuristicMapping] = headers[matchedIdx]
      continue
    }
    if (heuristic.valuePattern) {
      const sampledHeader = headers.find(h =>
        sampleMatches(h, sampleRows, heuristic.valuePattern!)
      )
      if (sampledHeader) {
        mapping[field as keyof HeuristicMapping] = sampledHeader
      }
    }
  }

  return mapping
}

export function isMappingComplete(mapping: HeuristicMapping): boolean {
  return !!(mapping.date && mapping.amount && mapping.description)
}

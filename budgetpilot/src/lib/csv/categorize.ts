import { CSV_CATEGORY_SEED, SEED_INTENT_MAP } from '../defaults'
import type { BpCategory } from '../../types'

export function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}

export function lookupCategory(
  description: string,
  categoryMap: Record<string, string>
): string | null {
  const norm = normalize(description)
  const entry = Object.entries(categoryMap).find(
    ([key]) => norm.includes(key) || key.includes(norm)
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

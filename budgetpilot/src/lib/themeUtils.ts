/**
 * Maps a user-defined category name to the nearest ThemeIcon slot.
 * Matching is case-insensitive substring. Falls back to 'category-shopping'.
 */
export function categoryNameToSlot(name: string): string {
  const n = name.toLowerCase()
  if (/food|grocer|supermarket|walmart|costco|aldi|publix|safeway|kroger/.test(n))
    return 'category-food'
  if (/coffee|cafe|dining|restaurant|eat|drink|doordash|grubhub|chipotle|mcdonalds/.test(n))
    return 'category-coffee'
  if (/transport|transit|uber|lyft|car|gas|fuel|shell|chevron|exxon|metro/.test(n))
    return 'category-transport'
  if (/subscri|netflix|spotify|stream|disney|hulu|youtube premium|apple com/.test(n))
    return 'category-subscriptions'
  if (/health|pharmacy|medical|doctor|cvs|walgreen|rite aid/.test(n))
    return 'category-health'
  if (/util|electric|water|internet|phone|telecom|comcast|xfinity|verizon|at&t|t-mobile/.test(n))
    return 'category-utilities'
  if (/saving|invest|emergency|vacation fund|retirement/.test(n))
    return 'category-savings'
  return 'category-shopping'
}

/**
 * Extracts the first font family name from a CSS font-family stack.
 * Input:  "'DM Sans', system-ui, sans-serif"
 * Output: "DM Sans"
 * Returns null if the stack cannot be parsed.
 */
export function extractFontName(fontStack: string): string | null {
  const match = fontStack.match(/['"]?([^,'"\s][^,'"]*?)['"]?\s*(?:,|$)/)
  return match ? match[1].trim() : null
}

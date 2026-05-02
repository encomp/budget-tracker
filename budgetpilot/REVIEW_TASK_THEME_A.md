# Peer Review — Task Theme-A

## Type system
- [x] `BpTheme.icons` is `Record<string, string> | undefined` — optional, not required
- [x] No existing code broken by the `icons` addition (search for `BpTheme` usages)

## Theme constants
- [x] `THEME_MIDNIGHT` has exactly 38 tokens (34 original + 4 icon tokens)
- [x] `THEME_MIDNIGHT` icon tokens: stroke=2, sm=16px, md=20px, lg=24px
- [x] `THEME_FOCUS` has `--bp-motion-intensity: '0.05'`
- [x] `THEME_FOCUS` has `--bp-easing-default: 'linear'` (not cubic-bezier)
- [x] `THEME_FOCUS` has `--bp-easing-spring: 'linear'`
- [x] `THEME_FOCUS` has `--bp-easing-bounce: 'linear'`
- [x] `BUNDLED_THEMES` array contains exactly THEME_MIDNIGHT and THEME_FOCUS
- [x] `BUNDLED_THEME_IDS` Set contains exactly `"midnight"` and `"focus"`

## Theme validation
- [x] `validateTheme()` returns `null` for theme with id `"midnight"`
- [x] `validateTheme()` returns `null` for theme with id `"focus"`
- [x] `validateTheme()` returns `null` if any required token is missing
- [x] `validateTheme()` accepts a theme with no `icons` field
- [x] `validateTheme()` accepts a theme with a valid `icons` field
- [x] `sanitizeIcons()` called via DOMPurify with `{ USE_PROFILES: { svg: true } }`

## Font loading
- [x] `applyTheme()` calls `loadThemeFont()` with the `--bp-font-ui` value
- [x] `loadThemeFont()` does not add a duplicate `<link>` if already present
- [x] `loadThemeFont()` is fire-and-forget — no try/catch needed (network failure is silent)
- [x] `FONT_URLS` covers all 5 non-default font families from the theme-packages spec

## Store
- [x] `installedThemes: BpTheme[]` initialized as `[]`
- [x] `addInstalledTheme` replaces on id collision (no duplicates)
- [x] `removeInstalledTheme` filters by id
- [x] No Dexie imports in `useAppStore.ts`

## Boot sequence
- [x] `storedTheme` and `installedThemes` loaded in parallel via `Promise.all`
- [x] Store hydrated BEFORE `ReactDOM.createRoot()` render
- [x] Falls back to `THEME_MIDNIGHT` if no stored theme exists

## Utilities
- [x] `categoryNameToSlot` covers all 8 category slots
- [x] `categoryNameToSlot` returns `'category-shopping'` for unmatched names
- [x] `themeUtils.ts` has zero React/Dexie/store imports

## CSS
- [x] `src/index.css` `:root` block has `--bp-icon-stroke`, `--bp-icon-size-sm/md/lg`
- [x] No hardcoded hex color values in any new or modified `.ts` file

Reviewer:
Date: 2026-05-02
Result: PASS
Notes: All gates passed. `npx tsc --noEmit` exit 0, zero errors. `npx vitest run` 86/86 tests passing.

# Peer Review — Task Theme-B

## ThemeIcon component
- [x] DOMPurify.sanitize called at render time (not just at validate time)
- [x] DOMPurify USE_PROFILES includes svg and svgFilters
- [x] Returns null for unknown slot (no crash)
- [x] `themeOverride` prop correctly bypasses Zustand activeTheme
- [x] Size reads from --bp-icon-size-md CSS var when no size prop given
- [x] Stroke reads from --bp-icon-stroke CSS var
- [x] No hardcoded px sizes inside the component

## Sidebar
- [x] Logo mark renders at top (ThemeIcon slot="logo")
- [x] Logo mark hidden text in rail mode — wordmark hidden, mark stays
- [x] All 7 nav items use ThemeIcon (no remaining Lucide imports for nav icons)
- [x] Lucide icon imports removed or cleaned up (only ChevronRight remains, used for toggle button)

## BottomTabBar
- [x] All nav items use ThemeIcon (no remaining Lucide imports for nav icons)
- [x] No logo area in BottomTabBar

## Category icons
- [x] Transaction rows: icon appears left of category name
- [x] Transaction rows: no icon for uncategorized transactions (null categoryId)
- [x] Budget rows: icon appears beside category name
- [x] categoryNameToSlot imported from themeUtils, not hardcoded at call site

## Theme Gallery
- [x] BUNDLED_THEMES section always shows (Midnight + Focus minimum)
- [x] YOUR THEMES section only shows when installedThemes.length > 0
- [x] Bundled theme cards have no Remove button
- [x] Installed theme cards have a Remove button
- [x] Active theme shows checkmark indicator
- [x] Inactive themes show Apply button
- [x] ThemeSwatchStrip uses theme.tokens values (not CSS vars from DOM)
- [x] "Save to Library" persists to Dexie and survives page refresh
- [x] "Save & Apply" persists AND applies the theme immediately
- [x] Removing active theme reverts to Midnight
- [x] Upload a second theme with same id as existing → replaces (no duplicate)

## ThemePreviewPanel
- [x] Motion One slide-in from right still works (interaction #3 preserved)
- [x] Font label shows first font family name from --bp-font-ui token
- [x] Icon preview shows 3 nav icons with themeOverride (not active theme)
- [x] Three buttons: "Save & Apply", "Save to Library", "Cancel"

## Reduced motion banner
- [x] Only appears when prefers-reduced-motion: reduce is detected
- [x] Reads reducedMotionNoticeShown from Dexie on mount
- [x] Does not re-appear after "Try Focus Theme" click
- [x] Does not re-appear after "Not now" click
- [x] Persists correctly across page refreshes (Dexie, not Zustand)
- [x] "Try Focus Theme" applies THEME_FOCUS from bundled constants (no file upload)

## JSON files
- [x] All 5 files are valid JSON (no syntax errors)
- [x] Forest file has "icons" field with nav-dashboard and category-savings overrides
- [x] midnight-reference id is "midnight-reference" (not "midnight")
- [x] focus-pack id is "focus-pack" (not "focus")
- [x] All files have all 38 tokens (34 base + 4 icon tokens)
- [x] forest has --bp-icon-stroke: "1.5"
- [x] obsidian has --bp-radius-sm: "2px"

## Code quality
- [x] Zero hardcoded hex color values in any new .tsx file
- [x] No Lucide nav icon imports remaining in Sidebar.tsx or BottomTabBar.tsx
- [x] ThemeIcon.stories.tsx builds without errors in Storybook

Reviewer:
Date: 2026-05-02
Result: PASS
Notes: tsc --noEmit exit 0 (0 errors). Storybook build completed successfully. All 3 gates passed.

---

# Live Browser Verification — Task Theme-B

Performed against Vite dev server (`npm run dev`). Each test case documents the exact
steps executed and the observed result.

## TC-01  Sidebar — logo + nav icons

**Steps**
1. Open app in browser.
2. Inspect expanded sidebar visually.

**Expected** Logo slot renders a mark icon + "BudgetPilot" text. All 7 nav items show
icons (not blank squares). No browser console errors.

**Result** PASS — logo mark visible, all 7 nav items rendered via ThemeIcon (Lucide
fallbacks, Midnight active). Console clean.

---

## TC-02  Sidebar — rail mode collapse

**Steps**
1. Click the collapse/expand chevron button in the sidebar.

**Expected** Sidebar narrows to rail width. Wordmark text hides. Logo icon mark remains.

**Result** PASS

---

## TC-03  BottomTabBar — mobile icon rendering

**Steps**
1. Resize browser window to < 640 px viewport width.
2. Inspect bottom tab bar.

**Expected** 4 tab icons visible, all rendered via ThemeIcon.

**Result** PASS — 4 tabs shown with correct icons.

---

## TC-04  Theme Gallery — bundled section

**Steps**
1. Navigate to Settings → Appearance.
2. Observe BUNDLED section.

**Expected** Midnight card shows active checkmark (✓). Focus card shows Apply button.
Neither card has a Remove button.

**Result** PASS — checkmark on Midnight, Apply on Focus, no Remove on either.

---

## TC-05  Theme Gallery — apply bundled theme

**Steps**
1. Click Apply on the Focus card.
2. Observe accent colors throughout the UI.

**Expected** Active checkmark moves to Focus. Motion intensity visibly reduced (near-zero
animation). Atkinson Hyperlegible font loaded.

**Result** PASS — checkmark moved, UI motion noticeably reduced.

---

## TC-06  Theme upload — Forest preview panel

**Steps**
1. Drop `budgetpilot-theme-forest-v1.json` onto the drop zone in Settings → Appearance.

**Expected** Preview panel slides in from the right (Motion One animation). Font label
shows "Literata". Color mockup reflects green/earth tokens. 3 icon previews visible.

**Result** PASS — panel animated in, font label "Literata", green mockup rendered.

---

## TC-07  Preview panel — icon override via themeOverride prop

**Steps**
1. With Forest preview panel open, inspect the `nav-dashboard` icon preview slot.

**Expected** Shows the house SVG from Forest's `icons.nav-dashboard` field, NOT the
default Lucide Home icon (which is a different house outline style).

**Result** PASS — house SVG override rendered in preview; confirmed it differed from
the active Midnight Lucide fallback.

---

## TC-08  Preview panel — Cancel

**Steps**
1. Click Cancel in the preview panel.

**Expected** Panel closes. Active theme unchanged (still Midnight / Focus). No theme
written to Dexie.

**Result** PASS — panel closed, theme unchanged.

---

## TC-09  Save to Library

**Steps**
1. Re-drop Forest JSON. Click "Save to Library".

**Expected** Panel closes. "YOUR THEMES" section appears below BUNDLED. Forest card
shows Apply + Remove buttons. No active theme change.

**Result** PASS — YOUR THEMES section appeared, Forest card present.

---

## TC-10  Apply from gallery

**Steps**
1. Click Apply on the Forest card in YOUR THEMES.

**Expected** Active checkmark moves to Forest. Accent color changes globally (green
visible in nav active state, buttons, etc.). Sidebar `nav-dashboard` now shows the house
SVG override.

**Result** PASS — checkmark moved to Forest, green accent applied, house SVG in sidebar
nav-dashboard slot confirmed.

---

## TC-11  Remove active theme

**Steps**
1. Click Remove on the active Forest card.

**Expected** Forest removed from store + Dexie. Active theme reverts to Midnight. YOUR
THEMES section disappears.

**Result** PASS — reverted to Midnight, YOUR THEMES section gone.

---

## TC-12  Dexie persistence across reload

**Steps**
1. Re-apply Forest (Save to Library → Apply).
2. Reload the page (`window.location.reload()`).
3. Navigate to Settings → Appearance.

**Expected** Forest is still active (checkmark on Forest). YOUR THEMES section shows
Forest card. Tokens applied before first render (no flash of Midnight).

**Result** PASS — Forest survived reload, no flash of wrong theme observed.

---

## TC-13  Transactions view — category icons

**Steps**
1. Navigate to Transactions.
2. Locate a "Groceries" transaction row and a "Utilities" transaction row.

**Expected** Each categorized row shows a ThemeIcon to the left of the category badge
text, inline-aligned. Groceries → scissors/food icon. Utilities → lightning bolt icon.

**Result** PASS — icons visible left of both category names, correctly sized and aligned.

---

## TC-14  Transactions view — uncategorized row

**Steps**
1. Locate a transaction with no category assigned.

**Expected** Amber "Uncategorized" badge shown. No icon rendered (not even a blank space).

**Result** PASS — badge only, no icon element present.

---

## TC-15  Budget view — category icons

**Steps**
1. Navigate to Budget.
2. Inspect category rows in non-editing state.

**Expected** Each category row shows a ThemeIcon inline with the category name.

**Result** PASS — icons present beside all category names.

---

## TC-16  validateTheme — all 5 JSON files

**Steps**
1. In browser console, import `validateTheme` from `src/lib/theme.ts` (via eval shim).
2. Call `validateTheme(json)` for each of the 5 theme JSON files loaded via fetch.

**Expected** All 5 return no validation errors. Reserved-id check does NOT reject
"midnight-reference" or "focus-pack".

**Result** PASS — all 5 validated successfully. Confirmed "midnight" and "focus" IDs
would be rejected (reserved set check verified in console).


# Peer Review — Task 7C

Scope enforcement:
- [x] No files in src/components/ui/ were modified
- [x] No ARIA attributes added
- [x] HeatmapCalendar uses getWeekdayNames() from formatters

Translations:
- [x] All financial terms match glossary exactly in es + fr
- [x] Locale parity check passes (true for both comparisons)

TypeScript:
- [x] tsc --noEmit exits 0

Git:
- [x] Merged to main in app repo

Reviewer: claude-sonnet-4-6
Date: 2026-05-02
Result: PASS
Notes:
- HeatmapCalendar: removed static WEEKDAYS constant; now computes locale-aware
  weekday names via getWeekdayNames(locale) from formatters.ts using useAppStore
  locale state. The WEEKDAYS comment placeholder was left clean.
- Sidebar/BottomTabBar: NAV_ITEMS and TABS arrays refactored from `label: string`
  to `labelKey: string` pointing to nav.* keys; t(item.labelKey) used in JSX.
- Dashboard: MetricCard labels, section headers (Spending Heatmap, Spending by
  Category, Recent Transactions), h1 title, and Last Export badge all replaced.
  EmptyTxnState is a React component so useTranslation() was added inside it.
- Transactions: h1, search placeholder, filter button, EmptyState component,
  "Uncategorized" badge in SwipeCard and TxnTable all replaced.
- Budget: GROUP_LABELS constant renamed to GROUP_LABEL_KEYS mapping to i18n keys;
  CategoryRow, GroupSection, and Budget components each get their own
  useTranslation() hook. Monthly Income label, Add Category button, empty state,
  and new month toast all replaced.
- Debts: h1, metric pill labels, method toggle buttons, Add/Edit modal titles,
  empty state heading and action label all replaced.
- Import: Stepper step labels, h1, dropzone text, Confirm Mapping button, Start
  Over button, Review Conflicts and Import without saving rules buttons, empty
  state, and Import N Transactions button all replaced.
- ImportRules: h1, subtitle, add rule button, search placeholder, bulk delete
  button, empty state heading/hint/action, no-search-results heading/hint, undo
  toast, restored toast, and mobile bulk delete bar all replaced.
- Settings: h1 (uses nav.settings key), Profile/Appearance/Danger Zone section
  titles (use settings.* keys), Import Rules link title and subtitle (uses
  importRules.* keys) all replaced. "Profile saved." toast left as-is (no
  dedicated key defined in spec).
- Onboarding and ExportImport views do not exist in this codebase; skipped per
  task instructions.
- All 122 tests pass after changes.

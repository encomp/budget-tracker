# 🧭 BudgetPilot — MVP Development Brief v1
**Product:** Privacy-First Personal Budget Tracker
**Stack:** React 18 + Vite + TypeScript · Zustand · Dexie.js · Nivo · shadcn/ui · React Hook Form + Zod · date-fns · Motion One · Lucide React · Vitest · vite-plugin-pwa
**Target Platform:** Etsy digital download — ships as Vite-built `dist/` folder · Installable as PWA on desktop and iPad

> **Agent Execution Note:** This document contains everything needed to build the
> BudgetPilot MVP in one shot. Follow the build order in Section 5 exactly.
> Do not add features outside the MVP Feature Set. Do not deviate from the data
> schema in Section 3. Flag any implementation ambiguity as a comment in code
> rather than making undocumented assumptions.

---

## Section 1 — Product Context

### Why This Product Exists

Budget tracker spreadsheets are the #1 digital product category on Etsy by combined
demand score (78/100) and pain score (15/15). The top-selling incumbent has 10,000+
sales at 4.8★ — yet its reviews consistently surface four unresolved pain points that
a SPA is architecturally positioned to eliminate:

| Pain Point | Incumbent Failure | SPA Solution |
|---|---|---|
| Manual entry fatigue | Raw spreadsheet cells, no validation | Guided form + Smart CSV import |
| Broken formulas | User edits break Excel logic | JS functions — invisible, unbreakable |
| Privacy concerns | Google Sheets syncs to Google servers | 100% local storage — data never leaves device |
| Poor mobile experience | Google Sheets is clunky on phones | Responsive HTML layout |

### Competitive Landscape

Zero SPA competitors exist on Etsy for this niche. All current products are Google
Sheets or Excel templates. This is a clear field.

### Target User Persona

A 25–40-year-old professional or couple who wants financial control but finds
spreadsheets intimidating and budgeting apps (Mint, YNAB) invasive due to bank-linking
requirements. They may have bought an Etsy budget spreadsheet before and abandoned it.
They want something that opens in a browser and "just works" — no account, no sync,
no setup friction.

**Primary use device:** Desktop browser (sit-down activity). Responsive for tablet.
Mobile is a nice-to-have, not a requirement.

---

## Section 2 — UX & Design Specification

### Emotional UX Philosophy

BudgetPilot is not just a tool — it is an environment the user inhabits daily. The
theme engine exists to support this: different users respond to different emotional
registers when managing money. Some want the calm authority of a private banking
dashboard. Others want warmth and approachability. The hot-swappable theme system
allows BudgetPilot to meet each user where they are — and creates a post-purchase
monetization loop through premium theme packs sold as separate Etsy listings.

### Theme Engine Architecture

All visual tokens are defined as CSS Custom Properties (variables) on `:root`. No
color, spacing, or typography value is hardcoded anywhere in the component tree.
Every component reads exclusively from these variables.

A theme is a plain JSON file that maps variable names to values. Applying a theme
is a single operation:

```typescript
// ThemeEngine — core apply function
// src/lib/theme.ts
export function applyTheme(theme: BpTheme): void {
  const root = document.documentElement;
  Object.entries(theme.tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  db.settings.put({ key: 'activeTheme', value: theme });
}
```

On app boot, read the active theme from Dexie (`settings` table, key `activeTheme`).
If present, call `applyTheme()` before the first React render. If absent, apply
`THEME_MIDNIGHT`. Because Dexie reads are async, the theme is resolved in a
`useEffect` in the root `App.tsx` before any view renders — use a `themeReady`
boolean gate to prevent a flash of unstyled content.

### Required CSS Variables (Full Token Set)

Every theme JSON must define all of the following tokens. Missing tokens fall back
to the Midnight defaults.

```css
/* Backgrounds */
--bp-bg-base          /* App background — deepest layer */
--bp-bg-surface       /* Card / panel background */
--bp-bg-surface-alt   /* Slightly lighter surface (hover states, alternating rows) */
--bp-bg-overlay       /* Modal backdrop */

/* Borders */
--bp-border           /* Default border color */
--bp-border-strong    /* Emphasized border (active states) */

/* Brand / Accent */
--bp-accent           /* Primary CTA, links, active nav items */
--bp-accent-muted     /* Accent at low opacity (backgrounds, tags) */
--bp-accent-glow      /* Box-shadow glow color for accent elements */

/* Semantic colors — do not override meaning */
--bp-positive         /* Income, under-budget, success states */
--bp-warning          /* Approaching limit (60–85% of budget) */
--bp-danger           /* Over budget, errors, destructive actions */
--bp-positive-muted   /* Positive at low opacity */
--bp-warning-muted    /* Warning at low opacity */
--bp-danger-muted     /* Danger at low opacity */

/* Typography */
--bp-text-primary     /* Headings, key values */
--bp-text-secondary   /* Labels, descriptions */
--bp-text-muted       /* Placeholder text, disabled states */
--bp-font-ui          /* Font stack for UI labels */
--bp-font-mono        /* Font stack for numbers, amounts, codes */

/* Radius */
--bp-radius-sm        /* Small elements: badges, tags (6px default) */
--bp-radius-md        /* Cards, inputs (10px default) */
--bp-radius-lg        /* Modals, panels (16px default) */

/* Heatmap Calendar (semantic — must honor meaning) */
--bp-heat-none        /* No spending */
--bp-heat-low         /* Under daily budget */
--bp-heat-mid         /* At daily budget */
--bp-heat-high        /* Over daily budget */

/* Animation & Motion — fully theme-controllable */
--bp-duration-fast       /* Micro-interactions e.g. hover, icon press (150ms default) */
--bp-duration-normal     /* Standard transitions e.g. tab switch, card mount (300ms default) */
--bp-duration-slow       /* Emphasis transitions e.g. onboarding (600ms default) */
--bp-easing-default      /* Standard ease-in-out (cubic-bezier(0.4, 0, 0.2, 1)) */
--bp-easing-spring       /* Overshoot for modals/panels (cubic-bezier(0.34, 1.56, 0.64, 1)) */
--bp-easing-bounce       /* Playful bounce for celebrations (cubic-bezier(0.68, -0.55, 0.265, 1.55)) */
--bp-motion-intensity    /* Global motion scalar 0–1. Set to 0 for reduced-motion themes. */

/* Layout — sidebar widths */
--bp-sidebar-width-full  /* Desktop labeled sidebar (240px default) */
--bp-sidebar-width-rail  /* Tablet icon-only rail (64px default) */
```

### Bundled Default Theme: "Midnight"

This theme is hardcoded as a JS constant inside the app. It is the baseline and must
always load even if no theme file has been uploaded.

```typescript
// src/lib/themes/midnight.ts
export const THEME_MIDNIGHT: BpTheme = {
  id: "midnight",
  name: "Midnight",
  description: "Sleek dark dashboard. Elegant. Finance-grade.",
  version: "1.0",
  tokens: {
    "--bp-bg-base":          "#040810",
    "--bp-bg-surface":       "#070d1a",
    "--bp-bg-surface-alt":   "#0a1220",
    "--bp-bg-overlay":       "rgba(0,0,0,0.72)",
    "--bp-border":           "#1e293b",
    "--bp-border-strong":    "#334155",
    "--bp-accent":           "#14b8a6",
    "--bp-accent-muted":     "rgba(20,184,166,0.12)",
    "--bp-accent-glow":      "rgba(20,184,166,0.25)",
    "--bp-positive":         "#14b8a6",
    "--bp-warning":          "#f59e0b",
    "--bp-danger":           "#ef4444",
    "--bp-positive-muted":   "rgba(20,184,166,0.1)",
    "--bp-warning-muted":    "rgba(245,158,11,0.1)",
    "--bp-danger-muted":     "rgba(239,68,68,0.1)",
    "--bp-text-primary":     "#f1f5f9",
    "--bp-text-secondary":   "#94a3b8",
    "--bp-text-muted":       "#475569",
    "--bp-font-ui":          "'DM Sans', system-ui, sans-serif",
    "--bp-font-mono":        "'DM Mono', 'Courier New', monospace",
    "--bp-radius-sm":        "6px",
    "--bp-radius-md":        "10px",
    "--bp-radius-lg":        "16px",
    "--bp-heat-none":        "#0f172a",
    "--bp-heat-low":         "#134e4a",
    "--bp-heat-mid":         "#f59e0b",
    "--bp-heat-high":        "#ef4444",
    // Animation tokens
    "--bp-duration-fast":    "150ms",
    "--bp-duration-normal":  "300ms",
    "--bp-duration-slow":    "600ms",
    "--bp-easing-default":   "cubic-bezier(0.4, 0, 0.2, 1)",
    "--bp-easing-spring":    "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "--bp-easing-bounce":    "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    "--bp-motion-intensity": "1",
    // Layout tokens
    "--bp-sidebar-width-full": "240px",
    "--bp-sidebar-width-rail": "64px",
  }
} as const;
```

### Theme Upload Mechanic (Settings View)

The theme upload UI lives in the Settings view under an "Appearance" section.

**Interaction flow:**
1. User sees current active theme name + a thumbnail preview swatch strip
   (5 accent color previews rendered from the current theme tokens)
2. A drag-and-drop zone labeled **"Drop a Theme Pack (.json)"** accepts `.json` files
3. On drop or file-select: parse JSON, validate that it contains a `tokens` key with
   at least the 6 required tokens. If invalid: show an error toast.
4. If valid: render a **Theme Preview Panel** — a mini mockup showing a card, a
   button, and a progress bar rendered with the new theme's tokens (not yet applied)
5. Two buttons: **"Apply Theme"** (calls `applyTheme()`, saves to `bp_active_theme`)
   and **"Cancel"**
6. On apply: show success toast — "Theme applied. Your dashboard has a new look."
7. A **"Reset to Midnight"** button always visible — calls `applyTheme(THEME_MIDNIGHT)`
   and deletes the `activeTheme` record from the Dexie `settings` table

**Minimum required tokens for validation:**
`--bp-bg-base`, `--bp-accent`, `--bp-text-primary`, `--bp-border`,
`--bp-positive`, `--bp-danger`

**Theme pack naming convention (for Etsy listings):**
`budgetpilot-theme-[name]-v[version].json`
e.g. `budgetpilot-theme-forest-v1.json`, `budgetpilot-theme-rose-v1.json`

### UX Signature Widget — Spending Heatmap Calendar

This is the single feature that makes BudgetPilot visually distinct from every
spreadsheet competitor. It must be implemented exactly as described:

- A **month-view calendar grid** (7 columns × 5–6 rows)
- Each day cell is **color-coded** using `--bp-heat-*` CSS variables based on
  spending vs. daily budget allowance. Colors update automatically when a theme is
  applied — zero hardcoded colors in the calendar component.
  - No spending: `var(--bp-heat-none)`
  - Under daily budget: `var(--bp-heat-low)`
  - At daily budget: `var(--bp-heat-mid)`
  - Over daily budget: `var(--bp-heat-high)`
- Colors **update in real time** as transactions are added or edited
- Hovering a day cell shows a **tooltip** listing: date, total spent, category breakdown
- Daily budget allowance = `monthlyBudget / daysInMonth`

### Navigation Structure

Seven views accessible via a fixed left sidebar:

```
1. Dashboard        ← Default view on load
2. Transactions
3. Import (CSV)
4. Budget
5. Debts
6. Settings
7. Export / Import
```

Sidebar collapses to a bottom tab bar on screens < 768px.

---

## Section 3 — Data Schema

### Database: Dexie.js (IndexedDB)

All persistent app data lives in a single Dexie database named `BudgetPilotDB`.
No localStorage, no sessionStorage. The database is defined once in
`src/lib/db.ts` and imported wherever data access is needed.

### TypeScript Type Definitions

```typescript
// src/types/index.ts

export type TransactionType = 'expense' | 'income';
export type AllocationGroup = 'needs' | 'wants' | 'savings';
export type ImportSource = 'manual' | 'csv';

export interface BpProfile {
  id?: number;             // Dexie auto-increment — always 1 (single record)
  name: string;
  currency: string;        // symbol e.g. "$", "€", "£"
  createdAt: string;       // "YYYY-MM-DD"
}

export interface BpCategory {
  id: string;              // crypto.randomUUID()
  name: string;            // e.g. "Groceries"
  group: AllocationGroup;
}

export interface BpBudget {
  id?: number;             // Dexie auto-increment
  month: string;           // "YYYY-MM" e.g. "2026-04"
  monthlyIncome: number;
  allocation: {
    needs: number;         // percentage e.g. 50
    wants: number;         // e.g. 30
    savings: number;       // e.g. 20
  };
  categoryLimits: {
    categoryId: string;
    limit: number;         // monthly cap in currency units
  }[];
}

export interface BpTransaction {
  id: string;              // crypto.randomUUID()
  date: string;            // "YYYY-MM-DD"
  amount: number;          // always positive — type field determines sign
  type: TransactionType;
  categoryId: string | null; // null = uncategorized (CSV import only)
  note: string;
  importSource: ImportSource;
}

export interface BpDebt {
  id: string;              // crypto.randomUUID()
  name: string;            // e.g. "Visa Card"
  balance: number;
  apr: number;             // annual percentage rate e.g. 19.99
  minPayment: number;
}

export interface BpSetting {
  key: string;             // primary key — used as a typed enum below
  value: unknown;
}
// Valid setting keys:
//   'onboardingCompleted' → boolean
//   'lastExport'          → string ("YYYY-MM-DD")
//   'activeTheme'         → BpTheme object

export interface BpTheme {
  id: string;
  name: string;
  description: string;
  version: string;
  tokens: Record<string, string>; // CSS variable name → value
}

export interface BpCsvCategoryMap {
  normalizedDescription: string; // primary key — lowercased + trimmed
  categoryId: string;
}
```

### Dexie Database Definition

```typescript
// src/lib/db.ts
import Dexie, { type EntityTable } from 'dexie';
import type {
  BpProfile, BpBudget, BpTransaction, BpDebt,
  BpSetting, BpCsvCategoryMap
} from '../types';

export class BudgetPilotDB extends Dexie {
  profile!:        EntityTable<BpProfile,        'id'>;
  budgets!:        EntityTable<BpBudget,          'id'>;
  transactions!:   EntityTable<BpTransaction,     'id'>;
  debts!:          EntityTable<BpDebt,            'id'>;
  settings!:       EntityTable<BpSetting,         'key'>;
  csvCategoryMap!: EntityTable<BpCsvCategoryMap,  'normalizedDescription'>;

  constructor() {
    super('BudgetPilotDB');
    this.version(1).stores({
      profile:        '++id',
      budgets:        '++id, month',
      transactions:   'id, date, categoryId, importSource',
      debts:          'id',
      settings:       'key',
      csvCategoryMap: 'normalizedDescription',
    });
  }
}

export const db = new BudgetPilotDB();
```

### Schema Rules the Agent Must Enforce

- All monetary values stored as `number` — never formatted strings
- All entity IDs via `crypto.randomUUID()` — except Dexie auto-increment tables
  (`profile`, `budgets`) which use `++id`
- Dates as `"YYYY-MM-DD"` strings — never `Date` objects. Use
  `Intl.DateTimeFormat` for all display formatting.
- `categoryId` on transactions is `string | null` — `null` is only valid for
  CSV-imported transactions pending categorization. Manual transactions must always
  have a valid `categoryId`.
- `csvCategoryMap` keys are always `normalize(description)` before storage and
  lookup — lowercase, trimmed, special characters removed, spaces collapsed.
- Theme tokens are never hardcoded in components — always `var(--bp-*)`.
- The `settings` table is a generic key/value store. Always access via typed
  helper functions, never raw strings inline:

```typescript
// src/lib/settings.ts
export const Settings = {
  get: <T>(key: string) => db.settings.get(key).then(r => r?.value as T),
  set: (key: string, value: unknown) => db.settings.put({ key, value }),
  delete: (key: string) => db.settings.delete(key),
};
```


---

## Section 4 — MVP Feature Set

Build exactly these 7 features. Nothing more for the MVP.

### Feature 1: Guided Transaction Entry Form
- Modal triggered by a persistent `+ Add Transaction` button visible on all views
- Built with **React Hook Form + Zod** (`TransactionSchema`) — typed validation,
  no manual error state management
- Fields: Date (default today), Amount, Type (income/expense toggle), Category
  (shadcn `Select` dropdown from current month's categories), Note (optional)
- Validation: Amount > 0, valid `"YYYY-MM-DD"` date (via `date-fns` `isValid`),
  Category required
- On save: append to `db.transactions` with `importSource: "manual"`, close modal,
  `useLiveQuery` auto-refreshes active view
- Inline errors via React Hook Form `formState.errors` — no `alert()` dialogs

### Feature 2: Monthly Budget Planner
- User sets monthly income for the current month
- 50/30/20 allocation default — three sliders that always sum to 100%
- Category list grouped by Needs / Wants / Savings with editable limits and
  progress bars showing spent vs. limit
- Add, rename, delete categories within each group
- Changing the month selector creates a new `bp_budgets` entry, copying categories
  from the previous month as defaults

### Feature 3: Real-Time Spending Dashboard
- Summary cards: Total Income, Total Expenses, Remaining Balance, Savings Rate %
  — numbers animate in via count-up on mount using `requestAnimationFrame`
- **Spending Heatmap Calendar** — uses `--bp-heat-*` CSS variables (fully theme-aware).
  Cell color transitions use `var(--bp-duration-normal)` and `var(--bp-easing-default)`.
  Touch behavior: tap to show tooltip, auto-dismiss after 3 seconds with opacity
  fade-out. Tooltip anchored above cell, flips below near viewport top edge.
- **Interactive donut chart** (`@nivo/pie`) — spring-animated slice entrance on mount.
  Theme-aware via Nivo's `theme` prop mapped to `--bp-*` CSS variables. Click a
  slice to filter the Recent Transactions list below.
- Recent Transactions list: last 8 entries with date, category, amount, source badge
  ("CSV" or "Manual"). Edit and delete per row.

### Feature 4: JSON Export / Import
- Export: uses Dexie's built-in `db.export()` — downloads
  `budgetpilot-backup-YYYY-MM-DD.json` containing all tables including
  `csvCategoryMap`
- Import: file picker → Zod validation of file structure → preview modal
  (table count + export date) → `db.import()` confirm before overwriting
- Auto-backup reminder: if `lastExport` setting > 7 days ago, toast on app
  load (once per session). Animated `<BellRing>` icon (lucide-react-dynamic).
- On export: `Settings.set('lastExport', today)`

### Feature 5: Debt Snowball Calculator
- Debt entry list (name, balance, APR, minimum payment) — React Hook Form +
  Zod (`DebtSchema`) for all entry validation
- Extra monthly payment input
- Snowball (lowest balance first) / Avalanche (highest APR first) toggle —
  pure TS functions `calculateSnowball()` / `calculateAvalanche()` in
  `src/lib/calculations.ts`, covered by Vitest
- **Payoff timeline bar chart** (`@nivo/bar`) — animated entrance, theme-aware
  via Nivo `theme` prop mapped to `--bp-*` variables. Bars recalculate in
  real time as extra payment changes.
- **Premium payoff slider:**
  - Custom styled `input[type=range]` thumb — 44×44px touch target
  - Thumb color: `var(--bp-accent)` — auto theme-aware
  - Active state: `scale(1.15)` + glow ring via `var(--bp-accent-muted)`
  - All transitions use `var(--bp-duration-fast)` + `var(--bp-easing-spring)`
- Total interest saved callout (method vs. minimum-only)

### Feature 6: Hot-Swappable Theme Engine

All component styles use `var(--bp-*)` CSS variables exclusively. No hardcoded
colors, durations, or easing values anywhere in the component tree.

**Boot sequence:**
1. Await `Settings.get<BpTheme>('activeTheme')` from Dexie
2. If present: `applyTheme(storedTheme)` before first render
3. If absent: `applyTheme(THEME_MIDNIGHT)`

**`applyTheme(theme: BpTheme)` function:**
Sets all `theme.tokens` entries on `document.documentElement` via `setProperty`,
then `Settings.set('activeTheme', theme)`.

**Motion One — exactly 4 interactions (all others use CSS transitions):**
- Modal entrance / exit — spring scale + opacity
- Onboarding step transitions — slide + fade between steps
- Theme preview panel reveal — slide in from right
- Sidebar expand/collapse on tablet — width transition from rail to full

All Motion One calls read duration and easing from CSS variables at runtime:
```typescript
// src/lib/animation.ts
export function getMotionConfig() {
  const style = getComputedStyle(document.documentElement);
  return {
    duration: parseFloat(style.getPropertyValue('--bp-duration-normal')) / 1000,
    easing: style.getPropertyValue('--bp-easing-spring').trim(),
  };
}
```

**CSS transitions — all other motion:**
Every component uses `transition` properties driven by theme tokens:
```css
.bp-card {
  transition:
    background  var(--bp-duration-fast) var(--bp-easing-default),
    border-color var(--bp-duration-fast) var(--bp-easing-default),
    transform    var(--bp-duration-fast) var(--bp-easing-spring);
}
```

**Settings → Appearance UI:**
- Active theme name + 5-color accent swatch strip
- Drag-and-drop zone for `.json` theme pack upload
- On upload: `validateTheme()` (Zod schema) → Theme Preview Panel
- Preview Panel: mini card + button + progress bar with new theme tokens
- "Apply Theme" / "Cancel" / "Reset to Midnight" buttons

**Validation:** Reject uploads missing any of:
`--bp-bg-base`, `--bp-accent`, `--bp-text-primary`, `--bp-border`,
`--bp-positive`, `--bp-danger`

**What theme packs can sell as motion personalities:**

| Theme Pack | Motion Character | Key Token Values |
|---|---|---|
| Midnight (default) | Confident, precise | 300ms, smooth easing |
| Forest | Organic, unhurried | 500ms, gentle bounce |
| Rose | Warm, playful | 250ms, strong spring |
| Focus (accessibility) | Instant, no distraction | `--bp-motion-intensity: 0.05` |

### Feature 7: Smart CSV Import (Layers 1 + 2 + Seed Categorization)

The "magic moment" feature. Importing a bank CSV just works — no manual column
assignment for known banks, intelligent detection for unknown ones.

#### Import Pipeline

Three stages run sequentially on each uploaded file:

```
Stage 1: Fingerprint Detection   → identify bank by header signature
Stage 2: Column Mapping          → map headers to { date, amount, description }
Stage 3: Categorization          → match descriptions to bp_csv_category_map
```

#### Stage 1 — Known Bank Fingerprints

Static lookup table. Match is order-insensitive against normalized (lowercased,
trimmed) headers. If matched: skip Stage 2, show "Bank detected" toast.

```javascript
const BANK_FINGERPRINTS = [
  {
    bank: "Chase",
    headers: ["transaction date", "post date", "description", "category",
              "type", "amount", "memo"],
    mapping: { date: "transaction date", amount: "amount",
               description: "description" }
  },
  {
    bank: "Bank of America",
    headers: ["date", "description", "amount", "running bal."],
    mapping: { date: "date", amount: "amount", description: "description" }
  },
  {
    bank: "Wells Fargo",
    headers: ["date", "amount", "asterisk", "check number", "description"],
    mapping: { date: "date", amount: "amount", description: "description" }
  },
  {
    bank: "Citi",
    headers: ["date", "description", "debit", "credit"],
    mapping: { date: "date", amount: "debit", description: "description",
               creditColumn: "credit" }
  },
  {
    bank: "Capital One",
    headers: ["transaction date", "posted date", "card no.", "description",
              "category", "debit", "credit"],
    mapping: { date: "transaction date", amount: "debit",
               description: "description", creditColumn: "credit" }
  },
  {
    bank: "American Express",
    headers: ["date", "description", "amount"],
    mapping: { date: "date", amount: "amount", description: "description" }
  },
  {
    bank: "Discover",
    headers: ["trans. date", "post date", "description", "amount", "category"],
    mapping: { date: "trans. date", amount: "amount",
               description: "description" }
  },
  {
    bank: "USAA",
    headers: ["date", "description", "original description", "category",
              "amount", "status"],
    mapping: { date: "date", amount: "amount", description: "description" }
  },
];
```

#### Stage 2 — Regex Heuristic Mapping

Runs only when Stage 1 finds no match. Two sub-steps per field: header name pattern
match first, value sampling fallback if ambiguous.

```javascript
const HEURISTICS = {
  date: {
    headerPatterns: [/date/i, /time/i, /posted/i, /transaction/i],
    valuePattern:   /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/
  },
  amount: {
    headerPatterns: [/amount/i, /debit/i, /charge/i, /withdrawal/i, /sum/i],
    valuePattern:   /^-?[\$£€]?\d+(\.\d{1,2})?$/
  },
  credit: {
    headerPatterns: [/credit/i, /deposit/i, /payment/i],
    valuePattern:   /^[\$£€]?\d+(\.\d{1,2})?$/
  },
  description: {
    headerPatterns: [/desc/i, /memo/i, /merchant/i, /payee/i, /name/i,
                     /narrative/i],
    valuePattern:   null
  }
};
```

Value sampling: a column qualifies if ≥ 3 of the first 5 data rows match the
`valuePattern`.

**Outcomes:**
- Complete mapping found → proceed to Stage 3, show "Columns detected" toast
- Partial mapping → show Manual Mapping UI: 3-row form pre-populated with detected
  fields, user corrects only the gaps using dropdowns of all available CSV headers

#### Stage 3 — Categorization (Seed Dictionary)

```javascript
// Normalization — apply before every lookup and storage operation
const normalize = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

// Matching — substring in both directions
function lookupCategory(description, categoryMap) {
  const norm = normalize(description);
  return Object.entries(categoryMap).find(
    ([key]) => norm.includes(key) || key.includes(norm)
  )?.[1] || null;
}
```

Unmatched transactions import as `category: null` and display an amber
**"Uncategorized"** badge in the Transactions view. When the user assigns a
category to an uncategorized transaction, save `normalize(description) → categoryId`
to `bp_csv_category_map`.

**Seed dictionary (50 entries — hydrated to actual category IDs at onboarding):**

```javascript
export const CSV_CATEGORY_SEED = {
  // Coffee
  "starbucks": null, "stbks": null, "dunkin": null,
  "peets coffee": null, "dutch bros": null,
  // Groceries
  "whole foods": null, "wholefds": null, "trader joes": null,
  "kroger": null, "safeway": null, "walmart grocery": null,
  "target grocery": null, "costco": null, "aldi": null, "publix": null,
  // Dining & Delivery
  "doordash": null, "uber eats": null, "grubhub": null,
  "instacart": null, "chipotle": null, "mcdonalds": null, "chick-fil-a": null,
  // Transport
  "uber": null, "lyft": null, "metro": null, "transit": null,
  // Fuel
  "shell": null, "chevron": null, "exxon": null, "circle k": null,
  // Shopping
  "amazon": null, "amzn": null, "ebay": null, "etsy": null,
  // Subscriptions
  "netflix": null, "spotify": null, "apple com bill": null,
  "google storage": null, "hulu": null, "disney": null,
  "youtube premium": null,
  // Health & Pharmacy
  "cvs": null, "walgreens": null, "rite aid": null,
  // Utilities & Telecom
  "at&t": null, "verizon": null, "t-mobile": null,
  "comcast": null, "xfinity": null,
  // Transfers
  "zelle": null, "venmo": null, "paypal": null,
};
// Hydration at onboarding: map each null value to the matching user category ID
// by fuzzy-matching seed intent to default category names.
// e.g. "starbucks" → find category whose name contains "coffee" or "dining"
```

#### Full Import UI Flow

```
1. User navigates to Import view, clicks "Import CSV"
2. File picker opens — .csv only (PapaParse)
3. Stage 1: fingerprint detection
   ├── Match → toast "Chase detected. Mapping applied automatically." → Step 6
   └── No match → Stage 2: heuristic mapping
       ├── Complete → toast "Columns detected automatically." → Step 6
       └── Partial → Manual Mapping UI (pre-filled) → user fills gaps → Step 5
4. (Manual mapping only) User confirms column assignments → Step 6
5. Stage 3: categorization runs on all rows
6. Preview table: Date / Description / Amount / Category columns
   — Uncategorized rows show amber badge
   — User can assign categories inline before importing
7. "Import N Transactions" button confirms
8. Write to bp_transactions (importSource: "csv")
9. Toast: "47 transactions imported. 12 need categorization."
10. Redirect to Transactions view, filtered to this import batch
```

**CSV parsing library:** PapaParse (`import * as Papa from 'papaparse'`).
Use `header: true, skipEmptyLines: true`. Never use manual string splitting.

---

## Section 5 — Build Order

Build in this exact sequence. Each step depends on the previous.

```
Step 1 — Project Scaffold & Foundation
  ├── Scaffold: npm create vite@latest budgetpilot -- --template react-ts
  ├── Install runtime dependencies:
  │     dexie dexie-react-hooks zustand
  │     @nivo/pie @nivo/bar @nivo/line @nivo/heatmap
  │     @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-slider
  │     @radix-ui/react-switch @radix-ui/react-tooltip
  │     react-hook-form zod @hookform/resolvers
  │     date-fns papaparse motion
  │     lucide-react lucide-react-dynamic
  │     @types/papaparse
  ├── Install dev dependencies:
  │     vite-plugin-pwa vitest @vitest/ui
  ├── Run shadcn/ui init: npx shadcn@latest init
  │     — choose: TypeScript, CSS variables, neutral base color
  │     — add components: button, input, select, dialog, card, badge, slider, switch
  ├── Configure vite.config.ts:
  │     base: "./"  ← critical for double-click index.html to work
  │     build.outDir: "dist"
  │     build.assetsInlineLimit: 100000  ← inline small assets for offline use
  │     plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { ... } })]
  │     test: { environment: 'jsdom' }   ← Vitest config
  ├── Create src/types/index.ts — all TypeScript interfaces (Section 3)
  ├── Create src/lib/db.ts — Dexie database definition (Section 3)
  ├── Create src/lib/settings.ts — typed Settings helpers
  ├── Create src/lib/animation.ts — getMotionConfig() reading CSS vars at runtime
  ├── Create src/lib/theme.ts:
  │     ├── THEME_MIDNIGHT constant (all tokens including animation + sidebar)
  │     ├── applyTheme(theme: BpTheme) function
  │     └── validateTheme(json: unknown): BpTheme | null  ← Zod schema
  ├── Boot sequence in src/main.tsx:
  │     ├── Await Settings.get('activeTheme')
  │     ├── applyTheme(stored) or applyTheme(THEME_MIDNIGHT)
  │     └── Set themeReady = true → render <App />
  ├── Create PWA assets: icon-192.png + icon-512.png (BudgetPilot logo)
  └── App shell:
        ├── Desktop (≥1024px): full labeled sidebar (var(--bp-sidebar-width-full))
        ├── Tablet (768–1023px): icon-only rail (var(--bp-sidebar-width-rail))
        │     └── Tap chevron → Motion One slide to full width overlay
        └── Mobile (<768px): bottom tab bar, stacked single column

Step 2 — Zustand Store
  ├── Create src/store/useAppStore.ts
  ├── State slices:
  │     ├── activeMonth: string ("YYYY-MM") — default to current month
  │     ├── activeView: ViewName
  │     └── activeTheme: BpTheme
  ├── Actions: setActiveMonth, setActiveView, setActiveTheme
  └── All Dexie reads done via dexie-react-hooks (useLiveQuery) in components
      — Zustand holds UI state only, not data state

Step 3 — Onboarding
  ├── On mount: check Settings.get('onboardingCompleted')
  ├── If false: 3-step modal:
  │     A: Name + currency → write to db.profile
  │     B: Monthly income + 50/30/20 sliders → write to db.budgets (month 1)
  │     C: Theme intro screen
  ├── Write Settings.set('onboardingCompleted', true)
  └── Hydrate db.csvCategoryMap from CSV_CATEGORY_SEED
        — match seed intents to user's generated category IDs

Step 4 — Transaction Entry Form
  ├── Modal component — fully typed props, Motion One entrance animation
  ├── React Hook Form + Zod (TransactionSchema)
  ├── shadcn Select for category dropdown
  ├── date-fns isValid in Zod .refine() for date validation
  ├── Writes BpTransaction to db.transactions
  ├── importSource: 'manual' hardcoded
  ├── Animated <CheckCircle> (lucide-react-dynamic) on successful save
  └── Floating "+ Add" button rendered in App shell (visible on every view)

Step 5 — Budget Planner View
  ├── useLiveQuery for active month's BpBudget
  ├── Income input → db.budgets.update()
  ├── Allocation sliders — pure TS calculation (always sum to 100%)
  ├── Category CRUD → db.budgets.update() with updated categoryLimits array
  └── Progress bars: useLiveQuery for transactions filtered by month + categoryId

Step 6 — Dashboard View
  ├── Summary cards — useLiveQuery aggregations, count-up via requestAnimationFrame
  ├── Heatmap Calendar — useLiveQuery for active month transactions
  │     ├── Colors via var(--bp-heat-*) — zero hardcoded values
  │     ├── Cell transitions: var(--bp-duration-normal) var(--bp-easing-default)
  │     └── Touch: onTouchStart shows tooltip, setTimeout(dismiss, 3000) with fade
  ├── Donut chart (@nivo/pie) — theme prop mapped to --bp-* variables
  │     Spring-animated entrance, click-to-filter transactions
  └── Recent transactions list — useLiveQuery, limit 8, ordered by date desc

Step 7 — Smart CSV Import View
  ├── PapaParse file reader
  ├── src/lib/csv/fingerprints.ts — BANK_FINGERPRINTS + detectBank()
  ├── src/lib/csv/heuristics.ts — HEURISTICS + heuristicMap()
  ├── Manual Mapping UI — rendered only when heuristics are incomplete
  ├── src/lib/csv/categorize.ts — normalize() + lookupCategory()
  │     Reads from db.csvCategoryMap (useLiveQuery)
  ├── Preview table with inline category assignment
  ├── Bulk write: db.transactions.bulkAdd(mappedRows)
  └── Post-import corrections: db.csvCategoryMap.put({ normalizedDescription, categoryId })

Step 8 — Debt Snowball View
  ├── useLiveQuery for db.debts
  ├── CRUD via React Hook Form + Zod (DebtSchema)
  ├── Pure TS functions: calculateSnowball(), calculateAvalanche()
  │     — covered by Vitest in src/lib/calculations.test.ts
  ├── Extra payment input (Zustand local UI state)
  ├── Snowball / Avalanche toggle
  ├── Payoff timeline bar chart (@nivo/bar) — animated, theme-aware
  └── Premium slider:
        ├── Custom CSS on input[type=range] pseudo-elements
        ├── 44×44px thumb, var(--bp-accent) fill
        ├── Active: scale(1.15) + var(--bp-accent-muted) glow ring
        └── Transitions: var(--bp-duration-fast) var(--bp-easing-spring)

Step 9 — JSON Export / Import View
  ├── Export:
  │     ├── Read all tables via db.export() (Dexie built-in)
  │     ├── Filename: budgetpilot-backup-YYYY-MM-DD.json (date-fns format())
  │     └── Settings.set('lastExport', today)
  ├── Import:
  │     ├── File picker → Zod schema validation of file structure
  │     ├── Preview modal (table count + export date) — Motion One entrance
  │     ├── Confirm → db.import() (Dexie built-in, overwrites)
  │     └── Reload app after restore
  └── Auto-backup reminder:
        On mount, check Settings.get('lastExport')
        If > 7 days ago → toast with animated <BellRing> (lucide-react-dynamic)
        Once per session only

Step 10 — Settings View
  ├── Profile: read/write db.profile (React Hook Form + Zod)
  ├── Appearance:
  │     ├── Read activeTheme from Zustand store
  │     ├── Drag-and-drop JSON upload → validateTheme() (Zod) → preview panel
  │     ├── Preview panel: Motion One slide-in from right
  │     ├── Apply: applyTheme() + Settings.set('activeTheme') + store.setActiveTheme()
  │     └── Reset: applyTheme(THEME_MIDNIGHT) + Settings.delete('activeTheme')
  ├── Category manager: read/write db.budgets categoryLimits
  └── Clear all data: ConfirmDialog → db.delete() → new BudgetPilotDB() → reload

Step 11 — Vitest — Calculations Test Suite
  ├── Create src/lib/calculations.test.ts
  ├── Test: budget allocation math (50/30/20 + custom splits)
  ├── Test: snowball ordering (lowest balance first)
  ├── Test: avalanche ordering (highest APR first)
  ├── Test: monthly payoff calculation accuracy
  ├── Test: interest saved comparison (method vs. minimum-only)
  └── Test: edge cases (zero extra payment, single debt, equal balances)

Step 12 — Polish
  ├── Empty states for all list views (useLiveQuery count === 0)
  ├── Three-breakpoint responsive layout:
  │     ├── ≥1024px: full labeled sidebar
  │     ├── 768–1023px: icon rail + Motion One expand overlay (4th use case)
  │     └── <768px: bottom tab bar + stacked column
  ├── Source badge ("CSV" | "Manual") on transaction rows
  ├── Amber "Uncategorized" badge on transactions where categoryId is null
  ├── Loading spinner: animated <LoaderCircle> (lucide-react-dynamic) during
  │     CSV import processing
  └── Smooth opacity fade between views via CSS transition on view container
      using var(--bp-duration-normal) var(--bp-easing-default)
```


---

## Section 6 — Technical Constraints

Hard rules. Do not deviate.

| Constraint | Rule |
|---|---|
| Build tool | Vite. `vite.config.ts` must set `base: "./"` — required for double-click `index.html`. |
| Framework | React 18 + TypeScript. All files `.tsx` or `.ts` — no `.js` or `.jsx`. |
| Language | TypeScript strict mode. All types in `src/types/index.ts`. No `any`. |
| Storage | Dexie.js (IndexedDB) exclusively. No `localStorage`, no `sessionStorage`, no cookies. |
| Reactive data | `useLiveQuery` for all component data reads. Write-only calls to `db.*` in event handlers. |
| State | Zustand for UI state only (`activeMonth`, `activeView`, `activeTheme`, `sidebarExpanded`). |
| Core logic | Pure TS functions in `src/lib/calculations.ts`. No side effects. No Dexie calls. Covered by Vitest. |
| Theming | All colors, durations, easings, and layout widths via `var(--bp-*)`. Zero hardcoded values in components. |
| Charts | `@nivo/pie`, `@nivo/bar`, `@nivo/line`, `@nivo/heatmap` only. No recharts, no D3, no Chart.js. All Nivo `theme` props mapped to `--bp-*` CSS variables. |
| Forms | React Hook Form + Zod for all forms. Schemas in `src/lib/schemas.ts` — reused for CSV row validation and JSON backup validation. |
| Date handling | `date-fns` for all date math and CSV normalization. `"YYYY-MM-DD"` strings in storage. `Intl.DateTimeFormat` for display. |
| Animation | CSS transitions (primary — all driven by `var(--bp-duration-*)` and `var(--bp-easing-*)`). Motion One for exactly 4 interactions: modal, onboarding steps, theme preview panel, sidebar expand. |
| Icons | `lucide-react` (static). `lucide-react-dynamic` for 3 animated icons: `<LoaderCircle>`, `<CheckCircle>`, `<BellRing>`. |
| Responsive layout | Three breakpoints: ≥1024px (full sidebar), 768–1023px (icon rail + expand), <768px (bottom tabs). |
| Touch | Heatmap tooltip: `onTouchStart` → show → `setTimeout` dismiss at 3s with CSS fade. Slider thumb: 44×44px, custom CSS pseudo-elements. |
| CSV parsing | PapaParse only. `header: true, skipEmptyLines: true`. No manual string splitting. |
| IDs | `crypto.randomUUID()` for manual records. Dexie `++id` for `profile` and `budgets` only. |
| Offline | No external API calls. `assetsInlineLimit` set to inline fonts and small icons. |
| PWA | `vite-plugin-pwa` with `registerType: 'autoUpdate'`. `manifest.json` with `display: 'standalone'`. Two icon files: `icon-192.png`, `icon-512.png`. |
| Testing | Vitest for `src/lib/calculations.ts` only. No component tests in MVP. |
| No `<form>` tags | `<div>` + `onClick` handlers for all form submissions. |
| No `alert()` / `confirm()` | All confirmations via shadcn `Dialog` or `ConfirmDialog` component. |
| Theme validation | `validateTheme()` Zod schema rejects uploads missing required tokens — never partially apply. |
| Web Workers | Not used. Add `// TODO: offload to Worker` comment in CSV pipeline if parsing exceeds 100ms. |

### Project Structure

```
budgetpilot/
├── index.html
├── vite.config.ts          ← base:"./", VitePWA, Vitest config
├── tsconfig.json
├── package.json
├── icon-192.png            ← PWA icon
├── icon-512.png            ← PWA icon
├── src/
│   ├── main.tsx            ← Boot: theme resolution → render
│   ├── App.tsx             ← Shell, routing, three-breakpoint layout
│   ├── types/
│   │   └── index.ts        ← All shared TypeScript interfaces
│   ├── lib/
│   │   ├── db.ts           ← Dexie BudgetPilotDB definition
│   │   ├── settings.ts     ← Typed Settings helpers
│   │   ├── theme.ts        ← THEME_MIDNIGHT, applyTheme, validateTheme
│   │   ├── animation.ts    ← getMotionConfig() — reads CSS vars for Motion One
│   │   ├── schemas.ts      ← Zod schemas: TransactionSchema, DebtSchema,
│   │   │                      ProfileSchema, ThemeSchema, BackupSchema
│   │   ├── calculations.ts ← Pure TS: snowball, avalanche, allocation math
│   │   ├── calculations.test.ts ← Vitest test suite
│   │   └── csv/
│   │       ├── fingerprints.ts  ← BANK_FINGERPRINTS + detectBank()
│   │       ├── heuristics.ts   ← HEURISTICS + heuristicMap()
│   │       └── categorize.ts   ← normalize(), lookupCategory(), CSV_CATEGORY_SEED
│   ├── store/
│   │   └── useAppStore.ts  ← Zustand: activeMonth, activeView, activeTheme,
│   │                          sidebarExpanded
│   ├── components/
│   │   ├── ui/             ← shadcn/ui generated components (do not edit)
│   │   ├── Modal.tsx       ← Motion One entrance/exit
│   │   ├── ConfirmDialog.tsx
│   │   ├── Toast.tsx       ← With animated <BellRing> variant
│   │   ├── ProgressBar.tsx ← CSS var-driven colors + transitions
│   │   ├── EmptyState.tsx
│   │   ├── Sidebar.tsx     ← Three-state: full / rail / hidden
│   │   ├── HeatmapCalendar.tsx ← Touch-aware tooltip logic
│   │   ├── DebtSlider.tsx  ← Premium styled range input
│   │   └── NivoTheme.ts    ← Utility: maps --bp-* vars → Nivo theme object
│   └── views/
│       ├── Dashboard.tsx
│       ├── Transactions.tsx
│       ├── Import.tsx
│       ├── Budget.tsx
│       ├── Debts.tsx
│       ├── Settings.tsx
│       └── ExportImport.tsx
└── dist/                   ← Vite build output — ship this to buyer
```


---

## Section 7 — Delivery Package

The buyer receives a ZIP of the Vite `dist/` build output. Run `npm run build`
before packaging. The `dist/` folder is fully self-contained — all JS and CSS
is bundled, assets inlined where possible, service worker generated by vite-plugin-pwa.

```
/BudgetPilot/
├── index.html              ← Vite-built entry point. Double-click to open.
├── sw.js                   ← Service worker (generated by vite-plugin-pwa)
├── manifest.webmanifest    ← PWA manifest (generated by vite-plugin-pwa)
├── icon-192.png            ← PWA home screen icon
├── icon-512.png            ← PWA splash screen icon
├── README.txt              ← Buyer setup instructions
├── /assets/                ← Vite-generated hashed JS + CSS bundles
│   ├── index-[hash].js
│   └── index-[hash].css
└── /themes/
    └── budgetpilot-theme-midnight-v1.json
```

**Build checklist before packaging:**
- `vite.config.ts` has `base: "./"` — verify assets load on double-click
- Open `dist/index.html` locally (no server) — confirm app boots, theme applies,
  onboarding triggers
- Open via `npx serve dist` in Chrome — confirm PWA install prompt appears in
  address bar
- Confirm all 7 nav views render without network requests in DevTools Network tab
- Confirm Dexie initializes correctly and Vitest suite passes (`npm run test`)
- Confirm heatmap tooltip works on touch (use Chrome DevTools touch emulation)
- Confirm slider thumb renders correctly and responds to drag


### README.txt (Required)

```
BUDGETPILOT — Privacy-First Personal Budget Tracker
────────────────────────────────────────────────────

OPENING THE APP
Option 1 — Double-click: Open index.html in Chrome, Edge, or Safari.
Option 2 — Install as an app (recommended):
  1. Open index.html in Chrome or Edge
  2. Click the install icon (⊕) in the browser address bar
  3. BudgetPilot will appear in your dock, taskbar, or home screen
  4. Launch it like any other app — no browser needed

iPad: Open in Safari → tap Share → "Add to Home Screen"

YOUR DATA & PRIVACY
All your data is stored locally in your browser's IndexedDB. Nothing is ever
sent to any server. BudgetPilot works fully offline.

⚠️  IMPORTANT: Clearing your browser's site data or using a different browser
profile will erase your data. Use the Export button regularly to save a backup.
You can restore your data at any time using the Import button.

IMPORTING BANK TRANSACTIONS
Go to the Import view and drop your bank's CSV file. BudgetPilot automatically
detects your bank and maps columns. Supported: Chase, Bank of America, Wells
Fargo, Citi, Capital One, American Express, Discover, USAA. Other banks are
supported via automatic column detection.

CHANGING THE APP THEME
Go to Settings → Appearance and drop a Theme Pack (.json) file into the upload
zone. Theme packs change colors, fonts, and motion personality. Available as
separate listings in the seller's Etsy shop.

SUPPORT
Questions? Contact the seller via your Etsy order page.
```

---

## Section 8 — Etsy Listing Specification

### Core Product

| Field | Value |
|---|---|
| Price | $12.99 |
| License | Personal use (single household) |
| Commercial upgrade | $29.99 (message seller) |
| Product title (SEO) | Budget Tracker App · Installs Like a Native App · Bank CSV Import · Privacy-First · No Cloud · Works Offline · Spreadsheet Alternative |
| Primary category | Digital Downloads > Templates > Spreadsheets |

### Theme Pack Upsell Listings (separate listings)

| Field | Value |
|---|---|
| Price per pack | $2.99–$4.99 |
| Format | Single `.json` file |
| Naming convention | `budgetpilot-theme-[name]-v[version].json` |
| Title format | BudgetPilot Theme Pack · [Theme Name] · Colors + Motion Personality |
| Required note | "Requires BudgetPilot app (sold separately)" |
| What it changes | Colors, typography, border radius, animation speed and style |


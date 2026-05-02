# BudgetPilot

Privacy-first personal budget tracker built as a Vite PWA. Sold as a digital
download on Etsy — buyers receive a zip of the built `dist/` folder and open
it by double-clicking `index.html`, or install it as a PWA from Chrome.

**No cloud. No account. No subscription.** All data is stored locally in the
browser's IndexedDB via Dexie.js. Nothing leaves the device.

---

## Business Model

| Etsy Listing | What the buyer receives | Price |
|---|---|---|
| Core app | `BudgetPilot-v1.zip` — the full PWA | $12.99 |
| Forest theme | `budgetpilot-theme-forest-v1.zip` | $3.99 |
| Rose theme | `budgetpilot-theme-rose-v1.zip` | $3.99 |
| Obsidian theme | `budgetpilot-theme-obsidian-v1.zip` | $2.99 |
| Focus theme | `budgetpilot-theme-focus-v1.zip` | $2.99 |
| Complete Theme Bundle | All 4 premium themes in one zip | $9.99 |

Theme packs are single `.json` files. Buyers drop them into Settings → Appearance
inside the app — no technical knowledge required.

---

## Repository Structure

```
budget-tracker/
├── budgetpilot/                       ← Vite app (all source code lives here)
│   ├── src/
│   │   ├── components/                ← UI primitives (BpCard, ThemeIcon, etc.)
│   │   │   └── ui/                    ← shadcn/ui + custom Bp* components
│   │   ├── views/                     ← Page-level views (Dashboard, Budget, etc.)
│   │   ├── lib/                       ← Business logic, no side effects
│   │   │   ├── themes/                ← Bundled theme constants (Midnight, Focus)
│   │   │   ├── csv/                   ← CSV import pipeline (fingerprint, heuristics)
│   │   │   ├── db.ts                  ← Dexie database definition
│   │   │   ├── theme.ts               ← applyTheme(), validateTheme()
│   │   │   ├── calculations.ts        ← Pure TS: snowball, avalanche, allocation math
│   │   │   └── themeUtils.ts          ← categoryNameToSlot(), font helpers
│   │   ├── hooks/                     ← useLiveQuery data hooks
│   │   ├── store/                     ← Zustand UI state (no Dexie)
│   │   └── types/                     ← All shared TypeScript interfaces
│   ├── public/
│   │   ├── themes/                    ← Distributable theme JSON files
│   │   └── README.txt                 ← Buyer setup guide (Vite copies to dist/)
│   ├── scripts/
│   │   └── package-etsy.mjs           ← Etsy packaging script
│   ├── .storybook/                    ← Storybook configuration
│   ├── etsy-packages/                 ← Packaging output — gitignored
│   └── dist/                          ← Vite build output — gitignored
│
├── budgetpilot-prompts/               ← AI agent task documents (see below)
├── budgetpilot-mvp-brief.md           ← Full product & feature specification
├── budgetpilot-theme-packages.md      ← Theme system design & token reference
├── budgetpilot-wireframes.md          ← UI wireframes reference
└── images/                            ← Wireframe images referenced by prompts
```

---

## Quick Start

```bash
cd budgetpilot
npm install
npm run dev        # http://localhost:5173
```

Prerequisites: Node 18+, Chrome or Edge (for PWA install testing).

---

## Development Commands

All commands run from inside `budgetpilot/`.

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run test` | Run Vitest (calculations unit tests) |
| `npx tsc --noEmit` | TypeScript type check — zero errors required |
| `npm run storybook` | Open Storybook component explorer on port 6006 |
| `npm run storybook:build` | Build Storybook (used as a CI gate) |

---

## Build & Packaging for Etsy

Theme packs do not require a build — they are static JSON files read directly
from `public/themes/`. The core app zip requires a build first.

```bash
# Theme packs only — no build needed
npm run package:themes

# All 4 premium themes in one bundle zip — no build needed
npm run package:bundle

# Core app zip — runs vite build automatically first
npm run package:app

# Everything at once — one command for release day
npm run package:all
```

Output lands in `budgetpilot/etsy-packages/` (gitignored):

```
etsy-packages/
├── BudgetPilot-v1.zip
├── budgetpilot-theme-forest-v1.zip
├── budgetpilot-theme-rose-v1.zip
├── budgetpilot-theme-obsidian-v1.zip
├── budgetpilot-theme-focus-v1.zip
└── budgetpilot-theme-bundle-v1.zip
```

Each theme zip contains the JSON file + a buyer `README.txt` with install steps.
The app zip contains the full `dist/` output inside a `BudgetPilot/` folder,
including the buyer `README.txt` that Vite copies from `public/`.

---

## Theme System

Themes are `.json` files that map CSS Custom Property names (`--bp-*`) to values.
The app applies them at runtime with zero page reload via `applyTheme()`.

### Bundled themes (always available in-app, no upload needed)

| Theme | Personality | Font |
|---|---|---|
| **Midnight** | Dark navy + teal, finance-grade | DM Sans |
| **Focus** | High contrast, near-zero motion, accessibility-first | Atkinson Hyperlegible |

### Premium themes (sold separately, uploaded via Settings → Appearance)

| Theme | Personality | Font |
|---|---|---|
| **Forest** | Organic, unhurried, moss green | Literata (serif) |
| **Rose** | Warm, playful, burgundy rose-gold | Fraunces (serif) |
| **Obsidian** | Minimal, terminal, pure black | Space Mono |
| **Focus Pack** | Same as bundled Focus — reference copy for buyers | Atkinson Hyperlegible |

### How themes work

Every component reads colors, spacing, and motion exclusively from CSS Custom
Properties (`var(--bp-*)`). Applying a theme is a single function call that sets
all token values on `:root` and triggers browser repaints automatically.

Uploaded themes are persisted in Dexie (`settings` table, key `installedThemes`).
Users collect packs over time and switch freely — no re-uploading required.

### Creating a new theme pack

1. Copy `public/themes/budgetpilot-theme-midnight-v1.json` as a starting point
2. Set `id` to a unique kebab-case slug — **not** `"midnight"` or `"focus"` (reserved)
3. Edit token values — all 38 tokens must be present
4. Save as `public/themes/budgetpilot-theme-[name]-v1.json`
5. Verify in the browser console (with dev server running):
   ```js
   fetch('/themes/budgetpilot-theme-[name]-v1.json')
     .then(r => r.json())
     .then(json => console.log(validateTheme(json) ? 'PASS' : 'FAIL'))
   ```
6. Run `npm run package:themes` to generate the Etsy zip

### Required tokens (minimum set for upload validation)

`--bp-bg-base` · `--bp-accent` · `--bp-text-primary` · `--bp-border` ·
`--bp-positive` · `--bp-danger`

All 38 tokens are listed in `budgetpilot-theme-packages.md`.

---

## Task Prompt System

The `budgetpilot-prompts/` directory contains AI agent task documents used to
build this product. Each document is a self-contained instruction set — an agent
can execute it cold, without any other context.

| File | Phase | What it built |
|---|---|---|
| `task-0-foundation.md` | 0 | Project scaffold, Dexie, Zustand, theme engine, CSS tokens |
| `task-1a-ui-library.md` | 1A | All Bp* UI components + Storybook stories |
| `task-1b-*.md` | 1B | Business logic layer (calculations, hooks, schemas) |
| `task-1c-*.md` | 1C | App shell, routing, onboarding flow |
| `task-2a-*.md` | 2A | Dashboard, Transactions, Import views |
| `task-2b-*.md` | 2B | Budget, Debts views |
| `task-2c-*.md` | 2C | Settings, Export/Import views |
| `task-3a-*.md` | 3A | Debt Snowball calculator |
| `task-3b-*.md` | 3B | JSON export/import, auto-backup reminder |
| `task-3c-*.md` | 3C | Polish — empty states, source badges, responsive fixes |
| `task-theme-a-engine.md` | 5A | Theme library engine (type extension, font loading, DOMPurify) |
| `task-theme-b-components.md` | 5B | ThemeIcon, Theme Gallery UI, category icons, JSON files |
| `task-theme-c-packaging.md` | 5C | Etsy packaging script + documentation |

To use a task document: hand it to an AI agent as the initial prompt. The agent
reads the full context, follows the steps in order, and must pass all completion
gates before marking the task done.

---

## Pre-Release Checklist

Run through this before packaging a new version for Etsy.

**Code quality**
- [ ] `npx tsc --noEmit` exits 0 — zero TypeScript errors
- [ ] `npm run test` — all Vitest tests pass
- [ ] `npm run storybook:build` exits 0

**App verification**
- [ ] `npm run build` succeeds — no warnings about missing assets
- [ ] Open `dist/index.html` locally (no server) — app boots, Midnight theme applies, onboarding triggers
- [ ] Open via `npx serve dist` in Chrome — PWA install prompt appears in address bar
- [ ] All 7 nav views render with no network requests (DevTools → Network tab, filter XHR/Fetch)
- [ ] Heatmap calendar tooltip works on touch (Chrome DevTools → Sensors → Touch)
- [ ] CSV import: upload a Chase CSV — bank detected, transactions preview correctly
- [ ] Debt calculator: snowball/avalanche toggle updates the payoff chart

**Theme system**
- [ ] Upload Forest theme in Settings → Appearance — font changes to Literata, accent goes green
- [ ] Sidebar nav icons update to Forest SVG overrides (nav-dashboard, category-savings)
- [ ] Switch back to Midnight — all tokens revert correctly
- [ ] Upload a second theme — both appear in "Your Themes" gallery
- [ ] Remove a theme — disappears and does not reappear after refresh

**Packaging**
- [ ] `npm run package:all` completes with no errors
- [ ] All 6 zips exist in `etsy-packages/`
- [ ] Unzip each — verify file contents match the table in task-theme-c-packaging.md
- [ ] Open a theme zip README.txt — check name, filename, and font note are correct

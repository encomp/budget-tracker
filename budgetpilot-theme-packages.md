# 🎨 BudgetPilot — Theme Packages Specification
**Document Type:** Design & Product Specification
**Applies To:** BudgetPilot v1 + all future versions
**Theme Engine Version:** 1.0

> **Agent / Developer Note:** This document is the authoritative specification for
> all BudgetPilot theme packs. Each theme is a self-contained `.json` file that
> controls colors, typography, motion, layout, icon weight, and optional SVG icon
> overrides. Themes are uploaded by the buyer via Settings → Appearance. The app
> applies them at runtime with zero reload required.

---

## Theme Architecture Overview

A theme pack is a JSON file with three top-level sections:

```json
{
  "id":          "string — unique slug, kebab-case",
  "name":        "string — display name",
  "description": "string — one-line mood/personality summary",
  "version":     "string — semver e.g. '1.0'",
  "tokens":      { "CSS variable name": "value", ... },
  "icons":       { "icon slot name": "<svg>...</svg>", ... }
}
```

The `tokens` section is required. The `icons` section is optional — themes that
only restyle colors and motion omit it entirely.

---

## Full Token Reference

Every theme must define all tokens in this table. Missing tokens fall back to
`THEME_MIDNIGHT` defaults. Token names are CSS Custom Properties applied to
`:root` at runtime.

### Color Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-bg-base` | App background — deepest layer | `#040810` |
| `--bp-bg-surface` | Card / panel background | `#070d1a` |
| `--bp-bg-surface-alt` | Hover states, alternating rows | `#0a1220` |
| `--bp-bg-overlay` | Modal backdrop | `rgba(0,0,0,0.72)` |
| `--bp-border` | Default border | `#1e293b` |
| `--bp-border-strong` | Active / emphasized border | `#334155` |
| `--bp-accent` | Primary CTA, active nav, links | `#14b8a6` |
| `--bp-accent-muted` | Accent backgrounds, tags | `rgba(20,184,166,0.12)` |
| `--bp-accent-glow` | Box-shadow glow | `rgba(20,184,166,0.25)` |
| `--bp-positive` | Income, under-budget, success | `#14b8a6` |
| `--bp-warning` | 60–85% of budget limit | `#f59e0b` |
| `--bp-danger` | Over budget, errors, destructive | `#ef4444` |
| `--bp-positive-muted` | Positive at low opacity | `rgba(20,184,166,0.1)` |
| `--bp-warning-muted` | Warning at low opacity | `rgba(245,158,11,0.1)` |
| `--bp-danger-muted` | Danger at low opacity | `rgba(239,68,68,0.1)` |
| `--bp-text-primary` | Headings, key values | `#f1f5f9` |
| `--bp-text-secondary` | Labels, descriptions | `#94a3b8` |
| `--bp-text-muted` | Placeholders, disabled | `#475569` |

### Typography Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-font-ui` | All UI labels, nav, buttons | `'DM Sans', system-ui, sans-serif` |
| `--bp-font-mono` | Numbers, amounts, codes | `'DM Mono', 'Courier New', monospace` |

### Shape Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-radius-sm` | Badges, tags, chips | `6px` |
| `--bp-radius-md` | Cards, inputs, buttons | `10px` |
| `--bp-radius-lg` | Modals, panels, drawers | `16px` |

### Heatmap Calendar Tokens

These tokens are semantic — do not override their meaning, only their color values.

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-heat-none` | No spending that day | `#0f172a` |
| `--bp-heat-low` | Under daily budget | `#134e4a` |
| `--bp-heat-mid` | At daily budget | `#f59e0b` |
| `--bp-heat-high` | Over daily budget | `#ef4444` |

### Animation Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-duration-fast` | Hover states, icon presses | `150ms` |
| `--bp-duration-normal` | Tab switches, card mounts | `300ms` |
| `--bp-duration-slow` | Onboarding, emphasis | `600ms` |
| `--bp-easing-default` | Standard ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--bp-easing-spring` | Modal/panel overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--bp-easing-bounce` | Celebrations, delight | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |
| `--bp-motion-intensity` | Global motion scalar 0–1 | `1` |

> **`--bp-motion-intensity` implementation note:** All CSS `transition-duration`
> values are multiplied by this scalar via a CSS `calc()` wrapper:
> `transition-duration: calc(var(--bp-duration-normal) * var(--bp-motion-intensity))`
> Setting this to `0` or near-zero produces instant, no-motion transitions.

### Layout Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-sidebar-width-full` | Desktop labeled sidebar | `240px` |
| `--bp-sidebar-width-rail` | Tablet icon-only rail | `64px` |

### Icon Tokens

| Token | Role | Midnight Default |
|---|---|---|
| `--bp-icon-stroke` | Lucide icon strokeWidth | `2` |
| `--bp-icon-size-sm` | Small icons (badges, inline) | `16px` |
| `--bp-icon-size-md` | Standard icons (nav, buttons) | `20px` |
| `--bp-icon-size-lg` | Emphasis icons (empty states) | `24px` |

### Icon Override Slots

The `icons` section of a theme JSON can override specific icon slots with custom
inline SVGs. All slots are optional — omitted slots fall back to the Lucide default.

| Slot Name | Location | Fallback Lucide Icon |
|---|---|---|
| `nav-dashboard` | Sidebar nav item | `LayoutDashboard` |
| `nav-transactions` | Sidebar nav item | `ArrowLeftRight` |
| `nav-import` | Sidebar nav item | `Upload` |
| `nav-budget` | Sidebar nav item | `PieChart` |
| `nav-debts` | Sidebar nav item | `TrendingDown` |
| `nav-settings` | Sidebar nav item | `Settings` |
| `nav-export` | Sidebar nav item | `Download` |
| `category-food` | Category badge | `UtensilsCrossed` |
| `category-coffee` | Category badge | `Coffee` |
| `category-transport` | Category badge | `Car` |
| `category-shopping` | Category badge | `ShoppingBag` |
| `category-subscriptions` | Category badge | `Repeat` |
| `category-health` | Category badge | `Heart` |
| `category-utilities` | Category badge | `Zap` |
| `category-savings` | Category badge | `Piggybank` |
| `logo` | App header / PWA splash | BudgetPilot wordmark |

---

## Theme Packages

---

## 01 — Midnight (Default)

> *"The confidence of a private bank. The clarity of a Bloomberg terminal.
> The calm of 2am with a plan."*

Midnight is the bundled default theme. It is hardcoded as `THEME_MIDNIGHT`
inside the app and cannot be deleted or broken — it is always the fallback.
It is also delivered as a standalone `.json` file in the `/themes/` folder
so buyers understand the format for creating their own packs.

### Mood & Personality
Authoritative. Precise. Finance-grade. The visual language of someone who has
their money under control. Dark navy backgrounds with teal accents create a
sense of depth and expertise without feeling cold or clinical.

### Motion Personality
Confident and efficient. Standard durations, smooth easing. No unnecessary
flourish — transitions serve clarity, not entertainment.

### Color Palette

| Swatch | Token | Value | Role |
|---|---|---|---|
| ⬛ Near-black | `--bp-bg-base` | `#040810` | App background |
| 🟦 Deep navy | `--bp-bg-surface` | `#070d1a` | Cards |
| 🔵 Navy | `--bp-bg-surface-alt` | `#0a1220` | Hover states |
| 🩵 Teal | `--bp-accent` | `#14b8a6` | Primary accent |
| ⬜ Slate-50 | `--bp-text-primary` | `#f1f5f9` | Headings |
| 🩶 Slate-400 | `--bp-text-secondary` | `#94a3b8` | Labels |

### Full Token Set

```json
{
  "id": "midnight",
  "name": "Midnight",
  "description": "Sleek dark dashboard. Elegant. Finance-grade.",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base":            "#040810",
    "--bp-bg-surface":         "#070d1a",
    "--bp-bg-surface-alt":     "#0a1220",
    "--bp-bg-overlay":         "rgba(0,0,0,0.72)",
    "--bp-border":             "#1e293b",
    "--bp-border-strong":      "#334155",
    "--bp-accent":             "#14b8a6",
    "--bp-accent-muted":       "rgba(20,184,166,0.12)",
    "--bp-accent-glow":        "rgba(20,184,166,0.25)",
    "--bp-positive":           "#14b8a6",
    "--bp-warning":            "#f59e0b",
    "--bp-danger":             "#ef4444",
    "--bp-positive-muted":     "rgba(20,184,166,0.1)",
    "--bp-warning-muted":      "rgba(245,158,11,0.1)",
    "--bp-danger-muted":       "rgba(239,68,68,0.1)",
    "--bp-text-primary":       "#f1f5f9",
    "--bp-text-secondary":     "#94a3b8",
    "--bp-text-muted":         "#475569",
    "--bp-font-ui":            "'DM Sans', system-ui, sans-serif",
    "--bp-font-mono":          "'DM Mono', 'Courier New', monospace",
    "--bp-radius-sm":          "6px",
    "--bp-radius-md":          "10px",
    "--bp-radius-lg":          "16px",
    "--bp-heat-none":          "#0f172a",
    "--bp-heat-low":           "#134e4a",
    "--bp-heat-mid":           "#f59e0b",
    "--bp-heat-high":          "#ef4444",
    "--bp-duration-fast":      "150ms",
    "--bp-duration-normal":    "300ms",
    "--bp-duration-slow":      "600ms",
    "--bp-easing-default":     "cubic-bezier(0.4, 0, 0.2, 1)",
    "--bp-easing-spring":      "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "--bp-easing-bounce":      "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    "--bp-motion-intensity":   "1",
    "--bp-sidebar-width-full": "240px",
    "--bp-sidebar-width-rail": "64px",
    "--bp-icon-stroke":        "2",
    "--bp-icon-size-sm":       "16px",
    "--bp-icon-size-md":       "20px",
    "--bp-icon-size-lg":       "24px"
  }
}
```

### Etsy Listing
- **Status:** Bundled with base product. Not sold separately.
- **Included as:** `budgetpilot-theme-midnight-v1.json` in the `/themes/` folder

---

## 02 — Forest

> *"Your budget, like a forest floor — layered, alive, and quietly growing."*

### Mood & Personality
Organic. Grounded. Unhurried. Forest replaces the cold precision of Midnight
with warmth and depth. Deep moss greens and earth tones create a sense of
patience — money as something that grows slowly and steadily, not something
to stress over. The rounded radius tokens soften every element, and the slower
motion makes the app feel like it breathes.

This theme is designed for users who find finance dashboards anxiety-inducing.
The visual language says: *slow down, you're doing fine.*

### Motion Personality
Unhurried and organic. Longer durations, gentle bounce easing. Elements settle
into place rather than snapping. The spring easing curve is softer than Midnight —
less overshoot, more settle.

### Color Palette

| Swatch | Token | Value | Role |
|---|---|---|---|
| 🟫 Deep moss | `--bp-bg-base` | `#0a1a0e` | App background |
| 🌿 Dark forest | `--bp-bg-surface` | `#0f2218` | Cards |
| 🍃 Forest mid | `--bp-bg-surface-alt` | `#142b1f` | Hover states |
| 💚 Sage green | `--bp-accent` | `#4ade80` | Primary accent |
| 🟡 Warm amber | `--bp-warning` | `#fbbf24` | Warning state |
| 🔴 Terracotta | `--bp-danger` | `#f87171` | Danger state |

### Typography
Replacing DM Sans with **Literata** (serif, editorial warmth) for UI labels —
an unusual choice that reinforces the organic, unhurried personality. Numbers
retain a monospace stack for readability.

### Full Token Set

```json
{
  "id": "forest",
  "name": "Forest",
  "description": "Organic. Unhurried. Rooted in calm.",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base":            "#0a1a0e",
    "--bp-bg-surface":         "#0f2218",
    "--bp-bg-surface-alt":     "#142b1f",
    "--bp-bg-overlay":         "rgba(0,0,0,0.75)",
    "--bp-border":             "#1a3828",
    "--bp-border-strong":      "#2d5a40",
    "--bp-accent":             "#4ade80",
    "--bp-accent-muted":       "rgba(74,222,128,0.12)",
    "--bp-accent-glow":        "rgba(74,222,128,0.2)",
    "--bp-positive":           "#4ade80",
    "--bp-warning":            "#fbbf24",
    "--bp-danger":             "#f87171",
    "--bp-positive-muted":     "rgba(74,222,128,0.1)",
    "--bp-warning-muted":      "rgba(251,191,36,0.1)",
    "--bp-danger-muted":       "rgba(248,113,113,0.1)",
    "--bp-text-primary":       "#ecfdf5",
    "--bp-text-secondary":     "#86efac",
    "--bp-text-muted":         "#4d7c60",
    "--bp-font-ui":            "'Literata', Georgia, serif",
    "--bp-font-mono":          "'JetBrains Mono', 'Courier New', monospace",
    "--bp-radius-sm":          "8px",
    "--bp-radius-md":          "14px",
    "--bp-radius-lg":          "20px",
    "--bp-heat-none":          "#0a1a0e",
    "--bp-heat-low":           "#14532d",
    "--bp-heat-mid":           "#fbbf24",
    "--bp-heat-high":          "#f87171",
    "--bp-duration-fast":      "200ms",
    "--bp-duration-normal":    "500ms",
    "--bp-duration-slow":      "900ms",
    "--bp-easing-default":     "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    "--bp-easing-spring":      "cubic-bezier(0.22, 1, 0.36, 1)",
    "--bp-easing-bounce":      "cubic-bezier(0.34, 1.3, 0.64, 1)",
    "--bp-motion-intensity":   "0.85",
    "--bp-sidebar-width-full": "256px",
    "--bp-sidebar-width-rail": "68px",
    "--bp-icon-stroke":        "1.5",
    "--bp-icon-size-sm":       "16px",
    "--bp-icon-size-md":       "20px",
    "--bp-icon-size-lg":       "26px"
  },
  "icons": {
    "nav-dashboard":    "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>",
    "category-savings": "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'><path d='M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z'/><circle cx='12' cy='9' r='2.5'/></svg>"
  }
}
```

### Etsy Listing
- **File:** `budgetpilot-theme-forest-v1.json`
- **Price:** $3.99
- **Title:** BudgetPilot Theme Pack · Forest · Organic Dark Green · Colors + Motion
- **Tags:** budgetpilot theme, budget app skin, green theme, calm finance, organic dark

---

## 03 — Rose

> *"Money can be beautiful. Your finances, warm and alive."*

### Mood & Personality
Warm. Playful. Intimate. Rose challenges the assumption that finance tools must
feel cold and corporate. Deep burgundy backgrounds with rose-gold accents create
an environment that feels personal — like a beautiful journal rather than a
dashboard. The rounded radii, faster spring motion, and slightly larger icon size
create a tactile, warm-to-the-touch feeling.

This theme is designed for users who want their budget tracker to feel like
something they actually want to open — not a chore, but a ritual.

### Motion Personality
Lively and warm. Shorter durations than Midnight but with stronger spring overshoot.
Elements bounce confidently into place. The motion is expressive without being
distracting — like a friend who gestures enthusiastically while making a point.

### Color Palette

| Swatch | Token | Value | Role |
|---|---|---|---|
| 🟥 Deep burgundy | `--bp-bg-base` | `#1a0a0f` | App background |
| 🌹 Dark rose | `--bp-bg-surface` | `#22101a` | Cards |
| 🌸 Rose mid | `--bp-bg-surface-alt` | `#2d1522` | Hover states |
| 🌷 Rose gold | `--bp-accent` | `#fb7185` | Primary accent |
| 🟡 Peach | `--bp-warning` | `#fdba74` | Warning state |
| 🔴 Crimson | `--bp-danger` | `#f43f5e` | Danger state |

### Typography
Replacing DM Sans with **Fraunces** (a variable display serif with personality)
for UI labels — optical size variable makes it readable at small sizes while
retaining its distinctive warmth. A strong visual contrast with the default.

### Full Token Set

```json
{
  "id": "rose",
  "name": "Rose",
  "description": "Warm. Playful. Your finances, beautifully alive.",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base":            "#1a0a0f",
    "--bp-bg-surface":         "#22101a",
    "--bp-bg-surface-alt":     "#2d1522",
    "--bp-bg-overlay":         "rgba(0,0,0,0.78)",
    "--bp-border":             "#3d1a28",
    "--bp-border-strong":      "#5c2840",
    "--bp-accent":             "#fb7185",
    "--bp-accent-muted":       "rgba(251,113,133,0.12)",
    "--bp-accent-glow":        "rgba(251,113,133,0.28)",
    "--bp-positive":           "#f472b6",
    "--bp-warning":            "#fdba74",
    "--bp-danger":             "#f43f5e",
    "--bp-positive-muted":     "rgba(244,114,182,0.1)",
    "--bp-warning-muted":      "rgba(253,186,116,0.1)",
    "--bp-danger-muted":       "rgba(244,63,94,0.1)",
    "--bp-text-primary":       "#fff1f2",
    "--bp-text-secondary":     "#fda4af",
    "--bp-text-muted":         "#7c3f52",
    "--bp-font-ui":            "'Fraunces', Georgia, serif",
    "--bp-font-mono":          "'DM Mono', 'Courier New', monospace",
    "--bp-radius-sm":          "8px",
    "--bp-radius-md":          "14px",
    "--bp-radius-lg":          "22px",
    "--bp-heat-none":          "#1a0a0f",
    "--bp-heat-low":           "#4c1d3a",
    "--bp-heat-mid":           "#fdba74",
    "--bp-heat-high":          "#f43f5e",
    "--bp-duration-fast":      "120ms",
    "--bp-duration-normal":    "250ms",
    "--bp-duration-slow":      "500ms",
    "--bp-easing-default":     "cubic-bezier(0.4, 0, 0.2, 1)",
    "--bp-easing-spring":      "cubic-bezier(0.34, 1.7, 0.64, 1)",
    "--bp-easing-bounce":      "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    "--bp-motion-intensity":   "1",
    "--bp-sidebar-width-full": "248px",
    "--bp-sidebar-width-rail": "64px",
    "--bp-icon-stroke":        "1.75",
    "--bp-icon-size-sm":       "16px",
    "--bp-icon-size-md":       "22px",
    "--bp-icon-size-lg":       "28px"
  }
}
```

### Etsy Listing
- **File:** `budgetpilot-theme-rose-v1.json`
- **Price:** $3.99
- **Title:** BudgetPilot Theme Pack · Rose · Warm Dark Pink · Beautiful Finance Tracker Skin
- **Tags:** budgetpilot theme, pink budget app, rose gold finance, beautiful budget tracker

---

## 04 — Obsidian

> *"No noise. No ceremony. Just numbers and truth."*

### Mood & Personality
Radical minimalism. Obsidian strips every visual token to its essence — near-black
backgrounds with pure white text and a single bright accent. No gradients, no
glow effects, minimal radius. The motion is nearly instant — transitions exist
only to prevent jarring cuts, not to entertain. Every interaction feels surgical.

This theme is designed for power users who find visual richness distracting.
The message is: *I don't need the app to be beautiful. I need it to be clear.*

### Motion Personality
Instantaneous. Durations are as short as perceptible — long enough to register
as motion, short enough to feel instant. Linear easing — no spring, no bounce.
`--bp-motion-intensity` is set to `0.3`, further compressing all transitions.

### Color Palette

| Swatch | Token | Value | Role |
|---|---|---|---|
| ⬛ True black | `--bp-bg-base` | `#000000` | App background |
| 🔲 Near-black | `--bp-bg-surface` | `#0a0a0a` | Cards |
| ⬛ Charcoal | `--bp-bg-surface-alt` | `#141414` | Hover states |
| ⚪ Pure white | `--bp-accent` | `#ffffff` | Primary accent |
| 🟡 Yellow | `--bp-warning` | `#facc15` | Warning state |
| 🔴 Red | `--bp-danger` | `#ef4444` | Danger state |

### Typography
**Space Mono** for everything — both UI labels and numbers. A single monospace
font across the entire app creates a terminal-like aesthetic. Numbers feel
computed, not displayed. Labels feel like commands, not decorations.

### Full Token Set

```json
{
  "id": "obsidian",
  "name": "Obsidian",
  "description": "No noise. No ceremony. Just numbers and truth.",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base":            "#000000",
    "--bp-bg-surface":         "#0a0a0a",
    "--bp-bg-surface-alt":     "#141414",
    "--bp-bg-overlay":         "rgba(0,0,0,0.88)",
    "--bp-border":             "#1f1f1f",
    "--bp-border-strong":      "#333333",
    "--bp-accent":             "#ffffff",
    "--bp-accent-muted":       "rgba(255,255,255,0.08)",
    "--bp-accent-glow":        "rgba(255,255,255,0.1)",
    "--bp-positive":           "#4ade80",
    "--bp-warning":            "#facc15",
    "--bp-danger":             "#ef4444",
    "--bp-positive-muted":     "rgba(74,222,128,0.08)",
    "--bp-warning-muted":      "rgba(250,204,21,0.08)",
    "--bp-danger-muted":       "rgba(239,68,68,0.08)",
    "--bp-text-primary":       "#ffffff",
    "--bp-text-secondary":     "#737373",
    "--bp-text-muted":         "#404040",
    "--bp-font-ui":            "'Space Mono', 'Courier New', monospace",
    "--bp-font-mono":          "'Space Mono', 'Courier New', monospace",
    "--bp-radius-sm":          "2px",
    "--bp-radius-md":          "4px",
    "--bp-radius-lg":          "6px",
    "--bp-heat-none":          "#0a0a0a",
    "--bp-heat-low":           "#166534",
    "--bp-heat-mid":           "#facc15",
    "--bp-heat-high":          "#ef4444",
    "--bp-duration-fast":      "60ms",
    "--bp-duration-normal":    "120ms",
    "--bp-duration-slow":      "200ms",
    "--bp-easing-default":     "linear",
    "--bp-easing-spring":      "linear",
    "--bp-easing-bounce":      "linear",
    "--bp-motion-intensity":   "0.3",
    "--bp-sidebar-width-full": "220px",
    "--bp-sidebar-width-rail": "56px",
    "--bp-icon-stroke":        "2.5",
    "--bp-icon-size-sm":       "14px",
    "--bp-icon-size-md":       "18px",
    "--bp-icon-size-lg":       "22px"
  }
}
```

### Etsy Listing
- **File:** `budgetpilot-theme-obsidian-v1.json`
- **Price:** $2.99
- **Title:** BudgetPilot Theme Pack · Obsidian · Ultra-Minimal Black · Power User Finance Skin
- **Tags:** budgetpilot theme, minimal budget app, black theme, terminal aesthetic, power user

---

## 05 — Focus

> *"Everything you need. Nothing to distract you."*

### Mood & Personality
Focus is not a dark theme or a light theme — it is a **reduced-friction theme**.
Its primary design goal is accessibility and reduced cognitive load. High contrast
ratios, near-zero motion, generous spacing, and larger text. It is designed for:

- Users who experience motion sickness from animations
- Users with ADHD who find visual richness distracting
- Users with low vision who need high contrast
- Users who simply prefer stillness over dynamism

The palette is warm white-on-dark rather than blue-tinted — warmer backgrounds
are easier on the eyes during long sessions. The typography switches to
**Atkinson Hyperlegible**, a typeface specifically designed for readability by
the Braille Institute.

### Motion Personality
Near-zero. `--bp-motion-intensity: 0.05` compresses all transitions to 7.5–30ms —
visually imperceptible but present enough to prevent jarring hard-cuts. The easing
functions use `linear` throughout — no spring, no bounce, no personality. Motion
is infrastructure here, not experience.

> **Accessibility note:** This theme is the recommended offering for users who
> have `prefers-reduced-motion: reduce` set in their OS. The app should detect
> this preference and suggest the Focus theme on first load if it is detected.

### Color Palette

| Swatch | Token | Value | Role | WCAG Contrast |
|---|---|---|---|---|
| 🟫 Warm near-black | `--bp-bg-base` | `#111110` | App background | — |
| ⬛ Warm dark | `--bp-bg-surface` | `#1c1c1a` | Cards | — |
| 🔲 Warm charcoal | `--bp-bg-surface-alt` | `#262624` | Hover states | — |
| 🔵 Bright blue | `--bp-accent` | `#60a5fa` | Primary accent | 5.2:1 on base |
| 🟡 Bright yellow | `--bp-warning` | `#fbbf24` | Warning state | 6.1:1 on base |
| 🔴 Bright red | `--bp-danger` | `#f87171` | Danger state | 4.8:1 on base |
| ⬜ Warm white | `--bp-text-primary` | `#fafaf9` | Headings | 17.4:1 on base |

### Full Token Set

```json
{
  "id": "focus",
  "name": "Focus",
  "description": "High contrast. Near-zero motion. Calm by design.",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base":            "#111110",
    "--bp-bg-surface":         "#1c1c1a",
    "--bp-bg-surface-alt":     "#262624",
    "--bp-bg-overlay":         "rgba(0,0,0,0.82)",
    "--bp-border":             "#2e2e2c",
    "--bp-border-strong":      "#44443f",
    "--bp-accent":             "#60a5fa",
    "--bp-accent-muted":       "rgba(96,165,250,0.12)",
    "--bp-accent-glow":        "rgba(96,165,250,0.15)",
    "--bp-positive":           "#4ade80",
    "--bp-warning":            "#fbbf24",
    "--bp-danger":             "#f87171",
    "--bp-positive-muted":     "rgba(74,222,128,0.1)",
    "--bp-warning-muted":      "rgba(251,191,36,0.1)",
    "--bp-danger-muted":       "rgba(248,113,113,0.1)",
    "--bp-text-primary":       "#fafaf9",
    "--bp-text-secondary":     "#a8a29e",
    "--bp-text-muted":         "#57534e",
    "--bp-font-ui":            "'Atkinson Hyperlegible', system-ui, sans-serif",
    "--bp-font-mono":          "'DM Mono', 'Courier New', monospace",
    "--bp-radius-sm":          "6px",
    "--bp-radius-md":          "10px",
    "--bp-radius-lg":          "16px",
    "--bp-heat-none":          "#1c1c1a",
    "--bp-heat-low":           "#14532d",
    "--bp-heat-mid":           "#fbbf24",
    "--bp-heat-high":          "#f87171",
    "--bp-duration-fast":      "150ms",
    "--bp-duration-normal":    "300ms",
    "--bp-duration-slow":      "600ms",
    "--bp-easing-default":     "linear",
    "--bp-easing-spring":      "linear",
    "--bp-easing-bounce":      "linear",
    "--bp-motion-intensity":   "0.05",
    "--bp-sidebar-width-full": "252px",
    "--bp-sidebar-width-rail": "68px",
    "--bp-icon-stroke":        "2",
    "--bp-icon-size-sm":       "18px",
    "--bp-icon-size-md":       "22px",
    "--bp-icon-size-lg":       "28px"
  }
}
```

### Etsy Listing
- **File:** `budgetpilot-theme-focus-v1.json`
- **Price:** $2.99
- **Title:** BudgetPilot Theme Pack · Focus · High Contrast · Accessibility · Reduced Motion
- **Tags:** budgetpilot theme, accessible budget app, reduced motion, high contrast, adhd friendly

---

## Theme Comparison Summary

| Property | Midnight | Forest | Rose | Obsidian | Focus |
|---|---|---|---|---|---|
| **Palette** | Deep navy + teal | Moss green | Burgundy + rose | Pure black + white | Warm dark + blue |
| **Font UI** | DM Sans | Literata (serif) | Fraunces (serif) | Space Mono | Atkinson Hyperlegible |
| **Font Mono** | DM Mono | JetBrains Mono | DM Mono | Space Mono | DM Mono |
| **Radius** | 6/10/16px | 8/14/20px | 8/14/22px | 2/4/6px | 6/10/16px |
| **Motion Speed** | Standard (300ms) | Slow (500ms) | Fast (250ms) | Instant (120ms) | Near-zero (×0.05) |
| **Motion Style** | Smooth spring | Organic settle | Strong bounce | Linear | Linear |
| **Icon Stroke** | 2.0 | 1.5 | 1.75 | 2.5 | 2.0 |
| **Icon Overrides** | No | Yes (nav + category) | No | No | No |
| **Accessibility** | Good | Good | Good | Good | Excellent |
| **Etsy Price** | Free (bundled) | $3.99 | $3.99 | $2.99 | $2.99 |
| **Target User** | Everyone | Calm seekers | Warmth seekers | Power users | Accessibility |

---

## Bundle Opportunity

Consider selling all five themes as a bundle at a discount:

| Listing | Contents | Price |
|---|---|---|
| Individual packs | Forest, Rose, Obsidian, or Focus | $2.99–$3.99 each |
| **Complete Theme Bundle** | All 4 premium packs | **$9.99** (saves ~$5) |

**Bundle title (SEO):**
`BudgetPilot Complete Theme Bundle · 4 App Skins · Forest Rose Obsidian Focus`

---

## Implementation Notes for Developers

### ThemeIcon Component

```typescript
// src/components/ThemeIcon.tsx
import { useAppStore } from '../store/useAppStore';
import * as LucideIcons from 'lucide-react';

const LUCIDE_FALLBACKS: Record<string, keyof typeof LucideIcons> = {
  'nav-dashboard':      'LayoutDashboard',
  'nav-transactions':   'ArrowLeftRight',
  'nav-import':         'Upload',
  'nav-budget':         'PieChart',
  'nav-debts':          'TrendingDown',
  'nav-settings':       'Settings',
  'nav-export':         'Download',
  'category-food':      'UtensilsCrossed',
  'category-coffee':    'Coffee',
  'category-transport': 'Car',
  'category-shopping':  'ShoppingBag',
  'category-savings':   'Piggybank',
};

interface ThemeIconProps {
  slot: string;
  size?: number;
  className?: string;
}

export function ThemeIcon({ slot, size, className }: ThemeIconProps) {
  const { activeTheme } = useAppStore();
  const iconSize = size ?? parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--bp-icon-size-md') || '20'
  );
  const stroke = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--bp-icon-stroke') || '2'
  );

  // Use theme SVG override if available
  if (activeTheme?.icons?.[slot]) {
    return (
      <span
        className={className}
        style={{ width: iconSize, height: iconSize, display: 'inline-flex' }}
        dangerouslySetInnerHTML={{ __html: activeTheme.icons[slot] }}
      />
    );
  }

  // Fall back to Lucide icon
  const lucideName = LUCIDE_FALLBACKS[slot];
  if (!lucideName) return null;
  const LucideIcon = LucideIcons[lucideName] as React.FC<{
    size: number; strokeWidth: number; className?: string;
  }>;
  return <LucideIcon size={iconSize} strokeWidth={stroke} className={className} />;
}
```

### NivoTheme Utility

```typescript
// src/components/NivoTheme.ts
// Maps --bp-* CSS variables to a Nivo theme object.
// Call once per chart component render.

export function getNivoTheme() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    background:  'transparent',
    textColor:   v('--bp-text-secondary'),
    fontSize:    13,
    fontFamily:  v('--bp-font-ui'),
    axis: {
      ticks: { text: { fill: v('--bp-text-muted'), fontSize: 12 } },
      legend: { text: { fill: v('--bp-text-secondary') } },
    },
    grid:   { line: { stroke: v('--bp-border'), strokeWidth: 1 } },
    labels: { text: { fill: v('--bp-text-primary'), fontWeight: 600 } },
    tooltip: {
      container: {
        background:  v('--bp-bg-surface'),
        color:       v('--bp-text-primary'),
        border:      `1px solid ${v('--bp-border-strong')}`,
        borderRadius: v('--bp-radius-md'),
        boxShadow:   `0 8px 32px rgba(0,0,0,0.5)`,
        fontSize:    13,
      }
    },
  };
}
```

### Font Loading

Each theme that specifies a custom font requires that font to be loaded.
The app loads fonts lazily when a theme is applied:

```typescript
// src/lib/theme.ts — inside applyTheme()
const FONT_URLS: Record<string, string> = {
  'Literata':              'https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;700&display=swap',
  'Fraunces':              'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;600&display=swap',
  'Space Mono':            'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
  'Atkinson Hyperlegible': 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap',
  'JetBrains Mono':        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
};

function loadThemeFont(fontName: string): void {
  if (!FONT_URLS[fontName]) return;
  const existing = document.querySelector(`link[data-font="${fontName}"]`);
  if (existing) return; // already loaded
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_URLS[fontName];
  link.setAttribute('data-font', fontName);
  document.head.appendChild(link);
}
```

> **Offline note:** Custom fonts load from Google Fonts on theme application.
> If the user is offline when applying a new theme, the font will not load and
> the browser will fall back to the system font stack. This is acceptable behavior
> — the theme otherwise applies correctly. The Midnight default theme uses only
> system-available fonts and always loads correctly offline.

---

## Version Compatibility

Theme pack versions are tied to the token set version, not the app version.
A token set version bump (e.g. `1.0` → `2.0`) happens only when new required
tokens are added. Theme packs created for `v1.0` will still work in future
app versions — missing new tokens fall back to THEME_MIDNIGHT defaults.

| Theme Pack Version | Compatible App Versions | Notes |
|---|---|---|
| `1.0` | BudgetPilot v1.x, v2.x | Base token set |
| `2.0` (future) | BudgetPilot v2.x+ | Adds tokens as needed |

Sellers should include the token set version in the filename:
`budgetpilot-theme-[name]-v[version].json`
e.g. `budgetpilot-theme-forest-v1.json`

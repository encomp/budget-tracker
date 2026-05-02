#!/usr/bin/env node
/**
 * BudgetPilot Etsy Packaging Script
 *
 * Packages the app and/or theme packs into zips ready for Etsy upload.
 * Run via npm scripts defined in package.json.
 *
 * Usage:
 *   node scripts/package-etsy.mjs --target themes   # individual theme zips
 *   node scripts/package-etsy.mjs --target bundle   # all 4 themes in one zip
 *   node scripts/package-etsy.mjs --target app      # core product zip (needs dist/)
 *   node scripts/package-etsy.mjs --target all      # everything
 */

import archiver from 'archiver'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = join(__dirname, '..')                   // budgetpilot/
const THEMES_DIR = join(ROOT, 'public', 'themes')
const DIST_DIR   = join(ROOT, 'dist')
const OUT_DIR    = join(ROOT, 'etsy-packages')

// Bump these when releasing new versions
const APP_VERSION   = '1'
const THEME_VERSION = '1'

// ─── Theme metadata ───────────────────────────────────────────────────────────
// Only premium (paid) themes appear here.
// Bundled themes (Midnight, Focus) are not sold as separate Etsy listings.

const THEMES = [
  {
    id: 'forest',
    name: 'Forest',
    description:
      'Organic. Unhurried. Rooted in calm. Deep moss greens and earth tones\n' +
      'with Literata typography — designed for users who want their budget\n' +
      'tracker to feel like breathing room, not a spreadsheet.',
    filename: `budgetpilot-theme-forest-v${THEME_VERSION}.json`,
  },
  {
    id: 'rose',
    name: 'Rose',
    description:
      'Warm. Playful. Your finances, beautifully alive. Deep burgundy with\n' +
      'rose-gold accents and Fraunces typography. Opens like a beautiful\n' +
      'journal, not a dashboard.',
    filename: `budgetpilot-theme-rose-v${THEME_VERSION}.json`,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description:
      'No noise. No ceremony. Pure black backgrounds with white accents and\n' +
      'Space Mono typography throughout. Every interaction feels surgical.',
    filename: `budgetpilot-theme-obsidian-v${THEME_VERSION}.json`,
  },
  {
    id: 'focus',
    name: 'Focus',
    description:
      'High contrast. Near-zero motion. Atkinson Hyperlegible typography\n' +
      'for maximum readability. Designed for reduced motion, ADHD-friendly,\n' +
      'and low-vision accessibility.',
    filename: `budgetpilot-theme-focus-v${THEME_VERSION}.json`,
  },
]

// ─── README generators ────────────────────────────────────────────────────────

const SEP = '─'.repeat(64)

const INSTALL_STEPS = `INSTALLING
  1. Open BudgetPilot in your browser (or the installed PWA)
  2. Go to Settings → Appearance
  3. Drop the .json file into the upload zone
     (or click the zone to browse for the file)
  4. Click "Save & Apply"

You can switch back to any theme at any time from the gallery.
Your data is never affected by theme changes.`

const FONT_NOTE = `FONT NOTE
This theme uses a custom font loaded from Google Fonts on first apply.
A brief internet connection is required the first time you apply the theme.
After that, your browser caches the font and the app works fully offline.`

const SUPPORT = `SUPPORT
Questions? Contact the seller via your Etsy order page.`

function themeReadme(theme) {
  return [
    `BUDGETPILOT THEME PACK — ${theme.name.toUpperCase()}`,
    SEP,
    '',
    'INCLUDED',
    `  ${theme.filename}`,
    '',
    'ABOUT THIS THEME',
    theme.description,
    '',
    INSTALL_STEPS,
    '',
    FONT_NOTE,
    '',
    'MORE THEME PACKS',
    'Other BudgetPilot themes are available as separate listings in the',
    "seller's Etsy shop. A Complete Theme Bundle (all 4 packs) is also available.",
    '',
    'Requires BudgetPilot app (sold separately).',
    '',
    SUPPORT,
  ].join('\n')
}

function bundleReadme() {
  const fileList = THEMES.map(
    (t) => `  ${t.filename.padEnd(46)} — ${t.name}`
  )
  return [
    'BUDGETPILOT COMPLETE THEME BUNDLE',
    SEP,
    '',
    'INCLUDED',
    ...fileList,
    '',
    'INSTALLING EACH THEME',
    '  1. Open BudgetPilot in your browser (or the installed PWA)',
    '  2. Go to Settings → Appearance',
    '  3. Drop any .json file into the upload zone (or click to browse)',
    '  4. Click "Save & Apply"',
    '',
    'You can install all four and switch between them freely from the',
    'theme gallery. No re-uploading required.',
    '',
    'FONT NOTE',
    'Each theme uses a custom font loaded from Google Fonts on first apply.',
    'A brief internet connection is required the first time you apply each',
    'theme. After that, fonts are cached and the app works fully offline.',
    '',
    SUPPORT,
  ].join('\n')
}

// ─── Zip helper ───────────────────────────────────────────────────────────────

function zip(outputPath, addFiles) {
  return new Promise((resolve, reject) => {
    mkdirSync(dirname(outputPath), { recursive: true })
    const output  = createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      const kb = (archive.pointer() / 1024).toFixed(1)
      const rel = outputPath.replace(ROOT + '/', '')
      console.log(`  ✓  ${rel} (${kb} KB)`)
      resolve()
    })

    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') reject(err)
    })
    archive.on('error', reject)
    archive.pipe(output)
    addFiles(archive)
    archive.finalize()
  })
}

// ─── Packaging targets ────────────────────────────────────────────────────────

async function packageThemes() {
  console.log('\nPackaging individual themes...')
  for (const theme of THEMES) {
    const jsonPath = join(THEMES_DIR, theme.filename)
    if (!existsSync(jsonPath)) {
      console.warn(`  ⚠  Skipping ${theme.filename} — file not found in public/themes/`)
      continue
    }
    const outPath = join(OUT_DIR, `budgetpilot-theme-${theme.id}-v${THEME_VERSION}.zip`)
    await zip(outPath, (archive) => {
      archive.file(jsonPath, { name: theme.filename })
      archive.append(themeReadme(theme), { name: 'README.txt' })
    })
  }
}

async function packageBundle() {
  console.log('\nPackaging theme bundle...')
  const missing = THEMES.filter((t) => !existsSync(join(THEMES_DIR, t.filename)))
  if (missing.length > 0) {
    console.error(
      `  ✗  Bundle requires all theme files. Missing:\n` +
      missing.map((t) => `     ${t.filename}`).join('\n')
    )
    process.exit(1)
  }
  const outPath = join(OUT_DIR, `budgetpilot-theme-bundle-v${THEME_VERSION}.zip`)
  await zip(outPath, (archive) => {
    for (const theme of THEMES) {
      archive.file(join(THEMES_DIR, theme.filename), { name: theme.filename })
    }
    archive.append(bundleReadme(), { name: 'README.txt' })
  })
}

async function packageApp() {
  console.log('\nPackaging core app...')
  if (!existsSync(DIST_DIR)) {
    console.error(
      '  ✗  dist/ folder not found.\n' +
      '     Run `npm run build` before `npm run package:app`.'
    )
    process.exit(1)
  }
  const outPath = join(OUT_DIR, `BudgetPilot-v${APP_VERSION}.zip`)
  // Zip dist/ contents into a BudgetPilot/ top-level folder inside the zip
  await zip(outPath, (archive) => {
    archive.directory(DIST_DIR, 'BudgetPilot')
  })
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

const VALID_TARGETS = ['themes', 'bundle', 'app', 'all']

// Support both --target=value and --target value
const targetIdx = process.argv.indexOf('--target')
const target =
  process.argv.find((a) => a.startsWith('--target='))?.split('=')[1] ??
  (targetIdx !== -1 ? process.argv[targetIdx + 1] : undefined)

if (!target || !VALID_TARGETS.includes(target)) {
  console.error(
    'Usage: node scripts/package-etsy.mjs --target [themes|bundle|app|all]\n'
  )
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

try {
  if (target === 'themes' || target === 'all') await packageThemes()
  if (target === 'bundle' || target === 'all') await packageBundle()
  if (target === 'app'    || target === 'all') await packageApp()
  console.log('\nDone. Output in etsy-packages/\n')
} catch (err) {
  console.error('\nPackaging failed:', err.message)
  process.exit(1)
}

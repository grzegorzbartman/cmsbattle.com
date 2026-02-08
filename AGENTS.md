# AGENTS.md — CMS Battle (cmsbattle.com)

## What is this project?

A single-page web application comparing **13 CMS platforms** across **110 features** in **24 categories**. Built with Astro (Node.js) for static site generation, deployed on Cloudflare Pages. All comparison data lives in JSON files; Astro imports them at build time and renders static HTML; Alpine.js handles client-side interactivity (feature tables, QFD decision matrix, executive summaries, dark mode).

### CMS platforms compared (alphabetical)

| Key  | CMS          | Type                   |
|------|-------------|------------------------|
| `cr` | Craft CMS 5 | Full-stack CMS         |
| `di` | Directus 11 | Database Wrapper CMS   |
| `d`  | Drupal 11   | Full-stack CMS         |
| `gh` | Ghost 6     | Publishing CMS         |
| `jo` | Joomla 6    | Full-stack CMS         |
| `k`  | KeystoneJS 6| Headless CMS           |
| `oc` | October CMS 4| Full-stack CMS        |
| `p`  | Payload CMS | Headless CMS + Framework|
| `s`  | Strapi v5   | Headless CMS           |
| `su` | Sulu CMS 3  | Full-stack CMS         |
| `t3` | TYPO3 14    | Full-stack CMS         |
| `wa` | Wagtail 7   | Full-stack CMS         |
| `wp` | WordPress   | Full-stack CMS         |

**All lists, tables, and data MUST be in alphabetical order by CMS name.**

---

## Tech stack

- **Framework:** Astro 5.x (Node.js, static site generation)
- **Frontend:** Alpine.js 3.x + CSS (Alpine via CDN, no build step for JS/CSS)
- **Data:** JSON files in `data/`
- **Hosting:** Cloudflare Pages (static site)
- **Fonts:** Google Fonts (DM Serif Display, Instrument Sans, JetBrains Mono)

### How to run locally

```bash
npm install          # Install dependencies (first time only)
npm run dev          # Start Astro dev server with hot reload
npm run build        # Build static site to dist/
npm run preview      # Preview production build locally
```

Dev server runs at `http://localhost:4321/`.

---

## Project structure

```
cmsbattle.com/
├── astro.config.mjs           # Astro config (output: static)
├── package.json               # Astro dependency
├── tsconfig.json              # TypeScript config (extends Astro)
├── data/                      # ★ ALL comparison data (JSON)
│   ├── categories.json        # 24 categories, 110 features, scores for 13 CMS
│   ├── executives.json        # Executive summaries (strengths, weaknesses, bestFor, avoidIf)
│   ├── metrics.json           # Hard numbers (GitHub stars, contributors, extensions, age, market share)
│   └── releases.json          # Latest version + release date per CMS
├── public/
│   ├── css/style.css          # All styles (light + dark mode, developer aesthetic)
│   └── js/app.js              # Alpine.js components (theme, categoryBrowser, qfdWizard, executive, nav)
├── src/
│   ├── layouts/
│   │   └── Layout.astro       # HTML shell, theme toggle, injects JSON into window.CMS_DATA
│   ├── pages/
│   │   └── index.astro        # Main page — imports all JSON + components (replaces PHP controller)
│   └── components/
│       ├── Hero.astro         # Hero section (stats: 12 systems, 24 categories, 110 features)
│       ├── Nav.astro          # Sticky navigation (Alpine.js scroll spy)
│       ├── Overview.astro     # CMS overview cards with release info (build-time rendered)
│       ├── Metrics.astro      # Hard numbers table (build-time rendered loop)
│       ├── Headless.astro     # Headless/hybrid capabilities cards
│       ├── Comparison.astro   # Alpine.js-rendered feature comparison tables
│       ├── Wizard.astro       # QFD decision matrix (Alpine.js)
│       ├── Executive.astro    # Alpine.js-rendered executive summary cards
│       ├── Confidence.astro   # Methodology & confidence levels
│       └── Footer.astro       # Footer
├── AGENTS.md
└── .cursor/skills/
    ├── add-new-cms/SKILL.md          # Skill for adding a new CMS platform
    ├── test-application/SKILL.md     # Skill for testing the app via Chrome DevTools
    └── update-cms-releases/SKILL.md  # Skill for updating release dates
```

---

## Data files — format and rules

### `data/categories.json`

Array of category objects. Each category has `name`, `icon`, and `features` array.

Each feature object has:
- `name` — feature name (string)
- CMS score keys: `cr`, `d`, `wp`, `t3`, `s`, `su`, `p`, `gh`, `jo`, `k`, `oc`, `di`, `wa`
- CMS tooltip keys: `dt`, `wpt`, `t3t`, `st`, `sut`, `pt`, `ght`, `jot`, `kt`, `oct`, `dit`, `crt`, `wat`

Score values: `"full"` | `"partial"` | `"plugin"` | `"none"`

```json
{
  "name": "Category Name",
  "icon": "🏗️",
  "features": [
    {
      "name": "Feature name",
      "d": "full", "wp": "plugin", "t3": "full", "s": "partial", "su": "full", "p": "full", "gh": "none", "jo": "full", "k": "none", "di": "partial", "cr": "full", "oc": "partial",
      "dt": "Drupal tooltip", "wpt": "WP tooltip", "t3t": "TYPO3 tooltip", "st": "Strapi tooltip", "sut": "Sulu tooltip", "pt": "Payload tooltip", "ght": "Ghost tooltip", "jot": "Joomla tooltip", "kt": "Keystone tooltip", "oct": "October tooltip", "dit": "Directus tooltip", "crt": "Craft tooltip"
    }
  ]
}
```

Score values are used by the feature comparison tables to show support level per CMS.

### `data/releases.json`

Object with `_meta` and one key per CMS (`craft`, `drupal`, `wordpress`, `typo3`, `strapi`, `payload`, `ghost`, `joomla`, `keystone`, `directus`, `october`, `sulu`). Each has: `name`, `latest_version`, `release_date`, `release_url`, `releases_page`, `github`. The `github` field is used as a clickable link on the CMS name in the Metrics table — always use the GitHub URL (even for mirrors).

### `data/executives.json`

Array of objects: `name`, `color` (CSS var), `strengths` (array), `weaknesses` (array), `bestFor` (string), `avoidIf` (string). **Alphabetical order.**

### `data/metrics.json`

Object with `_meta` and one key per CMS. Each has: `github_stars`, `contributors`, `extensions`, `extensions_label`, `first_release`, `age_years`, `market_share`, `sites`, plus `*_note` fields for context.

---

## How the data flows

```
categories.json ─┐
executives.json ─┼─→ index.astro (build-time import) ─→ Layout.astro (window.CMS_DATA) ─→ Alpine.js
releases.json   ─┤                                     └→ Astro components (Overview, Metrics)
metrics.json    ─┘
```

1. `src/pages/index.astro` imports all 4 JSON files at build time via ES module imports.
2. `categories` and `executives` are passed to `Layout.astro` which injects them into `window.CMS_DATA` for Alpine.js.
3. `releases` and `metrics` are passed as props to `Overview.astro` and `Metrics.astro` for build-time rendering.
4. `app.js` registers Alpine.js stores and data components. Alpine.js renders: feature comparison tables, QFD wizard/matrix, executive summary cards, nav scroll spy.
5. QFD wizard reads from `window.CMS_DATA.categories` (same data as the Comparison section). It auto-calculates scores by converting `full/partial/plugin/none` to numeric values (10/5/7/0) and averaging per category. Users select categories, optionally drill down to individual features, and set importance weights (1-9). State is encoded in the URL hash (`#qfd=BASE64`) for shareable links.

---

## Common change scenarios

### Adding a new feature to an existing category

1. Edit `data/categories.json` — find the category, add a feature object with all 13 CMS scores + 13 tooltips.
2. Update feature count in `src/components/Hero.astro` and `src/components/Overview.astro`.

### Adding a new category

Same as above, plus:
1. Add the entire category object to `data/categories.json`.
2. Update the category count in `src/components/Hero.astro`.

### Adding a new CMS platform

This is a major change affecting every file:
1. `data/categories.json` — add score + tooltip keys to every feature (e.g., `"xx": "full"`, `"xxt": "tooltip"`). QFD wizard scores are auto-calculated from this data.
2. `data/releases.json` — add CMS entry.
3. `data/executives.json` — add executive summary.
4. `data/metrics.json` — add metrics entry.
5. `public/js/app.js` — add to `CMS_NAMES`, `CMS_KEYS`, `TOOLTIP_KEYS`, `CMS_SHORT`, and `ALT_REASONS`. Tables and QFD wizard render dynamically from `CMS_KEYS` via Alpine.js.
6. `public/css/style.css` — add CSS color variable (`--newcms`).
7. `src/components/Overview.astro` — add CMS card (alphabetical position).
8. `src/components/Confidence.astro` — add confidence bar + source link.
9. `src/components/Metrics.astro` — add CMS key to `cmsOrder` array and `cmsColors` map in frontmatter.
10. `src/components/Headless.astro` — add card if full-stack CMS with API support.
11. `src/components/Hero.astro` — update system count number.
12. `src/layouts/Layout.astro` — update `<title>` and `<meta description>`.

### Updating release versions

Follow the skill at `.cursor/skills/update-cms-releases/SKILL.md`. Edit `data/releases.json` only.

---

## CSS variables & theming

Light mode is default. Dark mode via `data-theme="dark"` on `<html>`. Toggle button in `Layout.astro`, managed by `Alpine.store('theme')` in `app.js`.

CMS color variables (used in cards, badges, QFD wizard):
```css
--craft, --drupal, --wordpress, --typo3, --strapi, --sulu, --payload, --ghost, --joomla, --keystone, --october, --directus, --wagtail
```

---

## Key conventions

1. **Alphabetical order** — CMS platforms are always listed alphabetically (Craft CMS, Directus, Drupal, Ghost, Joomla, KeystoneJS, October CMS, Payload, Strapi, Sulu, TYPO3, Wagtail, WordPress) in all data files, components, and JS.
2. **CMS key mapping** — `cr`=Craft CMS, `d`=Drupal, `wp`=WordPress, `t3`=TYPO3, `s`=Strapi, `su`=Sulu, `p`=Payload, `gh`=Ghost, `jo`=Joomla, `k`=KeystoneJS, `oc`=October CMS, `di`=Directus, `wa`=Wagtail.
3. **Tooltip keys** — same as CMS key + `t` suffix: `crt`, `dt`, `wpt`, `t3t`, `st`, `sut`, `pt`, `ght`, `jot`, `kt`, `oct`, `dit`, `wat`.
4. **No build tools for CSS/JS** — CSS and JS are served directly from `public/`. Alpine.js loaded via CDN. No webpack, Vite, or npm for frontend assets. Astro only handles HTML generation.
5. **Data in JSON, presentation in Astro/Alpine** — never hardcode CMS data in components. All data comes from `data/*.json`. Alpine.js components use `x-for`, `x-data`, `x-show` etc. in Astro templates.
6. **Section display order** — hero → nav → overview → metrics → headless → comparison (feature tables) → QFD wizard → executive → confidence → footer.
7. **QFD shareable URLs** — QFD wizard state is encoded as base64 JSON in URL hash (`#qfd=...`). Contains enabled category indices, importance weights, disabled features (for drill-down), custom requirements, and notes. Nothing is stored server-side.
8. **QFD scores from Comparison** — QFD wizard does not have its own data file. It reads `categories.json` (same as Comparison section) and auto-calculates scores: `full`=10, `plugin`=7, `partial`=5, `none`=0, averaged per category. Users can drill down to include/exclude individual features.

---

## Useful commands

```bash
npm run dev          # Start Astro dev server (hot reload at localhost:4321)
npm run build        # Build static site to dist/
npm run preview      # Preview production build locally
git add -A && git commit -m "message" && git push  # Deploy via Cloudflare Pages auto-deploy
```

---

## Deployment

- **Hosting:** Cloudflare Pages
- **Domain:** cmsbattle.com
- **Repository:** `grzegorzbartman/cmsbattle.com` on GitHub (private)
- **Deploy trigger:** Every `git push` to `main` triggers automatic redeploy on Cloudflare Pages
- **Build command:** `npm run build`
- **Output directory:** `dist/`
- **Environment variable:** `NODE_VERSION` = `18`

```bash
git add -A && git commit -m "message" && git push
```

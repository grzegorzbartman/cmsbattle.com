---
name: add-new-cms
description: Add a new CMS platform to the comparison project. Guides through researching features, scoring 110 features across 24 categories, updating all data files (categories.json, releases.json, metrics.json, executives.json), Astro components, Alpine.js constants, and CSS. QFD wizard scores are auto-calculated from categories.json. Uses MCP Perplexity, MCP Chrome DevTools, and web search for thorough research. Use when the user asks to add a CMS, include a new platform, or expand the comparison.
---

# Add a New CMS Platform

## Overview

Adding a CMS requires updating **13+ files** and scoring **110 features** across **24 categories**. This skill ensures thorough, research-backed data collection and consistent implementation. QFD wizard scores are auto-calculated from `categories.json` — no separate QFD data file needed.

**Estimated effort:** 15-25 minutes of agent work.

## Before You Start

1. Read `AGENTS.md` for current project state (CMS count, feature count, key conventions).
2. Read `data/categories.json` to understand all 24 categories and 110 features.
3. Choose a **2-letter CMS key** (lowercase, unique, alphabetical position matters).
4. Choose a **CSS brand color** (hex) from the CMS's official branding.

### CMS Key Naming Convention

Keys are short abbreviations: `d`=Drupal, `wp`=WordPress, `cr`=Craft, `gh`=Ghost, etc.
Tooltip keys = CMS key + `t` suffix: `dt`, `wpt`, `crt`, etc.

---

## Phase 1: Research (use all available tools)

Research **must** happen before any code changes. Gather data across 6 dimensions.

### 1A: Core Features & Architecture

Use **MCP Perplexity** (WebSearch tool) with these queries:

```
"[CMS] features content modeling field types custom types [year]"
"[CMS] access control permissions RBAC field-level [year]"
"[CMS] content workflow drafts versioning revision history"
"[CMS] multilingual i18n translation localization"
"[CMS] API REST GraphQL headless capabilities"
"[CMS] search full-text faceted search"
"[CMS] caching performance cache tags invalidation"
"[CMS] admin panel dashboard UI experience"
"[CMS] CLI developer experience hooks events plugins extensions"
"[CMS] configuration management config export import git"
"[CMS] media library image manipulation file management"
"[CMS] forms validation conditional fields"
"[CMS] migration import export ETL CSV XML"
"[CMS] taxonomy tags categories hierarchical"
"[CMS] URL routing redirects slugs menu system"
```

### 1B: Security Features

```
"[CMS] security 2FA two-factor authentication CSRF XSS"
"[CMS] password policy brute force protection session timeout"
"[CMS] SSO SAML LDAP OAuth single sign-on"
"[CMS] CAPTCHA bot protection security headers CSP HSTS"
"[CMS] security advisory vulnerability disclosure"
```

### 1C: Modern Features (AI, SEO, Visual Editing)

```
"[CMS] AI content generation image generation translation [year]"
"[CMS] AI plugins modules chatbot RAG semantic search"
"[CMS] SEO meta tags sitemap canonical schema structured data [year]"
"[CMS] live preview visual page builder inline editing"
"[CMS] multisite multi-tenancy white-label"
"[CMS] personalization A/B testing analytics"
"[CMS] accessibility WCAG alt text a11y"
```

### 1D: Release & Metrics Data

```
"[CMS] latest release version [year]"
"[CMS] GitHub stars contributors [year]"
"[CMS] plugins extensions marketplace count"
"[CMS] market share W3Techs BuiltWith sites [year]"
"[CMS] first release year history"
```

### 1E: Verify with MCP Chrome DevTools

After web search, use **MCP Chrome DevTools** (browser_navigate + browser_snapshot) to verify key data points:

1. Navigate to the CMS's official documentation site → verify feature claims.
2. Navigate to the CMS's GitHub releases page → confirm latest version + date.
3. Navigate to the CMS's plugin/extension marketplace → confirm extension count.
4. Navigate to W3Techs or BuiltWith → verify market share (if applicable).

### 1F: Cross-reference with Web Search

Use **WebSearch** as a backup for any data points that Perplexity couldn't confirm:

```
"[CMS] [specific feature] documentation"
"[CMS] vs [competitor] comparison [year]"
```

### Research Quality Checklist

Before proceeding, verify you have:
- [ ] Confirmed feature support for all 24 categories (even if the answer is "none")
- [ ] At least 2 sources for each major feature claim
- [ ] Exact latest release version + date from official source
- [ ] GitHub stars + contributor count from GitHub
- [ ] Extension/plugin count from official marketplace
- [ ] Market share data (or confirmed "n/a" for headless CMS)
- [ ] Brand color hex code from official site

---

## Phase 2: Score All 110 Features

Go through each category in `data/categories.json` and assign a score for the new CMS.

### Scoring Rules

| Score | Meaning | Points |
|-------|---------|--------|
| `"full"` | Core feature, works out of the box | 2 |
| `"plugin"` | Requires a plugin/module/extension to work | 1 |
| `"partial"` | Partially supported, needs config or custom code | 1 |
| `"none"` | Not available, not applicable | 0 |

### Scoring Guidelines

- **Be honest.** Don't inflate scores — the comparison's credibility depends on accuracy.
- **"plugin" vs "partial":** Use `"plugin"` when there's a dedicated, named plugin. Use `"partial"` for workarounds, custom code, or limited built-in support.
- **Headless CMS caveat:** Headless platforms legitimately score `"none"` on display/rendering features (view modes, menus, breadcrumbs, visual page builder). This is by design, not a weakness.
- **Tooltip is mandatory.** Every score must have a tooltip explaining *what* provides the feature (module name, core API name, plugin name, or why it's "none").

### Recommended: Use a Script

For efficiency, create a Python script in `tmp/` that:
1. Defines a dict mapping feature names → (score, tooltip).
2. Reads `data/categories.json`.
3. Adds the new CMS key + tooltip key to every feature.
4. Writes the file back.
5. Prints the total score.

```python
# tmp/add_[cms].py — example structure
import json

with open('data/categories.json', 'r') as f:
    categories = json.load(f)

scores = {
    "Feature name": ("full", "Tooltip text"),
    # ... all 110 features
}

total = 0
for cat in categories:
    for feat in cat["features"]:
        score, tip = scores.get(feat["name"], ("none", "None"))
        feat["xx"] = score      # CMS key
        feat["xxt"] = tip       # Tooltip key
        total += 2 if score == "full" else (1 if score in ("partial", "plugin") else 0)

print(f"Total: {total}/220 ({round(total/220*100)}%)")

with open('data/categories.json', 'w') as f:
    json.dump(categories, f, indent=2, ensure_ascii=False)
```

Run it, verify all 110 features are mapped, then delete the script.

---

## Phase 3: Update All Files

### File Checklist

Update these files **in this order** (dependencies flow top-down):

#### 3.1 Data Files

| # | File | What to add |
|---|------|-------------|
| 1 | `data/categories.json` | Score + tooltip for all 110 features (Phase 2 script) |
| 2 | `data/releases.json` | CMS entry with `name`, `latest_version`, `release_date`, `release_url`, `releases_page`, `github`. **Important:** The `github` field is used as a clickable link on the CMS name in the Metrics table — always use the GitHub URL (even if it's a mirror, e.g. Drupal). |
| 3 | `data/metrics.json` | Entry with `github_stars`, `contributors`, `extensions`, `extensions_label`, `first_release`, `age_years`, `market_share`, `sites` + `*_note` fields |
| 4 | `data/executives.json` | Object with `name`, `color` (CSS var), `strengths` (5 items), `weaknesses` (5 items), `bestFor`, `avoidIf` |

**All entries must be in alphabetical order by CMS name.**

#### 3.2 Frontend Files

| # | File | What to add |
|---|------|-------------|
| 5 | `public/css/style.css` | Add `--newcms: #hexcolor;` to the CMS color variables block |
| 6 | `public/js/app.js` | Add to 5 constant objects: `CMS_NAMES`, `CMS_KEYS` array, `TOOLTIP_KEYS`, `CMS_SHORT`, and `ALT_REASONS`. Tables and QFD wizard render dynamically from `CMS_KEYS` via Alpine.js — no component changes needed for columns. QFD scores auto-calculated from `categories.json` |

#### 3.3 Astro Components

| # | File | What to add |
|---|------|-------------|
| 7 | `src/components/Overview.astro` | Add CMS card (alphabetical position). Update "N traditional / N headless" description |
| 8 | `src/components/Confidence.astro` | Add confidence bar + documentation source link |
| 9 | `src/components/Metrics.astro` | Add CMS key to `cmsOrder` array and `cmsColors` map in frontmatter |
| 10 | `src/components/Headless.astro` | Add headless card **if** the CMS has API capabilities (full-stack CMS with REST/GraphQL). Update counts in note |
| 11 | `src/components/Hero.astro` | Update system count number |
| 12 | `src/layouts/Layout.astro` | Update `<title>` and `<meta description>` |

#### 3.4 Documentation

| # | File | What to update |
|---|------|----------------|
| 13 | `AGENTS.md` | Update CMS count, key mapping table, alphabetical list, tooltip keys, color variables |
| 14 | `.cursor/skills/update-cms-releases/SKILL.md` | Add new CMS to the release check table |

---

## Phase 4: Verification

### 4.1 JSON Validation

```bash
python3 -c "
import json
for f in ['data/categories.json', 'data/releases.json', 'data/metrics.json', 'data/executives.json']:
    d = json.load(open(f))
    if isinstance(d, list): print(f'{f}: OK ({len(d)} items)')
    else: print(f'{f}: OK ({len(d)} keys)')
"
```

### 4.2 Feature Count Check

```bash
python3 -c "
import json
d = json.load(open('data/categories.json'))
total = sum(len(c['features']) for c in d)
keys = list(d[0]['features'][0].keys())
print(f'Features: {total}, Keys per feature: {len(keys)}')
print(f'CMS keys: {[k for k in keys if len(k) <= 3 and k != \"name\"]}')
"
```

Verify:
- Feature count matches `src/components/Hero.astro` and `src/components/Overview.astro`
- All CMS keys present in every feature
- No missing tooltip keys

### 4.3 Build & Visual Verification

1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open `http://localhost:4321/` and verify:
   - New CMS card appears in overview section
   - Score ring shows correct percentage
   - New column appears in feature comparison tables
   - Headless card appears (if applicable)
   - Metrics table includes new CMS row
   - QFD matrix includes new CMS in columns and results
   - Executive summary card renders
   - Confidence bar present

### 4.4 Linter Check

Run `ReadLints` on modified files to catch any JSON or JS errors.

---

## Quick Reference: Current State

Read `AGENTS.md` for the latest counts. As of skill creation:

- **12 CMS platforms** (Craft CMS, Directus, Drupal, Ghost, Joomla, KeystoneJS, October CMS, Payload, Strapi, Sulu, TYPO3, WordPress)
- **110 features** across **24 categories**
- **Max score:** 220 pts (110 × 2)
- **CMS keys:** `cr`, `di`, `d`, `gh`, `jo`, `k`, `oc`, `p`, `s`, `su`, `t3`, `wp`

## Common Pitfalls

1. **Wrong alphabetical position** — CMS must be inserted alphabetically everywhere (data files, components, JS arrays).
2. **Missing tooltip** — every score needs a tooltip key (`xxt`). Features without tooltips still render but show no hover info.
3. **Not updating existing CMS** — if you add new features alongside the CMS, all existing CMS need scores for those features too.
4. **Stale AGENTS.md** — always update documentation after adding a CMS.
5. **Forgetting `Metrics.astro`** — the `cmsOrder` array and `cmsColors` map are hardcoded in the component frontmatter.
6. **Forgetting `app.js` constants** — the new CMS key must be added to all 5 constant objects (`CMS_NAMES`, `CMS_KEYS`, `TOOLTIP_KEYS`, `CMS_SHORT`, `ALT_REASONS`). Feature tables and QFD wizard render dynamically from `CMS_KEYS` via Alpine.js, so no Astro component changes are needed for comparison columns or wizard scores. QFD scores are auto-calculated from `categories.json`.

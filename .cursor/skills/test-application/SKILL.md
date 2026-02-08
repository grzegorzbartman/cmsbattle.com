---
name: test-application
description: Comprehensive testing of the CMS Battle web application using MCP Chrome DevTools. Covers all sections (hero, nav, overview, metrics, headless, comparison tables, QFD wizard, executive summaries, confidence, footer), dark mode, responsiveness, Alpine.js interactivity, data integrity, accessibility, and edge cases. Use when the user asks to test the app, verify changes, run smoke tests, check for regressions, or validate a build.
---

# Test CMS Battle Application

## Overview

This skill provides a structured approach to testing the CMS Battle single-page application (`cmsbattle.com`) using **MCP Chrome DevTools**. The app is built with Astro (static HTML) + Alpine.js (client-side interactivity) and compares 13 CMS platforms across 110 features in 24 categories.

**Estimated effort:** 5-15 minutes depending on scope (smoke test vs full regression).

## Before You Start

1. Ensure the dev server is running: `npm run dev` (or `npm run preview` for production build).
2. The app runs at `http://localhost:4321/`.
3. Read `AGENTS.md` for current project state (CMS count, feature count, category count).
4. Decide which test level to run based on the user's request:
   - **Smoke test** — quick pass through all sections (Phase 1 only)
   - **Section test** — deep test of a specific section
   - **Full regression** — all phases, all sections
   - **Post-change verification** — targeted tests based on what changed

---

## Phase 1: Page Load & Structure Verification

### 1.1 Navigate and Take Snapshot

```
1. Navigate to http://localhost:4321/ using Chrome DevTools navigate_page
2. Wait for "scroll down" text to appear (hero loaded)
3. Take a snapshot to verify initial page structure
```

### 1.2 Verify Page Structure

Check the snapshot for these elements in order:

| # | Section | Expected Content |
|---|---------|-----------------|
| 1 | Hero | Stats: "13" systems, "24" categories, "110" features |
| 2 | Nav | 7 links: overview, metrics, headless, comparison, qfd_matrix, summary, methodology |
| 3 | Overview | 13 CMS cards with version numbers and release dates |
| 4 | Metrics | Table with GitHub stars, contributors, extensions, age, market share |
| 5 | Headless | Cards for CMS platforms with API/headless capabilities |
| 6 | Comparison | 24 category headers (first 3 expanded by default) |
| 7 | QFD Wizard | Category selection panel with 24 toggleable categories |
| 8 | Executive | 13 executive summary cards with strengths/weaknesses |
| 9 | Confidence | Confidence bars + methodology description |
| 10 | Footer | Footer content |

### 1.3 Verify Data Counts

Using evaluate_script, run:

```javascript
() => {
  const data = window.CMS_DATA;
  const catCount = data.categories.length;
  const featCount = data.categories.reduce((sum, c) => sum + c.features.length, 0);
  const execCount = data.executives.length;
  const cmsKeys = Object.keys(data.categories[0].features[0]).filter(k => k.length <= 3 && k !== 'name');
  return {
    categories: catCount,
    features: featCount,
    executives: execCount,
    cmsKeysInData: cmsKeys.length,
    cmsKeys: cmsKeys.sort()
  };
}
```

**Expected:** `categories: 24`, `features: 110`, `executives: 13`, `cmsKeysInData: 13`.

### 1.4 Console Errors Check

```
1. Use list_console_messages to check for JavaScript errors
2. Filter by types: ["error", "warn"]
3. There should be ZERO errors
4. Warnings about Alpine.js CDN or third-party scripts are acceptable
```

---

## Phase 2: Dark Mode / Theme Toggle

### 2.1 Toggle to Dark Mode

```
1. Take snapshot — find the theme toggle button
2. Click the toggle button
3. Take snapshot — verify data-theme="dark" on <html>
4. Verify the toggle text changed from "dark" to "light"
```

### 2.2 Verify Dark Mode Persistence

```
1. After toggling to dark, evaluate_script:
   () => localStorage.getItem('cms-theme')
   Expected: "dark"
2. Reload the page (navigate_page type: "reload")
3. Wait for page load, take snapshot
4. Verify data-theme="dark" persists after reload
```

### 2.3 Toggle Back to Light

```
1. Click the toggle button again
2. Take snapshot — verify data-theme is removed
3. evaluate_script: () => localStorage.getItem('cms-theme')
   Expected: "light"
```

---

## Phase 3: Navigation (Sticky Nav + Scroll Spy)

### 3.1 Test Navigation Links

For each nav link, click it and verify scrolling to the correct section:

```
1. Take snapshot to find nav links
2. Click "comparison" link
3. Wait 1 second for smooth scroll
4. Take snapshot — verify the "comparison" nav link has class "active"
5. Repeat for "wizard" (qfd_matrix) and "executive" (summary)
```

### 3.2 Verify Scroll Spy

```
1. Use evaluate_script to scroll to a specific section:
   () => { document.getElementById('metrics').scrollIntoView(); return true; }
2. Wait 500ms for scroll spy to update
3. Take snapshot — verify "metrics" nav link has "active" class
```

---

## Phase 4: Feature Comparison Tables (Alpine.js categoryBrowser)

### 4.1 Default State

```
1. Scroll to comparison section
2. Take snapshot
3. Verify first 3 categories are expanded (open) by default
4. Verify remaining categories are collapsed
```

### 4.2 Toggle Categories

```
1. Find a collapsed category header (e.g., category 4 or later)
2. Click the category header
3. Take snapshot — verify the category expanded (table visible)
4. Click the same header again
5. Take snapshot — verify the category collapsed
```

### 4.3 Verify Table Content

```
1. With a category expanded, verify:
   - Table has 14 columns (1 "Feature" + 13 CMS columns)
   - Column headers match CMS_SHORT names in alphabetical order:
     Craft, Directus, Drupal, Ghost, Joomla, Keystone, October, Payload, Strapi, Sulu, TYPO3, Wagtail, WP
   - Each cell contains a status icon (checkmark, half-circle, cross, or circled-plus)
2. Use evaluate_script to verify feature count in a category:
   () => {
     const cats = window.CMS_DATA.categories;
     return cats.map(c => ({ name: c.name, features: c.features.length }));
   }
```

### 4.4 Verify Tooltips

```
1. Hover over a status icon in the comparison table
2. Take snapshot — verify a title/tooltip attribute is present
3. The tooltip should contain descriptive text about the CMS's support level
```

---

## Phase 5: QFD Decision Matrix (Alpine.js qfdWizard)

This is the most complex interactive component. Test thoroughly.

### 5.1 Initial State

```
1. Scroll to wizard section
2. Take snapshot
3. Verify: all 24 category cards are visible, none selected (no "selected" class)
4. Verify: QFD matrix table is NOT visible (no active requirements)
5. Verify: Results section is NOT visible
```

### 5.2 Enable Categories

```
1. Click on the first category card to enable it
2. Take snapshot — verify:
   - Card has "selected" class
   - Importance slider appears (default value: 5)
   - Expand button appears showing feature count (e.g., "5/5")
3. Enable 2 more categories by clicking their headers
4. Take snapshot — verify QFD matrix table IS now visible
5. Verify the matrix has:
   - 3 rows (one per enabled category) + total row
   - 13 CMS columns + category column + weight column
```

### 5.3 Adjust Importance Weights

```
1. Find an importance slider for an enabled category
2. Use fill to set its value to "9" (max importance)
3. Take snapshot — verify:
   - The importance badge shows "9"
   - The QFD matrix total scores changed (verify via evaluate_script)
```

Alternatively, use evaluate_script for more reliable slider manipulation:

```javascript
(el) => {
  el.value = 9;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return el.value;
}
```

### 5.4 Feature Drill-Down

```
1. With a category enabled, click the expand/drill-down button (▼)
2. Take snapshot — verify feature checkboxes appear
3. Uncheck one feature checkbox
4. Take snapshot — verify:
   - Feature count updates (e.g., "4/5" instead of "5/5")
   - The unchecked feature has "qfd-feature-disabled" class
   - QFD matrix scores recalculate
5. Re-check the feature
6. Verify count returns to original and scores recalculate
```

### 5.5 QFD Score Calculation Verification

Use evaluate_script to verify the scoring algorithm:

```javascript
() => {
  const cats = window.CMS_DATA.categories;
  const scoreMap = { full: 10, plugin: 7, partial: 5, none: 0 };
  // Calculate expected score for first category, first CMS (Craft = 'cr')
  const cat0 = cats[0];
  const scores = cat0.features.map(f => scoreMap[f.cr] || 0);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    category: cat0.name,
    featureCount: scores.length,
    rawScores: scores,
    averageScore: Math.round(avg * 10) / 10
  };
}
```

Compare this with the displayed value in the QFD matrix for the first category + Craft CMS column.

### 5.6 Custom Requirements

```
1. Click "+ Add custom requirement" button
2. Take snapshot — verify the add form appears
3. Fill in:
   - Title: "Test Requirement"
   - Description: "Testing custom req"
4. Set CMS scores (use fill on number inputs):
   - Set a few CMS scores to different values (e.g., Drupal=10, WordPress=5)
5. Click "Add requirement" button
6. Take snapshot — verify:
   - Custom requirement appears in the list
   - It has an importance slider and remove button
   - It appears as a row in the QFD matrix
   - Scores update accordingly
7. Click the remove button (×) on the custom requirement
8. Verify it disappears and scores recalculate
```

### 5.7 QFD Results Verification

```
1. With at least 2-3 categories enabled (and varied importance weights):
2. Take snapshot of the results section
3. Verify:
   - A winner CMS is announced: "$ recommend: [CMS Name]"
   - An alternative CMS is shown
   - Bar chart shows all 13 CMS platforms sorted by score (descending)
   - Winner bar has "qfd-bar-winner" class
   - All bars have point labels (e.g., "45.2pts")
```

### 5.8 Notes Section

```
1. Find the notes textarea
2. Type test text: "Test note for QFD analysis"
3. Take snapshot — verify text appears in textarea
4. Verify the share section becomes visible (if not already)
```

### 5.9 Shareable URL (State Encoding)

This is critical — QFD state is encoded in the URL hash.

```
1. With categories enabled, weights adjusted, and notes entered:
2. Use evaluate_script:
   () => window.location.hash
3. Verify the hash starts with "#qfd="
4. Verify the hash contains base64 data
5. Navigate to the same URL (copy hash, reload page)
6. Take snapshot — verify all state is restored:
   - Same categories enabled
   - Same importance weights
   - Same disabled features (if any)
   - Same custom requirements (if any)
   - Same notes text
```

State restoration test:

```javascript
() => {
  const hash = window.location.hash;
  if (!hash.startsWith('#qfd=')) return { error: 'No QFD hash' };
  const encoded = hash.substring(5);
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json);
}
```

### 5.10 QFD Edge Cases

```
1. Enable ALL 24 categories → verify matrix renders correctly with 24 rows
2. Set all importance to 1 → verify scores are low but non-zero
3. Set all importance to 9 → verify scores are proportionally high
4. Disable ALL features in a category (drill-down, uncheck all):
   → verify the category score shows 0 for all CMS
5. Enable one category, then disable it → verify matrix disappears
6. Add multiple custom requirements (3+) → verify all render in matrix
```

---

## Phase 6: Executive Summaries (Alpine.js executiveSummaries)

### 6.1 Card Rendering

```
1. Scroll to executive section
2. Take snapshot
3. Verify 13 executive cards are rendered
4. Verify each card contains:
   - CMS name (h3)
   - Strengths list (at least 3 items)
   - Weaknesses list (at least 3 items)
   - "best_for" text
   - "avoid_if" text
```

### 6.2 Card Order

```
Use evaluate_script to verify alphabetical order:
() => {
  return window.CMS_DATA.executives.map(e => e.name);
}
Expected order: Craft CMS, Directus, Drupal, Ghost, Joomla, KeystoneJS, October CMS, Payload, Strapi, Sulu, TYPO3, Wagtail, WordPress
```

---

## Phase 7: Responsive Design Testing

### 7.1 Mobile Viewport (375px)

```
1. Use resize_page: width: 375, height: 812 (iPhone size)
2. Take snapshot — verify:
   - Nav is horizontally scrollable or wraps
   - CMS cards stack vertically
   - Comparison tables are horizontally scrollable
   - QFD matrix is horizontally scrollable
   - All text is readable (not clipped or overlapping)
   - Theme toggle is accessible
```

### 7.2 Tablet Viewport (768px)

```
1. Use resize_page: width: 768, height: 1024
2. Take snapshot — verify:
   - Layout adapts (2-column grid where appropriate)
   - Tables remain usable
   - QFD wizard is functional
```

### 7.3 Desktop Viewport (1440px)

```
1. Use resize_page: width: 1440, height: 900
2. Take snapshot — verify:
   - Full layout displays correctly
   - Cards in multi-column grid
   - Tables are fully visible without scrolling (if they fit)
```

### 7.4 Wide Viewport (1920px+)

```
1. Use resize_page: width: 1920, height: 1080
2. Take snapshot — verify content is centered and not stretched excessively
```

---

## Phase 8: Data Integrity Verification

### 8.1 All CMS Keys Present in Every Feature

```javascript
() => {
  const cats = window.CMS_DATA.categories;
  const expectedKeys = ['cr', 'di', 'd', 'gh', 'jo', 'k', 'oc', 'p', 's', 'su', 't3', 'wa', 'wp'];
  const expectedTooltips = ['crt', 'dit', 'dt', 'ght', 'jot', 'kt', 'oct', 'pt', 'st', 'sut', 't3t', 'wat', 'wpt'];
  const errors = [];
  cats.forEach((cat, ci) => {
    cat.features.forEach((f, fi) => {
      expectedKeys.forEach(k => {
        if (!['full', 'partial', 'plugin', 'none'].includes(f[k])) {
          errors.push(`${cat.name} > ${f.name}: missing or invalid score key "${k}" (value: ${f[k]})`);
        }
      });
      expectedTooltips.forEach(k => {
        if (typeof f[k] !== 'string' || f[k].length === 0) {
          errors.push(`${cat.name} > ${f.name}: missing tooltip key "${k}"`);
        }
      });
    });
  });
  return { totalErrors: errors.length, first10: errors.slice(0, 10) };
}
```

**Expected:** `totalErrors: 0`.

### 8.2 Score Value Validation

```javascript
() => {
  const validScores = ['full', 'partial', 'plugin', 'none'];
  const cats = window.CMS_DATA.categories;
  const cmsKeys = ['cr', 'di', 'd', 'gh', 'jo', 'k', 'oc', 'p', 's', 'su', 't3', 'wa', 'wp'];
  const invalid = [];
  cats.forEach(cat => {
    cat.features.forEach(f => {
      cmsKeys.forEach(k => {
        if (!validScores.includes(f[k])) {
          invalid.push({ feature: f.name, cms: k, value: f[k] });
        }
      });
    });
  });
  return { invalidCount: invalid.length, invalid: invalid.slice(0, 10) };
}
```

### 8.3 Executive Summary Completeness

```javascript
() => {
  const execs = window.CMS_DATA.executives;
  const issues = [];
  execs.forEach(e => {
    if (!e.name) issues.push(`Missing name`);
    if (!e.color) issues.push(`${e.name}: missing color`);
    if (!e.strengths || e.strengths.length < 3) issues.push(`${e.name}: <3 strengths`);
    if (!e.weaknesses || e.weaknesses.length < 3) issues.push(`${e.name}: <3 weaknesses`);
    if (!e.bestFor) issues.push(`${e.name}: missing bestFor`);
    if (!e.avoidIf) issues.push(`${e.name}: missing avoidIf`);
  });
  return { count: execs.length, issues };
}
```

---

## Phase 9: Accessibility (A11y)

### 9.1 Keyboard Navigation

```
1. Press Tab key repeatedly — verify focus moves through interactive elements
2. Verify visible focus indicators on:
   - Theme toggle button
   - Nav links
   - Category headers (comparison section)
   - QFD category cards
   - Importance sliders
   - Checkboxes (feature drill-down)
   - Buttons ("Add custom requirement", "Copy shareable link")
   - Notes textarea
3. Press Enter/Space on focused elements — verify they activate
```

### 9.2 Semantic Structure

```javascript
() => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
  return headings.map(h => ({
    tag: h.tagName,
    text: h.textContent.trim().substring(0, 50)
  }));
}
```

Verify heading hierarchy is logical (h1 > h2 > h3 > h4, no skipped levels).

### 9.3 Color Contrast (Dark Mode)

```
1. Toggle to dark mode
2. Take screenshot
3. Visually inspect for any low-contrast text (especially dimmed/secondary text)
4. Verify status icons (checkmark, cross, etc.) remain distinguishable in dark mode
```

---

## Phase 10: Performance Checks

### 10.1 JavaScript Bundle Size

```javascript
() => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  return scripts.map(s => s.src);
}
```

Verify only 2 scripts load: `/js/app.js` (local) and Alpine.js CDN.

### 10.2 Page Load Performance

```
1. Use performance_start_trace with reload: true, autoStop: true
2. Review the trace results
3. Check Core Web Vitals:
   - LCP (Largest Contentful Paint): should be < 2.5s
   - CLS (Cumulative Layout Shift): should be < 0.1
4. Check for layout shifts from font loading or Alpine.js hydration
```

### 10.3 Alpine.js Initialization

```javascript
() => {
  const start = performance.now();
  // Check if Alpine is initialized
  const alpineReady = typeof Alpine !== 'undefined' && Alpine.version;
  const dataReady = !!window.CMS_DATA && !!window.CMS_DATA.categories;
  return {
    alpineVersion: Alpine.version,
    alpineReady,
    dataReady,
    categoryCount: window.CMS_DATA?.categories?.length,
    checkTimeMs: Math.round(performance.now() - start)
  };
}
```

---

## Phase 11: Network & Resource Checks

### 11.1 Failed Requests

```
1. Use list_network_requests to get all requests
2. Filter for any non-200 status codes
3. Verify no 404s for CSS, JS, or font files
4. Google Fonts should load successfully
```

### 11.2 External Dependencies

Verify only expected external requests:

| Resource | Expected Domain |
|----------|----------------|
| Alpine.js | cdn.jsdelivr.net |
| Fonts | fonts.googleapis.com, fonts.gstatic.com |

No other external requests should be made (no analytics, no tracking, no third-party scripts).

---

## Phase 12: Edge Cases & Regression

### 12.1 Empty QFD State

```
1. Navigate to http://localhost:4321/#qfd=
2. Take snapshot — verify page loads without errors
3. Check console for errors — should be zero or just a warning
```

### 12.2 Invalid QFD Hash

```
1. Navigate to http://localhost:4321/#qfd=INVALID_BASE64
2. Take snapshot — verify page loads gracefully
3. Check console — should see "Failed to load QFD state" warning (not an error)
4. Verify QFD wizard is in default state (nothing selected)
```

### 12.3 QFD Hash with Out-of-Range Category Index

```javascript
// Craft a hash with category index 999 (out of range)
() => {
  const state = { e: [0, 1, 999], i: { 999: 9 } };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  return '#qfd=' + encoded;
}
```

Navigate to that URL and verify only valid categories (0, 1) are enabled.

### 12.4 Browser Back Button

```
1. Start with clean page (no hash)
2. Enable some QFD categories (URL hash updates)
3. Navigate back (navigate_page type: "back")
4. Verify the page doesn't break (may reset to no QFD state)
```

### 12.5 Double-Click / Rapid Interaction

```
1. Rapidly click a QFD category card on/off 5-10 times
2. Verify final state is consistent (either enabled or disabled, not stuck)
3. Take snapshot — verify UI matches state
```

---

## Test Scope Selection Guide

Use this to decide which phases to run based on the scenario:

| Scenario | Phases to Run |
|----------|---------------|
| **Smoke test** (quick health check) | 1, 2.1, 4.1, 5.1-5.2, 6.1 |
| **After CSS changes** | 1, 2, 7, 9.3 |
| **After app.js changes** | 1, 3, 4, 5, 6, 8 |
| **After data file changes** | 1, 4.3, 5.5, 6.2, 8 |
| **After adding a new CMS** | 1, 4.3, 5.2-5.7, 6, 8 |
| **After QFD wizard changes** | 5 (all), 12 |
| **Full regression** | All phases (1-12) |
| **Performance audit** | 10, 11 |
| **Accessibility audit** | 9, 7.1 |

---

## Reporting Results

After running tests, summarize results in this format:

```
## Test Results — [Date] — [Scope]

### Pass / Fail Summary
- Phase 1 (Page Load): PASS / FAIL
- Phase 2 (Dark Mode): PASS / FAIL
- ...

### Issues Found
1. [Section] — [Description] — [Severity: Critical/Major/Minor]
2. ...

### Console Errors
- [List any JS errors found]

### Recommendations
- [Any suggested fixes or improvements]
```

---

## Common Pitfalls

1. **Alpine.js timing** — Alpine initializes asynchronously. Always wait for content to render before taking snapshots. Use `wait_for` with expected text before asserting.
2. **Snapshot vs Screenshot** — Prefer `take_snapshot` for structural/content verification. Use `take_screenshot` only for visual/layout checks (dark mode, responsiveness).
3. **QFD state in URL** — After any QFD interaction, the URL hash updates. Comparing state requires decoding the hash, not just checking the URL string.
4. **Slider manipulation** — HTML range inputs are tricky via automation. Prefer `evaluate_script` with `dispatchEvent(new Event('input'))` over trying to click/drag sliders.
5. **Dev server vs production build** — `npm run dev` has hot reload and may behave slightly differently from `npm run build && npm run preview`. For regression tests, prefer testing the production build.
6. **First 3 categories expanded** — The comparison section opens categories 0, 1, 2 by default (`openSet: new Set([0, 1, 2])`). Don't assume all categories start collapsed.

/**
 * CMS Comparison 2026 — app.js (Alpine.js)
 * Components: theme, categoryBrowser, qfdWizard, executiveSummaries, navScroller
 */

// ==========================
// CONSTANTS
// ==========================
const CMS_NAMES = {
  cr: 'Craft CMS',
  di: 'Directus 11',
  d:  'Drupal 11',
  gh: 'Ghost',
  jo: 'Joomla',
  k:  'KeystoneJS 6',
  oc: 'October CMS',
  p:  'Payload CMS',
  s:  'Strapi v5',
  su: 'Sulu CMS',
  t3: 'TYPO3',
  wa: 'Wagtail',
  wp: 'WordPress'
};
const CMS_KEYS = ['cr', 'di', 'd', 'gh', 'jo', 'k', 'oc', 'p', 's', 'su', 't3', 'wa', 'wp'];

const TOOLTIP_KEYS = {
  cr: 'crt', di: 'dit', d: 'dt', gh: 'ght', jo: 'jot',
  k: 'kt', oc: 'oct', p: 'pt', s: 'st', su: 'sut', t3: 't3t', wa: 'wat', wp: 'wpt'
};

const CMS_SHORT = {
  cr: 'Craft', di: 'Directus', d: 'Drupal', gh: 'Ghost', jo: 'Joomla',
  k: 'Keystone', oc: 'October', p: 'Payload', s: 'Strapi', su: 'Sulu', t3: 'TYPO3', wa: 'Wagtail', wp: 'WP'
};

const ALT_REASONS = {
  cr: 'you value content modeling & developer UX',
  di: 'you want database-first approach',
  d:  'you need enterprise features',
  gh: 'you focus on publishing/newsletters',
  jo: 'you need granular ACL',
  k:  'you want a minimalist system',
  oc: 'you want Laravel-based CMS',
  p:  'you work with Next.js',
  s:  'you value quick start',
  su: 'you need Symfony-based multilingual',
  t3: 'you need enterprise multilingual',
  wa: 'you want Django-based CMS with workflows',
  wp: 'you want the largest ecosystem'
};

// ==========================
// ALPINE STORE: THEME
// ==========================
document.addEventListener('alpine:init', () => {

  Alpine.store('theme', {
    mode: localStorage.getItem('cms-theme') || 'light',

    toggle() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cms-theme', this.mode);
    }
  });

  // ==========================
  // ALPINE DATA: CATEGORY BROWSER
  // ==========================
  Alpine.data('categoryBrowser', () => ({
    categories: window.CMS_DATA.categories,
    openSet: new Set([0, 1, 2]),
    cmsKeys: CMS_KEYS,
    cmsShort: CMS_SHORT,
    tooltipKeys: TOOLTIP_KEYS,

    isOpen(i) { return this.openSet.has(i); },

    toggle(i) {
      if (this.openSet.has(i)) {
        this.openSet.delete(i);
      } else {
        this.openSet.add(i);
      }
      // Force reactivity
      this.openSet = new Set(this.openSet);
    },

    statusClass(val) {
      switch (val) {
        case 'full':    return 'status-full';
        case 'partial': return 'status-partial';
        case 'none':    return 'status-none';
        case 'plugin':  return 'status-plugin';
        default:        return 'status-none';
      }
    },

    statusIcon(val) {
      switch (val) {
        case 'full':    return '\u2713';
        case 'partial': return '\u25D0';
        case 'none':    return '\u2717';
        case 'plugin':  return '\u2295';
        default:        return '?';
      }
    },

    getTooltip(feature, cmsKey) {
      return feature[this.tooltipKeys[cmsKey]] || '';
    },

    renderCell(f, key) {
      const val = f[key];
      const cls = this.statusClass(val);
      const icon = this.statusIcon(val);
      const tip = this.getTooltip(f, key);
      const titleAttr = tip ? ` title="${tip.replace(/"/g, '&quot;')}"` : '';
      return `<td><span class="status ${cls}"${titleAttr}>${icon}</span></td>`;
    },

    renderTable(cat) {
      let html = `<table class="comp-table"><thead><tr><th>Feature</th>`;
      CMS_KEYS.forEach(k => { html += `<th>${CMS_SHORT[k]}</th>`; });
      html += `</tr></thead><tbody>`;
      cat.features.forEach(f => {
        html += `<tr><td>${f.name}</td>`;
        CMS_KEYS.forEach(k => { html += this.renderCell(f, k); });
        html += `</tr>`;
      });
      html += `</tbody></table>`;
      return html;
    }
  }));

  // ==========================
  // ALPINE DATA: QFD WIZARD
  // ==========================
  // Score functions loaded from qfd-scoring.js (featureScore, categoryScores, cellScore, totalScores, sortedResults)

  Alpine.data('qfdWizard', () => ({
    categories: [],           // from categories.json (same data as Comparison section)
    enabled: {},              // { catIdx: true/false }
    expanded: {},             // { catIdx: true/false } — drill-down UI
    disabledFeatures: {},     // { "catIdx:featIdx": true } — excluded features
    importance: {},           // { catIdx: 1-9 }
    customRequirements: [],
    showAddCustom: false,
    newCustomTitle: '',
    newCustomDesc: '',
    newCustomScores: {},
    notes: '',
    copied: false,
    cmsKeys: CMS_KEYS,
    cmsNames: CMS_NAMES,
    cmsShort: CMS_SHORT,

    // --- Performance: pre-computed caches ---
    _scoreCache: {},          // { catIdx: { cmsKey: avgScore } } — all features
    _enabledCounts: {},       // { catIdx: enabledCount }
    _reqs: [],                // cached activeRequirements
    _cmsScores: {},           // cached total scores per CMS
    _sorted: [],              // cached sorted results
    _urlTimer: null,          // debounce timer for updateURL

    init() {
      this.categories = window.CMS_DATA.categories || [];

      // Initialize enabled/expanded/importance for each category
      this.categories.forEach((cat, idx) => {
        this.enabled[idx] = false;
        this.expanded[idx] = false;
        this.importance[idx] = 5;
        this._enabledCounts[idx] = cat.features.length;
      });

      // Pre-compute category scores for all features (once at startup)
      this._precomputeAllScores();

      // Init custom score template
      CMS_KEYS.forEach(k => { this.newCustomScores[k] = 5; });

      // Load state from URL
      this.loadFromURL();

      // Build initial cached results
      this._rebuildResults();
    },

    // Pre-compute scores for every category with ALL features enabled
    _precomputeAllScores() {
      this.categories.forEach((cat, idx) => {
        const result = categoryScores(cat.features, {}, idx, CMS_KEYS);
        this._scoreCache[idx] = result.scores;
        this._enabledCounts[idx] = result.enabledCount;
      });
    },

    // Recompute score cache for one category (when features are toggled)
    _recomputeCategoryScore(catIdx) {
      const cat = this.categories[catIdx];
      if (!cat) return;
      const result = categoryScores(cat.features, this.disabledFeatures, catIdx, CMS_KEYS);
      this._scoreCache[catIdx] = result.scores;
      this._enabledCounts[catIdx] = result.enabledCount;
    },

    // Rebuild the cached results (activeRequirements, cmsScores, sorted)
    _rebuildResults() {
      // Build active requirements from enabled categories
      const fromCategories = [];
      for (let idx = 0; idx < this.categories.length; idx++) {
        if (!this.enabled[idx]) continue;
        const cat = this.categories[idx];
        const scores = this._scoreCache[idx];
        fromCategories.push({
          id: 'cat_' + idx,
          title: cat.icon + ' ' + cat.name,
          desc: this._enabledCounts[idx] + '/' + cat.features.length + ' features',
          importance: this.importance[idx] || 5,
          scores,
          isCustom: false
        });
      }
      const custom = this.customRequirements.map(r => ({
        id: r.id, title: r.title, desc: r.desc,
        importance: r.importance || 5, scores: r.scores, isCustom: true
      }));
      this._reqs = [...fromCategories, ...custom];

      // Compute CMS totals
      this._cmsScores = totalScores(this._reqs, CMS_KEYS);

      // Sorted results
      this._sorted = sortedResults(this._cmsScores, CMS_KEYS);
    },

    // --- Category & feature toggles ---

    toggleCategory(idx) {
      this.enabled[idx] = !this.enabled[idx];
      if (!this.enabled[idx]) this.expanded[idx] = false;
      // Rebuild results and defer URL update
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    toggleExpand(idx) {
      this.expanded[idx] = !this.expanded[idx];
    },

    isFeatureDisabled(catIdx, featIdx) {
      return !!this.disabledFeatures[catIdx + ':' + featIdx];
    },

    toggleFeature(catIdx, featIdx) {
      const key = catIdx + ':' + featIdx;
      if (this.disabledFeatures[key]) {
        delete this.disabledFeatures[key];
      } else {
        this.disabledFeatures[key] = true;
      }
      this.disabledFeatures = { ...this.disabledFeatures };
      // Recompute only the affected category, then rebuild results
      this._recomputeCategoryScore(catIdx);
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    enabledFeatureCount(catIdx) {
      return this._enabledCounts[catIdx] != null ? this._enabledCounts[catIdx] : this.categories[catIdx]?.features.length || 0;
    },

    totalFeatureCount(catIdx) {
      const cat = this.categories[catIdx];
      return cat ? cat.features.length : 0;
    },

    setImportance(idx, val) {
      this.importance[idx] = parseInt(val);
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    // --- Custom requirements ---

    addCustomRequirement() {
      if (!this.newCustomTitle.trim()) return;
      const id = 'custom_' + Date.now();
      this.customRequirements.push({
        id,
        title: this.newCustomTitle.trim(),
        desc: this.newCustomDesc.trim(),
        importance: 5,
        scores: { ...this.newCustomScores }
      });
      this.newCustomTitle = '';
      this.newCustomDesc = '';
      CMS_KEYS.forEach(k => { this.newCustomScores[k] = 5; });
      this.showAddCustom = false;
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    removeCustomRequirement(id) {
      this.customRequirements = this.customRequirements.filter(r => r.id !== id);
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    setCustomImportance(id, val) {
      const req = this.customRequirements.find(r => r.id === id);
      if (req) req.importance = parseInt(val);
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    setCustomScore(id, cmsKey, val) {
      const req = this.customRequirements.find(r => r.id === id);
      if (req) req.scores[cmsKey] = parseInt(val);
      this._rebuildResults();
      this._debouncedUpdateURL();
    },

    // --- QFD core: read from cached results ---

    get activeRequirements() { return this._reqs; },
    get hasActiveRequirements() { return this._reqs.length > 0; },
    get cmsScores() { return this._cmsScores; },

    get maxScore() {
      const vals = Object.values(this._cmsScores);
      return Math.max(...vals, 1);
    },

    get sortedResults() { return this._sorted; },
    get winner() { return this._sorted.length > 0 ? this._sorted[0] : null; },
    get alternative() { return this._sorted.length > 1 ? this._sorted[1] : null; },

    cellScore(req, cmsKey) {
      return cellScore(req.importance, req.scores[cmsKey]);
    },

    barWidth(score) {
      if (this.maxScore === 0) return '0%';
      return Math.round((score / this.maxScore) * 100) + '%';
    },

    cellHeatClass(req, cmsKey) {
      const score = req.scores[cmsKey] || 0;
      if (score >= 8) return 'qfd-heat-high';
      if (score >= 5) return 'qfd-heat-mid';
      if (score >= 1) return 'qfd-heat-low';
      return 'qfd-heat-zero';
    },

    importanceColor(val) {
      if (val >= 8) return 'var(--green)';
      if (val >= 5) return 'var(--accent)';
      if (val >= 3) return 'var(--yellow)';
      return 'var(--text-dim)';
    },

    // --- Share link (debounced) ---

    _debouncedUpdateURL() {
      clearTimeout(this._urlTimer);
      this._urlTimer = setTimeout(() => this.updateURL(), 250);
    },

    updateURL() {
      const state = this.serializeState();
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      history.replaceState(null, '', '#qfd=' + encoded);
    },

    serializeState() {
      const enabledIdxs = this.categories
        .map((c, i) => i)
        .filter(i => this.enabled[i]);

      const importanceMap = {};
      enabledIdxs.forEach(i => {
        if (this.importance[i] !== 5) {
          importanceMap[i] = this.importance[i];
        }
      });

      const df = Object.keys(this.disabledFeatures).filter(k => this.disabledFeatures[k]);

      const custom = this.customRequirements.map(r => ({
        t: r.title, d: r.desc, i: r.importance, s: r.scores
      }));

      const state = {};
      if (enabledIdxs.length) state.e = enabledIdxs;
      if (Object.keys(importanceMap).length) state.i = importanceMap;
      if (df.length) state.df = df;
      if (custom.length) state.c = custom;
      if (this.notes.trim()) state.n = this.notes;

      return state;
    },

    loadFromURL() {
      const hash = window.location.hash;
      if (!hash.startsWith('#qfd=')) return;

      try {
        const encoded = hash.substring(5);
        const json = decodeURIComponent(escape(atob(encoded)));
        const state = JSON.parse(json);

        if (state.e && Array.isArray(state.e)) {
          state.e.forEach(idx => {
            if (typeof idx === 'number' && idx >= 0 && idx < this.categories.length) {
              this.enabled[idx] = true;
            }
          });
        }

        if (state.i) {
          Object.entries(state.i).forEach(([idx, val]) => {
            const i = parseInt(idx);
            if (i >= 0 && i < this.categories.length) {
              this.importance[i] = val;
            }
          });
        }

        if (state.df && Array.isArray(state.df)) {
          state.df.forEach(key => {
            this.disabledFeatures[key] = true;
          });
          // Recompute scores for categories with disabled features
          const affectedCats = new Set(state.df.map(k => parseInt(k.split(':')[0])));
          affectedCats.forEach(catIdx => this._recomputeCategoryScore(catIdx));
        }

        if (state.c && Array.isArray(state.c)) {
          this.customRequirements = state.c.map((r, idx) => ({
            id: 'custom_' + (Date.now() + idx),
            title: r.t || '', desc: r.d || '',
            importance: r.i || 5, scores: r.s || {}
          }));
        }

        if (state.n) {
          this.notes = state.n;
        }
      } catch (e) {
        console.warn('Failed to load QFD state from URL:', e);
      }
    },

    async copyShareLink() {
      this.updateURL();
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      } catch (e) {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      }
    },

    renderQfdTable() {
      const reqs = this._reqs;
      const scores = this._cmsScores;
      const w = this.winner;
      let html = `<table class="qfd-matrix"><thead><tr><th class="qfd-th-req">Category</th><th class="qfd-th-imp">Wt</th>`;
      CMS_KEYS.forEach(k => { html += `<th class="qfd-th-cms">${CMS_SHORT[k]}</th>`; });
      html += `</tr></thead><tbody>`;
      reqs.forEach(req => {
        html += `<tr><td class="qfd-td-req">${req.title}</td>`;
        html += `<td class="qfd-td-imp"><span class="importance-badge" style="color:${this.importanceColor(req.importance)}">${req.importance}</span></td>`;
        CMS_KEYS.forEach(k => {
          const heat = this.cellHeatClass(req, k);
          const cs = this.cellScore(req, k);
          const raw = req.scores[k] || 0;
          html += `<td class="qfd-td-cell ${heat}"><div class="qfd-cell-score">${cs}</div><div class="qfd-cell-raw">${raw}</div></td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody><tfoot><tr class="qfd-total-row"><td class="qfd-td-req"><strong>TOTAL</strong></td><td class="qfd-td-imp"></td>`;
      CMS_KEYS.forEach(k => {
        const isWinner = w && w.key === k;
        html += `<td class="qfd-td-total${isWinner ? ' qfd-winner-cell' : ''}">${scores[k]}</td>`;
      });
      html += `</tr></tfoot></table>`;
      return html;
    },

    altReason(key) {
      return ALT_REASONS[key] || 'your needs shift';
    }
  }));

  // ==========================
  // ALPINE DATA: EXECUTIVE SUMMARIES
  // ==========================
  Alpine.data('executiveSummaries', () => ({
    executives: window.CMS_DATA.executives
  }));

  // ==========================
  // ALPINE DATA: NAV SCROLLER
  // ==========================
  Alpine.data('navScroller', () => ({
    currentSection: '',

    init() {
      this.onScroll();
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) current = section.getAttribute('id');
      });
      this.currentSection = current;
    },

    isActive(href) {
      return href === '#' + this.currentSection;
    }
  }));

});

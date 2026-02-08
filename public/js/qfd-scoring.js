/**
 * QFD Scoring — pure calculation functions
 * Used by app.js (browser, via <script>) and tests (Node.js, via require/import).
 */

const SCORE_MAP = { full: 10, plugin: 7, partial: 5, none: 0 };

/**
 * Convert a feature support level to a numeric score.
 * @param {string} val - "full" | "plugin" | "partial" | "none"
 * @returns {number} 0-10
 */
function featureScore(val) {
  return SCORE_MAP[val] || 0;
}

/**
 * Compute average score per CMS for a category, excluding disabled features.
 * @param {Array} features - array of feature objects from categories.json
 * @param {Object} disabledFeatures - { "catIdx:featIdx": true }
 * @param {number} catIdx - index of the category (used for disabled key lookup)
 * @param {string[]} cmsKeys - array of CMS keys, e.g. ['cr','di','d',...]
 * @returns {{ scores: Object, enabledCount: number }} scores per CMS key + count of enabled features
 */
function categoryScores(features, disabledFeatures, catIdx, cmsKeys) {
  const enabled = features.filter((f, fi) => !disabledFeatures[catIdx + ':' + fi]);
  const scores = {};
  cmsKeys.forEach(k => {
    if (enabled.length === 0) {
      scores[k] = 0;
    } else {
      const sum = enabled.reduce((s, f) => s + featureScore(f[k]), 0);
      scores[k] = Math.round((sum / enabled.length) * 10) / 10;
    }
  });
  return { scores, enabledCount: enabled.length };
}

/**
 * Compute a single cell score in the QFD matrix.
 * @param {number} importance - weight 1-9
 * @param {number} rawScore - average category score for a CMS (0-10)
 * @returns {number} rounded to 1 decimal
 */
function cellScore(importance, rawScore) {
  return Math.round(importance * (rawScore || 0) * 10) / 10;
}

/**
 * Compute total weighted scores per CMS across all active requirements.
 * @param {Array} requirements - [{ importance, scores: { cmsKey: number } }]
 * @param {string[]} cmsKeys
 * @returns {Object} { cmsKey: totalScore }
 */
function totalScores(requirements, cmsKeys) {
  const totals = {};
  cmsKeys.forEach(k => {
    let sum = 0;
    for (const r of requirements) {
      sum += Math.round(r.importance * (r.scores[k] || 0) * 10) / 10;
    }
    totals[k] = Math.round(sum * 10) / 10;
  });
  return totals;
}

/**
 * Sort CMS keys by their total score (descending).
 * @param {Object} totals - { cmsKey: totalScore }
 * @param {string[]} cmsKeys
 * @returns {Array} [{ key, score }] sorted descending
 */
function sortedResults(totals, cmsKeys) {
  return cmsKeys
    .map(k => ({ key: k, score: totals[k] }))
    .sort((a, b) => b.score - a.score);
}

// Export for Node.js tests (globalThis works in both browser and Node.js)
if (typeof globalThis !== 'undefined') {
  globalThis.QFDScoring = { SCORE_MAP, featureScore, categoryScores, cellScore, totalScores, sortedResults };
}

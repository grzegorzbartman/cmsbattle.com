/**
 * QFD Scoring — automated tests
 * Run: npm test  (or:  node --test tests/)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// qfd-scoring.js sets globalThis.QFDScoring when executed
await import('../public/js/qfd-scoring.js');
const {
  SCORE_MAP,
  featureScore,
  categoryScores,
  cellScore,
  totalScores,
  sortedResults
} = globalThis.QFDScoring;

// CMS keys (same order as app.js)
const CMS_KEYS = ['cr', 'di', 'd', 'gh', 'jo', 'k', 'oc', 'p', 's', 'su', 't3', 'wa', 'wp'];

// ============================================================
// featureScore
// ============================================================
describe('featureScore', () => {
  it('converts "full" to 10', () => {
    assert.equal(featureScore('full'), 10);
  });

  it('converts "plugin" to 7', () => {
    assert.equal(featureScore('plugin'), 7);
  });

  it('converts "partial" to 5', () => {
    assert.equal(featureScore('partial'), 5);
  });

  it('converts "none" to 0', () => {
    assert.equal(featureScore('none'), 0);
  });

  it('returns 0 for undefined', () => {
    assert.equal(featureScore(undefined), 0);
  });

  it('returns 0 for null', () => {
    assert.equal(featureScore(null), 0);
  });

  it('returns 0 for empty string', () => {
    assert.equal(featureScore(''), 0);
  });

  it('returns 0 for unknown string', () => {
    assert.equal(featureScore('unknown'), 0);
  });

  it('SCORE_MAP has exactly 4 entries', () => {
    assert.equal(Object.keys(SCORE_MAP).length, 4);
  });
});

// ============================================================
// categoryScores
// ============================================================
describe('categoryScores', () => {
  // Test fixtures
  const features = [
    { d: 'full',    wp: 'plugin',  s: 'none' },    // d:10, wp:7,  s:0
    { d: 'partial', wp: 'full',    s: 'full' },    // d:5,  wp:10, s:10
    { d: 'none',    wp: 'partial', s: 'partial' }, // d:0,  wp:5,  s:5
  ];
  const cmsKeys = ['d', 'wp', 's'];

  it('averages all features when none are disabled', () => {
    const { scores, enabledCount } = categoryScores(features, {}, 0, cmsKeys);
    assert.equal(enabledCount, 3);
    // d: (10 + 5 + 0) / 3 = 5.0
    assert.equal(scores.d, 5);
    // wp: (7 + 10 + 5) / 3 = 7.333... → 7.3
    assert.equal(scores.wp, 7.3);
    // s: (0 + 10 + 5) / 3 = 5.0
    assert.equal(scores.s, 5);
  });

  it('excludes disabled features from the average', () => {
    // Disable feature index 2 (the "none"/"partial"/"partial" one)
    const disabled = { '0:2': true };
    const { scores, enabledCount } = categoryScores(features, disabled, 0, cmsKeys);
    assert.equal(enabledCount, 2);
    // d: (10 + 5) / 2 = 7.5
    assert.equal(scores.d, 7.5);
    // wp: (7 + 10) / 2 = 8.5
    assert.equal(scores.wp, 8.5);
    // s: (0 + 10) / 2 = 5.0
    assert.equal(scores.s, 5);
  });

  it('returns 0 for all CMS when all features are disabled', () => {
    const disabled = { '0:0': true, '0:1': true, '0:2': true };
    const { scores, enabledCount } = categoryScores(features, disabled, 0, cmsKeys);
    assert.equal(enabledCount, 0);
    assert.equal(scores.d, 0);
    assert.equal(scores.wp, 0);
    assert.equal(scores.s, 0);
  });

  it('handles single feature correctly (no averaging effect)', () => {
    const single = [{ d: 'full', wp: 'plugin' }];
    const { scores, enabledCount } = categoryScores(single, {}, 0, ['d', 'wp']);
    assert.equal(enabledCount, 1);
    assert.equal(scores.d, 10);
    assert.equal(scores.wp, 7);
  });

  it('rounds to 1 decimal place', () => {
    // (7 + 10 + 5) / 3 = 7.333... → 7.3
    const { scores } = categoryScores(features, {}, 0, ['wp']);
    assert.equal(scores.wp, 7.3);
  });

  it('uses catIdx for disabled key lookup', () => {
    // Category index 3, disable feature 1
    const disabled = { '3:1': true };
    const { scores, enabledCount } = categoryScores(features, disabled, 3, cmsKeys);
    assert.equal(enabledCount, 2);
    // d: (10 + 0) / 2 = 5.0  (feature 0 and 2, skipping 1)
    assert.equal(scores.d, 5);
  });

  it('does not exclude features from a different catIdx', () => {
    // Disabling feature "1:0" should not affect category 0
    const disabled = { '1:0': true };
    const { scores, enabledCount } = categoryScores(features, disabled, 0, cmsKeys);
    assert.equal(enabledCount, 3); // all enabled
  });

  it('handles empty features array', () => {
    const { scores, enabledCount } = categoryScores([], {}, 0, cmsKeys);
    assert.equal(enabledCount, 0);
    assert.equal(scores.d, 0);
    assert.equal(scores.wp, 0);
  });

  it('handles missing CMS key in feature (undefined → 0)', () => {
    const partial = [{ d: 'full' }]; // no 'wp' key
    const { scores } = categoryScores(partial, {}, 0, ['d', 'wp']);
    assert.equal(scores.d, 10);
    assert.equal(scores.wp, 0);
  });
});

// ============================================================
// cellScore
// ============================================================
describe('cellScore', () => {
  it('multiplies importance by raw score', () => {
    assert.equal(cellScore(5, 10), 50);
  });

  it('rounds to 1 decimal place', () => {
    // 5 * 7.3 = 36.5
    assert.equal(cellScore(5, 7.3), 36.5);
    // 3 * 7.3 = 21.9
    assert.equal(cellScore(3, 7.3), 21.9);
    // 7 * 3.3 = 23.1
    assert.equal(cellScore(7, 3.3), 23.1);
  });

  it('returns 0 when importance is 0', () => {
    assert.equal(cellScore(0, 10), 0);
  });

  it('returns 0 when rawScore is 0', () => {
    assert.equal(cellScore(9, 0), 0);
  });

  it('returns 0 when rawScore is undefined', () => {
    assert.equal(cellScore(5, undefined), 0);
  });

  it('returns 0 when rawScore is null', () => {
    assert.equal(cellScore(5, null), 0);
  });

  it('handles max values (9 * 10 = 90)', () => {
    assert.equal(cellScore(9, 10), 90);
  });

  it('handles min non-zero values (1 * 0.1)', () => {
    // 1 * 0.1 = 0.1
    assert.equal(cellScore(1, 0.1), 0.1);
  });
});

// ============================================================
// totalScores
// ============================================================
describe('totalScores', () => {
  const cmsKeys = ['d', 'wp', 's'];

  it('sums cell scores across multiple requirements', () => {
    const reqs = [
      { importance: 5, scores: { d: 8, wp: 6, s: 3 } },
      { importance: 3, scores: { d: 4, wp: 9, s: 7 } },
    ];
    const totals = totalScores(reqs, cmsKeys);
    // d: round(5*8*10)/10 + round(3*4*10)/10 = 40 + 12 = 52
    assert.equal(totals.d, 52);
    // wp: round(5*6*10)/10 + round(3*9*10)/10 = 30 + 27 = 57
    assert.equal(totals.wp, 57);
    // s: round(5*3*10)/10 + round(3*7*10)/10 = 15 + 21 = 36
    assert.equal(totals.s, 36);
  });

  it('returns 0 for all CMS when requirements is empty', () => {
    const totals = totalScores([], cmsKeys);
    assert.equal(totals.d, 0);
    assert.equal(totals.wp, 0);
    assert.equal(totals.s, 0);
  });

  it('treats missing CMS key in scores as 0', () => {
    const reqs = [{ importance: 5, scores: { d: 10 } }]; // no wp, no s
    const totals = totalScores(reqs, cmsKeys);
    assert.equal(totals.d, 50);
    assert.equal(totals.wp, 0);
    assert.equal(totals.s, 0);
  });

  it('handles single requirement', () => {
    const reqs = [{ importance: 7, scores: { d: 5, wp: 7.3, s: 5 } }];
    const totals = totalScores(reqs, cmsKeys);
    // d: round(7*5*10)/10 = 35
    assert.equal(totals.d, 35);
    // wp: round(7*7.3*10)/10 = round(511)/10 = 51.1
    assert.equal(totals.wp, 51.1);
    // s: round(7*5*10)/10 = 35
    assert.equal(totals.s, 35);
  });

  it('rounds intermediate and final sums to 1 decimal', () => {
    // Construct a scenario that could cause floating-point drift
    const reqs = [
      { importance: 3, scores: { d: 7.3 } }, // 3*7.3 = 21.9
      { importance: 7, scores: { d: 3.3 } }, // 7*3.3 = 23.1
    ];
    const totals = totalScores(reqs, ['d']);
    // 21.9 + 23.1 = 45.0
    assert.equal(totals.d, 45);
  });
});

// ============================================================
// sortedResults
// ============================================================
describe('sortedResults', () => {
  it('sorts CMS by score descending', () => {
    const totals = { d: 52, wp: 57, s: 36 };
    const sorted = sortedResults(totals, ['d', 'wp', 's']);
    assert.equal(sorted.length, 3);
    assert.equal(sorted[0].key, 'wp');
    assert.equal(sorted[0].score, 57);
    assert.equal(sorted[1].key, 'd');
    assert.equal(sorted[1].score, 52);
    assert.equal(sorted[2].key, 's');
    assert.equal(sorted[2].score, 36);
  });

  it('winner is first element', () => {
    const totals = { d: 100, wp: 50, s: 75 };
    const sorted = sortedResults(totals, ['d', 'wp', 's']);
    assert.equal(sorted[0].key, 'd');
    assert.equal(sorted[0].score, 100);
  });

  it('handles equal scores (stable order)', () => {
    const totals = { d: 50, wp: 50, s: 50 };
    const sorted = sortedResults(totals, ['d', 'wp', 's']);
    // All scores equal — each key/score pair should be present
    assert.equal(sorted.length, 3);
    assert.equal(sorted[0].score, 50);
    assert.equal(sorted[1].score, 50);
    assert.equal(sorted[2].score, 50);
  });

  it('handles single CMS', () => {
    const totals = { d: 42 };
    const sorted = sortedResults(totals, ['d']);
    assert.equal(sorted.length, 1);
    assert.equal(sorted[0].key, 'd');
  });

  it('handles all zeros', () => {
    const totals = { d: 0, wp: 0 };
    const sorted = sortedResults(totals, ['d', 'wp']);
    assert.equal(sorted[0].score, 0);
    assert.equal(sorted[1].score, 0);
  });
});

// ============================================================
// Integration: end-to-end QFD calculation
// ============================================================
describe('integration: end-to-end QFD calculation', () => {

  it('full pipeline with synthetic data', () => {
    // 1 category, 3 features, 2 CMS keys
    const features = [
      { d: 'full',    wp: 'plugin' },  // d:10, wp:7
      { d: 'partial', wp: 'full' },    // d:5,  wp:10
      { d: 'none',    wp: 'partial' }, // d:0,  wp:5
    ];
    const keys = ['d', 'wp'];

    // Step 1: category scores
    const cat = categoryScores(features, {}, 0, keys);
    assert.equal(cat.scores.d, 5);    // (10+5+0)/3 = 5.0
    assert.equal(cat.scores.wp, 7.3); // (7+10+5)/3 = 7.333... → 7.3

    // Step 2: build requirement with importance 7
    const reqs = [{ importance: 7, scores: cat.scores }];

    // Step 3: total scores
    const totals = totalScores(reqs, keys);
    assert.equal(totals.d, 35);   // round(7 * 5 * 10) / 10 = 35.0
    assert.equal(totals.wp, 51.1); // round(7 * 7.3 * 10) / 10 = 51.1

    // Step 4: sorted — wp wins
    const sorted = sortedResults(totals, keys);
    assert.equal(sorted[0].key, 'wp');
    assert.equal(sorted[0].score, 51.1);
    assert.equal(sorted[1].key, 'd');
    assert.equal(sorted[1].score, 35);
  });

  it('disabled features change the winner', () => {
    const features = [
      { d: 'full',    wp: 'none' },    // d:10, wp:0
      { d: 'none',    wp: 'full' },    // d:0,  wp:10
      { d: 'partial', wp: 'partial' }, // d:5,  wp:5
    ];
    const keys = ['d', 'wp'];

    // All features: d=(10+0+5)/3=5, wp=(0+10+5)/3=5 → tie
    const allEnabled = categoryScores(features, {}, 0, keys);
    assert.equal(allEnabled.scores.d, 5);
    assert.equal(allEnabled.scores.wp, 5);

    // Disable feature 0 (the one where d=full, wp=none):
    // d=(0+5)/2=2.5, wp=(10+5)/2=7.5 → wp wins
    const feat0Disabled = categoryScores(features, { '0:0': true }, 0, keys);
    assert.equal(feat0Disabled.scores.d, 2.5);
    assert.equal(feat0Disabled.scores.wp, 7.5);
    assert.equal(feat0Disabled.enabledCount, 2);

    // Disable feature 1 instead (the one where d=none, wp=full):
    // d=(10+5)/2=7.5, wp=(0+5)/2=2.5 → d wins
    const feat1Disabled = categoryScores(features, { '0:1': true }, 0, keys);
    assert.equal(feat1Disabled.scores.d, 7.5);
    assert.equal(feat1Disabled.scores.wp, 2.5);
  });

  it('multiple categories with different importance weights', () => {
    const cat0Features = [
      { d: 'full',    wp: 'none' },    // d:10, wp:0
      { d: 'full',    wp: 'none' },    // d:10, wp:0
    ];
    const cat1Features = [
      { d: 'none',    wp: 'full' },    // d:0,  wp:10
      { d: 'none',    wp: 'full' },    // d:0,  wp:10
    ];
    const keys = ['d', 'wp'];

    const cat0 = categoryScores(cat0Features, {}, 0, keys); // d:10, wp:0
    const cat1 = categoryScores(cat1Features, {}, 1, keys); // d:0,  wp:10

    // Cat0 importance=9, Cat1 importance=1
    const reqs = [
      { importance: 9, scores: cat0.scores },
      { importance: 1, scores: cat1.scores },
    ];
    const totals = totalScores(reqs, keys);
    // d: round(9*10*10)/10 + round(1*0*10)/10 = 90 + 0 = 90
    // wp: round(9*0*10)/10 + round(1*10*10)/10 = 0 + 10 = 10
    assert.equal(totals.d, 90);
    assert.equal(totals.wp, 10);

    const sorted = sortedResults(totals, keys);
    assert.equal(sorted[0].key, 'd');

    // Now reverse importance: Cat0=1, Cat1=9 → wp wins
    const reqs2 = [
      { importance: 1, scores: cat0.scores },
      { importance: 9, scores: cat1.scores },
    ];
    const totals2 = totalScores(reqs2, keys);
    assert.equal(totals2.d, 10);
    assert.equal(totals2.wp, 90);

    const sorted2 = sortedResults(totals2, keys);
    assert.equal(sorted2[0].key, 'wp');
  });

  it('custom requirement mixed with category scores', () => {
    const features = [
      { d: 'full', wp: 'full' }, // d:10, wp:10
    ];
    const keys = ['d', 'wp'];

    const cat = categoryScores(features, {}, 0, keys);

    // Category importance=5, custom requirement importance=9 favoring wp
    const reqs = [
      { importance: 5, scores: cat.scores },
      { importance: 9, scores: { d: 2, wp: 9 } }, // custom
    ];
    const totals = totalScores(reqs, keys);
    // d: round(5*10*10)/10 + round(9*2*10)/10 = 50 + 18 = 68
    // wp: round(5*10*10)/10 + round(9*9*10)/10 = 50 + 81 = 131
    assert.equal(totals.d, 68);
    assert.equal(totals.wp, 131);

    const sorted = sortedResults(totals, keys);
    assert.equal(sorted[0].key, 'wp');
  });
});

// ============================================================
// Integration: real categories.json data
// ============================================================
describe('integration: real categories.json', () => {
  let categories;

  // Load the real data file once before tests
  before(async () => {
    const raw = await readFile(new URL('../data/categories.json', import.meta.url), 'utf-8');
    categories = JSON.parse(raw);
  });

  it('categories.json loads and has categories', () => {
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0, 'should have at least 1 category');
  });

  it('first category scores match manual calculation', () => {
    const cat = categories[0]; // Content Architecture
    const { scores, enabledCount } = categoryScores(cat.features, {}, 0, CMS_KEYS);

    assert.equal(enabledCount, cat.features.length);

    // Verify each CMS score by independent calculation
    CMS_KEYS.forEach(k => {
      const sum = cat.features.reduce((s, f) => s + featureScore(f[k]), 0);
      const expected = cat.features.length > 0
        ? Math.round((sum / cat.features.length) * 10) / 10
        : 0;
      assert.equal(scores[k], expected,
        `CMS "${k}" score mismatch for "${cat.name}": got ${scores[k]}, expected ${expected}`);
    });
  });

  it('all categories produce valid scores (no NaN, no negative)', () => {
    categories.forEach((cat, idx) => {
      const { scores, enabledCount } = categoryScores(cat.features, {}, idx, CMS_KEYS);

      assert.ok(enabledCount >= 0, `negative enabledCount for category ${idx}`);
      assert.equal(enabledCount, cat.features.length,
        `enabledCount mismatch for category ${idx}`);

      CMS_KEYS.forEach(k => {
        assert.ok(!isNaN(scores[k]), `NaN score for CMS "${k}" in category "${cat.name}"`);
        assert.ok(scores[k] >= 0, `negative score for CMS "${k}" in category "${cat.name}"`);
        assert.ok(scores[k] <= 10, `score > 10 for CMS "${k}" in category "${cat.name}"`);
      });
    });
  });

  it('disabling all features in a category zeroes all scores', () => {
    const cat = categories[0];
    const disabled = {};
    cat.features.forEach((_, fi) => { disabled['0:' + fi] = true; });

    const { scores, enabledCount } = categoryScores(cat.features, disabled, 0, CMS_KEYS);
    assert.equal(enabledCount, 0);
    CMS_KEYS.forEach(k => {
      assert.equal(scores[k], 0, `CMS "${k}" should be 0 when all features disabled`);
    });
  });

  it('full pipeline with all categories at default importance (5)', () => {
    // Enable all categories with importance=5, no disabled features
    const reqs = categories.map((cat, idx) => {
      const { scores } = categoryScores(cat.features, {}, idx, CMS_KEYS);
      return { importance: 5, scores };
    });

    const totals = totalScores(reqs, CMS_KEYS);
    const sorted = sortedResults(totals, CMS_KEYS);

    // Basic sanity checks
    assert.equal(sorted.length, CMS_KEYS.length);
    assert.ok(sorted[0].score >= sorted[sorted.length - 1].score,
      'first result should have highest score');

    // All totals should be non-negative
    CMS_KEYS.forEach(k => {
      assert.ok(totals[k] >= 0, `total for "${k}" should be >= 0`);
      assert.ok(!isNaN(totals[k]), `total for "${k}" should not be NaN`);
    });

    // Verify sorted is actually sorted descending
    for (let i = 1; i < sorted.length; i++) {
      assert.ok(sorted[i - 1].score >= sorted[i].score,
        `results not sorted at index ${i}: ${sorted[i - 1].score} < ${sorted[i].score}`);
    }
  });
});

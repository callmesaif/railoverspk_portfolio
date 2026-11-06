/**
 * Passenger-rating helpers. Pure functions only (no hooks, no 'use client'),
 * so server components (metadata) and client components can both import them.
 *
 * Public ratings live in  review_ratings/{reviewId}  as running totals:
 *   n_<cat>  = how many passengers rated that category
 *   s_<cat>  = sum of their stars
 * average = s / n
 */
export const RATING_CATS = [
  { key: 'punctuality', label: '⏱ Punctuality', short: 'Punctuality', icon: '⏱' },
  { key: 'cleanliness', label: '🧹 Cleanliness', short: 'Cleanliness', icon: '🧹' },
  { key: 'comfort',     label: '💺 Comfort',     short: 'Comfort',     icon: '💺' },
  { key: 'food',        label: '🍱 Food',        short: 'Food',        icon: '🍱' },
];

/**
 * Until passengers have rated a train, show the creator's own scorecard
 * (clearly labelled "creator") so pages don't look empty.
 * Set to false to show ONLY passenger ratings.
 */
export const CREATOR_FALLBACK = true;

/** Keep only valid whole-number stars 1–5 */
export function cleanRatings(r) {
  const out = {};
  RATING_CATS.forEach(({ key }) => {
    const v = r?.[key];
    if (Number.isInteger(v) && v >= 1 && v <= 5) out[key] = v;
  });
  return out;
}

/** Aggregate doc (or null) → { cats: {key:{avg,n}}, overall, count } */
export function summarizeAgg(agg) {
  const cats = {};
  let sum = 0, k = 0, count = 0;
  RATING_CATS.forEach(({ key }) => {
    const n = agg?.['n_' + key] || 0;
    const s = agg?.['s_' + key] || 0;
    if (n > 0) {
      const avg = s / n;
      cats[key] = { avg, n };
      sum += avg; k++;
      count = Math.max(count, n);
    }
  });
  return { cats, overall: k ? sum / k : null, count };
}

/** byId === null means "still loading" */
export function summaryFor(byId, id) {
  if (byId === null || byId === undefined) return null;
  return byId[id] || summarizeAgg(null);
}

function creatorOverall(scores) {
  const vals = RATING_CATS.map(c => scores?.[c.key]).filter(v => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

const ZERO = { value: 0, n: 0, source: null };

/**
 * What to display for one review.
 * summary === null  → ratings still loading → show nothing yet (avoids a flicker).
 * returns { loading, cats: {key:{value,n,source}}, overall: {value,count,source} | null }
 *   source: 'public' | 'creator' | null
 */
export function effectiveRating(review, summary) {
  if (summary === null) {
    return { loading: true, cats: Object.fromEntries(RATING_CATS.map(c => [c.key, ZERO])), overall: null };
  }
  const pub = summary?.cats || {};
  const creator = review?.scores || {};

  const cats = {};
  RATING_CATS.forEach(({ key }) => {
    if (pub[key])                                 cats[key] = { value: pub[key].avg, n: pub[key].n, source: 'public' };
    else if (CREATOR_FALLBACK && creator[key] > 0) cats[key] = { value: creator[key], n: 0, source: 'creator' };
    else                                           cats[key] = ZERO;
  });

  let overall = null;
  if (summary?.overall != null) {
    overall = { value: summary.overall, count: summary.count, source: 'public' };
  } else if (CREATOR_FALLBACK) {
    const c = creatorOverall(creator);
    if (c != null) overall = { value: c, count: 0, source: 'creator' };
  }
  return { loading: false, cats, overall };
}
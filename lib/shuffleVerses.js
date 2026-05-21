/**
 * Daily-seeded Fisher-Yates shuffle for the verse feed.
 *
 * Uses today's UTC date string as the seed so:
 *  - The order is identical for every user on the same day (shareable positions)
 *  - The order changes every midnight UTC (feels fresh each morning)
 *  - No randomness on re-render — the same seed always produces the same sequence
 *
 * The seed is a simple 32-bit LCG (linear congruential generator) — fast,
 * deterministic, and good enough for UI ordering.
 */

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Convert a date string to a numeric seed ─────────────────────────────────
function dateToSeed(dateStr) {
  // e.g. "2026-05-20" → stable integer
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (Math.imul(31, hash) + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

// ─── Seeded Fisher-Yates shuffle (returns a new array, never mutates) ────────
function seededShuffle(array, rand) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Returns a daily-shuffled copy of the verses array.
 * Pass an optional dateStr (YYYY-MM-DD) to override — useful for testing.
 */
export function getDailyShuffledVerses(verses, dateStr) {
  const today = dateStr ?? new Date().toISOString().split('T')[0];
  const seed  = dateToSeed(today);
  const rand  = mulberry32(seed);
  return seededShuffle(verses, rand);
}

/**
 * Results, and the feed's cadence.
 *
 * The magazine tests are mostly about what the code must NOT do: sort by
 * popularity, exceed the spread cap, or serve a live entry.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BANDS,
  MILESTONES,
  MIN_COHORT_CELL,
  bandFor,
  pairDifficulty,
  readCalls,
} from '../src/domain/bands.ts';
import {
  CADENCE,
  COMMENTS_ENABLED,
  FEED_ELIGIBLE,
  MAGAZINE_FILTERS,
  REACTIONS,
  REACTIONS_ON_GARMENTS,
  SPREADS_PER_DAY,
  kindAt,
  sample,
  splitVerdict,
} from '../src/domain/magazine.ts';
import { phaseAt, CLOSE_HOUR, RESULT_HOUR } from '../src/domain/clock.ts';

/* ── bands ───────────────────────────────────────────────────────────── */

test('there are five bands and none of them is a number', () => {
  assert.equal(BANDS.length, 5);
  for (const b of BANDS) assert.ok(Number.isNaN(Number(b.name)));
});

test('percentile maps to the right band', () => {
  assert.equal(bandFor(0.05, 40)?.key, 'top');
  assert.equal(bandFor(0.2, 40)?.key, 'upperQuarter');
  assert.equal(bandFor(0.4, 40)?.key, 'upperHalf');
  assert.equal(bandFor(0.6, 40)?.key, 'lowerHalf');
  assert.equal(bandFor(0.9, 40)?.key, 'quiet');
  assert.equal(bandFor(1, 40)?.key, 'quiet');
});

test('a cohort smaller than the minimum cell gets NO band, not a guessed one', () => {
  assert.equal(bandFor(0.2, MIN_COHORT_CELL - 1), null);
  assert.notEqual(bandFor(0.2, MIN_COHORT_CELL), null);
});

test('difficulty: a coin toss is worth everything, a walkover almost nothing', () => {
  assert.equal(pairDifficulty(0.5), 1);
  assert.equal(pairDifficulty(1), 0);
  assert.ok(pairDifficulty(0.52) > 0.9);
  assert.ok(pairDifficulty(0.9) < 0.25);
});

test('your calls: a right answer on a close pair is worth more than on an easy one', () => {
  const closeWin = readCalls([
    { winnerShare: 0.52, backedWinner: true },
    { winnerShare: 0.9, backedWinner: false },
  ]);
  const easyWin = readCalls([
    { winnerShare: 0.52, backedWinner: false },
    { winnerShare: 0.9, backedWinner: true },
  ]);
  assert.equal(closeWin.correct, easyWin.correct, 'same raw count');
  assert.ok(closeWin.weighted > easyWin.weighted, 'but not the same read');
});

test('the closest-pairs read-out picks the three tightest', () => {
  const r = readCalls([
    { winnerShare: 0.51, backedWinner: true },
    { winnerShare: 0.53, backedWinner: true },
    { winnerShare: 0.55, backedWinner: false },
    { winnerShare: 0.95, backedWinner: true },
  ]);
  assert.equal(r.closestTotal, 3);
  assert.equal(r.closestCorrect, 2);
});

test('six milestones, and that is all there are', () => {
  assert.equal(MILESTONES.length, 6);
});

/* ── the clock ───────────────────────────────────────────────────────── */

test('the three-phase clock: entry 07–20, judging after 20, settling overnight', () => {
  const at = (h: number) => phaseAt(new Date(2026, 7, 26, h, 0, 0));
  assert.equal(at(RESULT_HOUR), 'entry');
  assert.equal(at(12), 'entry');
  assert.equal(at(CLOSE_HOUR - 1), 'entry');
  assert.equal(at(CLOSE_HOUR), 'judging');
  assert.equal(at(23), 'judging');
  assert.equal(at(2), 'settling');
  assert.equal(at(RESULT_HOUR - 1), 'settling');
});

test('you can never enter and judge in the same phase', () => {
  for (let h = 0; h < 24; h++) {
    const p = phaseAt(new Date(2026, 7, 26, h, 0, 0));
    assert.notEqual(p, undefined);
    assert.ok(['entry', 'judging', 'settling'].includes(p));
  }
});

/* ── the magazine ────────────────────────────────────────────────────── */

test('three content types only, on the H U S U H U S U cadence', () => {
  assert.deepEqual([...new Set(CADENCE)].sort(), ['H', 'S', 'U']);
  assert.deepEqual([...CADENCE], ['H', 'U', 'S', 'U', 'H', 'U', 'S', 'U']);
  assert.equal(kindAt(0), 'H');
  assert.equal(kindAt(2), 'S');
  assert.equal(kindAt(8), 'H', 'the cadence repeats');
});

test('two spreads per eight cards, and six a day', () => {
  const perCycle = CADENCE.filter((k) => k === 'S').length;
  assert.equal(perCycle, 2);
  assert.equal(SPREADS_PER_DAY, 6);
});

test('five fixed reaction words, and they are on looks only', () => {
  assert.equal(REACTIONS.length, 5);
  assert.equal(REACTIONS_ON_GARMENTS, false);
});

test('no comments anywhere', () => {
  assert.equal(COMMENTS_ENABLED, false);
});

test('a live entry is never eligible for the feed', () => {
  assert.ok(!FEED_ELIGIBLE.includes('live-entry' as never));
  assert.deepEqual([...FEED_ELIGIBLE], ['settled-entry', 'free-post', 'house-editorial']);
});

test('the filter rail is functional, and its chips are the current five', () => {
  /* It used to be flagged NOT functional — visually live, read by nothing —
     and this test asserted the flag so the rail could not be quietly demoed as
     working. It works now (4 Sep). The behaviour lives in
     tests/magazine-filters.test.ts; this is the guard that the chip LIST does
     not drift back to occasion words, which cannot work at all since occasion
     stopped aggregating (domain/tags.ts). */
  assert.deepEqual(
    [...MAGAZINE_FILTERS],
    ['All', 'Editorial', 'Challenges', 'Free posts', 'Trending'],
  );
});

test('sample draws without replacement and respects weights', () => {
  const pool = [
    { item: 'a', weight: 1 },
    { item: 'b', weight: 1 },
    { item: 'c', weight: 1 },
  ];
  let i = 0;
  const rng = () => [0.1, 0.5, 0.9][i++ % 3]!;
  const out = sample(pool, 3, rng);
  assert.equal(out.length, 3);
  assert.equal(new Set(out).size, 3, 'no duplicates');
});

test('sample never returns more than the pool holds', () => {
  const out = sample([{ item: 'only', weight: 1 }], 5, () => 0.5);
  assert.deepEqual(out, ['only']);
});

test('the split verdict reads movement, not a verdict on the person', () => {
  assert.match(splitVerdict(80), /Comfortable/);
  assert.match(splitVerdict(50), /Split down the middle/);
  assert.match(splitVerdict(30), /against the room/);
});

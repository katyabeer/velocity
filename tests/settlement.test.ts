/**
 * The settlement arithmetic is load-bearing and HAS BEEN WRONG BEFORE.
 *
 * Every number in these assertions comes from the handover's headroom table. If
 * one of them fails, the maths moved — not the test. Check velocity_maths.py and
 * the table in HANDOVER-v2.md §10 before changing anything here.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  COMPARISONS_PER_CALL,
  COMPARISONS_TO_SETTLE,
  DISTINCT_RATERS_TO_SETTLE,
  ENTRY_RATE_DANGER_ZONE,
  LOSS_FACTOR,
  QUOTA,
  QUOTA_IF_ENTRANTS_ONLY,
  circuitBreaker,
  distinctRaterShortfall,
  headroom,
  isSettled,
  minVoteCompletion,
  schedulingPriority,
  settles,
} from '../src/domain/settlement.ts';

const close = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('at the temporary 5-call quota, a round no longer single-handedly settles a look', () => {
  // At the designed QUOTA of 10, one round supplied exactly
  // COMPARISONS_TO_SETTLE (10 * 2 = 20) — one person's round alone was
  // enough. QUOTA is temporarily 5 for test-scale sessions, so this is now
  // intentionally less than 20, not equal to it. COMPARISONS_TO_SETTLE
  // itself is untouched — it's a room-wide threshold, not a function of any
  // one person's round size (see settlement.ts).
  assert.equal(QUOTA * COMPARISONS_PER_CALL, 10);
  assert.ok(QUOTA * COMPARISONS_PER_CALL < COMPARISONS_TO_SETTLE);
});

test('the headroom table from the handover, entry rate → headroom', () => {
  close(headroom(1, 0.1), 7.67);
  close(headroom(1, 0.2), 3.83);
  close(headroom(1, 0.35), 2.19);
  close(headroom(1, 0.5), 1.53);
  close(headroom(1, 0.8), 0.96);
  close(headroom(1, 1.0), 0.77);
});

test('the headroom table, entry rate → minimum vote-completion', () => {
  close(minVoteCompletion(0.1), 0.13);
  close(minVoteCompletion(0.2), 0.26);
  close(minVoteCompletion(0.35), 0.46);
  close(minVoteCompletion(0.5), 0.65);
  close(minVoteCompletion(0.8), 1.04);
  close(minVoteCompletion(1.0), 1.3);
});

test('rule of thumb: vote-completion must be at least 1.30x the entry rate', () => {
  close(1 / LOSS_FACTOR, 1.3, 0.005);
});

test('room size cancels out entirely — headroom depends only on the two rates', () => {
  // Same rates, notionally different rooms: identical answer.
  assert.equal(headroom(0.4, 0.2), headroom(0.4, 0.2));
  close(headroom(0.4, 0.2), (LOSS_FACTOR * 0.4) / 0.2);
});

test("A's failure mode is triggered by success — 80% entry cannot settle", () => {
  assert.equal(settles(1, ENTRY_RATE_DANGER_ZONE), false);
  assert.equal(circuitBreaker(1, 0.85), 'house-comparisons');
});

test('a healthy room needs no circuit-breaker', () => {
  assert.equal(circuitBreaker(0.6, 0.2), 'none');
});

test('15 was NOT the lowest toll that settles — 14 gives 1.07x', () => {
  // Reversed decision. Kept as a test so nobody re-derives the wrong number.
  const q = 14;
  const h = (LOSS_FACTOR * ((q * COMPARISONS_PER_CALL) / COMPARISONS_TO_SETTLE)) / 1;
  close(h, 1.07, 0.01);
  assert.equal(QUOTA_IF_ENTRANTS_ONLY, 15);
});

test('a look settles only when BOTH thresholds are met', () => {
  const raters = (n: number) => Array.from({ length: n }, (_, i) => `r${i}`);

  assert.equal(
    isSettled({ id: 'a', comparisons: 20, distinctRaters: raters(12) }),
    true,
  );
  // Enough comparisons, not enough distinct people.
  assert.equal(isSettled({ id: 'b', comparisons: 20, distinctRaters: raters(9) }), false);
  // Enough people, not enough comparisons.
  assert.equal(isSettled({ id: 'c', comparisons: 14, distinctRaters: raters(12) }), false);
});

test('the binding constraint is distinct raters, not comparisons', () => {
  const raters = (n: number) => Array.from({ length: n }, (_, i) => `r${i}`);

  // A look with more comparisons but fewer distinct raters must be scheduled
  // FIRST. A naive sort on comparison shortfall gets this backwards.
  const shortOnPeople = { id: 'people', comparisons: 19, distinctRaters: raters(4) };
  const shortOnComparisons = { id: 'comps', comparisons: 4, distinctRaters: raters(11) };

  assert.ok(distinctRaterShortfall(shortOnPeople) > distinctRaterShortfall(shortOnComparisons));
  assert.ok(schedulingPriority(shortOnPeople, shortOnComparisons) < 0);

  const queue = [shortOnComparisons, shortOnPeople].sort(schedulingPriority);
  assert.equal(queue[0]?.id, 'people');
});

test('the two settlement thresholds are 20 and 12', () => {
  assert.equal(COMPARISONS_TO_SETTLE, 20);
  assert.equal(DISTINCT_RATERS_TO_SETTLE, 12);
});

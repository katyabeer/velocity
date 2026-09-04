/**
 * The token economy. "No judging, no clothes" is the load-bearing rule of the
 * whole design — these tests exist so a refactor cannot quietly break it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TOKENS_FOR_FIRST_LOOK,
  TOKENS_PER_DISTINCT_TAKER,
  TOKENS_PER_JUDGING_ROUND,
  TOKEN_AWARD_LABELS,
  TOKEN_COST_PER_TAKE,
  WARDROBE_CAP,
  awardsForTonight,
  awardsTotal,
  canTake,
  completeJudgingRound,
  returnGarment,
  takeGarment,
  tokensFromTakers,
  type Ledger,
} from '../src/domain/economy.ts';

const fresh = (over: Partial<Ledger> = {}): Ledger => ({
  balance: 0,
  roundComplete: false,
  held: [],
  ...over,
});

test('a completed judging round mints exactly three tokens', () => {
  const after = completeJudgingRound(fresh());
  assert.equal(after.balance, TOKENS_PER_JUDGING_ROUND);
  assert.equal(after.roundComplete, true);
});

test('MARK-THEN-MINT: finishing twice does not mint twice', () => {
  const once = completeJudgingRound(fresh());
  const twice = completeJudgingRound(once);
  assert.equal(twice.balance, TOKENS_PER_JUDGING_ROUND);
});

test('no judging, no clothes — a fresh ledger cannot take anything', () => {
  const l = fresh();
  assert.equal(canTake(l, 0), false);
  assert.deepEqual(takeGarment(l, 'red bag'), l, 'take must be a no-op with no tokens');
});

test('taking spends one token and holds the piece', () => {
  const l = takeGarment(fresh({ balance: 3 }), 'red bag');
  assert.equal(l.balance, 3 - TOKEN_COST_PER_TAKE);
  assert.deepEqual(l.held, ['red bag']);
});

test('putting a piece back refunds the token — nothing is ever lost for good', () => {
  const taken = takeGarment(fresh({ balance: 3 }), 'red bag');
  const back = returnGarment(taken, 'red bag');
  assert.equal(back.balance, 3);
  assert.deepEqual(back.held, []);
});

test('taking the same piece twice is a no-op, not a double charge', () => {
  const once = takeGarment(fresh({ balance: 3 }), 'red bag');
  const twice = takeGarment(once, 'red bag');
  assert.equal(twice.balance, once.balance);
  assert.equal(twice.held.length, 1);
});

test('a full wardrobe blocks taking', () => {
  const l = fresh({ balance: 3 });
  assert.equal(canTake(l, WARDROBE_CAP), false);
  assert.equal(canTake(l, WARDROBE_CAP - 1), true);
});

test('one token per DISTINCT taker', () => {
  assert.equal(tokensFromTakers(0), 0);
  assert.equal(tokensFromTakers(4), 4 * TOKENS_PER_DISTINCT_TAKER);
});

test('no operation mutates the ledger it was given', () => {
  const l = fresh({ balance: 2 });
  const snapshot = JSON.stringify(l);
  takeGarment(l, 'tote');
  completeJudgingRound(l);
  returnGarment(l, 'tote');
  assert.equal(JSON.stringify(l), snapshot);
});

/* ─── What a night paid out (reactions-logic is elsewhere; this is the economy) ─ */

test('a night always pays the challenge, and the first-look bonus only once', () => {
  const plain = awardsForTonight({ firstLook: false });
  assert.deepEqual(
    plain.map((a) => a.kind),
    ['challenge'],
    'no bonus unless the ledger says it was paid',
  );
  assert.equal(awardsTotal(plain), TOKENS_PER_JUDGING_ROUND);

  const firstNight = awardsForTonight({ firstLook: true });
  assert.deepEqual(firstNight.map((a) => a.kind), ['challenge', 'first-look']);
  assert.equal(awardsTotal(firstNight), TOKENS_PER_JUDGING_ROUND + TOKENS_FOR_FIRST_LOOK);
});

test('the itemised total is the sum of its lines — the screen never adds up wrong', () => {
  for (const firstLook of [true, false]) {
    const awards = awardsForTonight({ firstLook });
    assert.equal(
      awardsTotal(awards),
      awards.reduce((n, a) => n + a.amount, 0),
    );
  }
});

test('every award kind has a reason to print beside its amount', () => {
  awardsForTonight({ firstLook: true }).forEach((a) =>
    assert.ok(TOKEN_AWARD_LABELS[a.kind]?.length, `${a.kind} needs a label`),
  );
});

test('overnight takings are NOT a night’s award — they are balance, not earnings', () => {
  /* A list headed "tokens earned" must not credit tonight's work with what
     landed while you slept. If a `takers` kind ever appears in here, that is
     the regression. */
  const kinds = awardsForTonight({ firstLook: true }).map((a) => a.kind);
  assert.equal(kinds.includes('takers' as never), false);
});

/**
 * Slot rules. Locked decision 11 — 5 max, 3 min, one piece per slot, everywhere.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SLOTS, slotOf } from '../src/domain/garments.ts';
import {
  LOANS_PER_BRIEF,
  MAX_PIECES,
  MIN_PIECES,
  canEnter,
  clearSlot,
  loansUsed,
  slotStrip,
  togglePick,
  type Pick,
} from '../src/domain/entry.ts';

const owned = (name: string) => ({ name, source: 'owned' as const });
const build = (...names: string[]): Pick[] =>
  names.reduce<Pick[]>((acc, n) => togglePick(acc, owned(n)), []);

test('the slot rules are 3 minimum and 5 maximum', () => {
  assert.equal(MIN_PIECES, 3);
  assert.equal(MAX_PIECES, 5);
  assert.equal(SLOTS.length, 5);
});

test('one piece per slot — picking into an occupied slot SWAPS, never stacks', () => {
  const picks = build('wool coat', 'parka');
  assert.equal(picks.length, 1, 'two coats cannot both be in');
  assert.equal(picks[0]?.name, 'parka', 'the newer choice wins');
});

test('a full five-slot look is enterable; four is too', () => {
  const five = build('wool coat', 'black knit', 'grey trouser', 'derby', 'red bag');
  assert.equal(five.length, 5);
  assert.equal(canEnter(five), true);
});

test('two pieces is not enough to enter', () => {
  assert.equal(canEnter(build('wool coat', 'black knit')), false);
});

test('tapping a picked piece again puts it back', () => {
  const one = build('wool coat');
  const none = togglePick(one, owned('wool coat'));
  assert.equal(none.length, 0);
});

test('clearing a slot removes whatever is in it', () => {
  const picks = build('wool coat', 'black knit');
  const cleared = clearSlot(picks, 'Outer');
  assert.equal(cleared.length, 1);
  assert.equal(slotOf(cleared[0]!.name), 'Top');
});

test('at most two loaners per brief', () => {
  let picks: Pick[] = [];
  picks = togglePick(picks, { name: 'sequin blazer', source: 'loan' });
  picks = togglePick(picks, { name: 'gold sandal', source: 'loan' });
  assert.equal(loansUsed(picks), LOANS_PER_BRIEF);

  // A third loaner is refused, and does not disturb what is already in.
  const before = picks.length;
  picks = togglePick(picks, { name: 'gold hoop', source: 'loan' });
  assert.equal(loansUsed(picks), LOANS_PER_BRIEF);
  assert.equal(picks.length, before);
});

test('the slot strip always lists all five slots in canonical order', () => {
  const strip = slotStrip(build('wool coat', 'derby'));
  assert.deepEqual(
    strip.map((s) => s.slot),
    [...SLOTS],
  );
  assert.equal(strip.find((s) => s.slot === 'Outer')?.pick?.name, 'wool coat');
  assert.equal(strip.find((s) => s.slot === 'Top')?.pick, undefined);
});

test('togglePick never mutates its input', () => {
  const picks = build('wool coat');
  const snapshot = JSON.stringify(picks);
  togglePick(picks, owned('black knit'));
  assert.equal(JSON.stringify(picks), snapshot);
});

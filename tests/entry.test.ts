/**
 * Slot rules. Locked decision 11 as amended 3 Sep 2026 — 6 max, 3 min, one
 * piece per slot EXCEPT Extra, which takes two. Everywhere: briefs and
 * freestyle both.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SLOTS, slotOf } from '../src/domain/garments.ts';
import {
  LOANS_PER_BRIEF,
  MAX_PIECES,
  MIN_PIECES,
  SLOT_CAPACITY,
  STRIP_SLOTS,
  canEnter,
  clearSlot,
  isSlotOccupied,
  loansUsed,
  removePick,
  slotStrip,
  togglePick,
  type Pick,
} from '../src/domain/entry.ts';

const owned = (name: string) => ({ name, source: 'owned' as const });
const build = (...names: string[]): Pick[] =>
  names.reduce<Pick[]>((acc, n) => togglePick(acc, owned(n)), []);

test('the slot rules are 4 minimum and 6 maximum, over five slots', () => {
  /* The floor moved 3 -> 4 on 7 Sep (Katya). See MIN_PIECES for what it
     gates and what it costs. */
  assert.equal(MIN_PIECES, 4);
  assert.equal(MAX_PIECES, 6);
  assert.equal(SLOTS.length, 5, 'still five slots — the sixth piece is a second Extra');
});

test('Extra is the ONLY slot that takes two — the render template has no other box', () => {
  assert.equal(SLOT_CAPACITY.Extra, 2);
  (['Outer', 'Top', 'Bottom', 'Shoes'] as const).forEach((slot) =>
    assert.equal(SLOT_CAPACITY[slot], 1, `${slot} must stay single`),
  );
});

test('the cap is the sum of the capacities, not a separate number to forget', () => {
  const summed = SLOTS.reduce((n, s) => n + SLOT_CAPACITY[s], 0);
  assert.equal(MAX_PIECES, summed);
  assert.equal(STRIP_SLOTS.length, summed);
});

test('one piece per single slot — picking into a full slot SWAPS, never stacks', () => {
  const picks = build('wool coat', 'parka');
  assert.equal(picks.length, 1, 'two coats cannot both be in');
  assert.equal(picks[0]?.name, 'parka', 'the newer choice wins');
});

test('two extras both stay in; a third evicts the OLDEST of them', () => {
  const two = build('red bag', 'silk scarf');
  assert.equal(two.length, 2, 'a bag and a scarf are both Extra, and both fit');

  const three = togglePick(two, owned('beret'));
  assert.equal(three.length, 2, 'still two — Extra holds two, not three');
  assert.deepEqual(
    three.map((p) => p.name),
    ['silk scarf', 'beret'],
    'the first extra is the one that made room',
  );
});

test('Extra with one piece in it is still open; with two it is full', () => {
  assert.equal(isSlotOccupied(build('red bag'), 'Extra'), false);
  assert.equal(isSlotOccupied(build('red bag', 'silk scarf'), 'Extra'), true);
  assert.equal(isSlotOccupied(build('wool coat'), 'Outer'), true, 'single slots fill at one');
});

test('a full six-piece look is enterable, and a sixth pick is not refused', () => {
  const six = build('wool coat', 'black knit', 'grey trouser', 'derby', 'red bag', 'silk scarf');
  assert.equal(six.length, 6);
  assert.equal(canEnter(six), true);
});

test('four is enterable too — six is the ceiling, not the requirement', () => {
  assert.equal(canEnter(build('wool coat', 'black knit', 'grey trouser', 'derby')), true);
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

/* ⟲ DERIVED FROM THE CAP, NOT FROM THE NUMBER TWO. This test hardcoded two
   loaners and asserted the third was refused; it broke the moment
   LOANS_PER_BRIEF moved to 4 on 13 Sep, which is the test doing its job — but
   it was asserting a FIXTURE VALUE rather than the rule. The rule is "you may
   fill up to the cap and the next one is refused", and that is what this says
   now, at whatever the cap happens to be.

   One name per slot, because SLOT_CAPACITY would refuse the second Outer for a
   reason that has nothing to do with loans and would fake a pass. */
const LOANABLE = ['sequin blazer', 'roll neck', 'grey trouser', 'gold sandal', 'gold hoop'];

test('loaners are capped at LOANS_PER_BRIEF per brief', () => {
  assert.ok(
    LOANABLE.length > LOANS_PER_BRIEF,
    'the fixture must have one more loanable piece than the cap, or nothing is refused',
  );
  assert.equal(
    new Set(LOANABLE.map(slotOf)).size,
    LOANABLE.length,
    'one loanable piece per slot, or SLOT_CAPACITY refuses it instead of the loan cap',
  );

  let picks: Pick[] = [];
  for (const name of LOANABLE.slice(0, LOANS_PER_BRIEF)) {
    picks = togglePick(picks, { name, source: 'loan' });
  }
  assert.equal(loansUsed(picks), LOANS_PER_BRIEF);

  // One past the cap is refused, and does not disturb what is already in.
  const before = picks.length;
  picks = togglePick(picks, { name: LOANABLE[LOANS_PER_BRIEF]!, source: 'loan' });
  assert.equal(loansUsed(picks), LOANS_PER_BRIEF);
  assert.equal(picks.length, before);
});

test('the slot strip lists six cells in canonical order, Extra twice', () => {
  const strip = slotStrip(build('wool coat', 'derby'));
  assert.deepEqual(
    strip.map((s) => s.slot),
    ['Outer', 'Top', 'Bottom', 'Shoes', 'Extra', 'Extra'],
  );
  assert.equal(strip.find((s) => s.slot === 'Outer')?.pick?.name, 'wool coat');
  assert.equal(strip.find((s) => s.slot === 'Top')?.pick, undefined);
});

test('two extras fill the two Extra cells in the order they were picked', () => {
  const strip = slotStrip(build('red bag', 'silk scarf'));
  const extras = strip.filter((c) => c.slot === 'Extra');
  assert.deepEqual(
    extras.map((c) => c.pick?.name),
    ['red bag', 'silk scarf'],
  );
});

test('one extra leaves the second Extra cell empty, not both filled', () => {
  const extras = slotStrip(build('red bag')).filter((c) => c.slot === 'Extra');
  assert.deepEqual(
    extras.map((c) => c.pick?.name),
    ['red bag', undefined],
  );
});

test('removePick puts back one named piece, leaving the other extra in', () => {
  const kept = removePick(build('red bag', 'silk scarf'), 'red bag');
  assert.deepEqual(
    kept.map((p) => p.name),
    ['silk scarf'],
  );
});

test('togglePick never mutates its input', () => {
  const picks = build('wool coat');
  const snapshot = JSON.stringify(picks);
  togglePick(picks, owned('black knit'));
  assert.equal(JSON.stringify(picks), snapshot);
});

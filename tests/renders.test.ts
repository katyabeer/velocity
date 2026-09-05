/**
 * RENDER ALLOWANCES, THE RE-RENDER WINDOW, AND THE CREATE TAB. Create brief
 * §2.3, §4, §6, and acceptance criteria 1–13 and 19–22.
 *
 * Rendering is the only thing in this product that costs real money per use,
 * and the re-render REVERSES D-brief invariant 5 ("the render is faithful. The
 * moment it can surprise you, this stops measuring taste and becomes a slot
 * machine"). The reversal is only safe with all three of Katya's constraints
 * in place, so each one is asserted separately below — if any single test in
 * the "three constraints" block goes red, the reversal is no longer safe and
 * the feature should come out, not the test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CREATE_HAS_NO_BRIEF,
  CREATE_RIBBON,
  FREESTYLE_REACTABLE_AT_PUBLISH,
  NEXT_RENDER_LINE,
  ONE_A_DAY_AT_COMMIT,
  PER_DAY,
  RERENDERS_PER_DAY,
  RERENDER_BLOCK_LINES,
  RERENDER_INPUT_FROZEN,
  RERENDER_REPLACES_IN_PLACE,
  RERENDER_WINDOW_MS,
  consume,
  consumeRerender,
  createTabState,
  dayKey,
  freshAllowance,
  hoursToReset,
  nextReset,
  refund,
  rendersLeft,
  rerendersLeft,
  rerenderVerdict,
} from '../src/domain/renders.ts';
import { MIN_PIECES } from '../src/domain/entry.ts';
import { REVEAL_NEXT_BRIEF, YESTERDAYS_BRIEF, nextChallenge } from '../src/data/challenges.ts';
import { RESULT_HOUR } from '../src/domain/clock.ts';

const DAY = '2026-9-4';

/* ══════════════ AC 7 · two allowances, independent ══════════════ */

test('AC 7 · spending the brief allowance leaves the freestyle one, and back', () => {
  /* The brief is explicit: DO NOT implement one shared counter. Entering the
     day's job and posting a freestyle look are different acts, and a single
     counter means one silently eats the other. */
  let brief = freshAllowance(DAY);
  const freestyle = freshAllowance(DAY);

  brief = consume(brief, DAY);
  assert.equal(rendersLeft(brief, 'brief', DAY), 0);
  assert.equal(rendersLeft(freestyle, 'freestyle', DAY), 1, 'freestyle is untouched');
});

test('one each, and only freestyle can be re-rendered', () => {
  assert.equal(PER_DAY.brief, 1);
  assert.equal(PER_DAY.freestyle, 1);
  /* A brief entry cannot be re-rendered: invariant 4 is "once you enter,
     nothing can be changed", and a re-render of an entry sitting in a live
     comparison pool is a reroll against the field. */
  assert.equal(RERENDERS_PER_DAY.brief, 0);
  assert.equal(RERENDERS_PER_DAY.freestyle, 1);
});

test('AC 13 · the re-render is available exactly once', () => {
  let a = freshAllowance(DAY);
  a = consumeRerender(a, DAY);
  assert.equal(rerendersLeft(a, 'freestyle', DAY), 0);
  a = consumeRerender(a, DAY);
  assert.equal(rerendersLeft(a, 'freestyle', DAY), 0, 'and never goes negative into a third');
});

/* ══════════════ AC 8 · the day boundary is 07:00, not midnight ══════════════ */

test('AC 8 · 06:59 still belongs to yesterday’s allowance day', () => {
  /* 07:00 is already the day boundary everywhere else in the product — it is
     when yesterday's result lands and the job opens. Two different day
     boundaries in one app is a bug generator. */
  const beforeSeven = new Date(2026, 8, 5, 6, 59);
  const afterSeven = new Date(2026, 8, 5, 7, 1);
  const nightBefore = new Date(2026, 8, 4, 23, 30);

  assert.equal(dayKey(beforeSeven), dayKey(nightBefore), '06:59 is still the 4th');
  assert.notEqual(dayKey(afterSeven), dayKey(nightBefore), '07:01 is the 5th');
});

test('the boundary is the clock’s own RESULT_HOUR, not a second copy of 7', () => {
  const at = nextReset(new Date(2026, 8, 4, 12, 0));
  assert.equal(at.getHours(), RESULT_HOUR);
  assert.equal(at.getMinutes(), 0);
});

test('the next reset is always strictly in the future', () => {
  for (const h of [0, 6, 7, 8, 19, 23]) {
    const now = new Date(2026, 8, 4, h, 0);
    assert.ok(nextReset(now) > now, `broken at ${h}:00`);
  }
  assert.equal(hoursToReset(new Date(2026, 8, 4, 20, 0)), 11);
});

test('a stale allowance reads as full without anything having to write first', () => {
  const yesterday = consume(freshAllowance('2026-9-3'), '2026-9-3');
  assert.equal(rendersLeft(yesterday, 'freestyle', '2026-9-3'), 0);
  assert.equal(rendersLeft(yesterday, 'freestyle', DAY), 1, 'the rollover needs no write');
});

test('the spent line names the next render, never the absence of one', () => {
  /* §6.1: phrased as the next thing rather than the absence of this one. */
  assert.equal(NEXT_RENDER_LINE, 'Next generation at 7am');
  assert.doesNotMatch(NEXT_RENDER_LINE, /no |none|left|out of/i);
});

/* ══════════════ AC 2, 4 · consume at commit, refund on failure ══════════════ */

test('AC 4 · a failed job hands the allowance back', () => {
  const spent = consume(freshAllowance(DAY), DAY);
  assert.equal(rendersLeft(spent, 'freestyle', DAY), 0);
  assert.equal(rendersLeft(refund(spent, DAY), 'freestyle', DAY), 1);
});

test('a double refund cannot mint an allowance', () => {
  /* Refunds are for SYSTEM FAILURE ONLY. Never on user-initiated removal, or
     delete-and-retry becomes the reroll constraint 1 exists to prevent. */
  const a = refund(refund(consume(freshAllowance(DAY), DAY), DAY), DAY);
  assert.equal(rendersLeft(a, 'freestyle', DAY), PER_DAY.freestyle);
});

test('no allowance operation mutates the record it was given', () => {
  const a = freshAllowance(DAY);
  const snapshot = JSON.stringify(a);
  consume(a, DAY);
  consumeRerender(a, DAY);
  refund(a, DAY);
  assert.equal(JSON.stringify(a), snapshot);
});

/* ═══════ AC 10–12 · the re-render, and its three constraints ═══════ */

const published = (over: Partial<Parameters<typeof rerenderVerdict>[0]> = {}) => ({
  publishedAt: 1_000_000,
  rerenderUsed: false,
  reactions: 0,
  now: 1_000_000 + 60_000,
  ...over,
});

test('a fresh, unreacted look inside the window can be re-rendered', () => {
  assert.deepEqual(rerenderVerdict(published()), { allowed: true });
});

test('CONSTRAINT 3a · ONE reaction closes the window', () => {
  /* Without this, someone watches reactions arrive and then rerolls — which is
     optimising against the room, the precise thing the blind-commit structure
     exists to prevent. A look that draws a reaction in nine seconds loses its
     window in nine seconds. That is correct, not a bug. */
  const v = rerenderVerdict(published({ reactions: 1, now: 1_000_000 + 9_000 }));
  assert.deepEqual(v, { allowed: false, because: 'reacted' });
});

test('CONSTRAINT 3b · fifteen minutes closes the window', () => {
  assert.equal(RERENDER_WINDOW_MS, 15 * 60_000);
  const justInside = rerenderVerdict(published({ now: 1_000_000 + RERENDER_WINDOW_MS - 1 }));
  const justOutside = rerenderVerdict(published({ now: 1_000_000 + RERENDER_WINDOW_MS }));
  assert.equal(justInside.allowed, true);
  assert.deepEqual(justOutside, { allowed: false, because: 'expired' });
});

test('the reaction wins over the clock — whichever comes FIRST', () => {
  const v = rerenderVerdict(published({ reactions: 3, now: 1_000_000 + 1 }));
  assert.equal(v.allowed, false);
});

test('AC 13 · a used re-render is refused even inside the window', () => {
  const v = rerenderVerdict(published({ rerenderUsed: true }));
  assert.deepEqual(v, { allowed: false, because: 'used' });
});

test('an unpublished look has no window at all', () => {
  const v = rerenderVerdict(published({ publishedAt: null }));
  assert.deepEqual(v, { allowed: false, because: 'not-published' });
});

test('CONSTRAINTS 1 and 2 · frozen input, and replaces in place', () => {
  /* 1. Frozen input: identical pieces, casting and tags. This is what makes it
        a fix for a bad render rather than a second attempt at a better look —
        you re-roll model variance, not taste.
     2. Replaces in place: same post, same id. Not a second publication. */
  assert.equal(RERENDER_INPUT_FROZEN, true);
  assert.equal(RERENDER_REPLACES_IN_PLACE, true);
});

test('AC 12 · the store’s re-render writes one record, never a second', () => {
  /* Asserted against the source because the alternative is a second archive
     row and a second magazine post, and neither is visible from a pure
     function. `land()` guards its archive write on `!rerenderUsed`. */
  const src = readFileSync(new URL('../src/state/submission.ts', import.meta.url), 'utf8');
  assert.match(src, /const first = !current\.rerenderUsed;/);
  assert.match(src, /destination === 'magazine' && first/);
});

test('every closed window says WHY — "unavailable" alone reads as a fault', () => {
  (['used', 'reacted', 'expired', 'not-published'] as const).forEach((k) =>
    assert.ok(RERENDER_BLOCK_LINES[k].length > 10, `${k} needs a reason`),
  );
});

/* ══════════════ AC 1, 3 · the tab state machine ══════════════ */

const tab = (over: Partial<Parameters<typeof createTabState>[0]> = {}) =>
  createTabState({
    poolSize: 10,
    minPieces: MIN_PIECES,
    left: 1,
    inFlight: false,
    failed: false,
    inFlow: false,
    ...over,
  });

test('AC 1 · a spent user gets the spent state and never reaches step 1', () => {
  /* §2.2 consequence 1: with no save path, a spent user cannot do anything
     with a look, so there is no reason to let them pick pieces. Blocked at
     ENTRY, not at the commit button — which stops the flow being a corridor to
     a closed door. */
  assert.equal(tab({ left: 0 }), 'spent');
});

test('AC 3 · a job in flight shows rendering, not available', () => {
  assert.equal(tab({ left: 0, inFlight: true }), 'rendering');
  assert.equal(tab({ left: 1, inFlight: true }), 'rendering', 'even if an allowance is somehow left');
});

test('a committed flow is not thrown out by its own spend', () => {
  /* Past the step-2 commit the allowance IS spent, so without inFlow winning
     here the user would be ejected from the flow at the exact moment they paid
     for it. `spent` is for someone ARRIVING at a used-up tab. */
  assert.equal(tab({ left: 0, inFlow: true }), 'building');
});

test('failure outranks everything — the user is owed the retry', () => {
  assert.equal(tab({ failed: true, inFlight: true, inFlow: true, left: 0 }), 'failed');
});

test('a thin wardrobe routes to Wardrobe, but never over today’s render', () => {
  assert.equal(tab({ poolSize: MIN_PIECES - 1 }), 'insufficient');
  assert.equal(tab({ poolSize: MIN_PIECES }), 'available');
  assert.equal(
    tab({ poolSize: 1, left: 0 }),
    'spent',
    'someone who rendered their whole wardrobe is shown what they made, not sent shopping',
  );
});

/* ══════════════ AC 19–22 · the invariants that decay ══════════════ */

test('AC 19 · nothing in Create renders before the step-2 commit', () => {
  /* The flat lay is NOT a render — it is the actual pieces, and the copy on
     step 2 says exactly that. What must not appear before the commit is
     `RenderStrip`: the async progress, which only exists once a job is in
     flight, and a job only exists after the commit.

     Asserted positionally against the source because it is a structural claim,
     not a value: RenderStrip must live inside the `Rendering` component and
     nowhere else in the file. */
  const src = readFileSync(new URL('../app/create/index.tsx', import.meta.url), 'utf8');
  const renderingFn = src.indexOf('function Rendering()');
  const strips = [...src.matchAll(/<RenderStrip/g)].map((m) => m.index!);

  assert.ok(renderingFn > 0, 'the Rendering state component must exist');
  assert.equal(strips.length, 1, 'exactly one RenderStrip in Create');
  assert.ok(strips[0]! > renderingFn, 'and it must sit inside Rendering');
});

test('AC 20 · no brief data appears anywhere in Create', () => {
  /* No brief title, no slots against a brief, no entry, no band, no result, no
     voting. Two flows sharing a chassis makes sharing the copy with it
     perpetually tempting, so this is checked rather than trusted. */
  assert.equal(CREATE_HAS_NO_BRIEF, true);
  for (const f of ['../app/create/index.tsx', '../app/create/posted.tsx']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.equal(/TONIGHTS_BRIEF/.test(src), false, `${f} must not read the brief`);
    assert.equal(/domain\/bands|BandLadder|settlement/.test(src), false, `${f} must not band it`);
  }
});

test('AC 22 · the builder still captures its single closed declared word', () => {
  /* Free text is a FREESTYLE reversal only. The gap — declared word vs the
     room's read — survives on brief entries precisely because Build keeps its
     closed word, and the brief lane submits no free tags. */
  const src = readFileSync(new URL('../app/(tabs)/today/rendering.tsx', import.meta.url), 'utf8');
  assert.match(src, /tags: \[\]/, 'the brief lane must submit no free tags');
});

test('reactions are live on a freestyle look from publish', () => {
  /* Free looks aren't in a comparison pool, so there is no blindness to
     protect — "all crowd data lives behind the close" is about live BRIEF
     entries. Stated so nobody "fixes" it later. */
  assert.equal(FREESTYLE_REACTABLE_AT_PUBLISH, true);
});

/* ══════════════ the ribbon and the three placements ══════════════ */

test('the ribbon is four segments and casting is not one of them', () => {
  assert.deepEqual(
    CREATE_RIBBON.map((s) => s.label),
    ['Pick', 'Look', 'Tag', 'Generate'],
  );
  assert.equal(
    CREATE_RIBBON.some((s) => /model|cast/i.test(s.label)),
    false,
    'casting is a screen shared with the builder, not a step',
  );
});

test('the rule at the commit is SHORT, and says the one thing that matters', () => {
  /* §7 placement 2, the load-bearing one — and this test used to pin the
     prototype's #crendnote verbatim on the grounds that the wording was not
     ours to tidy. Katya replaced it on 4 Sep: twenty-one words in `Tiny` above
     the button is the size and shape the eye skips at exactly the moment it
     must not.

     So the assertion moved from the exact string to the properties that made
     it load-bearing. Short enough to be read at a glance, and it still names
     the constraint rather than the cost. */
  assert.ok(ONE_A_DAY_AT_COMMIT.split(/\s+/).length <= 12, 'small print is not a placement');
  assert.match(ONE_A_DAY_AT_COMMIT, /one look a day/i);

  /* The magazine clause is gone and must not come back: it distinguished
     rendered looks from unrendered ones, and §2.2 deleted the unrendered
     path — so it now argues against an option that does not exist. */
  assert.doesNotMatch(ONE_A_DAY_AT_COMMIT, /magazine/i);
});

/* ══════════════ a1 · the locked next-challenge card ══════════════ */

test('tomorrow’s job is never the one already played', () => {
  /* The first version returned CHALLENGES[1], which is The interview — the job
     the result card directly above it is reporting the result OF. A preview of
     tomorrow that shows yesterday is worse than no preview. */
  const next = nextChallenge();
  assert.notEqual(next.name, YESTERDAYS_BRIEF);
  assert.notEqual(next.open, true, 'nor the one open right now');
});

test('the preview reveals the month’s order, and that is one flag', () => {
  /* ⚠ data/challenges.ts withholds the order on purpose — "publish the month's
     jobs, withhold the order… browsing gets a purpose without becoming
     shopping for tonight". Naming tomorrow's job hands someone the evening to
     go and acquire for it. Katya's call, 4 Sep; this asserts the off-switch
     still exists rather than asserting which way it is set. */
  assert.equal(typeof REVEAL_NEXT_BRIEF, 'boolean');
});

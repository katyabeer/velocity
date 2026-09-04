/**
 * a10 · YOU, and the handle it renders. You-brief §3–§7, acceptance criteria
 * 1–17.
 *
 * These are copy rules, which is exactly why they are tested: a render is very
 * good at eroding them one plausible edit at a time. The principle they all
 * serve is one line —
 *
 *   an empty state that names a FUTURE is fine; one that names an ABSENCE is not.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  HANDLE_MAX_LENGTH,
  HANDLE_MIN_LENGTH,
  TAKEN,
  display,
  forUniqueness,
  handleRejection,
  handleRejectionMessage,
} from '../src/domain/handle.ts';
import {
  MILESTONES_FROM_REACTIONS,
  REACTION_RANKS_ON_YOU,
  SENTENCE_MIN_LOOKS,
  TREND_MIN_SETTLED,
  buildClause,
  descriptor,
  piecesLine,
  qualifyingTips,
  roomClause,
  sentenceChips,
  sentenceState,
  showAllPostsLink,
  earnRoute,
  profileLine,
  showTrend,
  showWardrobeRoute,
  statRows,
  topTags,
  visibleSections,
  type YouRollup,
} from '../src/domain/you.ts';
import { REACTION_LABELS, REACTION_VALUES, isPositive } from '../src/domain/reactions.ts';
import { MILESTONES } from '../src/domain/bands.ts';

const cold = (over: Partial<YouRollup> = {}): YouRollup => ({
  looks: 0,
  looksSettled: 0,
  piecesOwned: 0,
  piecesTaken: 0,
  distinctTakers: 0,
  jobsEntered: 0,
  freestylePosts: 0,
  judgingRounds: 0,
  streakDays: 0,
  reactionsReceived: 0,
  distinctReactors: 0,
  modalRead: null,
  buildWords: ['quiet', 'structured'],
  topTags: [],
  mostUsedPieces: [],
  closeCallsJudged: 0,
  ...over,
});

/* ═══════════════ AC 1–6 · the handle and the descriptor ═══════════════ */

test('AC 1 · a valid handle survives verbatim, case preserved', () => {
  assert.equal(handleRejection('Katya_B99'), null);
  assert.equal(display('Katya_B99'), '@Katya_B99', 'the @ is display only');
});

test('AC 2 · a duplicate is rejected, and uniqueness is case-insensitive', () => {
  const r = handleRejection(TAKEN[0]!.toUpperCase());
  assert.equal(r?.reason, 'taken');
  assert.match(handleRejectionMessage(r!), /taken/);
  assert.equal(forUniqueness('KATYA'), 'katya');
});

test('the shape rules, at their boundaries', () => {
  assert.equal(handleRejection('x'.repeat(HANDLE_MIN_LENGTH)), null);
  assert.equal(handleRejection('x'.repeat(HANDLE_MIN_LENGTH - 1))?.reason, 'short');
  assert.equal(handleRejection('x'.repeat(HANDLE_MAX_LENGTH)), null);
  assert.equal(handleRejection('x'.repeat(HANDLE_MAX_LENGTH + 1))?.reason, 'long');
  assert.equal(handleRejection('9lives')?.reason, 'leading-digit');
  assert.equal(handleRejection('katya.b')?.reason, 'characters', 'a dot is not a handle character');
  assert.equal(handleRejection('')?.reason, 'empty');
});

test('unicode handles are accepted, not just latin ones', () => {
  assert.equal(handleRejection('カティア'), null);
  assert.equal(handleRejection('катя_б'), null);
});

test('shape is checked BEFORE uniqueness', () => {
  /* Telling someone their handle is taken when it was never a legal handle
     sends them looking for a different name instead of a different character. */
  assert.equal(handleRejection('9' + TAKEN[0]!)?.reason, 'leading-digit');
});

test('AC 3 · no entries shows "just joined" and NO look count', () => {
  const d = descriptor({ dayNumber: 0, hasEntered: false, looks: 0 });
  assert.equal(d, 'just joined');
  assert.doesNotMatch(d, /0|look/, 'a zero here turns "you are new" into "you have nothing"');
});

test('AC 4 · entered shows tenure and a look count of at least 1', () => {
  assert.equal(descriptor({ dayNumber: 3, hasEntered: true, looks: 1 }), 'day 3 · 1 look');
  assert.equal(descriptor({ dayNumber: 2, hasEntered: true, looks: 1 }), 'day 2 · 1 look', 'day 1 is the day you joined');
  assert.equal(descriptor({ dayNumber: 21, hasEntered: true, looks: 14 }), '3 weeks in · 14 looks');
  assert.equal(descriptor({ dayNumber: 124, hasEntered: true, looks: 118 }), '4 months in · 118 looks');
});

test('AC 5 · "just joined" survives a later-day login with no entry', () => {
  /* Someone who signs up at 21:00 and cannot enter until tomorrow is still
     just joined — which is why this reads hasEntered and not only a date. */
  assert.equal(descriptor({ dayNumber: 4, hasEntered: false, looks: 0 }), 'just joined');
});

test('AC 6 · zero tokens carries the earn route; non-zero does not', () => {
  /* The COUNT itself is the TokenBadge, present in the header of every screen
     — printing it here as well put "0" twice on one line. Only the half the
     badge cannot say lives in the descriptor. */
  assert.equal(earnRoute(0), 'judging opens at 8pm');
  assert.equal(earnRoute(1), null);
});

test('the handle segment is DROPPED when there is no handle, never rendered as "@"', () => {
  /* There is deliberately no fallback string: an empty handle means onboarding
     did not complete. A bare "@" is worse than saying nothing. */
  const cold_ = { dayNumber: 0, hasEntered: false, looks: 0 };
  assert.equal(profileLine({ handle: '', tenure: cold_, tokens: 0 }), 'just joined · judging opens at 8pm');
  assert.equal(
    profileLine({ handle: 'katya_b', tenure: { dayNumber: 21, hasEntered: true, looks: 14 }, tokens: 3 }),
    '@katya_b · 3 weeks in · 14 looks',
  );
});

test('the wardrobe route needs a wardrobe to route to', () => {
  assert.equal(showWardrobeRoute(cold()), false, 'the remainder of nothing');
  assert.equal(showWardrobeRoute(cold({ piecesOwned: 1 })), true);
});

/* ═══════════════ AC 7–10 · day one ═══════════════ */

test('AC 7 · a day-one user sees posts, stats and milestones — and nothing invented', () => {
  const s = visibleSections(cold());
  assert.deepEqual(s, ['posts', 'stats', 'milestones']);
  assert.equal(MILESTONES.length, 6, 'all six, and that is all there are');
});

test('AC 8 · "Just for you" is ABSENT on day one, not empty', () => {
  /* "Keep going and we'll tell you about your eye" is an IOU against the most
     expensive computation in the product. */
  assert.equal(visibleSections(cold()).includes('justForYou'), false);
  assert.deepEqual(qualifyingTips(cold()), []);
});

test('the sentence is hidden until there are looks to read it from', () => {
  /* The you-brief derives a day-one sentence from the onboarding capsule. The
     capsule PICKER was cut on 3 Sep, so on day one the only declaration is
     rails — a soft preference about clothes, too thin for an identity
     sentence. Hidden beats invented. */
  assert.equal(sentenceState(cold()), 'hidden');
  assert.equal(sentenceState(cold({ looks: SENTENCE_MIN_LOOKS - 1 })), 'hidden');
  assert.equal(sentenceState(cold({ looks: SENTENCE_MIN_LOOKS })), 'building');
  assert.equal(sentenceState(cold({ looks: 20, modalRead: 'bold' })), 'established');
});

test('AC 9 · no zero-value stat row is rendered', () => {
  assert.deepEqual(statRows(cold(), true), [], 'a wall of zeros is the worst thing this screen could do');
  const some = statRows(cold({ jobsEntered: 1, judgingRounds: 1 }), true);
  assert.deepEqual(some, [
    { label: 'Jobs entered', value: '1' },
    { label: 'Judging rounds finished', value: '1' },
  ]);
});

test('AC 9 · the chip row is absent, never dashed, before the room has spoken', () => {
  assert.equal(sentenceChips(cold()), null);
  assert.equal(sentenceChips(cold({ looks: 5 })), null, 'building state has no room data');
});

test('the streak row is one flag, and it removes the row rather than zeroing it', () => {
  const on = statRows(cold({ streakDays: 9 }), true).map((s) => s.label);
  const off = statRows(cold({ streakDays: 9 }), false).map((s) => s.label);
  assert.ok(on.includes('Streak'));
  assert.equal(off.includes('Streak'), false);
});

test('AC 10 · no trend below five settled results', () => {
  /* A trend line through two points is a decoration. */
  assert.equal(showTrend(cold({ looksSettled: TREND_MIN_SETTLED - 1 })), false);
  assert.equal(showTrend(cold({ looksSettled: TREND_MIN_SETTLED })), true);
  assert.equal(showAllPostsLink(cold({ looks: 1 })), false, 'one post is not a list');
  assert.equal(showAllPostsLink(cold({ looks: 2 })), true);
});

test('the pieces line names a future, never an absence', () => {
  assert.equal(piecesLine(cold()), 'Nothing in your wardrobe yet.');
  assert.equal(piecesLine(cold({ piecesOwned: 8 })), 'You own 8 pieces. Nothing worn yet.');
  assert.equal(piecesLine(cold({ piecesOwned: 8, looks: 2 })), 'You own 8 pieces.');
  assert.equal(piecesLine(cold({ piecesOwned: 1 })), 'You own 1 piece. Nothing worn yet.');
});

/* ═══════════════ AC 11–13 · the vocabulary, and the gap ═══════════════ */

test('AC 11 · every word for how the room read you is a reaction word', () => {
  /* The screen used to say "the room reads you as brave" with a chip reading
     "sharp most read". Neither word is in the reaction vocabulary — they are
     the old register list — so it could produce "you build quiet and the room
     reads you as sharp" out of a vocabulary containing neither. */
  const vocabulary = REACTION_VALUES.filter(isPositive).map((v) => REACTION_LABELS[v].toLowerCase());
  REACTION_VALUES.filter(isPositive).forEach((v) => {
    const clause = roomClause(v);
    assert.ok(clause, `${v} must produce a clause`);
    assert.ok(vocabulary.includes(clause!), `"${clause}" is not a reaction word`);
  });
  ['brave', 'sharp', 'quiet', 'structured'].forEach((old) =>
    assert.equal(vocabulary.includes(old), false, `"${old}" is the old register list`),
  );
});

test('the build clause is NOT constrained to the reaction vocabulary', () => {
  /* AC 11 covers words describing how the ROOM read you. "quiet and
     structured" describes what you build, which is a different claim from a
     different source, and collapsing the two would lose the whole point of
     the sentence — your intent against their reading. */
  assert.equal(buildClause(['quiet', 'structured']), 'quiet and structured');
  assert.equal(buildClause(['quiet']), 'quiet');
  assert.equal(buildClause([]), '');
});

test('AC 12 · the sentence NEVER carries a bare negative read', () => {
  /* "You in a sentence" is an identity statement, and "the room reads you as
     too safe" is a character verdict. The product never punishes. A negative
     may appear only in GAP form — and there is no declared word anywhere in
     this build (locked decision 18 removed Build's tag step, handover open
     question C asks whether it returns), so gap form is unreachable and a
     negative modal read yields NOTHING here. It stays in the per-look read,
     aggregated and owner-only. */
  REACTION_VALUES.filter((v) => !isPositive(v)).forEach((v) =>
    assert.equal(roomClause(v), null, `${v} must not reach the sentence`),
  );
});

test('AC 13 · a look contributes a read but never a gap', () => {
  /* True for freestyle by design, and true for brief entries too until the
     declared word exists. Asserted against the source, because the risk is a
     future session wiring a `declared` word into this screen from something
     that is not one. */
  assert.equal(roomClause.length, 1, 'roomClause takes the read alone — there is no gap parameter');
  const screen = readFileSync(new URL('../app/(tabs)/you/index.tsx', import.meta.url), 'utf8');
  assert.equal(/You went for|declared/.test(screen), false, 'no gap sentence on You');
});

/* ═══════════════ AC 14–15 · the tips are a pool ═══════════════ */

test('AC 14 · the section renders with however many qualify', () => {
  const one = qualifyingTips(cold({ looks: 12 }));
  assert.deepEqual(one, ['wardrobe'], 'one tip is a valid section');

  const two = qualifyingTips(cold({ looks: 12, looksSettled: 12 }));
  assert.deepEqual(two, ['wardrobe', 'loudPiece']);

  const all = qualifyingTips(cold({ looks: 12, looksSettled: 12, closeCallsJudged: 40 }));
  assert.deepEqual(all, ['wardrobe', 'loudPiece', 'eye']);
});

test('AC 15 · a Weakness never renders as the only tip — it is HELD, not dropped', () => {
  /* A single negative tip with no counterweight is the whole section reading
     as criticism. */
  assert.deepEqual(qualifyingTips(cold({ closeCallsJudged: 40 })), []);
  assert.deepEqual(
    qualifyingTips(cold({ closeCallsJudged: 40, looks: 12 })),
    ['wardrobe', 'eye'],
    'and it comes back the moment there is something beside it',
  );
});

test('tips are ordered by availability — the cheap one lands first', () => {
  const all = qualifyingTips(cold({ looks: 99, looksSettled: 99, closeCallsJudged: 99 }));
  assert.equal(all[0], 'wardrobe', 'counting your own data is the cheap query');
  assert.equal(all[all.length - 1], 'eye', 'the cohort query is the expensive one');
});

/* ═══════════════ AC 16–17 · what reactions may never do ═══════════════ */

test('AC 16 · no reaction figure is a rank, rate or percentile', () => {
  assert.equal(REACTION_RANKS_ON_YOU, false);
  const rows = statRows(cold({ reactionsReceived: 212, distinctReactors: 88 }), false);
  rows.forEach((row) => {
    assert.match(row.value, /^\d+$/, `"${row.label}" must be a bare count`);
    assert.doesNotMatch(row.label, /rank|rate|percentile|top|average|per /i);
  });
});

test('AC 17 · no milestone is driven by reactions', () => {
  assert.equal(MILESTONES_FROM_REACTIONS, false);
  MILESTONES.forEach((m) =>
    assert.equal(
      /react/i.test(m.name + m.hint),
      false,
      `${m.key} must not be reaction-shaped`,
    ),
  );
});

/* ═══════════════ §6 · your words ═══════════════ */

test('your words are your five most-used tags, most-used first', () => {
  const history = ['wedding', 'cold', 'wedding', 'sharp', 'cold', 'wedding', 'a1', 'b2', 'c3', 'd4'];
  assert.deepEqual(topTags(history), ['wedding', 'cold', 'sharp', 'a1', 'b2']);
  assert.deepEqual(topTags([]), [], 'and absent rather than empty when there are none');
});

test('ties break by first use, so a long-standing tag outranks yesterday’s', () => {
  assert.deepEqual(topTags(['old', 'new', 'old', 'new'], 2), ['old', 'new']);
});

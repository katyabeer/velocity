/**
 * Reactions. Numbered assertions map to `reactions-logic.md` §10's acceptance
 * criteria; the ones marked INVARIANT are the spec's own "assert these in
 * tests, because they're the ones that decay".
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  NEGATIVES_SUBTRACT,
  NEGATIVE_THRESHOLD,
  NOT_ENOUGH_READS,
  PANEL_DIVIDER_AFTER,
  PANEL_VALUES,
  REACTIONS_FEED_BUILD_LADDER,
  REACTIONS_FEED_EYE_LADDER,
  REACTIONS_FEED_MILESTONES,
  REACTIONS_MINT_TOKENS,
  REACTIONS_ON_GARMENTS,
  REACTION_LABELS,
  REACTION_VALUES,
  aggregate,
  breakdownWords,
  intentFor,
  isPositive,
  isReactable,
  modalValue,
  nextHeld,
  ownerStats,
  publicStats,
  readSentence,
  reactPermission,
  valenceOf,
  withOwnReaction,
  type ReactionTally,
} from '../src/domain/reactions.ts';

test('the vocabulary is closed — nine values, five positive, four negative', () => {
  assert.equal(REACTION_VALUES.length, 9);
  assert.equal(REACTION_VALUES.filter(isPositive).length, 5);
  assert.equal(REACTION_VALUES.filter((v) => !isPositive(v)).length, 4);
});

test('valence is derived from the value, never stored', () => {
  assert.equal(valenceOf('thumbs_up'), 'positive');
  assert.equal(valenceOf('iconic'), 'positive');
  assert.equal(valenceOf('thumbs_down'), 'negative');
  assert.equal(valenceOf('too_safe'), 'negative');
});

test('every value has a word, because labels are the words themselves', () => {
  REACTION_VALUES.forEach((v) =>
    assert.ok(REACTION_LABELS[v]?.length, `${v} needs a label, not a glyph`),
  );
});

test('the panel is seven rows, positives first, divider after the last positive', () => {
  assert.equal(PANEL_VALUES.length, 7);
  assert.deepEqual(PANEL_VALUES.slice(0, PANEL_DIVIDER_AFTER).filter(isPositive).length, 4);
  assert.equal(
    PANEL_VALUES.slice(PANEL_DIVIDER_AFTER).every((v) => !isPositive(v)),
    true,
    'everything after the divider is negative',
  );
  assert.equal(PANEL_VALUES.includes('thumbs_up' as never), false, 'thumbs are direct icons');
});

/* §10.1 */
test('one reaction per person — bold over thumbs_up REPLACES, never stacks', () => {
  assert.equal(nextHeld('thumbs_up', 'bold'), 'bold');
});

/* §10.2 */
test('tapping the held value clears it', () => {
  assert.equal(nextHeld('bold', 'bold'), undefined);
  assert.equal(nextHeld(undefined, 'bold'), 'bold');
});

test('the write verb is set or clear — POST is never a toggle (§8)', () => {
  assert.equal(intentFor(undefined, 'bold'), 'set');
  assert.equal(intentFor('thumbs_up', 'bold'), 'set');
  assert.equal(intentFor('bold', 'bold'), 'clear');
});

/* §10.3, §10.4 */
test('own looks and live entries are read-only, and live entries are not reactable at all', () => {
  assert.equal(reactPermission('freestyle', true), 'own_look');
  assert.equal(reactPermission('live_entry', false), 'not_reactable');
  assert.equal(isReactable('live_entry'), false);
  assert.equal(isReactable('editorial'), true);
  assert.equal(isReactable('settled_entry'), true);
  assert.equal(isReactable('freestyle'), true);
});

const tally: ReactionTally = {
  thumbs_up: 3,
  bold: 5,
  fresh: 2,
  clashing: 1,
  too_safe: 2,
};

test('positives and negatives aggregate separately, and nothing nets off', () => {
  const a = aggregate(tally);
  assert.equal(a.positiveCount, 10, '3 + 5 + 2');
  assert.equal(a.negativeCount, 3, '1 + 2');
  assert.equal(NEGATIVES_SUBTRACT, false);
});

/* INVARIANT §10.14 */
test('distinctReactorCount === positiveCount + negativeCount, by construction', () => {
  const a = aggregate(tally);
  assert.equal(a.distinctReactorCount, a.positiveCount + a.negativeCount);
  assert.equal(aggregate({}).distinctReactorCount, 0);
});

/* §10.6 — the one that must never regress */
test('NO PUBLIC NEGATIVE COUNT, EVER — the public view has no negative field', () => {
  const view = publicStats(tally);
  assert.deepEqual(Object.keys(view).sort(), ['positiveBreakdown', 'positiveCount']);
  assert.equal('negativeCount' in view, false);
  assert.equal('negativeBreakdown' in view, false);
  /* A look with plenty of reactions still leaks nothing to a non-owner. */
  const busy = publicStats({ bold: 40, clashing: 12 });
  assert.equal(JSON.stringify(busy).includes('12'), false);
});

test('the public breakdown is words, not a table of numbers', () => {
  assert.deepEqual(breakdownWords({ bold: 5, thumbs_up: 3, fresh: 2 }), ['Bold', 'Liked it', 'Fresh']);
});

/* §10.5 */
test(`the owner sees negatives only at ${NEGATIVE_THRESHOLD}+ total reactions`, () => {
  const four = ownerStats({ bold: 3, clashing: 1 });
  assert.equal(four.distinctReactorCount, 4);
  assert.equal(four.enoughReads, false);
  assert.equal(four.negativeCount, null, 'null, not zero — zero is a claim');
  assert.equal(four.negativeBreakdown, null);

  const five = ownerStats({ bold: 4, clashing: 1 });
  assert.equal(five.enoughReads, true);
  assert.equal(five.negativeCount, 1);
  assert.deepEqual(five.negativeBreakdown, { clashing: 1 });
});

test('the owner always sees positives, threshold or not', () => {
  const thin = ownerStats({ bold: 2 });
  assert.equal(thin.positiveCount, 2);
  assert.equal(thin.enoughReads, false);
  assert.equal(NOT_ENOUGH_READS, 'not enough reads yet');
});

test('your own reaction adds exactly one, even on a value others already used', () => {
  const others: ReactionTally = { bold: 12, thumbs_up: 8 };
  assert.equal(publicStats(withOwnReaction(others, 'bold')).positiveCount, 21);
  assert.equal(publicStats(withOwnReaction(others, 'iconic')).positiveCount, 21);
  assert.equal(publicStats(withOwnReaction(others, undefined)).positiveCount, 20);
  /* A negative of your own moves no positive count — nothing nets off. */
  assert.equal(publicStats(withOwnReaction(others, 'clashing')).positiveCount, 20);
  /* And it never mutates what it was given. */
  assert.deepEqual(others, { bold: 12, thumbs_up: 8 });
});

test('one held value can only ever add one reaction, to one value', () => {
  const merged = withOwnReaction({ bold: 3 }, 'bold');
  assert.equal(aggregate(merged).distinctReactorCount, 4);
});

test('modal read is null on a tie — "mostly read as X" is false when level', () => {
  assert.equal(modalValue({ bold: 3, fresh: 1 }), 'bold');
  assert.equal(modalValue({ bold: 2, fresh: 2 }), null);
  assert.equal(modalValue({}), null);
  assert.equal(modalValue({ bold: 0 }), null);
});

test('the read is a read, never a verdict, and carries no number', () => {
  const sentence = readSentence(tally, 'clean');
  assert.ok(sentence);
  assert.match(sentence!, /^You went for clean\./);
  assert.match(sentence!, /mostly read it as bold/);
  assert.match(sentence!, /with some reading it as too safe/);
  assert.equal(/\d/.test(sentence!), false, 'leading with the count is what makes it punitive');
});

test('no declared word degrades to the room’s read alone, not half a sentence', () => {
  const sentence = readSentence(tally);
  assert.ok(sentence);
  assert.equal(sentence!.startsWith('The room mostly read it as'), true);
});

test('below the threshold there is no read sentence at all', () => {
  assert.equal(readSentence({ bold: 2, clashing: 1 }, 'clean'), null);
});

/* INVARIANTS §10.10, §10.12, and §7's ladder exclusions */
test('the feed sampler does not know reactions exist', async () => {
  const sampler = await import('../src/domain/magazine.ts');
  assert.equal('REACTION_VALUES' in sampler, false);
  assert.equal('aggregate' in sampler, false);
  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(new URL('../src/domain/magazine.ts', import.meta.url), 'utf8'),
  );
  assert.equal(
    /from '\.\/reactions'|from "\.\/reactions"/.test(src),
    false,
    'sample, don’t sort — the sampler must never import reactions',
  );
});

test('reactions mint nothing and move no ladder', () => {
  assert.equal(REACTIONS_MINT_TOKENS, false);
  assert.equal(REACTIONS_FEED_BUILD_LADDER, false);
  assert.equal(REACTIONS_FEED_EYE_LADDER, false);
  assert.equal(REACTIONS_FEED_MILESTONES, false);
  assert.equal(REACTIONS_ON_GARMENTS, false);
});

test('no reaction path touches the token ledger', async () => {
  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(new URL('../src/domain/reactions.ts', import.meta.url), 'utf8'),
  );
  assert.equal(/from '\.\/economy'|completeJudgingRound|takeGarment/.test(src), false);
});

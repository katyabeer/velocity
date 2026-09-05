/**
 * a1 · THE JOB CARD'S FIVE STATES, and the clock that drives the day around
 * them.
 *
 * The card is the only place the day's state is reported, so a wrong state here
 * is a lie told on the first screen of the app. Two of these tests exist for
 * bugs that were actually live:
 *
 *   · a FAILED render read as `building`, so a dead job claimed to be a minute
 *     away indefinitely, with a dead button and no retry;
 *   · `phase` never advanced unless you entered, so the job never shut at 8pm.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { jobCardState, ENTRY_SURVIVES_A_FAILED_RENDER, RETRY_INPUT_FROZEN } from '../src/domain/today.ts';
import { CLOSE_HOUR, RESULT_HOUR, canEnterAt, canJudgeAt, phaseAt } from '../src/domain/clock.ts';

const card = (over: Partial<Parameters<typeof jobCardState>[0]> = {}) =>
  jobCardState({ entered: true, judged: true, render: 'ready', ...over });

/* ═══════════════════ the five states ═══════════════════ */

test('nothing entered is `open`, whatever the render is doing', () => {
  for (const render of ['none', 'pending', 'ready', 'failed'] as const) {
    assert.equal(card({ entered: false, judged: false, render }), 'open');
  }
});

test('entered but mid-round is `entered`', () => {
  assert.equal(card({ judged: false, render: 'pending' }), 'entered');
});

test('entered, judged, still going is `building`', () => {
  assert.equal(card({ render: 'pending' }), 'building');
  assert.equal(card({ render: 'none' }), 'building');
});

test('entered, judged, landed is `complete`', () => {
  assert.equal(card({ render: 'ready' }), 'complete');
});

test('entered, judged, died is `failed` — NOT `building`', () => {
  /* THE BUG. The card fell through to `building` on any status that wasn't
     `ready`, so a dead render said "we're putting your look on a model now, it
     takes about a minute" forever, with a dead button and no way to retry. */
  assert.equal(card({ render: 'failed' }), 'failed');
});

/* ═══════════════════ the ordering, which is load-bearing ═══════════════════ */

test('a render that dies MID-ROUND does not pre-empt the voting CTA', () => {
  /* Rendering and judging are tracked separately because they overlap — the
     render minute runs while you vote. If `failed` outranked the round, a
     failure at vote 3 would replace "last step, vote on tonight's looks" with a
     retry button and cost the user the other half of the evening over something
     they cannot make happen any faster by looking at it. The strip reports it
     instead. */
  assert.equal(card({ judged: false, render: 'failed' }), 'entered');
});

test('`failed` outranks both `building` and `complete`', () => {
  assert.equal(card({ render: 'failed' }), 'failed');
  /* And nothing else can be reached once it has failed — there is no status
     where the card would claim a finished look it does not have. */
  assert.notEqual(card({ render: 'failed' }), 'complete');
});

test('the entry survives a failed render, and the retry is frozen', () => {
  /* Both are stated as constants because they are promises the COPY makes:
     "your look is still entered and the round still counts". If either ever
     stops being true, that sentence becomes a lie. */
  assert.equal(ENTRY_SURVIVES_A_FAILED_RENDER, true);
  assert.equal(RETRY_INPUT_FROZEN, true, 'a retry is a fix, not a re-roll');
});

/* ═══════════════════ the clock ═══════════════════ */

const at = (h: number) => phaseAt(new Date(2026, 8, 4, h, 0));

test('the day turns at 07:00 and shuts at 20:00', () => {
  assert.equal(at(RESULT_HOUR - 1), 'settling', '06:00 is still last night');
  assert.equal(at(RESULT_HOUR), 'entry', '07:00 opens the job');
  assert.equal(at(CLOSE_HOUR - 1), 'entry', '19:00 is the last hour to enter');
  assert.equal(at(CLOSE_HOUR), 'judging', '20:00 shuts it');
  assert.equal(at(23), 'judging');
  assert.equal(at(0), 'settling');
});

test('you can never enter and judge in the same hour', () => {
  /* Judging opens only AFTER entry closes, which is what makes the anti-copying
     rule a consequence of the schedule rather than a rule of its own. */
  for (let h = 0; h < 24; h += 1) {
    const d = new Date(2026, 8, 4, h, 0);
    assert.equal(canEnterAt(d) && canJudgeAt(d), false, `both true at ${h}:00`);
  }
});

test('every hour of the day has exactly one phase', () => {
  for (let h = 0; h < 24; h += 1) {
    const p = at(h);
    assert.ok(['entry', 'judging', 'settling'].includes(p), `${h}:00 gave ${p}`);
  }
});

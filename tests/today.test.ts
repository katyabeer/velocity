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

import {
  ENTRY_SURVIVES_A_FAILED_RENDER,
  RETRY_INPUT_FROZEN,
  jobBadge,
  jobCardState,
  jobSteps,
} from '../src/domain/today.ts';
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

test('entered, judged, landed is `complete` — and `results` once it has settled', () => {
  assert.equal(card({ render: 'ready' }), 'complete');
  assert.equal(card({ render: 'ready', resultsReady: true }), 'results');
  /* Only ever with the render in. A result cannot arrive for a look that has
     no picture yet. */
  assert.equal(card({ render: 'pending', resultsReady: true }), 'building');
  assert.equal(card({ render: 'failed', resultsReady: true }), 'failed');
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

/* ═══════════════════ the badge, and the steps ═══════════════════ */

test('the badge reports THE CHALLENGE, not the render', () => {
  /* Which is what lets `failed` badge as Complete: the challenge genuinely is
     complete once you have built and voted, and the only thing that broke is
     the picture. Without the split the badge would have to say "complete except
     for the bit that failed", which is not a badge. */
  /* `New` only while nothing has been done — a card you already built a look
     on is not new (Katya, 4 Sep). Three values, not two. */
  assert.equal(jobBadge('open'), 'New');
  assert.equal(jobBadge('entered'), 'Open');
  assert.equal(jobBadge('building'), 'Complete');
  assert.equal(jobBadge('complete'), 'Complete');
  assert.equal(jobBadge('results'), 'Complete');
  assert.equal(jobBadge('failed'), 'Complete');
});

test('Build is SHUT after 8pm, not merely "todo"', () => {
  /* A step you cannot reach must not look like one you have not got to yet —
     it is gone for the day. */
  const open = jobSteps({ entered: false, judged: false, phase: 'entry' });
  assert.equal(open[0]!.state, 'now', 'before 8pm it is the live step');

  for (const phase of ['judging', 'settling'] as const) {
    const shut = jobSteps({ entered: false, judged: false, phase });
    assert.equal(shut[0]!.state, 'shut', `broken in ${phase}`);
  }
});

test('the steps carry their deadlines, which is why they are stacked', () => {
  /* The ribbon dropped its second line on 4 Sep and lost these with it. */
  const steps = jobSteps({ entered: false, judged: false, phase: 'entry' });
  assert.match(steps[0]!.label, /8pm/);
  assert.match(steps[2]!.label, /7am/);
  assert.deepEqual(steps.map((st) => st.n), [1, 2, 3]);
});

test('the steps track progress through the day', () => {
  const built = jobSteps({ entered: true, judged: false, phase: 'entry' });
  assert.equal(built[0]!.state, 'done');
  assert.equal(built[1]!.state, 'now', 'voting is what is left');

  const done = jobSteps({ entered: true, judged: true, phase: 'judging' });
  assert.equal(done[0]!.state, 'done');
  assert.equal(done[1]!.state, 'done');
  assert.equal(done[2]!.state, 'now', 'the result is the only thing outstanding');
});

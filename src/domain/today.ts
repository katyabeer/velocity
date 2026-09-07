/**
 * a1 · THE JOB CARD'S STATE MACHINE.
 *
 * The card is the one place in the app where the day's job state belongs — it
 * is what replaced the render chip that used to float in every screen's header
 * (see state/submission.ts). This lives in the domain rather than inline in the
 * screen for the same reason `createTabState` does: it is a set of rules about
 * the product, and a render is very good at eroding rules it owns privately.
 *
 * ══ RENDERING AND JUDGING ARE TRACKED SEPARATELY, AND THE ORDER BELOW IS WHY ══
 *
 * They overlap in practice — the minute of render runs while you vote — so
 * collapsing them into one progress read would mean the card either lies about
 * the render or lies about the round.
 *
 * That is also why `failed` sits BELOW the `!judged` test. A render that dies
 * mid-round must not replace the round's own "vote now" with a retry
 * button: the round is still there to finish, the entry is still in, and
 * hijacking the primary action would cost the user the evening's other half
 * over something they cannot fix any faster by looking at it. The failure
 * surfaces on the strip instead, which is a report rather than a demand.
 */

import { RESULT_LABEL, type Phase } from './clock';
import type { RenderStatus } from '@/state/submission';

export type JobCardState =
  | 'open'
  | 'entered'
  | 'building'
  | 'complete'
  | 'results'
  | 'failed';

export function jobCardState(input: {
  entered: boolean;
  /** The judging round is finished — `callsCast >= quota`. */
  judged: boolean;
  render: RenderStatus;
  /** The room has settled your entry and there is a placing to read.
   *  ⚠ See RESULTS_NEED_A_DAY_ROLLOVER — nothing in the prototype sets this
   *  on its own. */
  resultsReady?: boolean;
}): JobCardState {
  if (!input.entered) return 'open';
  /* The round outranks the render. See the header. */
  if (!input.judged) return 'entered';
  if (input.render === 'failed') return 'failed';
  if (input.render !== 'ready') return 'building';
  return input.resultsReady ? 'results' : 'complete';
}

/**
 * ⚠ `results` NEEDS A DAY ROLLOVER THE PROTOTYPE DOES NOT HAVE.
 *
 * Your entry settles overnight and the placing lands at 07:00 — by which point
 * it is YESTERDAY's job, and this card is showing a new one. So in the real
 * product the same card never carries both "complete" and "your result is in":
 * the result appears in Act 1 (`ui/ResultCard.tsx`) on the following morning.
 *
 * The state is built because Katya asked for it and because it is the correct
 * shape if the card ever does persist past 7am — but it is reachable only via
 * `FORCE_RESULTS_READY` in config/testState.ts. Worth deciding which of the two
 * places a result belongs before this ships.
 */
export const RESULTS_NEED_A_DAY_ROLLOVER = true as const;

/* ════════════════════════ the steps, stacked ════════════════════════ */

/**
 * `shut` is the one that needed adding: Build is not "todo" after 20:00 — it is
 * gone for the day, and a step you cannot reach must not look like one you have
 * not got to yet. The other three are the ribbon's own vocabulary.
 */
export type JobStepState = 'done' | 'now' | 'todo' | 'shut';

export type JobStep = { n: number; label: string; state: JobStepState };

/**
 * THE THREE STEPS, WITH THEIR DEADLINES IN THE LABEL. The stepper used to carry
 * these as a second line under each label and lost them when the ribbon went to
 * one line (4 Sep) — stacked rows have the width to say them, which is the
 * argument for stacking.
 *
 * Only rendered while the day is still open. Once the job is complete there is
 * no progress left to report, and three ticked rows under a badge already
 * saying "complete" is the same fact three times.
 */
export function jobSteps(input: {
  entered: boolean;
  judged: boolean;
  phase: Phase;
}): JobStep[] {
  const canBuild = input.phase === 'entry';
  return [
    {
      n: 1,
      label: 'Build by 8pm',
      state: input.entered ? 'done' : canBuild ? 'now' : 'shut',
    },
    {
      n: 2,
      label: 'Vote',
      state: input.judged ? 'done' : input.entered || !canBuild ? 'now' : 'todo',
    },
    { n: 3, label: `Results by ${RESULT_LABEL}`, state: input.judged ? 'now' : 'todo' },
  ];
}

/**
 * THE BADGE REPORTS THE CHALLENGE — not the render.
 *
 * That split is what lets `failed` sit under `Complete`: the challenge genuinely
 * IS complete once you have built and voted, and the only thing that went wrong
 * is the picture. The render's state is the strip's job. Without the split the
 * badge would have to say "complete except for the bit that broke", which is
 * not a badge.
 */
export type JobBadge = 'New' | 'Open' | 'Completed';

export const jobBadge = (state: JobCardState): JobBadge => {
  /* `New` ONLY WHEN NOTHING HAS BEEN DONE (Katya, 4 Sep, renaming `Open`).
     A card you have already built a look on is not new, so `entered` keeps
     `Open` — there is still something to do, and calling it new would be the
     badge forgetting what the user did an hour ago. Three values, not two. */
  if (state === 'open') return 'New';
  if (state === 'entered') return 'Open';
  return 'Completed';
};

/**
 * A FAILED RENDER DOES NOT UN-ENTER THE LOOK, and the card has to say so. The
 * obvious fear at that moment is that the evening was wasted; it wasn't. The
 * entry stands, the round stands, and the only thing missing is the picture.
 */
export const ENTRY_SURVIVES_A_FAILED_RENDER = true as const;

/**
 * Retry re-runs the IDENTICAL entry — same pieces, same casting. Frozen input,
 * exactly like the freestyle re-render: it is a fix for a job that died, not a
 * second attempt at a different look. Invariant 4 ("once you enter, nothing can
 * be changed") is untouched by it.
 */
export const RETRY_INPUT_FROZEN = true as const;

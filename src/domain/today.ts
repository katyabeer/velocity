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

import type { RenderStatus } from '@/state/submission';

export type JobCardState = 'open' | 'entered' | 'building' | 'complete' | 'failed';

export function jobCardState(input: {
  entered: boolean;
  /** The judging round is finished — `callsCast >= quota`. */
  judged: boolean;
  render: RenderStatus;
}): JobCardState {
  if (!input.entered) return 'open';
  /* The round outranks the render. See the header. */
  if (!input.judged) return 'entered';
  if (input.render === 'failed') return 'failed';
  if (input.render === 'ready') return 'complete';
  return 'building';
}

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

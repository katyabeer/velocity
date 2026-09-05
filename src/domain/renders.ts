/**
 * RENDER ALLOWANCES, the re-render window, and the Create tab's state machine.
 *
 * Rendering is the one thing in this product that costs real money per use, so
 * it is the one thing that is rationed. Everything in here exists to make that
 * rationing legible without making it feel like a lockout.
 *
 * ══ TWO ALLOWANCES, NOT ONE COUNTER ══
 *
 * The brief is explicit: do not implement one shared counter. Entering the
 * day's job and posting a freestyle look are different acts with different
 * value, and a single counter means one silently eats the other. `PER_DAY`
 * below is keyed by kind for that reason, and `tests/renders.test.ts` asserts
 * the independence rather than trusting it.
 *
 * ══ THE DAY BOUNDARY IS 07:00, NOT MIDNIGHT ══
 *
 * 07:00 is already the day boundary everywhere else — it is when yesterday's
 * result lands and the job opens (domain/clock.ts). Two different day
 * boundaries in one app is a bug generator, so this imports RESULT_HOUR rather
 * than declaring a 0.
 *
 * ══ THE RE-RENDER REVERSES AN INVARIANT, AND ONLY SAFELY WITH ALL THREE
 *    CONSTRAINTS ══
 *
 * D-brief invariant 5: "the render is faithful. The moment it can surprise
 * you, this stops measuring taste and becomes a slot machine." A re-render as
 * loosely stated IS that reroll. Katya's three constraints, 4 Sep, keep the
 * recourse and remove the gamble — BUILD ALL THREE OR THE REVERSAL IS NOT SAFE:
 *
 *   1. FROZEN INPUT. Identical pieces, casting and tags. Nothing editable
 *      between attempts. This makes it a fix for a bad render, not a second
 *      attempt at a better look — you are re-rolling model variance, not
 *      optimising taste. Enforced by `RERENDER_INPUT_FROZEN` and by the store
 *      never exposing an edit path once committed.
 *   2. REPLACES IN PLACE. Same post, same id, same magazine slot. Not a second
 *      publication.
 *   3. THE WINDOW CLOSES ON THE FIRST REACTION, OR 15 MINUTES. Without this,
 *      someone watches reactions arrive and then rerolls, which is optimising
 *      against the room. A look that draws a reaction in nine seconds loses
 *      its window in nine seconds. That is correct, not a bug.
 *
 * ⚠ COST FLAG FOR JACK. Worst case is now THREE renders per user per day: one
 * brief entry, one freestyle, one freestyle re-render. That lands on the
 * render cost curve (D §10.2) — the variable cost that grows exactly as the
 * product succeeds. Needs his sign-off, not ours.
 */

import { RESULT_HOUR, nextResultAt } from './clock';

export const RENDER_KINDS = ['brief', 'freestyle'] as const;
export type RenderKind = (typeof RENDER_KINDS)[number];

/** One each. Separate numbers, keyed by kind — see the header. */
export const PER_DAY: Record<RenderKind, number> = { brief: 1, freestyle: 1 };

/** Only freestyle gets a second attempt, and only ever one. A brief entry
 *  cannot be re-rendered: invariant 4 is "once you enter, nothing can be
 *  changed", and a re-render of an entry in a live comparison pool is a reroll
 *  against the field. */
export const RERENDERS_PER_DAY: Record<RenderKind, number> = { brief: 0, freestyle: 1 };

export const RERENDER_WINDOW_MS = 15 * 60_000;

export const RERENDER_INPUT_FROZEN = true as const;
export const RERENDER_REPLACES_IN_PLACE = true as const;

/* ─────────────────────────── the 07:00 day ─────────────────────────── */

/**
 * Which allowance-day a moment belongs to, as a sortable key. 06:59 on the 5th
 * is still the 4th's day: subtract the boundary hour before taking the date.
 */
export function dayKey(now: Date): string {
  const shifted = new Date(now.getTime() - RESULT_HOUR * 3_600_000);
  return `${shifted.getFullYear()}-${shifted.getMonth() + 1}-${shifted.getDate()}`;
}

/** The next 07:00 strictly after `now`. DELEGATED, not reimplemented — the
 *  allowance reset and the result landing are the same moment, and two
 *  implementations of one boundary is how they drift apart. */
export const nextReset = nextResultAt;

/**
 * Phrased as the next thing rather than the absence of this one (§6.1):
 * "Next render at 7am", never "no renders left". Same sentence all day, so it
 * does not read as a countdown someone is meant to wait out.
 */
export const NEXT_RENDER_LINE = 'Next generation at 7am';

/** How long until the reset, for the one place that wants a duration rather
 *  than a time — kept separate so NEXT_RENDER_LINE stays the default. */
export function hoursToReset(now: Date): number {
  return Math.ceil((nextReset(now).getTime() - now.getTime()) / 3_600_000);
}

/* ────────────────────────── the allowance ────────────────────────── */

export type Allowance = {
  /** Which 07:00-day these counts belong to. A key that isn't today's means
   *  the counts are stale and read as zero — see `spentToday`. */
  day: string;
  used: number;
  rerendersUsed: number;
};

export const freshAllowance = (day: string): Allowance => ({ day, used: 0, rerendersUsed: 0 });

/** Stale counts read as zero rather than being rewritten on read, so this
 *  stays a pure function and the store can roll over when it likes. */
const current = (a: Allowance, day: string): Allowance => (a.day === day ? a : freshAllowance(day));

export function rendersLeft(a: Allowance, kind: RenderKind, day: string): number {
  return Math.max(0, PER_DAY[kind] - current(a, day).used);
}

export function rerendersLeft(a: Allowance, kind: RenderKind, day: string): number {
  return Math.max(0, RERENDERS_PER_DAY[kind] - current(a, day).rerendersUsed);
}

/**
 * CONSUME AT COMMIT, NOT AT COMPLETION. If the allowance is only spent on
 * success, a user can start a render, kill the app and start again — a reroll
 * through the back door, which is constraint 1 defeated by process management.
 */
export function consume(a: Allowance, day: string): Allowance {
  const c = current(a, day);
  return { ...c, used: c.used + 1 };
}

export function consumeRerender(a: Allowance, day: string): Allowance {
  const c = current(a, day);
  return { ...c, rerendersUsed: c.rerendersUsed + 1 };
}

/**
 * REFUND ON SYSTEM FAILURE ONLY. Never on user-initiated removal, or
 * delete-and-retry becomes exactly the reroll constraint 1 exists to prevent.
 * Floors at zero so a double refund cannot mint an allowance.
 */
export function refund(a: Allowance, day: string): Allowance {
  const c = current(a, day);
  return { ...c, used: Math.max(0, c.used - 1) };
}

/* ─────────────────────── the re-render window ─────────────────────── */

export type RerenderBlock = 'used' | 'reacted' | 'expired' | 'not-published';

export type RerenderVerdict = { allowed: true } | { allowed: false; because: RerenderBlock };

/**
 * All three constraints in one place, in the order they matter. `reactions` is
 * the count on the look — ONE is enough to close the window, which is the
 * point: the moment the room has said anything, changing the render is
 * optimising against it.
 */
export function rerenderVerdict(look: {
  publishedAt: number | null;
  rerenderUsed: boolean;
  reactions: number;
  now: number;
}): RerenderVerdict {
  if (look.publishedAt === null) return { allowed: false, because: 'not-published' };
  if (look.rerenderUsed) return { allowed: false, because: 'used' };
  if (look.reactions > 0) return { allowed: false, because: 'reacted' };
  if (look.now - look.publishedAt >= RERENDER_WINDOW_MS) return { allowed: false, because: 'expired' };
  return { allowed: true };
}

/** What the screen says when the window has shut. Each one states the reason,
 *  because "unavailable" with no reason reads as a fault. */
export const RERENDER_BLOCK_LINES: Record<RerenderBlock, string> = {
  used: 'You have used your one re-generation on this look.',
  reacted: 'Someone has reacted — the generation stands as it is.',
  expired: 'The re-generation window has closed.',
  'not-published': 'Not published yet.',
};

export const RERENDER_NOTE =
  'Same pieces, same tags, same model — a different generation of the identical look. One only, and only until someone reacts.';

/* ───────────────────── the Create tab state machine ───────────────────── */

/**
 * THE TAB IS A STATE MACHINE, NOT A SCREEN — the same pattern Today already
 * uses. The order of the tests is the priority order and it is load-bearing:
 *
 *   `failed` outranks everything, because an allowance was refunded and the
 *   user is owed the retry.
 *
 *   `rendering` outranks the rest: a job in flight is not a finished render,
 *   and showing `spent`'s "here is today's render" while there isn't one yet
 *   would be a lie.
 *
 *   `inFlow` outranks `spent` — and this is the one that looks wrong. Past the
 *   step-2 commit the allowance IS spent, so without this test a user would be
 *   thrown out of their own flow at the exact moment they paid for it. `spent`
 *   is for someone ARRIVING at a used-up tab, not for someone still inside the
 *   thing that used it up.
 *
 *   `spent` outranks `insufficient`, so a user who rendered their whole
 *   wardrobe into one look is shown what they made rather than told to go
 *   shopping.
 *
 *   `spent` outranks `available` at zero, which is §2.2 consequence 1: with
 *   the save path gone, a spent user cannot do anything with a look, so there
 *   is no reason to let them pick pieces. They never see step 1. This is
 *   simpler than gating the button at step 2 and it stops the flow being a
 *   corridor to a closed door.
 */
export type CreateTabState =
  | 'available'
  | 'building'
  | 'rendering'
  | 'spent'
  | 'failed'
  | 'insufficient';

export function createTabState(input: {
  /** How many pieces the user can actually build from. */
  poolSize: number;
  minPieces: number;
  /** Freestyle renders left today. */
  left: number;
  /** A job is in flight for the freestyle lane. */
  inFlight: boolean;
  /** The last freestyle job failed and has not been retried. */
  failed: boolean;
  /** Past step 1 — a flow worth resuming, committed or not. */
  inFlow: boolean;
}): CreateTabState {
  if (input.failed) return 'failed';
  if (input.inFlight) return 'rendering';
  if (input.inFlow) return 'building';
  if (input.left <= 0) return 'spent';
  if (input.poolSize < input.minPieces) return 'insufficient';
  return 'available';
}

/** The four segments. MODEL came out on 4 Sep: casting (a18) is a screen
 *  shared by both flows, not a step — which is how the builder already treats
 *  it. Four segments means the header's "of 4" is finally true, and "four
 *  steps, one chassis" survives. */
export const CREATE_RIBBON = [
  { key: 'pick', label: 'Pick' },
  { key: 'look', label: 'Look' },
  { key: 'tag', label: 'Tag' },
  { key: 'render', label: 'Generate' },
] as const;

/** Placement 1 of the one-a-day rule (§7): ambient, under the masthead.
 *  Present, not argued. Never in onboarding — onboarding shows, it does not
 *  explain, and this is learned in context. */
export const ONE_A_DAY_AMBIENT = 'One generation a day.';

/**
 * Placement 2: at the commit. The load-bearing one — and it was FAILING at it.
 *
 * It used to be the prototype's `#crendnote` verbatim: "Rendering is the
 * expensive bit, so it is one a day — and only rendered looks can go in the
 * magazine." Two problems, both fixed here (Katya, 4 Sep):
 *
 *   IT WAS SMALL PRINT. Twenty-one words set in `Tiny` above the button is the
 *   size and shape the eye skips, at exactly the moment it must not. The rule
 *   is now a kicker plus one short line at `Lede`, so it is read rather than
 *   merely available to be read.
 *
 *   THE MAGAZINE CLAUSE WAS STALE. It distinguished rendered looks from
 *   unrendered ones back when a look could be saved without rendering. §2.2
 *   deleted that path, so the clause now separates rendered looks from nothing
 *   at all — an argument against an option that no longer exists.
 *
 * IT IS THE BODY COPY NOW, not a line above the button (Katya, 4 Sep). The
 * commit screen used to say the rule twice — once in its body and once in a
 * kicker plus `Lede` in the footer — and the second telling is the one people
 * stopped reading. One statement, in the sentence under the heading.
 *
 * Kept here rather than inlined in the screen because §7's three placements
 * are a rule about the product, not about one file: this is placement 2, and
 * the test that guards it needs something to point at.
 */
export const ONE_A_DAY_AT_COMMIT =
  'You can only generate and publish one look a day.';

/** Placement 3: the spent state, where the rule stops being information and
 *  becomes the situation. This is where it is actually learned. */
export const ONE_A_DAY_WHEN_SPENT =
  'That was today’s generation. Generating is the expensive bit, so it is one a day.';

/** §2.2 consequence 2: with no save path, abandonment is lossy, so it needs a
 *  quiet confirm. One line, not a modal ceremony. */
export const LEAVE_WITHOUT_RENDERING = 'Leave without generating? Nothing is kept.';

/**
 * NOTHING ABOUT CREATE IS A BRIEF. No brief title, no slots against a brief,
 * no entry, no comparison pool, no band, no result, no voting. A freestyle
 * look never settles. Asserted in tests/renders.test.ts, because this is the
 * invariant most likely to decay — the two flows share a chassis and it is
 * always tempting to share the copy with it.
 */
export const CREATE_HAS_NO_BRIEF = true as const;

/**
 * REACTIONS ARE LIVE FROM PUBLISH. Free looks aren't in a comparison pool, so
 * there is no blindness to protect — "all crowd data lives behind the close"
 * is about live brief entries and does not apply here. Stated so nobody
 * "fixes" it later.
 */
export const FREESTYLE_REACTABLE_AT_PUBLISH = true as const;

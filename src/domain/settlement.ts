/**
 * The settlement arithmetic. This is load-bearing and HAS BEEN WRONG BEFORE.
 * Keep it. If you change a constant here, change the table in the handover too.
 *
 * Mirrors velocity_maths.py. The unit tests in tests/settlement.test.ts pin
 * every number in the handover's headroom table — if one fails, the maths moved,
 * not the test.
 */

/** A look settles at 20 comparisons from 12 distinct raters. LOCKED — these
 *  are room-wide "how much evidence does a look need" thresholds, not a
 *  function of any one person's round size. NOT touched by QUOTA below. */
export const COMPARISONS_TO_SETTLE = 20;
export const DISTINCT_RATERS_TO_SETTLE = 12;

/** One paired call produces a comparison for BOTH looks. This factor of 2 is
 *  independent of round size — it's a structural fact of paired voting. */
export const COMPARISONS_PER_CALL = 2;

/** The judging quota — calls per round. Temporarily 5, not the documented
 *  10, for test-scale sessions. NOTE: at QUOTA=10 a single completed round
 *  happened to supply exactly COMPARISONS_TO_SETTLE (10 × 2 = 20) — one
 *  person's round alone was enough to settle a look outright. At QUOTA=5
 *  that's no longer true (5 × 2 = 10, half of 20): settling now requires
 *  comparisons from more than one person's round. That's a real pacing
 *  change, not just a smaller number — see tests/settlement.test.ts. */
export const QUOTA = 5;

/**
 * Loss factor for ties (counted at half weight) and sub-1.2s calls (one third).
 * Pessimistic on purpose.
 */
export const LOSS_FACTOR = 0.767;

/** Sub-threshold calls are discounted, not discarded. */
export const FAST_CALL_MS = 1200;
export const TIE_WEIGHT = 0.5;
export const FAST_WEIGHT = 1 / 3;

/**
 * headroom = LOSS_FACTOR × v / r
 *
 *   v = vote-completion rate (share of users who finish a round)
 *   r = entry rate (share of users who enter the job)
 *
 * ROOM SIZE CANCELS OUT ENTIRELY. That is not a simplification, it is the
 * result — which is why "we just need more users" is not an answer to a
 * settlement failure.
 *
 * Headroom below 1.0 means the room cannot settle.
 */
export function headroom(voteCompletionRate: number, entryRate: number): number {
  if (entryRate <= 0) return Infinity;
  return (LOSS_FACTOR * voteCompletionRate) / entryRate;
}

/** Rule of thumb: vote-completion must be at least 1.30 × the entry rate. */
export const VOTE_COMPLETION_MULTIPLE = 1 / LOSS_FACTOR; // ≈ 1.3037

/** The minimum vote-completion rate that still settles at a given entry rate. */
export const minVoteCompletion = (entryRate: number): number => entryRate / LOSS_FACTOR;

export const settles = (voteCompletionRate: number, entryRate: number): boolean =>
  headroom(voteCompletionRate, entryRate) >= 1;

/**
 * THE FAILURE MODE IS TRIGGERED BY SUCCESS.
 *
 * A job that pulls 80% of users into entering is the job that cannot settle,
 * because entrants are demand and judges are supply. Free entry is what breaks
 * the self-liquidating property: supply now depends on how many people feel
 * like voting.
 */
export const ENTRY_RATE_DANGER_ZONE = 0.8;

/**
 * ~125 DAU is the practical floor for a healthy room. The mathematical minimum
 * is ~13, which has zero slack — one no-show fails settlement.
 *
 * Note the multiplier: a hard rails filter would split the garment pool, which
 * splits the room, and the floor then multiplies by the number of catalogues
 * (125 → ~375). That is why the rails question in onboarding is SOFT.
 */
export const HEALTHY_ROOM_FLOOR_DAU = 125;
export const MATHEMATICAL_MINIMUM_DAU = 13;

/**
 * THE BINDING CONSTRAINT IS DISTINCT RATERS, NOT COMPARISONS.
 *
 * Each look needs twelve *different* people, so a scheduler must rank on
 * distinct-rater shortfall before comparison shortfall. And it is a matching
 * problem, not a sort — a look's eligible rater set can be exhausted in a small
 * room. Anything that implements this as `looks.sort(byComparisons)` is wrong.
 */
export type LookProgress = {
  id: string;
  comparisons: number;
  distinctRaters: readonly string[];
};

export const isSettled = (l: LookProgress): boolean =>
  l.comparisons >= COMPARISONS_TO_SETTLE &&
  l.distinctRaters.length >= DISTINCT_RATERS_TO_SETTLE;

export const distinctRaterShortfall = (l: LookProgress): number =>
  Math.max(0, DISTINCT_RATERS_TO_SETTLE - l.distinctRaters.length);

export const comparisonShortfall = (l: LookProgress): number =>
  Math.max(0, COMPARISONS_TO_SETTLE - l.comparisons);

/**
 * Scheduling priority: distinct-rater shortfall first, comparisons as the
 * tie-break. Still only a *priority*, not the scheduler — the real thing has to
 * exclude raters who have already seen a look and can exhaust the eligible set.
 */
export function schedulingPriority(a: LookProgress, b: LookProgress): number {
  const d = distinctRaterShortfall(b) - distinctRaterShortfall(a);
  if (d !== 0) return d;
  return comparisonShortfall(b) - comparisonShortfall(a);
}

/**
 * Non-entrants can judge and are pure supply, which is why the designed
 * quota is 10 (temporarily overridden to 5 above, for test-scale sessions —
 * see QUOTA's own comment). Had judging been restricted to entrants only it
 * would have to be 15 — B's toll arithmetic without B's gate.
 *
 * REVERSED, DO NOT RE-PROPOSE: "15 is the lowest toll that settles" is wrong;
 * 14 gives 1.07×.
 */
export const QUOTA_IF_ENTRANTS_ONLY = 15;

/**
 * FOR JO: version A needs a live circuit-breaker. If vote-completion drops or
 * entry rate spikes, something has to give — house-supplied comparisons, a
 * raised quota, or a longer settlement window. This function says which lever
 * is needed, not how to pull it.
 */
export type Breaker = 'none' | 'house-comparisons' | 'raise-quota' | 'extend-window';

export function circuitBreaker(voteCompletionRate: number, entryRate: number): Breaker {
  const h = headroom(voteCompletionRate, entryRate);
  if (h >= 1.3) return 'none';
  if (h >= 1.0) return 'raise-quota';
  if (entryRate >= ENTRY_RATE_DANGER_ZONE) return 'house-comparisons';
  return 'extend-window';
}

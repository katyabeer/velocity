/**
 * THE CLOCK IS THE DESIGN. Locked decision 2.
 *
 *   07:00          yesterday's result lands
 *   07:00–20:00    job open — you build and enter
 *   20:00          job shuts. Nothing more can be entered
 *   20:00 →        everyone judges what came in (paired calls, JUDGING_QUOTA)
 *   overnight      settlement
 *   07:00          result
 *
 * Judging only opens AFTER entry closes, so nobody can see the field and then
 * enter. The anti-copying rule stops being a rule and becomes a consequence of
 * the schedule.
 *
 * This was a genuine fix to a genuine logical error and it is load-bearing. An
 * earlier version asked you to help settle yesterday while showing yesterday's
 * result at the top of the same screen, which cannot both be true.
 *
 * REVERSED, DO NOT RE-PROPOSE: judging yesterday's closed brief.
 */

export const RESULT_HOUR = 7;
export const CLOSE_HOUR = 20;

export type Phase = 'entry' | 'judging' | 'settling';

/** One styling job a day, identical for everyone. Three to five pieces, one
 *  entry, about five minutes. Sixty seconds can be a habit; ninety-plus is a
 *  chore. */
export const TARGET_SESSION_SECONDS = 60;

export function phaseAt(date: Date): Phase {
  const h = date.getHours();
  if (h >= RESULT_HOUR && h < CLOSE_HOUR) return 'entry';
  if (h >= CLOSE_HOUR) return 'judging';
  return 'settling';
}

export const canEnterAt = (date: Date): boolean => phaseAt(date) === 'entry';
export const canJudgeAt = (date: Date): boolean => phaseAt(date) === 'judging';

/**
 * THE NEXT 07:00, and everything that counts down to it.
 *
 * There is ONE day boundary in this product and this is it — the result lands,
 * the job opens, and the render allowances reset, all at the same hour. Two
 * different day boundaries in one app is a bug generator, so the render
 * allowance in domain/renders.ts delegates here rather than computing its own.
 */
export function nextResultAt(now: Date): Date {
  const at = new Date(now);
  at.setHours(RESULT_HOUR, 0, 0, 0);
  if (at <= now) at.setDate(at.getDate() + 1);
  return at;
}

/** Rounded UP, so "in 1 hour" never appears with fifty minutes left on it. */
export const hoursUntilResult = (now: Date): number =>
  Math.ceil((nextResultAt(now).getTime() - now.getTime()) / 3_600_000);

/** `7am`. One spelling of the hour, everywhere it is said out loud. */
export const RESULT_LABEL = `${RESULT_HOUR}am`;

/**
 * "Results in 11 hours" — the whole of what happens next, in three words.
 *
 * Falls back to the hour itself when the wait is long enough that a count of
 * hours stops being a countdown and starts being arithmetic: nobody reads
 * "in 23 hours" as sooner than "tomorrow at 7am", and the second is easier to
 * hold. Twelve is the crossover because it is the point where "later today"
 * stops being true.
 */
export function resultCountdown(now: Date): string {
  const h = hoursUntilResult(now);
  if (h > 12) return `Results tomorrow at ${RESULT_LABEL}`;
  return `Results in ${h} ${h === 1 ? 'hour' : 'hours'}`;
}

/**
 * TODAY'S ORDER IS FIXED, and was corrected once:
 *   1. yesterday's result  — it is the reason you came back, so it comes FIRST
 *   2. today's job         — the hero
 *   3. the month ahead     — low down
 *
 * On Day 1 the result act is ABSENT ENTIRELY — not an empty state, absent — so
 * the job card leads. Do not add a placeholder.
 */
export const TODAY_ACTS = ['yesterday', 'job', 'month-ahead'] as const;
export type TodayAct = (typeof TODAY_ACTS)[number];

/** What happened to you yesterday. Drives which result card Today shows. */
export type YesterdayState = 'entered' | 'judged-only' | 'missed' | 'none';

/**
 * THE CLOCK IS THE DESIGN. Locked decision 2.
 *
 *   07:00          yesterday's result lands
 *   07:00–20:00    job open — you build and enter
 *   20:00          job shuts. Nothing more can be entered
 *   20:00 →        everyone judges what came in (10 paired calls)
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

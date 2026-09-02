/**
 * Results — five named bands, cohort-relative, NEVER numeric.
 *
 * LOCKED DECISION 5. A number implies a precision that 20 comparisons cannot
 * carry, and it turns a review into a score. The result screen says
 * "Upper half", shows the ladder, and stops.
 *
 * Always relative to people who **started when you did**. `whatBeatYou` must
 * also be drawn from your own tenure group, or the day-one fairness fix undoes
 * itself in a single glance.
 */

export const BANDS = [
  { key: 'top', name: 'Top of the room', range: 'top 10%', from: 0, to: 0.1 },
  { key: 'upperQuarter', name: 'Upper quarter', range: '10–25%', from: 0.1, to: 0.25 },
  { key: 'upperHalf', name: 'Upper half', range: '25–50%', from: 0.25, to: 0.5 },
  { key: 'lowerHalf', name: 'Lower half', range: '50–75%', from: 0.5, to: 0.75 },
  { key: 'quiet', name: 'Quiet night', range: 'bottom 25%', from: 0.75, to: 1 },
] as const;

export type BandKey = (typeof BANDS)[number]['key'];
export type Band = (typeof BANDS)[number];

/** Below this, do not band at all — the cell is too small to mean anything. */
export const MIN_COHORT_CELL = 12;

/**
 * Percentile → band. `percentile` is 0 at the top of the room and 1 at the
 * bottom, matching the table above.
 *
 * Returns null when the cohort is too small to band. The caller must render an
 * honest "not enough of you yet" state rather than guessing a band — inventing
 * one is exactly what the You tab exists not to do.
 */
export function bandFor(percentile: number, cohortSize: number): Band | null {
  if (cohortSize < MIN_COHORT_CELL) return null;
  const p = Math.min(Math.max(percentile, 0), 1);
  return BANDS.find((b) => p < b.to) ?? BANDS[BANDS.length - 1]!;
}

export const bandByKey = (key: BandKey): Band => BANDS.find((b) => b.key === key)!;

/**
 * "Your calls" — of the pairs you judged this round (JUDGING_QUOTA), how many
 * went to the look that finished ahead.
 *
 * DIFFICULTY MATTERS: a pair that settled 90/10 is worth almost nothing, one
 * that settled 52/48 is worth a lot. Weight by how close the pair was.
 *
 * COMPUTED OVERNIGHT, NEVER SHOWN AT CALL TIME. Showing it live teaches people
 * to pick the popular option, which is the consensus-manufacturing the whole
 * design avoids.
 */
export type SettledPair = {
  /** Winning share, 0.5–1.0. 0.5 is a dead heat. */
  winnerShare: number;
  /** Did the user back the look that finished ahead? */
  backedWinner: boolean;
};

/** 1.0 for a coin toss, → 0 for a foregone conclusion. */
export const pairDifficulty = (winnerShare: number): number =>
  Math.max(0, 1 - (Math.min(Math.max(winnerShare, 0.5), 1) - 0.5) * 2);

export type CallsReadout = {
  correct: number;
  total: number;
  /** Difficulty-weighted accuracy, 0–1. The honest version of the number. */
  weighted: number;
  /** How they did on the three closest pairs in the round. */
  closestCorrect: number;
  closestTotal: number;
};

export function readCalls(pairs: readonly SettledPair[], closestCount = 3): CallsReadout {
  const total = pairs.length;
  const correct = pairs.filter((p) => p.backedWinner).length;

  const weightSum = pairs.reduce((acc, p) => acc + pairDifficulty(p.winnerShare), 0);
  const earned = pairs.reduce(
    (acc, p) => acc + (p.backedWinner ? pairDifficulty(p.winnerShare) : 0),
    0,
  );

  const closest = [...pairs].sort((a, b) => a.winnerShare - b.winnerShare).slice(0, closestCount);

  return {
    correct,
    total,
    weighted: weightSum === 0 ? 0 : earned / weightSum,
    closestCorrect: closest.filter((p) => p.backedWinner).length,
    closestTotal: closest.length,
  };
}

/**
 * Milestones — SIX, FIXED, AND THAT IS ALL THERE ARE.
 * No levels, no XP, no leaderboard (locked decision 7). A leaderboard makes the
 * room a place to beat rather than a place to read.
 */
export const MILESTONES = [
  { key: 'filed', name: 'Filed', hint: 'First entry' },
  { key: 'borrowed', name: 'Borrowed', hint: 'Someone took a piece' },
  { key: 'weekStraight', name: 'Week straight', hint: '7 days running' },
  { key: 'upperQuarter', name: 'Upper quarter', hint: 'Place in the top 25%' },
  { key: 'goodEye', name: 'Good eye', hint: '14 of 20 close calls' },
  { key: 'tenHands', name: 'Ten hands', hint: '10 different people' },
] as const;

export type MilestoneKey = (typeof MILESTONES)[number]['key'];

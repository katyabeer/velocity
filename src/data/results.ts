/**
 * YESTERDAY'S RESULT, IN ONE PLACE PER DAY.
 *
 * ─── WHY THIS FILE EXISTS ──────────────────────────────────────────────────
 * It used to be written twice, in full, with no constant shared between the
 * two. `ui/ResultCard.tsx` carried `'41 entered'`, `'The interview'`,
 * `'Upper half'`, `'6 of 7 close calls'` and `'Won by a red bag'`;
 * `today/result.tsx` carried `'Upper\nhalf'`, `active="upperHalf"`, `41`,
 * `'2 of 3'` and the red-bag sentence again. The card is the summary and the
 * screen is what opens when you tap it, so the two ALWAYS have to agree — and
 * nothing made them.
 *
 * That was survivable while there was one result to state. The returning state
 * (ACTIVE_DAY 2) needs a second, which would have meant eleven literals in two
 * files behind two day conditions.
 *
 * It also collapses the fifth hardcoded copy of `'The interview'` onto
 * `YESTERDAYS_BRIEF`, which data/challenges.ts has been asking for.
 *
 * ─── EVERYTHING HERE IS A FIXTURE ──────────────────────────────────────────
 * There is no per-look settled record (Jack's open question 5) and no cohort,
 * so none of these numbers is derived from anything the participant did. What
 * this file buys is that they are CONSISTENT fixtures.
 *
 * ⚠ INVARIANT 6: bands are named, never numeric, cohort-relative, minimum cell
 * 12. Both field sizes below clear it. Do not add a percentage or a placing.
 * ⚠ INVARIANT 9: `beatYou` reports what moved, not a level.
 */

import { YESTERDAYS_BRIEF, shortBriefName } from './challenges';
import { ACTIVE_DAY } from '@/config/testState';
import type { BandKey } from '@/domain/bands';

export type DayResult = {
  /**
   * The job it was, in its DISPLAY form — `shortBriefName(YESTERDAYS_BRIEF)`.
   * Named once in challenges.ts either way; see the note on `shortBriefName`
   * for why the headline cannot take the pool name verbatim.
   */
  job: string;
  /** How many entered. Context for the band, never a rank. */
  fieldSize: number;
  /** The kicker's first clause on the card. */
  kickPrefix: string;
  /** Band, three ways: the badge, the ladder's key, and the two-line display. */
  band: string;
  bandKey: BandKey;
  bandLines: string;
  bandNote: string;
  /** What beat you (invariant 9 — movement, not level). */
  beatYou: string;
  /** The `missed` state's badge: what won, when you did not enter. */
  wonBy: string;
  /** Of `JUDGING_QUOTA` pairs, how many you called the way the room did. */
  callsAhead: number;
  /** The closest pairs, as "n of m". */
  closestPairs: string;
  /** The `judged-only` state's badge. */
  closeCallsBadge: string;
  /** Did you back the look that won the room? */
  backedTheWinner: string;
};

/**
 * DAY 1 — unchanged, literal for literal, from the two files this replaces.
 *
 * ⚠ `closeCallsBadge` says seven close calls while `JUDGING_QUOTA` is five
 * pairs, so the two disagree. It is preserved AS IT WAS rather than corrected,
 * because Day 1 is signed off and this pass is not allowed to move it — and the
 * string is unreachable there anyway: day 1's `yesterday` is `'none'`, so
 * `ResultCard` returns null before any state is chosen. Day 2 below is written
 * coherently. Say if day 1's should be brought into line.
 */
const DAY_ONE: DayResult = {
  job: shortBriefName(YESTERDAYS_BRIEF),
  fieldSize: 41,
  kickPrefix: 'Your first job',
  band: 'Upper half',
  bandKey: 'upperHalf',
  bandLines: 'Upper\nhalf',
  bandNote:
    'Above the middle of people who started around when you did. Never a number — 20 comparisons can’t carry one.',
  beatYou:
    'Four of your five pieces were identical to the winner’s. The bag did it — theirs was red, yours was the tote.',
  wonBy: 'Won by a red bag',
  callsAhead: 3,
  closestPairs: '2 of 3',
  closeCallsBadge: '6 of 7 close calls',
  backedTheWinner: 'You backed it',
};

/**
 * DAY 2 — the returning state, five days in.
 *
 * ONE BAND ABOVE DAY 1, and that is the whole point of the second sitting: the
 * client sees Upper half on the Wednesday and Upper quarter on the Thursday. It
 * is also what earns the `upperQuarter` milestone honestly, rather than the
 * badge row being ticked by fiat (see MILESTONES in domain/bands.ts).
 *
 * The job is the autumn wedding — the brief they played on day 1 — because
 * `playedBriefs()` puts it first and `YESTERDAYS_BRIEF` reads from there. So
 * the second sitting opens by reporting on the look the client watched someone
 * build in the first.
 *
 * ⚠ THE CALLS DO NOT FLATTER. Four of five, and two of the three closest went
 * the other way, so the screen still has something to say that is not praise —
 * which is what keeps the `Good eye` milestone visibly unearned at 11 of 20.
 */
const DAY_TWO: DayResult = {
  job: shortBriefName(YESTERDAYS_BRIEF),
  fieldSize: 38,
  kickPrefix: "Yesterday's job",
  band: 'Upper quarter',
  bandKey: 'upperQuarter',
  bandLines: 'Upper\nquarter',
  bandNote:
    'Top quarter of people who started around when you did, and your best yet. Never a number — 20 comparisons can’t carry one.',
  beatYou:
    'The room moved on the shoes. The looks that finished ahead of you nearly all went flat; yours was the heel.',
  wonBy: 'Won by a flat loafer',
  callsAhead: 4,
  closestPairs: '1 of 3',
  closeCallsBadge: '4 of 5 close calls',
  backedTheWinner: 'You backed it',
};

export const dayResult = (): DayResult => (ACTIVE_DAY === 2 ? DAY_TWO : DAY_ONE);

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
  /**
   * ⚠ NO READER SINCE 13 Sep. It was the result card's kicker ("Yesterday's
   * job" / "Your first job"), which is now a fixed invitation — `See how you
   * did yesterday` — because the card stopped reporting the band. Kept because
   * it is the one string that distinguishes a first result from a later one,
   * and that distinction comes straight back the moment the card reports
   * anything again.
   */
  kickPrefix: string;
  /** Band, three ways: the badge, the ladder's key, and the two-line display. */
  band: string;
  bandKey: BandKey;
  bandLines: string;
  /**
   * ⟲ BOTH DAYS LOST A SECOND SENTENCE ON 13 Sep: "Never a number — 20
   * comparisons can't carry one." The COHORT clause is what survives, and it
   * has to — it is now the only place on the screen saying the band is
   * relative to people who started when you did, since the ladder's caption
   * went in the same pass.
   */
  bandNote: string;
  /** What beat you (invariant 9 — movement, not level). */
  beatYou: string;
  /** The `missed` state's badge: what won, when you did not enter. */
  wonBy: string;
  /** Of `JUDGING_QUOTA` pairs, how many you called the way the room did. */
  callsAhead: number;
  /**
   * ⚠ NO READER SINCE 13 Sep — the "On the three closest pairs" row came off
   * the results screen. Kept with `backedTheWinner` below: they are the only
   * two figures describing how you READ the room rather than how you placed,
   * which is the half of the result the screen still names in its kicker
   * ("your calls").
   */
  closestPairs: string;
  /** The `judged-only` state's badge. */
  closeCallsBadge: string;
  /** Did you back the look that won the room? ⚠ No reader — see `closestPairs`. */
  backedTheWinner: string;
  /**
   * ⚠ WHICH PHOTOGRAPHS, as indices into `yesterdayLooks()` — the pool of the
   * job this result is about, NOT tonight's field. See that accessor in
   * data/looks.ts for why the two are different on the returning state.
   *
   * They live on the fixture because the RESULT CARD's thumbnail and the
   * results screen's plate must be the SAME PHOTOGRAPH (Katya, 13 Sep: "it
   * should be the same one that is shown next to the Upper quarter heading").
   * The card is the summary of the screen; two different looks across a single
   * tap says the app does not know which one was yours.
   */
  yourLookIndex: number;
  winnerLookIndex: number;

  /* ── how the room received it, once the magazine surfaced it ─────────────
     Katya, 14 Sep: "throw in the number of likes it got — those looks go into
     the magazine too — reactions it received, and how many people took/saved a
     garment from their look."

     ⚠ `takers` IS NOT A BREACH OF INVARIANT 13. "Copy-minting — the owner
     loses nothing and is never told" is about there being no LOSS and no
     market: taking mints a copy, so nothing leaves your wardrobe and nobody is
     told they were robbed. The aggregate is already a designed, celebrated
     signal in four other places — the `Borrowed` milestone, You's "People who
     took your pieces", the archive's "5 took a piece", and `EarnedRow`, which
     is literally how tokens arrive. This is the same figure on the screen the
     look is being reported on. */

  /** The heart. ⚠ A SUBSET of `reactions`, not a separate tally — the like is
   *  `thumbs_up` in the nine-value vocabulary (see domain/reactions.ts), so
   *  this number must always be the smaller of the two or the pair reads as
   *  double counting. */
  likes: number;
  /** Every reaction the look drew, the heart included. */
  reactions: number;
  /** DISTINCT PEOPLE who took a garment out of it, not pieces taken. */
  takers: number;
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
  bandNote: 'Above the middle of people who started around when you did.',
  beatYou:
    'Four of your five pieces were identical to the winner’s. The bag did it — theirs was red, yours was the tote.',
  wonBy: 'Won by a red bag',
  callsAhead: 3,
  closestPairs: '2 of 3',
  closeCallsBadge: '6 of 7 close calls',
  backedTheWinner: 'You backed it',
  /**
   * ⟲ WAS `JUDGING_LOOKS[3]` for yours, computed in today/result.tsx. That is
   * `look_d1_judge_13` — a `weak`-tier biker jacket, poplin shirt and straight
   * jean, which is not a wedding look at all, sitting under a heading about an
   * autumn wedding and a band of Upper half. Index 6 is the camel coat, brown
   * dress and suede knee boots on a country-house drive, and index 0 (the
   * winner) is green velvet under a camel coat among the guests.
   *
   * Nothing on screen changes for day 1 — its result act does not render
   * (`yesterday: 'none'`) and `FORCE_RESULTS_READY` is the only way to reach
   * it — but the two days report on the SAME brief, so there is no reason for
   * them to name different photographs.
   */
  yourLookIndex: 6,
  winnerLookIndex: 0,
  likes: 6,
  reactions: 11,
  takers: 3,
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
  bandNote: 'Top quarter of people who started around when you did, and your best yet.',
  beatYou:
    'The room moved on the shoes. The looks that finished ahead of you nearly all went flat; yours was the heel.',
  wonBy: 'Won by a flat loafer',
  callsAhead: 4,
  closestPairs: '1 of 3',
  closeCallsBadge: '4 of 5 close calls',
  backedTheWinner: 'You backed it',
  /** The same two frames as day 1 — it is the same job. */
  yourLookIndex: 6,
  winnerLookIndex: 0,
  /* ⚠ IN STEP WITH THE OTHER TWO FIXTURES THAT REPORT ON THIS LOOK.
     `YOU_DAY_TWO_POSTS[0]` gives the wedding 14 likes and `ARCHIVE_DAY_TWO`
     says "5 took a piece" — so these are those numbers, not new ones. Change
     one and change all three, or the same look has two histories. */
  likes: 14,
  reactions: 27,
  takers: 5,
};

export const dayResult = (): DayResult => (ACTIVE_DAY === 2 ? DAY_TWO : DAY_ONE);

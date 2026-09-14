/**
 * The month's twelve jobs (a7).
 *
 * THE AVAILABILITY FIX: publish the month's jobs, withhold the order. Browsing
 * gets a purpose without becoming shopping for tonight. Gap signals point at the
 * MONTH, never at today — so the invariant survives.
 *
 * The handover is blunt about this one: "A can't ship without this."
 */

import { ACTIVE_DAY } from '@/config/testState';

export type Challenge = { name: string; note: string; open?: boolean };

/**
 * The pool, in order. `open` is NOT set here any more — see `CHALLENGES` below,
 * which moves the flag according to which day is booted. The ORDER is still the
 * schedule and moving an entry still moves the month.
 */
const POOL: readonly Challenge[] = [
  {
    name: 'An autumn wedding in the countryside',
    note: 'Cold field, warm marquee. Dress for both.',
  },
  { name: 'The interview', note: 'For a job you are not sure you want.' },
  /* ── THE NEXT TWO ARE THE SCHEDULE, not just pool entries (Katya, 4 Sep) ──
     `nextChallenge()` reads this list in order, so whatever sits here is what
     the locked preview card on Today names as tomorrow's job. It used to land
     on "Drinks with your ex and their new partner", which now sits further
     down the pool. Move these and you move the schedule. */
  {
    name: 'Your first day at the new job',
    note: 'Open-plan office, and nobody has told you the dress code. Show some personality, but you want to look like you belong there.',
  },
  {
    name: 'New York Fashion Week, outside the shows',
    note: 'Street photographers on every corner and everyone is dressed to be seen. This is the day to go big.',
  },
  { name: 'One bold piece', note: 'Everything else has to behave.' },
  { name: 'Drinks with your ex and their new partner', note: 'Effortless. Or at least, looks it.' },
  { name: 'Monochrome', note: 'One colour. Prove it is not boring.' },
  { name: 'The airport', note: 'Nine hours, two climates, one outfit.' },
  { name: 'Dress it down', note: 'Take something formal somewhere it should not go.' },
  { name: 'First date', note: 'Try, but not visibly.' },
  { name: 'The orange coat', note: 'We are giving you the coat. Good luck.' },
  { name: 'Nothing new', note: 'Only pieces you have already worn this month.' },
  { name: 'Sunday, nowhere', note: 'Nobody will see it. Does that change anything?' },
  { name: 'The oatmeal coat', note: 'Yours to keep. Also, oatmeal.' },
];

/* ══════════════════════════════════════════════════════════════════════════
   WHICH JOB IS TONIGHT'S, AND WHICH ONES ARE BEHIND YOU
   ══════════════════════════════════════════════════════════════════════════

   On day 1 the open job is the autumn wedding, because every d1 photograph is
   styled for it (see data/looks.ts — the brief moved rather than the captions,
   3 Sep, since the photographs are the thing that cannot be reshot).

   ⚠ DAY 2 HAD TO MOVE IT, and for exactly the same reason. The returning-user
   state is the SAME PERSON five days later, so tonight's job cannot be the one
   they played on day 1 — and the d2 judging photography is an office lobby,
   tailoring and a visitor lanyard, which is unmistakably "Your first day at the
   new job". That is also the job day 1's locked preview card already promises
   as tomorrow's, so the two states agree without anything being contrived.

   The d2 EDITORIAL frames (`look_d2_beat_*`) are the wedding — a country house
   and a marquee — which is why they are House coverage of yesterday's job
   rather than entries in tonight's.

   Established (day 3) is untouched and stays on the wedding. */

/** Named once, because three separate things have to agree on it. */
const NEW_JOB = 'Your first day at the new job';
const WEDDING = 'An autumn wedding in the countryside';

const openName = (): string => (ACTIVE_DAY === 2 ? NEW_JOB : WEDDING);

/**
 * The month's jobs with tonight's flagged. Derived rather than written into
 * `POOL` so the open job can move per day without the LIST order moving —
 * `nextChallenge()` walks this in order and the order is the schedule.
 */
export const CHALLENGES: readonly Challenge[] = POOL.map((c) =>
  c.name === openName() ? { ...c, open: true } : c,
);

/**
 * ⚠ THE JOBS ALREADY BEHIND YOU, and the source of `YESTERDAYS_BRIEF`. Day 2
 * carries five of them, which is what makes that state "a few days in" rather
 * than "the second evening" — and the same names carry the looks archive and
 * the You screen's post list, so the whole returning state tells one story
 * rather than three. They are all excluded from `nextChallenge()`.
 *
 * ORDER IS MOST-RECENT-FIRST. `[0]` is yesterday's, which is the one the result
 * card reports on.
 */
export const playedBriefs = (): readonly string[] =>
  ACTIVE_DAY === 2
    ? [WEDDING, 'The airport', 'One bold piece', 'Monochrome', 'Sunday, nowhere']
    : /* ⚠ EMPTY ON DAYS 1 AND 3, and it has to be empty rather than carry
         'The interview'. Day 1's user has played nothing — the upcoming list
         renders off this, so one entry here would delete a job from day 1's
         month. The Interview is excluded from `nextChallenge()` by
         `YESTERDAYS_BRIEF` instead, which is the separate thing it always
         was: yesterday's job in the ESTABLISHED fixture, not a history. */
      [];

export const openChallenge = (): Challenge => CHALLENGES.find((c) => c.open) ?? CHALLENGES[0]!;

/**
 * ⚠ TOMORROW'S JOB, AND IT REVEALS THE ORDER — which is the one thing this
 * file's header says is deliberately withheld.
 *
 * "Publish the month's jobs, withhold the order. Browsing gets a purpose
 * without becoming shopping for tonight." Naming tomorrow's job the evening
 * before hands someone thirteen hours to go and acquire the right pieces for
 * it, which is the same failure the fix exists to prevent, displaced by a day.
 *
 * Katya asked for the preview card on 4 Sep (a13's locked next-challenge
 * card). Built as asked, with the reveal behind ONE CONSTANT so the position
 * is one line rather than a hunt: set `REVEAL_NEXT_BRIEF` to false and the
 * card keeps its lock and its start time but stops naming the job.
 *
 * `CHALLENGES[1]` is a prototype convenience, not a schedule. There is no
 * ordering model — the real thing draws tomorrow's job from a rota nobody can
 * see, which is the whole point.
 */
export const REVEAL_NEXT_BRIEF = true;

/**
 * YESTERDAY'S JOB, named once.
 *
 * ⚠ IT IS ALREADY HARDCODED IN FOUR PLACES — `ui/ResultCard.tsx` (three
 * times), `today/result.tsx`, and both archive fixtures in `data/inventory.ts`
 * — which is how `nextChallenge` came to offer it as TOMORROW'S job on its
 * first run: `CHALLENGES[1]` is The interview, and The interview is the one
 * already played. Declared here so the exclusion below has something true to
 * exclude. The four copies should collapse onto this, but that is a tidy-up
 * for its own pass, not a side effect of the preview card.
 */
/**
 * ⚠ TWO DIFFERENT THINGS LIVED IN ONE CONSTANT UNTIL 13 Sep, and separating
 * them is what keeps day 1 intact.
 *
 * On days 1 and 3 this is a FIXTURE — 'The interview' is the job the result
 * card and the archive fixtures report on, and the only other thing it does is
 * keep `nextChallenge()` from offering yesterday's job as tomorrow's. Day 1's
 * user has genuinely played nothing, so it is not a history.
 *
 * On day 2 it IS a history: the first entry of `playedBriefs()`, which is the
 * autumn wedding — the job the returning user played on day 1. That is what
 * makes the second sitting open by reporting on the look the client watched
 * someone build in the first.
 */
export const YESTERDAYS_BRIEF = playedBriefs()[0] ?? 'The interview';

/**
 * ⚠ THE SAME JOB, SHORT ENOUGH TO SET IN A HEADLINE.
 *
 * `YESTERDAYS_BRIEF` has to be the POOL NAME, exactly, because
 * `nextChallenge()` excludes by it. But the result card sets that name in 26px
 * Archivo Black, and "An autumn wedding in the countryside" is two full lines
 * there — on a card whose other three elements are a kicker, a badge and a
 * chevron, it was the whole card. Day 1 never had the problem: "The interview"
 * is one line.
 *
 * So the display name is separate, and only the jobs whose pool name is a
 * sentence need an entry. `TONIGHTS_BRIEF.shortName` is the same idea for
 * tonight's.
 */
const SHORT_NAMES: Record<string, string> = {
  'An autumn wedding in the countryside': 'The autumn wedding',
  'Your first day at the new job': 'The new job',
  'New York Fashion Week, outside the shows': 'Fashion week',
};

export const shortBriefName = (name: string): string => SHORT_NAMES[name] ?? name;

/**
 * The first job that is neither open nor already played. Not `CHALLENGES[1]`,
 * which was the bug: the card offered yesterday's job as tomorrow's, directly
 * beneath the result card reporting how it went.
 */
export const nextChallenge = (): Challenge => {
  const behind = [...playedBriefs(), YESTERDAYS_BRIEF];
  return CHALLENGES.find((c) => !c.open && !behind.includes(c.name)) ?? CHALLENGES[1]!;
};

/**
 * The month's jobs MINUS the ones already behind you — what the upcoming list
 * renders. Tonight's open job stays in, because it is the one the reader is
 * being sent to.
 *
 * ⚠ Day 1 gets the whole pool, unchanged: `playedBriefs()` is empty there.
 * Day 2 drops five, which is what stops the list offering the autumn wedding
 * as something coming up on the same evening the result card reports how it
 * went.
 */
export const upcomingChallenges = (): readonly Challenge[] => {
  const behind = playedBriefs();
  return CHALLENGES.filter((c) => c.open || !behind.includes(c.name));
};

/**
 * Tonight's brief, as the builder, Today and the judging round all need it.
 *
 * CHANGED 3 Sep 2026 (Katya) — it was "drinks with your ex and their new
 * partner". The AW26 delivery's looks are every one of them styled for an
 * autumn wedding (`occasion` in `delivery_sheet_looks.csv`), so the old brief
 * put a caption in front of participants that the photograph beneath it
 * contradicted. data/looks.ts flagged exactly this; the brief moved rather than
 * the captions, because the photographs are the thing that cannot be reshot.
 *
 * `note` is the one-line description the first-run screen and the builder both
 * show. Keep it to one line — it is read while someone is deciding, not after.
 */
const WEDDING_BRIEF = {
  title: 'An autumn wedding in the countryside.',
  note: 'Cold field, warm marquee. Dress for both, and don’t upstage anyone.',
  /**
   * The first sentence only. Onboarding's first-challenge card uses this
   * (Katya, 7 Sep): that screen is read while someone decides whether to
   * start, and the second sentence is detail they meet in the builder, where
   * the full note sits above the grid for the whole session.
   *
   * ⚠ THIS BRIEF NOW HAS THREE NOTES. `note` here, this, and
   * `CHALLENGES[0].note` ("Cold field, warm marquee. Dress for both.") on the
   * upcoming-challenges list. Three strings for one job, and the list's is not
   * derived from either of the others — so a wording change has to be made in
   * three places or the screens disagree. Worth collapsing; same class as the
   * brief/job/challenge vocabulary sweep.
   */
  shortNote: 'Cold field, warm marquee.',
  shortName: 'The autumn wedding',
} as const;

/**
 * DAY 2's JOB — the office, because that is what the d2 judging photography is
 * (see the note above `CHALLENGES`). Same four fields, so every one of the five
 * modules reading `TONIGHTS_BRIEF` is untouched.
 */
const NEW_JOB_BRIEF = {
  title: 'Your first day at the new job.',
  note: 'Open-plan office, and nobody has told you the dress code. Show some personality, but you want to look like you belong there.',
  shortNote: 'Nobody has told you the dress code.',
  shortName: 'The new job',
} as const;

/**
 * Tonight's brief for whichever day is booted. A CONST, not a function, because
 * five modules read it and two of them do so at module scope — and `ACTIVE_DAY`
 * is a build constant, so there is nothing to recompute.
 */
export const TONIGHTS_BRIEF: typeof WEDDING_BRIEF | typeof NEW_JOB_BRIEF =
  ACTIVE_DAY === 2 ? NEW_JOB_BRIEF : WEDDING_BRIEF;

/**
 * ══ THE CLOSED OCCASION AXIS AND THE FAKE TAG BANK ARE BOTH GONE, 4 Sep ══
 *
 * `OCCASIONS` (nine words, one choosable) and `FREE_TAG_BANK` (five canned
 * strings standing in for a keyboard the prototype didn't have) were deleted
 * when Katya reversed D-brief invariant 8. Create's tag step is now pure free
 * text — domain/tags.ts carries the mechanics, the reversal, and the three
 * costs that were named and accepted, one of which is that the occasion axis
 * stops aggregating: `wedding`, `weddingvibes` and `bigday` are three tags.
 *
 * That also settles JACK'S OPEN QUESTION 3 — free tags, yes or no — in the
 * OPPOSITE direction to his standing suggestion ("decoration only"). They are
 * real, stored, self-authored text. What they are still NOT is navigation:
 * tags are not clickable and not filterable in MVP, and they must never reach
 * the feed sampler, because a tag filter is a sort and invariant 7 is
 * sample-don't-sort.
 *
 * `MAX_FREE_TAGS` was 3 and is now `MAX_TAGS` = 5, in domain/tags.ts, next to
 * the rest of the rules it belongs with.
 */

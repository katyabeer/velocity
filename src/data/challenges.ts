/**
 * The month's twelve jobs (a7).
 *
 * THE AVAILABILITY FIX: publish the month's jobs, withhold the order. Browsing
 * gets a purpose without becoming shopping for tonight. Gap signals point at the
 * MONTH, never at today — so the invariant survives.
 *
 * The handover is blunt about this one: "A can't ship without this."
 */

export type Challenge = { name: string; note: string; open?: boolean };

export const CHALLENGES: readonly Challenge[] = [
  {
    name: 'An autumn wedding in the countryside',
    note: 'Cold field, warm marquee. Dress for both.',
    open: true,
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
export const YESTERDAYS_BRIEF = 'The interview';

/**
 * The first job that is neither open nor already played. Not `CHALLENGES[1]`,
 * which was the bug: the card offered yesterday's job as tomorrow's, directly
 * beneath the result card reporting how it went.
 */
export const nextChallenge = (): Challenge =>
  CHALLENGES.find((c) => !c.open && c.name !== YESTERDAYS_BRIEF) ?? CHALLENGES[1]!;

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
export const TONIGHTS_BRIEF = {
  title: 'An autumn wedding in the countryside.',
  note: 'Cold field, warm marquee. Dress for both, and don’t upstage anyone.',
  shortName: 'The autumn wedding',
} as const;

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

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
  { name: 'Drinks with your ex and their new partner', note: 'Effortless. Or at least, looks it.' },
  { name: 'One bold piece', note: 'Everything else has to behave.' },
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

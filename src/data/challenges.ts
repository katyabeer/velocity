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

/** Where you'd wear it — the Create tag step. Create keeps its tags because a
 *  freestyle post has no brief. */
export const OCCASIONS = [
  'Work',
  'Wedding',
  'Airport',
  'Night out',
  'First date',
  'Funeral',
  'School run',
  'Festival',
  'Nowhere',
] as const;

/**
 * Free-text tags, faked as a bank in the prototype because there is no keyboard
 * in a static page.
 *
 * JACK'S OPEN QUESTION 3 — free tags, yes or no. Saying yes reverses brief
 * invariant 8, buys a moderation stack, and costs tag comparability. The
 * standing suggestion is: DECORATION ONLY — never used for filtering, sorting
 * or the dataset. Wire the real input to that contract or leave it out.
 */
export const FREE_TAG_BANK = [
  'bad weather',
  'my mum would hate it',
  'tuesday energy',
  'stolen from a film',
  'too much on purpose',
] as const;

export const MAX_FREE_TAGS = 3;

/**
 * FIXTURES FOR THE `You` SCREEN IN THE RETURNING STATE (ACTIVE_DAY 2).
 *
 * ⟲ REWRITTEN 13 Sep, and the state it describes moved with it.
 *
 * It used to be "day 2 of a life": two entries settled, one freestyle post, six
 * reactions from five people, one person having taken a piece. That was
 * Katya's 7 Sep ask — mock day 2 as her file's day 3 — and it was right for a
 * prototype whose second test state was the second evening.
 *
 * The second state is now the SECOND SITTING: the clients see Day 1, then the
 * same URL the next day, and what they should find is someone five days in.
 * Katya, 13 Sep: "Update the You section to make it look like they've been
 * using the app for a few days and submitted/liked/engaged with a lot of
 * content. The summary about them needs to change and talk about their style
 * choices. The count and the badges — unlock a few."
 *
 * ─── THE NUMBERS ARE CHOSEN AGAINST THE THRESHOLDS, NOT FOR EFFECT ─────────
 * `TIPS` in domain/you.ts gates `Just for you` on looks >= 10, looksSettled
 * >= 10 and closeCallsJudged >= 20 — and `qualifyingTips` returns NOTHING if
 * the only passing tip is a Weakness. So a state that wants that section to
 * appear has to clear all three, and the rollup in you/index.tsx does. Picking
 * "about ten looks" by feel would have left the most expensive section on the
 * page silently absent.
 *
 * ⚠ IT IS STILL A FIXTURE AND IT IS STILL WIRED TO NOTHING. On day 2 the real
 * stores hold six archive rows and no reactions, because there is no server.
 * Two consequences worth knowing before a session:
 *   · a participant who enters a look on day 2 does not see it in this list
 *   · the numbers do not move, so "34 reactions" is 34 all evening
 * Day 1 is entirely real — enter a look there and every figure moves.
 */

import type { Post } from '@/ui/PostRow';

/* ══════════════════════════════════════════════════════════════════════════
   REACTIONS — the animated chart
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Seven days, oldest first, and a FIXED window — see ui/ReactionsChart.tsx for
 * why that matters (filling in reads as progress rather than as the chart
 * changing size, and a quiet day is visibly a quiet day).
 *
 * Five days in means the two oldest are still before the account existed, and
 * they stay as zeros because a zero day is a real day. Then it builds.
 *
 * ⚠ THIS SERIES MUST SUM TO `reactionsReceived` IN THE ROLLUP. The chart's own
 * header counts the series and the Stats grid below prints the stat, so if they
 * drift the same screen shows two different totals a thumb-scroll apart — so
 * the rollup reads `YOU_DAY_TWO_REACTIONS_TOTAL` below instead of restating it.
 * Change this array and the stat follows. 2+5+4+9+14 = 34.
 */
export const YOU_DAY_TWO_REACTIONS = [0, 0, 2, 5, 4, 9, 14] as const;

/**
 * ⚠ DERIVED, SO THE TWO NUMBERS CANNOT DRIFT. The rollup's
 * `reactionsReceived` reads this rather than restating 34 — the chart's header
 * counts the series itself and the Stats grid prints the stat, and they sit one
 * scroll apart on the same screen, so a hand-written total is a contradiction
 * waiting for someone to edit one array. ReactionsChart.tsx has carried the
 * warning since it was built ("its series and `reactionsReceived` are two
 * separate numbers that must stay in step — derive one from the other when
 * real reaction data exists"). This is that, for the fixture.
 */
export const YOU_DAY_TWO_REACTIONS_TOTAL: number = YOU_DAY_TWO_REACTIONS.reduce<number>(
  (a, b) => a + b,
  0,
);

/** Same length as the series. The last one is today. */
export const YOU_DAY_TWO_DAYS = ['—', '—', 'mon', 'tue', 'wed', 'yest', 'today'] as const;

export const YOU_DAY_TWO_CAPTION = 'Thirty-four so far, from nineteen people. Yesterday was your biggest day.';

/* ══════════════════════════════════════════════════════════════════════════
   THE SUBMISSIONS GRAPH
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * "Show a graph for how their own submissions (via Challenges and Create
 * freestyle) are performing" (Katya, 13 Sep).
 *
 * TWO SERIES, NOT ONE BLENDED LINE, because the two are not the same
 * measurement: a brief entry is judged against a brief by the room, and a
 * freestyle post is not judged at all. Averaging them would answer a question
 * nobody asked. `Trend` takes `second` for exactly this — see ui/cards.tsx.
 *
 * ⚠ NOT PLACINGS, AND NOT A SCORE. Invariant 6 is named bands, never numbers,
 * and invariant 12 rules out anything that reads as a ladder. These are
 * REACTIONS PER SUBMISSION — a count of what the room said, which is the one
 * figure on this screen that is allowed to be a figure (see REACTIONS_CAPTION
 * in domain/you.ts). The chart draws no axis and prints no numbers; the caption
 * carries the meaning.
 *
 * One value per day, the five days behind today, oldest first. The earliest
 * has no freestyle post — the second render allowance went unused — which is a
 * zero rather than a gap.
 */
export const YOU_DAY_TWO_SUBMISSIONS = {
  challenge: [3, 5, 2, 8, 11] as const,
  freestyle: [0, 2, 4, 3, 6] as const,
  /**
   * ⟲ WAS `d1…d5`, WHICH BROKE WHEN THE TENURE MOVED TO DAY 6 — ordinal ticks
   * under a header reading "day 6" invite the question of where day 6 went,
   * and the answer is boring: today's only filing is the saved set that never
   * generated, so it has no reactions to plot.
   *
   * Labelled by RECENCY instead, which is the same vocabulary the reactions
   * chart above uses ('yest', 'today') and does not have to be kept in step
   * with `dayNumber`.
   */
  days: ['5d', '4d', '3d', '2d', 'yest'] as const,
  caption:
    'Reactions per submission, day by day. Your brief entries are getting a stronger read than your free posts — and both are climbing.',
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   THE POSTS
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * SIX, newest first, which is the order the archive uses. They are the same
 * jobs as `playedBriefs()` in data/challenges.ts and the same rows as
 * `ARCHIVE_DAY_TWO` in data/inventory.ts, so the three screens that list a
 * history all list the SAME history.
 *
 * ⚠ `read` IS A REACTION WORD IN EVERY CASE, or null. ui/PostRow.tsx enforces
 * the vocabulary and the reason is on the do-not-re-propose list: `brave` and
 * `sharp` were cut on 4 Sep because they belong to the OLD register list, so
 * the screen could report the room saying something out of words it does not
 * have.
 *
 * ⚠ AND `band` IS A BAND NAME OR `not scored`. Never a number, never a
 * placing — invariant 6. Freestyle is `not scored` because nothing settles a
 * look nobody was briefed for.
 *
 * `photo` indexes `RENDERED` in ui/RenderedLook.tsx, which is the day-2
 * stand-in set. Spread across all five so the list is not the same photograph
 * six times.
 */
export const YOU_DAY_TWO_POSTS: readonly Post[] = [
  { title: 'The autumn wedding', kind: 'challenge', read: 'iconic', band: 'Upper quarter', likes: 14, photo: 0 },
  { title: 'Freestyle', kind: 'freestyle', read: 'bold', band: 'not scored', likes: 9, photo: 1 },
  { title: 'The airport', kind: 'challenge', read: 'fresh', band: 'Upper half', likes: 5, photo: 2 },
  { title: 'One bold piece', kind: 'challenge', read: 'creative', band: 'Lower half', likes: 3, photo: 3 },
  { title: 'Monochrome', kind: 'challenge', read: 'fresh', band: 'Upper half', likes: 2, photo: 4 },
  { title: 'Sunday, nowhere', kind: 'freestyle', read: null, band: 'not scored', likes: 1, photo: 2 },
];

/* ══════════════════════════════════════════════════════════════════════════
   THE INSIGHT
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * THE CHEAP KIND OF INSIGHT, and that is why it can exist here at all — her
 * note: "counting the user's own wardrobe. No cohort maths, no vote history.
 * It's the only AI insight that can honestly exist by day 3, and it's the one
 * that drives a real action."
 *
 * ⟲ REWRITTEN for the thirty-piece wardrobe. It used to name `the wool coat`,
 * `the grey trouser` and `the black knit` — all three of them legacy prototype
 * names that the AW26 catalogue does not carry, so the insight named pieces
 * that could not be shown.
 *
 * ⚠ EVERY FIGURE BELOW IS CHECKABLE AGAINST `WARDROBE_DAY_TWO` in
 * data/inventory.ts, and that is the whole point of an insight that claims to
 * be counting your own wardrobe: five, four and three are those pieces' real
 * `worn` values, and eight is the number of `worn: 0` rows. The first draft
 * said "in most of your six looks" against a rollup reporting ten, and "six
 * things" against eight — which is the failure mode this card is most exposed
 * to, because it is the one panel on the screen that sounds derived.
 */
export const YOU_DAY_TWO_INSIGHT = {
  kick: 'from your own looks',
  title: 'Three pieces are doing the work',
  body: 'The black fine turtleneck has been out five times, the funnel neck coat four and the crisp poplin shirt three — more than anything else you own. Eight things have never been out at all.',
  cta: 'Find something to go with them →',
} as const;

/**
 * Typed tags rank ALONGSIDE these rather than replacing them, so the section
 * still moves if the participant posts one. See `topTags` in domain/you.ts.
 *
 * Five days of free posts, so there are more of them than day 2 had — and the
 * repeats are the point: `topTags` counts, so a tag used twice outranks one
 * used once, which is what makes "your words" a reading rather than a list.
 */
export const YOU_DAY_TWO_TAGS = [
  'tailoring',
  'quiet',
  'tailoring',
  'monochrome',
  'countryside',
  'quiet',
  'tailoring',
  'brown',
  'quiet',
  'layering',
] as const;

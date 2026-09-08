/**
 * DAY-2 FIXTURES FOR THE `You` SCREEN.
 *
 * Katya, 7 Sep: "For Day 2 in our app please mock data and display what is
 * suggested for Day 3 in the attached file." So the app's Day 2 shows her
 * mock's day-3 state — two entries settled, one freestyle post, six reactions
 * from five people, one person having taken a piece, and the first insight.
 *
 * ⚠ THIS IS A FIXTURE AND IT IS WIRED TO NOTHING. On day 2 the real stores
 * hold one archive row and no reactions, because the prototype has no server
 * and nothing has actually happened. These numbers exist so the PROGRESSION
 * is demonstrable in a moderated session — day 1 empty, day 2 forming — which
 * is what she asked to see. Nothing here is derived and nothing here responds
 * to what the participant does.
 *
 * Two consequences worth knowing before a session:
 *   · a participant who enters a look on day 2 does not see it in this list
 *   · the numbers do not move, so "6 reactions" is 6 all evening
 * Day 1 is entirely real, and Established already had its own fixtures.
 *
 * The reaction series is deliberately shaped like her mock's: a fixed
 * seven-day window with two days carrying anything, so the chart reads as a
 * week with two live days in it rather than as a full graph.
 */

import type { Post } from '@/ui/PostRow';

/** Seven days, oldest first. Day 2 of a life means five of them are before
 *  the account existed — they are zeros, and a zero day is a real day. */
export const YOU_DAY_TWO_REACTIONS = [0, 0, 0, 0, 0, 4, 2] as const;

/** Same length as the series. The last one is today. */
export const YOU_DAY_TWO_DAYS = ['—', '—', '—', '—', '—', 'yest', 'today'] as const;

export const YOU_DAY_TWO_CAPTION = 'Six so far, from five people.';

/**
 * Newest first, which is the order the archive uses. `read` is a REACTION
 * WORD in every case — see the warning in ui/PostRow.tsx.
 */
export const YOU_DAY_TWO_POSTS: readonly Post[] = [
  { title: 'Airport', kind: 'challenge', read: 'bold', band: 'Upper half', likes: 3, photo: 0 },
  { title: 'Interview', kind: 'challenge', read: 'fresh', band: 'Upper half', likes: 2, photo: 1 },
  { title: 'Freestyle', kind: 'freestyle', read: 'fresh', band: 'not scored', likes: 1, photo: 2 },
];

/**
 * THE FIRST INSIGHT, AND IT IS THE CHEAP KIND — her note: "counting the user's
 * own wardrobe. No cohort maths, no vote history. It's the only AI insight
 * that can honestly exist by day 3, and it's the one that drives a real
 * action."
 *
 * That is why it is here and `Just for you` is still absent: the tips in
 * domain/you.ts need results behind them, and this needs only what you own.
 */
export const YOU_DAY_TWO_INSIGHT = {
  kick: 'from your own looks',
  title: 'Three pieces are doing the work',
  body: 'The wool coat, the grey trouser and the black knit are in all three of your looks. Five things you own haven’t been out yet.',
  cta: 'Find something to go with them →',
} as const;

/** Typed tags rank alongside these, so the section still moves if the
 *  participant posts one. See `topTags` in domain/you.ts. */
export const YOU_DAY_TWO_TAGS = ['autumnvibe', 'countryside', 'quiet'] as const;

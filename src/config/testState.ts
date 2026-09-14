/**
 * ════════════════════════════════════════════════════════════════════════
 *  THE ONE CONSTANT YOU EDIT TO CHANGE WHICH TEST STATE THE APP BOOTS IN
 * ════════════════════════════════════════════════════════════════════════
 *
 * The HTML prototype had a HUD side panel with Day 1 / Day 2 / Established
 * buttons. That was deliberately NOT ported: it sat next to the prototype and a
 * participant would read it (open question E). Here the seed state is a build
 * constant instead.
 *
 * Change ACTIVE_DAY, save, and Fast Refresh reboots the app into that state.
 *
 *   1  brand new       onboarding from slide 1, EMPTY wardrobe, no result act
 *   2  returning       FIVE DAYS IN — see below. Skips onboarding, yesterday's
 *                      result is their best yet, ~30 pieces, 6 looks, 3 badges
 *   3  established     skips onboarding, 96 pieces, 9 looks, all five You sections
 *
 * If you want in-session switching back for a moderated session, add it as a
 * dev-only overlay gated on __DEV__ — not as a panel beside the phone.
 *
 * ════════════════════════════════════════════════════════════════════════
 *  ⚠ DAY 2 IS THE SECOND SITTING, AND IT IS NOT "THE NEXT EVENING"
 * ════════════════════════════════════════════════════════════════════════
 *
 * Katya, 13 Sep. The prototype is shown to Frame 23 twice: Day 1 first, then
 * the SAME URL the following day, "to see what the future of the app may look
 * like". Nothing in this app persists — no AsyncStorage, no `persist`, no
 * localStorage — so the second sitting is a different SEED, not a different
 * app, and the switch is the one line below.
 *
 * Slot 2 was repurposed rather than a fourth added. It was already the fixture
 * lane (`seeded = day === 2` on You, `inventoryDayTwo`, `ARCHIVE_DAY_TWO`,
 * `YOU_DAY_TWO_*`), and `DayConfig` is a UNION of these three literal shapes,
 * so a fourth member would have forced a third answer out of every
 * `day === 2` / `day >= 3` gate in the app rather than just new fixtures.
 *
 *   ⚠ ADD A KEY TO ONE DAY AND YOU MUST ADD IT TO ALL THREE. `DayConfig` is
 *   `(typeof DAY_CONFIG)[TestDay]`, so a key missing from any member is a
 *   compile error at every read.
 *
 * WHAT MOVED WITH IT, all in their own files:
 *   · tonight's job is the OFFICE, not the wedding — the returning user played
 *     the wedding on day 1, so it cannot still be open (data/challenges.ts)
 *   · a second complete photography set, 39 frames, no `d1` frame anywhere in
 *     the day-2 magazine (data/looks.ts)
 *   · yesterday's result is one band higher, in one fixture (data/results.ts)
 *   · ~30 wardrobe pieces in REAL CATALOGUE NAMES (data/inventory.ts)
 *
 * ESTABLISHED (day 3) IS UNTOUCHED and stays the far-future reference.
 */

import type { Phase } from '@/domain/clock';
import type { MilestoneKey } from '@/domain/bands';

export type TestDay = 1 | 2 | 3;

/** What the build ships in. ONE LINE IS THE SWITCH between the two sittings. */
const SEED_DAY: TestDay = 1;

/**
 * ⚠ WEB-ONLY PREVIEW OVERRIDE — `?day=1`, `?day=2`, `?day=3`.
 *
 * So both sittings can be checked on the deployed URL without a commit, and so
 * Day 1 can be proven unchanged after any work on Day 2. `SEED_DAY` is still
 * what a bare URL serves.
 *
 * IT HAS TO LIVE HERE AND NOWHERE ELSE. Several modules compute day-dependent
 * constants at MODULE SCOPE — `YOUR_LOOK` in today/result.tsx, `RENDERED` in
 * ui/RenderedLook.tsx, `CHALLENGES` in data/challenges.ts — so the day has to
 * be settled before any of them evaluate. This file imports two types and
 * nothing else, which makes it the first thing initialised.
 *
 * Parsed by hand rather than with `URLSearchParams`, which is not reliably
 * present on native. `window` IS defined in React Native (it aliases `global`),
 * so the guard is on `location`, not on `window`.
 *
 * NOT `process.env`: there is none anywhere in src/, app/ or scripts/, and the
 * Vercel build would not supply one.
 */
function dayFromUrl(): TestDay | null {
  if (typeof window === 'undefined' || typeof window.location?.search !== 'string') return null;
  const m = /[?&]day=([123])(?:&|$)/.exec(window.location.search);
  if (!m) return null;
  return Number(m[1]) as TestDay;
}

export const ACTIVE_DAY: TestDay = dayFromUrl() ?? SEED_DAY;

/** What each day seeds. Mirrors the table in HANDOVER-v2.md §11 exactly. */
export const DAY_CONFIG = {
  1: {
    dayName: 'Wednesday',
    subtitle: 'Your first job is open',
    /**
     * NOT A PRE-BAKED DESCRIPTOR ANY MORE. `profileMeta` used to be this
     * string, and the You screen printed it verbatim — which is why the header
     * read "@katyabeer · just joined · 0 looks" above a body reporting 74 jobs
     * entered: the descriptor was a fixture, not a reading of anything.
     *
     * It is now the one input the ladder needs (`descriptor` in domain/you.ts);
     * the handle comes from the session and the look count from the archive.
     */
    dayNumber: 1,
    startingTokens: 0,
    overnightTokens: 0,
    /**
     * The first-look bonus is NOT configured here any more. It was a second
     * copy of `TOKENS_FOR_FIRST_LOOK` in domain/economy.ts, which is one place
     * too many for a number the success screen quotes. See open question A.
     */
    entryGrant: 0,
    onboarding: true,
    /** ABSENT ENTIRELY, not an empty state. Do not add a placeholder. */
    yesterday: 'none',
    /**
     * ZERO, and the first-run walkthrough is what fills it. The capsule picker
     * that used to hand over eight pieces is gone (Katya, 3 Sep) — the builder
     * offers the whole catalogue instead, and the look you enter becomes the
     * wardrobe. See `adoptLook` in state/wardrobe.ts.
     *
     * Unused for days 1 and 2 anyway: seed() counts the actual pieces below
     * Established. Kept accurate so the table isn't a lie.
     */
    wardrobeCount: 0,
    /** Hidden — a zero here would be a lie. */
    showOvernightRoundel: false,
    /** Hidden — a nudge drawn from eight things you can already see is noise. */
    showTryTheseRail: false,
    /** Day 1 is six unearned milestones and nothing else. A sentence needs
     *  looks, a strength needs three results, and inventing either is what that
     *  page exists not to do. */
    /**
     * NOT A LIST ANY MORE. `youSections` used to name which of You's five
     * sections rendered per test day, which meant the day fixture decided
     * what the screen was allowed to say. It now decides itself from the
     * rollup — `visibleSections` in domain/you.ts — so the sections respond to
     * what you have actually done rather than to which day is booted.
     *
     * Kept as a comment because the old list is still the best one-line
     * summary of what each day SHOULD produce, and it is worth being able to
     * check the derivation against it:
     *   day 1        milestones only
     *   day 2        posts · stats · milestones
     *   established  all five
     */
    /**
     * NONE EARNED. Was `milestonesEarned: 0`, a COUNT — see the note on day 2's
     * list for why that could not survive. An empty list renders identically.
     */
    milestones: [] as readonly MilestoneKey[],
  },
  2: {
    dayName: 'Thursday',
    /** Points at the result card directly above it, which is the one thing on
     *  this screen that has changed since the first sitting. */
    subtitle: 'Your best placing yet',
    /**
     * FIVE, not two. The story is "a few days in": yesterday's result landed,
     * the wardrobe has been accumulating, and You has enough history to show a
     * pattern rather than a first data point. Two days cannot carry any of it.
     */
    dayNumber: 5,
    /** Unchanged, and deliberately. Invariant 1 is the whole economy — a big
     *  token float on the demo state quietly says clothes are free. */
    startingTokens: 2,
    overnightTokens: 2,
    entryGrant: 0,
    onboarding: false,
    yesterday: 'entered',
    /** Authored in `inventoryDayTwo`, and `seed()` counts the real pieces for
     *  this day rather than reading this. Kept accurate so the table is true. */
    wardrobeCount: 30,
    showOvernightRoundel: true,
    showTryTheseRail: true,
    /**
     * ⚠ KEYS, NOT A COUNT, AND THAT IS THE POINT OF THE CHANGE.
     *
     * `Milestones` used to take a number and tick `i < earned` — a POSITIONAL
     * PREFIX. Katya asked to "unlock a few" on a five-day-old account, and a
     * prefix of three or more necessarily ticks `Week straight · 7 days
     * running`, which that account has not done. Worse, it made `Good eye`
     * unreachable without `Week straight` for anyone, ever.
     *
     * These three are the ones five days can honestly carry: they entered
     * (`filed`), someone took a piece (`borrowed`), and yesterday placed in the
     * top 25% (`upperQuarter` — see data/results.ts, which is where that band
     * is stated). `weekStraight` is visibly NOT ticked at five days, and
     * `goodEye` / `tenHands` are both close but short, which is what a badge
     * row is for.
     */
    milestones: ['filed', 'borrowed', 'upperQuarter'] as readonly MilestoneKey[],
  },
  3: {
    dayName: 'Thursday',
    subtitle: 'The room settled overnight',
    dayNumber: 124,
    startingTokens: 2,
    overnightTokens: 2,
    entryGrant: 0,
    onboarding: false,
    yesterday: 'entered',
    wardrobeCount: 96,
    showOvernightRoundel: true,
    showTryTheseRail: true,
    /** The same three the count used to produce for this day, spelled out. */
    milestones: ['filed', 'borrowed', 'weekStraight'] as readonly MilestoneKey[],
  },
} as const;

export type DayConfig = (typeof DAY_CONFIG)[TestDay];
export const dayConfig = (day: TestDay): DayConfig => DAY_CONFIG[day];

/**
 * ⚠ THE FAILED RENDER, made reachable.
 *
 * Create has a `failed` state (create brief §6): the job died, the allowance
 * came back, there is a retry. It is a real screen and it needs looking at,
 * but nothing in a prototype fails on its own — and Jack's open question 2
 * (render latency and failure rate) is exactly the number that would tell us
 * how often to fake it.
 *
 * Flip this to true, save, and every render fails instead of landing. Leave it
 * false for anything a participant will see.
 */
export const SIMULATED_FAILURE = false;

/**
 * ⚠ WHICH PHASE THE APP BOOTS IN. `null` reads the real clock (`phaseAt` in
 * domain/clock.ts): entry 07:00–20:00, judging from 20:00, settling until 07:00.
 *
 * The clock is the design (locked decision 2) and until 4 Sep the app did not
 * actually keep it — `phase` started at `entry` and only ever advanced when the
 * flow itself pushed it, which is why the card's "closed, now judging" copy was
 * unreachable to anyone who did not enter.
 *
 * THIS OVERRIDE EXISTS BECAUSE MODERATED SESSIONS DO NOT HAPPEN AT LUNCHTIME.
 * A session at 21:00 would otherwise boot into `judging` and the participant
 * could not build a look at all — which is the one thing the session is for.
 * Set it to `'entry'` for an evening session, and put it back to `null`
 * afterwards. Same class of thing as ACTIVE_DAY: a build constant, not a HUD.
 */
export const FORCE_PHASE: Phase | null = null;

/**
 * ⚠ HAS TODAY'S RESULT LANDED? Normally impossible to be true — see
 * RESULTS_NEED_A_DAY_ROLLOVER in domain/today.ts.
 *
 * Your entry settles overnight and the placing arrives at 07:00, by which point
 * it is YESTERDAY's job and the card is showing a new one — so in the real
 * product the same card never carries both "complete" and "your result is in".
 * The result appears in Act 1 (`ui/ResultCard.tsx`) the next morning instead.
 *
 * The card's `results` state is built because it is the correct shape IF the
 * card ever persists past 7am, and this is the only way to look at it. Leave it
 * false for anything a participant will see.
 */
export const FORCE_RESULTS_READY = false;

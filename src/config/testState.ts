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
 *   2  returning       skips onboarding, first result in, 11 pieces, 2 tokens
 *   3  established     skips onboarding, 96 pieces, 9 looks, all five You sections
 *
 * If you want in-session switching back for a moderated session, add it as a
 * dev-only overlay gated on __DEV__ — not as a panel beside the phone.
 */

export type TestDay = 1 | 2 | 3;

export const ACTIVE_DAY: TestDay = 1;

/** What each day seeds. Mirrors the table in HANDOVER-v2.md §11 exactly. */
export const DAY_CONFIG = {
  1: {
    dayName: 'Wednesday',
    subtitle: 'Your first job is open',
    profileMeta: 'katya.b · day one · nothing entered yet',
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
    youSections: ['milestones'],
    milestonesEarned: 0,
  },
  2: {
    dayName: 'Thursday',
    subtitle: 'Your first result is in',
    profileMeta: 'katya.b · day two · 1 look',
    startingTokens: 2,
    overnightTokens: 2,
    entryGrant: 0,
    onboarding: false,
    yesterday: 'entered',
    wardrobeCount: 11,
    showOvernightRoundel: true,
    showTryTheseRail: true,
    youSections: ['posts', 'stats', 'milestones'],
    milestonesEarned: 1,
  },
  3: {
    dayName: 'Thursday',
    subtitle: 'The room settled overnight',
    profileMeta: 'katya.b · four months · 118 looks',
    startingTokens: 2,
    overnightTokens: 2,
    entryGrant: 0,
    onboarding: false,
    yesterday: 'entered',
    wardrobeCount: 96,
    showOvernightRoundel: true,
    showTryTheseRail: true,
    youSections: ['sentence', 'justForYou', 'posts', 'stats', 'milestones'],
    milestonesEarned: 3,
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

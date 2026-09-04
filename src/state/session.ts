/**
 * Session store — who you are, which day it is, which phase of the clock.
 *
 * The prototype kept everything in ONE flat object `S` with ~45 keys, which is
 * fine for a single HTML file and wrong for an app. It is split into six stores
 * here, one per domain, so a screen subscribes only to what it reads.
 *
 * Map, for anyone comparing against the prototype:
 *   S.day, phase, yState, capsule, rmode, tips   → session   (this file)
 *   S.picked, bstep, loans, model, entered       → entry
 *   S.pinch, taken, got, unlocked, earnedOvernight → economy
 *   S.ward, wview, wfilter, saved                → wardrobe
 *   S.page, feedLen, reacts, rev, spIdx, mfilter, sheet → magazine
 *   S.cstep, cpick, cocc, cfree, cdest, freeRender → create
 */

import { create } from 'zustand';
import { ACTIVE_DAY, dayConfig, type TestDay } from '@/config/testState';
import type { Phase, YesterdayState } from '@/domain/clock';
import type { CapsuleKey } from '@/data/capsules';

/** o5 asks which rails to show. SOFT, default Both.
 *
 *  Katya's call, and it is the better question: it is a preference about
 *  clothes, not a claim about the person, so it does not reopen the no-bodies
 *  position. KEEP IT SOFT — a hard filter splits the garment pool, which splits
 *  the room, and the cold-start floor then multiplies by the number of
 *  catalogues (~125 DAU becomes ~375). */
export type Rails = 'mens' | 'womens' | 'both';

/** a18 casting. Full matrix is 108 combinations; only 3 renders are needed for
 *  the test (variants of the participant's own look), everyone else gets one
 *  model each. */
export type Casting = {
  presentation: 'Womenswear' | 'Menswear' | 'Neither';
  hair: 'Short' | 'Long' | 'Cropped' | 'Wrapped';
  skin: 'Light' | 'Mid' | 'Deep';
  body: 'Slim' | 'Average' | 'Fuller';
};

/** One look, two presentations. The flat lay is not a fallback — it is the
 *  unrendered state.
 *
 *  ⚠ DEFAULT FLIPPED TO 'flat', 3 Sep. Not a position on Jack's open question 2
 *  — both presentations are still live and the toggle still shows both. It is
 *  about which one is REAL right now: the flat lay composes the actual AW26
 *  cutouts on the delivery's own template, and RenderStage's figure is still
 *  the placeholder wireframe standing in for Jack's pipeline. Telling someone
 *  "your look is ready" and handing them a grey mannequin is the worst payoff
 *  in the app. Flip this back the moment the model render is real. */
export type RenderMode = 'model' | 'flat';

/** Which screen's walkthrough tip has been dismissed.
 *
 *  'build' is GONE (Katya, 3 Sep) — see today/build.tsx. It said "no hints, on
 *  purpose", which was a hint, in the biggest accent panel on the screen,
 *  directly above the grid it was pushing down. */
export type TipKey = 'today' | 'magazine';

type SessionState = {
  day: TestDay;
  phase: Phase;
  yesterday: YesterdayState;
  handle: string;
  rails: Rails;
  /**
   * WHEN THE FIRST ENTRY LANDED, or null. Drives "just joined" → tenure, and
   * it is deliberately not a login date: someone who signs up at 21:00 and
   * cannot enter until tomorrow is still just joined, correctly. See
   * `descriptor` in domain/you.ts.
   */
  firstEntryAt: number | null;
  /** The ordinal day of use, 1 being the day you joined. Seeded per test day —
   *  there is no real account age in a prototype that reboots on save. */
  dayNumber: number;
  capsule: CapsuleKey | null;
  casting: Casting;
  renderMode: RenderMode;
  dismissedTips: Partial<Record<TipKey, boolean>>;
  /** Where the casting screen was opened from, so its back button is right. */
  castingOrigin: 'brief' | 'create';

  setPhase: (p: Phase) => void;
  setRails: (r: Rails) => void;
  setHandle: (h: string) => void;
  /** Idempotent — the FIRST entry, not the latest. */
  markFirstEntry: () => void;
  setCapsule: (c: CapsuleKey) => void;
  setCasting: <K extends keyof Casting>(key: K, value: Casting[K]) => void;
  setRenderMode: (m: RenderMode) => void;
  setCastingOrigin: (o: 'brief' | 'create') => void;
  dismissTip: (k: TipKey) => void;
  resetToDay: (day: TestDay) => void;
};

const initial = (day: TestDay) => {
  const cfg = dayConfig(day);
  return {
    day,
    phase: 'entry' as Phase,
    yesterday: cfg.yesterday as YesterdayState,
    /* EMPTY on day one — the profile screen's field starts blank and the user
       types their own. Days 2 and 3 are returning users, who already have one. */
    /* `katya_b`, not `katya.b` — a dot is not a handle character, so the old
       seed was a handle the app's own validator would refuse (domain/handle.ts).
       A fixture that cannot pass validation is a fixture that hides a bug. */
    handle: day === 1 ? '' : 'katya_b',
    /* WOMEN'S BY DEFAULT (Katya, 4 Sep). Locked decision 16 said Both; this
       overrides that default and nothing else about it. The question stays
       SOFT — `cataloguePool` sorts and never filters — so the invariant that
       matters (a hard filter splits the room and triples the cold-start floor)
       is untouched. It is a starting position, not a restriction. */
    rails: 'womens' as Rails,
    /* Day 1 has entered nothing yet. Days 2 and 3 are returning users whose
       first entry is behind them, so the descriptor reads tenure rather than
       "just joined" without waiting for them to enter again. */
    firstEntryAt: day === 1 ? null : Date.now(),
    dayNumber: cfg.dayNumber,
    /** Day 1 has no capsule until o6. Days 2 and 3 assume the first one. */
    capsule: (day === 1 ? null : 'quiet') as CapsuleKey | null,
    casting: {
      presentation: 'Womenswear',
      hair: 'Long',
      skin: 'Mid',
      body: 'Average',
    } as Casting,
    renderMode: 'flat' as RenderMode,
    dismissedTips: {},
    castingOrigin: 'brief' as const,
  };
};

export const useSession = create<SessionState>((set) => ({
  ...initial(ACTIVE_DAY),

  setPhase: (phase) => set({ phase }),
  setRails: (rails) => set({ rails }),
  setHandle: (handle) => set({ handle }),
  markFirstEntry: () => set((s) => (s.firstEntryAt ? s : { firstEntryAt: Date.now() })),
  setCapsule: (capsule) => set({ capsule }),
  setCasting: (key, value) => set((s) => ({ casting: { ...s.casting, [key]: value } })),
  setRenderMode: (renderMode) => set({ renderMode }),
  setCastingOrigin: (castingOrigin) => set({ castingOrigin }),
  dismissTip: (k) => set((s) => ({ dismissedTips: { ...s.dismissedTips, [k]: true } })),
  resetToDay: (day) => set(initial(day)),
}));

/** The three walkthrough tips, copy ported verbatim. */
export const TIPS: Record<TipKey, string> = {
  today:
    'Build first, judge after. At 8pm the job shuts and the judging opens — which is also how you unlock tokens.',
  magazine:
    'This is where clothes come from. Judging earns tokens. This is the only place to spend them.',
};

/** Which word in each tip is bold in the prototype. */
export const TIP_LEAD: Record<TipKey, string> = {
  today: 'Build first, judge after.',
  magazine: 'This is where clothes come from.',
};

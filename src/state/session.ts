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
 *  unrendered state. */
export type RenderMode = 'model' | 'flat';

/** Which screen's walkthrough tip has been dismissed. */
export type TipKey = 'today' | 'build' | 'magazine';

type SessionState = {
  day: TestDay;
  phase: Phase;
  yesterday: YesterdayState;
  handle: string;
  rails: Rails;
  capsule: CapsuleKey | null;
  casting: Casting;
  renderMode: RenderMode;
  dismissedTips: Partial<Record<TipKey, boolean>>;
  /** Where the casting screen was opened from, so its back button is right. */
  castingOrigin: 'brief' | 'create';

  setPhase: (p: Phase) => void;
  setRails: (r: Rails) => void;
  setHandle: (h: string) => void;
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
    handle: 'katya.b',
    rails: 'both' as Rails,
    /** Day 1 has no capsule until o6. Days 2 and 3 assume the first one. */
    capsule: (day === 1 ? null : 'quiet') as CapsuleKey | null,
    casting: {
      presentation: 'Womenswear',
      hair: 'Long',
      skin: 'Mid',
      body: 'Average',
    } as Casting,
    renderMode: 'model' as RenderMode,
    dismissedTips: {},
    castingOrigin: 'brief' as const,
  };
};

export const useSession = create<SessionState>((set) => ({
  ...initial(ACTIVE_DAY),

  setPhase: (phase) => set({ phase }),
  setRails: (rails) => set({ rails }),
  setHandle: (handle) => set({ handle }),
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
  build:
    'No hints, on purpose. Nothing here is sorted by what suits the job. That part is yours to decide.',
  magazine:
    'This is where clothes come from. Judging earns tokens. This is the only place to spend them.',
};

/** Which word in each tip is bold in the prototype. */
export const TIP_LEAD: Record<TipKey, string> = {
  today: 'Build first, judge after.',
  build: 'No hints, on purpose.',
  magazine: 'This is where clothes come from.',
};

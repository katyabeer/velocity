/**
 * The async render — from tap to ready, for both flows that produce one.
 *
 * INSTEAD OF STANDING AND WATCHING IT RENDER, you submit and keep using the
 * app. The delay later, the lane flips to 'ready' and a badge appears on the
 * tab that owns it. Tapping through to look at it is the only thing that clears
 * the badge; there is no auto-dismiss, because the badge is the only record
 * that something finished while you were elsewhere.
 *
 * TWO LANES, NOT ONE PENDING SLOT. This store used to hold a single `pending`,
 * which was fine while only Create rendered. It is not fine now that the daily
 * brief renders too: submitting a look at 19:40 and then making a freestyle
 * post before judging would have overwritten the brief's record, and the Today
 * badge would never have arrived. One lane per producer, and they don't
 * interfere.
 *
 *   brief   the daily job. Sixty seconds — deliberately long enough that you
 *           go and judge rather than wait, which is the whole point of the
 *           screen that sends you there. Nothing is written on ready: the look
 *           IS the entry, and the entry store already holds it.
 *   create  freestyle. Five seconds, and the 'set' destination's private save
 *           lands inside the timeout rather than at submit() time — nothing is
 *           produced until 'ready', which is "nothing renders before you
 *           commit" deferred one step further.
 *
 * Create's zero-renders-left fallback (an instant, unrendered, unlimited save)
 * never touches this store — there is nothing to wait for.
 *
 * THE BADGE MOVED. It used to be a chip in every Header/LogoBlock, top right.
 * It is now a dot on the owning tab (see ui/TabIcon.tsx), and the brief's
 * progress also reads on the Today challenge card itself — Katya, 3 Sep: a
 * status chip floating on every screen in the app reads as chrome, and the one
 * screen the status actually belongs on is the one with the job on it.
 */

import { create } from 'zustand';
import { useWardrobe } from './wardrobe';

/** Which producer a record belongs to. One in flight per lane, at most. */
export type RenderLane = 'brief' | 'create';

export type SubmissionDestination = 'magazine' | 'set' | 'brief';

/**
 * Katya's numbers (async-submission plan D4, amended 3 Sep). Kept as named,
 * tunable constants rather than magic numbers at the call sites — the brief's
 * minute is a deliberate product decision, not a guess at render time.
 */
export const RENDER_DELAY_MS: Record<RenderLane, number> = {
  brief: 60_000,
  create: 5_000,
};

export type Submission = {
  status: 'pending' | 'ready';
  destination: SubmissionDestination;
  picks: readonly string[];
  occasion: string | null;
  freeTags: readonly string[];
  /** True once the finished render has actually been looked at. Clears the
   *  badge, and nothing else sets it. */
  seen: boolean;
};

type SubmitInput = {
  destination: SubmissionDestination;
  picks: readonly string[];
  occasion: string | null;
  freeTags: readonly string[];
};

type SubmissionState = {
  lanes: Record<RenderLane, Submission | null>;
  submit: (lane: RenderLane, input: SubmitInput) => void;
  markSeen: (lane: RenderLane) => void;
  /** Drops the record entirely. Create's success screen calls this once it has
   *  shown a seen submission — without it, `seen` stays true forever and a
   *  later, unrelated visit (the zero-renders-left instant save) would read
   *  this stale record instead of Create's own live state. The brief's lane is
   *  never cleared: its record is the day's entry, and the day does not end. */
  clear: (lane: RenderLane) => void;
  reset: () => void;
};

const timers: Partial<Record<RenderLane, ReturnType<typeof setTimeout>>> = {};

const noLanes = (): Record<RenderLane, Submission | null> => ({ brief: null, create: null });

export const useSubmission = create<SubmissionState>((set, get) => ({
  lanes: noLanes(),

  submit: (lane, input) => {
    const running = timers[lane];
    if (running) clearTimeout(running);

    set((s) => ({
      lanes: { ...s.lanes, [lane]: { ...input, status: 'pending', seen: false } },
    }));

    timers[lane] = setTimeout(() => {
      const current = get().lanes[lane];
      if (!current) return;

      /* A private Create render produces its wardrobe entry HERE, not at
         submit time — see the header. The brief produces nothing: the entry
         store is already holding the look. */
      if (current.destination === 'set') {
        useWardrobe.getState().saveSet({
          job: 'Untitled combination',
          band: 'private',
          when: 'just now',
          note: `${current.picks.length} pieces · rendered, not posted`,
        });
      }

      set((s) => {
        const latest = s.lanes[lane];
        return latest ? { lanes: { ...s.lanes, [lane]: { ...latest, status: 'ready' } } } : s;
      });
    }, RENDER_DELAY_MS[lane]);
  },

  markSeen: (lane) =>
    set((s) => {
      const current = s.lanes[lane];
      return current ? { lanes: { ...s.lanes, [lane]: { ...current, seen: true } } } : s;
    }),

  clear: (lane) => set((s) => ({ lanes: { ...s.lanes, [lane]: null } })),

  reset: () => {
    (Object.keys(timers) as RenderLane[]).forEach((lane) => {
      const t = timers[lane];
      if (t) clearTimeout(t);
      delete timers[lane];
    });
    set({ lanes: noLanes() });
  },
}));

/** 'none' before anything was submitted, so a screen can tell "not started"
 *  from "still going" without reaching for null checks. */
export type RenderStatus = 'none' | 'pending' | 'ready';

export const useRenderStatus = (lane: RenderLane): RenderStatus =>
  useSubmission((s) => s.lanes[lane]?.status ?? 'none');

/** Drives the dot on the lane's tab: finished, and not yet looked at. */
export const useRenderBadge = (lane: RenderLane): boolean =>
  useSubmission((s) => {
    const record = s.lanes[lane];
    return !!record && record.status === 'ready' && !record.seen;
  });

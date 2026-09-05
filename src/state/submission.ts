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
 *           screen that sends you there. On ready it files the entry into the
 *           wardrobe's Looks archive, banded 'live' — that tab is "everything
 *           you've entered", and the entry belongs in it from the moment there
 *           is something to look at. It does NOT wait for the overnight
 *           settlement: a look with no band yet is still a look you entered,
 *           and the row says so rather than inventing a placing.
 *   create  freestyle. On ready it PUBLISHES ITSELF — see below — and files a
 *           row banded 'free', which is the third non-band state: a freestyle
 *           look never settles, so it has no band to wait for.
 *
 * ══ PUBLICATION IS A CONSEQUENCE OF THE JOB COMPLETING, NOT OF THE USER
 *    SEEING IT (create brief §4) ══
 *
 * There is no see-then-decide step at any point. That is the whole reason the
 * commit moved to Create's step 2: by the time a render exists, the decision
 * to publish it is already ten minutes old. Nothing here waits for the user.
 *
 * ══ THE PRIVATE-SAVE DESTINATION IS GONE (§2.2) ══
 *
 * There used to be a 'set' destination — render it, keep it out of the
 * magazine — and an unrendered, unlimited fallback beneath it. Both are
 * deleted: render or nothing. `SubmissionDestination` keeps two values, and
 * neither of them is a choice the user makes any more. The cost, accepted: for
 * most of the day Create has nothing to do, which is why the `spent` state
 * shows today's render at full size rather than an empty message.
 *
 * ══ FAILURE IS A REAL STATE, NOT A HOPE ══
 *
 * A job can fail, and when it does the allowance goes back (domain/renders.ts
 * `refund` — system failure only, never on user-initiated removal). The store
 * models it; what it cannot model is when it happens, because nobody knows the
 * failure rate yet.
 *   ⚠ JACK'S OPEN QUESTION 2: render job latency and failure rate. It decides
 *   whether `rendering` is a spinner or a state people live in for hours, and
 *   the sixty seconds below is a product decision standing in for a number we
 *   do not have. `SIMULATED_FAILURE` in config/testState.ts is how you reach
 *   the failed screen in the meantime.
 *
 * THE BADGE MOVED, TWICE. It used to be a chip in every Header/LogoBlock, top
 * right. It is now a dot on the tab that LEADS TO the finished thing — which
 * for the brief is Today, and for create is WARDROBE, not Create: Create came
 * out of the tab bar on 4 Sep and is entered from a banner at the top of the
 * wardrobe. The lane is still called `create`; only the tab showing its badge
 * changed (see (tabs)/_layout.tsx). The brief's progress also reads on the
 * Today challenge card itself — Katya, 3 Sep: a
 * status chip floating on every screen in the app reads as chrome, and the one
 * screen the status actually belongs on is the one with the job on it.
 */

import { create } from 'zustand';
import { useWardrobe } from './wardrobe';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { SIMULATED_FAILURE } from '@/config/testState';

/** Which producer a record belongs to. One in flight per lane, at most. */
export type RenderLane = 'brief' | 'create';

/** Where the finished render goes. NOT a user choice any more — each lane has
 *  exactly one destination, and the field survives only because the two lanes
 *  do different things with their output. */
export type SubmissionDestination = 'magazine' | 'brief';

/**
 * Katya's numbers (async-submission plan D4, amended 3 Sep). Kept as named,
 * tunable constants rather than magic numbers at the call sites — the brief's
 * minute is a deliberate product decision, not a guess at render time.
 *
 * Create's is short because its flow ends on the finished look. The brief's is
 * long because its flow ends by sending you to judge.
 */
export const RENDER_DELAY_MS: Record<RenderLane, number> = {
  brief: 60_000,
  create: 5_000,
};

export type Submission = {
  status: 'pending' | 'ready' | 'failed';
  destination: SubmissionDestination;
  picks: readonly string[];
  /** Free text, 0–5, normalised. Freestyle only — a brief entry's single
   *  closed declared word is a different field and lives in the entry store. */
  tags: readonly string[];
  /** When the job published it. Null while pending or failed. Starts the
   *  re-render window (domain/renders.ts). */
  publishedAt: number | null;
  /** The one re-render, once used. Frozen input, replaces in place. */
  rerenderUsed: boolean;
  /**
   * Reactions on the published look. ONE closes the re-render window.
   *   ⚠ NOTHING INCREMENTS THIS IN THE PROTOTYPE — there are no incoming
   *   reactions on your own freestyle post, because Create's posts don't enter
   *   the feed (there is no ownership model; see data/looks.ts). `react()`
   *   below is the seam the real thing plugs into, and the window-closing rule
   *   is tested against it rather than left as an assertion about the future.
   */
  reactions: number;
  /** True once the finished render has actually been looked at. Clears the
   *  badge, and nothing else sets it. */
  seen: boolean;
};

type SubmitInput = {
  destination: SubmissionDestination;
  picks: readonly string[];
  tags: readonly string[];
};

type SubmissionState = {
  lanes: Record<RenderLane, Submission | null>;
  submit: (lane: RenderLane, input: SubmitInput) => void;
  /** Re-runs the IDENTICAL look in place: same record, same picks, same tags,
   *  same casting. Nothing is editable between attempts — that is what makes
   *  it a fix for a bad render rather than a second attempt at a better look.
   *  Whether it is allowed at all is `rerenderVerdict`, not this. */
  rerender: (lane: RenderLane) => void;
  /** The seam for an incoming reaction. Closes the re-render window. */
  react: (lane: RenderLane) => void;
  markSeen: (lane: RenderLane) => void;
  /**
   * Drops the record entirely — and there is now exactly ONE caller: the
   * failure retry (`refundFailure` in state/create.ts).
   *
   * a17 used to clear the create lane on mount. Do not put that back. The
   * record is not a receipt to be torn up on the way past: it carries
   * `publishedAt` (which opens the fifteen-minute re-render window),
   * `rerenderUsed` (which closes it after one go) and the picks the `spent`
   * state shows at full size all day. Clearing it threw today's published look
   * away, and read on screen as "Not published yet" underneath the re-render
   * offer. `markSeen` is what clears the tab's dot, and it is enough alone.
   *
   * The brief's lane is never cleared either: its record is the day's entry,
   * and the day does not end.
   */
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
      lanes: {
        ...s.lanes,
        [lane]: {
          ...input,
          status: 'pending',
          publishedAt: null,
          rerenderUsed: false,
          reactions: 0,
          seen: false,
        },
      },
    }));

    timers[lane] = setTimeout(() => land(lane, set, get), RENDER_DELAY_MS[lane]);
  },

  rerender: (lane) => {
    const running = timers[lane];
    if (running) clearTimeout(running);

    set((s) => {
      const c = s.lanes[lane];
      if (!c) return s;
      /* Back to pending on the SAME record — a re-render is not a second
         publication, so nothing about the identity of the post changes. The
         allowance flag goes on now, not on success, for the same reason the
         first render's does: a killed app must not hand back a second go. */
      return {
        lanes: {
          ...s.lanes,
          [lane]: { ...c, status: 'pending', publishedAt: null, rerenderUsed: true, seen: false },
        },
      };
    });

    timers[lane] = setTimeout(() => land(lane, set, get), RENDER_DELAY_MS[lane]);
  },

  react: (lane) =>
    set((s) => {
      const c = s.lanes[lane];
      return c ? { lanes: { ...s.lanes, [lane]: { ...c, reactions: c.reactions + 1 } } } : s;
    }),

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

/**
 * The job landing. Extracted because `submit` and `rerender` must land
 * identically — a re-render that published differently from a render would be
 * a second publication wearing the first one's id.
 *
 * A RE-RENDER FILES NO SECOND ARCHIVE ROW. It replaces in place, so the row is
 * only written the first time it publishes.
 */
function land(
  lane: RenderLane,
  set: (fn: (s: SubmissionState) => Partial<SubmissionState>) => void,
  get: () => SubmissionState,
) {
  const current = get().lanes[lane];
  if (!current) return;

  if (SIMULATED_FAILURE) {
    set((s) => {
      const latest = s.lanes[lane];
      return latest ? { lanes: { ...s.lanes, [lane]: { ...latest, status: 'failed' } } } : s;
    });
    return;
  }

  const first = !current.rerenderUsed;

  /* The output is produced HERE, not at submit time — nothing exists until
     the job finishes, which is "nothing renders before you commit" carried
     one step further. */
  if (current.destination === 'brief' && first) {
    useWardrobe.getState().saveSet({
      job: TONIGHTS_BRIEF.shortName,
      /* No band yet — the room settles it overnight. See ArchiveEntry. */
      band: 'live',
      when: 'today',
      note: `${current.picks.length} pieces · entered`,
      pieces: current.picks,
    });
  }

  if (current.destination === 'magazine' && first) {
    useWardrobe.getState().saveSet({
      job: current.tags[0] ? `#${current.tags[0]}` : 'Freestyle',
      /* 'free' is the third non-band state: a freestyle look never settles,
         so unlike 'live' it is not waiting for one. */
      band: 'free',
      when: 'today',
      note: `${current.picks.length} pieces · in the magazine`,
      pieces: current.picks,
    });
  }

  set((s) => {
    const latest = s.lanes[lane];
    return latest
      ? { lanes: { ...s.lanes, [lane]: { ...latest, status: 'ready', publishedAt: Date.now() } } }
      : s;
  });
}

/** 'none' before anything was submitted, so a screen can tell "not started"
 *  from "still going" without reaching for null checks. */
export type RenderStatus = 'none' | 'pending' | 'ready' | 'failed';

export const useRenderStatus = (lane: RenderLane): RenderStatus =>
  useSubmission((s) => s.lanes[lane]?.status ?? 'none');

/** Drives the dot on the lane's tab: finished, and not yet looked at. */
export const useRenderBadge = (lane: RenderLane): boolean =>
  useSubmission((s) => {
    const record = s.lanes[lane];
    return !!record && record.status === 'ready' && !record.seen;
  });

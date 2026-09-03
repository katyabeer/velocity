/**
 * Create store — free posting. No job, no score.
 *
 * CREATE KEEPS ITS TAG STEP: pick → tag → model → render. A freestyle
 * post has no brief, so its tags are the only thing telling the magazine
 * what it is. (The BRIEF flow has no tag step — locked decision 18. Don't
 * unify them.)
 *
 * NO SEPARATE LOOK STEP — the pieces-together preview now lives on the
 * Render step itself, right before you commit, not as its own early stop.
 *
 * PICKING REUSES THE BRIEF FLOW'S SLOT LOGIC (togglePick/removePick from
 * domain/entry.ts). LOCKED DECISION 11, as amended 3 Sep, is "6 pieces, one per
 * slot except Extra which takes two, for BRIEFS AND FREESTYLE" — Create
 * previously had its own, simpler toggle() that only capped the total with no
 * slot eviction, which quietly broke that invariant. Fixed here, not left as a
 * shortcut, and it is why the amendment needed no change in this file.
 *
 * ONE RENDER A DAY, WITH A MODEL. Once it's spent, "save to my looks" falls
 * back to the old unrendered, unlimited path — see renderAndPost /
 * renderAndSavePrivately vs. saveUnrendered below. The first two are async
 * (state/submission.ts); the third is immediate, same as it always was.
 */

import { create } from 'zustand';
import { togglePick, removePick, type Pick } from '@/domain/entry';
import { MAX_FREE_TAGS } from '@/data/challenges';
import { FREE_RENDERS_PER_DAY, MIN_PIECES, MAX_PIECES } from '@/domain/entry';
import type { Category } from '@/domain/garments';
import { useSubmission } from './submission';
import { useToast } from './toast';
import { useWardrobe } from './wardrobe';

/** 1 pick, 2 tag, 3 render — Model is step 3 of 4 on the ribbon, but lives
 *  on the separate /casting route, so it isn't one of these three. */
export type CreateStep = 1 | 2 | 3;
/** Create's two destinations. The submission store also knows a 'brief'
 *  destination, which is the daily job's and never reachable from here. */
export type Destination = 'magazine' | 'set' | null;

type CreateState = {
  step: CreateStep;
  picks: readonly Pick[];
  /** BY GARMENT TYPE AND NOTHING ELSE. Category, not slot, so Dresses can be
   *  its own rail while still occupying the Top slot. */
  filter: Category | 'All';
  occasion: string | null;
  freeTags: readonly string[];
  /** Set only by the three terminal actions below — what posted.tsx reads
   *  for the synchronous (unrendered) path. The two async paths read
   *  useSubmission().pending instead. */
  destination: Destination;
  rendersUsed: number;

  toggle: (name: string) => void;
  /** By NAME, not by slot — Extra holds two, and clearing the slot would
   *  take out both when the user tapped one. */
  putBack: (name: string) => void;
  setStep: (step: CreateStep) => void;
  setFilter: (f: Category | 'All') => void;
  setOccasion: (o: string | null) => void;
  addFreeTag: (t: string) => void;
  removeFreeTag: (t: string) => void;
  renderAndPost: () => void;
  renderAndSavePrivately: () => void;
  saveUnrendered: () => void;
  startAgain: () => void;
};

const blank = {
  step: 1 as CreateStep,
  picks: [] as readonly Pick[],
  filter: 'All' as const,
  occasion: null,
  freeTags: [] as readonly string[],
  destination: null as Destination,
};

export const useCreate = create<CreateState>((set, get) => ({
  ...blank,
  rendersUsed: 0,

  toggle: (name) => set((s) => ({ picks: togglePick(s.picks, { name, source: 'owned' }) })),
  putBack: (name) => set((s) => ({ picks: removePick(s.picks, name) })),
  setStep: (step) => set({ step }),
  setFilter: (filter) => set({ filter }),
  setOccasion: (occasion) => set({ occasion }),

  addFreeTag: (t) =>
    set((s) =>
      s.freeTags.includes(t) || s.freeTags.length >= MAX_FREE_TAGS
        ? s
        : { freeTags: [...s.freeTags, t] },
    ),

  removeFreeTag: (t) => set((s) => ({ freeTags: s.freeTags.filter((x) => x !== t) })),

  renderAndPost: () => {
    const s = get();
    useSubmission.getState().submit('create', {
      destination: 'magazine',
      picks: s.picks.map((p) => p.name),
      occasion: s.occasion,
      freeTags: s.freeTags,
    });
    useToast.getState().show("You're in — we'll tell you when it's ready.");
    set({ destination: 'magazine', rendersUsed: s.rendersUsed + 1 });
  },

  renderAndSavePrivately: () => {
    const s = get();
    useSubmission.getState().submit('create', {
      destination: 'set',
      picks: s.picks.map((p) => p.name),
      occasion: s.occasion,
      freeTags: s.freeTags,
    });
    useToast.getState().show("You're in — we'll tell you when it's ready.");
    set({ destination: 'set', rendersUsed: s.rendersUsed + 1 });
  },

  saveUnrendered: () => {
    const s = get();
    useWardrobe.getState().saveSet({
      job: 'Untitled combination',
      band: 'flat',
      when: 'just now',
      note: `${s.picks.length} pieces · saved as a set`,
    });
    set({ destination: 'set' });
  },

  startAgain: () => set(blank),
}));

export const useCanAdvanceCreate = (): boolean =>
  useCreate((s) => s.picks.length >= MIN_PIECES && s.picks.length <= MAX_PIECES);

export const useRendersLeft = (): number =>
  useCreate((s) => Math.max(0, FREE_RENDERS_PER_DAY - s.rendersUsed));

/**
 * Create store — free posting. No job, no score.
 *
 * CREATE KEEPS ITS TAG STEP: pick → look → tag → render. A freestyle post has
 * no brief, so its tags are the only thing telling the magazine what it is.
 * (The BRIEF flow has no tag step — locked decision 18. Don't unify them.)
 *
 * ONE RENDER A DAY. `save as a set` is unlimited and writes into the Wardrobe's
 * Looks tab — which is how that tab first fills on Day 1.
 *
 * REVERSED, DO NOT RE-PROPOSE: rendering inside Create before submission.
 */

import { create } from 'zustand';
import { FREE_RENDERS_PER_DAY } from '@/domain/entry';
import { MAX_FREE_TAGS } from '@/data/challenges';
import { MAX_PIECES, MIN_PIECES } from '@/domain/entry';
import type { Slot } from '@/domain/garments';

export type CreateStep = 1 | 2 | 3 | 4;
export type Destination = 'magazine' | 'set' | null;

type CreateState = {
  step: CreateStep;
  picks: readonly string[];
  filter: Slot | 'All';
  occasion: string | null;
  freeTags: readonly string[];
  destination: Destination;
  rendersUsed: number;

  toggle: (name: string) => void;
  drop: (name: string) => void;
  setStep: (s: CreateStep) => void;
  setFilter: (f: Slot | 'All') => void;
  setOccasion: (o: string | null) => void;
  addFreeTag: (t: string) => void;
  removeFreeTag: (t: string) => void;
  setDestination: (d: Destination) => void;
  useRender: () => void;
  startAgain: () => void;
};

const blank = {
  step: 1 as CreateStep,
  picks: [] as readonly string[],
  filter: 'All' as const,
  occasion: null,
  freeTags: [] as readonly string[],
  destination: null as Destination,
};

export const useCreate = create<CreateState>((set) => ({
  ...blank,
  rendersUsed: 0,

  toggle: (name) =>
    set((s) => {
      if (s.picks.includes(name)) return { picks: s.picks.filter((n) => n !== name) };
      if (s.picks.length >= MAX_PIECES) return s;
      return { picks: [...s.picks, name] };
    }),

  drop: (name) => set((s) => ({ picks: s.picks.filter((n) => n !== name) })),
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
  setDestination: (destination) => set({ destination }),
  useRender: () => set((s) => ({ rendersUsed: s.rendersUsed + 1 })),
  startAgain: () => set(blank),
}));

export const useCanAdvanceCreate = (): boolean =>
  useCreate((s) => s.picks.length >= MIN_PIECES && s.picks.length <= MAX_PIECES);

export const useRendersLeft = (): number =>
  useCreate((s) => Math.max(0, FREE_RENDERS_PER_DAY - s.rendersUsed));

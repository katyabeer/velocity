/**
 * Entry store — tonight's look, and whether it is in.
 *
 * PERFORMANCE HISTORY NEVER APPEARS IN THE BUILDER. It lives in the wardrobe
 * and on the result screen only. Seeing "best: top of the room" while choosing
 * turns styling into optimising, and optimised looks are worse signal than
 * honest ones. This store deliberately exposes no `best` / `worn` field.
 *
 * FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE. Nothing is sorted by what
 * "goes with" the brief, because deciding that is the skill being tested.
 */

import { create } from 'zustand';
import type { Slot } from '@/domain/garments';
import { clearSlot, togglePick, canEnter, type Pick, type PickSource } from '@/domain/entry';

type EntryState = {
  picks: readonly Pick[];
  /** 1 = pick, 2 = look. Steps 3 and 4 happen on other screens. */
  step: 1 | 2;
  filter: Slot | 'All';
  /** Once true, NOTHING can be changed. There is no path back. */
  entered: boolean;
  /** Set when the render animation has finished so we don't replay it. */
  rendered: boolean;

  toggle: (name: string, source: PickSource) => void;
  clear: (slot: Slot) => void;
  setStep: (step: 1 | 2) => void;
  setFilter: (f: Slot | 'All') => void;
  enter: () => void;
  markRendered: () => void;
  reset: () => void;
};

const blank = {
  picks: [] as readonly Pick[],
  step: 1 as const,
  filter: 'All' as const,
  entered: false,
  rendered: false,
};

export const useEntry = create<EntryState>((set) => ({
  ...blank,

  toggle: (name, source) =>
    set((s) => (s.entered ? s : { picks: togglePick(s.picks, { name, source }) })),

  clear: (slot) => set((s) => (s.entered ? s : { picks: clearSlot(s.picks, slot) })),

  setStep: (step) => set({ step }),
  setFilter: (filter) => set({ filter }),

  enter: () => set((s) => (canEnter(s.picks) ? { entered: true } : s)),
  markRendered: () => set({ rendered: true }),

  reset: () => set(blank),
}));

export const useCanEnter = (): boolean => useEntry((s) => canEnter(s.picks));

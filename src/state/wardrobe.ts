/**
 * Wardrobe store — inventory, the looks archive, and the three tabs.
 *
 * A PIECE YOU TAKE NOW ACTUALLY APPEARS IN THE WARDROBE. Fixed 26 Aug;
 * previously the counter moved but the inventory did not, which was invisible at
 * 96 pieces and glaring at 8. `add` and `remove` here are what make that true —
 * anything that changes the token balance must also call one of them.
 */

import { create } from 'zustand';
import { ACTIVE_DAY, dayConfig, type TestDay } from '@/config/testState';
import { categoryOf, type Category } from '@/domain/garments';
import { WARDROBE_CAP } from '@/domain/economy';
import {
  ARCHIVE_DAY_ONE,
  ARCHIVE_DAY_TWO,
  ARCHIVE_ESTABLISHED,
  INVENTORY_ESTABLISHED,
  inventoryDayOne,
  inventoryDayTwo,
  type ArchiveEntry,
  type OwnedPiece,
} from '@/data/inventory';
import type { CapsuleKey } from '@/data/capsules';

export type WardrobeView = 'pieces' | 'looks' | 'saved';

type WardrobeState = {
  pieces: readonly OwnedPiece[];
  archive: readonly ArchiveEntry[];
  view: WardrobeView;
  filter: Category | 'All';
  /**
   * The displayed count. On Established this is 96 while `pieces` holds a
   * 26-piece sample — the prototype does the same thing, so the grid stays
   * readable while the number stays plausible. Keep them in step when you take
   * or drop, which `add` / `remove` do.
   */
  count: number;
  cap: number;

  setView: (v: WardrobeView) => void;
  setFilter: (f: Category | 'All') => void;
  add: (name: string) => void;
  remove: (name: string) => void;
  /** Saving a freestyle set is how the Looks tab first fills on Day 1. */
  saveSet: (entry: ArchiveEntry) => void;
  hydrate: (day: TestDay, capsule: CapsuleKey) => void;
};

const seed = (day: TestDay, capsule: CapsuleKey) => {
  const cfg = dayConfig(day);
  const pieces =
    day === 1 ? inventoryDayOne(capsule) : day === 2 ? inventoryDayTwo(capsule) : [...INVENTORY_ESTABLISHED];
  const archive =
    day === 1 ? ARCHIVE_DAY_ONE : day === 2 ? ARCHIVE_DAY_TWO : ARCHIVE_ESTABLISHED;
  return {
    pieces,
    archive: [...archive],
    count: day >= 3 ? cfg.wardrobeCount : pieces.length,
    cap: WARDROBE_CAP,
  };
};

export const useWardrobe = create<WardrobeState>((set) => ({
  ...seed(ACTIVE_DAY, 'quiet'),
  view: 'pieces',
  filter: 'All',

  setView: (view) => set({ view }),
  setFilter: (filter) => set({ filter }),

  add: (name) =>
    set((s) => {
      if (s.pieces.some((p) => p.name === name)) return s;
      return {
        pieces: [
          ...s.pieces,
          { name, category: categoryOf(name), worn: 0, best: null, provenance: 'taken', isNew: true },
        ],
        count: s.count + 1,
      };
    }),

  remove: (name) =>
    set((s) => {
      if (!s.pieces.some((p) => p.name === name)) return s;
      return {
        pieces: s.pieces.filter((p) => p.name !== name),
        count: Math.max(0, s.count - 1),
      };
    }),

  saveSet: (entry) => set((s) => ({ archive: [entry, ...s.archive] })),

  hydrate: (day, capsule) => set({ ...seed(day, capsule), view: 'pieces', filter: 'All' }),
}));

/** Pieces grouped by category, respecting the active filter. For the grid. */
export function groupByCategory(
  pieces: readonly OwnedPiece[],
  filter: Category | 'All',
): { category: Category; items: OwnedPiece[] }[] {
  const cats: Category[] = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Extras'];
  return cats
    .filter((c) => filter === 'All' || filter === c)
    .map((category) => ({ category, items: pieces.filter((p) => p.category === category) }));
}

export const wornLabel = (p: OwnedPiece): string =>
  p.worn === 0 ? 'never worn' : `worn ${p.worn}× · best: ${p.best ?? '—'}`;

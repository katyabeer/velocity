/**
 * Wardrobe store — inventory, the looks archive, and the three tabs.
 *
 * A PIECE YOU TAKE NOW ACTUALLY APPEARS IN THE WARDROBE. Fixed 26 Aug;
 * previously the counter moved but the inventory did not, which was invisible at
 * 96 pieces and glaring at 8. `add` and `remove` here are what make that true —
 * anything that changes the token balance must also call one of them.
 *
 * DAY 1 STARTS EMPTY, AND THE FIRST LOOK FILLS IT. Katya, 3 Sep: the capsule
 * picker is gone, and with it the eight-pieces-off-a-menu grant. The first-run
 * builder offers the whole catalogue instead, and the pieces you actually chose
 * become the wardrobe — see `adoptLook`, called once when the entry commits.
 *
 * That is the answer to the day-one wardrobe problem, and it is a better one
 * than the capsule was: the wardrobe is now something you built rather than
 * something you were handed, and it cannot contain a piece you never looked at.
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
  inventoryDayTwo,
  type ArchiveEntry,
  type OwnedPiece,
} from '@/data/inventory';
import { garmentImage } from '@/data/catalogue';

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
  /** The entered look becomes yours to keep. Idempotent, because the screen
   *  that calls it can be remounted. */
  adoptLook: (names: readonly string[]) => void;
  hydrate: (day: TestDay) => void;
};

const seed = (day: TestDay) => {
  const cfg = dayConfig(day);
  /* Day 1 is EMPTY on purpose — not a thin wardrobe, none at all. The
     first-run builder draws on the catalogue, so nothing is blocked, and the
     first entry fills this via adoptLook. Do not re-seed it with a capsule. */
  const pieces =
    day === 1 ? [] : day === 2 ? inventoryDayTwo() : [...INVENTORY_ESTABLISHED];
  const archive =
    day === 1 ? ARCHIVE_DAY_ONE : day === 2 ? ARCHIVE_DAY_TWO : ARCHIVE_ESTABLISHED;
  return {
    /**
     * ⚠ THE PHOTOGRAPH IS ATTACHED HERE, NOT IN THE FIXTURE, and it has to be:
     * `data/inventory.ts` cannot import `data/catalogue.ts`, because the
     * catalogue `require()`s sixty PNGs and `tests/capsules.test.ts` imports
     * the fixtures under the plain-Node runner, which cannot load them. Same
     * reason `data/looks.ts` is a separate file.
     *
     * Without this the fixtures render a grey named box even when every name
     * is a real one — which is half of why day 2 had no clothes on it. `add`
     * and `adoptLook` below already did their own `garmentImage` call; the
     * seeded pieces were the ones that never got it.
     */
    pieces: pieces.map((p) => ({ ...p, image: p.image ?? garmentImage(p.name) })),
    archive: [...archive],
    count: day >= 3 ? cfg.wardrobeCount : pieces.length,
    cap: WARDROBE_CAP,
  };
};

export const useWardrobe = create<WardrobeState>((set) => ({
  ...seed(ACTIVE_DAY),
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
          {
            name,
            category: categoryOf(name),
            worn: 0,
            best: null,
            provenance: 'taken',
            isNew: true,
            image: garmentImage(name),
          },
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

  adoptLook: (names) =>
    set((s) => {
      const fresh = names.filter((n) => !s.pieces.some((p) => p.name === n));
      if (!fresh.length) return s;
      return {
        pieces: [
          ...s.pieces,
          ...fresh.map((name) => ({
            name,
            category: categoryOf(name),
            worn: 1,
            best: null,
            /* 'starter' rather than 'taken': no token was spent, and these are
               the pieces the wardrobe begins with. */
            provenance: 'starter' as const,
            isNew: true,
            image: garmentImage(name),
          })),
        ],
        count: s.count + fresh.length,
      };
    }),

  /**
   * Re-seed to a given day. ⟲ It had no caller until 13 Sep; **`logOut` in
   * you/index.tsx calls it now** (`hydrate(1)`), because that function resets
   * six stores and this was the one it skipped — invisible while the shipped
   * seed was day 1 and empty, obvious on a day-2 default, where logging out
   * opened onboarding with thirty pieces already owned.
   *
   * It is also the machinery a runtime day switch would need: the stores only
   * seed at boot, so changing `SEED_DAY` without a reload would leave this one
   * stale. The `?day=` override sidesteps that by BEING a reload. Lost its
   * `capsule` argument with `inventoryDayTwo`.
   */
  hydrate: (day) => set({ ...seed(day), view: 'pieces', filter: 'All' }),
}));

/** Pieces grouped by category, respecting the active filter. For the grid. */
export function groupByCategory(
  pieces: readonly OwnedPiece[],
  filter: Category | 'All',
): { category: Category; items: OwnedPiece[] }[] {
  const cats: Category[] = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Shoes', 'Extras', 'Accessories'];
  return cats
    .filter((c) => filter === 'All' || filter === c)
    .map((category) => ({ category, items: pieces.filter((p) => p.category === category) }));
}

/** "1 piece", not "1 pieces". Trivial, and it shows on the Saved tab the moment
 *  someone saves their first thing — which is exactly when they are looking. */
export const pieceLabel = (n: number): string => `${n} piece${n === 1 ? '' : 's'}`;

export const wornLabel = (p: OwnedPiece): string =>
  p.worn === 0 ? 'never worn' : `worn ${p.worn}× · best: ${p.best ?? '—'}`;

/**
 * Magazine store — the endless feed, spreads, reactions, the filters and the
 * two sheets.
 *
 * REACTIONS ARE STORED PER CARD INDEX AND READ BY NOTHING ELSE. The feed is
 * laid out by `feedSlots` over a pool built by `filteredPool`, and neither
 * consults `reactions` — that is *sample, don't sort*, and reactions-logic.md
 * §0.1 makes it the first rule of the whole feature.
 *
 * ══ THE FILTERS ARE READ NOW (4 Sep) ══
 *
 * They were stored and ignored: `filter` went into the store and the feed
 * built itself from `index % FEED_LOOKS.length` regardless. That was the real
 * work in the filters brief, and it is done here — `pool` holds the indices
 * that pass, in a sampled order, and every card maps through it.
 *
 * `seed` is bumped on every change to the filters. Same set, different order —
 * which is what keeps a filter a NARROWING and not an ordering, and is the
 * thing tests/magazine.test.ts asserts most carefully.
 */

import { create } from 'zustand';
import {
  SPREADS_PER_DAY,
  feedSlots,
  filteredPool,
  type MagazineFilter,
} from '@/domain/magazine';
import { nextHeld, type ReactionValue } from '@/domain/reactions';
import type { Category } from '@/domain/garments';
import { FEED_LOOKS } from '@/data/looks';

export type FeedCard =
  | { index: number; kind: 'H' | 'U'; lookIndex: number }
  | { index: number; kind: 'S'; spreadNumber: number };

type MagazineState = {
  /** How many cards have been generated. */
  length: number;
  /** How many spreads have been served today — capped at 6. */
  spreadsServed: number;
  /** Spread number per card index, so a re-render is stable. */
  spreadIndex: Record<number, number>;
  /**
   * WHICH SIDE was called per card index, or absent if the spread is still
   * open. It was a boolean until 4 Sep; the side is now needed because calling
   * one look visibly locks the OTHER, and a card can be scrolled out of the
   * virtualised list and back, so "which one did I pick" has to survive
   * unmounting. Presence is what `revealed` used to mean.
   */
  calls: Record<number, 'a' | 'b' | undefined>;
  /**
   * The ONE reaction this user holds per card index, or undefined.
   *
   * One value, not a set: reactions-logic.md §3 makes the nine values mutually
   * exclusive, so a person can never inflate a look's count. It was a numeric
   * index into five words before 4 Sep; it is now the value itself, so the
   * stored thing is meaningful on its own.
   */
  reactions: Record<number, ReactionValue | undefined>;
  filter: MagazineFilter;
  /**
   * Garment categories selected in the search drawer. MULTI-SELECT, OR —
   * selections widen the pool (AND starves it at launch scale).
   */
  garments: readonly Category[];
  /** Free text, matched against GARMENT NAMES ONLY — not tags, not handles.
   *  See `matchesQuery` in domain/magazine.ts for why. */
  query: string;
  searchOpen: boolean;
  /** Indices into FEED_LOOKS that pass the current filters, sampled. */
  pool: readonly number[];
  /** Bumped on every filter change, so the same set comes back in a new
   *  order. */
  seed: number;
  /** Card index whose bottom sheet is open, or null. */
  sheet: number | null;
  /** The piece being viewed close-up (a16). */
  focusedPiece: { name: string; from: string; tags: readonly string[] } | null;

  extend: (by: number) => void;
  call: (index: number, side: 'a' | 'b') => void;
  react: (index: number, value: ReactionValue) => void;
  setFilter: (f: MagazineFilter) => void;
  /** Toggle one garment. */
  toggleGarment: (c: Category) => void;
  setQuery: (q: string) => void;
  clearSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openSheet: (index: number) => void;
  closeSheet: () => void;
  focusPiece: (p: { name: string; from: string; tags: readonly string[] }) => void;
  reset: () => void;
};

const INITIAL_CARDS = 10;
const PAGE = 6;

const blank = {
  length: 0,
  spreadsServed: 0,
  spreadIndex: {} as Record<number, number>,
  calls: {} as Record<number, 'a' | 'b' | undefined>,
  reactions: {} as Record<number, ReactionValue | undefined>,
  filter: 'All' as MagazineFilter,
  garments: [] as readonly Category[],
  query: '',
  searchOpen: false,
  sheet: null,
  focusedPiece: null,
};

/** Rebuild the pool and reset the stream. Every filter change goes through
 *  here, so there is one place where a new seed is drawn and one place where
 *  the feed is rewound to card zero. */
const repool = (next: {
  filter: MagazineFilter;
  garments: readonly Category[];
  query: string;
}) => {
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffff)) >>> 0;
  return {
    ...blank,
    ...next,
    seed,
    pool: filteredPool(FEED_LOOKS, next.filter, next.garments, next.query, seed),
  };
};

const INITIAL_SEED = 1;

export const useMagazine = create<MagazineState>((set) => ({
  ...blank,
  seed: INITIAL_SEED,
  pool: filteredPool(FEED_LOOKS, 'All', [], '', INITIAL_SEED),

  /**
   * Spread numbers are allocated from the LAID-OUT SLOTS, not from `kindAt`.
   * They used to come straight off the cadence, which was fine while the
   * cadence was the only layout — it is not any more: under a filter other
   * than `All` spreads sit at a spacing instead, and under a single-type chip
   * there are none at all. Reading the slots keeps the numbering in step with
   * wherever the spreads actually landed.
   */
  extend: (by) =>
    set((s) => {
      const length = s.length + by;
      const slots = feedSlots(FEED_LOOKS, s.pool, s.filter, length);
      const spreadIndex = { ...s.spreadIndex };
      let spreadsServed = s.spreadsServed;
      slots.forEach((slot, i) => {
        if (slot.kind === 'S' && spreadIndex[i] === undefined) {
          spreadIndex[i] = spreadsServed;
          spreadsServed += 1;
        }
      });
      return { length, spreadIndex, spreadsServed };
    }),

  /** Once called, a spread stays called — there is no re-roll, same as an
   *  entry. The guard means a second tap on the already-locked pair cannot
   *  quietly change the answer. */
  call: (index, side) =>
    set((s) => (s.calls[index] ? s : { calls: { ...s.calls, [index]: side } })),

  /**
   * Replace, or clear if you tapped what you already held. The rule lives in
   * `nextHeld` (domain/reactions.ts) rather than here — it is the spec's core
   * constraint and it is unit-tested there.
   *
   * NOTHING ELSE HAPPENS. No token moves (reactions mint nothing), no feed
   * reordering (the sampler never reads this), no ladder. If a future edit
   * makes this function call into another store, read domain/reactions.ts §0
   * first.
   */
  react: (index, value) =>
    set((s) => ({
      reactions: { ...s.reactions, [index]: nextHeld(s.reactions[index], value) },
    })),

  /** Changing any filter rebuilds the pool and rewinds to card zero. */
  setFilter: (filter) =>
    set((s) => repool({ filter, garments: s.garments, query: s.query })),

  toggleGarment: (c) =>
    set((s) =>
      repool({
        filter: s.filter,
        garments: s.garments.includes(c) ? s.garments.filter((g) => g !== c) : [...s.garments, c],
        query: s.query,
      }),
    ),

  setQuery: (query) => set((s) => repool({ filter: s.filter, garments: s.garments, query })),

  /** Clears the garment axis only. The rail chip is a separate question and
   *  stays — the thin-result note offers each of them separately for exactly
   *  this reason. */
  clearSearch: () => set((s) => repool({ filter: s.filter, garments: [], query: '' })),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  focusPiece: (focusedPiece) => set({ focusedPiece }),
  reset: () => set(blank),
}));

export const FIRST_PAGE = INITIAL_CARDS;
export const NEXT_PAGE = PAGE;

/**
 * Build the descriptor list the FlatList renders.
 *
 * Every look card carries a `lookIndex` INTO FEED_LOOKS, resolved through the
 * filtered pool — so a card can only ever show something that passed the
 * filters. Before 4 Sep this was `lookIndex: i`, which is why the rail changed
 * nothing.
 */
export function cards(state: {
  length: number;
  spreadIndex: Record<number, number>;
  pool: readonly number[];
  filter: MagazineFilter;
}): FeedCard[] {
  const slots = feedSlots(FEED_LOOKS, state.pool, state.filter, state.length);
  return slots.map((slot, i) =>
    slot.kind === 'S'
      ? { index: i, kind: 'S' as const, spreadNumber: state.spreadIndex[i] ?? 0 }
      : { index: i, kind: slot.kind, lookIndex: slot.poolIndex },
  );
}

export const spreadIsCapped = (spreadNumber: number): boolean =>
  spreadNumber >= SPREADS_PER_DAY;

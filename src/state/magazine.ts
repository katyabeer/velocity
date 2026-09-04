/**
 * Magazine store — the endless feed, spreads, reactions, and the bottom sheet.
 *
 * REACTIONS ARE STORED PER CARD INDEX AND READ BY NOTHING ELSE. `cards()` below
 * builds the list from the cadence and the pool by modulo, and never consults
 * `reactions` — that is *sample, don't sort*, and reactions-logic.md §0.1 makes
 * it the first rule of the whole feature.
 *
 * The feed is an index-driven infinite list: card N's kind comes from the
 * cadence, and its content from the pool by modulo. That is the prototype's
 * behaviour and it is fine for a test build. When the real sampler lands, keep
 * `kindAt` and replace only the content lookup — and read the banner at the top
 * of domain/magazine.ts first.
 */

import { create } from 'zustand';
import { SPREADS_PER_DAY, kindAt, type CardKind } from '@/domain/magazine';
import { nextHeld, type ReactionValue } from '@/domain/reactions';

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
  filter: string;
  /** Card index whose bottom sheet is open, or null. */
  sheet: number | null;
  /** The piece being viewed close-up (a16). */
  focusedPiece: { name: string; from: string; tags: readonly string[] } | null;

  extend: (by: number) => void;
  call: (index: number, side: 'a' | 'b') => void;
  react: (index: number, value: ReactionValue) => void;
  setFilter: (f: string) => void;
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
  filter: 'All',
  sheet: null,
  focusedPiece: null,
};

export const useMagazine = create<MagazineState>((set) => ({
  ...blank,

  extend: (by) =>
    set((s) => {
      const spreadIndex = { ...s.spreadIndex };
      let spreadsServed = s.spreadsServed;
      for (let i = s.length; i < s.length + by; i++) {
        if (kindAt(i) === 'S' && spreadIndex[i] === undefined) {
          spreadIndex[i] = spreadsServed;
          spreadsServed += 1;
        }
      }
      return { length: s.length + by, spreadIndex, spreadsServed };
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

  /** Changing the filter rebuilds the feed from card zero. NOTE: the rail is
   *  visually live but does not yet change the content pool — see
   *  FILTER_RAIL_IS_FUNCTIONAL in domain/magazine.ts. Do not demo it as working. */
  setFilter: (filter) => set({ ...blank, filter }),
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  focusPiece: (focusedPiece) => set({ focusedPiece }),
  reset: () => set(blank),
}));

export const FIRST_PAGE = INITIAL_CARDS;
export const NEXT_PAGE = PAGE;

/** Build the descriptor list the FlatList renders. */
export function cards(state: {
  length: number;
  spreadIndex: Record<number, number>;
}): FeedCard[] {
  const out: FeedCard[] = [];
  for (let i = 0; i < state.length; i++) {
    const kind: CardKind = kindAt(i);
    if (kind === 'S') {
      out.push({ index: i, kind: 'S', spreadNumber: state.spreadIndex[i] ?? 0 });
    } else {
      out.push({ index: i, kind, lookIndex: i });
    }
  }
  return out;
}

/** A spread past the daily cap renders the "come back tomorrow" card instead. */
export const spreadIsCapped = (spreadNumber: number): boolean => spreadNumber >= SPREADS_PER_DAY;

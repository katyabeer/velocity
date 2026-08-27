/**
 * Magazine store — the endless feed, spreads, reactions, and the bottom sheet.
 *
 * The feed is an index-driven infinite list: card N's kind comes from the
 * cadence, and its content from the pool by modulo. That is the prototype's
 * behaviour and it is fine for a test build. When the real sampler lands, keep
 * `kindAt` and replace only the content lookup — and read the banner at the top
 * of domain/magazine.ts first.
 */

import { create } from 'zustand';
import { SPREADS_PER_DAY, kindAt, type CardKind } from '@/domain/magazine';

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
  /** Which spreads have been called, and therefore revealed. */
  revealed: Record<number, boolean>;
  /** Which reaction is active per card index. */
  reactions: Record<number, number | undefined>;
  filter: string;
  /** Card index whose bottom sheet is open, or null. */
  sheet: number | null;
  /** The piece being viewed close-up (a16). */
  focusedPiece: { name: string; from: string; tags: readonly string[] } | null;

  extend: (by: number) => void;
  reveal: (index: number) => void;
  react: (index: number, reaction: number) => void;
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
  revealed: {} as Record<number, boolean>,
  reactions: {} as Record<number, number | undefined>,
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

  reveal: (index) => set((s) => ({ revealed: { ...s.revealed, [index]: true } })),

  react: (index, reaction) =>
    set((s) => ({
      reactions: {
        ...s.reactions,
        [index]: s.reactions[index] === reaction ? undefined : reaction,
      },
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

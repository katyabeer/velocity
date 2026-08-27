/**
 * Wardrobe fixtures for the three test states.
 *
 * The HUD is gone, so the day is chosen by editing ONE constant in
 * src/config/testState.ts. These builders are what it reaches for.
 *
 * Day 1 principles (handover §11):
 *  · no result act on Today at all — absent, not empty
 *  · the overnight-token roundel is HIDDEN, because a zero there would be a lie
 *  · the shuffled "try these" rail is hidden — a nudge drawn from eight things
 *    you can already see is noise
 *  · Looks and Saved carry real empty states
 */

import { categoryOf, slotOf, type Category } from '../domain/garments';
import { capsuleByKey, type CapsuleKey } from './capsules';

/** How a piece arrived. Shown in the wardrobe tile. */
export type Provenance = 'starter' | 'taken' | 'piece-brief';

export type OwnedPiece = {
  name: string;
  category: Category;
  /** Times worn. */
  worn: number;
  /** Best band this piece has been part of, or null if never worn. */
  best: string | null;
  provenance: Provenance;
  /** Arrived today — gets the Klein outline. */
  isNew?: boolean;
};

/** Day 1 — the capsule you chose at signup, nothing worn. */
export function inventoryDayOne(capsule: CapsuleKey): OwnedPiece[] {
  return capsuleByKey(capsule).pieces.map((name) => ({
    name,
    category: categoryOf(name),
    worn: 0,
    best: null,
    provenance: 'starter' as const,
  }));
}

/** Pieces that arrive overnight on Day 2, drawn from the shared pool. */
const DAY_TWO_ARRIVALS = [
  'charcoal coat',
  'derby',
  'tote',
  'red bag',
  'roll neck',
  'trench',
  'black knit',
] as const;

/**
 * Day 2 — the same capsule with one piece worn per slot, plus three that came
 * out of last night's judging.
 */
export function inventoryDayTwo(capsule: CapsuleKey): OwnedPiece[] {
  const base = capsuleByKey(capsule).pieces;
  const seen = new Set<string>();
  const out: OwnedPiece[] = base.map((name) => {
    const slot = slotOf(name);
    const first = !seen.has(slot);
    seen.add(slot);
    return {
      name,
      category: categoryOf(name),
      worn: first ? 1 : 0,
      best: first ? 'Upper half' : null,
      provenance: 'starter' as const,
    };
  });

  DAY_TWO_ARRIVALS.filter((n) => !base.includes(n))
    .slice(0, 3)
    .forEach((name) =>
      out.push({
        name,
        category: categoryOf(name),
        worn: 0,
        best: null,
        provenance: 'taken',
        isNew: true,
      }),
    );

  return out;
}

/** Established — the 26-piece sample standing in for a 96-piece wardrobe. */
export const INVENTORY_ESTABLISHED: readonly OwnedPiece[] = [
  { name: 'wool coat', category: 'Outerwear', worn: 6, best: 'Top of the room', provenance: 'taken' },
  { name: 'charcoal coat', category: 'Outerwear', worn: 2, best: 'Upper half', provenance: 'piece-brief' },
  { name: 'trench', category: 'Outerwear', worn: 4, best: 'Upper half', provenance: 'taken' },
  { name: 'parka', category: 'Outerwear', worn: 1, best: 'Lower half', provenance: 'starter' },
  { name: 'denim jacket', category: 'Outerwear', worn: 0, best: null, provenance: 'taken', isNew: true },
  { name: 'black knit', category: 'Tops', worn: 9, best: 'Top of the room', provenance: 'starter' },
  { name: 'white shirt', category: 'Tops', worn: 7, best: 'Upper half', provenance: 'starter' },
  { name: 'roll neck', category: 'Tops', worn: 3, best: 'Upper half', provenance: 'taken' },
  { name: 'silk shirt', category: 'Tops', worn: 2, best: 'Lower half', provenance: 'taken' },
  { name: 'shell top', category: 'Tops', worn: 1, best: null, provenance: 'taken' },
  { name: 'crochet top', category: 'Tops', worn: 0, best: null, provenance: 'taken', isNew: true },
  { name: 'grey trouser', category: 'Bottoms', worn: 8, best: 'Top of the room', provenance: 'starter' },
  { name: 'straight jean', category: 'Bottoms', worn: 5, best: 'Upper half', provenance: 'starter' },
  { name: 'wide leg', category: 'Bottoms', worn: 3, best: 'Upper half', provenance: 'taken' },
  { name: 'midi skirt', category: 'Bottoms', worn: 2, best: 'Lower half', provenance: 'taken' },
  { name: 'cigarette pant', category: 'Bottoms', worn: 0, best: null, provenance: 'taken', isNew: true },
  { name: 'derby', category: 'Shoes', worn: 6, best: 'Top of the room', provenance: 'piece-brief' },
  { name: 'tan boot', category: 'Shoes', worn: 4, best: 'Upper half', provenance: 'starter' },
  { name: 'loafer', category: 'Shoes', worn: 3, best: 'Upper half', provenance: 'taken' },
  { name: 'trainer', category: 'Shoes', worn: 2, best: 'Lower half', provenance: 'starter' },
  { name: 'mule', category: 'Shoes', worn: 0, best: null, provenance: 'taken', isNew: true },
  { name: 'red bag', category: 'Extras', worn: 5, best: 'Top of the room', provenance: 'taken' },
  { name: 'leather glove', category: 'Extras', worn: 2, best: 'Upper half', provenance: 'piece-brief' },
  { name: 'silk scarf', category: 'Extras', worn: 1, best: null, provenance: 'starter' },
  { name: 'tote', category: 'Extras', worn: 3, best: 'Upper half', provenance: 'taken' },
  { name: 'beret', category: 'Extras', worn: 0, best: null, provenance: 'taken', isNew: true },
];

/**
 * The established builder pool — the fixed twelve.
 *
 * On days 1 and 2 the builder generates its grid from YOUR INVENTORY instead,
 * which on day one is the capsule you chose. Picking *Street and sport* at
 * signup means the builder offers a parka and a hoodie, not a wool coat.
 */
export const BUILDER_POOL_ESTABLISHED = [
  'wool coat',
  'parka',
  'trench',
  'black knit',
  'white shirt',
  'roll neck',
  'grey trouser',
  'denim',
  'tan boot',
  'trainer',
  'red bag',
  'silk scarf',
] as const;

/** The two loaner pieces offered per brief. They go back at close. */
export const LOAN_PIECES = ['sequin blazer', 'gold sandal'] as const;

/** Looks archive fixtures. */
export type ArchiveEntry = {
  job: string;
  /** Band name, or 'flat' for a saved combination that was never rendered. */
  band: string;
  when: string;
  note: string;
};

export const ARCHIVE_DAY_ONE: readonly ArchiveEntry[] = [];

export const ARCHIVE_DAY_TWO: readonly ArchiveEntry[] = [
  { job: 'The interview', band: 'Upper half', when: 'yesterday', note: 'your first · 3 took a piece' },
];

export const ARCHIVE_ESTABLISHED: readonly ArchiveEntry[] = [
  { job: 'Dinner, unrendered', band: 'flat', when: 'today', note: '4 pieces · saved as a set' },
  { job: 'The interview', band: 'Upper half', when: 'yesterday', note: '9 took a piece' },
  { job: 'Airport', band: 'Top of the room', when: '2 days ago', note: '14 took a piece' },
  { job: 'Night out', band: 'Lower half', when: '3 days ago', note: 'read as safe' },
  { job: 'The orange coat', band: 'Upper half', when: '5 days ago', note: 'piece-brief' },
  { job: 'School run', band: 'Upper half', when: '6 days ago', note: '4 took a piece' },
  { job: 'Wedding', band: 'Top of the room', when: 'last week', note: 'best of the month so far' },
  { job: 'Dinner', band: 'Lower half', when: 'last week', note: 'went for sharp, read as fussy' },
  { job: 'Nowhere', band: 'Upper half', when: 'last week', note: 'only one' },
];

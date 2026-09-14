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

import type { ImageSourcePropType } from 'react-native';
import { categoryOf, type Category } from '../domain/garments';
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
  /** Real photo, Day 1 review pieces only for now — see
   *  data/inventoryReview.ts's INVENTORY_DAY_ONE_REVIEW (a separate file,
   *  same reason data/looks.ts is separate: its require()'d images aren't
   *  loadable under the plain-Node test runner, so nothing tested imports
   *  it). Optional, same pattern as Look.image in data/looks.ts:
   *  InventoryTile falls back to a text placeholder when it's absent. */
  image?: ImageSourcePropType;
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

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  DAY 2 — THE RETURNING STATE'S WARDROBE. THIRTY PIECES, ALL REAL NAMES.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Katya, 13 Sep: "lots more items in their wardrobe to reflect what they've
 * been pinching, saving and buying through the app."
 *
 * ⚠ AND IT FIXES A LIVE BUG, which is the more important half. This used to be
 * derived from `capsuleByKey(capsule).pieces` — and every capsule name is an
 * original prototype short name (`wool coat`, `roll neck`, `red bag`). The
 * AW26 catalogue carries NONE of them, so `garmentImage` returned undefined
 * and day 2 drew a grey named box in every wardrobe tile, slot cell and flat
 * lay. It was on the open-questions list as "Day 2 and Established show GREY
 * PLACEHOLDERS, not clothes", and it undercut anything that showed a look.
 * Written straight against the catalogue, there is nothing left to resolve:
 * `garm_<kebab-name>.png` is an exact bijection with those sixty names.
 *
 *   ⚠ ESTABLISHED IS STILL BROKEN THIS WAY. `INVENTORY_ESTABLISHED` below is
 *   twenty-six legacy names and none of them hit the catalogue either. Left
 *   alone on purpose — it is the far-future reference state, not a state
 *   anyone is being shown — but it is the same one-hour job if it is ever
 *   demoed.
 *
 * ─── THE CAPSULE PARAMETER IS GONE ─────────────────────────────────────────
 * This was its last caller. The capsule picker was cut on 3 Sep ("it asked a
 * new user to choose clothes before they had seen a job"), so the argument was
 * choosing between four fixtures nobody can pick any more.
 *
 * ─── WHERE THEY CAME FROM, AND WHY THE SPREAD IS UNEVEN ────────────────────
 * The mix is the story of five days rather than a tidy split:
 *
 *   starter      5   the look they entered on day 1. `adoptLook` marks an
 *                    adopted look 'starter', so this matches what the day-1
 *                    participant's own wardrobe would say the next morning
 *   taken       21   the magazine, paid for with tokens over four nights.
 *                    Invariant 1 — every one of these cost a judging round
 *   piece-brief  4   the app handed them over ("The orange coat: we are giving
 *                    you the coat"). Not bought, not taken — invariant 16
 *
 * `worn` and `best` are the only per-piece history anywhere in the app, and
 * invariant 14 keeps them OUT of the builder — the wardrobe and the result
 * screen are the only two places they may appear. So they are worth making
 * non-trivial: a handful of pieces carry most of the wear, which is the shape
 * the You screen's insight then reports honestly rather than inventing.
 *
 * COVERS ALL FIVE SLOTS SEVERAL TIMES OVER, which the slot pickers need — a
 * slot with one option in it is a drawer that wastes a tap.
 */
const WARDROBE_DAY_TWO: readonly OwnedPiece[] = (
  [
  /* ── the day-1 look, adopted ── */
  { name: 'funnel neck wool coat', worn: 4, best: 'Upper quarter', provenance: 'starter' },
  { name: 'black fine turtleneck', worn: 5, best: 'Upper quarter', provenance: 'starter' },
  { name: 'charcoal suit trouser', worn: 3, best: 'Upper half', provenance: 'starter' },
  { name: 'glove pump heel', worn: 3, best: 'Upper quarter', provenance: 'starter' },
  { name: 'supersized tote', worn: 2, best: 'Upper half', provenance: 'starter' },

  /* ── taken from the magazine ── */
  { name: 'belted double breasted overcoat', worn: 2, best: 'Upper half', provenance: 'taken' },
  { name: 'structured trench coat', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'black leather biker jacket', worn: 2, best: 'Lower half', provenance: 'taken' },
  { name: 'charcoal suit jacket', worn: 1, best: 'Upper quarter', provenance: 'taken' },
  { name: 'suede jacket', worn: 0, best: null, provenance: 'taken' },
  { name: 'crisp poplin shirt', worn: 3, best: 'Upper quarter', provenance: 'taken' },
  { name: 'silk charmeuse blouse', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'fair isle cable jumper', worn: 1, best: 'Lower half', provenance: 'taken' },
  { name: 'boxy broad shoulder knit', worn: 0, best: null, provenance: 'taken' },
  { name: 'velvet jewel tone dress', worn: 1, best: 'Top of the room', provenance: 'taken' },
  { name: 'wide leg wool trouser', worn: 2, best: 'Upper half', provenance: 'taken' },
  { name: 'pleated wool trouser', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'dark indigo straight jean', worn: 2, best: 'Lower half', provenance: 'taken' },
  { name: 'leather tailored skirt', worn: 0, best: null, provenance: 'taken' },
  { name: 'charcoal check pencil skirt', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'slim penny loafer', worn: 2, best: 'Upper quarter', provenance: 'taken' },
  { name: 'chunky lug loafer', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'chocolate suede boot', worn: 1, best: 'Lower half', provenance: 'taken' },
  { name: 'east west shoulder bag', worn: 2, best: 'Upper quarter', provenance: 'taken' },
  { name: 'maxi wrap scarf', worn: 1, best: 'Upper half', provenance: 'taken' },
  { name: 'leather gloves', worn: 0, best: null, provenance: 'taken' },

  /* ── the app gave them these ── */
  { name: 'plaid check overcoat', worn: 0, best: null, provenance: 'piece-brief' },
  { name: 'pointed stiletto knee boot', worn: 0, best: null, provenance: 'piece-brief' },

  /* ── LAST NIGHT'S. `isNew` is the Klein outline in the wardrobe, and two of
        them is enough to say "something arrived" without the grid looking like
        it was all bought at once ── */
  { name: 'Le Smoking tuxedo jacket', worn: 0, best: null, provenance: 'taken', isNew: true },
  { name: 'jewelled evening clutch', worn: 0, best: null, provenance: 'piece-brief', isNew: true },
  ] as const satisfies readonly Omit<OwnedPiece, 'category'>[]
  /* `category` is DERIVED, never written. `classify()` owns the mapping from a
     name to its slot and category, and a hand-written category here is a
     second source of truth that silently disagrees the first time a rule
     changes. */
).map((p) => ({ ...p, category: categoryOf(p.name) }));

/**
 * ⚠ NO ARGUMENT ANY MORE — see the note above. Returns a fresh array because
 * the store mutates what it is handed.
 */
export function inventoryDayTwo(): OwnedPiece[] {
  return WARDROBE_DAY_TWO.map((p) => ({ ...p }));
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
  { name: 'silk scarf', category: 'Accessories', worn: 1, best: null, provenance: 'starter' },
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

/**
 * The fallback loan shelf — the pieces offered when there is no better answer.
 *
 * ⟲ WAS `sequin blazer` / `gold sandal`, 13 Sep. Neither is a catalogue name,
 * so both rendered as grey named boxes in the drawer: the mechanism that exists
 * so a thin wardrobe cannot lock you out was itself showing placeholders. Same
 * rot as the day-2 wardrobe fixture had.
 *
 * ⚠ THE RETURNING STATE DOES NOT USE THIS. Day 2 draws its shelf from the
 * catalogue minus what you own, computed in `today/build.tsx` where the
 * catalogue is already imported — which is both bigger and always correct.
 * This is what day 3 falls back to, and `BUILDER_POOL_ESTABLISHED` below is
 * still twelve legacy names, so that day's drawer is grey with or without it.
 */
export const LOAN_PIECES = ['leopard faux fur coat', 'embellished kitten heel'] as const;

/** Looks archive fixtures. */
export type ArchiveEntry = {
  job: string;
  /**
   * Band name, or one of two non-band states:
   *   'flat'  a saved combination that was never rendered
   *   'live'  entered and rendered, but the room has not settled it yet
   *
   * 'live' exists because the Looks tab is "everything you've entered" and an
   * entry lands there the moment its render does — hours before there is a
   * band. Showing a band there would be inventing a result; the row says
   * "settles at 7am" instead. Never a number, either: locked decision 5.
   */
  band: string;
  when: string;
  note: string;
  /**
   * The garments in it, newest entries only. Drives the row's thumbnail — a
   * real composed flat lay rather than the empty grey plate the fixtures get.
   * Optional because the Day 2/3 fixtures below are pre-dated placeholders
   * with no piece list to draw.
   */
  pieces?: readonly string[];
};

export const ARCHIVE_DAY_ONE: readonly ArchiveEntry[] = [];

/**
 * TEN PAST LOOKS, and every one carries `pieces` — which is what turns the
 * archive row's thumbnail into a real composed flat lay instead of the empty
 * grey plate the old single fixture got. Job names come from `playedBriefs()`
 * in data/challenges.ts, most recent first, so the archive, the result card and
 * the You screen's post list all tell one story.
 *
 * ⟲ IT WAS SIX UNTIL 13 Sep, and that was a visible hole: the You screen's
 * `All 10 looks →` reads `r.looks`, so the link promised ten and the list it
 * opened held six. Ten rows also make the day arithmetic work — TWO A DAY,
 * which is exactly what invariant 22 allows (one brief, one freestyle), across
 * the five days behind today. Today's brief is not in here because it has not
 * been entered yet; the card still says Complete now.
 *
 * ⚠ FIVE OF THE TEN CARRY A BAND. The rest are `free` (no brief settles a look
 * nobody asked for) or `flat` (saved, never generated). So `looksSettled: 10`
 * in the You rollup is looser than this list — it is the figure that clears the
 * `Strength` tip's threshold, and dropping it to five deletes the whole
 * `Just for you` section, because `qualifyingTips` holds a lone Weakness.
 * Flagged rather than reconciled: the thresholds are themselves unmeasured
 * estimates (you-brief q4).
 *
 * ⚠ ONE ROW IS A `flat` BAND, and that is a state rather than a result: a saved
 * combination that never generated. Its thumbnail stays a flat lay even once
 * `ui/RenderedLook` is showing worn photography everywhere else, because a worn
 * photograph there would claim a generation that does not exist.
 *
 * Two of them are freestyle, which is why they read `free` — nothing settles a
 * look nobody was briefed for, so a band would be an invention.
 */
export const ARCHIVE_DAY_TWO: readonly ArchiveEntry[] = [
  /* ── today. The brief is still open (the card reads Complete now), so the
        only thing filed is the freestyle — and it never generated ── */
  {
    job: 'Rain, and a long walk',
    band: 'flat',
    when: 'today',
    note: '4 pieces · saved as a set',
    pieces: ['structured trench coat', 'black fine turtleneck', 'wide leg wool trouser', 'chunky lug loafer'],
  },

  /* ── yesterday ── */
  {
    job: 'The autumn wedding',
    band: 'Upper quarter',
    when: 'yesterday',
    note: 'your best yet · 5 took a piece',
    pieces: ['funnel neck wool coat', 'velvet jewel tone dress', 'glove pump heel', 'east west shoulder bag'],
  },
  {
    job: 'Freestyle',
    band: 'free',
    when: 'yesterday',
    note: 'no brief · 27 reactions',
    pieces: ['black leather biker jacket', 'black fine turtleneck', 'charcoal suit trouser', 'pointed stiletto knee boot', 'maxi wrap scarf'],
  },

  /* ── 2 days ago ── */
  {
    job: 'The airport',
    band: 'Upper half',
    when: '2 days ago',
    note: '3 took a piece',
    pieces: ['belted double breasted overcoat', 'fair isle cable jumper', 'dark indigo straight jean', 'chocolate suede boot', 'supersized tote'],
  },
  {
    job: 'Freestyle',
    band: 'free',
    when: '2 days ago',
    note: 'no brief · 9 reactions',
    pieces: ['suede jacket', 'crisp poplin shirt', 'leather tailored skirt', 'slim penny loafer', 'leather gloves'],
  },

  /* ── 3 days ago ── */
  {
    job: 'One bold piece',
    band: 'Lower half',
    when: '3 days ago',
    note: 'went for sharp, read as busy',
    pieces: ['plaid check overcoat', 'silk charmeuse blouse', 'leather tailored skirt', 'glove pump heel', 'jewelled evening clutch'],
  },
  {
    job: 'Freestyle',
    band: 'free',
    when: '3 days ago',
    note: 'no brief · 4 reactions',
    pieces: ['Le Smoking tuxedo jacket', 'crisp poplin shirt', 'pleated wool trouser', 'slim penny loafer'],
  },

  /* ── 4 days ago ── */
  {
    job: 'Monochrome',
    band: 'Upper half',
    when: '4 days ago',
    note: '2 took a piece',
    pieces: ['charcoal suit jacket', 'black fine turtleneck', 'charcoal suit trouser', 'slim penny loafer', 'supersized tote'],
  },
  {
    job: 'Freestyle',
    band: 'free',
    when: '4 days ago',
    note: 'no brief · 2 reactions',
    pieces: ['funnel neck wool coat', 'boxy broad shoulder knit', 'charcoal check pencil skirt', 'chocolate suede boot'],
  },

  /* ── 5 days ago — the first look they ever entered ── */
  {
    job: 'Sunday, nowhere',
    band: 'Upper half',
    when: '5 days ago',
    note: 'your first · 1 took a piece',
    pieces: ['structured trench coat', 'crisp poplin shirt', 'dark indigo straight jean', 'chunky lug loafer', 'maxi wrap scarf'],
  },
];

export const ARCHIVE_ESTABLISHED: readonly ArchiveEntry[] = [
  { job: 'Dinner, not generated', band: 'flat', when: 'today', note: '4 pieces · saved as a set' },
  { job: 'The interview', band: 'Upper half', when: 'yesterday', note: '9 took a piece' },
  { job: 'Airport', band: 'Top of the room', when: '2 days ago', note: '14 took a piece' },
  { job: 'Night out', band: 'Lower half', when: '3 days ago', note: 'read as safe' },
  { job: 'The orange coat', band: 'Upper half', when: '5 days ago', note: 'piece-brief' },
  { job: 'School run', band: 'Upper half', when: '6 days ago', note: '4 took a piece' },
  { job: 'Wedding', band: 'Top of the room', when: 'last week', note: 'best of the month so far' },
  { job: 'Dinner', band: 'Lower half', when: 'last week', note: 'went for sharp, read as fussy' },
  { job: 'Nowhere', band: 'Upper half', when: 'last week', note: 'only one' },
];

/**
 * ⚠ FIXTURE, ESTABLISHED ONLY. "Your words" on the You screen is your five
 * most-used tags, counted from what you have actually published (`tagHistory`
 * in state/create.ts) — which is real and live on days 1 and 2.
 *
 * Established claims 44 freestyle posts, and there is no way to have written
 * 44 posts' worth of tags in a prototype that reboots on save, so this stands
 * in for their history. Repeats are the point: the counts are what rank them.
 *
 * Real tags typed this session rank ALONGSIDE these rather than replacing
 * them, so the section still responds to what you do.
 */
export const TAG_HISTORY_ESTABLISHED: readonly string[] = [
  'secondhand', 'secondhand', 'secondhand', 'secondhand', 'secondhand',
  'tailoring', 'tailoring', 'tailoring', 'tailoring',
  'coldfield', 'coldfield', 'coldfield',
  'toomuchonpurpose', 'toomuchonpurpose',
  'wedding', 'wedding',
  'tuesday',
];

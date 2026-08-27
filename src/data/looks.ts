/**
 * Look fixtures. Stand-ins for imagery — every plate renders as a tinted panel
 * with the occasion set large and faint behind it, exactly as in the prototype.
 *
 * When Jack's renders arrive, add an `image` field here and swap the fallback
 * inside components/LookPlate.tsx. Nothing else should need to change.
 *
 * R-L6: a failed generation still enters the pool as a composed FLAT LAY. The
 * flat lay is not a fallback — it is the unrendered state. It is needed
 * regardless, so build it as a first-class presentation, not an error screen.
 */

import type { PlateTint } from '@/theme/tokens';

export type Look = {
  tint: PlateTint;
  /** The occasion, shown as the caption kicker. */
  occasion: string;
  /** The pieces, as a display string. */
  pieces: string;
};

/** The judging pool. A 14-look pool gives ten pairs with each look appearing
 *  ~1.4× — a judging round is 10 PAIRS, not 20 looks. Reversed, do not
 *  re-propose. */
export const JUDGING_LOOKS: readonly Look[] = [
  { tint: 't2', occasion: 'Your ex', pieces: 'leather jacket · slip dress · ankle boot' },
  { tint: 't0', occasion: 'Your ex', pieces: 'blazer · silk tee · straight jean · loafer' },
  { tint: 't4', occasion: 'Your ex', pieces: 'trench · roll neck · wide leg · trainer' },
  { tint: 't5', occasion: 'Your ex', pieces: 'knit vest · midi skirt · knee boot · cuff' },
  { tint: 't1', occasion: 'Your ex', pieces: 'denim jacket · white shirt · cigarette pant' },
  { tint: 't3', occasion: 'Your ex', pieces: 'shirt dress · slim belt · mule · hoop' },
  { tint: 't0', occasion: 'Your ex', pieces: 'cashmere · straight leg · derby · tote' },
  { tint: 't2', occasion: 'Your ex', pieces: 'satin shirt · denim · heel · clutch' },
  { tint: 't5', occasion: 'Your ex', pieces: 'suit jacket · tee · wide leg · sneaker' },
  { tint: 't4', occasion: 'Your ex', pieces: 'crochet top · pleat trouser · flat' },
  { tint: 't1', occasion: 'Your ex', pieces: 'shacket · shell top · jean · boot' },
  { tint: 't3', occasion: 'Your ex', pieces: 'column dress · cardigan · sandal' },
  { tint: 't0', occasion: 'Your ex', pieces: 'poplin shirt · wide leg · loafer · scarf' },
  { tint: 't5', occasion: 'Your ex', pieces: 'leather jacket · midi skirt · trainer' },
  { tint: 't2', occasion: 'Your ex', pieces: 'blazer · slip dress · ankle boot · hoop' },
  { tint: 't4', occasion: 'Your ex', pieces: 'roll neck · cargo · clog · beret' },
  { tint: 't1', occasion: 'Your ex', pieces: 'trench · silk tee · jean · mule' },
  { tint: 't3', occasion: 'Your ex', pieces: 'knit vest · shirt dress · sneaker' },
  { tint: 't0', occasion: 'Your ex', pieces: 'denim jacket · cigarette pant · heel' },
  { tint: 't5', occasion: 'Your ex', pieces: 'cashmere · slip skirt · flat · clutch' },
];

/** Feed looks. `house: true` is house editorial; otherwise it came from the room. */
export type FeedLook = {
  tint: PlateTint;
  by: string;
  house: boolean;
  tags: readonly string[];
  pieces: readonly string[];
  /** Reaction counts, in REACTIONS order. Display only — never feeds ranking. */
  reactionCounts: readonly [number, number, number, number, number];
};

export const FEED_LOOKS: readonly FeedLook[] = [
  {
    tint: 't4',
    by: 'House',
    house: true,
    tags: ['funeral', 'clean', 'cold'],
    pieces: ['charcoal coat', 'black knit', 'wool trouser', 'derby', 'glove'],
    reactionCounts: [4, 61, 12, 3, 1],
  },
  {
    tint: 't1',
    by: '@rilla_k',
    house: false,
    tags: ['festival', 'brave', 'rain'],
    pieces: ['oilskin', 'crochet top', 'denim short', 'welly', 'bandana'],
    reactionCounts: [22, 2, 9, 88, 31],
  },
  {
    tint: 't5',
    by: '@onmute',
    house: false,
    tags: ['work', 'sharp', 'between'],
    pieces: ['grey suit', 'silk tee', 'oxford', 'slim belt', 'tote'],
    reactionCounts: [9, 44, 71, 6, 2],
  },
  {
    tint: 't2',
    by: 'House',
    house: true,
    tags: ['interview', 'bold', 'heat'],
    pieces: ['trench', 'shell top', 'straight leg', 'flat', 'red bag'],
    reactionCounts: [67, 11, 18, 24, 7],
  },
  {
    tint: 't3',
    by: '@dp_',
    house: false,
    tags: ['wedding', 'clean', 'cold'],
    pieces: ['wool coat', 'white shirt', 'wool trouser', 'loafer', 'silk scarf'],
    reactionCounts: [3, 79, 14, 5, 1],
  },
  {
    tint: 't0',
    by: '@moss8',
    house: false,
    tags: ['school run', 'clean', 'rain'],
    pieces: ['anorak', 'sweatshirt', 'legging', 'sneaker', 'tote'],
    reactionCounts: [2, 38, 6, 4, 0],
  },
  {
    tint: 't5',
    by: '@vee',
    house: false,
    tags: ['night out', 'fire', 'heat'],
    pieces: ['sequin blazer', 'slip dress', 'gold sandal', 'clutch', 'hoop'],
    reactionCounts: [41, 3, 12, 29, 96],
  },
  {
    tint: 't1',
    by: 'House',
    house: true,
    tags: ['airport', 'sharp', 'cold'],
    pieces: ['parka', 'roll neck', 'wide leg', 'trainer', 'cap'],
    reactionCounts: [7, 26, 52, 9, 3],
  },
  {
    tint: 't2',
    by: '@holt',
    house: false,
    tags: ['first date', 'brave', 'between'],
    pieces: ['leather jacket', 'midi skirt', 'knee boot', 'cuff', 'beret'],
    reactionCounts: [33, 8, 19, 64, 21],
  },
  {
    tint: 't4',
    by: '@nn_',
    house: false,
    tags: ['nowhere', 'clean', 'rain'],
    pieces: ['fleece', 'cargo', 'clog', 'tote', 'scarf'],
    reactionCounts: [1, 47, 4, 2, 0],
  },
];

/**
 * Spread splits. Stored, settled figures — see Jack's open question 5: these
 * CANNOT BE BACKFILLED, so if the pipeline is not writing per-look settled
 * splits now, the spreads and the eye score have no data later.
 */
export const SPREAD_SPLITS: readonly { occasion: string; share: number; why: string }[] = [
  {
    occasion: 'First date',
    share: 38,
    why: 'The room read the other one as brave. Yours read as clean — and clean has placed lower on every first date this month.',
  },
  {
    occasion: 'Interview',
    share: 54,
    why: 'You got it, and it was close. The room split over whether the shoe was too much. Close calls are the ones worth having.',
  },
  {
    occasion: 'Wedding',
    share: 71,
    why: 'Comfortable. Most people saw it your way — which means this pair barely moves your eye.',
  },
  {
    occasion: 'Festival',
    share: 47,
    why: 'A coin toss. Nobody agrees on festival, which is why it rewards turning up.',
  },
  {
    occasion: 'Work',
    share: 62,
    why: "You were right and it wasn't obvious. This is the kind of pair that actually shifts things.",
  },
];

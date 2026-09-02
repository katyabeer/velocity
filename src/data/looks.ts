/**
 * Look fixtures. Day 1 magazine and judging pools now carry real photos
 * (`assets/looks/d1/`, resized from the AW26 delivery in `assets-source/` —
 * see `delivery_sheet_looks.csv` for the source metadata). Day 2/3 and
 * onboarding entries are untouched and still render as a tinted panel with
 * the occasion set large and faint behind it, exactly as in the prototype —
 * `image` is optional for exactly that reason; `LookPlate.tsx` falls back
 * to the tint when it's absent.
 *
 * R-L6: a failed generation still enters the pool as a composed FLAT LAY. The
 * flat lay is not a fallback — it is the unrendered state. It is needed
 * regardless, so build it as a first-class presentation, not an error screen.
 */

import type { ImageSourcePropType } from 'react-native';
import type { PlateTint } from '@/theme/tokens';

export type Look = {
  tint: PlateTint;
  /** The occasion, shown as the caption kicker. */
  occasion: string;
  /** The pieces, as a display string. */
  pieces: string;
  /** Real photo, Day 1 judge pool only for now. Optional — see header comment. */
  image?: ImageSourcePropType;
  /** Judging tier — never pair two `weak` looks together (see domain/magazine.ts). */
  tier?: 'strong' | 'mid' | 'weak';
};

/**
 * The judging pool — real Day 1 photos (`delivery_sheet_looks.csv`,
 * `surface: judge`, `day: d1`). 14 looks — the placeholder data this
 * replaces had drifted to 20; this restores the pool to the size the
 * pairing logic was actually designed around (each fixed `[i*2]`/`[i*2+1]`
 * pair, walked by `today/judging.tsx` and `FeedCards.tsx`'s `SpreadCard`,
 * both consumers of this same array).
 *
 * ORDER IS DELIBERATE, NOT ALPHABETICAL OR CSV ORDER. The delivery's own
 * README requires: "pair weak looks against mid or strong, never
 * weak-vs-weak." Rather than write a runtime pairing algorithm, the three
 * `weak` looks are interleaved here so every fixed `[i*2]`/`[i*2+1]` pair
 * lands weak-against-strong. If you add/remove/reorder entries, re-check
 * that no adjacent pair is weak+weak.
 *
 * Every entry's `occasion` is "autumn wedding" (from the sheet) — worth
 * flagging: that's the photoshoot's styling brief, not Today's actual
 * narrative brief ("drinks with your ex..."). The old placeholder data used
 * `occasion: 'Your ex'` to match the real brief; these real photos don't
 * depict that scenario, so the caption now shows what the photo actually
 * is rather than a caption that matches the photo even less. Katya's call
 * if that mismatch needs addressing (e.g. a note that judging pairs are a
 * general skill round, not literally tonight's specific job).
 */
export const JUDGING_LOOKS: readonly Look[] = [
  {
    tint: 't0', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'velvet jewel-tone dress · funnel-neck wool coat · peep-toe pump heel · east-west shoulder bag',
    image: require('../../assets/looks/d1/look_d1_judge_01.jpg'),
  },
  {
    tint: 't1', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'belted double-breasted overcoat · black fine turtleneck · charcoal suit trouser · chunky lug loafer · supersized tote',
    image: require('../../assets/looks/d1/look_d1_judge_12.jpg'),
  },
  {
    tint: 't2', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'Le Smoking tuxedo jacket · tuxedo dress shirt · pleated wool trouser · chunky lug loafer · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_02.jpg'),
  },
  {
    tint: 't3', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'black leather biker jacket · crisp poplin shirt · dark-indigo straight jean · chocolate suede boot · shield sunglasses',
    image: require('../../assets/looks/d1/look_d1_judge_13.jpg'),
  },
  {
    tint: 't4', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'black lace gothic dress · peplum sculpted-shoulder jacket · glove pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_03.jpg'),
  },
  {
    tint: 't5', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'black leather biker jacket · boxy broad-shoulder knit · pleated wool trouser · chunky lug loafer · useless belt',
    image: require('../../assets/looks/d1/look_d1_judge_14.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'drop-waist day dress · funnel-neck wool coat · slouchy suede knee boot · bowler bag',
    image: require('../../assets/looks/d1/look_d1_judge_04.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'sweater dress · belted double-breasted overcoat · chocolate suede boot · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_05.jpg'),
  },
  {
    tint: 't2', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'funnel-neck wool coat · crisp poplin shirt · leather tailored skirt · peep-toe pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_06.jpg'),
  },
  {
    tint: 't3', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'plaid check overcoat · black fine turtleneck · wide-leg wool trouser · clean riding boot · east-west shoulder bag',
    image: require('../../assets/looks/d1/look_d1_judge_07.jpg'),
  },
  {
    tint: 't4', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'cape-detail wool coat · silk charmeuse blouse · wide-leg wool trouser · glove pump heel · bowler bag',
    image: require('../../assets/looks/d1/look_d1_judge_08.jpg'),
  },
  {
    tint: 't5', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'charcoal suit jacket · tuxedo dress shirt · charcoal suit trouser · slim penny loafer · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_09.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'structured trench coat · peplum knit top · drop-waist pencil skirt · glove pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_10.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'funnel-neck wool coat · argyle drop-shoulder sweater · dark-indigo straight jean · chocolate suede boot · maxi wrap scarf',
    image: require('../../assets/looks/d1/look_d1_judge_11.jpg'),
  },
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
  image?: ImageSourcePropType;
};

/**
 * Day 1 magazine pool — real photos, from `delivery_sheet_looks.csv`
 * (`surface: mag`, `day: d1`). `type` H/U in that sheet is `house` here;
 * `garments` there is `pieces` here (split into a list — it drives
 * take-a-piece in the bottom sheet). Handles for the `U` (user) entries
 * are invented — the sheet doesn't carry a handle column.
 */
export const FEED_LOOKS: readonly FeedLook[] = [
  {
    tint: 't0',
    by: 'House',
    house: true,
    tags: ['fashion week', 'fire', 'cold'],
    pieces: ['leopard faux-fur coat', 'black fine turtleneck', 'low-rise stirrup trouser', 'glove pump heel', 'shield sunglasses'],
    reactionCounts: [5, 8, 3, 12, 58],
    image: require('../../assets/looks/d1/look_d1_mag_01.jpg'),
  },
  {
    tint: 't1',
    by: 'House',
    house: true,
    tags: ['night out', 'brave', 'rain'],
    pieces: ['black lace gothic dress', 'cape-detail wool coat', 'glove pump heel', 'east-west shoulder bag'],
    reactionCounts: [9, 3, 14, 71, 6],
    image: require('../../assets/looks/d1/look_d1_mag_02.jpg'),
  },
  {
    tint: 't2',
    by: 'House',
    house: true,
    tags: ['fashion week', 'bold', 'between'],
    pieces: ['suede jacket', 'crisp poplin shirt', 'oversized plaid trouser', 'chunky lug loafer', 'bowler bag'],
    reactionCounts: [63, 10, 15, 5, 8],
    image: require('../../assets/looks/d1/look_d1_mag_03.jpg'),
  },
  {
    tint: 't3',
    by: 'House',
    house: true,
    tags: ['travel', 'clean', 'cold'],
    pieces: ['shearling-collar coat', 'fair isle cable jumper', 'dark-indigo straight jean', 'clean riding boot', 'fur trapper hat'],
    reactionCounts: [6, 55, 9, 3, 2],
    image: require('../../assets/looks/d1/look_d1_mag_04.jpg'),
  },
  {
    tint: 't4',
    by: '@perrin',
    house: false,
    tags: ['nowhere', 'clean', 'between'],
    pieces: ['belted double-breasted overcoat', 'black fine turtleneck', 'dark-indigo straight jean', 'chunky lug loafer', 'supersized tote'],
    reactionCounts: [4, 49, 7, 2, 3],
    image: require('../../assets/looks/d1/look_d1_mag_05.jpg'),
  },
  {
    tint: 't5',
    by: '@kaze_',
    house: false,
    tags: ['travel', 'clean', 'between'],
    pieces: ['suede jacket', 'argyle drop-shoulder sweater', 'wide-leg wool trouser', 'chocolate suede boot', 'maxi wrap scarf'],
    reactionCounts: [3, 44, 8, 5, 2],
    image: require('../../assets/looks/d1/look_d1_mag_06.jpg'),
  },
  {
    tint: 't0',
    by: '@lunaw',
    house: false,
    tags: ['night out', 'bold', 'between'],
    pieces: ['velvet jewel-tone dress', 'black leather biker jacket', 'mesh ballet flat', 'useless belt'],
    reactionCounts: [57, 6, 9, 18, 22],
    image: require('../../assets/looks/d1/look_d1_mag_07.jpg'),
  },
  {
    tint: 't1',
    by: '@edo8',
    house: false,
    tags: ['night out', 'sharp', 'between'],
    pieces: ['Le Smoking tuxedo jacket', 'silk charmeuse blouse', 'drop-waist pencil skirt', 'embellished kitten heel', 'jewelled evening clutch'],
    reactionCounts: [8, 5, 61, 4, 12],
    image: require('../../assets/looks/d1/look_d1_mag_08.jpg'),
  },
  {
    tint: 't2',
    by: '@strut_',
    house: false,
    tags: ['nowhere', 'clean', 'rain'],
    pieces: ['structured trench coat', 'crisp poplin shirt', 'pleated wool trouser', 'slim penny loafer', 'leather gloves'],
    reactionCounts: [2, 52, 6, 3, 1],
    image: require('../../assets/looks/d1/look_d1_mag_09.jpg'),
  },
  {
    tint: 't3',
    by: '@nightowl',
    house: false,
    tags: ['fashion week', 'bold', 'cold'],
    pieces: ['funnel-neck wool coat', 'boxy broad-shoulder knit', 'pleated wool trouser', 'chocolate suede boot', 'shield sunglasses'],
    reactionCounts: [49, 7, 11, 9, 15],
    image: require('../../assets/looks/d1/look_d1_mag_10.jpg'),
  },
  {
    tint: 't4',
    by: '@finch',
    house: false,
    tags: ['travel', 'clean', 'rain'],
    pieces: ['plaid check overcoat', 'sweater dress', 'clean riding boot', 'supersized tote'],
    reactionCounts: [5, 41, 4, 6, 2],
    image: require('../../assets/looks/d1/look_d1_mag_11.jpg'),
  },
  {
    tint: 't5',
    by: '@rho',
    house: false,
    tags: ['nowhere', 'clean', 'between'],
    pieces: ['black leather biker jacket', 'crisp poplin shirt', 'dark-indigo straight jean', 'slim penny loafer', 'bowler bag'],
    reactionCounts: [3, 58, 5, 2, 4],
    image: require('../../assets/looks/d1/look_d1_mag_12.jpg'),
  },
  {
    tint: 't0',
    by: '@pact_',
    house: false,
    tags: ['fashion week', 'brave', 'cold'],
    pieces: ['charcoal suit jacket', 'boxy broad-shoulder knit', 'dark-indigo straight jean', 'chunky lug loafer', 'east-west shoulder bag'],
    reactionCounts: [11, 4, 7, 66, 9],
    image: require('../../assets/looks/d1/look_d1_mag_13.jpg'),
  },
  {
    tint: 't1',
    by: '@isla9',
    house: false,
    tags: ['night out', 'fire', 'between'],
    pieces: ['belted double-breasted overcoat', 'black fine turtleneck', 'statement fringe midi skirt', 'glove pump heel', 'colourful tights'],
    reactionCounts: [8, 3, 5, 14, 72],
    image: require('../../assets/looks/d1/look_d1_mag_14.jpg'),
  },
];

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
import type { LookKind, ReactionTally } from '@/domain/reactions';

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
 * RESOLVED 3 Sep 2026. Every entry's `occasion` is "autumn wedding" (from the
 * sheet), which used to contradict Today's brief ("drinks with your ex...").
 * The BRIEF moved rather than the captions — TONIGHTS_BRIEF is now the autumn
 * wedding — because the photographs are the thing that cannot be reshot. See
 * data/challenges.ts.
 */
export const JUDGING_LOOKS: readonly Look[] = [
  {
    tint: 't0', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'velvet jewel tone dress · funnel neck wool coat · peep toe pump heel · east west shoulder bag',
    image: require('../../assets/looks/d1/look_d1_judge_01.jpg'),
  },
  {
    tint: 't1', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'belted double breasted overcoat · black fine turtleneck · charcoal suit trouser · chunky lug loafer · supersized tote',
    image: require('../../assets/looks/d1/look_d1_judge_12.jpg'),
  },
  {
    tint: 't2', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'Le Smoking tuxedo jacket · tuxedo dress shirt · pleated wool trouser · chunky lug loafer · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_02.jpg'),
  },
  {
    tint: 't3', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'black leather biker jacket · crisp poplin shirt · dark indigo straight jean · chocolate suede boot · shield sunglasses',
    image: require('../../assets/looks/d1/look_d1_judge_13.jpg'),
  },
  {
    tint: 't4', tier: 'strong', occasion: 'autumn wedding',
    pieces: 'black lace gothic dress · peplum sculpted shoulder jacket · glove pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_03.jpg'),
  },
  {
    tint: 't5', tier: 'weak', occasion: 'autumn wedding',
    pieces: 'black leather biker jacket · boxy broad shoulder knit · pleated wool trouser · chunky lug loafer · useless belt',
    image: require('../../assets/looks/d1/look_d1_judge_14.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'drop waist day dress · funnel neck wool coat · slouchy suede knee boot · bowler bag',
    image: require('../../assets/looks/d1/look_d1_judge_04.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'sweater dress · belted double breasted overcoat · chocolate suede boot · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_05.jpg'),
  },
  {
    tint: 't2', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'funnel neck wool coat · crisp poplin shirt · leather tailored skirt · peep toe pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_06.jpg'),
  },
  {
    tint: 't3', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'plaid check overcoat · black fine turtleneck · wide leg wool trouser · clean riding boot · east west shoulder bag',
    image: require('../../assets/looks/d1/look_d1_judge_07.jpg'),
  },
  {
    tint: 't4', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'cape detail wool coat · silk charmeuse blouse · wide leg wool trouser · glove pump heel · bowler bag',
    image: require('../../assets/looks/d1/look_d1_judge_08.jpg'),
  },
  {
    tint: 't5', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'charcoal suit jacket · tuxedo dress shirt · charcoal suit trouser · slim penny loafer · statement brooch',
    image: require('../../assets/looks/d1/look_d1_judge_09.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'structured trench coat · peplum knit top · drop waist pencil skirt · glove pump heel · leather gloves',
    image: require('../../assets/looks/d1/look_d1_judge_10.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'autumn wedding',
    pieces: 'funnel neck wool coat · argyle drop shoulder sweater · dark indigo straight jean · chocolate suede boot · maxi wrap scarf',
    image: require('../../assets/looks/d1/look_d1_judge_11.jpg'),
  },
];

/**
 * Feed looks.
 *
 * `kind` replaced the old `house: boolean` on 4 Sep, because reactions need
 * three cases rather than two (reactions-logic.md §1): an editorial accrues to
 * nobody and feeds only the reactor's own fingerprint, a settled entry and a
 * freestyle post both accrue to their owner. `house` is derived from it.
 *
 * `mine` marks the one fixture standing in for a look YOU posted, so the
 * owner's read-only cluster and the negative threshold are both reachable in a
 * test session. ⚠ Katya — there is no real ownership model here; the magazine
 * pool is a fixture and Create's posts don't enter it. This flag is the cheapest
 * honest stand-in, not a feature.
 *
 * `reactions` is a tally over the nine-value vocabulary. NEVER read by the feed
 * sampler — see domain/reactions.ts §0.1. Negative values are seeded on the
 * owned look only, since they are the only ones anyone will ever see, and only
 * the owner will see them.
 */
export type FeedLook = {
  tint: PlateTint;
  by: string;
  kind: LookKind;
  /** True for the one look the session treats as the user's own. */
  mine?: boolean;
  tags: readonly string[];
  pieces: readonly string[];
  reactions: ReactionTally;
  image?: ImageSourcePropType;
};

export const isEditorial = (l: FeedLook): boolean => l.kind === 'editorial';

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
    kind: 'editorial',
    tags: ['fashion week', 'fire', 'cold'],
    pieces: ['leopard faux fur coat', 'black fine turtleneck', 'low rise stirrup trouser', 'glove pump heel', 'shield sunglasses'],
    reactions: { bold: 12, iconic: 5, thumbs_up: 8 },
    image: require('../../assets/looks/d1/look_d1_mag_01.jpg'),
  },
  {
    tint: 't1',
    by: 'House',
    kind: 'editorial',
    tags: ['night out', 'brave', 'rain'],
    pieces: ['black lace gothic dress', 'cape detail wool coat', 'glove pump heel', 'east west shoulder bag'],
    reactions: { iconic: 9, creative: 6, thumbs_up: 4 },
    image: require('../../assets/looks/d1/look_d1_mag_02.jpg'),
  },
  {
    tint: 't2',
    by: 'House',
    kind: 'editorial',
    tags: ['fashion week', 'bold', 'between'],
    pieces: ['suede jacket', 'crisp poplin shirt', 'oversized plaid trouser', 'chunky lug loafer', 'bowler bag'],
    reactions: { creative: 11, bold: 7, thumbs_up: 5 },
    image: require('../../assets/looks/d1/look_d1_mag_03.jpg'),
  },
  {
    tint: 't3',
    by: 'House',
    kind: 'editorial',
    tags: ['travel', 'clean', 'cold'],
    pieces: ['shearling collar coat', 'fair isle cable jumper', 'dark indigo straight jean', 'clean riding boot', 'fur trapper hat'],
    reactions: { fresh: 8, thumbs_up: 6, iconic: 2 },
    image: require('../../assets/looks/d1/look_d1_mag_04.jpg'),
  },
  {
    tint: 't4',
    by: '@perrin',
    kind: 'settled_entry',
    tags: ['nowhere', 'clean', 'between'],
    pieces: ['belted double breasted overcoat', 'black fine turtleneck', 'dark indigo straight jean', 'chunky lug loafer', 'supersized tote'],
    reactions: { fresh: 4, thumbs_up: 3 },
    image: require('../../assets/looks/d1/look_d1_mag_05.jpg'),
  },
  {
    tint: 't5',
    /* THE ONE LOOK THE SESSION TREATS AS YOURS. Deliberately at index 5: the
       cadence (H U S U H U S U) makes card 5 a user card, so it renders on the
       first page and the owner's read-only state is actually reachable in a
       test. Index 6 is a spread slot and would not have shown until ~21 cards
       had loaded. */
    by: 'katya.b',
    kind: 'freestyle',
    mine: true,
    tags: ['travel', 'clean', 'between'],
    pieces: ['suede jacket', 'argyle drop shoulder sweater', 'wide leg wool trouser', 'chocolate suede boot', 'maxi wrap scarf'],
    /* Past the five-reaction threshold and carrying negatives, so the owner's
       read — the only place a negative is ever visible — is demonstrable. */
    reactions: { bold: 6, iconic: 4, thumbs_up: 3, clashing: 2, too_safe: 1, thumbs_down: 1 },
    image: require('../../assets/looks/d1/look_d1_mag_06.jpg'),
  },
  {
    tint: 't0',
    by: '@lunaw',
    kind: 'settled_entry',
    tags: ['night out', 'bold', 'between'],
    pieces: ['velvet jewel tone dress', 'black leather biker jacket', 'mesh ballet flat', 'useless belt'],
    reactions: { iconic: 7, bold: 3 },
    image: require('../../assets/looks/d1/look_d1_mag_07.jpg'),
  },
  {
    tint: 't1',
    by: '@edo8',
    kind: 'settled_entry',
    tags: ['night out', 'sharp', 'between'],
    pieces: ['Le Smoking tuxedo jacket', 'silk charmeuse blouse', 'drop waist pencil skirt', 'embellished kitten heel', 'jewelled evening clutch'],
    reactions: { iconic: 7, bold: 3 },
    image: require('../../assets/looks/d1/look_d1_mag_08.jpg'),
  },
  {
    tint: 't2',
    by: '@strut_',
    kind: 'settled_entry',
    tags: ['nowhere', 'clean', 'rain'],
    pieces: ['structured trench coat', 'crisp poplin shirt', 'pleated wool trouser', 'slim penny loafer', 'leather gloves'],
    reactions: { fresh: 9, thumbs_up: 4, creative: 2 },
    image: require('../../assets/looks/d1/look_d1_mag_09.jpg'),
  },
  {
    tint: 't3',
    by: '@nightowl',
    kind: 'settled_entry',
    tags: ['fashion week', 'bold', 'cold'],
    pieces: ['funnel neck wool coat', 'boxy broad shoulder knit', 'pleated wool trouser', 'chocolate suede boot', 'shield sunglasses'],
    reactions: { bold: 8, creative: 5 },
    image: require('../../assets/looks/d1/look_d1_mag_10.jpg'),
  },
  {
    tint: 't4',
    by: '@finch',
    kind: 'settled_entry',
    tags: ['travel', 'clean', 'rain'],
    pieces: ['plaid check overcoat', 'sweater dress', 'clean riding boot', 'supersized tote'],
    reactions: { thumbs_up: 2, fresh: 1 },
    image: require('../../assets/looks/d1/look_d1_mag_11.jpg'),
  },
  {
    tint: 't5',
    by: '@rho',
    kind: 'settled_entry',
    tags: ['nowhere', 'clean', 'between'],
    pieces: ['black leather biker jacket', 'crisp poplin shirt', 'dark indigo straight jean', 'slim penny loafer', 'bowler bag'],
    reactions: { creative: 6, iconic: 3, thumbs_up: 4 },
    image: require('../../assets/looks/d1/look_d1_mag_12.jpg'),
  },
  {
    tint: 't0',
    by: '@pact_',
    kind: 'settled_entry',
    tags: ['fashion week', 'brave', 'cold'],
    pieces: ['charcoal suit jacket', 'boxy broad shoulder knit', 'dark indigo straight jean', 'chunky lug loafer', 'east west shoulder bag'],
    reactions: { bold: 10, thumbs_up: 6, iconic: 3 },
    image: require('../../assets/looks/d1/look_d1_mag_13.jpg'),
  },
  {
    tint: 't1',
    by: '@isla9',
    kind: 'settled_entry',
    tags: ['night out', 'fire', 'between'],
    pieces: ['belted double breasted overcoat', 'black fine turtleneck', 'statement fringe midi skirt', 'glove pump heel', 'colourful tights'],
    reactions: { iconic: 5, fresh: 4, thumbs_up: 2 },
    image: require('../../assets/looks/d1/look_d1_mag_14.jpg'),
  },
];

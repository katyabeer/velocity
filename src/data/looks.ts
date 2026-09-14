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
import { ACTIVE_DAY } from '@/config/testState';

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

/* ══════════════════════════════════════════════════════════════════════════
   THE RETURNING STATE'S PHOTOGRAPHY (ACTIVE_DAY 2)
   ══════════════════════════════════════════════════════════════════════════

   Katya, 13 Sep: the clients see Day 1, then come back to the same URL the
   next day. "The magazine section needs to be very diverse. Make sure no looks
   from Day 1 are there — and all other assets are used."

   So this is a SECOND COMPLETE SET, not a top-up: 39 frames, every one of them
   used exactly once, and not a single `d1` require below. What each set is was
   decided by looking at the photographs rather than by their filenames:

     look_d2_judge_01…14   an office lobby, tailoring, a visitor lanyard — so
                           this is tonight's field, and tonight's job is
                           "Your first day at the new job" (see the note above
                           CHALLENGES in data/challenges.ts, where the brief
                           moved to match the photography for the second time)
     look_d2_beat_01…04    a country house and a marquee — the AUTUMN WEDDING,
                           which is the job the returning user played on day 1.
                           That makes them House coverage of YESTERDAY, which
                           is the one editorial angle a magazine would actually
                           run the morning after a brief settles
     look_d2_mag_01…08     studio AW26 looks — the room's entries and posts
     look_d3_mag_01        street style with photographers visible, which is
                           New York Fashion Week — a freestyle post, and the
                           one flagged `mine`
     look_evg_spread_01…12 studio tailoring, six pairs — the magazine spreads

   ⚠ THE PIECE LISTS ARE READ OFF THE PHOTOGRAPHS and written in catalogue
   names, not invented ones. On a feed card `pieces` drives TAKE-A-PIECE in the
   bottom sheet, so a name the catalogue does not carry is a row you cannot
   take and a cutout that falls back to a grey box — which is the bug day 2's
   wardrobe fixtures have had all along (see data/inventory.ts). */

/**
 * Tonight's field. Fourteen, matching the d1 pool, because the pairing is
 * fixed `[i*2]`/`[i*2+1]` — and the TIER ORDER is interleaved to the same rule
 * the delivery README sets: never weak against weak. Pairs land
 * strong-vs-weak three times and then mid-vs-mid, exactly as in `JUDGING_LOOKS`.
 * Re-check that if you reorder these.
 */
export const JUDGING_LOOKS_DAY_TWO: readonly Look[] = [
  {
    tint: 't0', tier: 'strong', occasion: 'first day at the new job',
    pieces: 'funnel neck wool coat · black fine turtleneck · charcoal suit trouser · chunky lug loafer · supersized tote',
    image: require('../../assets/looks/d2/look_d2_judge_01.jpg'),
  },
  {
    tint: 't1', tier: 'weak', occasion: 'first day at the new job',
    pieces: 'black leather biker jacket · boxy broad shoulder knit · dark indigo straight jean · chunky biker boot · shield sunglasses',
    image: require('../../assets/looks/d2/look_d2_judge_12.jpg'),
  },
  {
    tint: 't2', tier: 'strong', occasion: 'first day at the new job',
    pieces: 'charcoal suit jacket · crisp poplin shirt · pleated wool trouser · slim penny loafer · leather gloves',
    image: require('../../assets/looks/d2/look_d2_judge_02.jpg'),
  },
  {
    tint: 't3', tier: 'weak', occasion: 'first day at the new job',
    pieces: 'leopard faux fur coat · black lace gothic dress · embellished kitten heel · jewelled evening clutch',
    image: require('../../assets/looks/d2/look_d2_judge_13.jpg'),
  },
  {
    tint: 't4', tier: 'strong', occasion: 'first day at the new job',
    pieces: 'structured trench coat · silk charmeuse blouse · wide leg wool trouser · glove pump heel · east west shoulder bag',
    image: require('../../assets/looks/d2/look_d2_judge_03.jpg'),
  },
  {
    tint: 't5', tier: 'weak', occasion: 'first day at the new job',
    pieces: 'suede jacket · peplum knit top · statement fringe midi skirt · chunky lug loafer · colourful tights',
    image: require('../../assets/looks/d2/look_d2_judge_14.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'belted double breasted overcoat · fair isle cable jumper · charcoal check pencil skirt · clean riding boot · bowler bag',
    image: require('../../assets/looks/d2/look_d2_judge_04.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'charcoal suit jacket · tuxedo dress shirt · charcoal suit trouser · slim penny loafer · statement brooch',
    image: require('../../assets/looks/d2/look_d2_judge_05.jpg'),
  },
  {
    tint: 't2', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'shearling collar coat · black fine turtleneck · oversized plaid trouser · chunky lug loafer · maxi wrap scarf',
    image: require('../../assets/looks/d2/look_d2_judge_06.jpg'),
  },
  {
    tint: 't3', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'cape detail wool coat · peplum knit top · drop waist pencil skirt · glove pump heel · leather gloves',
    image: require('../../assets/looks/d2/look_d2_judge_07.jpg'),
  },
  {
    tint: 't4', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'plaid check overcoat · crisp poplin shirt · wide leg wool trouser · chunky lug loafer · east west shoulder bag',
    image: require('../../assets/looks/d2/look_d2_judge_08.jpg'),
  },
  {
    tint: 't5', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'Le Smoking tuxedo jacket · silk charmeuse blouse · leather tailored skirt · pointed stiletto knee boot · chunky gold jewellery',
    image: require('../../assets/looks/d2/look_d2_judge_09.jpg'),
  },
  {
    tint: 't0', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'peplum sculpted shoulder jacket · sweater dress · suede tailored skirt · glove pump heel · bowler bag',
    image: require('../../assets/looks/d2/look_d2_judge_10.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'first day at the new job',
    pieces: 'funnel neck wool coat · argyle drop shoulder sweater · pleated wool trouser · chocolate suede boot · maxi wrap scarf',
    image: require('../../assets/looks/d2/look_d2_judge_11.jpg'),
  },
];

/**
 * The magazine's spreads — twelve plates, walked as six fixed pairs by
 * `SpreadCard` in ui/FeedCards.tsx (`[i*2]`/`[i*2+1]`), which is exactly
 * `SPREADS_PER_DAY`. So the day's whole spread allowance is these frames and
 * each appears once.
 *
 * ⚠ BOTH PLATES OF A PAIR CARRY THE SAME `occasion`, because the card prints
 * the LEFT one's as "Brief:" above both of them. Give them different briefs and
 * the caption is a lie about the right-hand look. Six pairs, six briefs — which
 * is where the diversity in this set comes from.
 *
 * Until now the spreads drew from `JUDGING_LOOKS`, so the spread showed the
 * same photographs as the judging round two screens away.
 */
export const SPREAD_LOOKS_DAY_TWO: readonly Look[] = [
  {
    tint: 't0', tier: 'strong', occasion: 'monochrome',
    pieces: 'Le Smoking tuxedo jacket · tuxedo dress shirt · charcoal suit trouser · slim penny loafer · statement brooch',
    image: require('../../assets/looks/spreads/look_evg_spread_01.jpg'),
  },
  {
    tint: 't1', tier: 'weak', occasion: 'monochrome',
    pieces: 'charcoal suit jacket · black fine turtleneck · pleated wool trouser · chunky lug loafer · useless belt',
    image: require('../../assets/looks/spreads/look_evg_spread_02.jpg'),
  },
  {
    tint: 't2', tier: 'strong', occasion: 'one bold piece',
    pieces: 'leopard faux fur coat · black fine turtleneck · charcoal suit trouser · pointed stiletto knee boot',
    image: require('../../assets/looks/spreads/look_evg_spread_03.jpg'),
  },
  {
    tint: 't3', tier: 'weak', occasion: 'one bold piece',
    pieces: 'statement fringe midi skirt · peplum knit top · suede jacket · embellished kitten heel · colourful tights',
    image: require('../../assets/looks/spreads/look_evg_spread_04.jpg'),
  },
  {
    tint: 't4', tier: 'mid', occasion: 'drinks with your ex',
    pieces: 'black leather biker jacket · silk charmeuse blouse · leather tailored skirt · glove pump heel · east west shoulder bag',
    image: require('../../assets/looks/spreads/look_evg_spread_05.jpg'),
  },
  {
    tint: 't5', tier: 'weak', occasion: 'drinks with your ex',
    pieces: 'fair isle cable jumper · dark indigo straight jean · clean riding boot · fur trapper hat',
    image: require('../../assets/looks/spreads/look_evg_spread_06.jpg'),
  },
  {
    tint: 't0', tier: 'strong', occasion: 'first date',
    pieces: 'velvet jewel tone dress · peplum sculpted shoulder jacket · peep toe pump heel · jewelled evening clutch',
    image: require('../../assets/looks/spreads/look_evg_spread_07.jpg'),
  },
  {
    tint: 't1', tier: 'mid', occasion: 'first date',
    pieces: 'drop waist day dress · funnel neck wool coat · slouchy suede knee boot · bowler bag',
    image: require('../../assets/looks/spreads/look_evg_spread_08.jpg'),
  },
  {
    tint: 't2', tier: 'mid', occasion: 'dress it down',
    pieces: 'charcoal suit jacket · boxy broad shoulder knit · dark indigo straight jean · chunky biker boot · supersized tote',
    image: require('../../assets/looks/spreads/look_evg_spread_09.jpg'),
  },
  {
    tint: 't3', tier: 'mid', occasion: 'dress it down',
    pieces: 'structured trench coat · argyle drop shoulder sweater · long maxi denim skirt · mesh ballet flat',
    image: require('../../assets/looks/spreads/look_evg_spread_10.jpg'),
  },
  {
    tint: 't4', tier: 'strong', occasion: 'the airport',
    pieces: 'shearling collar coat · black fine turtleneck · wide leg wool trouser · chunky lug loafer · maxi wrap scarf',
    image: require('../../assets/looks/spreads/look_evg_spread_11.jpg'),
  },
  {
    tint: 't5', tier: 'mid', occasion: 'the airport',
    pieces: 'plaid check overcoat · sweater dress · clean riding boot · supersized tote · leather gloves',
    image: require('../../assets/looks/spreads/look_evg_spread_12.jpg'),
  },
];

/**
 * The returning state's magazine pool — thirteen cards.
 *
 * THE FILTER RAIL DECIDED THE MIX. `kind` is the only axis `filterAccepts`
 * reads, and the rail offers Editorial · Challenges · Free posts, so a pool
 * that is one freestyle post deep leaves that chip showing a single card and
 * `thinResultNote` apologising for it. Four editorial, six settled entries,
 * three free posts — every chip has something to show.
 *
 * ⚠ `mine` SITS AT INDEX 5 FOR THE SAME REASON IT DOES IN `FEED_LOOKS`: the
 * cadence (H U S U H U S U) makes card 5 a user card, so the owner's read-only
 * cluster and the negative threshold are reachable on the first screenful.
 * Index 6 is a spread slot and would not appear until ~21 cards had loaded.
 */
export const FEED_LOOKS_DAY_TWO: readonly FeedLook[] = [
  /* ── House coverage of the job that settled this morning: the wedding, which
        is the one the returning user entered on day 1 ── */
  {
    tint: 't0',
    by: 'House',
    kind: 'editorial',
    tags: ['the wedding', 'settled', 'cold'],
    pieces: ['funnel neck wool coat', 'drop waist day dress', 'glove pump heel', 'maxi wrap scarf'],
    reactions: { iconic: 14, bold: 6, thumbs_up: 9 },
    image: require('../../assets/looks/d2/look_d2_beat_01.jpg'),
  },
  {
    tint: 't1',
    by: 'House',
    kind: 'editorial',
    tags: ['the wedding', 'clean', 'between'],
    pieces: ['cape detail wool coat', 'velvet jewel tone dress', 'peep toe pump heel', 'jewelled evening clutch'],
    reactions: { fresh: 11, iconic: 5, thumbs_up: 7 },
    image: require('../../assets/looks/d2/look_d2_beat_02.jpg'),
  },
  {
    tint: 't2',
    by: 'House',
    kind: 'editorial',
    tags: ['the wedding', 'brave', 'cold'],
    pieces: ['leopard faux fur coat', 'black lace gothic dress', 'embellished kitten heel', 'colourful tights'],
    reactions: { bold: 16, creative: 8, thumbs_up: 5 },
    image: require('../../assets/looks/d2/look_d2_beat_03.jpg'),
  },
  {
    tint: 't3',
    by: 'House',
    kind: 'editorial',
    tags: ['the wedding', 'sharp', 'between'],
    pieces: ['structured trench coat', 'silk charmeuse blouse', 'statement fringe midi skirt', 'slouchy suede knee boot'],
    reactions: { creative: 9, fresh: 6, thumbs_up: 4 },
    image: require('../../assets/looks/d2/look_d2_beat_04.jpg'),
  },

  /* ── The room's settled entries ── */
  {
    tint: 't4',
    by: '@perrin',
    kind: 'settled_entry',
    tags: ['one bold piece', 'fire', 'cold'],
    pieces: ['leopard faux fur coat', 'black fine turtleneck', 'charcoal suit trouser', 'pointed stiletto knee boot', 'shield sunglasses'],
    reactions: { bold: 12, iconic: 6, thumbs_up: 4 },
    image: require('../../assets/looks/d2/look_d2_mag_01.jpg'),
  },
  {
    tint: 't5',
    /* YOURS — index 5, see the note above. New York Fashion Week, shot from the
       street with photographers in frame, which is why it is the freestyle
       rather than an entry: no brief asked for it. */
    by: 'katya.b',
    kind: 'freestyle',
    mine: true,
    tags: ['fashionweek', 'streetstyle', 'plaid'],
    pieces: ['black leather biker jacket', 'black fine turtleneck', 'oversized plaid trouser', 'chunky biker boot', 'fur trapper hat'],
    /* Past the five-reaction threshold and carrying negatives, so the owner's
       read — the only place a negative is ever visible — stays demonstrable in
       this state too. */
    reactions: { iconic: 9, bold: 7, creative: 5, thumbs_up: 6, too_safe: 1, overdone: 2, thumbs_down: 1 },
    image: require('../../assets/looks/d2/look_d3_mag_01.jpg'),
  },
  {
    tint: 't0',
    by: '@edo8',
    kind: 'settled_entry',
    tags: ['the new job', 'sharp', 'between'],
    pieces: ['charcoal suit jacket', 'crisp poplin shirt', 'oversized plaid trouser', 'chunky biker boot', 'useless belt'],
    reactions: { creative: 8, bold: 4, thumbs_up: 3 },
    image: require('../../assets/looks/d2/look_d2_mag_02.jpg'),
  },
  {
    tint: 't1',
    by: '@finch',
    kind: 'settled_entry',
    tags: ['the airport', 'clean', 'cold'],
    pieces: ['belted double breasted overcoat', 'fair isle cable jumper', 'dark indigo straight jean', 'clean riding boot', 'fur trapper hat'],
    reactions: { fresh: 7, thumbs_up: 5 },
    image: require('../../assets/looks/d2/look_d2_mag_03.jpg'),
  },
  {
    tint: 't2',
    by: '@rho',
    kind: 'settled_entry',
    tags: ['the new job', 'clean', 'between'],
    pieces: ['funnel neck wool coat', 'crisp poplin shirt', 'dark indigo straight jean', 'slim penny loafer', 'supersized tote'],
    reactions: { fresh: 10, thumbs_up: 6, creative: 2 },
    image: require('../../assets/looks/d2/look_d2_mag_04.jpg'),
  },
  {
    tint: 't3',
    by: '@strut_',
    kind: 'settled_entry',
    tags: ['sunday nowhere', 'warm', 'rain'],
    pieces: ['shearling collar coat', 'argyle drop shoulder sweater', 'pleated wool trouser', 'chunky lug loafer', 'maxi wrap scarf'],
    reactions: { creative: 9, fresh: 4, thumbs_up: 5 },
    image: require('../../assets/looks/d2/look_d2_mag_05.jpg'),
  },
  {
    tint: 't4',
    by: '@lunaw',
    kind: 'settled_entry',
    tags: ['drinks', 'sharp', 'between'],
    pieces: ['black leather biker jacket', 'silk charmeuse blouse', 'charcoal suit trouser', 'glove pump heel', 'east west shoulder bag'],
    reactions: { iconic: 11, bold: 5, thumbs_up: 3 },
    image: require('../../assets/looks/d2/look_d2_mag_06.jpg'),
  },

  /* ── Free posts. Nobody asked for these, which is what makes the chip worth
        having something in it ── */
  {
    tint: 't5',
    by: '@isla9',
    kind: 'freestyle',
    tags: ['denim', 'brown', 'weekend'],
    pieces: ['suede jacket', 'black fine turtleneck', 'long maxi denim skirt', 'chocolate suede boot', 'east west shoulder bag'],
    reactions: { fresh: 8, creative: 4, thumbs_up: 6 },
    image: require('../../assets/looks/d2/look_d2_mag_07.jpg'),
  },
  {
    tint: 't0',
    by: '@pact_',
    kind: 'freestyle',
    tags: ['check', 'layering', 'burgundy'],
    pieces: ['plaid check overcoat', 'fair isle cable jumper', 'wide leg wool trouser', 'chunky lug loafer', 'bowler bag'],
    reactions: { bold: 7, iconic: 5, thumbs_up: 8 },
    image: require('../../assets/looks/d2/look_d2_mag_08.jpg'),
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   WHICH SET THE APP READS
   ══════════════════════════════════════════════════════════════════════════

   Functions rather than three exported constants, so a call site cannot pick
   the wrong one by importing the wrong name. `ACTIVE_DAY` is a build constant,
   so these are not recomputed in any meaningful sense.

   ⚠ `FEED_LOOKS` and `JUDGING_LOOKS` ARE STILL EXPORTED AND STILL DAY-1'S.
   `onboarding/intro/[step].tsx` reads them directly and should keep doing so:
   onboarding only ever runs when `dayConfig().onboarding` is true, which is
   day 1 alone, and the carousel's collage is composed against those specific
   photographs. Everything else goes through the accessors below. */

export const feedLooks = (): readonly FeedLook[] =>
  ACTIVE_DAY === 2 ? FEED_LOOKS_DAY_TWO : FEED_LOOKS;

export const judgingLooks = (): readonly Look[] =>
  ACTIVE_DAY === 2 ? JUDGING_LOOKS_DAY_TWO : JUDGING_LOOKS;

/** The magazine's spreads. Day 1 has no spread photography of its own, so it
 *  keeps drawing from the judging pool — which is what every day did before. */
export const spreadLooks = (): readonly Look[] =>
  ACTIVE_DAY === 2 ? SPREAD_LOOKS_DAY_TWO : JUDGING_LOOKS;

/**
 * ⚠ THE JOB THAT SETTLED THIS MORNING — **not tonight's field**, and the
 * distinction is the whole reason this exists separately.
 *
 * The result card and the results screen report on YESTERDAY. On the returning
 * state yesterday's job is the autumn wedding (`playedBriefs()[0]`), while
 * tonight's is the office — so drawing those two screens from `judgingLooks()`
 * put office photography under a heading about a wedding. Caught by Katya,
 * 13 Sep: "the results screen should be all about the autumn wedding look, so
 * use the day 1 looks for the results screen so the visuals match the brief."
 *
 * It returns `JUDGING_LOOKS` on every day, and that is correct rather than
 * lazy: on day 2 yesterday's job IS day 1's job, and on day 1 the result act
 * does not render at all (`yesterday: 'none'`). It is a FUNCTION NAMED FOR ITS
 * ROLE because the value and the role are only incidentally the same — add a
 * third sitting and this is the one that has to change, and a call site reading
 * `JUDGING_LOOKS` directly would silently be wrong again.
 */
export const yesterdayLooks = (): readonly Look[] => JUDGING_LOOKS;

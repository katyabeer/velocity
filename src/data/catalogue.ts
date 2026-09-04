/**
 * THE GARMENT CATALOGUE — all 60 AW26 cutouts, verbatim from
 * `delivery_sheet_garments.csv` (Frame 23 AW26 delivery, 31 Aug 2026).
 *
 * GENERATED, NOT HAND-WRITTEN. If the delivery sheet is re-issued, regenerate
 * rather than patching entries — the sheet is the source of truth for slot,
 * category, gender, register and `flatlayScale`.
 *
 * WHY SLOT AND CATEGORY ARE EXPLICIT HERE, not derived from the name.
 * `domain/garments.ts` derives both from a name regex, which is what lets the
 * old capsules drive the builder with no per-piece authoring. That trick breaks
 * on the real catalogue: "tuxedo dress shirt" lands under Dresses, and
 * "silk charmeuse blouse" and "black fine turtleneck" fall through to Extras.
 * The delivery sheet already carries the right answer for every piece, so this
 * file registers it (see `registerGarments` in domain/garments.ts) and the
 * regex stays as the fallback for the legacy capsule/fixture names.
 *
 * CATEGORIES ARE THE SHEET'S FIVE, with Dresses split out of Tops on the
 * sheet's own `dress` column — 12/8/4/12/12/12. The `Accessories` category in
 * domain/garments.ts is therefore unused by the catalogue: everything the sheet
 * calls Extras stays Extras, bags and scarves alike.
 * ⚠ Katya — that leaves Accessories as a legacy-only category. Worth
 * deciding whether to fold it away or split the twelve Extras into bags and
 * accessories (4 / 8), which would read better on the builder's filter rail.
 *
 * `flatlayScale` is the sheet's REQUIRED multiplier for flat-lay composition:
 * the delivered tiles are each framed for legibility (every garment fills its
 * own 1000x1000 frame), so cross-category true scale only exists if you apply
 * it. See ui/ComposedFlatLay.tsx for how it is spent.
 *
 * THE BUNDLED CUTOUTS ARE 512x512, resized from the delivery's 1000x1000 with
 * `sips -Z 512` (alpha preserved) — same convention as assets/looks/d1, and the
 * one .gitignore states: assets-source/ holds the delivery, assets/ holds what
 * the app bundles. 20MB became 6.3MB. 512 is ample: the largest on-screen use is
 * the flat lay's outerwear box, ~163pt, which is 490px at 3x.
 *
 * SEPARATE FROM data/inventory.ts, deliberately, same reason as data/looks.ts
 * and data/inventoryReview.ts: the require()'d images below are not loadable
 * under the plain-Node test runner, so nothing in tests/ may import this file.
 */

import type { ImageSourcePropType } from 'react-native';
import { registerGarments, type Category, type Slot } from '@/domain/garments';

/** Which rail a piece sits on. SOFT — see the rails invariant: this only ever
 *  orders the builder grid, it never removes anything from it. */
export type GarmentGender = 'unisex' | 'womens';

/** The sheet's own register column — unused so far, carried because dropping it
 *  means re-running the generator to get it back. */
export type GarmentRegister = 'quiet' | 'mid' | 'loud' | 'clean' | 'sharp' | 'bold' | 'brave';

export type CatalogueGarment = {
  name: string;
  slot: Slot;
  category: Category;
  gender: GarmentGender;
  register: string;
  /** True for the four pieces the sheet marks `dress` — they take the Top slot
   *  but drive the flat lay's dress template (one tall box, no separate top). */
  isDress: boolean;
  /** The sheet's flat-lay multiplier. 1.0 is a full-length coat. */
  flatlayScale: number;
  image: ImageSourcePropType;
};

export const CATALOGUE: readonly CatalogueGarment[] = [
  {
    name: 'funnel neck wool coat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 1.0,
    image: require('../../assets/garments/garm_funnel-neck-wool-coat.png'),
  },
  {
    name: 'belted double breasted overcoat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.957,
    image: require('../../assets/garments/garm_belted-double-breasted-overcoat.png'),
  },
  {
    name: 'leopard faux fur coat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.783,
    image: require('../../assets/garments/garm_leopard-faux-fur-coat.png'),
  },
  {
    name: 'shearling collar coat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_shearling-collar-coat.png'),
  },
  {
    name: 'black leather biker jacket',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.478,
    image: require('../../assets/garments/garm_black-leather-biker-jacket.png'),
  },
  {
    name: 'Le Smoking tuxedo jacket',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.478,
    image: require('../../assets/garments/garm_le-smoking-tuxedo-jacket.png'),
  },
  {
    name: 'structured trench coat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.913,
    image: require('../../assets/garments/garm_structured-trench-coat.png'),
  },
  {
    name: 'charcoal suit jacket',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.652,
    image: require('../../assets/garments/garm_charcoal-suit-jacket.png'),
  },
  {
    name: 'suede jacket',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.609,
    image: require('../../assets/garments/garm_suede-jacket.png'),
  },
  {
    name: 'peplum sculpted shoulder jacket',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_peplum-sculpted-shoulder-jacket.png'),
  },
  {
    name: 'cape detail wool coat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 1.0,
    image: require('../../assets/garments/garm_cape-detail-wool-coat.png'),
  },
  {
    name: 'plaid check overcoat',
    slot: 'Outer',
    category: 'Outerwear',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.913,
    image: require('../../assets/garments/garm_plaid-check-overcoat.png'),
  },
  {
    name: 'black fine turtleneck',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_black-fine-turtleneck.png'),
  },
  {
    name: 'crisp poplin shirt',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.652,
    image: require('../../assets/garments/garm_crisp-poplin-shirt.png'),
  },
  {
    name: 'fair isle cable jumper',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.565,
    image: require('../../assets/garments/garm_fair-isle-cable-jumper.png'),
  },
  {
    name: 'tuxedo dress shirt',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.652,
    image: require('../../assets/garments/garm_tuxedo-dress-shirt.png'),
  },
  {
    name: 'argyle drop shoulder sweater',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.609,
    image: require('../../assets/garments/garm_argyle-drop-shoulder-sweater.png'),
  },
  {
    name: 'silk charmeuse blouse',
    slot: 'Top',
    category: 'Tops',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.565,
    image: require('../../assets/garments/garm_silk-charmeuse-blouse.png'),
  },
  {
    name: 'sweater dress',
    slot: 'Top',
    category: 'Dresses',
    gender: 'womens',
    register: 'mid',
    isDress: true,
    flatlayScale: 1.0,
    image: require('../../assets/garments/garm_sweater-dress.png'),
  },
  {
    name: 'boxy broad shoulder knit',
    slot: 'Top',
    category: 'Tops',
    gender: 'unisex',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.478,
    image: require('../../assets/garments/garm_boxy-broad-shoulder-knit.png'),
  },
  {
    name: 'peplum knit top',
    slot: 'Top',
    category: 'Tops',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.478,
    image: require('../../assets/garments/garm_peplum-knit-top.png'),
  },
  {
    name: 'drop waist day dress',
    slot: 'Top',
    category: 'Dresses',
    gender: 'womens',
    register: 'quiet',
    isDress: true,
    flatlayScale: 0.957,
    image: require('../../assets/garments/garm_drop-waist-day-dress.png'),
  },
  {
    name: 'velvet jewel tone dress',
    slot: 'Top',
    category: 'Dresses',
    gender: 'womens',
    register: 'loud',
    isDress: true,
    flatlayScale: 1.0,
    image: require('../../assets/garments/garm_velvet-jewel-tone-dress.png'),
  },
  {
    name: 'black lace gothic dress',
    slot: 'Top',
    category: 'Dresses',
    gender: 'womens',
    register: 'loud',
    isDress: true,
    flatlayScale: 1.0,
    image: require('../../assets/garments/garm_black-lace-gothic-dress.png'),
  },
  {
    name: 'wide leg wool trouser',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.913,
    image: require('../../assets/garments/garm_wide-leg-wool-trouser.png'),
  },
  {
    name: 'drop waist pencil skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_drop-waist-pencil-skirt.png'),
  },
  {
    name: 'dark indigo straight jean',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.87,
    image: require('../../assets/garments/garm_dark-indigo-straight-jean.png'),
  },
  {
    name: 'statement fringe midi skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.652,
    image: require('../../assets/garments/garm_statement-fringe-midi-skirt.png'),
  },
  {
    name: 'oversized plaid trouser',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'unisex',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.826,
    image: require('../../assets/garments/garm_oversized-plaid-trouser.png'),
  },
  {
    name: 'leather tailored skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_leather-tailored-skirt.png'),
  },
  {
    name: 'pleated wool trouser',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.87,
    image: require('../../assets/garments/garm_pleated-wool-trouser.png'),
  },
  {
    name: 'long maxi denim skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.913,
    image: require('../../assets/garments/garm_long-maxi-denim-skirt.png'),
  },
  {
    name: 'charcoal suit trouser',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.87,
    image: require('../../assets/garments/garm_charcoal-suit-trouser.png'),
  },
  {
    name: 'suede tailored skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_suede-tailored-skirt.png'),
  },
  {
    name: 'charcoal check pencil skirt',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.522,
    image: require('../../assets/garments/garm_charcoal-check-pencil-skirt.png'),
  },
  {
    name: 'low rise stirrup trouser',
    slot: 'Bottom',
    category: 'Bottoms',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.87,
    image: require('../../assets/garments/garm_low-rise-stirrup-trouser.png'),
  },
  {
    name: 'chocolate suede boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.174,
    image: require('../../assets/garments/garm_chocolate-suede-boot.png'),
  },
  {
    name: 'slouchy suede knee boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.391,
    image: require('../../assets/garments/garm_slouchy-suede-knee-boot.png'),
  },
  {
    name: 'pointed stiletto knee boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.391,
    image: require('../../assets/garments/garm_pointed-stiletto-knee-boot.png'),
  },
  {
    name: 'glove pump heel',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.104,
    image: require('../../assets/garments/garm_glove-pump-heel.png'),
  },
  {
    name: 'chunky lug loafer',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.104,
    image: require('../../assets/garments/garm_chunky-lug-loafer.png'),
  },
  {
    name: 'slim penny loafer',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.087,
    image: require('../../assets/garments/garm_slim-penny-loafer.png'),
  },
  {
    name: 'mesh ballet flat',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.07,
    image: require('../../assets/garments/garm_mesh-ballet-flat.png'),
  },
  {
    name: 'peep toe pump heel',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.104,
    image: require('../../assets/garments/garm_peep-toe-pump-heel.png'),
  },
  {
    name: 'embellished kitten heel',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.087,
    image: require('../../assets/garments/garm_embellished-kitten-heel.png'),
  },
  {
    name: 'chunky biker boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'unisex',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.217,
    image: require('../../assets/garments/garm_chunky-biker-boot.png'),
  },
  {
    name: 'croc effect knee boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.391,
    image: require('../../assets/garments/garm_croc-effect-knee-boot.png'),
  },
  {
    name: 'clean riding boot',
    slot: 'Shoes',
    category: 'Shoes',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.391,
    image: require('../../assets/garments/garm_clean-riding-boot.png'),
  },
  {
    name: 'bowler bag',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.217,
    image: require('../../assets/garments/garm_bowler-bag.png'),
  },
  {
    name: 'supersized tote',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.348,
    image: require('../../assets/garments/garm_supersized-tote.png'),
  },
  {
    name: 'east west shoulder bag',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.13,
    image: require('../../assets/garments/garm_east-west-shoulder-bag.png'),
  },
  {
    name: 'jewelled evening clutch',
    slot: 'Extra',
    category: 'Extras',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.104,
    image: require('../../assets/garments/garm_jewelled-evening-clutch.png'),
  },
  {
    name: 'maxi wrap scarf',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.261,
    image: require('../../assets/garments/garm_maxi-wrap-scarf.png'),
  },
  {
    name: 'leather gloves',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.209,
    image: require('../../assets/garments/garm_leather-gloves.png'),
  },
  {
    name: 'colourful tights',
    slot: 'Extra',
    category: 'Extras',
    gender: 'womens',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.826,
    image: require('../../assets/garments/garm_colourful-tights.png'),
  },
  {
    name: 'shield sunglasses',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'mid',
    isDress: false,
    flatlayScale: 0.052,
    image: require('../../assets/garments/garm_shield-sunglasses.png'),
  },
  {
    name: 'statement brooch',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.07,
    image: require('../../assets/garments/garm_statement-brooch.png'),
  },
  {
    name: 'fur trapper hat',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.191,
    image: require('../../assets/garments/garm_fur-trapper-hat.png'),
  },
  {
    name: 'chunky gold jewellery',
    slot: 'Extra',
    category: 'Extras',
    gender: 'womens',
    register: 'loud',
    isDress: false,
    flatlayScale: 0.174,
    image: require('../../assets/garments/garm_chunky-gold-jewellery.png'),
  },
  {
    name: 'useless belt',
    slot: 'Extra',
    category: 'Extras',
    gender: 'unisex',
    register: 'quiet',
    isDress: false,
    flatlayScale: 0.217,
    image: require('../../assets/garments/garm_useless-belt.png'),
  },
];

/* Teach the domain classifier the catalogue's own answers. Runs on import,
   before any screen reads a slot — every consumer of the catalogue imports
   this module, and nothing else needs to know. */
registerGarments(CATALOGUE);

const BY_NAME = new Map(CATALOGUE.map((g) => [g.name, g]));

export const garment = (name: string): CatalogueGarment | undefined => BY_NAME.get(name);

export const garmentImage = (name: string): ImageSourcePropType | undefined =>
  BY_NAME.get(name)?.image;

/**
 * The builder pool, ordered. Category order first (the sheet's own), then the
 * rails preference as a SOFT sort inside each category: matching pieces come
 * first, nothing is ever removed. A hard filter here would split the garment
 * pool, which splits the room, and multiplies the cold-start floor — see the
 * rails invariant. Do not turn this into a filter.
 */
export function cataloguePool(rails: 'mens' | 'womens' | 'both'): readonly CatalogueGarment[] {
  if (rails === 'both') return CATALOGUE;
  /* Men's has no menswear-only pieces in the delivery — the sheet's two values
     are `unisex` and `womens` — so "mostly menswear" means unisex first. */
  const wanted: GarmentGender = rails === 'womens' ? 'womens' : 'unisex';
  /* Category first so the All view stays grouped, gender only as the tiebreak
     inside a category. Array.sort is stable, so sheet order survives both. */
  return [...CATALOGUE].sort(
    (a, b) =>
      railIndex(a.category) - railIndex(b.category) ||
      Number(b.gender === wanted) - Number(a.gender === wanted),
  );
}

/**
 * The filter rail, in the sheet's own order. Dresses sits after Tops because it
 * was split out of it.
 *
 * FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE — never by register, trend,
 * gender or what "goes with" the brief. Deciding that is the skill being tested.
 */
export const CATALOGUE_CATEGORIES: readonly Category[] = [
  'Outerwear',
  'Tops',
  'Dresses',
  'Bottoms',
  'Shoes',
  'Extras',
];

/** Rail position, with anything the catalogue doesn't rail (a legacy
 *  'Accessories' name) sorting to the end rather than to the front, which is
 *  what a bare indexOf's -1 would do. */
const railIndex = (c: Category): number => {
  const i = CATALOGUE_CATEGORIES.indexOf(c);
  return i === -1 ? CATALOGUE_CATEGORIES.length : i;
};

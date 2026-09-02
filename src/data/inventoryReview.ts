/**
 * Day 1, for now — a curated 4-piece wardrobe with real photos (one per the
 * new card design's categories: Outerwear, Dresses, Shoes, Accessories),
 * replacing the capsule-driven inventoryDayOne() for the seeded store only.
 * inventoryDayOne() itself, capsules.ts, and their tests are untouched —
 * swap state/wardrobe.ts's seed() back to inventoryDayOne(capsule) to revert.
 *
 * SEPARATE FILE, deliberately, same reason as data/looks.ts: the four
 * require()'d images below aren't loadable under the plain-Node test
 * runner (no Metro asset transform outside the app), so this can't live in
 * data/inventory.ts — tests/capsules.test.ts imports that file directly for
 * inventoryDayOne()/inventoryDayTwo(), and a top-level require('*.png')
 * anywhere in it would crash the whole test file on import, not just the
 * fixture that needs it.
 */

import { categoryOf } from '../domain/garments';
import type { OwnedPiece } from './inventory';

export const INVENTORY_DAY_ONE_REVIEW: readonly OwnedPiece[] = [
  {
    name: 'funnel-neck wool coat',
    category: categoryOf('funnel-neck wool coat'),
    worn: 0,
    best: null,
    provenance: 'starter',
    image: require('../../assets/garments/garm_funnel-neck-wool-coat.png'),
  },
  {
    name: 'drop-waist day dress',
    category: categoryOf('drop-waist day dress'),
    worn: 0,
    best: null,
    provenance: 'starter',
    image: require('../../assets/garments/garm_drop-waist-day-dress.png'),
  },
  {
    name: 'glove pump heel',
    category: categoryOf('glove pump heel'),
    worn: 0,
    best: null,
    provenance: 'starter',
    image: require('../../assets/garments/garm_glove-pump-heel.png'),
  },
  {
    name: 'maxi wrap scarf',
    category: categoryOf('maxi wrap scarf'),
    worn: 0,
    best: null,
    provenance: 'starter',
    image: require('../../assets/garments/garm_maxi-wrap-scarf.png'),
  },
];

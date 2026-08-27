/**
 * The four starter capsules (o6 · first wardrobe).
 *
 * LOCKED DECISION 15. They DELIBERATELY OVERLAP — 'roll neck', 'wide leg' and
 * 'silk shirt' each appear in more than one — so all four draw from the same
 * shared 60-piece capsule and ADD NO NEW ASSETS.
 *
 * All four cover all five slots, so no capsule can lock you out of entering.
 * That is asserted in tests/capsules.test.ts — keep the test if you edit these.
 */

import { SLOTS, slotOf, type Slot } from '../domain/garments';

export type Capsule = {
  key: 'quiet' | 'loud' | 'street' | 'soft';
  name: string;
  character: string;
  pieces: readonly string[];
};

export const CAPSULES: readonly Capsule[] = [
  {
    key: 'quiet',
    name: 'Quiet tailoring',
    character: 'Sharp, plain, nothing shouting.',
    pieces: [
      'wool coat',
      'blazer',
      'roll neck',
      'silk shirt',
      'straight leg',
      'cigarette pant',
      'loafer',
      'tote',
    ],
  },
  {
    key: 'loud',
    name: 'Loud and printed',
    character: 'Colour first, apologies later.',
    pieces: [
      'printed coat',
      'silk shirt',
      'crochet top',
      'midi skirt',
      'wide leg',
      'heeled boot',
      'red bag',
      'beret',
    ],
  },
  {
    key: 'street',
    name: 'Street and sport',
    character: 'Built for moving fast.',
    pieces: ['parka', 'hoodie', 'shell top', 'cargo', 'wide leg', 'trainer', 'cap', 'crossbody'],
  },
  {
    key: 'soft',
    name: 'Soft and draped',
    character: 'Nothing structured, everything falling.',
    pieces: [
      'trench',
      'knit dress',
      'roll neck',
      'slip skirt',
      'wide leg',
      'mule',
      'scarf',
      'shoulder bag',
    ],
  },
];

export type CapsuleKey = Capsule['key'];

export const capsuleByKey = (key: CapsuleKey): Capsule =>
  CAPSULES.find((c) => c.key === key) ?? CAPSULES[0]!;

/** Which slots a capsule covers. Must be all five, for every capsule. */
export const slotsCovered = (c: Capsule): Slot[] =>
  Array.from(new Set(c.pieces.map(slotOf)));

export const coversAllSlots = (c: Capsule): boolean =>
  SLOTS.every((s) => slotsCovered(c).includes(s));

/**
 * Locked decision 13: ONE SHARED 60-PIECE CAPSULE, not bespoke garments per
 * look — which would have been 248 cutouts. Asset budget is 141 images for a
 * two-day test (60 garment cutouts, 79 rendered looks, 2 flat lays); Day 1
 * alone is 112, so Day 2 costs only 29 more.
 */
export const SHARED_POOL_SIZE = 60;
export const ASSET_BUDGET_TWO_DAY_TEST = 141;

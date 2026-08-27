/**
 * Garment → slot and category, derived from the garment's name.
 *
 * Ported from `GTYPE` / `gtype()` / `slotOf()` / `catOf()` in the prototype.
 *
 * WHY IT WORKS THIS WAY (from the handover, §4 and the HUD note):
 * deriving slot and category from the name is what lets the four starter
 * capsules drive the builder and the wardrobe with *no new data*. If you
 * replace this with an explicit `slot` field on every garment, that is fine —
 * but the capsules then need per-piece authoring and the "no new assets"
 * property of the four overlapping capsules is what you are spending.
 *
 * Order matters. The patterns are tried in sequence and the first hit wins,
 * so 'knit dress' resolves as Top (dress|knit both in the Top pattern) and
 * 'denim jacket' resolves as Outer before the Bottom pattern can claim 'denim'.
 */

export const SLOTS = ['Outer', 'Top', 'Bottom', 'Shoes', 'Extra'] as const;
export type Slot = (typeof SLOTS)[number];

export const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Extras'] as const;
export type Category = (typeof CATEGORIES)[number];

type Rule = { pattern: RegExp; slot: Slot; category: Category };

const RULES: readonly Rule[] = [
  {
    pattern: /coat|parka|trench|blazer|anorak|shacket|jacket|oilskin|fleece/,
    slot: 'Outer',
    category: 'Outerwear',
  },
  {
    pattern: /dress|knit|shirt|top|tee|roll neck|hoodie|sweat|jumper|vest|cashmere|poplin/,
    slot: 'Top',
    category: 'Tops',
  },
  {
    pattern: /trouser|pant|jean|denim|leg|skirt|cargo|legging|short|chino/,
    slot: 'Bottom',
    category: 'Bottoms',
  },
  {
    pattern: /boot|shoe|loafer|trainer|derby|mule|sandal|heel|clog|flat|oxford|sneaker|welly|pump/,
    slot: 'Shoes',
    category: 'Shoes',
  },
  {
    pattern:
      /bag|tote|scarf|belt|hat|cap|beret|glove|hoop|cuff|clutch|crossbody|sunglass|bandana|tie|sling|satchel/,
    slot: 'Extra',
    category: 'Extras',
  },
];

/** Unmatched names fall through to Extra, exactly as the prototype does. */
const FALLBACK: Rule = { pattern: /.^/, slot: 'Extra', category: 'Extras' };

export function classify(name: string): { slot: Slot; category: Category } {
  const hit = RULES.find((r) => r.pattern.test(name)) ?? FALLBACK;
  return { slot: hit.slot, category: hit.category };
}

export const slotOf = (name: string): Slot => classify(name).slot;
export const categoryOf = (name: string): Category => classify(name).category;

/** The category that displays a given slot, and back again. */
export const categoryForSlot: Record<Slot, Category> = {
  Outer: 'Outerwear',
  Top: 'Tops',
  Bottom: 'Bottoms',
  Shoes: 'Shoes',
  Extra: 'Extras',
};

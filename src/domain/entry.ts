/**
 * The look you are entering: slot rules and the pick/unpick logic.
 *
 * LOCKED DECISION 11 — 5 slots maximum, 3 minimum, for briefs AND freestyle.
 * One piece per slot. Do not "improve" this by allowing two tops.
 *
 * LOCKED — once you enter, nothing can be changed. There is no edit path and
 * no re-roll; that is what keeps brief invariant 5 ("the render is faithful")
 * true without any extra machinery.
 *
 * Ported from `SLOTS`, `pickedItems()`, `has()` and the `[data-w]` / `[data-l]`
 * click handlers in the prototype.
 */

import { SLOTS, slotOf, type Slot } from './garments';

export const MIN_PIECES = 3;
export const MAX_PIECES = 5;

/**
 * Two loaner pieces per brief, so a thin wardrobe can never lock you out of
 * entering. They go back at close. (Handover §5.)
 */
export const LOANS_PER_BRIEF = 2;

/** A pick is either from your own inventory or from tonight's loaner shelf. */
export type PickSource = 'owned' | 'loan';

export type Pick = {
  source: PickSource;
  /** Garment name — the stable identity everywhere in this codebase. */
  name: string;
};

export type Garment = { name: string; slot: Slot };

export const slotsFilled = (picks: readonly Pick[]): Slot[] => picks.map((p) => slotOf(p.name));

export const isSlotOccupied = (picks: readonly Pick[], slot: Slot): boolean =>
  picks.some((p) => slotOf(p.name) === slot);

export const pickInSlot = (picks: readonly Pick[], slot: Slot): Pick | undefined =>
  picks.find((p) => slotOf(p.name) === slot);

export const isPicked = (picks: readonly Pick[], name: string): boolean =>
  picks.some((p) => p.name === name);

export const loansUsed = (picks: readonly Pick[]): number =>
  picks.filter((p) => p.source === 'loan').length;

export const canEnter = (picks: readonly Pick[]): boolean =>
  picks.length >= MIN_PIECES && picks.length <= MAX_PIECES;

/**
 * Toggle a garment in or out of the look.
 *
 * Selecting into an occupied slot *replaces* the incumbent rather than being
 * refused — that is the prototype's behaviour and it is the right one: being
 * told "no" while holding the thing you want is worse than a swap.
 *
 * Returns a new array; never mutates.
 */
export function togglePick(
  picks: readonly Pick[],
  garment: { name: string; source: PickSource },
): Pick[] {
  const existing = picks.findIndex((p) => p.name === garment.name && p.source === garment.source);
  if (existing > -1) return picks.filter((_, i) => i !== existing);

  if (garment.source === 'loan' && loansUsed(picks) >= LOANS_PER_BRIEF) return [...picks];

  const slot = slotOf(garment.name);
  const withoutSlot = picks.filter((p) => slotOf(p.name) !== slot);
  if (withoutSlot.length >= MAX_PIECES) return [...picks];

  return [...withoutSlot, { source: garment.source, name: garment.name }];
}

/** Clear one slot — the "tap a filled slot to put it back" affordance. */
export const clearSlot = (picks: readonly Pick[], slot: Slot): Pick[] =>
  picks.filter((p) => slotOf(p.name) !== slot);

/** Slots in canonical order, with whatever is in them. For the slot strip. */
export function slotStrip(picks: readonly Pick[]): { slot: Slot; pick?: Pick }[] {
  return SLOTS.map((slot) => {
    const pick = pickInSlot(picks, slot);
    return pick ? { slot, pick } : { slot };
  });
}

/**
 * The four steps of entry. Locked decision 17 (26 Aug):
 * pick → look → render → vote, with **vote on the ribbon** so the judging
 * round reads as the end of the job rather than a separate errand.
 *
 * There is NO tag step and no declared word (locked decision 18, 26 Aug).
 * Consequence: "the gap" — *you went for clean, it read as brave* — has no
 * input and is out of the product. Open question C in the handover asks whether
 * it comes back; if it does, the cheapest home is one tap on the rendered
 * screen AFTER the render lands, not a step before entry.
 */
export const ENTRY_STEPS = [
  { key: 'pick', label: 'Pick', hint: '3 to 5' },
  { key: 'look', label: 'Look', hint: 'together' },
  { key: 'render', label: 'Render', hint: 'after entering' },
  { key: 'vote', label: 'Vote', hint: 'from 8pm' },
] as const;

export type EntryStepKey = (typeof ENTRY_STEPS)[number]['key'];

/** Create keeps its tag step — a freestyle post has no brief, so tags are the
 *  only thing telling the magazine what it is. (Handover §5.) */
export const CREATE_STEPS = [
  { key: 'pick', label: 'Pick', hint: '3 to 5' },
  { key: 'look', label: 'Look', hint: 'together' },
  { key: 'tag', label: 'Tag', hint: 'if posting' },
  { key: 'render', label: 'Render', hint: 'one a day' },
] as const;

export type CreateStepKey = (typeof CREATE_STEPS)[number]['key'];

/** One render a day in Create. `save as a set` is unlimited. */
export const FREE_RENDERS_PER_DAY = 1;

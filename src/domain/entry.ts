/**
 * The look you are entering: slot rules and the pick/unpick logic.
 *
 * LOCKED DECISION 11 AMENDED, 3 Sep 2026 (Katya) — 6 pieces maximum, 3
 * minimum, for briefs AND freestyle. One piece per slot, EXCEPT Extra, which
 * takes two.
 *
 * What that amendment is and is not. It is not "the cap went up by one": the
 * five slots are the arithmetic ceiling, so six only exists because one slot
 * now holds two pieces, and Extra is the only slot where that composes — the
 * delivery sheet's own flat-lay template splits its extras box horizontally
 * when there is more than one piece in it, and no other box does. Do NOT
 * generalise this into "two tops" or a sixth slot; both break the render
 * template, which has no box to put the second piece in.
 *
 * LOCKED, UNCHANGED — once you enter, nothing can be changed. There is no edit
 * path and no re-roll; that is what keeps brief invariant 5 ("the render is
 * faithful") true without any extra machinery.
 *
 * Ported from `SLOTS`, `pickedItems()`, `has()` and the `[data-w]` / `[data-l]`
 * click handlers in the prototype.
 */

import { SLOTS, slotOf, type Slot } from './garments';

export const MIN_PIECES = 3;

/**
 * How many pieces each slot holds. Extra is the exception — see the amendment
 * note above, and don't widen it without a render template that can take it.
 */
export const SLOT_CAPACITY: Record<Slot, number> = {
  Outer: 1,
  Top: 1,
  Bottom: 1,
  Shoes: 1,
  Extra: 2,
};

/** Derived, never hand-written: the cap IS the sum of the slot capacities. If
 *  those change, this follows, and nothing else has to be remembered. */
export const MAX_PIECES: number = SLOTS.reduce((n, s) => n + SLOT_CAPACITY[s], 0);

/**
 * The slot strip's cells, in canonical order — Extra appears twice because it
 * holds two. Cells are positional, so callers must key on the INDEX, not on the
 * slot name.
 */
export const STRIP_SLOTS: readonly Slot[] = SLOTS.flatMap((s) =>
  Array.from({ length: SLOT_CAPACITY[s] }, () => s),
);

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

/** Full, not merely occupied — Extra with one piece in it is still open. */
export const isSlotOccupied = (picks: readonly Pick[], slot: Slot): boolean =>
  picks.filter((p) => slotOf(p.name) === slot).length >= SLOT_CAPACITY[slot];

/* `pickInSlot` was removed on 3 Sep. It returned the FIRST pick in a slot,
   which stopped being a meaningful answer the moment Extra could hold two —
   slotStrip walks the slot's picks in order instead. If you need one piece out
   of a slot, say which one. */

export const isPicked = (picks: readonly Pick[], name: string): boolean =>
  picks.some((p) => p.name === name);

export const loansUsed = (picks: readonly Pick[]): number =>
  picks.filter((p) => p.source === 'loan').length;

export const canEnter = (picks: readonly Pick[]): boolean =>
  picks.length >= MIN_PIECES && picks.length <= MAX_PIECES;

/**
 * Toggle a garment in or out of the look.
 *
 * Selecting into a FULL slot *replaces* rather than being refused — that is the
 * prototype's behaviour and it is the right one: being told "no" while holding
 * the thing you want is worse than a swap. What gets replaced is the oldest
 * piece in that slot, which for the four single-piece slots is the only piece
 * in it (so the behaviour there is unchanged), and for Extra means a third
 * accessory pushes out the first rather than the second.
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
  const inSlot = picks.filter((p) => slotOf(p.name) === slot);
  /* Oldest-first, exactly as many as are needed to get back under capacity. */
  const evicted = inSlot.slice(0, Math.max(0, inSlot.length - SLOT_CAPACITY[slot] + 1));
  const kept = picks.filter((p) => !evicted.includes(p));
  if (kept.length >= MAX_PIECES) return [...picks];

  return [...kept, { source: garment.source, name: garment.name }];
}

/** Clear one slot — every piece in it. */
export const clearSlot = (picks: readonly Pick[], slot: Slot): Pick[] =>
  picks.filter((p) => slotOf(p.name) !== slot);

/** Put one named piece back — the "tap a filled slot to put it back"
 *  affordance, which has to be per-piece now that Extra holds two. */
export const removePick = (picks: readonly Pick[], name: string): Pick[] =>
  picks.filter((p) => p.name !== name);

/**
 * The strip's cells in canonical order, with whatever is in them — six cells,
 * because Extra appears twice (see STRIP_SLOTS). Multiple pieces in one slot
 * fill its cells in the order they were picked.
 *
 * Key on the index, not on `slot`: two cells share the name 'Extra'.
 */
export function slotStrip(picks: readonly Pick[]): { slot: Slot; pick?: Pick }[] {
  /* One local queue per slot, consumed as the cells are walked. */
  const queues = new Map<Slot, Pick[]>();
  picks.forEach((p) => {
    const slot = slotOf(p.name);
    queues.set(slot, [...(queues.get(slot) ?? []), p]);
  });
  return STRIP_SLOTS.map((slot) => {
    const pick = queues.get(slot)?.shift();
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
  { key: 'pick', label: 'Pick', hint: `3 to ${MAX_PIECES}` },
  { key: 'look', label: 'Look', hint: 'together' },
  { key: 'render', label: 'Render', hint: 'after entering' },
  { key: 'vote', label: 'Vote', hint: 'from 8pm' },
] as const;

export type EntryStepKey = (typeof ENTRY_STEPS)[number]['key'];

/**
 * CREATE'S RIBBON MOVED, 4 Sep. It now lives in domain/renders.ts as
 * `CREATE_RIBBON`, alongside the allowance that its last segment spends.
 *
 * Three things changed with it, all of them reversals, all of them recorded
 * where the code is:
 *
 *   MODEL CAME OUT OF THE RIBBON. Casting (a18) is a screen shared by both
 *   flows, not a step — which is how ENTRY_STEPS above already treats it.
 *
 *   THE LOOK STEP CAME BACK, and is now the COMMIT. The note that used to sit
 *   here said a separate look step was cut because the Render step already
 *   showed the same flat lay. That reasoning is dead: the commit moved to the
 *   look step, so the flat lay is now the last thing you see BEFORE spending
 *   the render rather than the first thing after. There is no see-then-decide
 *   step any more, which is the whole point of moving it.
 *
 *   THE SAVE-UNRENDERED PATH IS GONE. `FREE_RENDERS_PER_DAY` lived here as
 *   "one render a day, `save as a set` is unlimited". Both halves are wrong
 *   now — see PER_DAY in domain/renders.ts, and §2.2 of the create brief for
 *   why there is no unlimited fallback to fall back to.
 */

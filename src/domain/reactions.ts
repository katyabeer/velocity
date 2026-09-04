/**
 * Reactions. Implements `reactions-logic.md` (No Fuzz Digital for Frame 23,
 * rev 1, 4 Sep 2026), which sits inside the existing invariants and overrides
 * none of them.
 *
 * ═══ THE SIX RULES THIS FILE EXISTS TO PROTECT ═══════════════════════════════
 * From §0 of the spec. Each is locked elsewhere, and reactions are the most
 * likely thing to quietly violate them.
 *
 * 1. THE FEED SAMPLER MUST NEVER READ REACTIONS. Not for ordering, weighting,
 *    filtering, "trending" or tie-breaking. `domain/magazine.ts` is the sampler
 *    and it does not import this file — keep it that way. *Sample, don't sort*
 *    is the single change that would quietly ruin the product.
 * 2. REACTIONS NEVER MINT TOKENS. Tokens have exactly two sources (a completed
 *    judging round; distinct people taking a piece). Nothing here touches
 *    `domain/economy.ts`, and a third source would re-price the economy and
 *    break the settlement arithmetic.
 * 3. REACTIONS NEVER APPEAR IN THE BUILDER. Same reason performance history
 *    doesn't: seeing what got reactions while choosing turns styling into
 *    optimising.
 * 4. NO PUBLIC NEGATIVE COUNT, EVER. Negatives aggregate to the owner alone,
 *    and only above a threshold. There are no comments in this product; a
 *    visible dislike tally is the same surface by another name.
 * 5. CLOSED VOCABULARY. Nine values, no free text, no custom emoji, no "other".
 * 6. NO NUMBERS RANKED AGAINST OTHER PEOPLE. Counts on your own work are fine.
 *    Any comparison, percentile or "most reacted" list is not.
 *
 * ═══ WHAT THIS PROTOTYPE CANNOT DO ══════════════════════════════════════════
 * ⚠ §6 of the spec requires visibility to be enforced SERVER-SIDE: "Do not ship
 * negative fields to the client and hide them in the view — that leaks through
 * the network tab, and this is the one field where the leak is a wellbeing
 * problem rather than a bug." There is no server here; the whole feed is a
 * fixture. So `publicStats` below is the client-side shape of that rule and
 * nothing more. When Jack wires a real API, the gate has to move to it — this
 * file's split into `publicStats` / `ownerStats` is the contract to implement
 * against, not a substitute for it.
 */

/** §2. Nine values. `thumbs_up` / `thumbs_down` are the direct icons; the other
 *  seven live in the panel. */
export const REACTION_VALUES = [
  'thumbs_up',
  'thumbs_down',
  'iconic',
  'bold',
  'creative',
  'fresh',
  'clashing',
  'overdone',
  'too_safe',
] as const;

export type ReactionValue = (typeof REACTION_VALUES)[number];
export type Valence = 'positive' | 'negative';

/**
 * §2: "`valence` is derived from the value, never stored — one enum, one source
 * of truth. A stored valence column will drift."
 */
const NEGATIVES = new Set<ReactionValue>(['thumbs_down', 'clashing', 'overdone', 'too_safe']);

export const valenceOf = (v: ReactionValue): Valence => (NEGATIVES.has(v) ? 'negative' : 'positive');

export const isPositive = (v: ReactionValue): boolean => valenceOf(v) === 'positive';

/** The words themselves, per §4's accessibility note: "Labels are the words
 *  themselves — 'Iconic', not an unlabelled glyph." */
export const REACTION_LABELS: Record<ReactionValue, string> = {
  thumbs_up: 'Liked it',
  thumbs_down: 'Not for me',
  iconic: 'Iconic',
  bold: 'Bold',
  creative: 'Creative',
  fresh: 'Fresh',
  clashing: 'Clashing',
  overdone: 'Overdone',
  too_safe: 'Too safe',
};

/**
 * §4. The panel's seven rows, positives first, one divider before the
 * negatives. Order is the spec's, and it is load-bearing: negatives are
 * distinguished by POSITION AND THE DIVIDER, never by colour.
 *
 * "Do not colour the negatives red. Red tags were tried and read as
 * aggressive." That reversal is also in this repo's own do-not-re-propose list.
 */
export const PANEL_VALUES = [
  'iconic',
  'bold',
  'creative',
  'fresh',
  'clashing',
  'overdone',
  'too_safe',
] as const satisfies readonly ReactionValue[];

/** Where the divider goes: after the last positive. Derived, so adding a
 *  positive to PANEL_VALUES moves it automatically. */
export const PANEL_DIVIDER_AFTER = PANEL_VALUES.filter(isPositive).length;

/** §1. What a look is, which decides whether it can be reacted to at all. */
export type LookKind = 'editorial' | 'settled_entry' | 'freestyle' | 'live_entry';

/**
 * §1. A live brief entry is not reactable, and the spec is precise about the
 * client's job: "If a client ever renders a live entry anywhere, the reaction
 * cluster must be absent, not disabled." Same for your own look — absent tap
 * target, not a greyed one.
 */
export const isReactable = (kind: LookKind): boolean => kind !== 'live_entry';

export type ReactPermission = 'open' | 'own_look' | 'not_reactable';

export function reactPermission(kind: LookKind, isOwn: boolean): ReactPermission {
  if (!isReactable(kind)) return 'not_reactable';
  if (isOwn) return 'own_look';
  return 'open';
}

/**
 * §3. THE CORE RULE: one reaction per person per look, the nine values mutually
 * exclusive. Choosing `bold` while holding `thumbs_up` REPLACES it — no
 * stacking — and tapping the held value clears it.
 *
 * The consequence that matters: a person can never inflate a look's count.
 * Volume comes from distinct people, which mirrors the distinct-rater
 * constraint at settlement.
 */
export const nextHeld = (
  held: ReactionValue | undefined,
  tapped: ReactionValue,
): ReactionValue | undefined => (held === tapped ? undefined : tapped);

/**
 * §8. What the write is, which is NOT the same question as what the UI shows.
 * "POST is idempotent-by-value: posting the value already held is a no-op
 * returning current state (not a clear — clearing is an explicit DELETE, so a
 * double-tap race can't toggle you off by accident)."
 *
 * So the UI decides clear-vs-set from the held value and calls the matching
 * verb. Keep this split when the API arrives.
 */
export type ReactIntent = 'set' | 'clear';

export const intentFor = (held: ReactionValue | undefined, tapped: ReactionValue): ReactIntent =>
  held === tapped ? 'clear' : 'set';

/** Counts by value. Absent key means zero. */
export type ReactionTally = Partial<Record<ReactionValue, number>>;

const sumOf = (tally: ReactionTally, values: readonly ReactionValue[]): number =>
  values.reduce((n, v) => n + (tally[v] ?? 0), 0);

const POSITIVE_VALUES = REACTION_VALUES.filter(isPositive);
const NEGATIVE_VALUES = REACTION_VALUES.filter((v) => !isPositive(v));

/**
 * §5's materialised aggregate, computed rather than stored — at fixture scale
 * there is nothing to gain from a table, and a derived figure cannot drift.
 *
 * `distinctReactorCount === positiveCount + negativeCount` by construction,
 * because of the one-per-person rule. The spec says to store it anyway so that
 * "keeping it explicit stops anyone summing breakdowns"; here it is a named
 * field on the return for the same reason.
 */
export type LookReactionStats = {
  positiveCount: number;
  positiveBreakdown: ReactionTally;
  negativeCount: number;
  negativeBreakdown: ReactionTally;
  distinctReactorCount: number;
};

export function aggregate(tally: ReactionTally): LookReactionStats {
  const positiveCount = sumOf(tally, POSITIVE_VALUES);
  const negativeCount = sumOf(tally, NEGATIVE_VALUES);
  const pick = (values: readonly ReactionValue[]): ReactionTally =>
    Object.fromEntries(values.filter((v) => tally[v]).map((v) => [v, tally[v]!]));
  return {
    positiveCount,
    positiveBreakdown: pick(POSITIVE_VALUES),
    negativeCount,
    negativeBreakdown: pick(NEGATIVE_VALUES),
    distinctReactorCount: positiveCount + negativeCount,
  };
}

/**
 * §4's OPTIMISTIC COMMIT, as arithmetic: the tally a look arrived with, plus
 * the one this user is holding.
 *
 * A real client gets `my_reaction` and the counts in the same payload, and the
 * counts already include yours. Here the two come from different places — the
 * tally is a fixture (other people) and `held` is local state (you) — so the
 * display has to add them.
 *
 * Doing it here rather than in the component is what keeps the one-per-person
 * rule true by construction: `held` is a single value, so this can only ever
 * add one, to one value. An earlier attempt guarded in the component against
 * double-counting a value that was already seeded, which was wrong — "other
 * people said Bold" and "I said Bold" are different facts — and it made the
 * card look inert, because reacting with a popular word changed no number.
 */
export function withOwnReaction(
  tally: ReactionTally,
  held: ReactionValue | undefined,
): ReactionTally {
  if (!held) return tally;
  return { ...tally, [held]: (tally[held] ?? 0) + 1 };
}

/**
 * §6. THE NEGATIVE THRESHOLD. Negatives reach the owner only once a look has
 * five reactions in total: "one negative reaction on a look with two reactions
 * reads as a personal note from a stranger. Above five it reads as a room."
 * Same logic as the minimum cell size of 12 on bands, scaled to a much smaller
 * sample.
 */
export const NEGATIVE_THRESHOLD = 5;

/** What ANYONE may see. There is no negative field on this type at all, which
 *  is deliberate — a component cannot render what it was never handed. */
export type PublicReactionView = {
  positiveCount: number;
  positiveBreakdown: ReactionTally;
};

export const publicStats = (tally: ReactionTally): PublicReactionView => {
  const { positiveCount, positiveBreakdown } = aggregate(tally);
  return { positiveCount, positiveBreakdown };
};

/** What the OWNER may see, and only above the threshold. */
export type OwnerReactionView = PublicReactionView & {
  distinctReactorCount: number;
  /** Null below the threshold — not zero. Zero is a claim; null is a silence. */
  negativeCount: number | null;
  negativeBreakdown: ReactionTally | null;
  enoughReads: boolean;
};

export function ownerStats(tally: ReactionTally): OwnerReactionView {
  const a = aggregate(tally);
  const enoughReads = a.distinctReactorCount >= NEGATIVE_THRESHOLD;
  return {
    positiveCount: a.positiveCount,
    positiveBreakdown: a.positiveBreakdown,
    distinctReactorCount: a.distinctReactorCount,
    enoughReads,
    negativeCount: enoughReads ? a.negativeCount : null,
    negativeBreakdown: enoughReads ? a.negativeBreakdown : null,
  };
}

/**
 * §5/§7. The most frequent value in a tally, or null on a tie or an empty
 * tally. Used for `modal_read` — "the room mostly read it as bold".
 *
 * Ties return null rather than picking one: "the room mostly read it as X" is
 * false when two reads are level, and inventing a winner is exactly the kind of
 * quiet overclaim the band system exists to avoid.
 */
export function modalValue(tally: ReactionTally): ReactionValue | null {
  const entries = Object.entries(tally) as [ReactionValue, number][];
  const present = entries.filter(([, n]) => n > 0);
  if (!present.length) return null;
  const top = Math.max(...present.map(([, n]) => n));
  const leaders = present.filter(([, n]) => n === top);
  return leaders.length === 1 ? leaders[0]![0] : null;
}

/**
 * §6. Negatives are always presented as A READ, NEVER A VERDICT:
 *
 *   > You went for clean. The room mostly read it as bold, with some reading it
 *   > as too safe.
 *
 * "Never '3 people found this overdone'. The count is available to the owner;
 * leading with it is what makes it punitive." So no number appears in this
 * sentence at all.
 *
 * ⚠ `declared` is the word from the build's tag step — which the brief flow
 * DOES NOT HAVE (locked decision 18 removed it; open question C). So the gap
 * sentence is only fully computable on freestyle posts, which carry an
 * occasion and free tags. Passing no `declared` degrades to the room's read
 * alone rather than fabricating half a sentence.
 */
export function readSentence(
  tally: ReactionTally,
  declared?: string | null,
): string | null {
  const view = ownerStats(tally);
  if (!view.enoughReads) return null;

  const read = modalValue(view.positiveBreakdown);
  if (!read) return null;

  const alsoRan = modalValue(view.negativeBreakdown ?? {});
  const opener = declared ? `You went for ${declared}. ` : '';
  const tail = alsoRan ? `, with some reading it as ${REACTION_LABELS[alsoRan].toLowerCase()}` : '';
  return `${opener}The room mostly read it as ${REACTION_LABELS[read].toLowerCase()}${tail}.`;
}

/** Below the threshold the owner's panel says this instead (§6). */
export const NOT_ENOUGH_READS = 'not enough reads yet';

/**
 * The public face of a look, as words: "Bold · Fresh" (§6 — "as words, not a
 * table of numbers"). Ordered by count, then by the vocabulary's own order so
 * the result is stable rather than dependent on object key order.
 */
export function breakdownWords(tally: ReactionTally, limit = 3): string[] {
  const entries = Object.entries(tally) as [ReactionValue, number][];
  return entries
    .filter(([, n]) => n > 0)
    .sort(
      (a, b) => b[1] - a[1] || REACTION_VALUES.indexOf(a[0]) - REACTION_VALUES.indexOf(b[0]),
    )
    .slice(0, limit)
    .map(([v]) => REACTION_LABELS[v]);
}

/**
 * §7. What reactions DO NOT feed, kept as named constants because the spec's
 * own warning is that someone will wire them together later:
 *
 * "The Eye ladder is difficulty-weighted accuracy on close paired calls. A
 * reaction has no correct answer, so it cannot be scored for accuracy. Keep the
 * two words apart in code and in copy or someone will wire them together."
 */
export const REACTIONS_FEED_BUILD_LADDER = false as const;
export const REACTIONS_FEED_EYE_LADDER = false as const;
export const REACTIONS_MINT_TOKENS = false as const;
export const REACTIONS_FEED_MILESTONES = false as const;
export const REACTIONS_ON_GARMENTS = false as const;

/** §7. "No negative reaction reduces any number anywhere. `positive_total` is
 *  not net of negatives. There is no net score." */
export const NEGATIVES_SUBTRACT = false as const;

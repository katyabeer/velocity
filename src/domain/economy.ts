/**
 * Tokens — the whole economy.
 *
 * THE LOAD-BEARING RULE: no judging, no clothes. Tokens are the only way a
 * garment enters a wardrobe, and completing a judging round is the only way
 * tokens arrive (plus takings from other people). Break this and A becomes B.
 *
 * NAMING: `tokens`, never `keeps` or `pinches`. R-G5 and brief invariant 7 both
 * hold that the Sorare regulatory exposure came from market framing, not real
 * money — "3 tokens" and a **Keep it** button avoid that, a spendable balance
 * does not. The prototype still used `S.pinch` internally; that has been
 * renamed here on purpose. Do not reintroduce the old word, even in a variable.
 *
 * REFUSED, REPEATEDLY: a currency earned from streaks or engagement. Progression
 * comes from result quality, not attendance (R-P2). "Open the app a lot → more
 * clothes" saturates your best players fastest.
 */

/** Locked decision 3, source 1: completing the ten-call round. */
export const TOKENS_PER_JUDGING_ROUND = 3;

/** Locked decision 3, source 2: one token per *distinct* person who takes a
 *  piece from any of your looks — decoupled from the daily brief, so freestyle
 *  posts count too. This is what prices submission supply, which was previously
 *  unpriced and was the design's most serious structural fault. */
export const TOKENS_PER_DISTINCT_TAKER = 1;

/** Starring is free. Taking costs a token. */
export const TOKEN_COST_PER_TAKE = 1;

/**
 * Wardrobe cap. 99 in the prototype; the handover recommends dropping to 40
 * for the test build so the cap is reachable in a session.
 */
export const WARDROBE_CAP = 99;
export const WARDROBE_CAP_TEST_BUILD = 40;

/** How many calls make a round. Temporarily 5, not the documented 10 (see
 *  settlement.ts) — a test-scale drop, not a re-derivation of the settlement
 *  math itself; see settlement.ts's own comment on COMPARISONS_TO_SETTLE. */
export const JUDGING_QUOTA = 5;

export type LedgerReason =
  | 'judging-round-complete'
  | 'distinct-taker'
  | 'take-garment'
  | 'return-garment'
  | 'day-one-grant';

export type Ledger = {
  balance: number;
  /** True once the current day's judging round has been completed. */
  roundComplete: boolean;
  /** Names of garments currently held via a token. */
  held: readonly string[];
};

/**
 * MARK-THEN-MINT. Tokens land only when you finish the round (currently 5
 * calls — see JUDGING_QUOTA).
 *
 * Pinching used to mint on the spot, which meant you could cast one vote, take
 * three pieces and leave — 2 comparisons supplied for 3 pieces, against a full
 * round's worth for the same 3 if you finished. Marking during the round and
 * minting at the end is the fix. `markDuringRound` is a UI affordance only; it
 * must never move the balance.
 */
export function completeJudgingRound(ledger: Ledger): Ledger {
  if (ledger.roundComplete) return ledger;
  return {
    ...ledger,
    balance: ledger.balance + TOKENS_PER_JUDGING_ROUND,
    roundComplete: true,
  };
}

export const canTake = (ledger: Ledger, wardrobeSize: number, cap = WARDROBE_CAP): boolean =>
  ledger.balance >= TOKEN_COST_PER_TAKE && wardrobeSize < cap;

/**
 * Take a piece. Mints a COPY — locked decision 4. The owner loses nothing and
 * is never notified. No market, no expiry, nothing bought, sold, traded, gifted
 * or lost. This is the deliberate regulatory distance from the Sorare and
 * DraftKings precedents, and it is not a detail.
 */
export function takeGarment(ledger: Ledger, name: string): Ledger {
  if (ledger.balance < TOKEN_COST_PER_TAKE) return ledger;
  if (ledger.held.includes(name)) return ledger;
  return {
    ...ledger,
    balance: ledger.balance - TOKEN_COST_PER_TAKE,
    held: [...ledger.held, name],
  };
}

/** Putting a piece back refunds the token. Nothing is ever lost for good. */
export function returnGarment(ledger: Ledger, name: string): Ledger {
  if (!ledger.held.includes(name)) return ledger;
  return {
    ...ledger,
    balance: ledger.balance + TOKEN_COST_PER_TAKE,
    held: ledger.held.filter((n) => n !== name),
  };
}

/** Tokens earned overnight from other people taking your pieces. */
export const tokensFromTakers = (distinctTakers: number): number =>
  distinctTakers * TOKENS_PER_DISTINCT_TAKER;

/**
 * OPEN QUESTION A — the first-look bonus, formerly "the Day 1 entry grant".
 *
 * REFRAMED 4 Sep (Katya). It used to be three tokens for *entering* on day one,
 * which strained "no judging, no clothes": entering is not judging, so the
 * copy was explaining an exception to the rule the whole economy rests on. It
 * is now three tokens for YOUR FIRST EVER LOOK — a one-off, bounded, plainly
 * an achievement rather than a second route to clothes.
 *
 * That is a better frame, not a resolution. Question A is still open: the
 * standing alternative is to drop it entirely. What has changed is that the
 * exception no longer has to be argued for in the copy.
 *
 * ⚠ THE TRIGGER STILL SAYS DAY ONE, not "you have no prior looks". In this
 * prototype those are the same thing — day one IS the first look — so nothing
 * is wrong on screen. With real accounts it would need to read the looks
 * archive instead. See today/rendering.tsx, which fires it.
 *
 * Flip ENABLED to `false` to take the drop-it path. Katya's call — do not
 * decide it in code.
 */
export const FIRST_LOOK_BONUS_ENABLED = true;
export const TOKENS_FOR_FIRST_LOOK = 3;

/** Legacy capsule sizes. The capsule picker was cut on 3 Sep, but
 *  data/capsules.ts survives as the Day 2 fixture source and its test asserts
 *  this size, so the constant is still load-bearing there. */
export const STARTER_CAPSULE_SIZE = 8;

/**
 * ═══ WHAT A NIGHT PAID OUT ══════════════════════════════════════════════════
 * The success screen itemises it, so the sources are data rather than three
 * hard-coded lines of copy. Adding a behaviour later — Katya has more to
 * define — is a new entry in `TOKEN_AWARD_LABELS` plus a line in
 * `awardsForTonight`, and the screen needs no change at all.
 *
 * ONLY WHAT WAS EARNED TONIGHT belongs in here. Tokens that arrived overnight
 * from other people taking pieces are part of the BALANCE, not of this
 * challenge — putting them in a list headed "tokens earned" would credit
 * tonight's work with something last night's did.
 */
export type TokenAwardKind = 'challenge' | 'first-look';

/** The reason, as it appears after the amount: "+3 tokens completed challenge". */
export const TOKEN_AWARD_LABELS: Record<TokenAwardKind, string> = {
  challenge: 'completed challenge',
  'first-look': 'for the first ever look created',
};

export type TokenAward = { kind: TokenAwardKind; amount: number };

/**
 * The night's awards, in the order they were earned. `firstLook` is whether the
 * first-look bonus actually fired — the caller reads it off the ledger rather
 * than re-deriving "is it day one", so the screen can never claim a bonus that
 * was not paid.
 */
export function awardsForTonight({ firstLook }: { firstLook: boolean }): TokenAward[] {
  return [
    { kind: 'challenge' as const, amount: TOKENS_PER_JUDGING_ROUND },
    firstLook ? { kind: 'first-look' as const, amount: TOKENS_FOR_FIRST_LOOK } : null,
  ].filter((a): a is TokenAward => a !== null);
}

export const awardsTotal = (awards: readonly TokenAward[]): number =>
  awards.reduce((n, a) => n + a.amount, 0);

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

/** How many calls make a round. See settlement.ts for why it is 10 and not 15. */
export const JUDGING_QUOTA = 10;

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
 * MARK-THEN-MINT. Tokens land only when you finish the ten.
 *
 * Pinching used to mint on the spot, which meant you could cast one vote, take
 * three pieces and leave — 2 comparisons supplied for 3 pieces, against 20 for
 * the same 3 if you finished. Marking during the round and minting at the end
 * is the fix. `markDuringRound` is a UI affordance only; it must never move the
 * balance.
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
 * OPEN QUESTION A — the Day 1 token grant.
 *
 * The prototype grants 3 tokens for *entering* on day one, so a tester who
 * enters at 19:40 has something to do before judging opens. It is an exception
 * to "no judging, no clothes", and the coupling is the cleanest thing in
 * version A.
 *
 * Recommendation on the table: DROP IT, and make the starter capsule eleven
 * pieces instead of eight. Same outcome for the tester, no exception, no
 * unearned token in the counter, one number changes.
 *
 * Flip this to `false` and set STARTER_CAPSULE_SIZE to 11 to take that path.
 * Katya's call — do not decide it in code.
 */
export const DAY_ONE_ENTRY_GRANT_ENABLED = true;
export const DAY_ONE_ENTRY_GRANT = 3;
export const STARTER_CAPSULE_SIZE = 8;
export const STARTER_CAPSULE_SIZE_IF_GRANT_DROPPED = 11;

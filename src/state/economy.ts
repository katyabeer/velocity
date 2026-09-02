/**
 * Economy store — the token balance, what you hold, and the judging round.
 *
 * Everything that moves the balance goes through domain/economy.ts, which is
 * pure and tested. This store only holds state and delegates.
 */

import { create } from 'zustand';
import { ACTIVE_DAY, dayConfig, type TestDay } from '@/config/testState';
import {
  JUDGING_QUOTA,
  completeJudgingRound,
  returnGarment,
  takeGarment,
  type Ledger,
} from '@/domain/economy';

type EconomyState = Ledger & {
  /** Calls cast in tonight's round, 0–quota (JUDGING_QUOTA). */
  callsCast: number;
  quota: number;
  /** Tokens that landed overnight from other people taking your pieces. */
  overnightTokens: number;
  /** Pieces starred in the magazine. Starring is FREE; taking costs a token. */
  starred: readonly string[];
  /** Day 1 only: has the entry grant been handed over yet. */
  entryGrantTaken: boolean;

  castCall: () => void;
  toggleStar: (name: string) => void;
  take: (name: string) => void;
  putBack: (name: string) => void;
  grantDayOneTokens: (amount: number) => void;
  resetToDay: (day: TestDay) => void;
};

const initial = (day: TestDay) => {
  const cfg = dayConfig(day);
  return {
    balance: cfg.startingTokens,
    roundComplete: false,
    held: [] as readonly string[],
    callsCast: 0,
    quota: JUDGING_QUOTA,
    overnightTokens: cfg.overnightTokens,
    starred: [] as readonly string[],
    entryGrantTaken: false,
  };
};

export const useEconomy = create<EconomyState>((set) => ({
  ...initial(ACTIVE_DAY),

  /**
   * MARK-THEN-MINT: the balance only moves on the last call of the round
   * (JUDGING_QUOTA), never before. A tie or a sub-1.2s call still counts as
   * a call for the quota — it is discounted in the settlement weighting,
   * not refused. See domain/settlement.
   */
  castCall: () =>
    set((s) => {
      const callsCast = Math.min(s.callsCast + 1, s.quota);
      if (callsCast < s.quota) return { callsCast };
      const minted = completeJudgingRound(s);
      return { callsCast, balance: minted.balance, roundComplete: minted.roundComplete };
    }),

  toggleStar: (name) =>
    set((s) => ({
      starred: s.starred.includes(name)
        ? s.starred.filter((n) => n !== name)
        : [...s.starred, name],
    })),

  take: (name) => set((s) => takeGarment(s, name)),
  putBack: (name) => set((s) => returnGarment(s, name)),

  grantDayOneTokens: (amount) =>
    set((s) => (s.entryGrantTaken ? s : { balance: s.balance + amount, entryGrantTaken: true })),

  resetToDay: (day) => set(initial(day)),
}));

/** Derived: does the user have anything to spend. */
export const useHasTokens = (): boolean => useEconomy((s) => s.balance > 0);

/** Derived: calls remaining in tonight's round. */
export const useCallsRemaining = (): number =>
  useEconomy((s) => Math.max(0, s.quota - s.callsCast));

export const tokenLabel = (n: number): string => `${n} token${n === 1 ? '' : 's'}`;

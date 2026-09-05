/**
 * Create store — freestyle. No brief, no job, no score, and now no save path.
 *
 * ══ WHAT CHANGED ON 4 Sep, AND WHY YOU MUST NOT UNDO IT ══
 *
 * Three reversals of locked positions, all Katya's, all with the cost named
 * and accepted. The reasoning lives next to the code it governs:
 *   · free-text tags, reversing "no free text anywhere"  → domain/tags.ts
 *   · the allowance and the one re-render                → domain/renders.ts
 *   · render or nothing, reversing the private save      → this file, below
 *
 * ══ RENDER OR NOTHING (§2.2) ══
 *
 * `saveUnrendered`, `renderAndSavePrivately` and `destination` are all gone. A
 * freestyle look is rendered and published, or it does not exist. Two
 * consequences that had to be built, not just declared:
 *
 *   1. THE FLOW IS BLOCKED AT ENTRY, NOT AT STEP 2. If you cannot render, you
 *      cannot do anything with a look, so there is no reason to let you pick
 *      pieces. A spent user never sees step 1 — the tab shows the `spent`
 *      state instead (`createTabState` in domain/renders.ts). Simpler than
 *      gating the button at step 2, and it stops the flow being a corridor to
 *      a closed door.
 *   2. BACKING OUT OF STEP 2 DESTROYS THE WORK, so it asks first. One line,
 *      not a modal ceremony: `LEAVE_WITHOUT_RENDERING`.
 *
 * ══ THE COMMIT IS AT STEP 2, AND THE ALLOWANCE GOES AT THE COMMIT ══
 *
 * Not at completion. If the allowance were only spent on success, a user could
 * start a render, kill the app and start again — a reroll through the back
 * door, which defeats the frozen-input constraint by process management.
 *
 *   ⚠ THE BRIEF CONTRADICTS ITSELF HERE AND SOMEONE SHOULD SAY SO. §6's state
 *   table describes `building` as "mid-flow, cstep 1–3, allowance still
 *   unspent", but §3 and §4 put the commit at step 2 and acceptance criterion
 *   2 says the commit consumes the allowance "immediately, before the job
 *   completes". Those cannot both hold for step 3. Resolved in favour of the
 *   acceptance criteria, because criterion 5 ("backing out of step 2 refunds
 *   nothing — nothing was spent") only makes sense if the spend is the step-2
 *   BUTTON. So: steps 1–2 are `building` with the allowance intact; pressing
 *   the step-2 button spends it, and steps 3–4 are past the point of no
 *   return. Say if you meant it the other way round.
 *
 * That leaves one state the brief does not name: committed, tags and casting
 * not yet given, job not yet started. It is resumable at step 3 and it says so
 * ("your render is paid for"). Abandoning there does NOT hand the allowance
 * back — that is what irreversible means, and refunds are for system failure
 * only.
 *
 * PICKING REUSES THE BRIEF FLOW'S SLOT LOGIC (togglePick/removePick from
 * domain/entry.ts). Locked decision 11 as amended 3 Sep is "6 pieces, one per
 * slot except Extra which takes two, for BRIEFS AND FREESTYLE".
 *   ⚠ THE CREATE BRIEF SAYS "3–5 PIECES" in §1 and §3. That is stale: Katya
 *   amended the cap to 6 on 3 Sep, one day before the create brief was
 *   written, and MAX_PIECES is derived from SLOT_CAPACITY rather than written
 *   down. Built to 6. Say if Create is meant to be tighter than the builder.
 */

import { create } from 'zustand';
import { togglePick, removePick, MIN_PIECES, MAX_PIECES, type Pick } from '@/domain/entry';
import {
  commitAll,
  removeTag,
  type TagRejection,
} from '@/domain/tags';
import {
  consume,
  consumeRerender,
  dayKey,
  freshAllowance,
  refund,
  rendersLeft,
  rerendersLeft,
  type Allowance,
} from '@/domain/renders';
import type { Category } from '@/domain/garments';
import { useSubmission } from './submission';
import { useToast } from './toast';

/** 1 pick · 2 look (the commit) · 3 tag · 4 render. Casting sits between 3
 *  and 4 on its own route and is NOT a step — it is a screen shared with the
 *  builder, which is how the builder already treats it. */
export type CreateStep = 1 | 2 | 3 | 4;

type CreateState = {
  step: CreateStep;
  picks: readonly Pick[];
  /** BY GARMENT TYPE AND NOTHING ELSE. Category, not slot, so Dresses can be
   *  its own rail while still occupying the Top slot. */
  filter: Category | 'All';
  /** Free text, normalised, max 5. The closed occasion axis is gone — see
   *  domain/tags.ts for what that costs. */
  tags: readonly string[];
  /** What is in the input but not yet a chip. Space or comma commits it. */
  draft: string;
  /** The last refusal, so the field can name the offending tag. Cleared on
   *  the next keystroke — an error that outlives the mistake is noise. */
  rejection: TagRejection | null;
  /** Set by the step-2 commit. Past this the flow cannot be abandoned to
   *  `available`: the allowance is spent. */
  committed: boolean;
  /**
   * EVERY TAG YOU HAVE EVER PUBLISHED, newest first. Two jobs, both cheap:
   *
   *   · "Your words" on the You screen — your five most-used tags, which is a
   *     genuine self-portrait at no computational cost now that Create takes
   *     free text.
   *   · the ONLY legitimate source for autocomplete, if one is ever built.
   *     Never a global popular-tag list — that converges everyone's vocabulary
   *     and is popularity-weighting through the back door. See
   *     OWN_HISTORY_ONLY in domain/tags.ts.
   *
   * ⚠ MODERATION: a shadow-hidden tag must never resurface here. There is no
   * report queue yet (Katya q3), so nothing hides anything; when there is, it
   * filters on the way IN to this list, not on the way out.
   */
  tagHistory: readonly string[];
  /** TWO SEPARATE ALLOWANCES, keyed by kind, never one shared counter. The
   *  brief's lives here too so the 07:00 rollover happens in one place — but
   *  they are distinct records and spending one leaves the other. */
  allowance: Record<'brief' | 'freestyle', Allowance>;

  toggle: (name: string) => void;
  /** By NAME, not by slot — Extra holds two, and clearing the slot would take
   *  out both when the user tapped one. */
  putBack: (name: string) => void;
  setStep: (step: CreateStep) => void;
  setFilter: (f: Category | 'All') => void;
  setDraft: (d: string) => void;
  /** Commits whatever is in the draft as one or more chips. */
  commitDraft: () => void;
  removeTag: (t: string) => void;
  /** ⚑ THE COMMIT. Spends the freestyle allowance and closes the door. Does
   *  not start the job — casting is still to come. */
  commit: () => void;
  /** Starts the job, after casting. Called from the casting screen's exit. */
  startRender: () => void;
  /** The one re-render: frozen input, in place. Guarded by `rerenderVerdict`
   *  at the call site, and by the allowance here. */
  rerender: () => void;
  /** System failure only. Hands the allowance back and clears the flow. */
  refundFailure: () => void;
  /** System failure only, and the mirror of `refundFailure` for the other
   *  lane. Clears the dead job so the card can leave `failed`, and hands the
   *  allowance back.
   *    ⚠ `useBriefRendersLeft` is read by NOTHING, so the brief allowance
   *  currently gates no behaviour — this is for symmetry between the lanes,
   *  not because anything would break without it. */
  refundBrief: () => void;
  /** Marks the brief's allowance spent. Called when the day's job is entered,
   *  so the two counters stay independent but roll over together. */
  spendBrief: () => void;
  startAgain: () => void;
};

const blank = {
  step: 1 as CreateStep,
  picks: [] as readonly Pick[],
  filter: 'All' as const,
  tags: [] as readonly string[],
  draft: '',
  rejection: null as TagRejection | null,
  committed: false,
};

const today = () => dayKey(new Date());

export const useCreate = create<CreateState>((set, get) => ({
  ...blank,
  tagHistory: [],
  allowance: {
    brief: freshAllowance(today()),
    freestyle: freshAllowance(today()),
  },

  toggle: (name) => set((s) => ({ picks: togglePick(s.picks, { name, source: 'owned' }) })),
  putBack: (name) => set((s) => ({ picks: removePick(s.picks, name) })),
  setStep: (step) => set({ step }),
  setFilter: (filter) => set({ filter }),

  /* Committing on delimiter rather than storing one text line is what makes
     the 5 cap visible and deletion per-tag (§5). A trailing space is the
     signal, so it is checked here and not on submit. */
  setDraft: (draft) => {
    if (/[\s,]/.test(draft)) {
      const { tags, rejection } = commitAll(get().tags, draft);
      set({ tags, rejection, draft: rejection ? draft.replace(/[\s,]+$/, '') : '' });
      return;
    }
    set({ draft, rejection: null });
  },

  commitDraft: () => {
    const s = get();
    if (!s.draft.trim()) return;
    const { tags, rejection } = commitAll(s.tags, s.draft);
    set({ tags, rejection, draft: rejection ? s.draft : '' });
  },

  removeTag: (t) => set((s) => ({ tags: removeTag(s.tags, t), rejection: null })),

  commit: () => {
    const s = get();
    const day = today();
    if (rendersLeft(s.allowance.freestyle, 'freestyle', day) <= 0) return;
    set({
      committed: true,
      step: 3,
      allowance: { ...s.allowance, freestyle: consume(s.allowance.freestyle, day) },
    });
  },

  startRender: () => {
    const s = get();
    useSubmission.getState().submit('create', {
      destination: 'magazine',
      picks: s.picks.map((p) => p.name),
      tags: s.tags,
    });
    /* No "you're in" toast any more. It used to say "we'll tell you when it's
       ready", which was the whole message of a screen the user is now looking
       at — the render step IS the notification. */
    set({
      step: 4,
      /* The tags are frozen from here (invariant: no back-out after publish),
         so this is the last moment they can still change and the right one to
         file them. Newest first, and a re-render files nothing — it is the
         same post, not a second one. */
      tagHistory: [...s.tags, ...s.tagHistory],
    });
  },

  rerender: () => {
    const s = get();
    const day = today();
    if (rerendersLeft(s.allowance.freestyle, 'freestyle', day) <= 0) return;
    useSubmission.getState().rerender('create');
    useToast.getState().show('Generating it again — same look, different result.');
    set({ allowance: { ...s.allowance, freestyle: consumeRerender(s.allowance.freestyle, day) } });
  },

  refundFailure: () => {
    const s = get();
    const day = today();
    useSubmission.getState().clear('create');
    set({
      ...blank,
      allowance: { ...s.allowance, freestyle: refund(s.allowance.freestyle, day) },
    });
  },

  refundBrief: () => {
    const s = get();
    const day = today();
    useSubmission.getState().clear('brief');
    set({ allowance: { ...s.allowance, brief: refund(s.allowance.brief, day) } });
  },

  spendBrief: () => {
    const s = get();
    const day = today();
    if (rendersLeft(s.allowance.brief, 'brief', day) <= 0) return;
    set({ allowance: { ...s.allowance, brief: consume(s.allowance.brief, day) } });
  },

  /* `blank` deliberately excludes tagHistory and allowance — starting a new
     look does not un-say the words you have already published, and it does not
     hand back today's render. */
  startAgain: () => set(blank),
}));

export const useCanAdvanceCreate = (): boolean =>
  useCreate((s) => s.picks.length >= MIN_PIECES && s.picks.length <= MAX_PIECES);

/** Freestyle renders left today. Reads through the 07:00 boundary, so a stale
 *  day's counts come back as a full allowance without anything having to write
 *  to the store first. */
export const useFreestyleLeft = (): number =>
  useCreate((s) => rendersLeft(s.allowance.freestyle, 'freestyle', today()));

export const useFreestyleRerendersLeft = (): number =>
  useCreate((s) => rerendersLeft(s.allowance.freestyle, 'freestyle', today()));

export const useBriefRendersLeft = (): number =>
  useCreate((s) => rendersLeft(s.allowance.brief, 'brief', today()));

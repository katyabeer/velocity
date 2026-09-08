/**
 * a10 · YOU — what the screen is allowed to say, and when.
 *
 * ══ THE PRINCIPLE THAT DECIDES EVERY EMPTY STATE ══
 *
 *   An empty state that names a FUTURE is fine.
 *   An empty state that names an ABSENCE is not.
 *
 * Six unearned milestones are a roadmap. A grid of zeros is an accusation.
 * That one distinction resolves every rule in this file, and it produces a
 * deliberate asymmetry worth saying out loud: MILESTONES SHOW IN FULL FROM DAY
 * ONE, and almost everything else stays hidden until it has something true to
 * say.
 *
 * NEVER SHIP A PLACEHOLDER THAT PROMISES A FEATURE. "Keep going and we'll tell
 * you about your eye" is an IOU against the most expensive computation in the
 * product. Hide the section instead — see `qualifyingTips`.
 *
 * ══ TWO THINGS THE YOU-BRIEF ASSUMES THAT ARE NOT TRUE IN THIS BUILD ══
 *
 * Both are load-bearing for its day-one design, so they are recorded here
 * rather than quietly worked around.
 *
 * 1. THERE IS NO CAPSULE. The brief's §1 rests on the user having made "two
 *    real declarations before they see this screen — the capsule at o6 and the
 *    rails at o5", and its day-one sentence is capsule-derived ("You started
 *    in quiet tailoring"). The capsule PICKER was cut on 3 Sep (Katya): it
 *    asked a new user to choose clothes before they had seen a job. So on day
 *    one the only declaration that exists is RAILS — which is a preference
 *    about clothes, deliberately soft, and far too thin to hang an identity
 *    sentence on. Building one from it would be inventing the very thing this
 *    screen exists not to invent, so the sentence stays HIDDEN until there are
 *    looks to read. See `sentenceState`.
 *
 * 2. THERE IS NO DECLARED WORD, so THE GAP HAS NO INPUT ANYWHERE. Locked
 *    decision 18 removed Build's tag step, and handover open question C is
 *    whether it returns. Both the you-brief and the create brief say "the gap
 *    survives on brief entries, because Build step 3 keeps its single closed
 *    declared word" — that step does not exist. The consequence for this
 *    screen is strict and safe: since a negative read may appear in the
 *    sentence ONLY in gap form, and gap form is unreachable, NO NEGATIVE READ
 *    APPEARS IN THE SENTENCE AT ALL. `roomClause` enforces that by
 *    construction rather than by care.
 *
 * ⚠ Katya q3 recommends setting Build's declared words to the four positive
 * reaction words. There is nothing to set them on yet. That is open question C
 * with a price tag, not a copy change.
 */

import { REACTION_LABELS, isPositive, type ReactionValue } from './reactions';

/* ══════════════════════ §4 · the descriptor line ══════════════════════ */

/** A week. Tenure keeps naming newness for the first week, which is the point:
 *  the descriptor should read as *new here*, not as *empty*. */
export const NEW_FOR_DAYS = 7;

/** `dayNumber` is the ORDINAL DAY OF USE, where 1 is the day you joined — not
 *  days elapsed. Someone on their second day reads "day 2", which is what
 *  "days since join" got wrong by one. */
export type Tenure = { dayNumber: number; hasEntered: boolean; looks: number };

/**
 * handle · tenure · body of work.
 *
 * THE LOOK COUNT IS SUPPRESSED BELOW 1. "Just joined" already says everything
 * the zero would, and a zero converts "you're new" into "you have nothing" —
 * which is the same figure doing damage in the same place the old hardcoded
 * `0 looks` did.
 *
 * "JUST JOINED" PERSISTS UNTIL THE FIRST ENTRY, not the first login. Someone
 * who signs up at 21:00 and cannot enter until tomorrow is still just joined,
 * correctly — which is why this takes `hasEntered` and not only a date.
 */
export function descriptor(t: Tenure): string {
  if (!t.hasEntered) return 'just joined';
  const look = `${t.looks} ${t.looks === 1 ? 'look' : 'looks'}`;
  const days = Math.max(1, t.dayNumber);
  if (days <= NEW_FOR_DAYS) return `day ${days} · ${look}`;
  const weeks = Math.floor(days / 7);
  const age =
    weeks < 5 ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'} in` : `${Math.floor(days / 30)} months in`;
  return `${age} · ${look}`;
}

/**
 * THE EARN ROUTE, not the token count. The you-brief asks for the header's
 * token figure to be converted into the next action — `0 tokens · judging
 * opens at 8pm` — and a zero here is genuinely useful, because it gates taking
 * pieces.
 *
 * But the figure is ALREADY IN THE HEADER on every screen in the app: the
 * TokenBadge in `LogoBlock`. Printing it again in the descriptor put "0" twice
 * on one line, so only the half the badge cannot say survives. Null once
 * non-zero — the route only helps someone who needs it, and it is not
 * app-wide chrome, so it belongs on this screen alone.
 */
export function earnRoute(tokens: number): string | null {
  return tokens > 0 ? null : 'judging opens at 8pm';
}

/**
 * handle · tenure · the route, assembled. THE HANDLE SEGMENT IS DROPPED WHEN
 * THERE IS NO HANDLE: there is deliberately no fallback string — an empty
 * handle means onboarding did not complete — and a bare `@` is worse than
 * saying nothing, which is what it rendered before this existed.
 */
export function profileLine(input: {
  handle: string;
  tenure: Tenure;
  tokens: number;
}): string {
  return [
    input.handle ? `@${input.handle}` : null,
    descriptor(input.tenure),
    earnRoute(input.tokens),
  ]
    .filter(Boolean)
    .join(' · ');
}

/* ══════════════════════ §5 · which sections appear ══════════════════════ */

export const YOU_SECTIONS = ['sentence', 'justForYou', 'posts', 'stats', 'milestones'] as const;
export type YouSection = (typeof YOU_SECTIONS)[number];

export type YouRollup = {
  looks: number;
  looksSettled: number;
  piecesOwned: number;
  piecesTaken: number;
  distinctTakers: number;
  jobsEntered: number;
  freestylePosts: number;
  judgingRounds: number;
  streakDays: number;
  reactionsReceived: number;
  distinctReactors: number;
  /** The modal positive read, from the reaction vocabulary. Null below the
   *  read threshold — and it is NEVER a negative, see `roomClause`. */
  modalRead: ReactionValue | null;
  /** Your own construction words. NOT from the reaction vocabulary: these
   *  describe what you build, not how the room read it, so AC 11 does not
   *  reach them. */
  buildWords: readonly string[];
  topTags: readonly string[];
  mostUsedPieces: readonly { value: string; label: string }[];
  closeCallsJudged: number;
};

/**
 * MILESTONES IS ALWAYS IN. Everything else earns its place.
 *
 * `justForYou` is the one the brief is most insistent about: absent, not
 * empty. A section that says "we'll have something for you later" is an IOU
 * against a cohort query.
 */
export function visibleSections(r: YouRollup): YouSection[] {
  const out: YouSection[] = [];
  if (sentenceState(r) !== 'hidden') out.push('sentence');
  if (qualifyingTips(r).length > 0) out.push('justForYou');
  out.push('posts', 'stats', 'milestones');
  return out;
}

/* ══════════════════════ §5.1 · you in a sentence ══════════════════════ */

/** From roughly the third look — enough to describe your own behaviour
 *  without any cohort computation. */
export const SENTENCE_MIN_LOOKS = 3;

export type SentenceState = 'hidden' | 'building' | 'established';

export function sentenceState(r: YouRollup): SentenceState {
  if (r.looks < SENTENCE_MIN_LOOKS) return 'hidden';
  return r.modalRead ? 'established' : 'building';
}

/** "quiet and structured" — your own words, joined. */
export const buildClause = (words: readonly string[]): string =>
  words.length <= 1 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;

/**
 * THE ROOM'S HALF OF THE SENTENCE, and the one place a rule has to hold by
 * construction.
 *
 * "You in a sentence" is an IDENTITY STATEMENT, so it must never carry a bare
 * negative attribute. "The room reads you as too safe" is a character verdict,
 * and the product never punishes. A negative may appear only in GAP form — a
 * tension between what you went for and how it landed, which points at
 * something changeable instead of at the person.
 *
 * Gap form needs a declared word. There is no declared word (see the header),
 * so a negative modal read returns NOTHING here and stays in the per-look
 * read, where it is aggregated and owner-only. That is a real loss of signal
 * and it is the honest behaviour: the alternative is a bare negative in an
 * identity sentence.
 */
export function roomClause(modalRead: ReactionValue | null): string | null {
  if (!modalRead) return null;
  if (!isPositive(modalRead)) return null;
  return REACTION_LABELS[modalRead].toLowerCase();
}

/**
 * THE CHIP ROW IS ROOM-DERIVED, so it is hidden entirely rather than showing
 * dashes. Its third chip is the modal read, drawn from the reaction
 * vocabulary — it used to read `sharp most read`, and `sharp` is not a
 * reaction word, so the screen could produce "you build quiet and the room
 * reads you as sharp" out of a vocabulary containing neither (AC 11).
 */
export function sentenceChips(
  r: YouRollup,
): readonly { value: string; label: string }[] | null {
  if (sentenceState(r) !== 'established') return null;
  const read = roomClause(r.modalRead);
  return read ? [...r.mostUsedPieces.slice(0, 2), { value: read, label: 'most read' }] : null;
}

/* ══════════════════════ §5.3 · stats, zeros suppressed ══════════════════════ */

/**
 * SUPPRESS ZERO COUNTERS, KEEP THE SECTION. A day-one user has one true
 * number — pieces owned — so that is what shows.
 *
 * ⚠ KATYA'S CALL (open q1, recommendation taken). The counter-argument is that
 * visible zeros show the shape of what is coming; Milestones already does that
 * job and does it in the register of goals rather than deficits. If you want
 * the full grid from day one, flip `SUPPRESS_ZERO_STATS` — it is one line, as
 * promised.
 */
export const SUPPRESS_ZERO_STATS = true;

export type StatRow = { label: string; value: string };
/** A grid cell knows whether it is a zero, so the view can grey it rather than
 *  drop it. See `statCells`. */
export type StatCell = StatRow & { zero: boolean };

/**
 * EVERY stat, zeros included, for the grid on You.
 *
 * ⟲ THIS REOPENS you-brief q1, AND IT IS KATYA'S CALL (7 Sep). `statRows`
 * below suppresses zeros, and "a day-one grid of zeros under Stats" is on the
 * do-not-re-propose list — the objection being that Milestones is the roadmap
 * and zeros are an accusation.
 *
 * Her day-1 mock (`you-days-1-2-3.html`, rev 2) answers that objection rather
 * than ignoring it: the zeros are set in the RULE COLOUR, not in ink —
 * "present enough to teach what's coming, quiet enough not to read as an
 * accusation." They also carry the shape of the page on the one day there is
 * nothing else to carry it. So the grid gets them, greyed, and `SUPPRESS_ZERO_STATS`
 * still governs the row list.
 *
 * If the accusation reading wins after all, `keepZeros: false` at the call
 * site is the whole change.
 */
export function statCells(
  r: YouRollup,
  showStreak: boolean,
  opts: { keepZeros?: boolean } = {},
): StatCell[] {
  const all: readonly { label: string; n: number; on?: boolean }[] = [
    { label: 'Streak', n: r.streakDays, on: showStreak },
    { label: 'Jobs entered', n: r.jobsEntered },
    { label: 'Freestyle posts', n: r.freestylePosts },
    { label: 'Judging rounds finished', n: r.judgingRounds },
    { label: 'People who took your pieces', n: r.distinctTakers },
    /* The acquisition side of the loop. It was invisible while the giving side
       was shown, and it is half the daily loop. */
    { label: 'Pieces you’ve taken', n: r.piecesTaken },
    /* NEVER A RATE, RANK OR PERCENTILE (AC 16). Reaction volume depends on how
       often the sampler surfaced your look, so these are truthful about you
       and meaningless between people. */
    { label: 'Reactions received', n: r.reactionsReceived },
    { label: 'People who reacted', n: r.distinctReactors },
  ];

  return all
    .filter((s) => s.on !== false)
    .filter((s) => opts.keepZeros || s.n > 0)
    .map((s) => ({ label: s.label, value: String(s.n), zero: s.n === 0 }));
}

/**
 * The label/value ROW list — zeros suppressed per `SUPPRESS_ZERO_STATS`.
 * Delegates to `statCells` so there is one list of stats and one order, not
 * two that can drift.
 */
export function statRows(r: YouRollup, showStreak: boolean): StatRow[] {
  return statCells(r, showStreak, { keepZeros: !SUPPRESS_ZERO_STATS }).map(({ label, value }) => ({
    label,
    value,
  }));
}

/** Pre-empts the reading of the reaction numbers as a ranking. Shown only
 *  once there is a reaction figure to misread. */
export const REACTIONS_CAPTION =
  'Reactions arrive when the magazine surfaces a look. It isn’t a score.';

export const showReactionsCaption = (r: YouRollup): boolean => r.reactionsReceived > 0;

/** The one true day-one number, and its honest second clause. */
export function piecesLine(r: YouRollup): string {
  if (r.piecesOwned === 0) return 'Nothing in your wardrobe yet.';
  const owned = `You own ${r.piecesOwned} ${r.piecesOwned === 1 ? 'piece' : 'pieces'}.`;
  return r.looks === 0 ? `${owned} Nothing worn yet.` : owned;
}

/**
 * "Find something to go with the rest →" needs a rest to go with. With an
 * empty wardrobe it was pointing at the remainder of nothing, which is the
 * absence-naming this screen's whole principle rules out.
 */
export const showWardrobeRoute = (r: YouRollup): boolean => r.piecesOwned > 0;

/* ══════════════════════ §5.2 · your posts ══════════════════════ */

/** A trend line through two points is a decoration. */
export const TREND_MIN_SETTLED = 5;

export const showTrend = (r: YouRollup): boolean => r.looksSettled >= TREND_MIN_SETTLED;
export const showAllPostsLink = (r: YouRollup): boolean => r.looks > 1;

/* ══════════════════════ §7 · tips are a POOL, not a trio ══════════════════════ */

/**
 * THE TIPS ARE THE EXPENSIVE ITEM. The handover is blunt about it: the summary
 * sentence is cheap, the tips are not, price before promising. The screen used
 * to render three as a fixed trio; they are a pool with entry thresholds, and
 * the section renders only what qualifies.
 *
 * `role` is a ROLE, NOT A SLOT. Nothing reserves space for a role with no
 * qualifying tip, and one tip is a valid section.
 *
 * ⚠ THE THRESHOLDS ARE ESTIMATES, NOT MEASURED (Katya q4). Treat them as
 * placeholders to tune against real distributions, not as spec. `eye` is the
 * unpriced one: your vote history scored against cohort behaviour on close
 * calls only, which is a cohort query and must never run in a request.
 */
export const TIPS = [
  {
    key: 'wardrobe',
    role: 'Try this' as const,
    title: 'Six pieces are doing all the work',
    /** Cheap — counting your own data. Lands first, almost always. */
    qualifies: (r: YouRollup) => r.looks >= 10,
  },
  {
    key: 'loudPiece',
    role: 'Strength' as const,
    title: 'You’re better with one loud piece',
    /** Moderate — needs settled results. */
    qualifies: (r: YouRollup) => r.looksSettled >= 10,
  },
  {
    key: 'eye',
    role: 'Weakness' as const,
    title: 'You under-read brave looks',
    /** Expensive — the unpriced item. */
    qualifies: (r: YouRollup) => r.closeCallsJudged >= 20,
  },
] as const;

export type TipKey = (typeof TIPS)[number]['key'];
export type TipRole = (typeof TIPS)[number]['role'];

/**
 * ORDER BY AVAILABILITY, NOT BY LABEL — the cheap wardrobe tip lands first,
 * which is the order TIPS is written in.
 *
 * NEVER A LONE WEAKNESS. A single negative tip with no counterweight is the
 * whole section reading as criticism, so if the eye tip is the only qualifier
 * it is HELD until a second one qualifies. It is not dropped: it comes back
 * the moment there is something beside it.
 */
export function qualifyingTips(r: YouRollup): TipKey[] {
  const passing = TIPS.filter((t) => t.qualifies(r));
  const negatives = passing.filter((t) => t.role === 'Weakness');
  if (passing.length === negatives.length) return [];
  return passing.map((t) => t.key);
}

/* ══════════════════════ §6 · your words ══════════════════════ */

/** Five. The same cap the tag input has per look, which is not a coincidence:
 *  a self-portrait in more than five words is a list. */
export const TOP_TAGS = 5;

/**
 * Most-used first, ties broken by first use — so a tag you have leaned on for
 * weeks outranks one you used twice yesterday. Counts, not rates: this is a
 * fact about you and is never compared to anyone.
 */
export function topTags(history: readonly string[], limit = TOP_TAGS): string[] {
  const counts = new Map<string, number>();
  history.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/* ══════════════════════ §6 · what reactions may never do here ══════════════════════ */

/** None of the six milestones are reaction-shaped, and none become so
 *  (AC 17). Mirrors REACTIONS_FEED_MILESTONES in domain/reactions.ts. */
export const MILESTONES_FROM_REACTIONS = false as const;

/** Comparisons against other people, in any form. Counts about your own work
 *  are fine; a rank, rate or percentile never is (AC 16). */
export const REACTION_RANKS_ON_YOU = false as const;

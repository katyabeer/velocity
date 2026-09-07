/**
 * The magazine — the only shop, and the appetite engine.
 *
 * THREE CONTENT TYPES ONLY for MVP (locked decision 8, was five):
 *   H — house-made look
 *   U — user look
 *   S — spread (two looks; you get the room's split immediately)
 *
 * ══ THE RULE MOST LIKELY TO BE BROKEN BY A WELL-MEANING FUTURE CHANGE ══
 *
 * SAMPLE, DON'T SORT. Draw at random from a weighted pool. NEVER weight by
 * popularity, reactions, token counts or placing. This is the single change
 * that would quietly ruin the product by converging every wardrobe, and it is
 * the most tempting "improvement" anyone will later propose. It is written down
 * here and in locked decision 12 for exactly that reason.
 *
 * If you find yourself adding `.sort((a, b) => b.reactions - a.reactions)`
 * anywhere near this file, stop.
 */

import { categoryOf, type Category } from './garments';
import type { LookKind } from './looks';

export const CADENCE = ['H', 'U', 'S', 'U', 'H', 'U', 'S', 'U'] as const;
export type CardKind = (typeof CADENCE)[number];

/** Looks stream endlessly; spreads are capped because they are scored, and
 *  uncapped scored content is grindable. */
export const SPREADS_PER_DAY = 6;

/** Five fixed positive words. Per R-F4 they NEVER feed the ranking — they are
 *  for the maker. Jack has flagged REACT as the cheapest mechanic to cut, so
 *  test it rather than defend it. */
export const REACTIONS = ['Bold', 'Clean', 'Sharp', 'Brave', 'Fire'] as const;
export type Reaction = (typeof REACTIONS)[number];

/** Reactions are on LOOKS ONLY, never on individual garments. Reversed and not
 *  to be re-proposed. */
export const REACTIONS_ON_GARMENTS = false as const;

/** No comments anywhere (locked decision 6). The room votes; that is its entire
 *  vocabulary. There is nowhere to type, by design. */
export const COMMENTS_ENABLED = false as const;

export const kindAt = (index: number): CardKind => CADENCE[index % CADENCE.length]!;

/**
 * Eligible pool for the feed: settled entries · free posts · house editorial.
 * NEVER a live entry — otherwise you are reading tonight's rivals, and the
 * whole point of the 20:00 close is that you cannot.
 */
export type FeedEligibility = 'settled-entry' | 'free-post' | 'house-editorial';
export const FEED_ELIGIBLE: readonly FeedEligibility[] = [
  'settled-entry',
  'free-post',
  'house-editorial',
];

export type Sampleable<T> = { item: T; weight: number };

/**
 * Weighted random sample without replacement.
 *
 * `weight` is allowed to encode recency, house/user mix, or tag balance — it is
 * NOT allowed to encode popularity. See the banner at the top of this file.
 *
 * `rng` is injected so the tests are deterministic.
 */
export function sample<T>(pool: readonly Sampleable<T>[], n: number, rng: () => number): T[] {
  const remaining = pool.map((p) => ({ ...p }));
  const out: T[] = [];
  while (out.length < n && remaining.length > 0) {
    const total = remaining.reduce((acc, p) => acc + Math.max(0, p.weight), 0);
    if (total <= 0) break;
    let r = rng() * total;
    let idx = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      r -= Math.max(0, remaining[i]!.weight);
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    out.push(remaining[idx]!.item);
    remaining.splice(idx, 1);
  }
  return out;
}

/**
 * The room read-out reports MOVEMENT, NEVER LEVEL. Telling people what is
 * already widely held just accelerates it.
 *
 * So: "+38%" is publishable. "held by 61% of the room" is not, as a feed
 * read-out. (The piece close-up shows a hold figure for one specific garment
 * you are considering, which is a different act — that is deliberate.)
 */
export type Mover = { name: string; direction: 1 | -1; change: string };

/**
 * The spread is where free voting went. Not a separate destination — the feed
 * asks you to call one every few pages, hands you the split and the reason
 * immediately, and scores your eye without settling anything.
 *
 * A spread's split is a STORED, SETTLED figure. Jack's open question 5:
 * per-look settled splits must be stored, and CANNOT BE BACKFILLED. If they are
 * not being written now, the spreads and the eye score have no data later.
 *
 * Until that exists, `shareForTierGap` stands in for it: real Day 1 photos
 * carry a judging `tier` (strong/mid/weak — see data/looks.ts), so a
 * spread's split can at least track the pair's tier gap instead of being a
 * flat number unrelated to which two looks are shown.
 */
export type SpreadSplit = { share: number };
export type Tier = 'strong' | 'mid' | 'weak';

const TIER_RANK: Record<Tier, number> = { weak: 0, mid: 1, strong: 2 };

/** Bigger tier gap between the pair, more lopsided the revealed split. */
export function shareForTierGap(a: Tier, b: Tier): number {
  const gap = Math.abs(TIER_RANK[a] - TIER_RANK[b]);
  return gap === 2 ? 74 : gap === 1 ? 61 : 52;
}

export function splitVerdict(share: number): string {
  if (share >= 65) return 'Comfortable. Everyone saw that one coming.';
  if (share >= 45) return 'Split down the middle. Those are the ones worth having.';
  return 'You went against the room. Not necessarily wrong.';
}

/* ════════════════════════ THE FILTER RAIL ════════════════════════ */

/**
 * ══ THE ONE INVARIANT EVERYTHING BELOW SITS INSIDE ══
 *
 *   A FILTER NARROWS THE CANDIDATE SET. The sampler still samples within it.
 *   A FILTER MUST NEVER BECOME AN ORDERING.
 *
 * Four of the five chips obey this trivially, because they narrow by KIND —
 * a property of the look, not of how the room reacted to it. `Trending` is a
 * deliberate, guarded exception and the only one; read TRENDING below in full
 * before touching it.
 *
 * IT IS FUNCTIONAL NOW (4 Sep). It was visually live and read by nothing —
 * `FILTER_RAIL_IS_FUNCTIONAL = false` was the flag saying so — and the old
 * rail's chips were `Ours` / `From the room` / four occasion words. The
 * occasion words could not work at all: occasion stopped aggregating when
 * Create's tags went free text (domain/tags.ts), so `Wedding` was a chip over
 * a field that no longer exists.
 */
export const MAGAZINE_FILTERS = [
  'All',
  'Editorial',
  'Challenges',
  'Free posts',
  'Trending',
] as const;
export type MagazineFilter = (typeof MAGAZINE_FILTERS)[number];

/**
 * ⚠ VOCABULARY, AND IT IS A REAL PROBLEM (brief §3, open q2). The docs say
 * BRIEF and JOB, this rail says CHALLENGES, and reactions-logic.md says
 * *challenge submission* — three words for one object across four documents.
 * The rail argues for "challenge" because that is what the chip has to be
 * called. Cheap to sweep now, expensive once the demo script is rewritten.
 */
export const VOCABULARY_UNSWEPT = true as const;

/** What a filterable card carries. Deliberately the smallest shape the rules
 *  need, so the domain never sees a photograph or a handle. */
export type Filterable = {
  kind: LookKind;
  pieces: readonly string[];
  /** The viewer's own look. In the pool, never reactable, never Trending. */
  mine?: boolean;
};

/**
 * Does this look belong under this chip?
 *
 * NEVER A LIVE ENTRY, UNDER ANY CHIP. Pre-existing rule, and `Challenges` is
 * the chip most likely to be built as "all entries" — so the guard is first,
 * before the switch, where it cannot be forgotten in one branch.
 *
 * `Trending` is NOT decided here. Membership is a separate computation over
 * reaction velocity (see `trendingSet`), and mixing it into a kind test is how
 * a band quietly becomes an ordering.
 */
export function filterAccepts(filter: MagazineFilter, look: Filterable): boolean {
  if (look.kind === 'live_entry') return false;
  switch (filter) {
    case 'All':
      return true;
    case 'Editorial':
      return look.kind === 'editorial';
    case 'Challenges':
      return look.kind === 'settled_entry';
    case 'Free posts':
      return look.kind === 'freestyle';
    case 'Trending':
      /* Scope: user looks only, and never your own. An editorial is already
         the house's curated pick — a trending editorial is a category error. */
      return look.kind !== 'editorial' && !look.mine;
  }
}

/**
 * THE CADENCE IS FOR `All` AND NOTHING ELSE.
 *
 * `H U S U H U S U` interleaves three content types. Under `Challenges`,
 * `Free posts` or `Trending` the pool is one type, so a ratio is meaningless —
 * it degrades to plain sampling. Under `Editorial` there ARE two types
 * (house looks and spreads), but they are sampled rather than rationed: a
 * fixed string is an ordering rule, and the point of this file is that the
 * feed has none.
 */
export const usesCadence = (filter: MagazineFilter): boolean => filter === 'All';

/** Spreads are house-authored, so they fold into Editorial rather than taking
 *  a sixth chip (brief open q1, recommendation taken). A spread is a LAYOUT of
 *  looks, not a separate kind of authorship. */
export const spreadsUnder = (filter: MagazineFilter): boolean =>
  filter === 'All' || filter === 'Editorial';

/* ════════════════════════ THE GARMENT AXIS ════════════════════════ */

/**
 * MULTI-SELECT, OR — selections WIDEN the pool. `AND` starves it at launch
 * scale: at ~125 DAU, "outerwear AND shoes" is reliably a handful of looks and
 * "wool coat AND gold sandal" reliably zero. An empty screen is a worse answer
 * than a broad one.
 *
 * Across axes it is AND: the rail chip narrows by kind, then this narrows by
 * contents. Two different questions, so they compose.
 *
 * ⚠ CATEGORY, NOT SLOT. The brief says "from the existing SLOTS list", but
 * SLOTS is the five boxes of the RENDER TEMPLATE (Outer · Top · Bottom · Shoes
 * · Extra) — a layout concern. `CATEGORIES` is the shopper's axis, it is what
 * the builder already means by "by garment type and nothing else", and it
 * splits Dresses out from Tops, which is the distinction anyone browsing for
 * clothes actually wants. Six values, which is also closer to the brief's own
 * "~8 values" than five is.
 */
export const matchesCategories = (look: Filterable, selected: readonly Category[]): boolean =>
  selected.length === 0 || look.pieces.some((p) => selected.includes(categoryOf(p)));

/**
 * GARMENT NAMES ONLY. The catalogue is a closed vocabulary (`wool coat`,
 * `grey trouser`), which is what makes it a usable index.
 *
 * NOT TAGS. Free text does not aggregate — `wedding`, `weddingvibes` and
 * `bigday` are three strings — so tags make a poor index and are excluded
 * (create-flow-brief §5).
 *
 * NOT PEOPLE, NOT HANDLES. There is no social graph in this product, and
 * searching for a person is the one thing that would start building one.
 */
export function matchesQuery(look: Filterable, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return look.pieces.some((p) => p.toLowerCase().includes(q));
}

/** The whole gate: rail AND garments AND text. */
export const passesFilters = (
  look: Filterable,
  filter: MagazineFilter,
  categories: readonly Category[],
  query: string,
): boolean =>
  filterAccepts(filter, look) && matchesCategories(look, categories) && matchesQuery(look, query);

/**
 * THIN RESULTS ARE REPORTED HONESTLY, never padded and never silently
 * relaxed. At launch scale "Free posts + gold sandal" may truthfully be two
 * looks; the screen says so and offers the widening move.
 */
export const THIN_RESULT_MAX = 4;

export function thinResultNote(count: number, filter: MagazineFilter): string | null {
  if (count === 0) return 'Nothing matches that yet. Try clearing a filter.';
  if (count > THIN_RESULT_MAX) return null;
  /* Agreement matters here because the singular case is the COMMON one at
     launch scale — "1 look match that" was the first thing on screen. */
  const subject = `${count} ${count === 1 ? 'look' : 'looks'}`;
  const verb = count === 1 ? 'matches' : 'match';
  return filter === 'All'
    ? `${subject} ${verb} that. Try fewer pieces.`
    : `${subject} ${verb} that. Try clearing the ${filter} filter.`;
}

/* ════════════════════════ TRENDING ════════════════════════ */

/**
 * ══ THIS REVERSES THE ONE RULE AT THE TOP OF THIS FILE. READ ALL OF IT. ══
 *
 * Sample-don't-sort is the change the handover calls "the single change that
 * would quietly ruin the product". Trending lets reaction velocity decide SET
 * MEMBERSHIP — nothing else. Seven guardrails make that survivable, ALL SEVEN
 * ARE LOAD-BEARING, and each one individually will look droppable during
 * implementation because each one individually makes Trending less exciting.
 *
 *   1 · BAND, NOT A RANK. Velocity decides membership of an eligible set and
 *       nothing more. There is no position inside it.
 *   2 · SAMPLE WITHIN THE SET. The main feed's sampler runs over the eligible
 *       set. No ordering by velocity at any point.
 *   3 · REACTIONS ONLY, NEVER TAKES. Takes are the convergence mechanism
 *       itself; feeding them back creates a direct loop where people take from
 *       what has been taken from. Reactions are one step removed from the
 *       wardrobe, which is the ONLY reason this exception is survivable.
 *   4 · ONE APPEARANCE, EVER. A look enters Trending once and is then
 *       permanently ineligible. This is what stops a persistent winners' pool,
 *       and the brief names it the guardrail most likely to be argued away.
 *   5 · PER-VIEWER SEED. Two people must not get the same set in the same
 *       order.
 *   6 · A POOL FLOOR, AND THE CHIP HIDES BELOW IT. Under 12 eligible looks the
 *       chip is absent: a Trending tab showing four looks is MAXIMUM
 *       convergence pressure, because everyone sees the identical four.
 *   7 · NO NUMBERS, NO HEAT. No counts, no velocity, no flames, no position.
 *       The moment it shows a quantity it is a leaderboard.
 *
 * ⚠ OFF BY DEFAULT, AND EXPECTED TO BE OFF AT LAUNCH. At the ~125 DAU floor
 * the eligible set will frequently be under 12 anyway. `TRENDING_ENABLED` is
 * the flag; removing it removes the chip with no other behavioural change.
 *
 * ⚠ ITS KILL CRITERION HAS NO OWNER (brief §7 and open q4). The reversal is
 * only defensible because it is falsifiable: measure take-concentration (top-20
 * share of all takes) weekly, baseline four weeks with Trending OFF, and if it
 * rises more than 10 points within six weeks of going live, Trending is
 * REMOVED — not tuned. Nobody owns that report, which makes the criterion
 * decorative. Say who owns it before this ships.
 */
export const TRENDING_ENABLED = false;

/** Tunable (brief open q3): reasoned starting points, not measured. */
export const TRENDING_PERCENTILE = 70;
export const TRENDING_POOL_FLOOR = 12;
export const TRENDING_WINDOW_HOURS = 24;

/** NOT tunable. These two are what make the reversal safe at all. */
export const TRENDING_REACTIONS_ONLY = true as const;
export const TRENDING_ONE_APPEARANCE = true as const;

/**
 * Reaction velocity over the rolling window, per look. Reactions ONLY — the
 * type has no field for takes, deliberately, so guardrail 3 holds by
 * construction rather than by care.
 */
export type Velocity = { id: string; reactionsInWindow: number };

/**
 * The eligible SET — everything strictly above the percentile, minus anything
 * that has already had its turn.
 *
 * Returns a Set, not an array, because a caller cannot accidentally treat a
 * Set as an ordering. That is the whole point of guardrail 1 and it is worth a
 * slightly awkward return type.
 */
export function trendingSet(
  velocities: readonly Velocity[],
  alreadyAppeared: ReadonlySet<string>,
  percentile = TRENDING_PERCENTILE,
): ReadonlySet<string> {
  const fresh = velocities.filter((v) => !alreadyAppeared.has(v.id));
  if (fresh.length === 0) return new Set();

  const sorted = [...fresh].map((v) => v.reactionsInWindow).sort((a, b) => a - b);
  const cut = sorted[Math.min(sorted.length - 1, Math.floor((percentile / 100) * sorted.length))]!;

  return new Set(fresh.filter((v) => v.reactionsInWindow >= cut && cut > 0).map((v) => v.id));
}

/** Guardrail 6. The chip is ABSENT below the floor, not empty and not
 *  disabled — an empty Trending tab is an invitation to keep checking. */
export const trendingVisible = (eligibleCount: number): boolean =>
  TRENDING_ENABLED && eligibleCount >= TRENDING_POOL_FLOOR;

/** Guardrail 7, as an assertion the tests can read. Nothing in the Trending
 *  UI may render a quantity. */
export const TRENDING_SHOWS_NO_NUMBERS = true as const;


/* ════════════════════════ BUILDING THE FEED ════════════════════════ */

/**
 * A position in the stream. `look` carries an index into the filtered pool;
 * `spread` carries nothing, because a spread's content is chosen by the card
 * itself.
 */
export type FeedSlot = { kind: 'H' | 'U'; poolIndex: number } | { kind: 'S' };

/**
 * A deterministic RNG from a seed. Seeded so the SET is stable across renders
 * — the feed is virtualised and cards unmount and remount — while a NEW seed
 * on every filter change gives a different order for the same set.
 *
 * mulberry32. Not for anything cryptographic; it just has to be cheap,
 * repeatable and better distributed than a bare `sin` hash.
 */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A shuffled permutation of indices, drawn with the shared sampler so there
 *  is exactly one place in the app that decides feed order. */
const shuffled = (indices: readonly number[], rng: () => number): number[] =>
  sample(indices.map((i) => ({ item: i, weight: 1 })), indices.length, rng);

/**
 * The indices of every look that passes the current filters, in a sampled
 * order. This is THE set — the screen's counts and its thin-result note both
 * read it, so what you see and what you are told can never disagree.
 */
export function filteredPool(
  looks: readonly Filterable[],
  filter: MagazineFilter,
  categories: readonly Category[],
  query: string,
  seed: number,
): number[] {
  const passing = looks
    .map((look, i) => ({ look, i }))
    .filter(({ look }) => passesFilters(look, filter, categories, query))
    .map(({ i }) => i);
  return shuffled(passing, seededRng(seed));
}

/**
 * Lay the stream out.
 *
 * UNDER `All` THE CADENCE ASSIGNS POSITIONS, and H and U draw from separate
 * sub-pools by kind — which is what makes the cadence mean anything. It used
 * to be decoration: every card took `FEED_LOOKS[index % length]` whatever the
 * cadence said, so an `H` slot happily showed a user look.
 *
 * UNDER EVERY OTHER CHIP there is no cadence. Cards come off the single pool
 * in its sampled order, and spreads are drawn from it too under `Editorial`
 * (they are house-authored, so they fold in there — brief §3) rather than
 * being rationed to fixed positions.
 */
export function feedSlots(
  looks: readonly Filterable[],
  pool: readonly number[],
  filter: MagazineFilter,
  count: number,
): FeedSlot[] {
  const out: FeedSlot[] = [];

  if (usesCadence(filter)) {
    const house = pool.filter((i) => looks[i]!.kind === 'editorial');
    const user = pool.filter((i) => looks[i]!.kind !== 'editorial');
    let h = 0;
    let u = 0;
    for (let n = 0; n < count; n++) {
      const k = kindAt(n);
      if (k === 'S') {
        out.push({ kind: 'S' });
      } else if (k === 'H' && house.length) {
        out.push({ kind: 'H', poolIndex: house[h++ % house.length]! });
      } else if (user.length) {
        out.push({ kind: 'U', poolIndex: user[u++ % user.length]! });
      } else if (house.length) {
        /* A pool with no user looks still has to fill the U slots — better a
           house look than a gap. */
        out.push({ kind: 'H', poolIndex: house[h++ % house.length]! });
      }
    }
    return out;
  }

  if (pool.length === 0) return out;

  /* ══ A FILTERED STREAM IS FINITE ══
     Under `All` the feed is endless — it is the appetite engine and it cycles
     the pool. Under a filter it does NOT: each match appears once and then the
     stream ends.

     Cycling would show the same three looks over and over to fill an infinite
     scroll, which is padding the pool — the thing §5 rules out. The screen
     already reports the true count; repeating the contents to fill the screen
     would contradict it. `feedIsFinite` is what the list's footer reads to say
     "that's all of them" instead of "keep scrolling". */
  const spreads = spreadsUnder(filter);
  let taken = 0;
  for (let n = 0; n < count && taken < pool.length; n++) {
    if (spreads && n > 0 && n % SPREAD_EVERY === 0) {
      out.push({ kind: 'S' });
      continue;
    }
    const i = pool[taken++]!;
    out.push({ kind: looks[i]!.kind === 'editorial' ? 'H' : 'U', poolIndex: i });
  }
  return out;
}

/** Under `All` with nothing selected the feed streams forever; under anything
 *  narrower it ends when the matches run out. */
export const feedIsFinite = (
  filter: MagazineFilter,
  categories: readonly Category[],
  query: string,
): boolean => filter !== 'All' || categories.length > 0 || query.trim().length > 0;

/** How far apart spreads sit when there is no cadence. Spacing, not a ratio. */
export const SPREAD_EVERY = 5;

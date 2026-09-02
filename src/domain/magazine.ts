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

/**
 * KNOWN INCOMPLETE, carried over from the prototype: the filter rail is
 * visually live but does not change the content pool. Weighting rules are
 * unimplemented. Do not present it as working.
 */
export const FILTER_RAIL_IS_FUNCTIONAL = false as const;
export const FILTERS = [
  'All',
  'Ours',
  'From the room',
  'Wedding',
  'Airport',
  'Night out',
  'Work',
] as const;

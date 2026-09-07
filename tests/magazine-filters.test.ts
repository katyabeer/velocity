/**
 * THE MAGAZINE'S FILTERS AND SEARCH. Filters brief §8, acceptance criteria
 * 1–16.
 *
 * ══ WHY THIS FILE IS WRITTEN THE WAY IT IS ══
 *
 * The rail sits on top of the one rule the handover calls "the single change
 * that would quietly ruin the product": SAMPLE, DON'T SORT. A filter narrows
 * the candidate set; the sampler still samples within it; a filter must never
 * become an ordering.
 *
 * `Trending` reverses that rule under seven guardrails. Every one of them is
 * asserted below, because the brief is explicit that each will look droppable
 * during implementation — each one individually makes Trending less exciting.
 * If any single test in the Trending block goes red, the reversal is no longer
 * safe and the FEATURE comes out, not the test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  MAGAZINE_FILTERS,
  SPREAD_EVERY,
  TRENDING_ENABLED,
  TRENDING_ONE_APPEARANCE,
  TRENDING_POOL_FLOOR,
  TRENDING_REACTIONS_ONLY,
  TRENDING_SHOWS_NO_NUMBERS,
  feedIsFinite,
  feedSlots,
  filterAccepts,
  filteredPool,
  matchesCategories,
  matchesQuery,
  seededRng,
  thinResultNote,
  trendingSet,
  trendingVisible,
  usesCadence,
  type Filterable,
  type MagazineFilter,
} from '../src/domain/magazine.ts';

/* Pieces chosen so each look lands in a known category — see categoryOf in
   domain/garments.ts. */
const LOOKS: Filterable[] = [
  { kind: 'editorial', pieces: ['funnel neck wool coat'] },
  { kind: 'editorial', pieces: ['crisp poplin shirt'] },
  { kind: 'settled_entry', pieces: ['pleated wool trouser'] },
  { kind: 'settled_entry', pieces: ['clean riding boot'] },
  { kind: 'freestyle', pieces: ['jewelled evening clutch'] },
  { kind: 'freestyle', pieces: ['funnel neck wool coat', 'clean riding boot'] },
  { kind: 'live_entry', pieces: ['funnel neck wool coat'] },
  { kind: 'settled_entry', pieces: ['crisp poplin shirt'], mine: true },
];

/* ═══════════════════ AC 1–3 · the chips narrow the pool ═══════════════════ */

test('AC 1 · every chip changes the visible pool', () => {
  /* The bug this replaces: `filter` was stored and read by nothing, so all
     five chips returned an identical feed. */
  const sizes = MAGAZINE_FILTERS.map(
    (f) => filteredPool(LOOKS, f, [], '', 1).length,
  );
  assert.ok(new Set(sizes).size > 1, 'at least some chips must differ');
  assert.equal(sizes[0], LOOKS.length - 1, 'All is everything except the live entry');
});

test('AC 2 · each chip returns only its own kind', () => {
  const kindsUnder = (f: MagazineFilter) =>
    new Set(filteredPool(LOOKS, f, [], '', 1).map((i) => LOOKS[i]!.kind));

  assert.deepEqual([...kindsUnder('Editorial')], ['editorial']);
  assert.deepEqual([...kindsUnder('Challenges')], ['settled_entry']);
  assert.deepEqual([...kindsUnder('Free posts')], ['freestyle']);
});

test('AC 3 · NO chip ever returns an unsettled brief entry', () => {
  /* `Challenges` is the chip most likely to be built as "all entries", which
     is why the live-entry guard sits before the switch rather than inside one
     of its branches. */
  for (const f of MAGAZINE_FILTERS) {
    const kinds = filteredPool(LOOKS, f, [], '', 1).map((i) => LOOKS[i]!.kind);
    assert.equal(kinds.includes('live_entry'), false, `leaked under ${f}`);
  }
  assert.equal(filterAccepts('All', { kind: 'live_entry', pieces: [] }), false);
});

/* ═══════════════════ AC 4–5 · cadence, and order ═══════════════════ */

test('AC 4 · the H U S U cadence applies under All and under no other chip', () => {
  assert.equal(usesCadence('All'), true);
  for (const f of MAGAZINE_FILTERS.filter((x) => x !== 'All')) {
    assert.equal(usesCadence(f), false, `${f} must not ration content types`);
  }

  /* Under All the third slot is a spread, because the cadence says so. */
  const all = feedSlots(LOOKS, filteredPool(LOOKS, 'All', [], '', 1), 'All', 8);
  assert.equal(all[2]!.kind, 'S');

  /* Under a single-type chip there are no spreads at all. */
  const free = feedSlots(LOOKS, filteredPool(LOOKS, 'Free posts', [], '', 1), 'Free posts', 12);
  assert.equal(free.some((sl) => sl.kind === 'S'), false);
});

test('AC 4 · under All, an H slot only ever holds an editorial', () => {
  /* It used to be decoration: every card took `FEED_LOOKS[index % length]`
     whatever the cadence said, so an H slot happily showed a user look. */
  const slots = feedSlots(LOOKS, filteredPool(LOOKS, 'All', [], '', 7), 'All', 16);
  slots.forEach((sl) => {
    if (sl.kind === 'H') assert.equal(LOOKS[sl.poolIndex]!.kind, 'editorial');
    if (sl.kind === 'U') assert.notEqual(LOOKS[sl.poolIndex]!.kind, 'editorial');
  });
});

test('AC 5 · same chip, same SET — different ORDER', () => {
  /* This is the whole invariant in one assertion: a filter narrows, it does
     not order. Two seeds must agree on membership and disagree on sequence. */
  const a = filteredPool(LOOKS, 'All', [], '', 1);
  const b = filteredPool(LOOKS, 'All', [], '', 999);
  assert.deepEqual([...a].sort(), [...b].sort(), 'the set must be identical');
  assert.notDeepEqual(a, b, 'the order must not be');
});

test('spreads sit at a spacing under Editorial, not at a ratio', () => {
  /* Spreads fold into Editorial because both are house-authored (brief §3,
     open q1). SPREAD_EVERY is spacing so two never land adjacent — it is not
     a ratio of content types, which is what the cadence was.

     A bigger editorial pool than LOOKS has, on purpose: a FILTERED stream is
     finite (each match once), so with two editorials it ends at card two and
     never reaches a spread position. That is correct behaviour and it is
     asserted separately below — it just cannot exercise the spacing. */
  const many: Filterable[] = Array.from({ length: 14 }, (_, i) => ({
    kind: 'editorial',
    pieces: [i % 2 ? 'funnel neck wool coat' : 'crisp poplin shirt'],
  }));
  const pool = filteredPool(many, 'Editorial', [], '', 1);
  const slots = feedSlots(many, pool, 'Editorial', SPREAD_EVERY * 3);
  const spreads = slots.filter((sl) => sl.kind === 'S').length;
  assert.ok(spreads >= 1, 'Editorial must be able to show a spread');
  slots.forEach((sl, i) => {
    if (sl.kind !== 'S') return;
    assert.notEqual(slots[i + 1]?.kind, 'S', 'two spreads must never be adjacent');
  });
});

/* ═══════════════════ AC 6–11, 16 · Trending's guardrails ═══════════════════ */

const vel = (n: number, count: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `l${i}`, reactionsInWindow: count + i }));

test('AC 6 · the chip is ABSENT below the pool floor', () => {
  /* A Trending tab showing four looks is MAXIMUM convergence pressure —
     everyone sees the identical four. */
  assert.equal(trendingVisible(TRENDING_POOL_FLOOR - 1), false);
  assert.equal(TRENDING_POOL_FLOOR, 12);
});

test('AC 11 · the flag alone removes the chip', () => {
  /* Off by default, and expected to be off at launch: at the ~125 DAU floor
     the eligible set is frequently under 12 anyway. */
  assert.equal(TRENDING_ENABLED, false);
  assert.equal(
    trendingVisible(TRENDING_POOL_FLOOR + 100),
    false,
    'a huge eligible set must still not show the chip while the flag is off',
  );
});

test('AC 7 · a look never appears in Trending twice, across any time span', () => {
  /* The guardrail the brief names as most likely to be argued away. It is
     what stops a persistent winners pool forming. */
  assert.equal(TRENDING_ONE_APPEARANCE, true);
  const v = vel(10, 5);
  const first = trendingSet(v, new Set());
  assert.ok(first.size > 0);
  const second = trendingSet(v, first);
  [...first].forEach((id) => assert.equal(second.has(id), false, `${id} came back`));
});

test('AC 8 · velocity is REACTIONS ONLY — the type has no field for takes', () => {
  /* Takes are the convergence mechanism itself; feeding them back creates a
     direct loop where people take from what has been taken from. Asserted
     against the source, because the failure is an added field rather than a
     wrong value. */
  assert.equal(TRENDING_REACTIONS_ONLY, true);
  const src = readFileSync(new URL('../src/domain/magazine.ts', import.meta.url), 'utf8');
  const type = src.slice(src.indexOf('export type Velocity'), src.indexOf('export function trendingSet'));
  assert.equal(/take|pinch|held|token/i.test(type), false, 'Velocity must not admit takes');
});

test('AC 9 · Trending is a SET, so there is no position to render', () => {
  /* Guardrail 1 by construction: a caller cannot mistake a Set for an
     ordering, which is why the return type is awkward on purpose. */
  assert.equal(TRENDING_SHOWS_NO_NUMBERS, true);
  const out = trendingSet(vel(10, 3), new Set());
  assert.ok(out instanceof Set);
  assert.equal(Array.isArray(out), false);
});

test('AC 10 · Trending contains no editorials and none of your own looks', () => {
  assert.equal(filterAccepts('Trending', { kind: 'editorial', pieces: [] }), false);
  assert.equal(
    filterAccepts('Trending', { kind: 'settled_entry', pieces: [], mine: true }),
    false,
  );
  assert.equal(filterAccepts('Trending', { kind: 'settled_entry', pieces: [] }), true);
});

test('nothing with zero reactions is ever eligible', () => {
  /* Otherwise at launch scale a percentile over a field of zeros makes
     everything "trending", which is the same as nothing trending. */
  assert.equal(trendingSet(vel(10, 0).map((v) => ({ ...v, reactionsInWindow: 0 })), new Set()).size, 0);
});

test('AC 16 · no code path orders the feed by reactions, takes, tokens or placing', () => {
  /* The invariant, asserted against the source of both the sampler and the
     store. `sort` on a reaction/take/token field anywhere near these is the
     regression. */
  for (const f of ['../src/domain/magazine.ts', '../src/state/magazine.ts'] as const) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    const code = src
      .split('\n')
      .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
      .join('\n');
    assert.equal(
      /sort\([^)]*(reaction|take|pinch|token|placing|band)/i.test(code),
      false,
      `${f} orders by popularity`,
    );
  }
});

/* ═══════════════════ AC 12–15 · the search drawer ═══════════════════ */

test('AC 12 · categories combine as OR; rail and categories combine as AND', () => {
  /* OR because AND starves the pool at launch scale. */
  const coats = filteredPool(LOOKS, 'All', ['Outerwear'], '', 1);
  const shoes = filteredPool(LOOKS, 'All', ['Shoes'], '', 1);
  const both = filteredPool(LOOKS, 'All', ['Outerwear', 'Shoes'], '', 1);
  assert.ok(both.length >= Math.max(coats.length, shoes.length), 'OR must widen');

  /* AND across axes: Free posts ∩ Outerwear is narrower than either. */
  const freeCoats = filteredPool(LOOKS, 'Free posts', ['Outerwear'], '', 1);
  const free = filteredPool(LOOKS, 'Free posts', [], '', 1);
  assert.ok(freeCoats.length <= free.length);
  freeCoats.forEach((i) => assert.equal(LOOKS[i]!.kind, 'freestyle'));
});

test('AC 13 · results are sampled, not ordered by relevance', () => {
  /* A search that ranks by match quality is an ordering by another name.
     Asserted across MANY seeds rather than two: the matching pool here is two
     looks, so any single pair of seeds agrees half the time — a two-seed test
     would pass or fail on a coin toss. */
  const seeds = [1, 7, 42, 99, 4242, 31337];
  const orders = seeds.map((sd) => filteredPool(LOOKS, 'All', [], 'coat', sd));

  orders.forEach((o) =>
    assert.deepEqual([...o].sort(), [...orders[0]!].sort(), 'the set must never change'),
  );
  assert.ok(
    new Set(orders.map((o) => o.join(','))).size > 1,
    'and the order must not be fixed',
  );
});

test('AC 14 · tag text and handles return nothing — they are not indexed', () => {
  const look: Filterable = { kind: 'freestyle', pieces: ['funnel neck wool coat'] };
  /* Tags do not aggregate (`wedding` / `weddingvibes` / `bigday`), so they
     make a poor index; handles are excluded because searching for a person is
     the one thing that would start building a social graph. */
  assert.equal(matchesQuery(look, 'weddingvibes'), false);
  assert.equal(matchesQuery(look, '@katya_b'), false);
  assert.equal(matchesQuery(look, 'wool'), true, 'garment names DO match');
  assert.equal(matchesQuery(look, ''), true, 'empty query matches everything');
});

test('AC 15 · a thin result reports its true size and offers the widening move', () => {
  /* Never silently relaxed to fill the screen. */
  assert.equal(thinResultNote(0, 'All'), 'Nothing matches that yet. Try clearing a filter.');
  assert.match(thinResultNote(2, 'Free posts')!, /2 looks/);
  assert.match(thinResultNote(2, 'Free posts')!, /clearing the Free posts filter/);
  /* Agreement: the singular is the COMMON case at launch scale, and "1 look
     match that" was live for a few minutes. */
  assert.equal(thinResultNote(1, 'All'), '1 look matches that. Try fewer pieces.');
  assert.match(thinResultNote(3, 'All')!, /3 looks match that/);
  assert.equal(thinResultNote(30, 'All'), null, 'a healthy pool says nothing');
});

test('an empty category selection matches everything', () => {
  assert.equal(matchesCategories({ kind: 'freestyle', pieces: ['x'] }, []), true);
});

/* ═══════════════════ the sampler's seed ═══════════════════ */

test('the seeded rng is deterministic and spread across [0,1)', () => {
  assert.deepEqual(
    Array.from({ length: 4 }, seededRng(42)),
    Array.from({ length: 4 }, seededRng(42)),
  );
  const xs = Array.from({ length: 200 }, seededRng(7));
  assert.ok(Math.min(...xs) >= 0 && Math.max(...xs) < 1);
  assert.ok(new Set(xs).size > 150, 'must not collapse onto a few values');
});

/* ═══════════════════ a filtered stream is finite ═══════════════════ */

test('a filtered stream shows each match ONCE and then stops', () => {
  /* Cycling the pool to fill an endless scroll is padding — §5 says show what
     there is and say how many, never pad. With three matches the stream is
     three cards, not thirty of the same three. */
  const pool = filteredPool(LOOKS, 'Challenges', [], '', 1);
  const slots = feedSlots(LOOKS, pool, 'Challenges', 40);
  const shown = slots.filter((sl) => sl.kind !== 'S').map((sl) => (sl as { poolIndex: number }).poolIndex);
  assert.equal(shown.length, pool.length, 'no more cards than matches');
  assert.equal(new Set(shown).size, shown.length, 'and no repeats');
});

test('`All` with nothing selected stays endless — it is the appetite engine', () => {
  assert.equal(feedIsFinite('All', [], ''), false);
  /* Anything narrower ends. */
  assert.equal(feedIsFinite('Challenges', [], ''), true);
  assert.equal(feedIsFinite('All', ['Shoes'], ''), true);
  assert.equal(feedIsFinite('All', [], 'coat'), true);
  assert.equal(feedIsFinite('All', [], '   '), false, 'whitespace is not a query');

  const pool = filteredPool(LOOKS, 'All', [], '', 1);
  const slots = feedSlots(LOOKS, pool, 'All', 40);
  assert.equal(slots.length, 40, 'All fills whatever it is asked for');
});

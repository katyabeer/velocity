/**
 * The four starter capsules.
 *
 * TWO PROPERTIES MUST HOLD, and they are what make the capsules free:
 *   1. every capsule covers all five slots — so no choice can lock a new player
 *      out of entering
 *   2. the capsules overlap — so all four draw from one shared pool and add no
 *      new assets
 *
 * If someone edits the piece lists, these tests are what catch a capsule that
 * has, say, no shoes.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SLOTS, slotOf } from '../src/domain/garments.ts';
import { CAPSULES, coversAllSlots, slotsCovered } from '../src/data/capsules.ts';
import { inventoryDayOne, inventoryDayTwo } from '../src/data/inventory.ts';
import { STARTER_CAPSULE_SIZE } from '../src/domain/economy.ts';

test('there are four capsules', () => {
  assert.equal(CAPSULES.length, 4);
});

test('EVERY capsule covers all five slots — no capsule can lock you out', () => {
  for (const c of CAPSULES) {
    assert.ok(
      coversAllSlots(c),
      `${c.name} misses ${SLOTS.filter((s) => !slotsCovered(c).includes(s)).join(', ')}`,
    );
  }
});

test('every capsule is the starter size', () => {
  for (const c of CAPSULES) {
    assert.equal(c.pieces.length, STARTER_CAPSULE_SIZE, `${c.name} is the wrong size`);
  }
});

test('the capsules deliberately overlap, so they cost no new assets', () => {
  const counts = new Map<string, number>();
  for (const c of CAPSULES) for (const p of c.pieces) counts.set(p, (counts.get(p) ?? 0) + 1);

  const shared = [...counts.entries()].filter(([, n]) => n > 1).map(([p]) => p);
  assert.ok(shared.length >= 3, `expected overlap, found ${shared.length} shared pieces`);
  // The three the handover names explicitly.
  for (const p of ['roll neck', 'wide leg', 'silk shirt']) {
    assert.ok(shared.includes(p), `${p} should appear in more than one capsule`);
  }

  const distinct = counts.size;
  const naive = CAPSULES.length * STARTER_CAPSULE_SIZE;
  assert.ok(distinct < naive, 'overlap should mean fewer distinct pieces than 4 × 8');
});

test('day one inventory is exactly the capsule you chose, nothing worn', () => {
  for (const c of CAPSULES) {
    const inv = inventoryDayOne(c.key);
    assert.equal(inv.length, c.pieces.length);
    assert.ok(inv.every((p) => p.worn === 0 && p.best === null));
    assert.ok(inv.every((p) => p.provenance === 'starter'));
  }
});

test('day two adds three pieces and wears one per slot', () => {
  const inv = inventoryDayTwo('quiet');
  assert.equal(inv.length, STARTER_CAPSULE_SIZE + 3);

  const arrivals = inv.filter((p) => p.provenance === 'taken');
  assert.equal(arrivals.length, 3);
  assert.ok(arrivals.every((p) => p.isNew));

  // Exactly one worn piece per slot present in the capsule.
  const wornSlots = inv.filter((p) => p.worn > 0).map((p) => slotOf(p.name));
  assert.equal(new Set(wornSlots).size, wornSlots.length, 'one worn piece per slot, no more');
});

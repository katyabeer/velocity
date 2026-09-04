/**
 * FREE-TEXT TAGS. Create brief §5, and acceptance criteria 14–18.
 *
 * Free text reverses D-brief invariant 8 ("no free text anywhere"), so these
 * tests are not only checking a text field — they are the fence around a
 * reversal. The two that matter most are the last two in the file: tags must
 * never become navigation, and they must never reach the feed sampler.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  BLOCKED,
  MAX_TAGS,
  OWN_HISTORY_ONLY,
  TAGS_EDITABLE_AFTER_PUBLISH,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
  chipLabel,
  commitAll,
  commitTag,
  countLabel,
  normalise,
  rejectionFor,
  rejectionMessage,
  removeTag,
} from '../src/domain/tags.ts';

/* ─── AC 14 · a 6th tag is refused, and the input reports "5 of 5" ─── */

test('the cap is five, and the sixth is refused rather than dropped', () => {
  const five = ['a1', 'b2', 'c3', 'd4', 'e5'];
  assert.equal(five.length, MAX_TAGS);
  const { tags, rejection } = commitTag(five, 'sixth');
  assert.deepEqual(tags, five, 'the list is unchanged');
  assert.equal(rejection?.reason, 'full');
});

test('the count reads "5 of 5" at the cap, and is present before it', () => {
  assert.equal(countLabel(MAX_TAGS), '5 of 5');
  assert.equal(countLabel(3), '3 of 5');
});

/* ─── AC 15 · #Wedding and wedding collapse to one tag ─── */

test('#Wedding and wedding are the same tag', () => {
  assert.equal(normalise('#Wedding'), 'wedding');
  assert.equal(normalise('wedding'), 'wedding');

  const first = commitTag([], '#Wedding');
  assert.deepEqual(first.tags, ['wedding']);
  const second = commitTag(first.tags, 'wedding');
  assert.equal(second.rejection?.reason, 'duplicate');
  assert.deepEqual(second.tags, ['wedding'], 'no second copy');
});

test('the hash is presentation only — it is never stored', () => {
  const { tags } = commitTag([], '#bigday');
  assert.deepEqual(tags, ['bigday']);
  assert.equal(chipLabel('bigday'), '#bigday', 'and it is put back for display');
});

test('everything in the strip list is stripped, whitespace included', () => {
  assert.equal(normalise('#@:/\\.,cold field'), 'coldfield');
});

/* ─── AC 16 · links are refused, with the tag named ─── */

for (const bad of ['http://x.co', 'www.zozo.jp', 'me@example.com', 'shop.com/x']) {
  test(`"${bad}" is refused outright`, () => {
    const r = rejectionFor(bad, []);
    assert.equal(r?.reason, 'link');
    assert.match(rejectionMessage(r!), /can’t go on/);
  });
}

test('a refusal always names the offending tag — nothing is silently dropped', () => {
  /* §5: "reject with the offending tag named, don't silently drop it". A tag
     that vanishes reads as a bug and gets retyped. */
  const cases = [
    rejectionFor('http://x.co', []),
    rejectionFor('a', []),
    rejectionFor('x'.repeat(TAG_MAX_LENGTH + 1), []),
    rejectionFor(BLOCKED[0]!, []),
    rejectionFor('wedding', ['wedding']),
    rejectionFor('!!!', []),
  ];
  cases.forEach((r) => {
    assert.ok(r, 'expected a refusal');
    assert.ok('tag' in r!, `${r!.reason} must name the tag`);
    assert.match(rejectionMessage(r!), new RegExp(String((r as { tag: string }).tag)));
  });
});

test('length is 2–20, at the boundaries', () => {
  assert.equal(rejectionFor('x'.repeat(TAG_MIN_LENGTH), []), null);
  assert.equal(rejectionFor('x'.repeat(TAG_MIN_LENGTH - 1), [])?.reason, 'short');
  assert.equal(rejectionFor('x'.repeat(TAG_MAX_LENGTH), []), null);
  assert.equal(rejectionFor('x'.repeat(TAG_MAX_LENGTH + 1), [])?.reason, 'long');
});

test('unicode letters and digits are allowed, not just latin', () => {
  assert.equal(rejectionFor('結婚式', []), null);
  assert.equal(rejectionFor('вечер', []), null);
  assert.equal(rejectionFor('aw26', []), null);
  assert.equal(rejectionFor('emoji🙂', [])?.reason, 'characters');
});

test('the blocklist refuses at commit', () => {
  const r = rejectionFor(BLOCKED[0]!, []);
  assert.equal(r?.reason, 'blocked');
});

/* ─── AC 17 · zero tags is a valid look ─── */

test('zero tags is valid — the step is optional', () => {
  /* Mandatory free text produces #asdf. Absence is better data than garbage,
     so nothing in this module has an opinion about an empty list. */
  assert.deepEqual(commitAll([], '   ').tags, []);
  assert.equal(commitAll([], '   ').rejection, null, 'and an empty commit is not an error');
});

/* ─── AC 18 · tags are not editable after publish ─── */

test('tags are frozen after publish', () => {
  /* Editable tags after reactions land is another route to optimising against
     the room — the same reasoning as the re-render window. */
  assert.equal(TAGS_EDITABLE_AFTER_PUBLISH, false);
});

/* ─── the delimiter, and paste ─── */

test('space and comma both commit a chip, and a paste lands as several', () => {
  const { tags } = commitAll([], 'wedding, cold field  secondhand');
  assert.deepEqual(tags, ['wedding', 'cold', 'field', 'secondhand']);
});

test('a paste reports the FIRST refusal only, and keeps the good tags', () => {
  const { tags, rejection } = commitAll([], 'wedding a http://x.co warm');
  assert.deepEqual(tags, ['wedding', 'warm']);
  assert.equal(rejection?.reason, 'short', 'the first problem, not the last');
});

test('removing is by value and takes exactly one', () => {
  assert.deepEqual(removeTag(['a1', 'b2'], 'a1'), ['b2']);
  assert.deepEqual(removeTag(['a1'], 'nope'), ['a1']);
});

test('nothing mutates the list it was given', () => {
  const tags = ['wedding'];
  const snapshot = JSON.stringify(tags);
  commitTag(tags, 'warm');
  commitAll(tags, 'warm sharp');
  removeTag(tags, 'wedding');
  assert.equal(JSON.stringify(tags), snapshot);
});

/* ─── the two things tags must not do (§5) ─── */

test('autocomplete, if ever built, is the user’s own history only', () => {
  /* A global popular-tag list converges everyone's vocabulary and is
     popularity-weighting through the back door — invariant 7 exists to
     prevent exactly that. */
  assert.equal(OWN_HISTORY_ONLY, true);
});

test('AC 21 · the magazine sampler cannot see tags at all', () => {
  /* Sample-don't-sort (invariant 7) is the single change that would quietly
     ruin the product, and a tag filter is a sort. Enforced as an IMPORT
     boundary rather than as a promise, the same way tests/reactions.test.ts
     fences the sampler off from reactions. */
  const sampler = readFileSync(new URL('../src/domain/magazine.ts', import.meta.url), 'utf8');
  assert.equal(
    /from\s+['"].*tags['"]/.test(sampler),
    false,
    'domain/magazine.ts must never import domain/tags',
  );
});

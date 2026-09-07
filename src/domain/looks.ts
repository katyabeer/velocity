/**
 * WHAT KIND OF THING IS IN THE FEED. One tiny module, and it exists for a
 * structural reason rather than a tidiness one.
 *
 * `LookKind` used to live in domain/reactions.ts, by accident of who needed it
 * first. That was fine until the magazine's filter rail needed it too — and
 * `tests/reactions.test.ts` guards, bluntly and correctly, that
 * domain/magazine.ts NEVER imports reactions:
 *
 *   "sample, don't sort — the sampler must never import reactions"
 *
 * The guard is blunt on purpose. A type-only import cannot carry reaction
 * data, so relaxing it to allow `import type` would have been safe TODAY and
 * would have opened the door to a value import tomorrow, in a file whose whole
 * job is to not know what reactions are.
 *
 * So the type moved here instead, where both can reach it and neither has to
 * know about the other. A look's kind is a property of the look — it is not
 * about how the room reacted to it.
 */

export type LookKind = 'editorial' | 'settled_entry' | 'freestyle' | 'live_entry';

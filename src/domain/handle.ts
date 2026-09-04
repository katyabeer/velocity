/**
 * THE HANDLE — one source of truth, captured on the profile screen and
 * rendered everywhere. You-brief §3.
 *
 * It used to be hardcoded as `@katyabeer` on the You screen while the profile
 * screen collected something else entirely, so the one thing that screen
 * exists to capture went nowhere. `state/session.ts` holds it now and this
 * module is the only place that decides whether a string is a handle.
 *
 * ══ WHY THE RULES ARE THE RULES ══
 *
 * 3–20 characters, unicode letters and digits and `_`, no leading digit.
 * CASE-PRESERVED FOR DISPLAY, CASE-INSENSITIVE FOR UNIQUENESS — so `Katya`
 * displays as typed but cannot coexist with `katya`. The `@` is display only
 * and is never stored, the same separation the `#` has on tags.
 *
 * ⚠ UNIQUENESS IS A MOCK, and it is a mock with teeth. The old profile screen
 * had NO taken-handle path at all — the check always said yes — which meant a
 * moderated session could never observe the more interesting moment: someone
 * being refused their first choice. `TAKEN` below makes that reachable.
 *
 * CHANGEABLE, rate-limited to once per 30 days. The limit is NOT an
 * impersonation guard: there is no social graph in this product — no follows,
 * DMs or comments — so a rename cannot be used to intercept anyone. It exists
 * to stop churn in magazine attribution, which is the only place a handle is
 * load-bearing.
 */

/** Unicode letters, digits and underscore. `\p{L}` needs the `u` flag and
 *  ES2018 property escapes — same dependency as domain/tags.ts, and the same
 *  reason not to fall back to `[a-z]`, which would refuse most of the world. */
const SHAPE = /^[\p{L}\p{N}_]+$/u;
const LEADS_WITH_DIGIT = /^\p{N}/u;

export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 20;
export const HANDLE_CHANGE_COOLDOWN_DAYS = 30;

/**
 * ⚠ MOCK. A real service checks a unique index; this is the shortest list that
 * makes the refusal path REACHABLE IN A MODERATED SESSION — which means it has
 * to contain things a tester might actually type. Reserved org names alone
 * would never fire: nobody sits down and tries "editorial". A handful of
 * common first names do, and a participant called Katya now hits the refusal
 * on her first choice and has to pick a second, which is the moment the old
 * always-says-yes check could never produce.
 *
 * Lowercase, because uniqueness is case-insensitive. It deliberately does NOT
 * contain the returning user's own seeded handle — a returning account owns
 * its handle, and reserving it against its owner is not what a unique index
 * does.
 */
export const TAKEN: readonly string[] = [
  'katya',
  'anna',
  'alex',
  'sam',
  'admin',
  'editorial',
  'frame23',
];

export type HandleRejection =
  | { reason: 'empty' }
  | { reason: 'short'; min: number }
  | { reason: 'long'; max: number }
  | { reason: 'characters' }
  | { reason: 'leading-digit' }
  | { reason: 'taken'; handle: string };

/** What uniqueness compares. Never what is displayed or stored. */
export const forUniqueness = (handle: string): string => handle.toLowerCase();

/** The `@` lives here and nowhere else. */
export const display = (handle: string): string => `@${handle}`;

/**
 * Shape only — no uniqueness. Split out because the two run at different
 * moments: shape on every keystroke, uniqueness after a debounce.
 */
export function shapeRejection(raw: string): HandleRejection | null {
  const h = raw.trim();
  if (!h) return { reason: 'empty' };
  if (LEADS_WITH_DIGIT.test(h)) return { reason: 'leading-digit' };
  if (!SHAPE.test(h)) return { reason: 'characters' };
  if (h.length < HANDLE_MIN_LENGTH) return { reason: 'short', min: HANDLE_MIN_LENGTH };
  if (h.length > HANDLE_MAX_LENGTH) return { reason: 'long', max: HANDLE_MAX_LENGTH };
  return null;
}

/**
 * Shape then uniqueness, in that order — telling someone their handle is
 * taken when it was never a legal handle sends them looking for a different
 * name instead of a different character.
 */
export function handleRejection(
  raw: string,
  taken: readonly string[] = TAKEN,
): HandleRejection | null {
  const shape = shapeRejection(raw);
  if (shape) return shape;
  const h = raw.trim();
  return taken.includes(forUniqueness(h)) ? { reason: 'taken', handle: h } : null;
}

/**
 * INLINE AND IMMEDIATE, not on submit (AC 2). Every message says what to do
 * rather than what went wrong, and the taken one names the handle back so it
 * is obvious which attempt was refused.
 */
export function handleRejectionMessage(r: HandleRejection): string {
  switch (r.reason) {
    case 'empty':
      return 'Pick a name first — this is the one thing we need.';
    case 'short':
      return `A bit longer — ${r.min} characters minimum.`;
    case 'long':
      return `A bit shorter — ${r.max} characters maximum.`;
    case 'characters':
      return 'Letters, numbers and underscores only.';
    case 'leading-digit':
      return 'Start with a letter, not a number.';
    case 'taken':
      return `“${r.handle}” is taken. Try another.`;
  }
}

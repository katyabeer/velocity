/**
 * ════════════════════════════════════════════════════════════════════════
 *  THE NAME IS LIVE AND UNRESOLVED. It lives here, once.
 * ════════════════════════════════════════════════════════════════════════
 *
 * The client has rejected *Velocity*. Diagnosis: it is a word about SPEED, and
 * nothing here is about speed — it is about a DEADLINE, which is the opposite.
 *
 * Shortlist, three registers:
 *   Bias         bias cut + the room is biased — the smart pick
 *   Best Dressed accessible, real editorial heritage
 *   The Read     how a look reads / to read someone / a publication
 *
 * Earlier candidates: Dresser, Tearsheet, Plus One, Notes, Eight, Gloss, Flash,
 * Dress Code, Overdressed.
 *
 * NO AVAILABILITY CHECKS HAVE BEEN RUN ON ANY NAME. Do that before a client
 * shortlist.
 *
 * Every screen imports APP_NAME from here. Renaming the product is this one
 * line plus app.json. Do not hard-code the name in a component.
 */

export const APP_NAME = 'Velocity';

/** 18+. The minors privacy clause in scope §5.2 is dead scope given this —
 *  remove it in scope v1.5. */
export const AGE_RATING = 18;

/**
 * WHAT THE PRODUCT CLAIMS TO TEACH: art direction — reading and composing a
 * look. NOT personal styling. There are no bodies-as-you and no fit.
 *
 * This distinction has shaped many decisions and should not be quietly
 * reversed. Brief §10.7 and resolution §13.4 both hold *no bodies, no fit*,
 * with art direction as the defensible claim.
 *
 * Jack's open question 2 — render on a body or flat lay — reopens it, and
 * multiplies unit cost. Unresolved.
 */
export const TEACHES = 'art direction' as const;

/**
 * Render cost, for Jack. Catalogue generation is FIXED. A render per entrant per
 * day is VARIABLE, and grows exactly as the product succeeds.
 *
 *   200 DAU  →  14,600 renders/yr
 *   1,000    →  73,000
 *   10,000   →  730,000     (at 20% entry)
 *
 * Avatar-plus-garment multiplies the unit cost again.
 */
export const rendersPerYear = (dau: number, entryRate = 0.2): number =>
  Math.round(dau * entryRate * 365);

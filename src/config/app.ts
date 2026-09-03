/**
 * THE NAME. It lives here, once.
 *
 * "Editorial." per Katya's loading-screen mockup, 3 Sep 2026. Supersedes
 * "quintets." (v3 token export, 2 Sep), which superseded the *Velocity*
 * rejection and the Bias / Best Dressed / The Read shortlist. `app.json`'s
 * `expo.name` ("Styling Game") is the separate native/build-facing string —
 * not changed here, since that's a lower-stakes internal working title, not
 * user-facing copy.
 *
 * ⚠ STILL NO AVAILABILITY CHECKS RUN ON ANY CANDIDATE, and "Editorial" is a
 * far more contested word than "quintets" — it is a common noun in the exact
 * category this product sits in. Worth a trademark and App Store search before
 * anything is printed.
 *
 * Every screen imports from here. Renaming the product is these two lines. Do
 * not hard-code the name in a component.
 */

export const APP_NAME = 'Editorial.';

/**
 * The letters without the full stop.
 *
 * The wordmark's dot is a SEPARATE ELEMENT on the loading screen, because it
 * doubles as the loading indicator — it pulses while the app boots (see
 * onboarding/splash.tsx). So the splash cannot render APP_NAME as one string.
 * Anywhere the name appears as plain copy, use APP_NAME and keep the stop.
 */
export const APP_WORDMARK = 'Editorial';

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

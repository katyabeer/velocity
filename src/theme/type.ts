/**
 * The typefaces, ported from quintets.css (v3 token export). Down from four
 * families to three:
 *
 *   --qt-font-display  Big Shoulders Display  the onboarding headline, AND
 *                                              every button label — nothing
 *                                              else uses this face anymore.
 *   --qt-font-sans      Archivo                everything else: screen/section
 *                                              titles, body, the editorial
 *                                              "lede" voice (now italic
 *                                              Archivo, not Bodoni), meta.
 *   --qt-font-mono      DM Mono                metadata, timestamps, percentages.
 *
 * Bodoni Moda is retired. The old h2/sigHead screen-title treatment
 * (Big Shoulders ExtraBold, condensed) also retires in favor of quintets.css's
 * qt-screen-title/qt-section-title recipes, which are plain Archivo Black —
 * the display face is now reserved for the one big onboarding moment and
 * buttons, not general navigation chrome.
 *
 * Font family strings match the names @expo-google-fonts registers.
 * Loaded in app/_layout.tsx — do not reference a weight that isn't loaded there.
 */

import { StyleSheet, type TextStyle } from 'react-native';
import { palette } from './tokens';

export const family = {
  disp900: 'BigShouldersDisplay_900Black',
  sans400: 'Archivo_400Regular',
  sans500: 'Archivo_500Medium',
  sans500Italic: 'Archivo_500Medium_Italic',
  sans600: 'Archivo_600SemiBold',
  sans700: 'Archivo_700Bold',
  sans900: 'Archivo_900Black',
  mono400: 'DMMono_400Regular',
  mono500: 'DMMono_500Medium',
} as const;

/**
 * Named text styles, rebuilt from quintets.css's `.qt-*` component recipes.
 * `line-height` is converted from a unitless ratio to absolute px because
 * React Native has no unitless lineHeight (`display`'s .86 ratio at 44px is
 * 44 * .86 ≈ 38).
 */
export const type = StyleSheet.create({
  /** .qt-screen-title — in-page subsection labels (SigHead: "Your posts",
   *  "Milestones"). Distinct from `sectionName` below, which is the
   *  top-of-screen label — quintets.css's own recipe doesn't distinguish
   *  these two roles, but they read at different sizes in the app. */
  screenTitle: {
    fontFamily: family.sans900,
    fontSize: 18,
    lineHeight: 18,
    color: palette.ink,
  },
  /** The section name — the big top-left label on every tab screen
   *  (Today's challenge, Magazine, Wardrobe, You...). Archivo Black 22,
   *  per Katya's explicit correction over the display face this used to
   *  use (quintets.css's own `.qt-screen-title` recipe is unsized at 18px
   *  and doesn't specify uppercase — this is a deliberate deviation from
   *  that recipe, not a misread of it). */
  sectionName: {
    fontFamily: family.sans900,
    fontSize: 22,
    lineHeight: 22,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** .qt-section-title */
  sectionTitle: {
    fontFamily: family.sans700,
    fontSize: 14,
    lineHeight: 16.8,
    color: palette.ink,
  },
  /** .qt-display — the onboarding headline. The ONE place Big Shoulders
   *  Display survives outside buttons. */
  display: {
    fontFamily: family.disp900,
    fontSize: 44,
    lineHeight: 38,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** .qt-lede — italic Archivo, replaces the old Bodoni `lede` + `big`. */
  lede: {
    fontFamily: family.sans500Italic,
    fontSize: 23,
    lineHeight: 28.5,
    color: palette.ink,
  },
  /** .qt-body — 16px as of 3 Sep (Katya), up from 14.
   *
   *  THIS IS THE PROSE STYLE, and until now almost nothing used it: `Body`
   *  appeared 7 times against `Tiny`'s ~55, so `tiny` had quietly become the
   *  app's body copy at 10px. Raising `body` alone would have changed almost
   *  nothing on screen, so the paragraph-level `Tiny` call sites moved across
   *  with it. `tiny` stays 10px and keeps its real job — counters, toggle
   *  labels, section metadata, legal small print. If you are writing a
   *  sentence, use `Body`. */
  body: {
    fontFamily: family.sans400,
    fontSize: 16,
    lineHeight: 24.8,
    color: palette.grey,
  },
  /** Not one of quintets.css's 8 named recipes — the old `.tiny` footnote
   *  role (prose-like small print, not a label) doesn't map cleanly onto
   *  "mini" (that's specifically the coin-unit label: uppercase, tracked).
   *  Kept as its own style: same size/family as before, recolored to
   *  greyMute per the AA fix (see tokens.ts palette comment). */
  tiny: {
    fontFamily: family.sans400,
    fontSize: 10,
    lineHeight: 15.5,
    color: palette.greyMute,
  },
  /** .qt-eyebrow — the all-caps kicker, e.g. onboarding step numbers. */
  eyebrow: {
    fontFamily: family.sans700,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  /** .qt-meta — DM Mono labels, metadata. */
  meta: {
    fontFamily: family.mono500,
    fontSize: 12,
    lineHeight: 14.4,
    letterSpacing: 1.44,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  /** .qt-handle / .qt-tag — interactive text (hashtags, handles, tags). */
  handle: {
    fontFamily: family.sans700,
    fontSize: 14,
    lineHeight: 16.8,
    color: palette.link,
  },
  tag: {
    fontFamily: family.sans600,
    fontSize: 12,
    lineHeight: 14.4,
    color: palette.link,
  },
  /** .qt-filter */
  filter: {
    fontFamily: family.sans700,
    fontSize: 14,
    letterSpacing: 0.14,
    lineHeight: 14,
    color: palette.grey,
  },
  /** .qt-pill / .qt-cta-pieces micro-label */
  micro: {
    fontFamily: family.sans700,
    fontSize: 9,
    lineHeight: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
  },
  /** .qt-coins > span — the coin unit label */
  mini: {
    fontFamily: family.sans700,
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  /** .qt-btn label — every button in the app, now the display face. */
  action: {
    fontFamily: family.disp900,
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** the large numeral (coin count, milestone counters) */
  num: {
    fontFamily: family.disp900,
    fontSize: 52,
    lineHeight: 45,
    color: palette.ink,
  },
  /** .tabbar span — not in quintets.css; kept small/functional, Archivo. */
  tab: {
    fontFamily: family.sans700,
    fontSize: 7.5,
    lineHeight: 8,
    letterSpacing: 0.98,
    textTransform: 'uppercase',
  },
}) as Record<string, TextStyle>;

/** Every font asset the app needs. Imported by the root layout. */
export const fontManifest = {
  disp: ['900Black'],
  sans: ['400Regular', '500Medium', '500Medium_Italic', '600SemiBold', '700Bold', '900Black'],
  mono: ['400Regular', '500Medium'],
} as const;

/**
 * The four typefaces, ported from the prototype's CSS vars:
 *   --disp   Big Shoulders Display   headlines, numbers, band names
 *   --voice  Bodoni Moda (italic)    the editorial voice — briefs, ledes
 *   --sans   Archivo                 UI, body, everything functional
 *   --mono   DM Mono                 metadata, timestamps, percentages
 *
 * Font family strings match the names @expo-google-fonts registers.
 * Loaded in app/_layout.tsx — do not reference a weight that isn't loaded there.
 */

import { StyleSheet, type TextStyle } from 'react-native';
import { palette } from './tokens';

export const family = {
  disp500: 'BigShouldersDisplay_500Medium',
  disp700: 'BigShouldersDisplay_700Bold',
  disp800: 'BigShouldersDisplay_800ExtraBold',
  disp900: 'BigShouldersDisplay_900Black',
  voiceItalic: 'BodoniModa_500Medium_Italic',
  voiceItalic400: 'BodoniModa_400Regular_Italic',
  sans400: 'Archivo_400Regular',
  sans500: 'Archivo_500Medium',
  sans600: 'Archivo_600SemiBold',
  sans700: 'Archivo_700Bold',
  mono400: 'DMMono_400Regular',
  mono500: 'DMMono_500Medium',
} as const;

/**
 * Named text styles. The CSS shorthand is unpacked, and `line-height` is
 * converted from a ratio to absolute px because React Native has no unitless
 * lineHeight.
 */
export const type = StyleSheet.create({
  /** .lg h1 — the page name. 50px/.84 uppercase. */
  pageTitle: {
    fontFamily: family.disp900,
    fontSize: 50,
    lineHeight: 42,
    textTransform: 'uppercase',
    letterSpacing: -0.25,
    color: palette.ink,
  },
  /** h2 — screen headline, 31px/.9 */
  h2: {
    fontFamily: family.disp800,
    fontSize: 31,
    lineHeight: 28,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** .hero — the big full-bleed display line */
  hero: {
    fontFamily: family.disp900,
    fontSize: 34,
    lineHeight: 29,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** h3 — section head inside a scroll */
  h3: { fontFamily: family.sans600, fontSize: 14.5, lineHeight: 18, color: palette.ink },
  /** .sig h3 — the You-tab section head, display face */
  sigHead: {
    fontFamily: family.disp800,
    fontSize: 23,
    lineHeight: 22,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** .kick — the all-caps eyebrow. Klein by default. */
  kick: {
    fontFamily: family.sans700,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: palette.klein,
  },
  /** .lede — Bodoni italic, the voice of the product */
  lede: { fontFamily: family.voiceItalic, fontSize: 16, lineHeight: 22, color: palette.ink },
  /** .big — the brief itself, and every line that has to feel written */
  big: { fontFamily: family.voiceItalic, fontSize: 23, lineHeight: 28, color: palette.ink },
  /** p.b — body copy */
  body: { fontFamily: family.sans400, fontSize: 12.5, lineHeight: 20, color: palette.soft },
  /** .tiny — the footnote weight. Does a lot of work in this product. */
  tiny: { fontFamily: family.sans400, fontSize: 10, lineHeight: 15.5, color: palette.faint },
  /** .num — the large numeral */
  num: { fontFamily: family.disp900, fontSize: 52, lineHeight: 43, color: palette.ink },
  /** .btn label */
  button: {
    fontFamily: family.sans700,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 1.92,
    textTransform: 'uppercase',
  },
  /** .chip label */
  chip: {
    fontFamily: family.sans600,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  /** .hdr .tiny — mono metadata in a header bar */
  meta: {
    fontFamily: family.mono500,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  /** .tabbar span */
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
  disp: ['500Medium', '700Bold', '800ExtraBold', '900Black'],
  voice: ['400Regular_Italic', '500Medium_Italic'],
  sans: ['400Regular', '500Medium', '600SemiBold', '700Bold'],
  mono: ['400Regular', '500Medium'],
} as const;

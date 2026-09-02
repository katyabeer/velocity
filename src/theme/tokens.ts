/**
 * Design tokens — v3, ported from quintets.css (Katya's Figma export,
 * 2 Sep 2026). Replaces the newsprint/klein-shock-green palette below.
 *
 * ONE accent (#DCE568) now does what klein blue (system state / progress /
 * "yours"), shocking pink (exception / new / loaned / day-one) and green
 * (user-authored tags) used to split between them — quintets.css's own
 * drop-in override section confirms this is deliberate, not a gap. Two
 * consequences worth knowing before you reach for a color:
 *
 *   - There is no distinct hue left for "alert/exception" states (wardrobe
 *     full, loan warnings, the day-one notice). Those now read via ink +
 *     border + copy, not color. If a screen genuinely needs to stand out
 *     from a normal accent state, that needs a new token from Katya — don't
 *     invent one here.
 *   - `accent` is close to illegible as TEXT on `cream` (1.23:1 contrast —
 *     quintets.css says so itself). Use `accent` for fills only, always
 *     with `accentEdge` as the border/keyline. For colored, clickable TEXT
 *     (the "→ see more" style rows, hashtags, handles), use `link`.
 *
 * ONE near-black (`ink`) — the old palette had seven; quintets.css collapses
 * them to one, no exceptions.
 *
 * `day` / `night` still live here for the proposed-but-unsigned-off "the
 * interface tells the time" move. Still nothing consumes `night`.
 *
 * `bg` vs `cream`, added 2 Sep 2026 (Katya): the app background and "surface"
 * are no longer the same color. `bg` (#FAFAF8) is the page itself. `cream`
 * (#F7F3EA) now means SURFACE — chrome that sits on top of the page: the
 * sticky header/logo block, the bottom tab bar, sheets/drawers. Anything that
 * is "the page" uses `bg`; anything that reads as a raised or pinned strip
 * uses `cream`.
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const palette = {
  // grounds
  /** The app background — the page itself. */
  bg: '#FAFAF8',
  /** Surface — chrome pinned above the page: header, tab bar, sheets. */
  cream: '#F7F3EA',
  creamSunk: '#EAEAE1',
  creamRaised: '#FDFCF8',
  white: '#FFFFFF',

  // ink — one value, no exceptions
  ink: '#121110',

  // greys
  grey: '#57544D',
  /** AA-safe (4.64:1). Use for any MUTED TEXT — eyebrows, metadata labels. */
  greyMute: '#736E61',
  /** NON-TEXT only (3.12:1, fails AA at small sizes) — inactive dots, icon strokes. */
  greyDecor: '#918C82',
  rule: '#D6D2C7',

  // accent — one value. Fills only; pair with accentEdge. Bare on photos.
  accent: '#DCE568',
  accentEdge: '#121110',

  // interactive text
  link: '#5A7000',
  linkHover: '#445400',
  /** Escape hatch, legal only at ≥18.66px bold or ≥24px regular (large-text AA). */
  linkLg: '#6D8810',

  /** Not in quintets.css — reasonable AA-safe defaults kept consistent with
   *  its own contrast discipline, since disabled states aren't specced there. */
  disabledFill: '#EAEAE1',
  disabledInk: '#736E61',
} as const;

/** Look-plate tints t0–t5. Stand-ins for imagery — unrelated to the semantic
 *  palette above, so untouched by the v3 token migration. */
export const plateTints = ['#E8E5DB', '#DEDACE', '#E3E0D4', '#D9D5C8', '#ECEAE1', '#D2CEC1'] as const;
export type PlateTint = `t${0 | 1 | 2 | 3 | 4 | 5}`;
export const tintFor = (t: PlateTint): string => plateTints[Number(t.slice(1)) as 0 | 1 | 2 | 3 | 4 | 5];

export const space = {
  /** The page gutter. Every full-bleed element re-adds this itself. */
  gutter: 22,
  xs: 4,
  sm: 6,
  md: 9,
  lg: 14,
  xl: 18,
  xxl: 22,
  /** quintets.css's own step scale (s1–s6), for new work — kept alongside
   *  the named steps above rather than replacing them, since those are
   *  used throughout the existing screens and weren't part of the token
   *  audit. */
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 22,
  s6: 32,
} as const;

export const border = {
  hair: 1,
  /** 1.5 is the "committed" weight — cards that matter, primary chips. */
  mid: 1.5,
  /** 2 is a section rule: the logo block underline, the tab bar top. */
  heavy: 2,
  /** 4px ink border for a selected card/rail — quintets.css's dedicated
   *  selected-state token. Replaces the old thin kleinLine border. */
  sel: 4,
  /** 3px ground-colored keyline — separates an accent-filled tag from the
   *  photo behind it (quintets.css's `.qt-cta-pieces` "save pieces" tag). */
  key: 3,
} as const;

/** New in v3 — the app had no rounded corners anywhere before this. */
export const radius = {
  /** count boxes, vote pills */
  xs: 4,
  /** buttons, chips, pair images, save-pieces */
  sm: 6,
  /** feed images, sheets */
  lg: 16,
  /** onboarding CTA only */
  pill: 999,
} as const;

/** New in v3 — static tilt on feed/pair imagery. Zero these under reduced
 *  motion (see `useReducedMotion` below); it's decorative, not information. */
export const rotation = {
  /** large surfaces — feed images */
  r1: 1,
  /** small surfaces — pair images, coin chip */
  r2: 2,
  /** scattered items — onboarding garment stacks */
  r3: 4,
  /** decorative only — the coin star */
  glyph: 18,
} as const;

export const layout = {
  /** Reference device from the prototype. Used only for proportional sanity. */
  designWidth: 390,
  designHeight: 844,
  tabBarHeight: 56,
} as const;

/**
 * Colour roles, so screens never reach for a hex directly.
 * The day/night switch, if signed off, swaps these two objects.
 */
export const day = {
  bg: palette.bg,
  text: palette.ink,
  textSoft: palette.grey,
  textFaint: palette.greyMute,
  rule: palette.rule,
  accent: palette.accent,
  accentTint: palette.accent,
  alert: palette.ink,
  alertTint: palette.creamSunk,
} as const;

export const night = {
  bg: '#121110',
  text: '#F5F4EF',
  textSoft: '#B8B2A8',
  textFaint: '#7E786F',
  rule: '#35332F',
  accent: palette.accent,
  accentTint: '#3A3A1E',
  alert: palette.cream,
  alertTint: '#2A2A20',
} as const;

export type Surface = typeof day;

/** Zeroes `rotation` values for anyone who has reduced motion turned on —
 *  the RN equivalent of quintets.css's `@media (prefers-reduced-motion)`
 *  block. Use as: `const rot = useReducedMotion() ? 0 : rotation.r1`. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduced(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

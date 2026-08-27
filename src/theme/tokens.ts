/**
 * Design tokens — ported 1:1 from the CSS custom properties in
 * velocity-A-ritual.v2.html (`:root`).
 *
 * Newsprint palette. Klein blue is the system colour (state, progress, "yours"),
 * shocking pink is the exception colour (new / loaned / day-one), green is for
 * user-authored tags only (red tags were reversed — they read as aggressive).
 *
 * `day` / `night` live here for the proposed-but-unsigned-off "the interface
 * tells the time" move (naming-and-art-direction.md). Constraint from the
 * handover: if it happens, it switches ONLY the judging surface and the result
 * screen, never the whole app. Nothing consumes `night` yet.
 */

export const palette = {
  paper: '#F5F4EF',
  ink: '#121110',
  soft: '#57544D',
  faint: '#918C82',
  line: '#D6D2C7',
  fill: '#E8E5DB',
  fill2: '#DEDACE',
  klein: '#1B2FE8',
  kleinTint: '#EDEFFE',
  kleinInk: '#2C2F52',
  kleinMid: '#4652C4',
  kleinLine: '#B9C1F8',
  shock: '#FF2E63',
  shockTint: '#FFE7ED',
  shockInk: '#7E2A40',
  shockMid: '#8B3A52',
  green: '#0F6B45',
  greenTint: '#E6F2EC',
  card: '#FCFBF8',
  disabledFill: '#DEDACE',
  disabledInk: '#8B857A',
} as const;

/** Look-plate tints t0–t5. The prototype uses these as stand-ins for imagery. */
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
} as const;

export const border = {
  hair: 1,
  /** 1.5 is the "committed" weight — cards that matter, primary chips. */
  mid: 1.5,
  /** 2 is a section rule: the logo block underline, the tab bar top. */
  heavy: 2,
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
  bg: palette.paper,
  text: palette.ink,
  textSoft: palette.soft,
  textFaint: palette.faint,
  rule: palette.line,
  accent: palette.klein,
  accentTint: palette.kleinTint,
  alert: palette.shock,
  alertTint: palette.shockTint,
} as const;

export const night = {
  bg: '#121110',
  text: '#F5F4EF',
  textSoft: '#B8B2A8',
  textFaint: '#7E786F',
  rule: '#35332F',
  accent: palette.shock,
  accentTint: '#2A1420',
  alert: palette.shock,
  alertTint: '#2A1420',
} as const;

export type Surface = typeof day;

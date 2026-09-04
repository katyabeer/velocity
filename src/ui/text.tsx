/**
 * Text primitives. One component per named style in the prototype's CSS, so a
 * screen never sets a fontFamily itself.
 *
 * If you need a size the prototype used inline (`style="font-size:37px"`), pass
 * `size` — it overrides fontSize and rescales lineHeight by the same ratio, so
 * the display faces keep their tight leading.
 */

import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { type as T } from '@/theme/type';
import { palette } from '@/theme/tokens';

type Props = TextProps & {
  size?: number;
  color?: string;
  children?: React.ReactNode;
};

function scaled(base: TextStyle, size?: number): TextStyle {
  if (size === undefined) return base;
  const ratio = size / (base.fontSize ?? size);
  return {
    ...base,
    fontSize: size,
    lineHeight: base.lineHeight ? base.lineHeight * ratio : undefined,
  };
}

/** `name` is only for React DevTools and the display-name lint rule — every
 *  component below is produced by this factory, so without it they all show up
 *  as anonymous in a component tree. */
const make = (base: TextStyle, name: string) => {
  const Component = ({ size, color, style, ...rest }: Props) => (
    <RNText {...rest} style={[scaled(base, size), color ? { color } : null, style]} />
  );
  Component.displayName = name;
  return Component;
};

/** PageTitle is the section name — the top-left label on every tab screen.
 *  Archivo Black 22 (T.sectionName), not the display face — Katya's
 *  explicit correction. H2/Hero keep the display face for in-page
 *  headlines (call sites keep their own `size` overrides, so that's a
 *  font/weight change only, not a layout one). */
export const PageTitle = make(T.sectionName!, 'PageTitle');
export const H2 = make(T.display!, 'H2');
export const Hero = make(T.display!, 'Hero');
/** v3: SigHead (section heads — "Your posts", "Milestones") demotes from
 *  the display face to quintets.css's `.qt-screen-title` (Archivo Black) —
 *  the display face is no longer used for in-app section chrome. */
export const SigHead = make(T.screenTitle!, 'SigHead');
/** v3: Lede and Big converge — quintets.css has one "lede" voice (italic
 *  Archivo, 23px), not two Bodoni sizes. */
export const Lede = make(T.lede!, 'Lede');
export const Big = make(T.lede!, 'Big');
export const Body = make(T.body!, 'Body');
export const Tiny = make(T.tiny!, 'Tiny');
export const Meta = make(T.meta!, 'Meta');
export const Num = make(T.num!, 'Num');

/** The all-caps eyebrow (quintets.css `.qt-eyebrow`). `tone` used to pick
 *  between klein/shock as TEXT color; both retire to `link` (accent is
 *  illegible as text on cream — see tokens.ts) and `ink` (no alert hue
 *  survives the v3 collapse — see tokens.ts palette comment). */
export function Kick({
  tone = 'accent',
  ...rest
}: Props & { tone?: 'accent' | 'muted' | 'alert' }) {
  const color =
    tone === 'muted' ? palette.greyMute : tone === 'alert' ? palette.ink : palette.link;
  return <RNText {...rest} style={[T.eyebrow, { color }, rest.style]} />;
}

/** Inline bold inside a Body / Tiny run. RN has no <b>, so this is how the
 *  prototype's emphasis survives. */
export function B({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <RNText style={{ fontFamily: 'Archivo_700Bold', color: color ?? palette.ink }}>
      {children}
    </RNText>
  );
}

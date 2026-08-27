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

const make =
  (base: TextStyle) =>
  ({ size, color, style, ...rest }: Props) => (
    <RNText {...rest} style={[scaled(base, size), color ? { color } : null, style]} />
  );

export const PageTitle = make(T.pageTitle!);
export const H2 = make(T.h2!);
export const H3 = make(T.h3!);
export const SigHead = make(T.sigHead!);
export const Hero = make(T.hero!);
export const Lede = make(T.lede!);
export const Big = make(T.big!);
export const Body = make(T.body!);
export const Tiny = make(T.tiny!);
export const Meta = make(T.meta!);
export const Num = make(T.num!);

/** The all-caps eyebrow. `tone` maps to the three CSS variants: .kick (klein),
 *  .kick.m (muted) and .kick.s (shock). */
export function Kick({
  tone = 'accent',
  ...rest
}: Props & { tone?: 'accent' | 'muted' | 'alert' }) {
  const color =
    tone === 'muted' ? palette.faint : tone === 'alert' ? palette.shock : palette.klein;
  return <RNText {...rest} style={[T.kick, { color }, rest.style]} />;
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

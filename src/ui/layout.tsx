/**
 * Layout primitives.
 *
 * FLEX GOTCHA, from the handover's hazard list: the floating-navbar bug in the
 * prototype was a missing `flex:1` child failing to absorb leftover height. The
 * CSS fix was `.grow{flex:1 1 0;min-height:0}`. In React Native the equivalent
 * is `flex: 1` plus `minHeight: 0` on the scrolling child — `Scroll` does both.
 * If a screen's footer floats, that is the bug.
 *
 * The prototype drew a fake iOS status bar (`.status`, 9:41 and signal bars).
 * That is NOT ported — a real device has a real one, and SafeAreaView handles
 * the inset. This is the one place the port deliberately drops pixels.
 */

import { View, ScrollView, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space, border } from '@/theme/tokens';
import { Kick, Meta, PageTitle, Tiny } from './text';
import { TokenBadge } from './TokenBadge';
import { type as T } from '@/theme/type';
import { Text } from 'react-native';

/** The page. Paper background, column, safe insets top and bottom. */
export function Screen({ children, style }: ViewProps) {
  return (
    <SafeAreaView style={[s.screen, style]} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

/**
 * The scrolling body. Always exactly one per screen, and always the flexing
 * child — see the flex gotcha above.
 *
 * `bleed` removes the horizontal gutter for full-bleed content (the magazine
 * feed, the judging pair). Full-bleed children re-add the gutter themselves.
 */
export function Scroll({
  children,
  bleed,
  contentStyle,
}: {
  children: React.ReactNode;
  bleed?: boolean;
  contentStyle?: ViewStyle;
}) {
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[
        bleed ? s.scrollPadBleed : s.scrollPad,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** The pinned action area at the bottom of a screen. Never scrolls. */
export const Foot = ({ children, style }: ViewProps) => (
  <View style={[s.foot, style]}>{children}</View>
);

/** A block pinned under the header — the builder's slot strip lives here. */
export const Pinned = ({ children, style }: ViewProps) => (
  <View style={[s.pinned, style]}>{children}</View>
);

export const Row = ({
  children,
  gap = space.md,
  style,
}: ViewProps & { gap?: number }) => (
  <View style={[{ flexDirection: 'row', gap }, style]}>{children}</View>
);

export const Wrap = ({ children, gap = space.sm, style }: ViewProps & { gap?: number }) => (
  <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, style]}>{children}</View>
);

export const Gap = ({ h = space.lg }: { h?: number }) => <View style={{ height: h }} />;

export const Rule = ({ style }: { style?: ViewStyle }) => <View style={[s.rule, style]} />;

/**
 * The `.lg` block — the section name, in the section-title face, under a
 * heavy rule. The token badge is ALWAYS shown here (top right, every
 * screen) — `right` is for a screen-specific extra, shown above it.
 */
export function LogoBlock({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /**
   * A way out, above the masthead. Only for a screen that wears the masthead
   * but is NOT a tab home — Create, since it moved out of the tab bar (4 Sep)
   * and so has no bar underneath it to leave by. A tab home must not pass
   * this: there is nothing behind it.
   */
  onBack?: () => void;
}) {
  return (
    <View style={s.logo}>
      {onBack ? (
        <Text
          onPress={onBack}
          style={s.logoBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          ‹
        </Text>
      ) : null}
      <View style={s.logoRow}>
        <View style={{ flex: 1 }}>
          <PageTitle>{title}</PageTitle>
          {subtitle ? <Tiny style={{ marginTop: 8, color: palette.grey }}>{subtitle}</Tiny> : null}
        </View>
        <View style={{ marginTop: 6, alignItems: 'flex-end', gap: 6 }}>
          {right}
          <TokenBadge />
        </View>
      </View>
    </View>
  );
}

/**
 * The `.hdr` bar — a back chevron, a mono label, and something on the
 * right. The token badge is ALWAYS shown here too (see LogoBlock) —
 * `right` is a screen-specific extra shown alongside it, not instead of it.
 */
export function Header({
  onBack,
  title,
  right,
}: {
  onBack?: () => void;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Text onPress={onBack} style={s.back} accessibilityRole="button" accessibilityLabel="Back">
          ‹
        </Text>
      ) : (
        <View style={{ width: 10 }} />
      )}
      {title ? <Meta>{title}</Meta> : <View />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {right}
        <TokenBadge />
      </View>
    </View>
  );
}

/**
 * The inverted context strip. Ink background, accent-tinted kicker. Used
 * where the app needs to state a fact about the round that is not up for
 * negotiation ("entry closed 8pm").
 */
export function Strip({
  kick,
  value,
  right,
}: {
  kick: string;
  value: string;
  right?: string;
}) {
  return (
    <View style={s.strip}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.stripKick}>{kick}</Text>
        <Text style={s.stripValue}>{value}</Text>
      </View>
      {right ? <Text style={s.stripRight}>{right}</Text> : null}
    </View>
  );
}

/** A section head with a mono count on the right (`.secthead`). */
export function SectionHead({ title, note }: { title: string; note?: string }) {
  return (
    <View style={s.sectHead}>
      <Text style={s.sectHeadTitle}>{title}</Text>
      {note ? <Meta>{note}</Meta> : null}
    </View>
  );
}

/** The `.sig` block — a You-tab section, separated by a hairline. */
export function Sig({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <View style={[s.sig, last && { borderBottomWidth: 0 }]}>{children}</View>;
}

/** A Kick + content pair, the most common small grouping in the app. */
export function Labelled({
  kick,
  tone,
  children,
  style,
}: {
  kick: string;
  tone?: 'accent' | 'muted' | 'alert';
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      <Kick tone={tone}>{kick}</Kick>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  scroll: { flex: 1, minHeight: 0 },
  scrollPad: { paddingHorizontal: space.gutter, paddingTop: space.lg, paddingBottom: space.xl },
  scrollPadBleed: { paddingTop: 10, paddingBottom: space.xl },
  foot: { paddingHorizontal: space.gutter, paddingTop: 12, paddingBottom: 10 },
  pinned: {
    paddingHorizontal: space.gutter,
    paddingTop: 11,
    paddingBottom: 12,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
    backgroundColor: palette.cream,
  },
  rule: { height: border.hair, backgroundColor: palette.rule },
  logo: {
    paddingHorizontal: space.gutter,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: border.heavy,
    borderBottomColor: palette.ink,
    backgroundColor: palette.cream,
  },
  logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  header: {
    paddingHorizontal: space.gutter,
    paddingTop: 5,
    paddingBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
    backgroundColor: palette.cream,
  },
  back: { fontSize: 19, lineHeight: 22, color: palette.ink },
  /** Its own line above the title, not beside it — the masthead is the widest
   *  thing on the screen and a chevron sharing its row would either shrink it
   *  or float unattached to anything. */
  logoBack: { fontSize: 22, lineHeight: 24, color: palette.ink, marginBottom: 2, width: 22 },
  strip: {
    backgroundColor: palette.ink,
    paddingHorizontal: space.gutter,
    paddingTop: 9,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stripKick: {
    ...T.eyebrow,
    /** Light accent pops fine against the dark ink strip — the "illegible
     *  on cream" contrast problem only applies to accent-on-light. */
    color: palette.accent,
    letterSpacing: 1.44,
  },
  stripValue: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 15.5,
    color: '#EDEBE4',
    marginTop: 4,
  },
  stripRight: {
    fontFamily: 'Archivo_900Black',
    fontSize: 22,
    lineHeight: 22,
    color: palette.cream,
  },
  sectHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 17,
    marginBottom: 8,
  },
  sectHeadTitle: {
    fontFamily: 'Archivo_900Black',
    fontSize: 17,
    lineHeight: 18,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  sig: { paddingVertical: 17, borderBottomWidth: border.hair, borderBottomColor: palette.creamSunk },
});

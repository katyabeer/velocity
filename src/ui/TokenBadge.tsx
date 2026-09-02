/**
 * The token counter.
 *
 * `zero` is greyed and dimmed, any positive balance goes ink-on-accent — the
 * counter only lights up when there is something to do with it.
 *
 * REVERSED, DO NOT RE-PROPOSE: displaying a remaining quota as "pinches
 * earned". It framed depletion as gain.
 *
 * NAMING: "tokens", always. R-G5 and brief invariant 7 — a balance of anything
 * spendable is the Sorare exposure; "3 tokens" and a **Keep it** button are not.
 */

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { palette, border, rotation } from '@/theme/tokens';
import { useEconomy } from '@/state/economy';

/** `.qt-coins > svg` — decorative only, rotation.glyph (18°). */
function TokenGlyph() {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill={palette.ink}
      style={{ transform: [{ rotate: `${rotation.glyph}deg` }] }}
    >
      <Path d="M12 2l2.9 6.9L22 9.8l-5.5 4.9L18 22l-6-3.6L6 22l1.5-7.3L2 9.8l7.1-.9z" />
    </Svg>
  );
}

export function TokenBadge({ count }: { count?: number }) {
  const balance = useEconomy((s) => s.balance);
  const n = count ?? balance;
  const hot = n > 0;
  return (
    <View
      style={[s.wrap, hot ? s.hot : s.zero]}
      accessibilityLabel={`${n} token${n === 1 ? '' : 's'}`}
    >
      <TokenGlyph />
      <Text style={s.num}>{n}</Text>
      <Text style={s.label}>token{n === 1 ? '' : 's'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: border.mid,
    backgroundColor: palette.cream,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  zero: { borderColor: palette.rule, opacity: 0.6 },
  /** `.qt-coins` — full accent fill when there's a balance, not just a
   *  border tint. */
  hot: { borderColor: palette.accentEdge, backgroundColor: palette.accent },
  num: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 17,
    lineHeight: 17,
    color: palette.ink,
  },
  label: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: palette.grey,
  },
});

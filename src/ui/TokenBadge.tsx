/**
 * The token counter.
 *
 * `zero` is greyed and dimmed, any positive balance goes Klein — the counter
 * only lights up when there is something to do with it.
 *
 * REVERSED, DO NOT RE-PROPOSE: displaying a remaining quota as "pinches
 * earned". It framed depletion as gain.
 *
 * NAMING: "tokens", always. R-G5 and brief invariant 7 — a balance of anything
 * spendable is the Sorare exposure; "3 tokens" and a **Keep it** button are not.
 */

import { StyleSheet, Text, View } from 'react-native';
import { palette, border } from '@/theme/tokens';
import { useEconomy } from '@/state/economy';

export function TokenBadge({ count }: { count?: number }) {
  const balance = useEconomy((s) => s.balance);
  const n = count ?? balance;
  const hot = n > 0;
  return (
    <View
      style={[s.wrap, hot ? s.hot : s.zero]}
      accessibilityLabel={`${n} token${n === 1 ? '' : 's'}`}
    >
      <Text style={[s.num, hot && { color: palette.klein }]}>{n}</Text>
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
    backgroundColor: palette.paper,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  zero: { borderColor: palette.line, opacity: 0.6 },
  hot: { borderColor: palette.klein },
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
    color: palette.soft,
  },
});

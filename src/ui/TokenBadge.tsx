/**
 * The token counter.
 *
 * REBUILT TO KATYA'S FIGMA, 3 Sep: tilted, rounded, an accent fill, and a
 * four-point sparkle instead of the old five-point star. Everything comes from
 * existing tokens — `rotation.r2` for the tilt, `radius.sm` for the corners,
 * `accent`/`accentEdge` for the fill. No new values were invented for it.
 *
 * `zero` is greyed and dimmed and sits straight. Any positive balance goes
 * ink-on-accent AND tilts — the counter only lights up, and only leans, when
 * there is something to do with it. A jaunty zero is a lie.
 *
 * ⚠ THE FIGMA SAYS "COINS". This says TOKENS, deliberately.
 * Invariant 18 and R-G5 hold that the naming is a REGULATORY POSITION, not a
 * copy preference: the Sorare exposure came from market framing, and "coins" is
 * further into that framing than "tokens", not less — it is the word every
 * crypto and casino product uses for exactly this widget. Changing it here also
 * changes it nowhere else, so the app would say coins in the corner and tokens
 * in every sentence about them.
 * Katya — if the client wants "coins", it needs Jack's sign-off first, and then
 * it is a rename across `domain/economy.ts` and every screen, not this file.
 *
 * REVERSED, DO NOT RE-PROPOSE: displaying a remaining quota as "pinches
 * earned". It framed depletion as gain.
 */

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { palette, border, radius, rotation, useReducedMotion } from '@/theme/tokens';
import { useEconomy } from '@/state/economy';

/**
 * The four-point sparkle from the Figma.
 *
 * Concave sides, so it reads as a sparkle and not a compass rose — but only
 * mildly concave. The control points sit about a third of the way out from the
 * centre; pull them further in and the arms thin to spindles, which is not the
 * chunky mark in the Figma.
 */
function TokenGlyph() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill={palette.ink}>
      <Path d="M12 1.6Q13.8 9 22.4 12 13.8 15 12 22.4 10.2 15 1.6 12 10.2 9 12 1.6Z" />
    </Svg>
  );
}

export function TokenBadge({ count }: { count?: number }) {
  const balance = useEconomy((s) => s.balance);
  const reduced = useReducedMotion();
  const n = count ?? balance;
  const hot = n > 0;

  /* Decorative tilt, so it zeroes under reduced motion — a static rotation is
     still vestibular noise for some people, and it carries no information.
     Counter-clockwise, matching the Figma. */
  const tilt = hot && !reduced ? -rotation.r2 : 0;

  return (
    <View
      style={[s.wrap, hot ? s.hot : s.zero, { transform: [{ rotate: `${tilt}deg` }] }]}
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
    gap: 5,
    borderWidth: border.hair,
    borderRadius: radius.sm,
    backgroundColor: palette.cream,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  zero: { borderColor: palette.rule, opacity: 0.6 },
  /**
   * `.qt-coins` — full accent fill when there's a balance, not just a border
   * tint. The Figma has no keyline at all; this keeps a hairline (down from
   * `mid`) because accent must always carry `accentEdge` on a light ground
   * (tokens.ts), and the badge sits on cream chrome where the lime alone would
   * float. ⚠ Katya — drop it to borderWidth 0 if you want the Figma exactly.
   */
  hot: { borderColor: palette.accentEdge, backgroundColor: palette.accent },
  num: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 18,
    lineHeight: 18,
    color: palette.ink,
  },
  label: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

/**
 * THE WAY INTO CREATE, now that Create is not a tab (Katya, 4 Sep).
 *
 * It sits at the top of the Wardrobe, above the Pieces/Looks/Saved segmented
 * control, and that placement is the argument for it: Create builds from what
 * you own, so the door belongs on the screen holding what you own. As a fifth
 * tab it sat between Magazine and Wardrobe with nothing around it to explain
 * what "Create" meant.
 *
 * CONDENSED, DELIBERATELY. One row, two lines of copy, one badge. It is a door
 * at the top of a screen that is about something else, so anything taller
 * would push the wardrobe itself below the fold — the same reason the
 * builder's walkthrough tooltip came off on 3 Sep.
 *
 * THE PLUS IS THE ONLY DECORATIVE MARK IN THE APP, and it is here on purpose:
 * this is the one control that has to read as an invitation rather than as
 * navigation. It is drawn from two rules at the app's own border weights
 * rather than set as a glyph, so it takes the ink colour and cannot render
 * differently per platform — the reason the reaction thumbs stopped being
 * emoji.
 *
 * ACCENT FILL WITH AN INK KEYLINE is the token-legal way to get emphasis (see
 * tokens.ts: accent is a fill only, always paired with accentEdge, and is
 * close to illegible as text on cream). No new hue was invented for this.
 *
 * IT ALSO CARRIES THE FINISHED-RENDER STATE. With Create out of the bar, the
 * dot that used to sit on that tab now sits on Wardrobe (see (tabs)/_layout),
 * and this banner is what it leads to — so when a freestyle look has landed
 * the banner says so and goes straight to it instead of to step 1.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { palette, border, radius } from '@/theme/tokens';

function Plus({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4v16M4 12h16"
        stroke={palette.ink}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CreateBanner({
  ready,
  onPress,
}: {
  /** A freestyle look has finished and has not been looked at. */
  ready?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        ready ? 'Your look is ready. Open it' : 'Freestyle a look from what you own'
      }
      style={({ pressed }) => [s.wrap, pressed && { opacity: 0.9 }]}
    >
      <View style={s.mark}>
        <Plus />
      </View>

      {/* The badge shares the SECOND line rather than taking a column of its
          own. Beside the headline it stole about a third of the width and the
          copy broke mid-phrase ("from what / you own"); on the sub line it
          fills space that was empty anyway. */}
      <View style={s.body}>
        <Text style={s.lede} numberOfLines={2}>
          {ready ? 'Your look is ready.' : 'Freestyle a look from what you own.'}
        </Text>
        <View style={s.subRow}>
          <Text style={s.sub} numberOfLines={1}>
            {ready ? "It's in the magazine." : 'Get it published in the magazine.'}
          </Text>
          {/* The rule, at the door rather than behind it. Not a warning — it
              is what makes the invitation worth taking today rather than
              whenever. */}
          <View style={s.badge}>
            <Text style={s.badgeLabel}>1 a day</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderWidth: border.mid,
    borderColor: palette.accentEdge,
    borderRadius: radius.sm,
    backgroundColor: palette.accent,
  },
  /** A cream disc so the plus reads as a button within the panel rather than
   *  as a mark printed on it. */
  mark: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  lede: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 14,
    lineHeight: 17,
    color: palette.ink,
  },
  sub: {
    flexShrink: 1,
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 15,
    color: palette.ink,
    opacity: 0.75,
  },
  badge: {
    /* Cream, not a hole in the accent — a transparent pill on the accent fill
       reads as a gap rather than a chip. */
    backgroundColor: palette.cream,
    borderWidth: border.hair,
    borderColor: palette.ink,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

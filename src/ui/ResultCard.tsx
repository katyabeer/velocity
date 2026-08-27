/**
 * Yesterday's result card, at the top of Today.
 *
 * Three states, because there are three things that can have happened:
 *   entered      you have a band
 *   judged-only  you have a calls read-out but no band
 *   missed       you have neither, and the card tells you what won instead
 *
 * The fourth state, `none`, is DAY ONE — and it renders nothing at all. Today
 * handles that by not mounting this component. There is deliberately no empty
 * state here.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border } from '@/theme/tokens';
import { LookPlate } from './LookPlate';
import type { YesterdayState } from '@/domain/clock';
import type { TestDay } from '@/config/testState';

export function ResultCard({
  state,
  day,
  onPress,
}: {
  state: YesterdayState;
  day: TestDay;
  onPress: () => void;
}) {
  if (state === 'none') return null;

  const config = {
    entered: {
      tint: 't2' as const,
      kick: day >= 3 ? "Yesterday's job · 41 entered" : 'Your first job · 41 entered',
      title: 'The interview',
      badge: 'Upper half',
      badgeTone: 'accent' as const,
      label: '·',
    },
    'judged-only': {
      tint: 't4' as const,
      kick: 'Yesterday · you judged only',
      title: 'The interview',
      badge: '6 of 7 close calls',
      badgeTone: 'dim' as const,
      label: '?',
    },
    missed: {
      tint: 't1' as const,
      kick: 'Yesterday · you missed it',
      title: 'The interview',
      badge: 'Won by a red bag',
      badgeTone: 'alert' as const,
      label: 'Won',
    },
  }[state];

  return (
    <Pressable onPress={onPress} style={s.card} accessibilityRole="button">
      <View style={{ width: 58 }}>
        <LookPlate
          tint={config.tint}
          occasion={config.title}
          height={73}
          label={config.label}
          showCaption={false}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.kick}>{config.kick}</Text>
        <Text style={s.title}>{config.title}</Text>
        <Text
          style={[
            s.badge,
            config.badgeTone === 'alert' && s.badgeAlert,
            config.badgeTone === 'dim' && s.badgeDim,
          ]}
        >
          {config.badge}
        </Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: border.hair,
    borderColor: palette.ink,
    backgroundColor: palette.paper,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  kick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9.6,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.faint,
  },
  title: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: 26,
    lineHeight: 24.7,
    textTransform: 'uppercase',
    color: palette.ink,
    marginTop: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 9,
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    lineHeight: 10,
    letterSpacing: 0.94,
    textTransform: 'uppercase',
    borderWidth: border.mid,
    borderColor: palette.klein,
    backgroundColor: palette.kleinTint,
    color: palette.klein,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  badgeAlert: {
    borderColor: palette.shock,
    backgroundColor: palette.shockTint,
    color: palette.shock,
  },
  badgeDim: { borderColor: palette.line, backgroundColor: palette.fill, color: palette.soft },
  chevron: { fontSize: 27, lineHeight: 27, color: palette.faint },
});

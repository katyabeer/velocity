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
import { dayResult } from '@/data/results';
import { yesterdayLooks } from '@/data/looks';
import type { YesterdayState } from '@/domain/clock';

export function ResultCard({ state, onPress }: { state: YesterdayState; onPress: () => void }) {
  if (state === 'none') return null;

  /**
   * ⚠ EVERY LITERAL THAT USED TO BE HERE NOW LIVES IN data/results.ts, and the
   * screen this card opens (`today/result.tsx`) reads the same fixture. They
   * are the summary and the detail of one result, so they always had to agree
   * and nothing made them — the job name alone was written three times in this
   * file and a fourth time over there.
   *
   * `day` came off the props with it: the only thing it decided was whether the
   * kicker said "your first job" or "yesterday's job", which is a property of
   * the result rather than of the day number.
   */
  const r = dayResult();

  const config = {
    entered: {
      tint: 't2' as const,
      kick: `${r.kickPrefix} · ${r.fieldSize} entered`,
      title: r.job,
      badge: r.band,
      badgeTone: 'accent' as const,
      label: '·',
    },
    'judged-only': {
      tint: 't4' as const,
      kick: 'Yesterday · you judged only',
      title: r.job,
      badge: r.closeCallsBadge,
      badgeTone: 'dim' as const,
      label: '?',
    },
    missed: {
      tint: 't1' as const,
      kick: 'Yesterday · you missed it',
      title: r.job,
      badge: r.wonBy,
      badgeTone: 'alert' as const,
      label: 'Won',
    },
  }[state];

  return (
    <Pressable onPress={onPress} style={s.card} accessibilityRole="button">
      <View style={{ width: 58 }}>
        {/* ⟲ A REAL PHOTOGRAPH SINCE 13 Sep, and it is THE SAME ONE the results
            screen shows next to the band (Katya's ask). This was a bare tinted
            plate with a `·` ghosted across it — on the one card whose whole
            subject is a look you made. The image comes off the fixture both
            screens read, so the card and the screen it opens cannot drift.

            `LookPlate` falls back to the ghost when `image` is undefined, so
            the `label` and `tint` below are still doing their job on any state
            whose pool has no frame at that index. */}
        <LookPlate
          tint={config.tint}
          occasion={config.title}
          image={yesterdayLooks()[r.yourLookIndex]?.image}
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
    backgroundColor: palette.cream,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  kick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9.6,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  title: {
    /** disp800 retired — see cards.tsx statValue for the same call. */
    fontFamily: 'Archivo_900Black',
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
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    color: palette.ink,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  /** No alert hue survives the v3 collapse — ink border, sunk ground. */
  badgeAlert: {
    borderColor: palette.ink,
    backgroundColor: palette.creamSunk,
    color: palette.ink,
  },
  badgeDim: { borderColor: palette.rule, backgroundColor: palette.creamSunk, color: palette.grey },
  chevron: { fontSize: 27, lineHeight: 27, color: palette.greyDecor },
});

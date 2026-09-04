/**
 * a7 · CHALLENGES — the month ahead. THE AVAILABILITY FIX.
 *
 * Publish the month's jobs, WITHHOLD THE ORDER. Browsing the magazine gets a
 * purpose without becoming shopping for tonight, and gap signals point at the
 * MONTH, never at today — so the anti-optimising invariant survives.
 *
 * The handover: "A can't ship without this."
 *
 * Note the hint at the bottom. It names what you are thin on across the twelve,
 * never what tonight needs. That distinction is the whole mechanism.
 */

import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Body, Tiny, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { LockIcon } from '@/ui/TabIcon';
import { palette, border } from '@/theme/tokens';
import { CHALLENGES } from '@/data/challenges';
import { useEconomy, tokenLabel } from '@/state/economy';

export default function Challenges() {
  const balance = useEconomy((s) => s.balance);

  return (
    <Screen>
      <LogoBlock title="Challenges" subtitle="Twelve this month, in no particular order" />

      <Scroll>
        <Body>
          You won&apos;t know which lands when. Worth a read anyway — it&apos;s how you work out what
          to go and keep from the magazine before you need it.
        </Body>

        <View style={{ marginTop: 16 }}>
          {CHALLENGES.map((c, i) => (
            <View key={c.name} style={[s.row, i === CHALLENGES.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={s.icon}>
                <LockIcon open={!!c.open} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.name, c.open && { color: palette.link }]}>{c.name}</Text>
                <Text style={s.note}>{c.note}</Text>
              </View>
              {c.open ? <Text style={s.tag}>open</Text> : <View style={{ width: 24 }} />}
            </View>
          ))}
        </View>

        <Tiny style={s.hint}>
          Looking at that lot, you are thin on tailoring and you own one pair of decent shoes.{' '}
          {balance > 0 ? (
            <>
              <B>{tokenLabel(balance)}</B> to spend if you want to fix that.
            </>
          ) : (
            'Judge tonight and you will have three tokens to fix that.'
          )}
        </Tiny>

        <Gap />
      </Scroll>

      <Foot>
        <Button label="Go and find things" onPress={() => router.push('/(tabs)/magazine')} />
      </Foot>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.creamSunk,
  },
  icon: { width: 18, paddingTop: 2 },
  name: { fontFamily: 'Archivo_600SemiBold', fontSize: 14, lineHeight: 16.8, color: palette.ink },
  note: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 16.7,
    color: palette.grey,
    marginTop: 4,
  },
  tag: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 7.5,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.link,
    paddingTop: 4,
  },
  hint: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
  },
});

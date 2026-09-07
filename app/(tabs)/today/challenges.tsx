/**
 * a7 · CHALLENGES — the month ahead. THE AVAILABILITY FIX.
 *
 * Publish the month's jobs, WITHHOLD THE ORDER. Browsing the magazine gets a
 * purpose without becoming shopping for tonight, and gap signals point at the
 * MONTH, never at today — so the anti-optimising invariant survives.
 *
 * The handover: "A can't ship without this."
 *
 * Note the hint at the bottom. It names what you are thin on across the month,
 * never what tonight needs. That distinction is the whole mechanism.
 *
 * A DEEPER SCREEN, NOT A TOP-LEVEL ONE (Katya, 4 Sep). It wore the `LogoBlock`
 * masthead that every tab home wears, which made it read as somewhere you had
 * arrived rather than somewhere you had gone — and it offered no way back
 * except the tab bar. It is pushed from Today's card, so it gets Today's
 * chevron: the in-flow `Header`, and back returns to the day.
 */

import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { PageTitle, Body, Tiny, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { LockIcon } from '@/ui/TabIcon';
import { palette, border } from '@/theme/tokens';
import { CHALLENGES } from '@/data/challenges';
import { useEconomy, tokenLabel } from '@/state/economy';

export default function Challenges() {
  const balance = useEconomy((s) => s.balance);

  return (
    <Screen>
      {/* NO TITLE IN THE BAR (Katya, 7 Sep) — the screen has a page title of
          its own now, three lines below. Same move as the day's flow on 4 Sep
          and Create's on the 7th: the bar keeps the chevron and the token
          badge, which are the only things on it that are not repetition. */}
      <Header
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/today'))}
      />

      <Scroll>
        {/* A PAGE TITLE IN THE BODY, matching `today/result.tsx` — the other
            screen you push into from the day and the other one that had its
            name in the chrome. */}
        <PageTitle>Upcoming challenges</PageTitle>

        {/* ⚠ "PINCH" IS KATYA'S WORD, 7 Sep, AND IT IS WORTH JACK SEEING.
            Invariant 18 is that the currency is TOKENS, "never keeps or
            pinches — including in variable names", because the naming is a
            regulatory position (R-G5): the prototype's own `S.pinch` was
            renamed for exactly this reason, and "pinches earned" is on the
            do-not-re-propose list. This sentence does not call a token a
            pinch, so it does not breach the letter of it — but it puts the
            word back on screen as the VERB for acquiring a garment, and the
            app's own verb everywhere else is TAKE ("Take it", "costs 1
            token"). One word, `take` for `pinch`, keeps the sentence and the
            position. Katya's call — built as asked.

            The two lines that came off with it: the derived count kicker
            ("14 this month, in no particular order", now said by the
            subheading) and "You won't know which lands when…", which spent
            three lines arguing for a screen the reader is already on. */}
        <Body style={{ marginTop: 8 }}>
          {'One a day. In no particular order.\nKnowing what’s coming may help you pinch the right items from the magazine.'}
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

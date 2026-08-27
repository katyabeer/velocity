/**
 * a2 · JUDGING — ten paired calls.
 *
 * A ROUND IS 10 PAIRS, NOT 20 LOOKS. Looks recur; a 14-look pool gives ten pairs
 * with each look appearing ~1.4×. (Reversed and not to be re-proposed.)
 *
 * NOTHING IS REVEALED WHILE YOU VOTE. No split, no running score, no "you and
 * 62% of the room". All of it is computed overnight, because showing it here
 * teaches people to pick the popular option — which is the consensus-
 * manufacturing the whole design exists to avoid.
 *
 * "Too close to call" is a real answer, not a skip. It counts as a call for the
 * quota and is weighted at half in settlement — see LOSS_FACTOR.
 *
 * The strip states the fact that makes this screen legitimate: entry closed at
 * 8pm, so seeing the field cannot change anyone's look, including yours.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Header, Screen, Scroll, Strip } from '@/ui/layout';
import { Bar, Button } from '@/ui/controls';
import { LookPair } from '@/ui/LookPlate';
import { TokenBadge } from '@/ui/TokenBadge';
import { Tiny } from '@/ui/text';
import { StyleSheet, Text } from 'react-native';
import { palette } from '@/theme/tokens';
import { JUDGING_LOOKS } from '@/data/looks';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { useEconomy } from '@/state/economy';

export default function Judging() {
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);
  const castCall = useEconomy((s) => s.castCall);

  const i = (callsCast * 2) % JUDGING_LOOKS.length;
  const left = JUDGING_LOOKS[i]!;
  const right = JUDGING_LOOKS[(i + 1) % JUDGING_LOOKS.length]!;

  const cast = () => {
    castCall();
    if (callsCast + 1 >= quota) router.replace('/(tabs)/today/settled');
  };

  return (
    <Screen>
      <Header
        onBack={() => router.back()}
        title={`Vote ${Math.min(callsCast + 1, quota)} of ${quota}`}
        right={<TokenBadge />}
      />

      <Strip
        kick="job 2 of 2 · entry closed 8pm"
        value="41 answers to it, yours among them. Results at 7am."
        right={`${Math.min(callsCast + 1, quota)}/${quota}`}
      />

      <Scroll bleed>
        <View style={s.q}>
          <Text style={s.qTitle}>{TONIGHTS_BRIEF.shortName}</Text>
          <Tiny>Which one works?</Tiny>
        </View>

        <LookPair
          left={{ tint: left.tint, occasion: left.occasion, pieces: left.pieces }}
          right={{ tint: right.tint, occasion: right.occasion, pieces: right.pieces }}
          onPick={cast}
        />

        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <Bar progress={callsCast / quota} />
          <Tiny style={{ marginTop: 9 }}>
            {callsCast === 0
              ? "The same job you just answered. Nobody can enter now, so seeing these can't change anyone's look — including yours."
              : `${quota - callsCast} to go. Mark anything you fancy on the way through; it lands when you finish.`}
          </Tiny>
        </View>
      </Scroll>

      <Foot>
        <Button label="Too close to call" variant="quiet" onPress={cast} />
      </Foot>
    </Screen>
  );
}

const s = StyleSheet.create({
  q: {
    marginHorizontal: 22,
    marginTop: 12,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  qTitle: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: 24,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

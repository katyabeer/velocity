/**
 * a2 · JUDGING — paired calls, one round (JUDGING_QUOTA — designed as 10,
 * temporarily 5 for test-scale sessions, see domain/economy.ts).
 *
 * A ROUND IS PAIRS, NOT INDIVIDUAL LOOKS. Looks recur — the 14-look Day 1
 * pool is walked two at a time by call index, so looks repeat across a
 * round rather than each appearing once. (Reversed and not to be
 * re-proposed: showing 2×quota distinct looks instead of a recurring pool.)
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

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Header, Screen, Scroll, Strip } from '@/ui/layout';
import { Bar, Button } from '@/ui/controls';
import { LookPair, type PickSide } from '@/ui/LookPlate';
import { Body, Tiny } from '@/ui/text';
import { palette } from '@/theme/tokens';
import { JUDGING_LOOKS } from '@/data/looks';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { useEconomy } from '@/state/economy';

export default function Judging() {
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);
  const castCall = useEconomy((s) => s.castCall);

  /** Which side has been committed to, while its plate flies out. Holding it
   *  here rather than inside LookPair is what lets the footer's tie button use
   *  the same exit — see the header note in ui/LookPlate.tsx. */
  const [leaving, setLeaving] = useState<PickSide | null>(null);

  const i = (callsCast * 2) % JUDGING_LOOKS.length;
  const left = JUDGING_LOOKS[i]!;
  const right = JUDGING_LOOKS[(i + 1) % JUDGING_LOOKS.length]!;

  /** The call only lands once the plate has left. Casting on touch would swap
   *  in the next pair mid-flight, so you would watch the wrong look fly away. */
  const settle = () => {
    setLeaving(null);
    castCall();
    if (callsCast + 1 >= quota) router.replace('/(tabs)/today/settled');
  };

  return (
    <Screen>
      <Header
        onBack={() => router.back()}
        title={`Vote ${Math.min(callsCast + 1, quota)} of ${quota}`}
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

        {/* Keyed on the call index: a new pair is a fresh mount, which is what
            resets the exit animation. */}
        <LookPair
          key={callsCast}
          left={{ tint: left.tint, occasion: left.occasion, pieces: left.pieces, image: left.image }}
          right={{ tint: right.tint, occasion: right.occasion, pieces: right.pieces, image: right.image }}
          leaving={leaving}
          onPick={setLeaving}
          onExitDone={settle}
        />

        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <Bar progress={callsCast / quota} />
          <Body style={{ marginTop: 9 }}>
            {callsCast === 0
              ? "The same job you just answered. Nobody can enter now, so seeing these can't change anyone's look — including yours."
              : `${quota - callsCast} to go. Mark anything you fancy on the way through; it lands when you finish.`}
          </Body>
        </View>
      </Scroll>

      <Foot>
        {/* A tie is a real answer, not a skip — so it gets the same exit, both
            plates going down together rather than one flying off. */}
        <Button
          label="Too close to call"
          variant="quiet"
          onPress={leaving ? undefined : () => setLeaving('tie')}
        />
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
    /** disp800 retired — the display face is onboarding-headline + button only now. */
    fontFamily: 'Archivo_900Black',
    fontSize: 24,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

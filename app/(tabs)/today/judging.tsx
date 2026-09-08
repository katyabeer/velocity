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
import { Body } from '@/ui/text';
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
      {/* ══ NO TITLE IN THE BAR (Katya, 4 Sep) ══
          Every screen of the day's flow had one — "Pick your pieces",
          "Preview your look", "Who wears it", "In · can't be changed", "Vote 1
          of 5" — and every one of them restated something the screen already
          said louder. The step ribbon names the step, and each screen leads
          with its own heading. The bar keeps the chevron and the token badge,
          which are the only things on it that are not repetition. */}
      {/* The vote count is NOT lost with the title — the strip below carries
          it, on the right. */}
      <Header onBack={() => router.back()} />

      {/* "41 answers to it, yours among them." came off (Katya, 4 Sep). The
          field's size is not something a voter needs while voting — it frames
          the round as a scale to be got through rather than a pair to be
          read — and the count was a fixture anyway. The result time stays,
          because it is the one fact about what happens after. */}
      <Strip
        kick="job 2 of 2 · entry closed 8pm"
        value="Results at 7am."
        right={`${Math.min(callsCast + 1, quota)}/${quota}`}
      />

      <Scroll bleed>
        {/* SWAPPED AND CENTRED (Katya, 4 Sep). The question was underneath the
            challenge name in body copy; it is now the headline, in the display
            treatment the challenge name had, with the challenge name demoted
            beneath it.

            That is the right way round: the challenge name is CONSTANT for the
            whole round — ten pairs of the same job — so setting it largest
            made the loudest thing on screen the one thing that never changes.
            The question is what each pair is actually asking. Centred, because
            the two plates below it are symmetrical and a left-aligned title
            over a symmetrical pair pulls the eye off the axis the comparison
            happens on. */}
        <View style={s.q}>
          <Text style={s.qAsk}>Which one works better?</Text>
          <Text style={s.qTitle}>{TONIGHTS_BRIEF.shortName}</Text>
        </View>

        {/* Keyed on the call index: a new pair is a fresh mount, which is what
            resets the exit animation. */}
        {/* NO CAPTIONS ON THE PLATES (Katya, 7 Sep). Each one carried the
            occasion as a kicker and then the full piece list — five garment
            names in an accent-filled block over the bottom of the photograph,
            twice, on every one of the round's pairs. Three things wrong with
            it: the occasion is the same on both plates and already stated
            above them, the piece list is a spec sheet under a question that
            asks which look WORKS, and reading two of them is most of the
            work on a screen that wants a glance and a tap.

            `pieces` is no longer passed at all — see LookPair's props. */}
        <LookPair
          key={callsCast}
          left={{ tint: left.tint, occasion: left.occasion, image: left.image }}
          right={{ tint: right.tint, occasion: right.occasion, image: right.image }}
          leaving={leaving}
          onPick={setLeaving}
          onExitDone={settle}
        />

        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <Bar progress={callsCast / quota} />
          {/* Katya's copy, 7 Sep. What it replaced, twice over: the first-pair
              line arguing the anti-copying rule at someone who had not asked,
              and then "N to go. Mark anything you fancy on the way through; it
              lands when you finish." — a progress read the black strip's 1/5
              and the bar directly above it both already give.

              This one says whose looks these are and that the exchange goes
              both ways, which is the thing onboarding never manages to state
              (open question D) and the only fact on the screen a first-time
              voter is actually missing.

              THE 7am SENTENCE CAME OFF (Katya, 7 Sep), which closes the
              duplication flagged when this copy landed: the black strip at
              the top of this screen already says "Results at 7am." and it is
              permanent, so the prose repeating it was the redundant half.

              ⚠ ONE TYPO FIXED: "This is what other have submitted" → "otherS
              have". Corrected rather than shipped. */}
          <Body style={{ marginTop: 9 }}>
            This is what others have submitted for the same styling brief. Vote on their looks
            whilst they vote on yours!
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
  q: { marginHorizontal: 22, marginTop: 12, marginBottom: 11, alignItems: 'center' },
  /** The question now wears the display treatment the challenge name had —
   *  same face, same size, same caps. Nothing new was invented for it; the two
   *  simply swapped places. */
  qAsk: {
    /** disp800 retired — the display face is onboarding-headline + button only now. */
    fontFamily: 'Archivo_900Black',
    fontSize: 24,
    lineHeight: 27,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: palette.ink,
  },
  /**
   * Which job these pairs belong to. Still quieter than the question above it
   * — the question is what each pair asks and the job is constant for the
   * whole round — but BIGGER (Katya, 7 Sep): at 13px it read as a caption on
   * the headline rather than as the challenge, and the plates' own captions
   * used to say the occasion twice below it. Now this is the only place the
   * job is named on the screen, so it has to look like the job.
   *
   * 19 with the italic Archivo of `T.lede`, which is the challenge title's
   * voice everywhere else — the Today card and the builder's brief both set it
   * that way. Grey rather than ink keeps it under the question.
   */
  qTitle: {
    marginTop: 7,
    fontFamily: 'Archivo_500Medium_Italic',
    fontSize: 19,
    lineHeight: 24,
    textAlign: 'center',
    color: palette.grey,
  },
});

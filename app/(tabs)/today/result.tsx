/**
 * a12 · HOW YOU DID — the band, what beat you, your calls.
 *
 * THE RESULT IS A REVIEW, NOT A SCORE. A named band, never a number, plus what
 * beat you and how your calls went.
 *
 * Three things on this screen, in this order, and the order is the argument:
 *   1. your band, with the ladder underneath so it has a scale
 *   2. WHAT BEAT YOU — specific, and drawn from YOUR OWN TENURE GROUP, or the
 *      day-one fairness fix undoes itself in a single glance
 *   3. YOUR CALLS — how you read the room, which is the actual skill
 *
 * The copy "Never a number — 20 comparisons can't carry one" is not a hedge. It
 * is the design's honest statement about its own resolution, and it is why there
 * is no percentage anywhere on this screen except the bands' definitions.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Body, H2, Kick, Num, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { BandLadder, Card, Stat } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { palette } from '@/theme/tokens';
import { JUDGING_QUOTA } from '@/domain/economy';
import { useSession } from '@/state/session';

export default function Result() {
  const day = useSession((s) => s.day);

  return (
    <Screen>
      <Header
        onBack={() => router.back()}
        title={day >= 3 ? 'Yesterday · the interview' : 'Yesterday · your first job'}
        right={<Tiny>41 entered</Tiny>}
      />

      <Scroll>
        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
          <View style={{ width: 116 }}>
            <LookPlate
              tint="t2"
              occasion="Interview · clean"
              pieces="trench · shell · straight leg · loafer · tote"
              height={146}
              label="Your look"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Kick>you placed</Kick>
            <H2 size={30} style={{ marginTop: 6 }}>
              {'Upper\nhalf'}
            </H2>
            <Tiny style={{ marginTop: 7 }}>
              Above the middle of people who started around when you did. Never a number — 20
              comparisons can&apos;t carry one.
            </Tiny>
          </View>
        </View>

        <Kick style={{ marginTop: 16 }}>the bands</Kick>
        <View style={{ marginTop: 6 }}>
          <BandLadder active="upperHalf" />
        </View>
        <Tiny style={{ marginTop: 7 }}>
          Five bands, always relative to people who started when you did.
        </Tiny>

        <Kick style={{ marginTop: 17 }}>what beat you</Kick>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'flex-start' }}>
          <View style={{ width: 100 }}>
            <LookPlate tint="t5" occasion="Top of the room" pieces="grey suit · red bag" height={126} label="·" />
          </View>
          <View style={{ flex: 1 }}>
            <Body>
              Four of your five pieces were identical to the winner&apos;s. The bag did it — theirs
              was red, yours was the tote.
            </Body>
            <Tiny
              color={palette.link}
              style={{ marginTop: 8, fontFamily: 'Archivo_700Bold' }}
              onPress={() => router.push('/(tabs)/magazine')}
            >
              Find it in the magazine →
            </Tiny>
          </View>
        </View>

        <Kick style={{ marginTop: 17 }}>your calls</Kick>
        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'baseline' }}>
            <Num size={38}>{Math.min(3, JUDGING_QUOTA)}</Num>
            <Body style={{ flex: 1 }}>
              of the {JUDGING_QUOTA} pairs you judged, you picked the look that finished ahead.
            </Body>
          </View>
          <View style={{ marginTop: 10 }}>
            <Stat label="On the three closest pairs" value="2 of 3" />
            <Stat label="The look that won the room" value="You backed it" last />
          </View>
        </Card>

        <Gap />
      </Scroll>

      <Foot>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Button
            label="Your progress"
            variant="quiet"
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/you')}
          />
          <Button
            label="Today's job"
            variant="quiet"
            style={{ flex: 1 }}
            onPress={() => router.back()}
          />
        </View>
      </Foot>
    </Screen>
  );
}

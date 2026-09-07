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
import { H2, PageTitle, Body, Tiny, Num, Kick } from '@/ui/text';
import { Button } from '@/ui/controls';
import { BandLadder, Card, Stat } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { palette } from '@/theme/tokens';
import { JUDGING_QUOTA } from '@/domain/economy';
import { useSession } from '@/state/session';
import { JUDGING_LOOKS } from '@/data/looks';

/**
 * REAL PHOTOGRAPHS, not the grey plates (Katya, 4 Sep). Both were `LookPlate`
 * placeholders — a tinted box with the word "Your look" ghosted across it —
 * on the one screen whose whole job is to show you what happened.
 *
 * Drawn from the judging fixtures so they are looks the room actually saw. The
 * WINNER is picked from the `strong` tier, which is the closest the fixtures
 * come to "this one placed well"; yours is a different entry so the two are
 * never the same photograph.
 *   ⚠ Both are FIXTURES. There is no per-look settled record (Jack's open
 *   question 5), so nothing here is your actual entry.
 */
const YOUR_LOOK = JUDGING_LOOKS[3]!;
const THE_WINNER = JUDGING_LOOKS.find((l) => l.tier === 'strong')!;

export default function Result() {
  const day = useSession((s) => s.day);

  return (
    <Screen>
      {/* BARE CHEVRON (Katya, 4 Sep). The header carried the job's name and the
          field size — "Yesterday · your first job" with "41 entered" out to the
          right — which made the top of the screen the busiest part of it and
          left the screen itself untitled. Both moved into the page title
          below, where they have room to be read. */}
      <Header onBack={() => router.back()} />

      <Scroll>
        <PageTitle>Your results</PageTitle>
        {/* The field size, demoted from the header. It is context for the band
            underneath — "upper half" of what — so it belongs with the title
            rather than in the chrome. */}
        <Tiny style={{ marginTop: 6 }}>
          {day >= 3 ? 'The interview' : 'Your first job'} · 41 entered
        </Tiny>

        {/* THE PHOTOGRAPH SITS RIGHT OF THE TEXT (Katya, 4 Sep), and it is a
            real look now rather than the grey `Your look` placeholder. The band
            is the thing being announced, so it reads first at the left margin;
            the picture is the evidence and follows it. */}
        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start', marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Kick>you placed</Kick>
            <H2 size={30} style={{ marginTop: 6 }}>
              {'Upper\nhalf'}
            </H2>
            <Body style={{ marginTop: 7 }}>
              Above the middle of people who started around when you did. Never a number — 20
              comparisons can&apos;t carry one.
            </Body>
          </View>
          <View style={{ width: 116 }}>
            <LookPlate
              tint="t2"
              occasion="Your look"
              image={YOUR_LOOK.image}
              height={146}
              showCaption={false}
            />
          </View>
        </View>

        <Kick style={{ marginTop: 16 }}>the bands</Kick>
        <View style={{ marginTop: 6 }}>
          <BandLadder active="upperHalf" />
        </View>
        <Body style={{ marginTop: 7 }}>
          Five bands, always relative to people who started when you did.
        </Body>

        <Kick style={{ marginTop: 17 }}>what beat you</Kick>
        {/* Same order as the band above: the explanation first, the winning
            look to the right of it. A photograph leading a paragraph about why
            it won reads as a caption on the picture rather than a point about
            your own entry. */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'flex-start' }}>
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
          <View style={{ width: 100 }}>
            <LookPlate
              tint="t5"
              occasion="Top of the room"
              image={THE_WINNER.image}
              height={126}
              showCaption={false}
            />
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

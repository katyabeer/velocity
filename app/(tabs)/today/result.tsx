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
 * ⟲ "Never a number — 20 comparisons can't carry one" CAME OFF 13 Sep, and
 * this comment used to defend it: not a hedge, the design's honest statement
 * about its own resolution, and the reason no percentage appears here except
 * the bands' own definitions.
 *
 * ⚠ THE RULE IT STATED IS UNCHANGED AND STILL ENFORCED — invariant 6, named
 * bands and never numbers. What went is the screen SAYING SO. Worth knowing
 * that the argument is now made only by the absence of a figure, so the next
 * person to reach for "you placed 9th of 38" has nothing on the page telling
 * them not to. `BANDS` in domain/bands.ts carries the reasoning.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { H2, PageTitle, Body, Tiny, Num, Kick, Link } from '@/ui/text';
import { Button } from '@/ui/controls';
import { BandScale, Card, Reach } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { JUDGING_QUOTA } from '@/domain/economy';
import { yesterdayLooks } from '@/data/looks';
import { dayResult } from '@/data/results';
import { REACTIONS_CAPTION } from '@/domain/you';

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
export default function Result() {
  /* ⚠ ONE FIXTURE, SHARED WITH THE CARD THAT OPENS THIS SCREEN. Every number
     and sentence below used to be written here AND again in ui/ResultCard.tsx,
     with nothing keeping the summary and the detail of one result in step. See
     data/results.ts. */
  const r = dayResult();

  /**
   * ⚠ `yesterdayLooks()`, NOT `judgingLooks()` — see that accessor in
   * data/looks.ts. This screen is about the job that SETTLED, and on the
   * returning state that is the autumn wedding while tonight's field is the
   * office; the judging pool put a man in an office lobby under "you placed
   * Upper quarter" on an autumn wedding.
   *
   * ⟲ The indices moved onto the fixture too. They were `POOL[3]` and
   * `find(tier === 'strong')` computed here at module scope, so the result card
   * had no way to show the same photograph as the screen it opens.
   */
  const pool = yesterdayLooks();
  const yourLook = pool[r.yourLookIndex];
  const theWinner = pool[r.winnerLookIndex];

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
          {r.job} · {r.fieldSize} entered
        </Tiny>

        {/* THE PHOTOGRAPH SITS RIGHT OF THE TEXT (Katya, 4 Sep), and it is a
            real look now rather than the grey `Your look` placeholder. The band
            is the thing being announced, so it reads first at the left margin;
            the picture is the evidence and follows it. */}
        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start', marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Kick>you placed</Kick>
            <H2 size={30} style={{ marginTop: 6 }}>
              {r.bandLines}
            </H2>
            <Body style={{ marginTop: 7 }}>{r.bandNote}</Body>
          </View>
          <View style={{ width: 116 }}>
            <LookPlate
              tint="t2"
              occasion="Your look"
              image={yourLook?.image}
              height={146}
              showCaption={false}
            />
          </View>
        </View>

        <Kick style={{ marginTop: 16 }}>the bands</Kick>
        {/* ⟲ `BandLadder` -> `BandScale`, 14 Sep. Five equal rows became one
            bar drawn to each band's real share of the room, with a caret over
            yours. See the component — the short version is that the bands are
            not five equal boxes and the ladder could only say so in words. */}
        <View style={{ marginTop: 8 }}>
          <BandScale active={r.bandKey} />
        </View>
        {/* ⟲ "Five bands, always relative to people who started when you did."
            came off 13 Sep. The ladder draws all five and labels its own
            ranges, so the count was a caption on a thing you can count. The
            COHORT half is still said once, in `bandNote` above — "people who
            started around when you did" — which is where it matters, next to
            the band you actually got. */}

        {/* ══ WHAT THE ROOM DID WITH IT ══
            Katya, 14 Sep. It sits after the band because it is a different
            question — the band is how the look PLACED against the brief, and
            these three are what happened once the magazine surfaced it.

            ⚠ `likes` IS A SUBSET OF `reactions` (the heart is `thumbs_up` in
            the nine-value vocabulary), so the order matters: the total has to
            follow the part or the pair reads as two separate tallies that
            happen not to add up. See data/results.ts. */}
        <Kick style={{ marginTop: 17 }}>in the magazine</Kick>
        <View style={{ marginTop: 8 }}>
          <Reach
            items={[
              { value: String(r.likes), label: 'likes' },
              { value: String(r.reactions), label: 'reactions in all' },
              { value: String(r.takers), label: 'took a piece' },
            ]}
          />
        </View>
        {/* The honest frame, and it is the existing one — the same line the
            You screen prints over its reaction figures. Reactions are not a
            score and this is the screen most likely to be read as one. */}
        <Tiny style={{ marginTop: 9 }}>{REACTIONS_CAPTION}</Tiny>

        <Kick style={{ marginTop: 17 }}>what beat you</Kick>
        {/* Same order as the band above: the explanation first, the winning
            look to the right of it. A photograph leading a paragraph about why
            it won reads as a caption on the picture rather than a point about
            your own entry. */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Body>{r.beatYou}</Body>
            <Link
              style={{ marginTop: 8 }}
              onPress={() => router.push('/(tabs)/magazine')}
            >
              Find it in the magazine →
            </Link>
          </View>
          <View style={{ width: 100 }}>
            <LookPlate
              tint="t5"
              occasion="Top of the room"
              image={theWinner?.image}
              height={126}
              showCaption={false}
            />
          </View>
        </View>

        <Kick style={{ marginTop: 17 }}>your calls</Kick>
        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'baseline' }}>
            <Num size={38}>{Math.min(r.callsAhead, JUDGING_QUOTA)}</Num>
            <Body style={{ flex: 1 }}>
              of the {JUDGING_QUOTA} pairs you judged, you picked the look that finished ahead.
            </Body>
          </View>
          {/* ⟲ TWO `Stat` ROWS CAME OFF HERE, 13 Sep — "On the three closest
              pairs · 1 of 3" and "The look that won the room · You backed it".
              The section is one number and one sentence now, which is the
              shape the rest of this screen uses.

              ⚠ `Stat` has NO OTHER CALLER in the app. Kept in ui/cards.tsx
              because it is the one component that sets a value which is a
              SENTENCE rather than a figure — `StatGrid` on You cannot do that,
              it is built to make the number the thing you see. */}
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

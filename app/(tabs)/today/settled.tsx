/**
 * a4 · TODAY'S CHALLENGE COMPLETE — the tokens land. Rebuilt 3 Sep to Katya's
 * mockup.
 *
 * MARK-THEN-MINT: this is the only place +3 appears, because finishing the
 * round is the only thing that mints it. Pinching used to mint on the spot, so
 * you could cast one vote, take three pieces and leave — 2 comparisons supplied
 * for 3 pieces, against a full round's worth for the same 3 if you finished.
 *
 * "Nothing else is asked of you tonight." Sixty seconds can be a habit;
 * ninety-plus is a chore. The screen's job is to end the day cleanly and point
 * at the magazine, not to open a second loop.
 *
 * TWO WAYS OUT, AND THIS SCREEN DOES NOT KEEP YOU (Katya, 3 Sep). It used to be
 * a cul-de-sac: the magazine button led away, and there was nothing else — not
 * even the Today tab, which did nothing at all (see today/_layout.tsx for why).
 *
 * `dismissTo`, not `replace`. It pops back to the day's index rather than
 * stacking another copy of it on top, so leaving here unwinds the whole
 * evening's chain — build, render, judge, settled — instead of burying it. The
 * state you land on is the job card's own, which already knows the difference
 * between a render still going ("Building your look") and one that has landed
 * ("Challenge complete"); this screen does not need to tell it which.
 *
 * TWO DELIBERATE DEVIATIONS FROM HOUSE RULES, both from the mockup:
 *
 *  · NO HEADER AND NO TOKEN BADGE. Every other screen carries the badge top
 *    right. Here the entire body of the screen is the token count, twice, at
 *    47px — a third, smaller copy of the same number in the corner is noise.
 *    ⚠ Katya, say if you'd rather keep the badge for consistency.
 *
 *  · THE DISPLAY FACE. type.ts reserves Big Shoulders Display for "the
 *    onboarding headline and buttons, nothing else". The mockup uses it for
 *    this headline, which reads as the right call — finishing your first
 *    challenge is the same register as onboarding, not in-app chrome — but it
 *    does widen that rule by one screen. Flagged rather than assumed.
 *
 * The mockup's panel is pink. There is no pink, and no alert hue at all, since
 * the v3 token collapse (see tokens.ts) — accent fill with its ink keyline is
 * the token-legal way to get the same emphasis, and is what the Tip and
 * milestone components already use.
 */

import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Screen, Scroll } from '@/ui/layout';
import { Hero, Big, Body, Tiny, Kick } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Card } from '@/ui/cards';
import { palette, border } from '@/theme/tokens';
import { DAY_ONE_ENTRY_GRANT, TOKENS_PER_JUDGING_ROUND } from '@/domain/economy';
import { COMPARISONS_TO_SETTLE, DISTINCT_RATERS_TO_SETTLE } from '@/domain/settlement';
import { useEconomy, tokenLabel } from '@/state/economy';
import { useRenderStatus } from '@/state/submission';

export default function Settled() {
  const balance = useEconomy((s) => s.balance);
  const overnight = useEconomy((s) => s.overnightTokens);
  const entryGrantTaken = useEconomy((s) => s.entryGrantTaken);
  const renderStatus = useRenderStatus('brief');

  /* Where the balance came from, in the order it arrived. Only ever states
     what actually happened — a first-day tester's six is three for the round
     and three for entering, and saying "three for judging" alone would leave
     them to wonder about the other three. */
  const provenance = [
    `${TOKENS_PER_JUDGING_ROUND} for finishing the round`,
    entryGrantTaken ? `${DAY_ONE_ENTRY_GRANT} for entering your first look` : null,
    overnight ? `${overnight} from people taking your pieces` : null,
  ].filter(Boolean);

  return (
    <Screen>
      <Scroll contentStyle={{ paddingTop: 30 }}>
        <Hero size={47}>{'Today’s\nchallenge\ncomplete!'}</Hero>

        <View style={s.unlocked}>
          <Kick tone="alert">you unlocked</Kick>
          <View style={s.unlockedRow}>
            <Big size={47} style={s.plus}>
              +{TOKENS_PER_JUDGING_ROUND}
            </Big>
            <Big size={26}>tokens</Big>
          </View>
          <Tiny color={palette.ink} style={{ marginTop: 6 }}>
            {tokenLabel(balance)} to spend in the magazine!
          </Tiny>
          {provenance.length > 1 ? (
            <Tiny color={palette.ink} style={{ marginTop: 4 }}>
              {provenance.join(' · ')}.
            </Tiny>
          ) : null}
        </View>

        <Card style={{ marginTop: 18 }}>
          <Kick tone="muted">what happens now</Kick>
          <Body style={{ marginTop: 5 }}>
            {/* The mockup says "twenty people", which conflates the two
                settlement thresholds — twenty is COMPARISONS, and the people
                floor is twelve. Both numbers, correctly, rather than one
                number wrongly. */}
            {DISTINCT_RATERS_TO_SETTLE} people compare your look with someone else&apos;s,{' '}
            {COMPARISONS_TO_SETTLE} times between them. When they have, it settles — and you hear
            at 7am, along with tomorrow&apos;s job.
          </Body>
        </Card>

        <Tiny style={s.closing}>
          {/* Reads the real render clock, not the day — a slow tester may
              well have finished voting after the minute was up. */}
          {renderStatus === 'pending'
            ? 'Nothing else is asked of you tonight. Your look is still rendering — Today will let you know when it lands.'
            : 'Nothing else is asked of you tonight.'}
        </Tiny>

        <Gap />
      </Scroll>

      <Foot>
        <Button label="Go to the magazine" onPress={() => router.push('/(tabs)/magazine')} />
        {/* The magazine is the recommended next thing, so it keeps the accent
            fill; this is the quieter way out. */}
        <Button
          label="Return to the challenges"
          variant="ghost"
          style={{ marginTop: 8 }}
          onPress={() => router.dismissTo('/(tabs)/today')}
        />
      </Foot>
    </Screen>
  );
}

const s = StyleSheet.create({
  unlocked: {
    marginTop: 24,
    borderWidth: border.mid,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    padding: 16,
  },
  unlockedRow: { flexDirection: 'row', gap: 12, alignItems: 'baseline', marginTop: 8 },
  /** Not italic: the numeral is the fact, the word beside it is the voice.
   *  Archivo Black matches the mockup's weight on the figure. */
  plus: { fontFamily: 'Archivo_900Black', fontStyle: 'normal' },
  closing: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
  },
});

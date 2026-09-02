/**
 * a1 · TODAY — the day's spine.
 *
 * THE ORDER IS FIXED, AND WAS CORRECTED ONCE:
 *   ACT 1  yesterday's result — FIRST, because it is the reason you came back
 *   ACT 2  today's job — the hero, as one unit
 *   ACT 3  the month ahead — low down
 *
 * ON DAY 1 ACT 1 IS ABSENT ENTIRELY. Not an empty state — absent, so the job
 * card leads. The overnight-token roundel is hidden for the same reason: a zero
 * there would be a lie.
 *
 * The primary button changes with the phase, not with the screen. During entry
 * it builds; after 20:00 it judges. There is never a moment where both are
 * offered, because the clock does not allow it.
 */

import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Big, Body, Kick, Tiny, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Card, EarnedRow, Tip } from '@/ui/cards';
import { StepRibbon, type Step } from '@/ui/StepRibbon';
import { ResultCard } from '@/ui/ResultCard';
import { palette } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { useSession, TIPS, TIP_LEAD } from '@/state/session';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { MAX_PIECES } from '@/domain/entry';

export default function Today() {
  const day = useSession((s) => s.day);
  const phase = useSession((s) => s.phase);
  const yesterday = useSession((s) => s.yesterday);
  const tipDismissed = useSession((s) => s.dismissedTips.today);
  const dismissTip = useSession((s) => s.dismissTip);

  const cfg = dayConfig(day);
  const picks = useEntry((s) => s.picks);
  const entered = useEntry((s) => s.entered);
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);
  const overnight = useEconomy((s) => s.overnightTokens);

  const judged = callsCast >= quota;

  const steps: Step[] = [
    {
      label: 'Build',
      hint: entered ? 'entered' : `${picks.length} of ${MAX_PIECES}`,
      state: entered ? 'done' : phase === 'entry' ? 'now' : 'todo',
    },
    {
      label: 'Judge',
      hint: phase === 'judging' ? `${callsCast} of ${quota}` : 'from 8pm',
      state: judged ? 'done' : phase === 'judging' ? 'now' : 'todo',
    },
    { label: 'Result', hint: '7am', state: judged ? 'now' : 'todo' },
  ];

  const primary = (() => {
    if (phase === 'entry') {
      return entered
        ? { label: 'Entered · judging opens at 8pm', variant: 'off' as const, onPress: undefined }
        : {
            label: "Build tonight's look",
            variant: 'solid' as const,
            onPress: () => router.push('/(tabs)/today/build'),
          };
    }
    if (judged) return { label: 'Judged · result at 7am', variant: 'off' as const, onPress: undefined };
    return {
      label: callsCast === 0 ? "Judge tonight's drinks" : `Keep judging · ${quota - callsCast} to go`,
      variant: 'solid' as const,
      onPress: () => router.push('/(tabs)/today/judging'),
    };
  })();

  return (
    <Screen>
      <LogoBlock title="Today's challenge" />

      <Scroll>
        {/* ── ACT 1 · yesterday. Absent entirely on day one. ── */}
        {yesterday !== 'none' ? (
          <>
            <ResultCard state={yesterday} day={day} onPress={() => router.push('/(tabs)/today/result')} />
            {cfg.showOvernightRoundel ? (
              <View style={{ marginTop: 15 }}>
                <EarnedRow count={overnight} />
              </View>
            ) : null}
          </>
        ) : null}

        {/* ── ACT 2 · today, as one unit ── */}
        <Card ink style={{ padding: 15, marginTop: yesterday === 'none' ? 0 : 18 }}>
          <Kick>
            {phase === 'entry' ? "today's job · open until 8pm" : "today's job · closed, now judging"}
          </Kick>
          <Big style={{ marginTop: 7 }}>{TONIGHTS_BRIEF.title}</Big>

          {phase === 'entry' ? (
            <Body style={{ marginTop: 8 }}>
              Effortless, and not too pleased with yourself. Five pieces. At 8pm the job shuts and
              everyone judges what came in — including you.
            </Body>
          ) : (
            <Body style={{ marginTop: 8 }}>
              Entry closed at 8pm with <B>41 looks</B> in. Nobody can enter now, so you can see the
              field without it changing anyone&apos;s answer. Ten calls settles it.
            </Body>
          )}

          <StepRibbon steps={steps} style={{ marginTop: 14 }} />

          {!tipDismissed ? (
            <Tip
              lead={TIP_LEAD.today}
              body={TIPS.today.replace(TIP_LEAD.today, '').trim()}
              onDismiss={() => dismissTip('today')}
            />
          ) : null}

          <Button
            label={primary.label}
            variant={primary.variant}
            onPress={primary.onPress}
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* ── ACT 3 · low down. The availability fix. ── */}
        <Pressable
          onPress={() => router.push('/(tabs)/today/challenges')}
          style={{ marginTop: 14 }}
          accessibilityRole="link"
        >
          <Tiny color={palette.link} style={{ fontFamily: 'Archivo_700Bold' }}>
            See the other eleven jobs coming this month →
          </Tiny>
          <Tiny color={palette.grey}>
            You won&apos;t know when each lands, so it&apos;s worth knowing what&apos;s in the pile.
          </Tiny>
        </Pressable>

        <Gap />
      </Scroll>

      {/* No footer on Today — the job card owns the primary action, because the
          job IS the screen. Adding a sticky CTA here would compete with it. */}
      <Foot style={{ paddingTop: 0, paddingBottom: 0 }} />
    </Screen>
  );
}

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
 *
 * ─── THE JOB CARD NOW HAS FOUR STATES (Katya, 3 Sep) ────────────────────────
 * The render is asynchronous, so the card is where its progress lives — that is
 * what replaced the status chip that used to float in every screen's header
 * (see state/submission.ts). The card is the one place in the app where the
 * job's state belongs, and the only place the render matters.
 *
 *   open       nothing entered. The brief, and a button that builds.
 *   entered    in, but the round is not finished. Judging is the primary
 *              action; the render's progress is reported, not acted on.
 *   building   in and judged, render still going. "Building your look."
 *   complete   in, judged, render landed. "Challenge complete", and the
 *              primary action is to go and look at it.
 *
 * The strip itself is ui/RenderStrip.tsx, shared with Create.
 *
 * Rendering and judging are tracked SEPARATELY on purpose. They overlap in
 * practice — the minute of render runs while you vote — and collapsing them
 * into one progress read would mean the card either lies about the render or
 * lies about the round.
 */

import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Big, Body, Kick, Tiny, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Card, EarnedRow, Tip } from '@/ui/cards';
import { StepRibbon, type Step } from '@/ui/StepRibbon';
import { ResultCard } from '@/ui/ResultCard';
import { RenderStrip } from '@/ui/RenderStrip';
import { palette } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { useSession, TIPS, TIP_LEAD } from '@/state/session';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { useRenderStatus } from '@/state/submission';
import { MAX_PIECES } from '@/domain/entry';

type CardState = 'open' | 'entered' | 'building' | 'complete';

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
  const renderStatus = useRenderStatus('brief');

  const judged = callsCast >= quota;
  const seeLook = () => router.push('/(tabs)/today/entered');

  const state: CardState = !entered
    ? 'open'
    : !judged
      ? 'entered'
      : renderStatus === 'ready'
        ? 'complete'
        : 'building';

  const steps: Step[] = [
    {
      label: 'Build',
      hint: entered ? 'entered' : `${picks.length} of ${MAX_PIECES}`,
      state: entered ? 'done' : phase === 'entry' ? 'now' : 'todo',
    },
    {
      label: 'Judge',
      hint: judged ? 'done' : phase === 'judging' ? `${callsCast} of ${quota}` : 'from 8pm',
      state: judged ? 'done' : phase === 'judging' ? 'now' : 'todo',
    },
    { label: 'Result', hint: '7am', state: judged ? 'now' : 'todo' },
  ];

  /** Kicker, headline and body, per state. The headline is the thing Katya
   *  asked for by name: the card says which of the four it is, in words. */
  const heading = {
    open: {
      kick: phase === 'entry' ? "today's job · open until 8pm" : "today's job · closed, now judging",
      title: TONIGHTS_BRIEF.title,
    },
    entered: { kick: "today's job · you're in", title: TONIGHTS_BRIEF.title },
    building: { kick: "today's job · done", title: 'Building your look.' },
    complete: { kick: "today's job · done", title: 'Challenge complete.' },
  }[state];

  const primary = (() => {
    if (state === 'open') {
      if (phase === 'entry')
        return {
          label: "Build tonight's look",
          variant: 'solid' as const,
          onPress: () => router.push('/(tabs)/today/build'),
        };
      return {
        label: callsCast === 0 ? "Judge tonight's looks" : `Keep judging · ${quota - callsCast} to go`,
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/judging'),
      };
    }
    if (state === 'entered')
      return {
        label: callsCast === 0 ? 'Last step · vote on tonight’s looks' : `Keep voting · ${quota - callsCast} to go`,
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/judging'),
      };
    if (state === 'building')
      return { label: 'Result at 7am', variant: 'off' as const, onPress: undefined };
    return { label: 'See your look', variant: 'solid' as const, onPress: seeLook };
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
          <Kick>{heading.kick}</Kick>
          <Big style={{ marginTop: 7 }}>{heading.title}</Big>

          {state === 'open' ? (
            phase === 'entry' ? (
              <Body style={{ marginTop: 8 }}>
                {TONIGHTS_BRIEF.note} Up to {MAX_PIECES} pieces. At 8pm the job shuts and everyone
                judges what came in — including you.
              </Body>
            ) : (
              <Body style={{ marginTop: 8 }}>
                Entry closed at 8pm with <B>41 looks</B> in. Nobody can enter now, so you can see
                the field without it changing anyone&apos;s answer.
              </Body>
            )
          ) : (
            <Body style={{ marginTop: 8 }}>
              {state === 'entered'
                ? 'Your look is in and nothing can change it. One thing left tonight.'
                : state === 'building'
                  ? 'That’s the whole job done. We’re putting your look on a model now — it takes about a minute, and you don’t have to wait for it.'
                  : 'That’s the whole job done, and your look is rendered. The room settles it overnight; the result lands at 7am with tomorrow’s job.'}
            </Body>
          )}

          {/* The render read-out, from entry until it has been looked at. */}
          {entered && renderStatus !== 'none' ? (
            <View style={{ marginTop: 12 }}>
              <RenderStrip ready={renderStatus === 'ready'} onPress={seeLook} />
            </View>
          ) : null}

          <StepRibbon steps={steps} style={{ marginTop: 14 }} />

          {/* Only while the job is still open. The tip explains build-then-judge,
              which is stale advice on a card that already says both are done —
              and it would be the third accent-filled block in a row. */}
          {!tipDismissed && state === 'open' ? (
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

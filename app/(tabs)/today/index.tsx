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
 * ─── THE JOB CARD HAS FIVE STATES ───────────────────────────────────────────
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
 *   failed     in, judged, the job died. Says so, says the ENTRY IS SAFE, and
 *              offers the retry. Added 4 Sep — the card used to fall back to
 *              `building` on any status that wasn't `ready`, so a dead render
 *              claimed to be a minute away indefinitely, with a dead button.
 *
 * The derivation lives in domain/today.ts, tested. Its ordering is
 * load-bearing: a failure mid-round does NOT pre-empt the voting CTA.
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
import { Card, EarnedRow } from '@/ui/cards';
import { StepRibbon, type Step } from '@/ui/StepRibbon';
import { ResultCard } from '@/ui/ResultCard';
import { RenderStrip } from '@/ui/RenderStrip';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { palette, border } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { TONIGHTS_BRIEF, nextChallenge, REVEAL_NEXT_BRIEF } from '@/data/challenges';
import { useSession } from '@/state/session';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { useCreate } from '@/state/create';
import { useRenderStatus, useSubmission } from '@/state/submission';
import { resultCountdown, RESULT_LABEL } from '@/domain/clock';
import { jobCardState } from '@/domain/today';
import { MAX_PIECES } from '@/domain/entry';

export default function Today() {
  const day = useSession((s) => s.day);
  const phase = useSession((s) => s.phase);
  const yesterday = useSession((s) => s.yesterday);

  const cfg = dayConfig(day);
  const picks = useEntry((s) => s.picks);
  const entered = useEntry((s) => s.entered);
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);
  const overnight = useEconomy((s) => s.overnightTokens);
  const renderStatus = useRenderStatus('brief');
  const refundBrief = useCreate((st) => st.refundBrief);

  const judged = callsCast >= quota;
  const seeLook = () => router.push('/(tabs)/today/entered');

  const state = jobCardState({ entered, judged, render: renderStatus });

  /** Re-runs the IDENTICAL entry — same pieces, same casting. Frozen input, so
   *  invariant 4 is untouched: this is a fix for a job that died, not a second
   *  attempt at a different look. The allowance goes back too, for symmetry
   *  with the freestyle lane. */
  const retryRender = () => {
    refundBrief();
    useSubmission.getState().submit('brief', {
      destination: 'brief',
      picks: picks.map((p) => p.name),
      tags: [],
    });
  };

  /* One line per step now (Katya, 4 Sep) — the hints that used to sit under
     each label ("0 of 6", "from 8pm", "7am") are gone with `Step.hint`. The
     counts they carried are still on the screen where they matter: the pick
     count in the builder's slot strip, the judging count in the button. */
  const steps: Step[] = [
    { label: 'Build', state: entered ? 'done' : phase === 'entry' ? 'now' : 'todo' },
    { label: 'Judge', state: judged ? 'done' : phase === 'judging' ? 'now' : 'todo' },
    { label: 'Result', state: judged ? 'now' : 'todo' },
  ];

  /** Kicker, headline and body, per state. The headline is the thing Katya
   *  asked for by name: the card says which of the five it is, in words.
   *
   *  `open` reads all THREE phases now. It used to branch on `entry` and treat
   *  everything else as "closed, now judging" — which is wrong for `settling`
   *  (00:00–07:00), when nobody can enter OR judge. That branch was also dead
   *  until 4 Sep, because the phase never advanced unless you entered. */
  const heading = {
    open: {
      kick:
        phase === 'entry'
          ? "today's job · open until 8pm"
          : phase === 'judging'
            ? "today's job · closed, now judging"
            : "today's job · settled overnight",
      title: TONIGHTS_BRIEF.title,
    },
    entered: { kick: "today's job · you're in", title: TONIGHTS_BRIEF.title },
    building: { kick: "today's job · done", title: 'Building your look.' },
    complete: { kick: "today's job · done", title: 'Challenge complete.' },
    failed: { kick: "today's job · didn't generate", title: 'That didn’t generate.' },
  }[state];

  const primary = (() => {
    if (state === 'open') {
      if (phase === 'entry')
        return {
          label: "Build tonight's look",
          variant: 'solid' as const,
          onPress: () => router.push('/(tabs)/today/build'),
        };
      /* Settling is 00:00–07:00: entry shut at 8pm and the judging is over, so
         there is genuinely nothing to do but wait. Same dead-button treatment
         as `building`, for the same reason. */
      if (phase === 'settling')
        return { label: `Result at ${RESULT_LABEL}`, variant: 'off' as const, onPress: undefined };
      return {
        label: callsCast === 0 ? "Judge tonight's looks" : `Keep judging · ${quota - callsCast} to go`,
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/judging'),
      };
    }
    if (state === 'entered')
      return {
        label: callsCast === 0 ? 'Vote now' : `Keep voting · ${quota - callsCast} to go`,
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/judging'),
      };
    if (state === 'building')
      return { label: `Result at ${RESULT_LABEL}`, variant: 'off' as const, onPress: undefined };
    if (state === 'failed')
      return { label: 'Try again', variant: 'solid' as const, onPress: retryRender };
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
            ) : phase === 'judging' ? (
              <Body style={{ marginTop: 8 }}>
                Entry closed at 8pm with <B>41 looks</B> in. Nobody can enter now, so you can see
                the field without it changing anyone&apos;s answer.
              </Body>
            ) : (
              <Body style={{ marginTop: 8 }}>
                Entry closed at 8pm and the room has judged it. The result lands at{' '}
                {RESULT_LABEL} with tomorrow&apos;s job.
              </Body>
            )
          ) : (
            <Body style={{ marginTop: 8 }}>
              {state === 'entered'
                ? 'Your look is in and nothing can change it. One thing left tonight.'
                : state === 'failed'
                  ? /* SAY THE ENTRY IS SAFE. It is — a failed render does not
                       un-enter the look — and the obvious fear at this moment
                       is that the evening was wasted. */
                    'Your look is still entered and the round still counts. We just couldn’t put it on a model.'
                : state === 'building'
                  ? 'That’s the whole job done. We’re putting your look on a model now — it takes about a minute, and you don’t have to wait for it.'
                  : /* CONDENSED (Katya, 4 Sep). It was three clauses covering
                       the job, the render, the settlement and the result. The
                       card is the end of the day's work, not a summary of it —
                       so it keeps the one fact that is still ahead of you, and
                       the countdown below carries the timing. */
                    'Nothing left to do. The room settles it overnight.'}
            </Body>
          )}

          {/* ── the finished look, on the card ──
              Katya, 4 Sep: show the thing they made. It is the only state
              where there IS something to show, and it is the reason to tap.

              It replaces the RenderStrip here rather than joining it — the
              strip says "your look is ready · take a look", which is a caption
              on a picture that is now sitting directly above the button that
              opens it. Three ways to say one thing. The strip still carries
              the other two states, where there is nothing to show yet. */}
          {state === 'complete' ? (
            <Pressable
              onPress={seeLook}
              accessibilityRole="link"
              accessibilityLabel="See your look"
              style={{ marginTop: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }}
            >
              <View style={{ width: '38%' }}>
                <ComposedFlatLay pieces={picks.map((p) => p.name)} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                {/* The condensed "what happens next", in three words. Rounded
                    up, and it becomes "tomorrow at 7am" past twelve hours —
                    nobody reads "in 23 hours" as sooner than a time of day. */}
                <Big size={20}>{resultCountdown(new Date())}</Big>
                <Tiny style={{ marginTop: 6 }}>Yours is in, and it can&apos;t be changed.</Tiny>
              </View>
            </Pressable>
          ) : entered && renderStatus !== 'none' ? (
            <View style={{ marginTop: 12 }}>
              {/* The strip is how a failure reaches the user MID-ROUND, without
                  taking over the card — see domain/today.ts on why `failed`
                  sits below the round in the ordering. Here it is a report; in
                  the `failed` state below it is the whole point of the screen. */}
              <RenderStrip
                status={renderStatus}
                onPress={renderStatus === 'failed' ? retryRender : seeLook}
              />
            </View>
          ) : null}

          {/* NO STEPPER ON THE COMPLETE CARD (Katya, 4 Sep). Build · Judge ·
              Result is a progress read, and there is no progress left to
              report — all three are done or waiting on the clock, so it read
              as three greyed labels under a heading already saying the same
              thing. The countdown above is the only part of it still true. */}
          {state === 'complete' ? null : <StepRibbon steps={steps} style={{ marginTop: 14 }} />}

          {/* THE WALKTHROUGH TIP IS GONE (Katya, 4 Sep) — "Build first, judge
              after. At 8pm the job shuts and the judging opens, which is also
              how you unlock tokens." It sat between the stepper and the
              button, in the biggest accent panel on the card, explaining a
              sequence the stepper directly above it already draws. Same
              reasoning as the magazine's tooltip and the builder's "No hints,
              on purpose": the rule is still enforced, it is just no longer
              argued on top of the thing that shows it. */}

          <Button
            label={primary.label}
            variant={primary.variant}
            onPress={primary.onPress}
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* ── TOMORROW, LOCKED ──
            A preview of the next job that you cannot act on, so it has to LOOK
            un-actionable rather than merely be un-actionable. There are no
            icons in this design — a padlock would be the app's only glyph of
            that kind, the same reason ConfirmSheet has no caution triangle —
            so "locked" is carried by the things the app already uses for it:
            the sunk ground, the muted rule, greyed type, and the `·` disc that
            marks an unearned milestone.

            Only once the day's work is DONE. Before that it is a second job
            competing with the one you are meant to be doing, and the card
            above is already the hero. */}
        {state === 'complete' || state === 'building' ? <NextChallengeCard /> : null}

        {/* ── ACT 3 · low down. The availability fix. ── */}
        <Pressable
          onPress={() => router.push('/(tabs)/today/challenges')}
          style={{ marginTop: 14 }}
          accessibilityRole="link"
        >
          {/* No count (Katya, 4 Sep). "See the other 13 jobs" made the link
              about the size of the pile; it is about there being one. The
              number is on the screen it leads to, where it can be read
              against the list it describes. */}
          <Tiny color={palette.link} style={{ fontFamily: 'Archivo_700Bold' }}>
            See upcoming challenges →
          </Tiny>
          <Tiny color={palette.grey}>
            You won&apos;t know when each lands, but it&apos;s worth knowing what&apos;s in the pile.
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

/**
 * TOMORROW'S JOB, COLLAPSED AND LOCKED.
 *
 * ⚠ IT NAMES THE JOB, which reveals the month's order — deliberately withheld
 * everywhere else (see `REVEAL_NEXT_BRIEF` in data/challenges.ts for what that
 * costs and how to turn it off). Katya's call, 4 Sep.
 *
 * Collapsed means one line of job and one line of when. No note, no brief, no
 * pieces — a preview you can read in two seconds and cannot act on. If it
 * carried the full brief it would be tonight's homework, which is exactly the
 * behaviour the withheld order exists to prevent.
 */
function NextChallengeCard() {
  const next = nextChallenge();
  return (
    <View style={s_next} accessibilityLabel={`Tomorrow's job, locked until ${RESULT_LABEL}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* The unearned-milestone mark, reused. It is already the app's way of
            saying "not yet" without a glyph nothing else uses. */}
        <View style={s_nextDisc}>
          <Tiny color={palette.greyDecor}>·</Tiny>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Kick tone="muted">locked · starts tomorrow at {RESULT_LABEL}</Kick>
          <Body style={{ marginTop: 5, color: palette.grey }}>
            {REVEAL_NEXT_BRIEF ? next.name : 'Tomorrow’s job.'}
          </Body>
        </View>
      </View>
    </View>
  );
}

/** Sunk, hairline, no ink border — deliberately quieter than every card above
 *  it. The job card is `ink`; this is the same shape with the emphasis taken
 *  out, which is what makes it read as not-yet rather than as secondary. */
const s_next = {
  marginTop: 14,
  borderWidth: border.hair,
  borderColor: palette.rule,
  backgroundColor: palette.creamSunk,
  padding: 14,
};

const s_nextDisc = {
  width: 30,
  height: 30,
  borderRadius: 999,
  borderWidth: border.hair,
  borderColor: palette.rule,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

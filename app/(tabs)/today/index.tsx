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

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Big, Body, Kick, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Card, EarnedRow, JobStepList } from '@/ui/cards';
import { StarBadge } from '@/ui/StarBadge';
import { LockIcon } from '@/ui/TabIcon';
import { ResultCard } from '@/ui/ResultCard';
import { RenderStrip } from '@/ui/RenderStrip';
import { SubmissionSheet } from '@/ui/SubmissionSheet';
import { palette, border, radius } from '@/theme/tokens';
import { FORCE_RESULTS_READY, dayConfig } from '@/config/testState';
import { TONIGHTS_BRIEF, nextChallenge, REVEAL_NEXT_BRIEF } from '@/data/challenges';
import { useSession } from '@/state/session';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { useCreate } from '@/state/create';
import { useRenderStatus, useSubmission } from '@/state/submission';
import { RESULT_LABEL } from '@/domain/clock';
import { jobBadge, jobCardState, jobSteps } from '@/domain/today';

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
  const [showSubmission, setShowSubmission] = useState(false);
  const refundBrief = useCreate((st) => st.refundBrief);

  const judged = callsCast >= quota;
  const seeLook = () => router.push('/(tabs)/today/entered');

  const state = jobCardState({
    entered,
    judged,
    render: renderStatus,
    /* ⚠ A flag, because the schedule makes this unreachable on its own — the
       result lands at 7am, when this card is showing a NEW job. See
       RESULTS_NEED_A_DAY_ROLLOVER in domain/today.ts. */
    resultsReady: FORCE_RESULTS_READY,
  });

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

  const steps = jobSteps({ entered, judged, phase });

  /**
   * THE CARD ALWAYS IDENTIFIES THE JOB NOW (Katya, 4 Sep).
   *
   * It used to replace the challenge title with the state — "Building your
   * look.", "Challenge complete." — so the one thing every state has in common
   * was the thing that disappeared as soon as anything happened. The title and
   * its one-line description are constant; the BADGE carries the state, and the
   * status row carries the render. See `jobBadge` in domain/today.ts for why
   * `failed` still badges as Complete.
   */
  const badge = jobBadge(state);
  const open = state === 'open' || state === 'entered';

  const primary = (() => {
    if (open) {
      /* ONE CTA FOR THE WHOLE DAY. "Complete now" — the card treats build and
         vote as one task you finish, which is what the stacked steps describe,
         so the button does not rename itself for each leg. It routes to
         whichever leg is actually open: build until 8pm, voting after. */
      if (phase === 'entry' && !entered)
        return {
          label: 'Complete now',
          variant: 'solid' as const,
          onPress: () => router.push('/(tabs)/today/build'),
        };
      /* Settling is 00:00–07:00: entry shut at 8pm and the judging is over, so
         there is nothing left to do but wait. */
      if (phase === 'settling')
        return { label: `Results at ${RESULT_LABEL}`, variant: 'off' as const, onPress: undefined };
      return {
        label: 'Complete now',
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/judging'),
      };
    }
    if (state === 'failed')
      return { label: 'Try again', variant: 'solid' as const, onPress: retryRender };
    if (state === 'results')
      return {
        label: 'View results',
        variant: 'solid' as const,
        onPress: () => router.push('/(tabs)/today/result'),
      };
    /* `building` and `complete` both wait on the same clock. */
    return { label: `Results at ${RESULT_LABEL}`, variant: 'off' as const, onPress: undefined };
  })();

  return (
    <Screen>
      <LogoBlock title="Today" />

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

        {/* ── ACT 2 · today, as one unit ──
            THE HEADING SITS ABOVE THE CARD (Katya, 4 Sep). It was a kicker
            inside it, doubling as the state read ("today's job · open until
            8pm"); the state moved to the badge and the label became a section
            heading, which is what it always was — this screen has three acts
            and only this one was unlabelled.

            THE MASTHEAD IS "TODAY" NOW (Katya, 4 Sep). It said "Today's
            challenge", which put the same phrase twice inside 40px with this
            heading beneath it. "Today" is the tab's own label, so the masthead
            names the place and this names the act.

            AND THIS IS NOT A `SectionHead`. It was, briefly, which made it
            identical to "Try these" in the Wardrobe and "Everything you've
            entered" in Looks — a quiet grey rule-and-label for the loudest
            thing on the screen. It is a kicker now: smaller, accented, and
            clearly a tag on the card rather than a peer of the masthead. */}
        <Kick tone="alert" style={{ marginTop: 2 }}>
          Today&apos;s styling challenge
        </Kick>

        {/* ROUNDED, AND OVERFLOWING (Katya, 4 Sep). The radius and the star
            are the same instruction — make it look less like an admin panel.
            `overflow` stays visible so the badge can break the border: inside
            it, it is a label; breaking out, it is a sticker.

            The right padding leaves room for the star, so a long brief title
            cannot run under it. */}
        <View style={{ marginTop: 12 }}>
          <Card ink style={s_card}>
            <Big style={{ paddingRight: 46 }}>{TONIGHTS_BRIEF.title}</Big>

          {/* ONE description, constant across states. The brief's own line —
              the state is the badge's job, not this sentence's. */}
          <Body style={{ marginTop: 8 }}>{TONIGHTS_BRIEF.note}</Body>

          {/* ── the steps, while the day is still open ──
              Gone once complete: three ticked rows under a badge already
              reading COMPLETE is the same fact three times, and it was the
              tallest thing on a card with nothing left to do. */}
          {open ? <JobStepList steps={steps} /> : null}

          {/* ── the status row, once the day is done ──
              `building`/`failed` get the strip, because there is nothing to
              look at yet and the strip is a report. `complete`/`results` get a
              LINK instead: the look opens in a drawer rather than sitting
              inline, which is the right trade on a card whose job is to report
              state — the picture is what you might want, not what you need to
              read. */}
          {open ? null : state === 'building' || state === 'failed' ? (
            <View style={{ marginTop: 14 }}>
              <RenderStrip
                status={renderStatus === 'none' ? 'pending' : renderStatus}
                onPress={state === 'failed' ? retryRender : seeLook}
              />
            </View>
          ) : (
            <Tiny
              color={palette.link}
              style={s_submissionLink}
              onPress={() => setShowSubmission(true)}
            >
              View your submission →
            </Tiny>
          )}

            <Button
              label={primary.label}
              variant={primary.variant}
              onPress={primary.onPress}
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Absolutely positioned over the corner, and OUTSIDE the Card so
              the card's own border cannot clip it. Negative offsets by half
              the star's overhang, which is what makes it read as applied to
              the card rather than drawn on it. */}
          <View style={s_star} pointerEvents="none">
            <StarBadge label={badge} tone={open ? 'accent' : 'quiet'} />
          </View>
        </View>

        {/* ── TOMORROW, LOCKED ──
            A preview of the next job that you cannot act on, so it has to LOOK
            un-actionable rather than merely be un-actionable: the sunk ground,
            the muted rule, greyed type, and a padlock.

            ⚠ A NOTE HERE USED TO CLAIM THIS APP HAS NO ICONS and that a
            padlock would be its only glyph of that kind. That was wrong —
            `LockIcon` already existed and the challenges list has used it since
            a7 was built. Corrected rather than left, because the claim would
            have talked the next person out of the right component.

            Only once the day's work is DONE — which is every non-open state
            except `failed`, where the user has something to fix and a preview
            of tomorrow is the last thing they need. Expressed as "not open"
            rather than a list of states, so a sixth state cannot silently miss
            it the way `results` did. */}
        {open || state === 'failed' ? null : <NextChallengeCard />}

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
          {/* 16px and 14px (Katya, 4 Sep). Both were `Tiny` at 10 — the size
              the eye skips — on the only route to the month's list. A link
              nobody finds is the availability fix not shipping. */}
          <Tiny color={palette.link} style={s_monthLink}>
            See upcoming challenges →
          </Tiny>
          <Tiny color={palette.grey} style={s_monthNote}>
            You won&apos;t know when each lands, but it&apos;s worth knowing what&apos;s in the pile.
          </Tiny>
        </Pressable>

        <Gap />
      </Scroll>

      {/* No footer on Today — the job card owns the primary action, because the
          job IS the screen. Adding a sticky CTA here would compete with it. */}
      <Foot style={{ paddingTop: 0, paddingBottom: 0 }} />

      {/* The look, on demand. Outside the Scroll because it is a Modal — it has
          to float over the whole screen, not scroll with the card. */}
      <SubmissionSheet
        visible={showSubmission}
        job={TONIGHTS_BRIEF.title}
        pieces={picks.map((p) => p.name)}
        onDismiss={() => setShowSubmission(false)}
      />
    </Screen>
  );
}

const s_card = {
  padding: 16,
  /** Rounded (Katya, 4 Sep). `Card` itself stays square — it is used for the
   *  settlement panel and the wardrobe's boxes, which are documents rather than
   *  objects. This one is the day's hero and reads better as a thing. */
  borderRadius: radius.lg,
};

/** Half the star hangs off each edge. `top`/`right` are negative by roughly a
 *  third of its size — enough to read as applied, not so far that a point
 *  clips the screen edge at the gutter. */
const s_star = {
  position: 'absolute' as const,
  top: -24,
  right: -14,
};

const s_monthLink = { fontFamily: 'Archivo_700Bold' as const, fontSize: 16, lineHeight: 21 };
const s_monthNote = { fontSize: 14, lineHeight: 19, marginTop: 2 };

/** 16px, per Katya — it is a real destination, not a footnote on the card, and
 *  `Tiny`'s own 10 would have made it the smallest thing on a card whose other
 *  text is 16. */
const s_submissionLink = {
  marginTop: 14,
  fontSize: 16,
  lineHeight: 21,
  fontFamily: 'Archivo_700Bold' as const,
};

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
    <>
      {/* Heading above the card, matching today's — MUTED, not accent. The
          structure is parallel because the two cards are peers; the tone is
          not, because an accent kicker over a card you cannot touch promises
          an action that is thirteen hours away. */}
      <Kick tone="muted" style={{ marginTop: 20 }}>
        Tomorrow&apos;s challenge
      </Kick>

      <View
        style={s_next}
        accessibilityLabel={`Tomorrow's job, locked until ${RESULT_LABEL}`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          {/* THE PADLOCK, not the unearned-milestone disc (Katya, 4 Sep). The
              disc said "not yet"; a lock says "not yours yet", which is the
              actual state — the job exists, it is simply not open. Same
              component the challenges list uses for every unopened row, so the
              two screens agree about what a locked job looks like. */}
          <LockIcon open={false} size={19} />
          <View style={{ flex: 1, minWidth: 0 }}>
            {/* No "tomorrow" here any more — the heading above owns that word,
                and saying it twice in two lines was the redundancy. */}
            <Kick tone="muted">locked · opens at {RESULT_LABEL}</Kick>
            <Body style={{ marginTop: 5, color: palette.grey }}>
              {REVEAL_NEXT_BRIEF ? next.name : 'Tomorrow’s job.'}
            </Body>
          </View>
        </View>
      </View>
    </>
  );
}

/** Sunk, hairline, no ink border — deliberately quieter than every card above
 *  it. The job card is `ink`; this is the same shape with the emphasis taken
 *  out, which is what makes it read as not-yet rather than as secondary. */
const s_next = {
  marginTop: 10,
  borderWidth: border.hair,
  borderColor: palette.rule,
  /** Rounded to match the job card above it (Katya, 4 Sep). Same radius, so
   *  the two read as the same kind of object — one open, one not — rather than
   *  as a card and a notice. */
  borderRadius: radius.lg,
  backgroundColor: palette.creamSunk,
  padding: 14,
};


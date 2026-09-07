/**
 * o7 · YOUR FIRST CHALLENGE — the hand-off from onboarding into the real job.
 * Last of the three-step setup chain (see ui/OnboardingFrame.tsx).
 *
 * THIS REPLACED THE CAPSULE PICKER (Katya, 3 Sep). That screen handed over
 * eight pieces off a menu and then sent you to a builder stocked with only
 * those eight, which is where the day-one wardrobe problem actually lived: the
 * first thing a new user did was pick clothes they had not chosen for a job
 * they had not seen.
 *
 * The order is now the right way round. You see the job, then you see every
 * garment there is, and the look you enter becomes the wardrobe. Nothing is
 * granted, so nothing has to be justified.
 *
 * ══ IT NOW TEACHES THE LOOP (Katya's mockup, 4 Sep) ══
 *
 * Three numbered rows — build, vote, see how you did — above the brief. That
 * is a real change of purpose: the screen used to say only "everyone gets the
 * same job and everyone has until 8pm", which describes the schedule and not
 * the game. A new user arriving at the builder had never been told that voting
 * is part of it, let alone that it is how tokens arrive.
 *
 * ⚠ IT STILL DOES NOT SAY "NO JUDGING, NO CLOTHES" — handover open question D.
 * Row 2 now says everyone votes on yours and you vote on theirs, which is the
 * mechanic; the COUPLING to owning clothes is still never stated anywhere in
 * onboarding. Closer than it was, not closed.
 *
 * THE GARMENT TEASER IS GONE. Four cutouts sat under the brief — one piece from
 * four categories, deliberately not a recommendation. The three rows took its
 * place because they explain something; the teaser only decorated, and on a
 * screen that now has a job to do it was the tallest thing on it.
 *
 * ONE LINE OF BRIEF, DELIBERATELY. This is read while someone decides whether
 * to start, not after. `TONIGHTS_BRIEF.note` is the same line the builder shows
 * above the grid, so the job does not restate itself differently two screens
 * running — change it in data/challenges.ts, once.
 *
 * `router.replace`, not push: onboarding is forward-only, and there is nothing
 * back there to return to once the tabs are up.
 */

import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Hero, Big, Body, Kick } from '@/ui/text';
import { NumberedList } from '@/ui/cards';
import { palette, border, radius } from '@/theme/tokens';
import { TONIGHTS_BRIEF } from '@/data/challenges';

/**
 * THE WHOLE LOOP, IN THREE ROWS. Ordered as the day runs, not by importance —
 * the point is that voting comes AFTER building and before the result, which is
 * the one thing about this product that surprises people.
 *
 * Row 2 carries the reciprocity in both directions on purpose: "everyone else
 * votes on yours" is what makes the round feel like a room rather than a form.
 */
const LOOP = [
  { title: 'Be the stylist', body: 'Build a look that answers the brief.' },
  {
    title: 'Vote on the rest',
    body: 'Pick the looks that nailed it. Everyone else votes on yours.',
  },
  {
    title: 'See how you did',
    body: 'Results and the winning look land tomorrow morning.',
  },
] as const;

export default function FirstChallenge() {
  return (
    <OnboardingFrame
      index={2}
      label="Your first challenge"
      onBack={() => router.back()}
      cta="Start styling →"
      onCta={() => router.replace('/(tabs)/today/build')}
      topAlign
    >
      <Hero size={30}>{'Your first styling challenge.\nLet’s do it!'}</Hero>
      <Body style={{ marginTop: 10 }}>One brief a day. Everyone plays.</Body>

      <NumberedList items={LOOP} />

      {/* The job itself, last — you read what the day is, then what today's is.
          Rounded to match the Today card, which is the next place this same
          brief appears.
            ⚠ IT SAYS "BRIEF" AND THE TODAY CARD SAYS "CHALLENGE". Katya's
          mockup has "today's brief · closes 8pm" and the Today screen's heading
          is "Today's styling challenge" — two words for one thing on
          consecutive screens. Built to the mockup; worth picking one. */}
      <View style={s.brief}>
        <Kick>today&apos;s brief · closes 8pm</Kick>
        <Big size={21} style={{ marginTop: 7 }}>
          {TONIGHTS_BRIEF.title}
        </Big>
        <Body style={{ marginTop: 7 }}>{TONIGHTS_BRIEF.note}</Body>
      </View>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  brief: {
    marginTop: 20,
    borderWidth: border.mid,
    borderColor: palette.ink,
    borderRadius: radius.lg,
    backgroundColor: palette.cream,
    padding: 14,
  },
});

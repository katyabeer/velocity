/**
 * o1 · o2 · o3 — the three teaching slides.
 *
 * o1 leads with an ACTUAL JOB, not a value proposition. That is deliberate: the
 * product is one brief a day, so the first thing you see is a brief.
 * o2 teaches that the room decides, and that the only question anyone is asked
 *    is *which one works*.
 * o3 teaches copy-minting — "See it. Keep it."
 *
 * ⚠ FLAGGED GAP, NOT A DECISION (open question D):
 * ONBOARDING NO LONGER TEACHES THE CLOCK OR THE COUPLING. The old slide 3 was
 * "Judging pays. Ten calls earns you three tokens." The current one teaches
 * copy-minting instead, and neither o2 nor o3 mentions the 8pm close or that
 * judging is how clothes arrive. Since "no judging, no clothes" is the
 * load-bearing rule of the whole economy, A NEW USER IS CURRENTLY NEVER TOLD IT.
 *
 * Either restore it or accept that a new user discovers the rule by hitting it.
 * Katya's call. If it is restored, this is the file — add a slide and bump
 * ONBOARDING_SLIDES.
 */

import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { LookPlate } from '@/ui/LookPlate';
import { PieceTile } from '@/ui/pieces';
import { Big, Body, H2, Kick } from '@/ui/text';

const SLIDES = [
  {
    n: '01',
    heading: 'Drinks with your ex.\nAnd their new partner.',
    headingSize: 37,
    lede: "That's tonight's job. Five pieces, and you have until eight.",
    body: 'A new one every day. Everyone gets the same one.',
    cta: 'Next',
  },
  {
    n: '02',
    heading: 'Then the room\ndecides.',
    headingSize: 40,
    lede: 'Which one works?',
    body: "That's the only question anyone gets asked about your look. No scores, no comments — there's nowhere to type.",
    cta: 'Next',
  },
  {
    n: '03',
    heading: 'See it.\nKeep it.',
    headingSize: 40,
    lede: 'Take any piece off anyone’s look. It’s a copy — they lose nothing and never find out.',
    body: 'Yours for good. Nothing is bought or sold here, and your wardrobe only ever grows.',
    cta: 'Get started',
  },
] as const;

export default function Intro() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Math.min(Math.max(Number(step) || 1, 1), 3) - 1;
  const slide = SLIDES[index]!;

  const next = () =>
    index === 2 ? router.push('/onboarding/sign-up') : router.push(`/onboarding/intro/${index + 2}`);

  return (
    <OnboardingFrame
      index={index}
      onSkip={() => router.push('/onboarding/sign-up')}
      cta={slide.cta}
      onCta={next}
    >
      <Kick tone="muted">{slide.n}</Kick>
      <H2 size={slide.headingSize} style={{ marginTop: 8 }}>
        {slide.heading}
      </H2>
      <Big style={{ marginTop: 16 }}>{slide.lede}</Big>

      {/* o2 · the pair, so "which one works" has something to point at */}
      {index === 1 ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <LookPlate tint="t1" occasion="Airport" pieces="parka · tee · jean" height={150} label="Look A" />
          </View>
          <View style={{ flex: 1 }}>
            <LookPlate tint="t3" occasion="Airport" pieces="coat · knit · trouser" height={150} label="Look B" />
          </View>
        </View>
      ) : null}

      {/* o3 · two of four pieces already taken, so the tick means something */}
      {index === 2 ? (
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 16 }}>
          {(['coat', 'knit', 'boot', 'bag'] as const).map((n, i) => (
            <View key={n} style={{ flex: 1 }}>
              <PieceTile name={n} state={i % 2 === 0 ? 'held' : 'default'} />
            </View>
          ))}
        </View>
      ) : null}

      <Body style={{ marginTop: index === 0 ? 18 : 16 }}>{slide.body}</Body>
    </OnboardingFrame>
  );
}

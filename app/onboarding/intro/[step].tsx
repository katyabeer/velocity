/**
 * o1–o5 — the 5-slide marketing carousel, replacing the previous 3-slide
 * teaching sequence. Copy sourced from Katya's onboarding.pdf (2 Sep 2026),
 * confirmed: Next through slide 4, "Get started" only on slide 5, Skip
 * always jumps straight to sign-up regardless of slide.
 *
 * This carousel is self-contained (its own 5-dot progress, via
 * `totalDots`), separate from the 6-step dots on sign-up/handle/capsule —
 * see OnboardingFrame.
 *
 * ⚠ OPEN QUESTION D, STILL FLAGGED, NOT RESOLVED: the previous version of
 * this file taught "no judging, no clothes" implicitly through a specific
 * job/room/copy-minting narrative. This version doesn't teach that
 * explicitly either — but slide 02 ("enter before 8pm to earn tokens, then
 * the voting begins") and slide 03 ("every fit gets judged... earn your
 * tokens") now at least surface the token/judging relationship, which the
 * previous version didn't. Still Katya's call whether that's enough.
 */

import { Image, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { LookPlate } from '@/ui/LookPlate';
import { PieceTile } from '@/ui/pieces';
import { Hero, Lede, Kick } from '@/ui/text';

const TOTAL = 5;

const SLIDES = [
  {
    n: '01',
    heading: 'Be a stylist',
    body: '5 garments make an outfit. Pick 5. Create a look. Share. Get judged.',
    cta: 'Next',
  },
  {
    n: '02',
    heading: 'Daily challenges',
    body: 'Enter before 8pm to earn tokens, then the voting begins.',
    cta: 'Next',
  },
  {
    n: '03',
    heading: 'Vote, learn, earn',
    body: 'Every fit gets judged. Vote on looks, earn your tokens.',
    cta: 'Next',
  },
  {
    n: '04',
    heading: 'The community',
    body: 'Share your looks in the magazine to inspire others.',
    cta: 'Next',
  },
  {
    n: '05',
    heading: 'Hunt for items',
    body: 'Spend your tokens to shop the garments in any look.',
    cta: 'Get started',
  },
] as const;

export default function Intro() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Math.min(Math.max(Number(step) || 1, 1), TOTAL) - 1;
  const slide = SLIDES[index]!;

  const next = () =>
    index === TOTAL - 1
      ? router.push('/onboarding/sign-up')
      : router.push(`/onboarding/intro/${index + 2}`);

  return (
    <OnboardingFrame
      index={index}
      totalDots={TOTAL}
      onBack={index > 0 ? () => router.push(`/onboarding/intro/${index}`) : undefined}
      onSkip={() => router.push('/onboarding/sign-up')}
      cta={slide.cta}
      onCta={next}
      ctaVariant="onboarding"
    >
      {/* Order is deliberate and the same on every slide: eyebrow, heading,
          sub-heading, THEN the image — per Katya's reference layout. Don't
          put an image block before the Lede again. */}
      <Kick tone="muted">{slide.n}</Kick>
      <Hero size={44} style={{ marginTop: 10 }}>
        {slide.heading}
      </Hero>
      <Lede style={{ marginTop: 12 }}>{slide.body}</Lede>

      {/* Slides 2, 4, 5 are still placeholders — real imagery pending.
          Reusing the app's existing tinted-box/PieceTile "stand-in, not a
          design" vocabulary rather than a one-off gray box. Slides 1 and 3
          have real assets, so they're the exceptions. */}
      {index === 0 ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Image
            source={require('../../../assets/onboarding/onboarding-screen-1.png')}
            style={{ width: '100%', height: 260 }}
            resizeMode="contain"
          />
        </View>
      ) : null}

      {index === 1 ? (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 20 }}>
          {(['dress', 'sweater', 'boot', 'bag'] as const).map((n) => (
            <View key={n} style={{ flex: 1 }}>
              <PieceTile name={n} />
            </View>
          ))}
        </View>
      ) : null}

      {index === 2 ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Image
            source={require('../../../assets/onboarding/vote-learn-earn.png')}
            style={{ width: '100%', height: 260 }}
            resizeMode="contain"
          />
        </View>
      ) : null}

      {index === 3 ? (
        <View style={{ marginTop: 20 }}>
          <LookPlate tint="t4" occasion="Magazine" height={210} showCaption={false} />
        </View>
      ) : null}

      {index === 4 ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <View style={{ flex: 2 }}>
            <LookPlate tint="t2" occasion="Look" height={180} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <PieceTile name="boot" />
            <PieceTile name="bag" />
          </View>
        </View>
      ) : null}
    </OnboardingFrame>
  );
}

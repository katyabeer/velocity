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
 * ONE LINE OF BRIEF, DELIBERATELY. This is read while someone decides whether
 * to start, not after. `TONIGHTS_BRIEF.note` is the same line the builder shows
 * above the grid, so the job does not restate itself differently two screens
 * running — change it in data/challenges.ts, once.
 *
 * `router.replace`, not push: onboarding is forward-only, and there is nothing
 * back there to return to once the tabs are up.
 */

import { Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Hero, Big, Body, Kick } from '@/ui/text';
import { palette, border, radius, rotation, useReducedMotion } from '@/theme/tokens';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { MAX_PIECES, MIN_PIECES } from '@/domain/entry';
import { garment } from '@/data/catalogue';

/** A taste of the rail, not a recommendation — one piece from four different
 *  categories, fixed, so it never reads as "these would work". Nothing on this
 *  screen may hint at an answer: deciding what suits the job is the skill. */
const TEASER = [
  'cape detail wool coat',
  'velvet jewel tone dress',
  'clean riding boot',
  'jewelled evening clutch',
] as const;

export default function FirstChallenge() {
  const reduced = useReducedMotion();

  return (
    <OnboardingFrame
      index={2}
      label="Your first challenge"
      onBack={() => router.back()}
      cta="Let’s go →"
      onCta={() => router.replace('/(tabs)/today/build')}
      topAlign
    >
      <Hero size={34}>{'Let’s do your\nfirst challenge.'}</Hero>
      <Body style={{ marginTop: 10 }}>
        Everyone gets the same job, and everyone has until 8pm. Yours is open now.
      </Body>

      <View style={s.brief}>
        <Kick>today&apos;s job · open until 8pm</Kick>
        <Big size={21} style={{ marginTop: 7 }}>
          {TONIGHTS_BRIEF.title}
        </Big>
        <Body style={{ marginTop: 7 }}>{TONIGHTS_BRIEF.note}</Body>
      </View>

      {/* Static tilt, zeroed under reduced motion — decorative, not
          information (see tokens.ts rotation). */}
      <View style={s.teaser}>
        {TEASER.map((name, i) => {
          const image = garment(name)?.image;
          if (!image) return null;
          return (
            <View
              key={name}
              style={[
                s.teaserCell,
                { transform: [{ rotate: `${reduced ? 0 : (i % 2 ? 1 : -1) * rotation.r3}deg` }] },
              ]}
            >
              <Image source={image} style={s.teaserImage} resizeMode="contain" />
            </View>
          );
        })}
      </View>

      <Body style={{ marginTop: 14 }}>
        Next: every garment we have, and you pick {MIN_PIECES} to {MAX_PIECES} of them.
      </Body>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  brief: {
    marginTop: 18,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.cream,
    padding: 14,
  },
  teaser: { flexDirection: 'row', gap: 6, marginTop: 18 },
  teaserCell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  teaserImage: { width: '100%', height: '100%' },
});

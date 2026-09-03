import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Onboarding: splash, a 5-slide intro carousel, then sign-up, the two
 *  questions, and the first challenge. No tab bar, and Skip (from any intro
 *  slide) jumps straight to sign up.
 *
 *  The capsule picker used to sit at the end. It is gone — the first challenge
 *  hands straight to the builder, and the look you enter becomes the wardrobe.
 *  See onboarding/first-challenge.tsx. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}
    />
  );
}

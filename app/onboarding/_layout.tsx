import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Onboarding: splash, a 5-slide intro carousel, then sign-up/handle/capsule.
 *  No tab bar, and Skip (from any intro slide) jumps straight to sign up. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}
    />
  );
}

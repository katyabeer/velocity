import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Onboarding: six slides, no tab bar, and Skip jumps straight to sign up. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.paper } }}
    />
  );
}

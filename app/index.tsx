/**
 * Entry point. Sends a new user to onboarding and everyone else to Today.
 *
 * Day 1 lands on the splash screen, then the intro carousel. Day 2 and
 * Established land on Today, because a returning user has already seen it.
 * That is the prototype's `applyDay()` behaviour, minus the HUD.
 */

import { Redirect } from 'expo-router';
import { dayConfig } from '@/config/testState';
import { useSession } from '@/state/session';

export default function Index() {
  const day = useSession((s) => s.day);
  const onboarding = dayConfig(day).onboarding;
  return <Redirect href={onboarding ? '/onboarding/splash' : '/(tabs)/today'} />;
}

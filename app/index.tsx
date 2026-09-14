/**
 * Entry point. EVERY day lands on the splash; the splash decides what follows.
 *
 * ⟲ IT USED TO BRANCH HERE — `onboarding ? '/onboarding/splash' : '/(tabs)/today'`
 * — which meant the loading screen existed on day 1 only. That was wrong
 * against the brief for the returning state (Katya, 13 Sep: "No onboarding — we
 * need to keep the loading screen though — as they would have been logged in
 * already"), and it put the decision in the wrong place: the splash IS the
 * load, and what follows a load is a property of the account rather than of the
 * router's front door. So the branch moved into `onboarding/splash.tsx`.
 *
 * Note this is the `/` route only. A deep link goes straight to its screen and
 * sees no splash, which is correct — nothing is loading.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/onboarding/splash" />;
}

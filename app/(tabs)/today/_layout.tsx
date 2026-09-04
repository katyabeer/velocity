/**
 * The Today stack. Eight screens, because entering and judging both belong to
 * the day rather than to a separate section:
 *
 *   index        a1   Today — the day's spine
 *   result       a12  how you did (yesterday)
 *   challenges   a7   the month ahead
 *   build        a8   the builder
 *   rendering    a13  the render, AFTER you have entered
 *   entered      a14  you're in
 *   judging      a2   the ten paired calls
 *   settled      a4   tokens unlocked
 *
 * The order in this file is the order of the day, not alphabetical. Keep it.
 *
 * ─── `index` IS THE ANCHOR, AND IT HAS TO BE DECLARED (fixed 3 Sep) ─────────
 * Without `unstable_settings.initialRouteName`, expo-router does NOT put this
 * stack's index beneath a child it lands on directly — and every screen in the
 * day arrives that way: the walkthrough `replace`s into `build`, then casting
 * `replace`s into `rendering`, then `rendering` into `judging`, then `judging`
 * into `settled`. Each replace swaps the top of a one-route stack, so the whole
 * Today tab WAS a single screen with nothing under it.
 *
 * The symptom Katya hit: from the challenge-complete screen, tapping the Today
 * tab did nothing at all. Pressing an already-focused tab pops its stack to the
 * top, and the top was already the only route — so there was no bug to see in
 * any one screen, just an absence in this file.
 *
 * With the anchor declared, the day's stack is [index, …whatever], so the tab
 * press pops home, the back gesture has somewhere to land, and
 * `router.dismissTo('/(tabs)/today')` (see today/settled.tsx) pops rather than
 * replaces. Do not remove it, and do not "simplify" the day's `replace` chain
 * into pushes to compensate — the replaces are what keep the flow one-way.
 */

import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

export const unstable_settings = { initialRouteName: 'index' };

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="result" />
      <Stack.Screen name="challenges" />
      <Stack.Screen name="build" />
      {/* Nothing can be changed after entering, so these three are pushed with
          no gesture back — the flow is one-way by design. */}
      <Stack.Screen name="rendering" options={{ gestureEnabled: false }} />
      <Stack.Screen name="entered" options={{ gestureEnabled: false }} />
      <Stack.Screen name="judging" />
      <Stack.Screen name="settled" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

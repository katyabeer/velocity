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
 */

import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.cream } }}>
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

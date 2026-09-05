import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** `index` is the anchor — same reason as the Today stack, which has the long
 *  version of the note. Without it, landing on `posted` directly leaves the tab
 *  a one-route stack with nothing to pop back to. */
export const unstable_settings = { initialRouteName: 'index' };

/** Create: the four-step maker, and the confirmation after posting. */
export default function CreateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="posted" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

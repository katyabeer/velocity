import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** `index` is the anchor — same reason as the Today stack, which carries the
 *  long version of the note. Any tab whose stack has more than one screen
 *  needs it, or landing on the child directly leaves nothing to come back to. */
export const unstable_settings = { initialRouteName: 'index' };

/** Magazine: the feed, and a piece close-up pushed on top of it. */
export default function MagazineLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="piece" />
    </Stack>
  );
}

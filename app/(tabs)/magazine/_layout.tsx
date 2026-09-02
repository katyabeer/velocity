import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Magazine: the feed, and a piece close-up pushed on top of it. */
export default function MagazineLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.cream } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="piece" />
    </Stack>
  );
}

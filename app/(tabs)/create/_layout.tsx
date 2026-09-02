import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Create: the four-step maker, and the confirmation after posting. */
export default function CreateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="posted" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

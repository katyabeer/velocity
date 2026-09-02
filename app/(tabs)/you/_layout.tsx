import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

export default function YouLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.cream } }} />
  );
}

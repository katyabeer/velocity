import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Wardrobe is a single screen with three views, not three routes — the segment
 *  control is a filter on one inventory, and pushing routes for it would break
 *  the sense that it is all one drawer. */
export default function WardrobeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.cream } }} />
  );
}

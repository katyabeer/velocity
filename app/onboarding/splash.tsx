/**
 * The splash screen — the "quintets." wordmark, alone, before the intro
 * carousel starts. Baloo Bhai 2 at 44px is Katya's explicit call for this
 * one wordmark; it isn't part of quintets.css (that file doesn't cover the
 * logo), so it's loaded separately in app/_layout.tsx.
 *
 * Auto-advances to the intro carousel after a beat, or immediately on tap —
 * no duration was specified, ~1s is a reasonable default for a branded
 * flash rather than a screen someone has to sit through.
 */

import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/layout';
import { palette } from '@/theme/tokens';
import { APP_NAME } from '@/config/app';

const AUTO_ADVANCE_MS = 1000;

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding/intro/1'), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen>
      <Pressable
        style={s.wrap}
        onPress={() => router.replace('/onboarding/intro/1')}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text style={s.logo}>{APP_NAME}</Text>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.cream },
  logo: {
    fontFamily: 'BalooBhai2_700Bold',
    fontSize: 44,
    lineHeight: 44,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

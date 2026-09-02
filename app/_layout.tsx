/**
 * Root layout. Loads the four typefaces, then a stack with three groups:
 *
 *   onboarding/   o1–o6, no tab bar, forward-only
 *   (tabs)/       the five tabs, each its own stack
 *   casting       a18, presented as a MODAL because it is reached from two
 *                 different flows (the builder and Create) and has to come back
 *                 to whichever one opened it
 *
 * This is the structural difference from the prototype: there, all 21 screens
 * were siblings toggled by a class, and the tab bar was copy-pasted into
 * fourteen of them. Here the tab bar exists once.
 *
 * FONT EXPORT NAMES were verified against the packages as installed on Expo
 * SDK 53. If you bump @expo-google-fonts and Metro then throws "undefined is
 * not an object" on a font constant, the family has been restructured upstream:
 * check the package's index.d.ts and update both this file and
 * src/theme/type.ts, which must stay in step.
 *
 * v3 token migration (quintets.css): Bodoni Moda is retired — the "editorial
 * voice" is now italic Archivo. Big Shoulders Display is now loaded at 900
 * (Black) only: the new token system uses the display face solely for the
 * onboarding headline and buttons, everywhere else uses Archivo. Baloo Bhai 2
 * is new, and is ONLY for the "quintets." wordmark on the splash screen — it
 * is not part of quintets.css, it's Katya's separate call for the logo.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { BigShouldersDisplay_900Black } from '@expo-google-fonts/big-shoulders-display';
import { BalooBhai2_700Bold } from '@expo-google-fonts/baloo-bhai-2';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_500Medium_Italic,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';

import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BigShouldersDisplay_900Black,
    BalooBhai2_700Bold,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_500Medium_Italic,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_900Black,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.cream },
          /* The prototype's page transition was an 18ms fade-and-lift. A native
             push is closer to what a phone actually does, so we keep the default
             for stacks and only override the modal. */
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="casting"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

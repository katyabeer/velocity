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
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import {
  BigShouldersDisplay_500Medium,
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_800ExtraBold,
  BigShouldersDisplay_900Black,
} from '@expo-google-fonts/big-shoulders-display';
import {
  BodoniModa_400Regular_Italic,
  BodoniModa_500Medium_Italic,
} from '@expo-google-fonts/bodoni-moda';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';

import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BigShouldersDisplay_500Medium,
    BigShouldersDisplay_700Bold,
    BigShouldersDisplay_800ExtraBold,
    BigShouldersDisplay_900Black,
    BodoniModa_400Regular_Italic,
    BodoniModa_500Medium_Italic,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
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
          contentStyle: { backgroundColor: palette.paper },
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

/**
 * The loading screen — the "Editorial." wordmark, alone, before the intro
 * carousel starts. Baloo Bhai 2 at 44px is Katya's explicit call for this one
 * wordmark; it isn't part of quintets.css (that file doesn't cover the logo),
 * so it's loaded separately in app/_layout.tsx.
 *
 * THE FULL STOP IS THE LOADING INDICATOR (Katya, 3 Sep). It pulses slowly for
 * the duration and then the screen advances. That is why the wordmark is
 * rendered as APP_WORDMARK plus a separately animated dot rather than as one
 * APP_NAME string — see config/app.ts.
 *
 * ─── IT IS NOT AN ONBOARDING SCREEN ANY MORE (13 Sep) ──────────────────────
 * ⟲ `app/index.tsx` used to branch — splash for a new user, straight to Today
 * for everyone else — so the loading beat only existed on day 1. The brief for
 * the returning state wants it kept ("No onboarding — we need to keep the
 * loading screen though — as they would have been logged in already"), so every
 * day lands here now and THIS SCREEN chooses what follows:
 *
 *   onboarding  →  /onboarding/intro/1   the carousel, then the setup chain
 *   otherwise   →  /(tabs)/today         a returning user is already in
 *
 * ⚠ THE DAY COMES FROM THE SESSION, NOT FROM `ACTIVE_DAY`, and that is
 * load-bearing rather than incidental. `logOut` in you/index.tsx calls
 * `resetToDay(1)` on the session and then routes here — so on a build seeded
 * to day 2, reading `ACTIVE_DAY` would send someone who has just logged out
 * straight back into the state they were leaving. Reading the session is what
 * keeps "log out" meaning "start again".
 *
 * ⚠ AND IT STILL LIVES UNDER `app/onboarding/`, which now slightly
 * misdescribes it. Kept there on purpose: moving a route between folders makes
 * Metro serve the old tree for several minutes (see CLAUDE.md — the ghost
 * `create` tab), and the path is the only onboarding thing about it. It renders
 * `Screen`, not `OnboardingFrame`, so it carries none of onboarding's chrome,
 * gap or dot sequence.
 *
 * The progress bar that used to sit under the wordmark is gone with it. Two
 * loading indicators for one load is one too many, and the mockup has no bar.
 *
 * THE THREE SECONDS ARE DELIBERATE AND ARTIFICIAL. Nothing is being fetched;
 * the app is already resident by the time this mounts. It is a branded beat,
 * held long enough to read the name, which is the only reason it exists — so
 * `LOADING_MS` is a copy decision, not a performance one. Tap still skips it,
 * because a returning tester should not have to sit through the same three
 * seconds on every Fast Refresh.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/layout';
import { dayConfig } from '@/config/testState';
import { useSession } from '@/state/session';
import { palette, useReducedMotion } from '@/theme/tokens';
import { APP_WORDMARK } from '@/config/app';

/** Katya's number, 3 Sep. A held beat, not a measured load. */
const LOADING_MS = 3000;

/** One breath of the dot. Slow on purpose — a fast pulse reads as an error
 *  state, and this is a brand moment, not an alarm. Two full cycles fit
 *  inside LOADING_MS, which is enough to read as "working" and not as a
 *  blink. */
const PULSE_MS = 1400;

/** How far it fades. NOT to zero, and not close to it: a dot that disappears
 *  reads as a blink or a broken asset, where one that dims reads as breathing. */
const PULSE_FLOOR = 0.4;

export default function Splash() {
  const pulse = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  /* ONE DESTINATION, TWO EXITS. The timeout below and the tap-to-skip on the
     Pressable both use it — computing it twice is how the tap ends up going
     somewhere the wait does not. See the header for why this reads the session
     rather than ACTIVE_DAY. */
  const day = useSession((s) => s.day);
  const next = dayConfig(day).onboarding ? '/onboarding/intro/1' : '/(tabs)/today';

  useEffect(() => {
    /* A `setTimeout`, not an animation callback — and on this screen that is
       the difference between the app starting and not. A starved JS frame loop
       never runs `Animated.timing`'s callback (it lost the judging round's vote
       on 4 Sep), and here it would leave the wordmark on screen for ever. */
    const t = setTimeout(() => router.replace(next), LOADING_MS);
    return () => clearTimeout(t);
  }, [next]);

  useEffect(() => {
    /* Reduced motion gets a solid dot, not a slower one — the pulse is
       decorative here (the three seconds pass either way), and tokens.ts's
       rule is to zero decorative motion rather than soften it. */
    if (reduced) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: PULSE_FLOOR,
          duration: PULSE_MS / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_MS / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  return (
    <Screen>
      <Pressable
        style={s.wrap}
        onPress={() => router.replace(next)}
        accessibilityRole="button"
        accessibilityLabel={`${APP_WORDMARK} — loading`}
      >
        <View style={s.wordmark}>
          <Text style={s.logo}>{APP_WORDMARK}</Text>
          {/* Opacity AND scale together: opacity alone reads as a flicker at
              this size, scale alone as a wobble. Both on the native driver. */}
          <Animated.View
            style={[
              s.dot,
              { opacity: pulse, transform: [{ scale: pulse.interpolate({
                  inputRange: [PULSE_FLOOR, 1],
                  outputRange: [0.72, 1],
                }) }] },
            ]}
          />
        </View>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  /** Baseline-aligned row, so the dot sits on the wordmark's baseline the way
   *  a typed full stop would rather than floating at the text's centre. */
  wordmark: { flexDirection: 'row', alignItems: 'flex-end' },
  logo: {
    fontFamily: 'BalooBhai2_700Bold',
    fontSize: 44,
    lineHeight: 44,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** Sized and nudged to sit where Baloo Bhai's own full stop would. Accent
   *  fill, and the only place in the app it appears without its ink keyline:
   *  it is a glyph, not a surface, and a 1px outline on a 9px circle reads as
   *  a ring. */
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: palette.accent,
    marginLeft: 3,
    marginBottom: 8,
  },
});

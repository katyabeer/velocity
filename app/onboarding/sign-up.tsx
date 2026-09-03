/**
 * o5 · sign up.
 *
 * NO PROFILE, NO PHOTOS. "You'll be building in about a minute." The absence of
 * a profile is not a missing feature — there are no followers and nowhere to put
 * a bio, because the room's entire vocabulary is a vote. (The next screen asks
 * for a handle, and that is all it asks for.)
 *
 * NO CONTINUE BUTTON (Katya, 3 Sep). The three methods are the progression:
 * tapping one moves you on. A Continue button underneath them was a second
 * control for the same job, and it could not know which method you meant — so
 * either it did nothing until you had chosen (in which case the choice was
 * already the action) or it picked for you. The rows are the only affordance
 * now, which is also why they read as buttons rather than as a list.
 *
 * 18+ is confirmed here — by tapping a method, which the terms line says.
 * Given that, the minors privacy clause in scope §5.2 is dead scope and should
 * come out in scope v1.5.
 *
 * ⚠ NONE OF THE THREE DOES ANYTHING DIFFERENT. All three go to the same next
 * screen; there is no auth. Fine for a moderated test, and worth knowing before
 * anyone demos "sign in with Apple" to the client.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Body, H2, Tiny } from '@/ui/text';
import { palette, border, radius } from '@/theme/tokens';
import { AGE_RATING } from '@/config/app';

const METHODS = ['Continue with Apple', 'Continue with Google', 'Use an email address'] as const;

export default function SignUp() {
  const next = () => router.push('/onboarding/handle');
  return (
    <OnboardingFrame index={0} label="Sign up" onBack={() => router.back()}>
      <H2 size={40}>{'Let’s\nget you in.'}</H2>
      <Body style={{ marginTop: 12 }}>
        No profile to fill in. No photos. You&apos;ll be building in about a minute.
      </Body>

      <View style={{ marginTop: 20 }}>
        {METHODS.map((m) => (
          <Pressable
            key={m}
            onPress={next}
            style={({ pressed }) => [s.sso, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={m}
          >
            <View style={s.ssoIcon} />
            <Text style={s.ssoLabel}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Tiny style={s.terms}>
        By choosing one of those you&apos;re confirming you&apos;re {AGE_RATING} or over, and
        accepting the terms and the privacy notice. We don&apos;t sell your identity —
        we&apos;re interested in what you think of a coat.
      </Tiny>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  sso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.cream,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 8,
  },
  ssoIcon: {
    width: 22,
    height: 22,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
  },
  ssoLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  terms: { marginTop: 18, paddingTop: 14, borderTopWidth: border.hair, borderTopColor: palette.rule },
});

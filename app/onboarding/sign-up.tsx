/**
 * o4 · sign up.
 *
 * NO PROFILE, NO PHOTOS. "You'll be building in about a minute." The absence of
 * a profile is not a missing feature — there are no followers and nowhere to put
 * a bio, because the room's entire vocabulary is a vote.
 *
 * 18+ is confirmed here. Given that, the minors privacy clause in scope §5.2 is
 * dead scope and should come out in scope v1.5.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Body, H2, Tiny } from '@/ui/text';
import { palette, border } from '@/theme/tokens';
import { AGE_RATING } from '@/config/app';

const METHODS = ['Continue with Apple', 'Continue with Google', 'Use an email address'] as const;

export default function SignUp() {
  const next = () => router.push('/onboarding/handle');
  return (
    <OnboardingFrame index={3} label="Sign up" onBack={() => router.back()} cta="Continue" onCta={next}>
      <H2 size={40}>{'Let’s\nget you in.'}</H2>
      <Body style={{ marginTop: 12 }}>
        No profile to fill in. No photos. You&apos;ll be building in about a minute.
      </Body>

      <View style={{ marginTop: 20 }}>
        {METHODS.map((m) => (
          <Pressable key={m} onPress={next} style={s.sso} accessibilityRole="button">
            <View style={s.ssoIcon} />
            <Text style={s.ssoLabel}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Tiny style={s.terms}>
        By carrying on you&apos;re confirming you&apos;re {AGE_RATING} or over, and accepting the
        terms and the privacy notice. We don&apos;t sell your identity — we&apos;re interested in
        what you think of a coat.
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
    backgroundColor: palette.paper,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 8,
  },
  ssoIcon: {
    width: 22,
    height: 22,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
  },
  ssoLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  terms: { marginTop: 18, paddingTop: 14, borderTopWidth: border.hair, borderTopColor: palette.line },
});

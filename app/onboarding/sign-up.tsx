/**
 * o5 · sign up.
 *
 * NO PROFILE, NO PHOTOS — and the screen no longer says so (Katya, 4 Sep). The
 * line "No profile to fill in. No photos. You'll be building in about a minute."
 * came off: it is a promise about the absence of work, made on the screen with
 * the least work on it, and the three rows below it already prove the claim in
 * less time than it takes to read. The fact is still true — there are no
 * followers and nowhere to put a bio, because the room's entire vocabulary is a
 * vote — it is just no longer argued.
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
import { H2, Tiny } from '@/ui/text';
import { AppleMark, GoogleMark, EmailMark } from '@/ui/BrandMarks';
import { palette, border, radius } from '@/theme/tokens';
import { AGE_RATING } from '@/config/app';

/**
 * The mark belongs to the method, so they travel together. Apple and Google
 * first because they are one tap; email last because it is the one that asks
 * for something.
 */
const METHODS = [
  { label: 'Continue with Apple', Mark: AppleMark },
  { label: 'Continue with Google', Mark: GoogleMark },
  { label: 'Use an email address', Mark: EmailMark },
] as const;

export default function SignUp() {
  const next = () => router.push('/onboarding/handle');
  return (
    <OnboardingFrame index={0} label="Sign up" onBack={() => router.back()}>
      <H2 size={40}>{'Let’s\nget you in.'}</H2>

      <View style={{ marginTop: 20 }}>
        {METHODS.map(({ label, Mark }) => (
          <Pressable
            key={label}
            onPress={next}
            style={({ pressed }) => [s.sso, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {/* Fixed-width box rather than the mark alone, so the three labels
                start on the same vertical however wide each glyph draws. */}
            <View style={s.ssoIcon}>
              <Mark />
            </View>
            <Text style={s.ssoLabel}>{label}</Text>
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
  /** Was an empty bordered square standing in for an icon. Now the icon —
   *  no border and no ground, because a box around a logo is a second shape
   *  competing with the one inside it. */
  ssoIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  ssoLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  /** 14px (Katya, 4 Sep). It was `Tiny` at 10, which is small print — and this
   *  is the line where the age confirmation and the terms are accepted, so it
   *  is the one piece of small print on the screen that has to be readable.
   *  `Tiny`'s own size is overridden rather than switching component, because
   *  the muted colour and letterspacing are still right for it. */
  terms: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
    fontSize: 14,
    lineHeight: 20,
  },
});

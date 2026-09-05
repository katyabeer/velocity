/**
 * The shared onboarding chrome: a top row, progress dots, and (usually) one
 * button.
 *
 * In the prototype this markup was repeated in every screen. It exists once
 * here so a copy change lands in one place.
 *
 * TWO SELF-CONTAINED SEQUENCES, each with its own dot count:
 *
 *   the intro carousel   4 slides, `totalDots={4}`
 *   the setup chain      sign-up → your profile → first challenge, which is
 *                        ONBOARDING_SLIDES (3) and the default
 *
 * They are not one seven-dot run. The carousel is skippable marketing; the
 * setup chain is the three things the app actually needs from you. A single
 * progress bar spanning both would tell a user who skipped the carousel that
 * they are four-sevenths done, which is nonsense.
 *
 * `cta` IS OPTIONAL. Sign-up has no button: the three sign-in methods ARE the
 * progression, and a Continue button underneath them is a second way to do the
 * same thing that cannot know which one you meant.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from './layout';
import { Button, Dots } from './controls';
import { Kick, Tiny } from './text';
import { palette, border } from '@/theme/tokens';

/** The setup chain: sign-up, your profile, first challenge. */
export const ONBOARDING_SLIDES = 3;

export function OnboardingFrame({
  /** 0-based, for the dots. */
  index,
  /** A step title (sign-up/handle/capsule pass one explicitly). Omit for a
   *  clean chevron-only (or empty) header — no automatic APP_NAME fallback,
   *  see the intro carousel. */
  label,
  onBack,
  onSkip,
  /** Omit for a screen whose own content is the way forward — see the header. */
  cta,
  onCta,
  ctaVariant = 'solid',
  children,
  /** Slides 5 and 6 top-align their content rather than centring it. */
  topAlign,
  /** Dot count for this screen's progress indicator. Defaults to the full
   *  six-step onboarding chain; the 5-slide intro carousel overrides this
   *  since it's a self-contained sequence with its own progress. */
  totalDots = ONBOARDING_SLIDES,
}: {
  index: number;
  label?: string;
  onBack?: () => void;
  onSkip?: () => void;
  cta?: string;
  onCta?: () => void;
  ctaVariant?: 'solid' | 'off' | 'onboarding';
  children: React.ReactNode;
  topAlign?: boolean;
  totalDots?: number;
}) {
  return (
    <Screen>
      <View style={s.frame}>
        <View style={s.top}>
          {onBack ? (
            <Text onPress={onBack} style={s.back} accessibilityRole="button">
              ‹
            </Text>
          ) : label ? (
            <Kick>{label}</Kick>
          ) : (
            <View style={{ width: 10 }} />
          )}
          {onBack && label ? <Kick>{label}</Kick> : null}
          {onSkip ? (
            /* 14px minimum (Katya, 4 Sep). It was `Tiny` at 10 — and Skip is
               not decoration, it is the way out of the carousel for anyone who
               has seen it before. A control set smaller than the body copy
               around it is a control people give up looking for. `Tiny`'s
               muted colour is still right; only the size was wrong. */
            <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={10}>
              <Tiny style={s.skip}>Skip</Tiny>
            </Pressable>
          ) : (
            <View style={{ width: 10 }} />
          )}
        </View>

        <View style={[s.mid, topAlign && { justifyContent: 'flex-start', paddingTop: 8 }]}>
          {children}
        </View>

        <Dots count={totalDots} index={index} />
        {cta ? <Button label={cta} variant={ctaVariant} onPress={onCta} /> : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  skip: { fontSize: 14, lineHeight: 18, letterSpacing: 0.2 },
  frame: { flex: 1, paddingHorizontal: 24, paddingTop: 6, paddingBottom: 18 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    /**
     * FIXED HEIGHT, and it is load-bearing. The row's tallest possible child
     * is the back chevron (22pt); the first slide has no chevron and only a
     * 15.5pt "Skip", so without this the row is shorter there and EVERY
     * heading below it sits ~7pt higher on slide one than on the rest. That
     * is the jump the carousel was explicitly asked not to have, and it comes
     * from up here rather than from anything in the slides.
     */
    height: 40,
    paddingBottom: 9,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  back: { fontSize: 19, lineHeight: 22, color: palette.ink },
  mid: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
});

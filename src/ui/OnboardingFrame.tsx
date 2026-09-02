/**
 * The shared onboarding chrome: brand line, Skip, the six dots, one button.
 *
 * In the prototype this markup was repeated in all six screens. It exists once
 * here so a copy change lands in one place.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from './layout';
import { Button } from './controls';
import { Dots } from './controls';
import { Kick, Tiny } from './text';
import { palette, border } from '@/theme/tokens';

export const ONBOARDING_SLIDES = 6;

export function OnboardingFrame({
  /** 0-based, for the dots. */
  index,
  /** A step title (sign-up/handle/capsule pass one explicitly). Omit for a
   *  clean chevron-only (or empty) header — no automatic APP_NAME fallback,
   *  see the intro carousel. */
  label,
  onBack,
  onSkip,
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
  cta: string;
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
            <Pressable onPress={onSkip} accessibilityRole="button">
              <Tiny>Skip</Tiny>
            </Pressable>
          ) : (
            <View style={{ width: 10 }} />
          )}
        </View>

        <View style={[s.mid, topAlign && { justifyContent: 'flex-start', paddingTop: 8 }]}>
          {children}
        </View>

        <Dots count={totalDots} index={index} />
        <Button label={cta} variant={ctaVariant} onPress={onCta} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  frame: { flex: 1, paddingHorizontal: 24, paddingTop: 6, paddingBottom: 18 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 9,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  back: { fontSize: 19, lineHeight: 22, color: palette.ink },
  mid: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
});

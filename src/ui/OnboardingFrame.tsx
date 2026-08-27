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
import { APP_NAME } from '@/config/app';

export const ONBOARDING_SLIDES = 6;

export function OnboardingFrame({
  /** 0-based, for the dots. */
  index,
  /** The brand line, or a step title on the sign-up slides. */
  label,
  onBack,
  onSkip,
  cta,
  onCta,
  ctaVariant = 'solid',
  children,
  /** Slides 5 and 6 top-align their content rather than centring it. */
  topAlign,
}: {
  index: number;
  label?: string;
  onBack?: () => void;
  onSkip?: () => void;
  cta: string;
  onCta?: () => void;
  ctaVariant?: 'solid' | 'off';
  children: React.ReactNode;
  topAlign?: boolean;
}) {
  return (
    <Screen>
      <View style={s.frame}>
        <View style={s.top}>
          {onBack ? (
            <Text onPress={onBack} style={s.back} accessibilityRole="button">
              ‹
            </Text>
          ) : (
            <Kick>{label ?? APP_NAME}</Kick>
          )}
          {onBack ? <Kick>{label ?? APP_NAME}</Kick> : null}
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

        <Dots count={ONBOARDING_SLIDES} index={index} />
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
    borderBottomColor: palette.line,
  },
  back: { fontSize: 19, lineHeight: 22, color: palette.ink },
  mid: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
});

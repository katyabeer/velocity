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

/**
 * THE GAP UNDER THE HEADER RULE, and it lives here so every onboarding screen
 * gets the same one (Katya, 7 Sep — "a decent amount of space between the
 * header and the content, so it doesn't seem too tight").
 *
 * It was 8. On `handle` that put "what shall we call you" almost against the
 * rule, so the first thing the screen asked for read as part of the chrome
 * rather than as the start of the page.
 *
 * ONE NUMBER TO DIAL, deliberately. It reads differently per screen and that
 * is unavoidable: `first-challenge` leads with a 30px Hero, whose own leading
 * adds to the gap, while `handle` leads with a 9px eyebrow that has almost
 * none — so the same 40 looks generous on one and merely adequate on the
 * other. 40 is the value that fixes the tight case without pushing
 * `first-challenge` (the tallest screen in the chain, ~90px of slack) into
 * clipping. Raise it and check that screen.
 *
 * ⚠ THE INTRO CAROUSEL SUBTRACTS THIS FROM ITS OWN `TOP_PAD`, so its eyebrow
 * stays on the same y it has always been on — that alignment is the carousel's
 * whole no-jumping mechanism. If you change this number, the carousel's total
 * changes with it unless you change TOP_PAD too. See intro/[step].tsx.
 */
export const ONBOARDING_TOP_GAP = 40;

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
  /**
   * Top-align rather than centre. EVERY onboarding screen passes this now
   * (Katya, 7 Sep): centring left `sign-up` with a deep empty band above the
   * heading and the 18+ note floating in the middle of the page. Kept as a
   * prop rather than made the default because `mid` is also what the splash
   * beat would want if it ever came through here.
   */
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

        <View
          style={[
            s.mid,
            topAlign && { justifyContent: 'flex-start', paddingTop: ONBOARDING_TOP_GAP },
          ]}
        >
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

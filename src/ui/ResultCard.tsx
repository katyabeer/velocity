/**
 * Yesterday's result card, at the top of Today.
 *
 * Three states, because there are three things that can have happened:
 *   entered      you have a band
 *   judged-only  you have a calls read-out but no band
 *   missed       you have neither, and the card tells you what won instead
 *
 * The fourth state, `none`, is DAY ONE — and it renders nothing at all. Today
 * handles that by not mounting this component. There is deliberately no empty
 * state here.
 *
 * ─── IT ANNOUNCES ITSELF, ONCE (Katya, 13 Sep) ─────────────────────────────
 * "A slight animation when the user arrives on Today after the loading screen,
 * to draw attention to it." See `useAnnounce` below — the short version is
 * that it is a NUDGE ON A CARD ALREADY AT REST, not an entrance, and that
 * distinction is a safety property rather than a matter of taste.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, useReducedMotion } from '@/theme/tokens';
import { LookPlate } from './LookPlate';
import { dayResult } from '@/data/results';
import { yesterdayLooks } from '@/data/looks';
import type { YesterdayState } from '@/domain/clock';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  THE ARRIVAL NUDGE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ A POP ON A CARD AT REST, NOT AN ENTRANCE, AND THAT IS THE WHOLE DESIGN.
 * Both ends of the tween are the card's correct resting state; the
 * displacement exists only in the middle.
 *
 * The obvious build — fade and rise in from nothing — is the one this codebase
 * has already been bitten by. A JS-driven `Animated.Value` sits at its START
 * value forever when the frame loop is starved: the Claude preview pane never
 * fires `requestAnimationFrame` while it is hidden, which is what lost the
 * judging round's vote on 4 Sep and why `ui/ReactionsChart.tsx` is driven by
 * `setInterval` instead. An entrance degrades in that case to AN INVISIBLE
 * CARD — the most important thing on the screen, missing. This shape degrades
 * to "no animation", which is merely disappointing.
 *
 * A `setTimeout` backstop lands the value on rest whatever happens, the same
 * belt-and-braces `ui/LookPlate.tsx` and `ui/BottomSheet.tsx` carry. Here it
 * only matters if the loop stalls MID-tween, which would otherwise leave the
 * card a few percent oversized for the rest of the session.
 *
 * ─── ONCE PER LOAD, NOT ONCE PER VISIT ─────────────────────────────────────
 * Katya asked for it "when the user arrives on Today after the loading
 * screen". A tab navigator KEEPS ITS SCREENS MOUNTED, so `useFocusEffect`
 * would replay this every time the Today tab is pressed — attention-seeking
 * furniture rather than an announcement. A module-scope flag is the right
 * scope: it survives tab switches and dies with the JS context, and since
 * nothing in this app persists, a fresh context IS an arrival from the splash.
 *
 * ⚠ Fast Refresh resets module state, so it replays on save in dev. That is
 * the flag working, not a bug.
 */
let announced = false;

/** The route transition off the splash has to finish first, or the pop happens
 *  underneath it and the eye never catches it. */
const NUDGE_DELAY_MS = 420;
const NUDGE_MS = 700;

function useAnnounce(active: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    /* REDUCED MOTION GETS NOTHING. The pop is pure decoration over a card that
       already reads — there is no information in it to lose, which is the test
       tokens.ts sets for zeroing decorative motion rather than softening it. */
    if (!active || reduced || announced) return;
    announced = true;

    const anim = Animated.timing(v, {
      toValue: 1,
      duration: NUDGE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    let settle: ReturnType<typeof setTimeout> | undefined;

    const start = setTimeout(() => {
      anim.start();
      settle = setTimeout(() => {
        anim.stop();
        v.setValue(1);
      }, NUDGE_MS + 260);
    }, NUDGE_DELAY_MS);

    return () => {
      clearTimeout(start);
      if (settle) clearTimeout(settle);
      anim.stop();
    };
  }, [active, reduced, v]);

  /* ONE VALUE, FOUR STOPS — a single timing that reads as a spring settling.
     It overshoots, dips just past rest, and comes back. Scale and lift move
     together because either alone reads as a fault: scale on its own is a
     throb, translate on its own a twitch.

     ⚠ 0 AND 1 ARE BOTH IDENTITY (scale 1, translateY 0). That is what makes
     the resting state correct at either end of the tween — see above. */
  const stops = [0, 0.22, 0.46, 0.7, 1];
  return {
    transform: [
      { scale: v.interpolate({ inputRange: stops, outputRange: [1, 1.045, 0.995, 1.013, 1] }) },
      { translateY: v.interpolate({ inputRange: stops, outputRange: [0, -6, 1.5, -2, 0] }) },
    ],
  };
}

/** `Pressable` is not an animated component, so a plain one would ignore the
 *  interpolated transform entirely. Wrapping it in an `Animated.View` instead
 *  would work and would reindent the whole card for nothing. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ResultCard({ state, onPress }: { state: YesterdayState; onPress: () => void }) {
  /* ⚠ ABOVE THE EARLY RETURN. Rules of hooks — `state === 'none'` bails out on
     the next line, and a hook after it is a conditional hook. This project has
     made that exact mistake once (create/index.tsx, 7 Sep, caught by eslint).
     The argument is what stops day 1 arming a nudge it never shows. */
  const nudge = useAnnounce(state !== 'none');

  if (state === 'none') return null;

  /**
   * ⚠ EVERY LITERAL THAT USED TO BE HERE NOW LIVES IN data/results.ts, and the
   * screen this card opens (`today/result.tsx`) reads the same fixture. They
   * are the summary and the detail of one result, so they always had to agree
   * and nothing made them — the job name alone was written three times in this
   * file and a fourth time over there.
   *
   * `day` came off the props with it: the only thing it decided was whether the
   * kicker said "your first job" or "yesterday's job", which is a property of
   * the result rather than of the day number.
   */
  const r = dayResult();

  const config = {
    /**
     * ⟲ THE CARD STOPPED REPORTING THE RESULT ON 13 Sep, and became an
     * INVITATION to go and read it. Katya replaced both strings: the kicker was
     * `Yesterday's job · 38 entered` and the badge was the band itself.
     *
     * The effect is that the band is revealed on the results screen and nowhere
     * else, so the tap has something behind it. `r.band` and `r.fieldSize` are
     * still the same fixture that screen reads — the card just no longer
     * spoils them.
     *
     * ⚠ THE TWO STRINGS NOW SAY THE SAME THING, twice, on a card 73pt tall.
     * Built exactly as asked and flagged rather than quietly reworded — see the
     * note to Katya. The cheapest fix if it reads badly is to drop the badge:
     * the chevron already says the card is tappable.
     */
    entered: {
      tint: 't2' as const,
      kick: 'See how you did yesterday',
      title: r.job,
      badge: 'see how you did',
      badgeTone: 'accent' as const,
      label: '·',
    },
    'judged-only': {
      tint: 't4' as const,
      kick: 'Yesterday · you judged only',
      title: r.job,
      badge: r.closeCallsBadge,
      badgeTone: 'dim' as const,
      label: '?',
    },
    missed: {
      tint: 't1' as const,
      kick: 'Yesterday · you missed it',
      title: r.job,
      badge: r.wonBy,
      badgeTone: 'alert' as const,
      label: 'Won',
    },
  }[state];

  return (
    <AnimatedPressable onPress={onPress} style={[s.card, nudge]} accessibilityRole="button">
      <View style={{ width: 58 }}>
        {/* ⟲ A REAL PHOTOGRAPH SINCE 13 Sep, and it is THE SAME ONE the results
            screen shows next to the band (Katya's ask). This was a bare tinted
            plate with a `·` ghosted across it — on the one card whose whole
            subject is a look you made. The image comes off the fixture both
            screens read, so the card and the screen it opens cannot drift.

            `LookPlate` falls back to the ghost when `image` is undefined, so
            the `label` and `tint` below are still doing their job on any state
            whose pool has no frame at that index. */}
        <LookPlate
          tint={config.tint}
          occasion={config.title}
          image={yesterdayLooks()[r.yourLookIndex]?.image}
          height={73}
          label={config.label}
          showCaption={false}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.kick}>{config.kick}</Text>
        <Text style={s.title}>{config.title}</Text>
        <Text
          style={[
            s.badge,
            config.badgeTone === 'alert' && s.badgeAlert,
            config.badgeTone === 'dim' && s.badgeDim,
          ]}
        >
          {config.badge}
        </Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: border.hair,
    borderColor: palette.ink,
    backgroundColor: palette.cream,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  kick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9.6,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  title: {
    /** disp800 retired — see cards.tsx statValue for the same call. */
    fontFamily: 'Archivo_900Black',
    fontSize: 26,
    lineHeight: 24.7,
    textTransform: 'uppercase',
    color: palette.ink,
    marginTop: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 9,
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    lineHeight: 10,
    letterSpacing: 0.94,
    textTransform: 'uppercase',
    borderWidth: border.mid,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    color: palette.ink,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  /** No alert hue survives the v3 collapse — ink border, sunk ground. */
  badgeAlert: {
    borderColor: palette.ink,
    backgroundColor: palette.creamSunk,
    color: palette.ink,
  },
  badgeDim: { borderColor: palette.rule, backgroundColor: palette.creamSunk, color: palette.grey },
  chevron: { fontSize: 27, lineHeight: 27, color: palette.greyDecor },
});

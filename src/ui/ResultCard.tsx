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

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, useReducedMotion } from '@/theme/tokens';
import { LookPlate } from './LookPlate';
import { dayResult } from '@/data/results';
import { yesterdayLooks } from '@/data/looks';
import type { YesterdayState } from '@/domain/clock';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  THE ARRIVAL — A BOUNCE AND A BURST
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Katya, 13 Sep: "something more celebratory — confetti around it, with a
 * slower bounce."
 *
 * ⚠ BOTH ENDS OF BOTH TWEENS ARE NOTHING, AND THAT IS A SAFETY PROPERTY
 * RATHER THAN A MATTER OF TASTE. The card rests at identity at value 0 AND at
 * value 1; every confetti piece is at opacity 0 at value 0 AND at value 1.
 *
 * The reason is the frame loop. A JS-driven `Animated.Value` sits at its START
 * value forever when rAF is starved — the Claude preview pane never fires it
 * while hidden, which is what lost the judging round's vote on 4 Sep and why
 * `ui/ReactionsChart.tsx` is driven by `setInterval` instead. Built the obvious
 * way — card fading in, confetti fading out — starvation leaves an INVISIBLE
 * CARD under a frozen shower of paper that never clears. Built this way it
 * leaves the card exactly as it should be and no confetti at all.
 *
 * `setTimeout` backstops land both values on rest whatever happens, the same
 * belt-and-braces `ui/LookPlate.tsx` and `ui/BottomSheet.tsx` carry, and a
 * third unmounts the confetti layer so a stalled loop cannot strand it.
 *
 * ─── ONCE PER LOAD, NOT ONCE PER VISIT ─────────────────────────────────────
 * A tab navigator KEEPS ITS SCREENS MOUNTED, so `useFocusEffect` would replay
 * this every time the Today tab is pressed — a party popper going off on every
 * navigation. A module-scope flag is the right scope: it survives tab switches
 * and dies with the JS context, and since nothing in this app persists, a
 * fresh context IS an arrival from the splash.
 *
 * ⚠ Fast Refresh resets module state, so it replays on save in dev.
 */
let announced = false;

/** The route transition off the splash has to finish first, or it happens
 *  underneath and the eye never catches it. */
const NUDGE_DELAY_MS = 420;
/** ⟲ 700 → 1150. "A slower bounce" — and the extra time is what lets the
 *  amplitude decay read as a bounce settling rather than as one pop. */
const BOUNCE_MS = 1150;
/** Longer than the bounce on purpose: the card settles and the paper is still
 *  coming down, which is what stops it reading as one synchronised twitch. */
const BURST_MS = 1700;

/* ── the paper ───────────────────────────────────────────────────────────────

   ⚠ NO NEW HUES. Four values, all already in the palette: the accent does the
   celebrating and ink and the two greys keep it editorial rather than
   party-shop. `accentPale` is deliberately NOT here — tokens.ts restricts it to
   a settled, positive STATUS and calls out that it is not a general success
   colour, and confetti is decoration, not a status.                          */
const CONFETTI_COLOURS = [palette.accent, palette.ink, palette.rule, palette.greyDecor] as const;

/**
 * Deterministic, and generated ONCE at module scope. `Math.random` per render
 * would reshuffle the burst on every re-render mid-flight — the pieces would
 * teleport. A fixed seed also means what you see in review is what ships.
 *
 * ⚠ THE HORIZONTAL BUDGET IS FIXED AND SMALL, AND THAT IS NOT TIMIDITY. The
 * layer spans the CARD, so `left` is a percentage of the card's width — and
 * the card is only inset ~17px from the screen. `x` stays inside 10–90% and
 * `dx` tops out at 34px, so the widest throw from the leftmost piece lands at
 * roughly the card's own edge. Any further and pieces cross the viewport on
 * web, which gives the whole page a horizontal scrollbar. It is the one thing
 * here that can break a layout rather than just look wrong.
 *
 * VERTICAL IS FREE, which is why the layer is stretched past the card at both
 * ends (see `s.confetti`) — pieces start above it and fall below it, so the
 * burst reads as confetti AROUND the card rather than specks ON it.
 */
const PIECES = (() => {
  let seed = 20260913;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  return Array.from({ length: 22 }, (_, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    return {
      x: 10 + rnd() * 80,
      /** Measured from the STRETCHED layer's top, so the low numbers start a
       *  piece above the card's own edge. */
      y: rnd() * 46,
      w: 4 + Math.round(rnd() * 5),
      h: 7 + Math.round(rnd() * 7),
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]!,
      dx: dir * (8 + rnd() * 26),
      rise: -(20 + rnd() * 30),
      fall: 64 + rnd() * 62,
      spin: dir * (160 + Math.round(rnd() * 420)),
      /** A stagger, so they do not all leave on the same frame. */
      t0: rnd() * 0.14,
      round: rnd() > 0.7,
    };
  });
})();

function Confetti({ progress }: { progress: Animated.Value }) {
  return (
    <View
      style={s.confetti}
      /* DECORATION OVER A CONTROL. The whole card is one Pressable, so a layer
         that ate taps would kill the only route to the results screen. */
      pointerEvents="none"
      /* Nothing here is information. Announcing sixteen unlabelled rectangles
         over a card a screen reader has just read out is noise. */
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {PIECES.map((p, i) => {
        /* Each piece's own clock, so the stagger costs no extra Animated
           values — one driver, sixteen offsets. */
        const t = progress.interpolate({
          inputRange: [p.t0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={[
              s.piece,
              { left: `${p.x}%`, top: p.y, width: p.w, height: p.h, backgroundColor: p.colour },
              p.round ? { borderRadius: p.w } : null,
              {
                /* 0 AT BOTH ENDS — see the header. It fades in on the way out
                   of the card and is gone before the tween finishes. */
                opacity: progress.interpolate({
                  inputRange: [0, p.t0 + 0.04, 0.62, 1],
                  outputRange: [0, 1, 1, 0],
                  extrapolate: 'clamp',
                }),
                transform: [
                  { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
                  /* Up, then down past where it started — the only part of
                     this that has to look like gravity. */
                  {
                    translateY: t.interpolate({
                      inputRange: [0, 0.32, 1],
                      outputRange: [0, p.rise, p.fall],
                    }),
                  },
                  { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function useAnnounce(active: boolean) {
  const pop = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const [armed, setArmed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    /* REDUCED MOTION GETS NEITHER. Both are pure decoration over a card that
       already reads — there is no information in them to lose, which is the
       test tokens.ts sets for zeroing decorative motion rather than softening
       it. Confetti is the clearest case of that there could be. */
    if (!active || reduced || announced) return;
    announced = true;

    const bounce = Animated.timing(pop, {
      toValue: 1,
      duration: BOUNCE_MS,
      /* LINEAR, and that is not laziness. The bounce is shaped entirely by the
         stop values below; an eased driver would squash them unevenly in time
         and the decay would stop reading as a decay. */
      easing: Easing.linear,
      useNativeDriver: true,
    });
    const shower = Animated.timing(burst, {
      toValue: 1,
      duration: BURST_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    let settle: ReturnType<typeof setTimeout> | undefined;

    const start = setTimeout(() => {
      setArmed(true);
      bounce.start();
      shower.start();
      /* Lands both on rest and takes the layer down — see the header. */
      settle = setTimeout(() => {
        bounce.stop();
        shower.stop();
        pop.setValue(1);
        burst.setValue(1);
        setArmed(false);
      }, BURST_MS + 300);
    }, NUDGE_DELAY_MS);

    return () => {
      clearTimeout(start);
      if (settle) clearTimeout(settle);
      bounce.stop();
      shower.stop();
    };
  }, [active, reduced, pop, burst]);

  /* ONE VALUE, SEVEN STOPS — a single timing reading as a bounce settling.
     The amplitude decays geometrically, which is what a real bounce does and
     what one overshoot cannot fake. Scale and lift move together because
     either alone reads as a fault: scale on its own is a throb, translate on
     its own a twitch.

     ⚠ 0 AND 1 ARE BOTH IDENTITY (scale 1, translateY 0). */
  const stops = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1];
  return {
    armed,
    burst,
    nudge: {
      transform: [
        {
          scale: pop.interpolate({
            inputRange: stops,
            outputRange: [1, 1.075, 0.982, 1.036, 0.992, 1.014, 1],
          }),
        },
        {
          translateY: pop.interpolate({
            inputRange: stops,
            outputRange: [0, -14, 4, -7, 2, -3, 0],
          }),
        },
      ],
    },
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ResultCard({ state, onPress }: { state: YesterdayState; onPress: () => void }) {
  /* ⚠ ABOVE THE EARLY RETURN. Rules of hooks — `state === 'none'` bails out on
     the next line, and a hook after it is a conditional hook. This project has
     made that exact mistake once (create/index.tsx, 7 Sep, caught by eslint).
     The argument is what stops day 1 arming a nudge it never shows. */
  const { nudge, burst, armed } = useAnnounce(state !== 'none');

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
      /* ⟲ "See how you did yesterday" until 13 Sep. It said the same thing as
         the badge two lines below it — the stutter flagged when the card
         became an invitation. `Your results` names the thing; the badge does
         the inviting. */
      kick: 'Your results',
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
      {/* INSIDE the card, and absolutely positioned — so it takes no part in
          the row layout below and rides the bounce with the card rather than
          floating beside it. Mounted only while it is running. */}
      {armed ? <Confetti progress={burst} /> : null}
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
  /**
   * STRETCHED PAST THE CARD, top and bottom, so the burst surrounds it rather
   * than sitting on it. Horizontally it stays flush with the card — see the
   * note on `PIECES` for why that edge is the one that matters.
   *
   * Nothing clips it: neither this nor `s.card` sets `overflow`, so a piece
   * that travels beyond these bounds still draws. The insets are about where
   * pieces START, not a frame they are trapped in.
   */
  confetti: { position: 'absolute', left: 0, right: 0, top: -22, bottom: -34 },
  /** A scrap of paper. Everything that varies — size, colour, roundness — is
   *  set per piece at the call site; this is only what they share. */
  piece: { position: 'absolute' },
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

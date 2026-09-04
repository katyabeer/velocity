/**
 * The look plate — the single most repeated object in the app.
 *
 * Real photos have started arriving (Day 1 magazine + judging pools first —
 * see data/looks.ts). `image` is optional: when it's set, it renders behind
 * the caption and the tinted ghost-text panel disappears entirely; when it
 * isn't (Day 2/3, onboarding, still-unrendered fixtures), the tinted STAND-IN
 * panel is exactly what it always was.
 *
 * One look, two presentations. THE FLAT LAY IS NOT A FALLBACK — it is the
 * unrendered state, and R-L6 says a failed generation still enters the pool as a
 * composed flat lay. So build the flat lay properly; it is load-bearing, not an
 * error screen.
 */

import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import { palette, border, radius, tintFor, useReducedMotion, type PlateTint } from '@/theme/tokens';

const SCREEN_W = Dimensions.get('window').width;

export function LookPlate({
  tint,
  occasion,
  pieces,
  image,
  height,
  label,
  onPress,
  style,
  showCaption = true,
}: {
  tint: PlateTint;
  occasion: string;
  pieces?: string;
  image?: ImageSourcePropType;
  height: number;
  /** What is set large and faint behind the plate. Defaults to the occasion. */
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showCaption?: boolean;
}) {
  const body = (
    <View style={[s.plate, { height, backgroundColor: tintFor(tint) }, style]}>
      {image ? (
        <Image source={image} style={s.photo} resizeMode="cover" />
      ) : (
        <View style={s.image}>
          <Text style={s.ghost}>{(label ?? occasion).replace(' ', '\n')}</Text>
        </View>
      )}
      {showCaption ? (
        <View style={s.caption}>
          <Text style={s.captionKick}>{occasion}</Text>
          {pieces ? <Text style={s.captionPieces}>{pieces}</Text> : null}
        </View>
      ) : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {body}
    </Pressable>
  ) : (
    body
  );
}

/**
 * The judging pair. Two plates side by side, 326pt tall in the prototype.
 * Tapping either one casts the call.
 *
 * NOTHING IS REVEALED WHILE YOU VOTE. The split, the accuracy, the reason — all
 * of it is computed overnight and shown at 7am. Showing it here teaches people
 * to pick the popular option, which is the consensus-manufacturing the whole
 * design is avoiding.
 *
 * ─── THE CHOICE LEAVES THE WAY IT WAS POINTING (Katya, 3 Sep) ───────────────
 * Tap the left look and it flies off the LEFT edge; tap the right and it goes
 * right. The direction is the confirmation: it is the only feedback this screen
 * is allowed to give, since revealing anything about the call itself is the one
 * thing the design forbids. The unchosen plate settles back and dims rather
 * than leaving, so the pair reads as "this one, not that one".
 *
 * CONTROLLED, NOT SELF-DRIVING. The screen owns which side is leaving and
 * passes it in; this component only animates it and says when it has finished.
 * That is what lets "Too close to call" — a button in the footer, nowhere near
 * these plates — send BOTH of them down with the same gesture vocabulary. A
 * self-contained version would have needed a ref and an imperative handle to
 * reach in from the footer.
 *
 * `onExitDone` fires when the exit FINISHES, and that is what advances the
 * round — not the touch. Advancing on touch means the parent swaps in the next
 * pair mid-flight and you watch the WRONG look fly away. The parent then
 * remounts this component (it keys on the call index), which is what resets the
 * animation: there is deliberately no reset path in here, because a component
 * that animates out and also animates itself back in has two sources of truth
 * for where the plates are.
 *
 * REDUCED MOTION SKIPS IT ENTIRELY — the parent calls it straight through.
 * This is decorative confirmation, not information, so nothing is lost.
 *
 * THE CALL CANNOT DEPEND ON THE ANIMATION FINISHING. `Animated.timing`'s
 * completion callback runs on the JS driver here (there is no native animated
 * module on web), and a starved or throttled frame loop — a backgrounded tab,
 * a hidden webview — means it may never run at all. Observed: the plate froze
 * mid-flight and the vote silently never landed. So a timer settles it
 * regardless, and whichever gets there first wins. A vote is the one thing on
 * this screen that must not be lost to a dropped frame.
 */

const EXIT_MS = 260;
const ENTER_MS = 220;

export type PickSide = 'a' | 'b' | 'tie';

export function LookPair({
  left,
  right,
  height = 326,
  leaving = null,
  onPick,
  onExitDone,
}: {
  left: { tint: PlateTint; occasion: string; pieces: string; image?: ImageSourcePropType };
  right: { tint: PlateTint; occasion: string; pieces: string; image?: ImageSourcePropType };
  height?: number;
  /** Which side the screen has committed to. Non-null starts the exit. */
  leaving?: PickSide | null;
  /** A plate was tapped. The screen decides what that means. */
  onPick?: (side: PickSide) => void;
  /** The exit has finished — safe to advance the round. */
  onExitDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const exit = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  /* The new pair arrives on a fresh mount (see the header), so the entrance
     runs once and needs no dependency on the look data. */
  useEffect(() => {
    if (reduced) return;
    Animated.timing(enter, {
      toValue: 1,
      duration: ENTER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduced, enter]);

  /** Guards against onExitDone running twice — the animation callback and the
   *  fallback timer race, and either is allowed to win. */
  const settled = useRef(false);

  useEffect(() => {
    if (!leaving) return;

    const done = () => {
      if (settled.current) return;
      settled.current = true;
      onExitDone?.();
    };

    if (reduced) {
      done();
      return;
    }

    Animated.timing(exit, {
      toValue: 1,
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) done();
    });

    /* The safety net — see the header. Slack over EXIT_MS so the animation
       normally wins and the plate is gone before the round moves on. */
    const fallback = setTimeout(done, EXIT_MS + 120);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  /** Off the near edge — a plate is about half the screen, so a full screen
   *  width clears it with room to spare whichever side it started on. */
  const away = (dir: -1 | 1) =>
    exit.interpolate({ inputRange: [0, 1], outputRange: [0, dir * SCREEN_W] });

  const chosen = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };

  const plateStyle = (side: 'a' | 'b') => {
    const isLeaving = leaving === side;
    const isTie = leaving === 'tie';
    if (isLeaving) {
      return {
        opacity: exit.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: away(side === 'a' ? -1 : 1) },
          { rotate: exit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', side === 'a' ? '-6deg' : '6deg'] }) },
        ],
      };
    }
    if (isTie) {
      return {
        opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [
          { translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
        ],
      };
    }
    if (leaving) {
      /* The one not chosen: settles back and dims, so the pair reads as a
         choice between them rather than one card wandering off alone. */
      return {
        opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }),
        transform: [
          { scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) },
        ],
      };
    }
    return chosen;
  };

  return (
    <View style={s.pair}>
      <Animated.View style={[{ flex: 1 }, plateStyle('a')]}>
        <LookPlate
          {...left}
          height={height}
          label="Look A"
          onPress={onPick && !leaving ? () => onPick('a') : undefined}
        />
      </Animated.View>
      <Animated.View style={[{ flex: 1 }, plateStyle('b')]}>
        <LookPlate
          {...right}
          height={height}
          label="Look B"
          onPress={onPick && !leaving ? () => onPick('b') : undefined}
        />
      </Animated.View>
    </View>
  );
}

/**
 * The settled split reveal — a two-tone bar with labels underneath.
 *
 * THE FILL SWEEPS OUT TO ITS SHARE (Katya, 4 Sep) rather than appearing at
 * full width. It is the one number on this card that is a quantity, so showing
 * it arrive as a quantity is worth the movement.
 *
 * NO NATIVE DRIVER HERE, deliberately: this animates `width` as a percentage
 * string, which the native driver cannot handle (it only takes transforms and
 * opacity). A transform-based version would need a fixed pixel width to scale
 * from, and the bar is fluid. It is a 700ms decoration on one card, so the JS
 * driver is the right trade.
 *
 * THE LABELS AND THE NUMBER DO NOT ANIMATE, and that is a rule rather than an
 * omission — see the animation note in CLAUDE.md. A counting-up figure has to
 * push state from an animation frame, and a starved frame loop would leave the
 * wrong number on screen. The bar can stall mid-sweep and still be honest; a
 * number stuck at 0 next to "74%" cannot.
 */
export function SplitBar({ share }: { share: number }) {
  const reduced = useReducedMotion();
  const grow = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) return;
    Animated.timing(grow, {
      toValue: 1,
      duration: 700,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [reduced, grow, share]);

  const fill = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${share}%`] });

  return (
    <View>
      <View style={s.split}>
        <Animated.View style={[s.splitA, { width: fill }]} />
      </View>
      <View style={s.splitLabels}>
        <Text style={s.splitLabel}>Yours · {share}%</Text>
        <Text style={s.splitLabel}>The other · {100 - share}%</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  /** quintets.css drop-in override: `.look, .plate img { border-radius:16px }` */
  plate: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  image: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { flex: 1, width: '100%' },
  ghost: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 30,
    lineHeight: 27,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.16)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  caption: {
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
    backgroundColor: palette.cream,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  captionKick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 7.5,
    lineHeight: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.link,
  },
  captionPieces: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 13,
    color: palette.grey,
    marginTop: 4,
  },
  pair: { flexDirection: 'row', gap: 10, paddingHorizontal: 12 },
  /** The track IS the unfilled remainder now, so the fill can sweep across it
   *  without a second element whose width has to stay in step. */
  split: {
    flexDirection: 'row',
    height: 28,
    borderWidth: border.hair,
    borderColor: palette.ink,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  splitA: { height: '100%', backgroundColor: palette.accent },
  splitLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  splitLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.grey,
  },
});

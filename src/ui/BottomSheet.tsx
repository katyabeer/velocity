/**
 * The bottom sheet — how you get a garment out of a look.
 *
 * TAP THE LOOK → BOTTOM SHEET. That is the only route to taking a piece.
 * Reactions are on LOOKS ONLY, never on individual garments (reversed, do not
 * re-propose), so this sheet is a list of pieces and a Take button, nothing more.
 *
 * STARRING IS FREE; TAKING COSTS A TOKEN. The distinction is the whole reason
 * the magazine can be appetite and shop at once.
 *
 * OUT OF TOKENS IS NOT A DEAD END (Katya, 3 Sep). The row's button used to go
 * disabled and say "No tokens", which turns the sheet into a wall the moment
 * the balance hits zero — exactly when someone is most engaged, having just
 * opened a look they want something out of. It now switches to "Save for
 * later", which is free, and the piece waits in Wardrobe → Saved until a
 * token arrives.
 *
 * That is a routing change, NOT a change to the economy. Saving still costs
 * nothing and grants nothing: no garment enters a wardrobe without a token
 * (invariant 1), and a saved piece is a note to self, not a holding. The only
 * thing that changed is that the zero-balance state offers the free action
 * instead of refusing the paid one.
 *
 * ─── TAKING A PIECE FLIES IT TO THE WARDROBE (Katya, 3 Sep) ────────────────
 * A copy of the row's thumbnail lifts off, arcs down to the Wardrobe tab and
 * shrinks out. It is the only feedback that says WHERE the garment went — the
 * token counter dropping tells you it cost something, not that you now own it
 * somewhere specific, and the wardrobe is two taps away behind a modal.
 *
 * IT LIVES INSIDE THIS MODAL, which is what makes it possible at all. The
 * sheet's scrim is only 55% opaque, so the tab bar is visible through it, and
 * an absolutely-positioned child of the Modal can be drawn anywhere on screen
 * — including over that bar. A flier mounted at the app root would sit BEHIND
 * the Modal on native and never be seen.
 *
 * The source position is measured for real (`measureInWindow` on the row's
 * thumbnail). The destination is computed, not measured: the tab bar is five
 * equal columns, so `tabCentreFraction` gives the Wardrobe tab's centre from
 * the shared TAB_ORDER without reaching across the tree into another
 * navigator. Both read the same array, so they cannot drift.
 *
 * The take itself is NOT gated on the animation. `onToggleTake` fires
 * immediately — the balance and the wardrobe move at once, and the flier is
 * decoration over the top. If it is skipped for reduced motion, or the
 * measurement fails, the take has already happened.
 *
 * SCRIM FADE, not Modal's built-in `animationType`. The dim backdrop and the
 * sheet are siblings inside one Modal — "slide" animates that whole tree as a
 * single unit sliding up from off-screen, which drags the backdrop up into
 * view with it instead of fading it in over the page. Driving the dim's
 * opacity and the sheet's translateY separately (both native-driver, so no
 * jank) is what makes the backdrop actually read as a fade. `animationType`
 * stays "none"; `mounted` keeps the Modal alive for the close animation's
 * duration since Modal itself has no exit-animation hook.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, border, layout, radius, space, useReducedMotion } from '@/theme/tokens';
import { Kick } from './text';
import { TokenBadge } from './TokenBadge';
import { tabCentreFraction } from './TabIcon';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Long enough to read as travel, short enough not to delay the next tap. */
const FLY_MS = 520;
/** Where the thumbnail ends up, as a share of its starting size. */
const FLY_END_SCALE = 0.3;

type Flier = {
  /** Bumped per flight so a rapid second take restarts cleanly. */
  id: number;
  image: ImageSourcePropType;
  from: { x: number; y: number; w: number; h: number };
  to: { x: number; y: number };
};

export type SheetRow = {
  name: string;
  /** Already in the wardrobe. */
  held: boolean;
  /** Starred but not owned. */
  starred: boolean;
  /** The cutout, when the catalogue has one. Falls back to an empty plate. */
  image?: ImageSourcePropType;
};

export function BottomSheet({
  visible,
  rows,
  canTake,
  onClose,
  onToggleTake,
  onToggleSave,
  onOpenPiece,
}: {
  visible: boolean;
  rows: readonly SheetRow[];
  /** False when the balance is spent OR the wardrobe is full — both are
   *  reasons a token cannot be spent, and both route to Save for later. */
  canTake: boolean;
  onClose: () => void;
  onToggleTake: (name: string) => void;
  onToggleSave: (name: string) => void;
  onOpenPiece: (name: string) => void;
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [flier, setFlier] = useState<Flier | null>(null);
  const fly = useRef(new Animated.Value(0)).current;
  /** One ref per row's thumbnail, so a take can measure where it started. */
  const thumbs = useRef<Record<string, RNView | null>>({}).current;
  const flightId = useRef(0);

  /** Centre of the Wardrobe tab's icon. Computed from TAB_ORDER — see header. */
  const target = {
    x: SCREEN_W * tabCentreFraction('wardrobe'),
    y: SCREEN_H - insets.bottom - layout.tabBarHeight / 2,
  };

  const take = (name: string, image?: ImageSourcePropType) => {
    /* The take lands first, always. The flight is decoration. */
    onToggleTake(name);
    const node = thumbs[name];
    if (reduced || !image || !node) return;

    node.measureInWindow((x, y, w, h) => {
      if (!w || !h) return;
      flightId.current += 1;
      fly.setValue(0);
      setFlier({ id: flightId.current, image, from: { x, y, w, h }, to: target });
      Animated.timing(fly, {
        toValue: 1,
        duration: FLY_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setFlier(null);
      });

      /* The JS animation driver can be starved (backgrounded tab), and its
         completion callback then never runs — which would leave the thumbnail
         frozen mid-flight. The take itself already landed, so this is pure
         cleanup, but a stuck image on screen is worse than no animation. */
      const id = flightId.current;
      setTimeout(() => {
        setFlier((f) => (f && f.id === id ? null : f));
      }, FLY_MS + 200);
    });
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    /* `progress` is a useRef value and never changes identity; listing it
       satisfies the lint rule without changing when this runs. */
  }, [visible, progress]);

  if (!mounted) return null;

  const sheetTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_H, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <AnimatedPressable
        style={[s.dim, { opacity: progress }]}
        onPress={onClose}
        accessibilityLabel="Close"
      />
      <Animated.View style={[s.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={s.grab} />
        <View style={s.head}>
          <Kick>what&apos;s in it</Kick>
          <TokenBadge />
        </View>
        <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
          {rows.map((r, i) => {
            /* Three states, and the third only exists when a token can't be
               spent. Owning wins over saving: a held piece says Yours even if
               it was starred on the way in. */
            const mode = r.held ? 'own' : canTake ? 'take' : 'save';
            const label =
              mode === 'own' ? 'Yours' : mode === 'take' ? 'Take it' : r.starred ? 'Saved' : 'Save for later';
            const sub =
              mode === 'own'
                ? 'in your wardrobe'
                : mode === 'take'
                  ? r.starred
                    ? 'saved · costs 1 token'
                    : 'costs 1 token'
                  : r.starred
                    ? 'waiting in your wardrobe'
                    : 'no tokens left — save it for later';
            /* Nothing is disabled any more: every row has a free action.
               Only a TAKE flies — saving for later does not put the garment
               anywhere yet, so an animation into the wardrobe would be a lie
               about what just happened. */
            const onPress = () =>
              mode === 'save' ? onToggleSave(r.name) : take(r.name, r.image);
            return (
              <View key={r.name} style={[s.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
                <Pressable
                  ref={(node) => {
                    thumbs[r.name] = node;
                  }}
                  style={s.thumb}
                  onPress={() => onOpenPiece(r.name)}
                >
                  {r.image ? (
                    <Image source={r.image} style={s.thumbImage} resizeMode="contain" />
                  ) : null}
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => onOpenPiece(r.name)}>
                  <Text style={s.name}>{r.name}</Text>
                  <Text style={s.sub}>{sub}</Text>
                </Pressable>
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={{ selected: mode === 'own' || (mode === 'save' && r.starred) }}
                  style={[
                    s.action,
                    mode === 'own' && s.actionOwn,
                    mode === 'save' && r.starred && s.actionSaved,
                  ]}
                >
                  <Text style={s.actionLabel}>{label}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* The flier. Last child so it draws over the sheet, and
          pointerEvents="none" so it never eats a tap on the way past. */}
      {flier ? (
        <Animated.View
          key={flier.id}
          pointerEvents="none"
          style={[
            s.flier,
            {
              left: flier.from.x,
              top: flier.from.y,
              width: flier.from.w,
              height: flier.from.h,
              opacity: fly.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 0.9, 0] }),
              transform: [
                {
                  translateX: fly.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, flier.to.x - (flier.from.x + flier.from.w / 2)],
                  }),
                },
                {
                  /* Lifts before it drops, so it reads as carried rather than
                     dragged along the floor of the screen. */
                  translateY: fly.interpolate({
                    inputRange: [0, 0.35, 1],
                    outputRange: [0, -46, flier.to.y - (flier.from.y + flier.from.h / 2)],
                  }),
                },
                {
                  scale: fly.interpolate({
                    inputRange: [0, 0.35, 1],
                    outputRange: [1, 1.12, FLY_END_SCALE],
                  }),
                },
              ],
            },
          ]}
        >
          <Image source={flier.image} style={s.thumbImage} resizeMode="contain" />
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const s = StyleSheet.create({
  dim: { flex: 1, backgroundColor: 'rgba(18,17,16,0.55)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '76%',
    backgroundColor: palette.cream,
    borderTopWidth: border.heavy,
    borderTopColor: palette.ink,
    paddingHorizontal: space.gutter,
    paddingTop: 12,
    paddingBottom: 22,
  },
  grab: { width: 42, height: 3, backgroundColor: palette.ink, alignSelf: 'center', marginBottom: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.creamSunk,
  },
  thumb: {
    width: 44,
    height: 54,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  flier: {
    position: 'absolute',
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.sm,
    backgroundColor: palette.cream,
    overflow: 'hidden',
  },
  name: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, lineHeight: 16, color: palette.ink },
  sub: { fontFamily: 'Archivo_400Regular', fontSize: 10, lineHeight: 13, color: palette.greyMute, marginTop: 3 },
  action: {
    borderWidth: border.mid,
    borderColor: palette.ink,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  actionOwn: { borderColor: palette.accentEdge, backgroundColor: palette.accent },
  /** Saved but not owned: lighter than Take it, distinct from the accent fill
   *  that means "yours". Accent here would claim you have the garment. */
  actionSaved: { borderWidth: border.hair, borderColor: palette.rule, backgroundColor: palette.creamSunk },
  actionLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

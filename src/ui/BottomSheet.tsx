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
import { Animated, Dimensions, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, border, space } from '@/theme/tokens';
import { Kick } from './text';
import { TokenBadge } from './TokenBadge';

const SCREEN_H = Dimensions.get('window').height;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type SheetRow = {
  name: string;
  /** Already in the wardrobe. */
  held: boolean;
  /** Starred but not owned. */
  starred: boolean;
};

export function BottomSheet({
  visible,
  rows,
  canTake,
  onClose,
  onToggleTake,
  onOpenPiece,
}: {
  visible: boolean;
  rows: readonly SheetRow[];
  canTake: boolean;
  onClose: () => void;
  onToggleTake: (name: string) => void;
  onOpenPiece: (name: string) => void;
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

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
  }, [visible]);

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
            const label = r.held ? 'Yours' : canTake ? 'Take it' : 'No tokens';
            const sub = r.held
              ? 'in your wardrobe'
              : r.starred
                ? '★ saved'
                : 'costs 1 token';
            const disabled = !r.held && !canTake;
            return (
              <View key={r.name} style={[s.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
                <Pressable style={s.thumb} onPress={() => onOpenPiece(r.name)} />
                <Pressable style={{ flex: 1 }} onPress={() => onOpenPiece(r.name)}>
                  <Text style={s.name}>{r.name}</Text>
                  <Text style={s.sub}>{sub}</Text>
                </Pressable>
                <Pressable
                  onPress={disabled ? undefined : () => onToggleTake(r.name)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled }}
                  style={[s.action, r.held && s.actionOwn, disabled && s.actionOff]}
                >
                  <Text
                    style={[
                      s.actionLabel,
                      disabled && { color: palette.greyMute },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
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
  actionOff: { borderWidth: border.hair, borderColor: palette.rule },
  actionLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

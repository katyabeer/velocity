/**
 * THE SHEET CHROME, extracted at last — scrim, slide, and the safety net.
 *
 * `ConfirmSheet` carried a note saying two copies of these fifteen lines was
 * cheaper than a third component, "but if a third sheet appears, extract it
 * then." A third appeared (the submission drawer on the Today card), so here it
 * is. `ConfirmSheet` and the drawer both use it.
 *
 * ⚠ `ui/BottomSheet.tsx` DOES NOT, and that is deliberate. Its Modal also hosts
 * the flying-thumbnail overlay for take-a-piece, which is layered into the same
 * tree and animates against the tab bar's coordinates. Rewiring that through a
 * generic wrapper is real risk for no user-visible gain, so it keeps its own
 * copy. Two implementations for three sheets, not three.
 *
 * ══ WHY THE BACKDROP AND THE SHEET ARE SIBLINGS ══
 *
 * They are two children of one Modal with `animationType="none"`. Modal's own
 * "slide" would drag the backdrop up into view with the sheet instead of fading
 * it in over the page, so the dim's opacity and the sheet's translateY are
 * driven separately off one `progress` value.
 *
 * ══ NEVER GATE UNMOUNT ON AN ANIMATION CALLBACK ALONE ══
 *
 * The JS driver can be starved — a backgrounded tab, or the Claude preview pane
 * where requestAnimationFrame never fires at all — and `start(cb)` then never
 * runs its callback. That would leave `mounted` true forever, and this renders
 * a FULL-SCREEN Modal with a scrim over it: invisible, but still swallowing
 * every tap on the page beneath. The judging round lost a vote to exactly this.
 * Hence the `setTimeout` fallback. `ui/LookPlate.tsx` carries the same one.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';

const SCREEN_H = Dimensions.get('window').height;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OPEN_MS = 260;
const CLOSE_MS = 180;

export function Sheet({
  visible,
  onDismiss,
  /** What tapping the scrim does, for a screen reader. The safe answer should
   *  always be reachable this way as well as by a control. */
  dismissLabel = 'Close',
  children,
  style,
}: {
  visible: boolean;
  onDismiss: () => void;
  dismissLabel?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });

    /* The safety net. See the header. */
    const t = setTimeout(() => setMounted(false), CLOSE_MS + 200);
    return () => clearTimeout(t);
    /* `progress` is a useRef value and never changes identity; listing it
       satisfies the lint rule without changing when this runs. */
  }, [visible, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_H, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss}>
      <AnimatedPressable
        style={[s.dim, { opacity: progress }]}
        onPress={onDismiss}
        accessibilityLabel={dismissLabel}
      />
      <Animated.View style={[s.sheet, style, { transform: [{ translateY }] }]}>
        {/* The grab handle is decoration — the sheet is not draggable. It is
            here because a panel that slides up from the bottom edge without one
            reads as a screen that failed to finish loading. */}
        <View style={s.grab} />
        {children}
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
    backgroundColor: palette.cream,
    borderTopWidth: border.heavy,
    borderTopColor: palette.ink,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.gutter,
    paddingTop: 12,
    paddingBottom: 26,
  },
  grab: {
    width: 42,
    height: 3,
    backgroundColor: palette.ink,
    alignSelf: 'center',
    marginBottom: 14,
  },
});

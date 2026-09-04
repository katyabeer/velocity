/**
 * A confirmation drawer. One question, one destructive answer, one way out.
 *
 * WHY A DRAWER AND NOT AN ALERT. The app has no native alerts anywhere, and
 * `Alert.alert` would be the only piece of OS chrome in a design this
 * deliberately typeset. The bottom sheet already exists as the app's modal
 * vocabulary (ui/BottomSheet.tsx), so this is the same mechanics with a
 * different payload.
 *
 * THE SCRIM FADE IS COPIED DELIBERATELY, not abstracted. BottomSheet's header
 * explains it: the dim backdrop and the sheet are siblings inside one Modal, so
 * Modal's own "slide" would drag the backdrop up into view instead of fading it
 * in over the page. Driving the dim's opacity and the sheet's translateY
 * separately is what makes the backdrop read as a fade, and `mounted` keeps the
 * Modal alive for the close animation because Modal has no exit hook.
 *
 * Sharing that with BottomSheet would mean a third component whose only job is
 * to own an animation, and the two sheets have nothing else in common. Two
 * copies of fifteen lines, with the reasoning in both, is the cheaper answer —
 * but if a third sheet appears, extract it then.
 *
 * THE VISUAL IS THE THING ITSELF. `image` shows the actual garment being
 * removed rather than a warning glyph: it answers "which one?" in the same
 * breath as "are you sure?", and a caution triangle would be the app's only
 * icon of that kind. Falls back to the name when there is no cutout.
 *
 * DESTRUCTIVE IS NOT THE DEFAULT. "Keep it" is the ghost button and it is
 * listed second, but tapping the scrim also keeps it — the safe answer is
 * reachable three ways and the destructive one exactly once.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
import { Big, Kick, Tiny } from './text';
import { Button } from './controls';

const SCREEN_H = Dimensions.get('window').height;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConfirmSheet({
  visible,
  kick,
  question,
  note,
  confirmLabel,
  cancelLabel = 'Keep it',
  subject,
  image,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  kick: string;
  question: string;
  note?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Name of what is being acted on — captions the visual. */
  subject?: string;
  image?: ImageSourcePropType;
  onConfirm: () => void;
  onCancel: () => void;
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
    /* `progress` is a useRef value and never changes identity; listing it
       satisfies the lint rule without changing when this runs. */
  }, [visible, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_H, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel}>
      <AnimatedPressable
        style={[s.dim, { opacity: progress }]}
        onPress={onCancel}
        accessibilityLabel="Keep it"
      />
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.grab} />

        <Kick tone="alert">{kick}</Kick>
        <Big size={22} style={{ marginTop: 8 }}>
          {question}
        </Big>

        {subject ? (
          <View style={s.subject}>
            <View style={s.photo}>
              {image ? (
                <Image source={image} style={s.image} resizeMode="contain" />
              ) : (
                <Text style={s.photoLabel}>{subject.split(' ')[0]}</Text>
              )}
            </View>
            <Text style={s.subjectName} numberOfLines={2}>
              {subject}
            </Text>
          </View>
        ) : null}

        {note ? <Tiny style={{ marginTop: 12 }}>{note}</Tiny> : null}

        <Button label={confirmLabel} style={{ marginTop: 16 }} onPress={onConfirm} />
        <Button
          label={cancelLabel}
          variant="ghost"
          style={{ marginTop: 8 }}
          onPress={onCancel}
        />
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
  subject: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 16 },
  photo: {
    width: 78,
    height: 78,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  photoLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 17,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  subjectName: {
    flex: 1,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 14,
    lineHeight: 17,
    color: palette.ink,
  },
});

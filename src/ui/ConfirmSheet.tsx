/**
 * A confirmation drawer. One question, one destructive answer, one way out.
 *
 * WHY A DRAWER AND NOT AN ALERT. The app has no native alerts anywhere, and
 * `Alert.alert` would be the only piece of OS chrome in a design this
 * deliberately typeset. The bottom sheet already exists as the app's modal
 * vocabulary (ui/BottomSheet.tsx), so this is the same mechanics with a
 * different payload.
 *
 * THE SCRIM AND SLIDE NOW LIVE IN `ui/Sheet.tsx`. This file used to own its own
 * copy, with a note saying two copies were cheaper than a third component "but
 * if a third sheet appears, extract it then". One did — the submission drawer
 * on the Today card — so it was extracted. All this file owns now is the
 * payload: a question, a picture of the thing, and two answers.
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

import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { palette, border, radius } from '@/theme/tokens';
import { Sheet } from './Sheet';
import { Big, Kick, Tiny } from './text';
import { Button } from './controls';

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
  return (
    <Sheet visible={visible} onDismiss={onCancel} dismissLabel={cancelLabel}>
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
    </Sheet>
  );
}

const s = StyleSheet.create({
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

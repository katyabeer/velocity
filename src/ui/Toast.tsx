/**
 * The toast banner. Mounted once, in app/_layout.tsx, as a sibling of the
 * Stack — it has to float above whatever screen is currently active,
 * survives navigation, and needs no host screen of its own.
 */

import { StyleSheet, Text, View } from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
import { useToast } from '@/state/toast';

export function Toast() {
  const message = useToast((s) => s.message);
  if (!message) return null;

  return (
    <View style={s.wrap} pointerEvents="none">
      <Text style={s.text}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.gutter,
    right: space.gutter,
    bottom: 90,
    zIndex: 50,
    backgroundColor: palette.ink,
    borderRadius: radius.sm,
    borderWidth: border.hair,
    borderColor: palette.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: palette.cream,
  },
});

/**
 * The look plate — the single most repeated object in the app.
 *
 * Right now it renders as a tinted panel with the occasion set large and faint
 * behind it. That is a STAND-IN, not a design: when Jack's renders arrive, add
 * an `image` prop and put an <Image> behind the caption. Nothing else changes.
 *
 * One look, two presentations. THE FLAT LAY IS NOT A FALLBACK — it is the
 * unrendered state, and R-L6 says a failed generation still enters the pool as a
 * composed flat lay. So build the flat lay properly; it is load-bearing, not an
 * error screen.
 */

import { StyleSheet, Text, View, Pressable, type ViewStyle } from 'react-native';
import { palette, border, tintFor, type PlateTint } from '@/theme/tokens';

export function LookPlate({
  tint,
  occasion,
  pieces,
  height,
  label,
  onPress,
  style,
  showCaption = true,
}: {
  tint: PlateTint;
  occasion: string;
  pieces?: string;
  height: number;
  /** What is set large and faint behind the plate. Defaults to the occasion. */
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showCaption?: boolean;
}) {
  const body = (
    <View style={[s.plate, { height, backgroundColor: tintFor(tint) }, style]}>
      <View style={s.image}>
        <Text style={s.ghost}>{(label ?? occasion).replace(' ', '\n')}</Text>
      </View>
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
 */
export function LookPair({
  left,
  right,
  height = 326,
  onPick,
}: {
  left: { tint: PlateTint; occasion: string; pieces: string };
  right: { tint: PlateTint; occasion: string; pieces: string };
  height?: number;
  onPick?: (side: 'a' | 'b') => void;
}) {
  return (
    <View style={s.pair}>
      <View style={{ flex: 1 }}>
        <LookPlate {...left} height={height} label="Look A" onPress={onPick ? () => onPick('a') : undefined} />
      </View>
      <View style={{ flex: 1 }}>
        <LookPlate {...right} height={height} label="Look B" onPress={onPick ? () => onPick('b') : undefined} />
      </View>
    </View>
  );
}

/** The settled split reveal — a two-tone bar with labels underneath. */
export function SplitBar({ share }: { share: number }) {
  return (
    <View>
      <View style={s.split}>
        <View style={[s.splitA, { width: `${share}%` }]} />
        <View style={[s.splitB, { width: `${100 - share}%` }]} />
      </View>
      <View style={s.splitLabels}>
        <Text style={s.splitLabel}>Yours · {share}%</Text>
        <Text style={s.splitLabel}>The other · {100 - share}%</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  plate: {
    borderWidth: border.hair,
    borderColor: palette.line,
    flexDirection: 'column',
  },
  image: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    borderTopColor: palette.line,
    backgroundColor: palette.paper,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  captionKick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 7.5,
    lineHeight: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.klein,
  },
  captionPieces: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 13,
    color: palette.soft,
    marginTop: 4,
  },
  pair: { flexDirection: 'row', gap: 10, paddingHorizontal: 12 },
  split: { flexDirection: 'row', height: 28, borderWidth: border.hair, borderColor: palette.ink },
  splitA: { height: '100%', backgroundColor: palette.klein },
  splitB: { height: '100%', backgroundColor: palette.fill2 },
  splitLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  splitLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.soft,
  },
});

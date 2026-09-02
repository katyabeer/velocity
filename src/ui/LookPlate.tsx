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

import { Image, StyleSheet, Text, View, Pressable, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { palette, border, radius, tintFor, type PlateTint } from '@/theme/tokens';

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
 */
export function LookPair({
  left,
  right,
  height = 326,
  onPick,
}: {
  left: { tint: PlateTint; occasion: string; pieces: string; image?: ImageSourcePropType };
  right: { tint: PlateTint; occasion: string; pieces: string; image?: ImageSourcePropType };
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
  split: { flexDirection: 'row', height: 28, borderWidth: border.hair, borderColor: palette.ink },
  splitA: { height: '100%', backgroundColor: palette.accent },
  splitB: { height: '100%', backgroundColor: palette.creamSunk },
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

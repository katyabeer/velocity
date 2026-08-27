/**
 * Buttons, chips, segmented controls, progress bars, onboarding dots.
 *
 * REVERSED, DO NOT RE-PROPOSE: boxed, filled step ribbons. They read as rows of
 * buttons. The step ribbon is now flat rules — see StepRibbon.tsx, and don't
 * give it a border or a fill.
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, space } from '@/theme/tokens';
import { type as T } from '@/theme/type';

export type ButtonVariant = 'solid' | 'ghost' | 'quiet' | 'off';

export function Button({
  label,
  onPress,
  variant = 'solid',
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
}) {
  const disabled = variant === 'off' || !onPress;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        s.btn,
        variant === 'solid' && s.btnSolid,
        variant === 'ghost' && s.btnGhost,
        variant === 'quiet' && s.btnQuiet,
        variant === 'off' && s.btnOff,
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      <Text
        style={[
          T.button,
          variant === 'solid' && { color: palette.paper },
          variant === 'ghost' && { color: palette.ink },
          variant === 'quiet' && s.btnQuietLabel,
          variant === 'off' && { color: palette.disabledInk },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export type ChipTone = 'default' | 'on' | 'accent' | 'green' | 'alert';

export function Chip({
  label,
  tone = 'default',
  onPress,
}: {
  label: string;
  tone?: ChipTone;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[s.chip, chipTone[tone]]}>
      <Text style={[T.chip, chipLabel[tone]]}>{label}</Text>
    </Pressable>
  );
}

const chipTone: Record<ChipTone, ViewStyle> = {
  default: {},
  on: { borderColor: palette.ink, backgroundColor: palette.ink },
  accent: { borderColor: palette.klein, backgroundColor: palette.kleinTint },
  /** User-authored tags are GREEN. Red tags were reversed — they read as
   *  aggressive. */
  green: { borderColor: palette.green, backgroundColor: palette.greenTint },
  alert: { borderColor: palette.shock, backgroundColor: palette.shockTint },
};

const chipLabel = {
  default: { color: palette.soft },
  on: { color: palette.paper },
  accent: { color: palette.klein },
  green: { color: palette.green },
  alert: { color: palette.shock },
} as const;

/** A horizontal filter rail. `items` are labels; `value` is the active one. */
export function ChipRow({
  items,
  value,
  onChange,
}: {
  items: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {items.map((it) => (
        <Chip key={it} label={it} tone={it === value ? 'on' : 'default'} onPress={() => onChange(it)} />
      ))}
    </View>
  );
}

/** `.seg` — the wardrobe's Pieces / Looks / Saved switch. */
export function Segmented({
  items,
  value,
  onChange,
}: {
  items: readonly { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <View style={s.seg}>
      {items.map((it, i) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[s.segCell, on && { backgroundColor: palette.ink }, i === items.length - 1 && { borderRightWidth: 0 }]}
          >
            <Text style={[s.segLabel, on && { color: palette.paper }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** `.bar` — a 4px progress rule. Klein fill. */
export function Bar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={s.bar} accessibilityRole="progressbar" accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}>
      <View style={[s.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

/** Onboarding progress dots — six slides, o1 through o6. */
export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[s.dot, i === index && { backgroundColor: palette.klein }]} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { height: 50, alignItems: 'center', justifyContent: 'center' },
  btnSolid: { backgroundColor: palette.ink },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: border.mid,
    borderColor: palette.ink,
  },
  btnQuiet: {
    height: 42,
    backgroundColor: 'transparent',
    borderWidth: border.hair,
    borderColor: palette.line,
  },
  btnQuietLabel: {
    color: palette.soft,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10.5,
    letterSpacing: 1.26,
  },
  btnOff: { backgroundColor: palette.disabledFill },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  seg: { flexDirection: 'row', borderWidth: border.hair, borderColor: palette.line },
  segCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRightWidth: border.hair,
    borderRightColor: palette.line,
  },
  segLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  bar: { height: 4, backgroundColor: palette.fill2 },
  barFill: { height: '100%', backgroundColor: palette.klein },
  dots: { flexDirection: 'row', gap: 5, justifyContent: 'center', paddingTop: 15, paddingBottom: 13 },
  dot: { width: 18, height: 3, backgroundColor: palette.line },
});

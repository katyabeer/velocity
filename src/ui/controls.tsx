/**
 * Buttons, chips, segmented controls, progress bars, onboarding dots.
 *
 * v3 (quintets.css): every button is now Big Shoulders Display Black 20px
 * (`.qt-btn` family) — up from Archivo Bold 12px. `lime`/`solid` both fill
 * with the single accent color now; there's no separate onboarding-only
 * button component, just a pill radius (`.qt-btn-onb`) vs. the sm radius
 * everywhere else (`.qt-btn`).
 *
 * REVERSED, DO NOT RE-PROPOSE: boxed, filled step ribbons. They read as rows of
 * buttons. The step ribbon is now flat rules — see StepRibbon.tsx, and don't
 * give it a border or a fill.
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, space, radius } from '@/theme/tokens';
import { type as T } from '@/theme/type';

export type ButtonVariant = 'solid' | 'ghost' | 'quiet' | 'off' | 'onboarding';

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
      /**
       * `disabled`, NOT just `accessibilityState`. On react-native-web the
       * accessibility state does not reach the DOM: an off-variant button
       * rendered with `role="button"`, `tabindex="0"` and no `aria-disabled`
       * at all, so a screen reader was told it was a live control and a
       * keyboard user could tab to it and press Enter to no effect and no
       * explanation. Passing `aria-disabled` and `focusable` by hand does not
       * help either — Pressable drops both. Its own `disabled` prop is what
       * emits the attribute and takes the control out of the tab order.
       *
       * Same class of gap as the missing `aria-checked` on the onboarding
       * rails radios (4 Sep). `accessibilityState` is kept alongside for
       * native, where it is the one that counts.
       */
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        s.btn,
        variant === 'solid' && s.btnSolid,
        variant === 'onboarding' && s.btnOnboarding,
        variant === 'ghost' && s.btnGhost,
        variant === 'quiet' && s.btnQuiet,
        variant === 'off' && s.btnOff,
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      <Text
        style={[
          T.action,
          (variant === 'solid' || variant === 'onboarding') && { color: palette.accentEdge },
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
      <Text style={[T.micro, chipLabel[tone]]}>{label}</Text>
    </Pressable>
  );
}

const chipTone: Record<ChipTone, ViewStyle> = {
  default: {},
  on: { borderColor: palette.ink, backgroundColor: palette.ink },
  accent: { borderColor: palette.accentEdge, backgroundColor: palette.accent },
  /** User-authored tags: quintets.css's `.qt-tag` is a bare text link, not a
   *  filled chip — dropping the border/fill here gets that structurally,
   *  without a separate Tag component. Red tags were reversed before this;
   *  now green (link-color) text is the "user wrote this" signal instead. */
  green: { borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 },
  /** No alert hue survives the v3 collapse (see tokens.ts) — ink border on
   *  the sunk ground is the only distinction left for an exception state. */
  alert: { borderColor: palette.ink, backgroundColor: palette.creamSunk },
};

const chipLabel = {
  default: { color: palette.grey },
  on: { color: palette.cream },
  /** Text sits ON the accent fill, so it needs text-on-accent (ink), not
   *  the bare-text link color — accent itself is ~1.2:1 against cream. */
  accent: { color: palette.ink },
  green: { color: palette.link },
  alert: { color: palette.ink },
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

/** `.qt-filter` — plain text until active, then an ink pill. Distinct from
 *  `Chip`, which always has a border/fill: this is for a lightweight tab row
 *  like the magazine's All / From the room / Filter (the magazine PDF). */
export function FilterTab({
  label,
  on,
  onPress,
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={[s.filterTab, on && s.filterTabOn]}
    >
      <Text style={[T.filter, on && { color: palette.cream }]}>{label}</Text>
    </Pressable>
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
            <Text style={[s.segLabel, on && { color: palette.cream }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** `.qt-bar` (implied) — a 4px progress rule, accent fill. */
export function Bar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={s.bar} accessibilityRole="progressbar" accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}>
      <View style={[s.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

/** `.qt-dots` — onboarding progress dots. Active dot is ink now, not klein —
 *  the new onboarding palette is monochrome + accent, and accent itself
 *  would barely read against the rule-colored inactive dots. */
export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[s.dot, i === index && { backgroundColor: palette.ink }]} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  filterTab: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.sm },
  filterTabOn: { backgroundColor: palette.ink },
  btn: { height: 50, alignItems: 'center', justifyContent: 'center' },
  /** `.qt-btn` — accent fill, ink edge, sm radius. Every solid button in the
   *  app, not just onboarding (see controls.tsx header comment). */
  btnSolid: {
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.sm,
  },
  /** `.qt-btn-onb` — identical fill, pill radius. */
  btnOnboarding: {
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.pill,
  },
  /** `.qt-btn-outline` */
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: border.mid,
    borderColor: palette.ink,
    borderRadius: radius.sm,
  },
  btnQuiet: {
    height: 42,
    backgroundColor: 'transparent',
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
  },
  btnQuietLabel: {
    color: palette.grey,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10.5,
    letterSpacing: 1.26,
  },
  btnOff: { backgroundColor: palette.disabledFill, borderRadius: radius.sm },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.cream,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  seg: { flexDirection: 'row', borderWidth: border.hair, borderColor: palette.rule },
  segCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRightWidth: border.hair,
    borderRightColor: palette.rule,
  },
  segLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  bar: { height: 4, backgroundColor: palette.creamSunk },
  barFill: { height: '100%', backgroundColor: palette.accent },
  dots: { flexDirection: 'row', gap: 5, justifyContent: 'center', paddingTop: 15, paddingBottom: 13 },
  dot: { width: 18, height: 3, backgroundColor: palette.rule },
});

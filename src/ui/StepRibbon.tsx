/**
 * The step ribbon.
 *
 * A PROGRESS READ-OUT, NOT A CONTROL. No box, no solid fill, no tap target —
 * just a rule per step that darkens as you reach it.
 *
 * REVERSED, DO NOT RE-PROPOSE (26 Aug): boxed, filled step ribbons. They read as
 * rows of buttons, and a read-out that looks tappable is a lie about what the
 * screen will do.
 *
 * Used in three places with the same component:
 *  · Today          Build → Judge → Result           (3 steps)
 *  · the builder    Pick → Look → Render → Vote      (4, decision 17)
 *  · Create         Pick → Look → Tag → Render       (4, keeps its tag step)
 */

import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, space } from '@/theme/tokens';

export type StepState = 'todo' | 'now' | 'done';

export type Step = { label: string; hint: string; state: StepState };

export function StepRibbon({ steps, style }: { steps: readonly Step[]; style?: ViewStyle }) {
  return (
    <View style={[s.ribbon, style]}>
      {steps.map((st, i) => (
        <View
          key={st.label}
          style={[
            s.cell,
            st.state === 'now' && s.cellNow,
            st.state === 'done' && s.cellDone,
          ]}
        >
          <Text style={[s.label, st.state === 'now' && { color: palette.ink }]}>
            {i + 1} · {st.label}
          </Text>
          <Text style={[s.hint, st.state === 'now' && { color: palette.soft }]}>{st.hint}</Text>
        </View>
      ))}
    </View>
  );
}

/** Full-bleed variant — the builder and Create ribbons sit edge to edge under
 *  the header and add their own gutter. */
export function StepRibbonBleed({ steps }: { steps: readonly Step[] }) {
  return (
    <View style={s.bleed}>
      <StepRibbon steps={steps} />
    </View>
  );
}

/** Helper: given a 1-based current step, produce the state list. */
export function statesFor(
  labels: readonly { label: string; hint: string }[],
  current: number,
  doneOverrides: readonly boolean[] = [],
): Step[] {
  return labels.map((l, i) => {
    if (doneOverrides[i]) return { ...l, state: 'done' };
    if (i + 1 < current) return { ...l, state: 'done' };
    if (i + 1 === current) return { ...l, state: 'now' };
    return { ...l, state: 'todo' };
  });
}

const s = StyleSheet.create({
  ribbon: { flexDirection: 'row', borderTopWidth: border.hair, borderTopColor: palette.line },
  cell: {
    flex: 1,
    paddingTop: 9,
    paddingHorizontal: 2,
    borderTopWidth: border.heavy,
    borderTopColor: palette.line,
    marginTop: -1,
    opacity: 0.5,
  },
  cellNow: { opacity: 1, borderTopColor: palette.ink },
  cellDone: { opacity: 0.75, borderTopColor: palette.faint },
  label: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  hint: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 11.5,
    marginTop: 4,
    color: palette.faint,
  },
  bleed: {
    paddingHorizontal: space.gutter,
    paddingBottom: 11,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.line,
  },
});

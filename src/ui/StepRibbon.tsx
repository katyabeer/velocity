/**
 * The step ribbon.
 *
 * A PROGRESS READ-OUT, NOT A CONTROL. No box, no solid fill, no tap target —
 * just a rule per step that darkens as you reach it.
 *
 * ONE LINE PER STEP (Katya, 4 Sep). Each cell used to carry a second, smaller
 * line under the label — `3 to 6`, `together`, `who wears it`, `from 8pm`. It
 * doubled the ribbon's height on every screen that has one, to gloss labels
 * that are already a verb each. `Step.hint` is gone rather than merely
 * unrendered, so nothing keeps computing a string with nowhere to go.
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

export type Step = { label: string; state: StepState };

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
  labels: readonly { label: string }[],
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
  ribbon: { flexDirection: 'row', borderTopWidth: border.hair, borderTopColor: palette.rule },
  cell: {
    flex: 1,
    paddingTop: 9,
    paddingHorizontal: 2,
    borderTopWidth: border.heavy,
    borderTopColor: palette.rule,
    marginTop: -1,
    opacity: 0.5,
  },
  cellNow: { opacity: 1, borderTopColor: palette.ink },
  cellDone: { opacity: 0.75, borderTopColor: palette.greyDecor },
  label: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  bleed: {
    paddingHorizontal: space.gutter,
    paddingBottom: 11,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
});

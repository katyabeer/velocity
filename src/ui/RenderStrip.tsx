/**
 * The async render's read-out: "rendering in progress", then "your look is
 * ready".
 *
 * An ink strip, which is the app's existing device for stating a fact about the
 * round that is not up for negotiation (see `Strip` in ui/layout.tsx). This one
 * sits INSIDE the thing it describes — the Today job card, the Create flow —
 * rather than full-bleed under the header, because the fact belongs to the job,
 * not to the screen. That is the whole reason the old floating header chip was
 * retired: see state/submission.ts.
 *
 * TAPPABLE ONLY WHEN THERE IS SOMETHING TO SEE. A progress strip that responds
 * to a tap while it is still working is a lie about what the tap will do, and
 * tapping through is the only thing that clears the tab's dot — so the target
 * has to actually lead somewhere.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, radius } from '@/theme/tokens';
import { type as T } from '@/theme/type';

export function RenderStrip({
  ready,
  onPress,
  pendingNote = 'About a minute',
}: {
  ready: boolean;
  onPress: () => void;
  pendingNote?: string;
}) {
  const body = (
    <View style={[s.strip, ready && s.stripReady]}>
      <Text style={[s.label, ready && { color: palette.ink }]}>
        {ready ? 'your look is ready' : 'rendering in progress'}
      </Text>
      <Text style={[s.value, ready && { color: palette.ink }]}>
        {ready ? 'Take a look →' : pendingNote}
      </Text>
    </View>
  );

  if (!ready) return body;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="See your look">
      {body}
    </Pressable>
  );
}

const s = StyleSheet.create({
  strip: {
    backgroundColor: palette.ink,
    borderRadius: radius.xs,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,
  },
  /** Accent fill with its ink keyline once there is something to see — the
   *  same "this is yours, and it is new" signal the token badge and the New
   *  flag already use. Accent is a fill only; text on it goes ink. */
  stripReady: {
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
  },
  /** Light accent pops fine against dark ink — the "illegible on cream"
   *  contrast problem only applies to accent-on-light. */
  label: { ...T.eyebrow, color: palette.accent, letterSpacing: 1.44 },
  value: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 15.5,
    color: '#EDEBE4',
    marginTop: 4,
  },
});

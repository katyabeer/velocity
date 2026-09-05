/**
 * The async render's read-out: generating → ready, or generating → failed.
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

/**
 * ONE `status`, NOT TWO BOOLEANS (4 Sep). It was `ready: boolean`, which had no
 * way to say the job died — the card fell back to "generating your look"
 * forever. A second `failed` flag alongside `ready` could contradict it; a
 * single value matching `RenderStatus` minus `'none'` cannot.
 */
export type StripStatus = 'pending' | 'ready' | 'failed';

export function RenderStrip({
  status,
  onPress,
  pendingNote = 'About a minute',
}: {
  status: StripStatus;
  /** Tapping through on `ready` is the only thing that clears the tab's dot;
   *  on `failed` it is the retry. */
  onPress: () => void;
  pendingNote?: string;
}) {
  /* Both live reads take the accent; only the pending one is muted. A failure
     the user can act on should look no quieter than a success — it is the one
     of the three that needs a tap. */
  const lit = status !== 'pending';

  const body = (
    <View style={[s.strip, lit && s.stripReady]}>
      <Text style={[s.label, lit && { color: palette.ink }]}>
        {status === 'ready'
          ? 'your look is ready'
          : status === 'failed'
            ? 'that didn’t generate'
            : 'generating your look'}
      </Text>
      <Text style={[s.value, lit && { color: palette.ink }]}>
        {status === 'ready' ? 'Take a look →' : status === 'failed' ? 'Try again →' : pendingNote}
      </Text>
    </View>
  );

  /* TAPPABLE ONLY WHEN THERE IS SOMETHING TO DO. A progress strip that responds
     to a tap while it is still working is a lie about what the tap will do. */
  if (status === 'pending') return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={status === 'failed' ? 'Try generating again' : 'See your look'}
    >
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

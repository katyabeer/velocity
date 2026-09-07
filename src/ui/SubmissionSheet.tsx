/**
 * WHAT YOU ENTERED, on demand (Katya, 4 Sep).
 *
 * The completed card used to show the look inline, beside the countdown. It now
 * offers a link instead, and the look opens in here — which is the right trade
 * on a card whose job is to report the day's state: the picture is the thing
 * you MIGHT want, not the thing you need to read, and inline it was the tallest
 * element on the card in the one state where nothing is left to do.
 *
 * The challenge title comes with it, because a look with no job attached is
 * just clothes — the whole point of the entry is that it was an answer to
 * something.
 *
 * Chrome is `ui/Sheet.tsx`. This file is only the payload.
 *
 * ⚠ ONE WAY OUT, AND IT IS NOT DESTRUCTIVE. Unlike ConfirmSheet there is no
 * second answer here: looking at your own entry has no consequence, so the
 * scrim, the button and the back gesture all do the same harmless thing.
 */

import { View } from 'react-native';
import { ComposedFlatLay, TIGHTEN_PREVIEW } from './ComposedFlatLay';
import { Big, Kick } from './text';
import { Button } from './controls';
import { Sheet } from './Sheet';

export function SubmissionSheet({
  visible,
  job,
  pieces,
  onDismiss,
}: {
  visible: boolean;
  /** The challenge it was an answer to. */
  job: string;
  pieces: readonly string[];
  onDismiss: () => void;
}) {
  return (
    <Sheet visible={visible} onDismiss={onDismiss} dismissLabel="Close">
      <Kick tone="muted">your submission</Kick>
      <Big size={22} style={{ marginTop: 8 }}>
        {job}
      </Big>

      {/* Tightened, like the builder's own preview — the pieces read as one
          arrangement rather than a grid of separate photographs. */}
      <View style={{ marginTop: 14 }}>
        <ComposedFlatLay pieces={pieces} tighten={TIGHTEN_PREVIEW} />
      </View>

      <Button label="Close" variant="ghost" style={{ marginTop: 16 }} onPress={onDismiss} />
    </Sheet>
  );
}

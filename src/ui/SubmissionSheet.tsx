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
 * ══ IT ALSO CARRIES A FREESTYLE LOOK NOW (Katya, 7 Sep) ══
 * Create's generate step used to route through to a17 to show the finished
 * look; it opens this instead, "mirroring the view-rendered-look behaviour on
 * today's challenge". A freestyle look genuinely has no job — that is what
 * freestyle MEANS — so `job` is optional, and when it is absent the only
 * description the look has is its own tags. Those come in as `caption`
 * already formatted: this file stays ignorant of `domain/tags`, which is a
 * shared sheet's business to stay out of.
 *
 * Chrome is `ui/Sheet.tsx`. This file is only the payload.
 *
 * ⚠ ONE WAY OUT, AND IT IS NOT DESTRUCTIVE. Unlike ConfirmSheet there is no
 * second answer here: looking at your own entry has no consequence, so the
 * scrim, the button and the back gesture all do the same harmless thing.
 */

import { View } from 'react-native';
import { RenderedLook } from './RenderedLook';
import { Big, Kick, Tiny } from './text';
import { Button } from './controls';
import { Sheet } from './Sheet';

/**
 * ⚠ `pieces` IS GONE FROM THE PROPS (7 Sep). It fed the flat lay, and the
 * picture is a photograph now — so the prop had nothing left to draw. Removed
 * rather than left in place: a prop nothing reads is a trap, because the next
 * person assumes the image comes from it. When the real render pipeline lands
 * this takes a URI instead.
 */
export function SubmissionSheet({
  visible,
  job,
  caption,
  onDismiss,
}: {
  visible: boolean;
  /** The challenge it was an answer to. OMITTED for a freestyle look. */
  job?: string;
  /** Freestyle only: a pre-formatted line under the look — its tags. */
  caption?: string;
  onDismiss: () => void;
}) {
  return (
    <Sheet visible={visible} onDismiss={onDismiss} dismissLabel="Close">
      {/* Two different objects, so two different words. An entry is a
          SUBMISSION — it went somewhere and is being judged. A freestyle look
          is just yours. */}
      <Kick tone="muted">{job ? 'your submission' : 'your look'}</Kick>
      {job ? (
        <Big size={22} style={{ marginTop: 8 }}>
          {job}
        </Big>
      ) : null}

      {/* THE GENERATED LOOK, not the flat lay (Katya, 7 Sep). Both drawers
          this serves — Today's completed card and Create's ready state — open
          on a finished generation, so they show the look worn. The flat lay
          belongs to the two moments before that: the pre-commit preview and
          the pending state. */}
      <View style={{ marginTop: 14 }}>
        <RenderedLook />
      </View>

      {caption ? <Tiny style={{ marginTop: 12 }}>{caption}</Tiny> : null}

      <Button label="Close" variant="ghost" style={{ marginTop: 16 }} onPress={onDismiss} />
    </Sheet>
  );
}

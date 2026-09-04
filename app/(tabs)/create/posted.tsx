/**
 * a17 · SUCCESS — reached two different ways now.
 *
 * Via the dot on the Create tab (see ui/TabIcon.tsx): a render was spent,
 * posted to the magazine or saved privately, and this shows the real composed
 * flat lay of what was actually picked — never a generic placeholder. Detected
 * by the create lane's `seen`, which only ever becomes true the moment the
 * badge is tapped, immediately before navigating here.
 *
 * Directly, from the Render step's "Save to my looks" fallback (no render
 * left today): instant, unrendered — reads straight off useCreate() instead,
 * since that path never touches the submission store at all.
 *
 * A badge-tap submission is CAPTURED ONCE ON MOUNT and then cleared from the
 * store — without that, `pending.seen` stays true forever, and a later,
 * unrelated visit here (the zero-renders-left instant save, or a second
 * "Make another") would wrongly keep reading this same stale record instead
 * of Create's own live state.
 *
 * "No score, no placing. Somebody might spend a token on it — you'll know if
 * they do." That sentence is the whole freestyle economy in one line — only
 * true for the MAGAZINE destination. A privately-saved render, rendered or
 * not, was never eligible to earn that way — its copy says so instead.
 */

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll, Wrap } from '@/ui/layout';
import { Body, Tiny } from '@/ui/text';
import { Button, Chip } from '@/ui/controls';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { palette } from '@/theme/tokens';
import { useCreate } from '@/state/create';
import { useSubmission } from '@/state/submission';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';

export default function Posted() {
  const submissionPending = useSubmission((s) => s.lanes.create);
  const clearSubmission = useSubmission((s) => s.clear);

  const cPicks = useCreate((s) => s.picks);
  const cOccasion = useCreate((s) => s.occasion);
  const cFreeTags = useCreate((s) => s.freeTags);
  const cDestination = useCreate((s) => s.destination);
  const startAgain = useCreate((s) => s.startAgain);
  const entered = useEntry((s) => s.entered);
  const phase = useSession((s) => s.phase);

  /** Frozen at mount, not re-derived on every render — otherwise clearing
   *  the submission below would flip the content mid-view. */
  const [view] = useState(() =>
    submissionPending?.seen
      ? {
          rendered: true,
          picks: submissionPending.picks,
          occasion: submissionPending.occasion,
          freeTags: submissionPending.freeTags,
          destination: submissionPending.destination,
        }
      : {
          rendered: false,
          picks: cPicks.map((p) => p.name),
          occasion: cOccasion,
          freeTags: cFreeTags,
          destination: cDestination,
        },
  );

  useEffect(() => {
    if (submissionPending?.seen) clearSubmission('create');
    // Deliberately once, on mount — this screen "consumes" a seen submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const posting = view.destination === 'magazine';
  const title = posting ? "It's up" : 'Saved';
  const subtitle = posting
    ? 'Somewhere in the magazine'
    : view.rendered
      ? 'Rendered, and kept out of the magazine'
      : 'In your looks, unrendered';

  return (
    <Screen>
      <LogoBlock title={title} subtitle={subtitle} />

      <Scroll>
        <View style={{ marginTop: 6 }}>
          <ComposedFlatLay pieces={view.picks} />
        </View>

        <Wrap style={{ marginTop: 12 }}>
          {view.occasion ? <Chip label={view.occasion} tone="on" /> : null}
          {view.freeTags.map((t) => (
            <Chip key={t} label={t} tone="green" />
          ))}
        </Wrap>

        <Body style={{ marginTop: 10 }}>
          {posting
            ? "No score, no placing. Somebody might spend a token on it — you'll know if they do."
            : view.rendered
              ? "Nobody can take a piece from something they can't see — this one's just for you."
              : 'No render spent on this one. Find it any time in Wardrobe → Looks.'}
        </Body>

        <Gap />
      </Scroll>

      <Foot>
        <Button
          label={posting ? 'Go to the magazine' : 'Go to your wardrobe'}
          onPress={() => router.push(posting ? '/(tabs)/magazine' : '/(tabs)/wardrobe')}
        />

        {/* Offered only if there is still a job to enter. Once you are in, this
            disappears — there is nothing to go back to. */}
        {!entered ? (
          <Button
            label={phase === 'entry' ? "Enter today's job" : "Vote on tonight's looks"}
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={() =>
              router.push(phase === 'entry' ? '/(tabs)/today/build' : '/(tabs)/today/judging')
            }
          />
        ) : null}

        <Tiny
          color={palette.link}
          style={{ marginTop: 14, textAlign: 'center', fontFamily: 'Archivo_700Bold' }}
          onPress={() => {
            startAgain();
            router.replace('/(tabs)/create');
          }}
        >
          Make another →
        </Tiny>
      </Foot>
    </Screen>
  );
}

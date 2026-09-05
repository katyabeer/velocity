/**
 * a17 · POSTED — the freestyle look, published.
 *
 * IT PUBLISHED ITSELF. Nothing on this screen decides anything; the decision
 * was the step-2 commit, and by the time a render exists it is minutes old.
 * That is the whole point of moving the commit up: there is no
 * see-then-decide step at any point in Create (create brief §4). So the copy
 * reports rather than confirms, and there is no "post it?" control anywhere.
 *
 * THE PRIVATE-SAVE VARIANT IS GONE. This screen used to have two faces —
 * posted to the magazine, or rendered and kept back — plus a third for an
 * unrendered save. All three collapsed on 4 Sep into one: render or nothing
 * (§2.2). What that costs, accepted: once today's render is spent Create has
 * nothing to do, which is why the tab's `spent` state shows the render at full
 * size rather than an empty message.
 *
 * ══ THIS SCREEN NO LONGER CLEARS THE SUBMISSION, AND MUST NOT ══
 *
 * It used to drop the record on mount. That was correct when the only other
 * reader was the zero-renders-left instant save, which would otherwise have
 * read a stale `seen` record instead of live state — and that path is deleted
 * (§2.2), so the reason is gone.
 *
 * Clearing is now actively WRONG, and it showed up immediately as "Not
 * published yet" on this very screen: the record carries `publishedAt`, which
 * is what opens the fifteen-minute re-render window, and `rerenderUsed`, which
 * is what closes it after one go. The Create tab's `spent` state reads the
 * same record for the render it shows all day. Dropping it on the way past
 * throws away today's published look.
 *
 * `markSeen` is what clears the tab's dot, and it is enough on its own.
 *
 * ══ THE RE-RENDER IS OFFERED HERE, WITH ALL THREE CONSTRAINTS ══
 *
 * This reverses D-brief invariant 5 ("the render is faithful"), and it is only
 * safe because of the constraints — read domain/renders.ts before touching it.
 * Frozen input, replaces in place, and the window shuts on the first reaction
 * or fifteen minutes, whichever comes first. A look that draws a reaction in
 * nine seconds loses its window in nine seconds; that is correct.
 *
 * There is no edit path beside the re-render, deliberately. Editable tags
 * after reactions land is another route to optimising against the room.
 */

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Body, Kick, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { palette, border } from '@/theme/tokens';
import { chipLabel } from '@/domain/tags';
import { RERENDER_BLOCK_LINES, RERENDER_NOTE, rerenderVerdict } from '@/domain/renders';
import { useCreate } from '@/state/create';
import { useSubmission } from '@/state/submission';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';

export default function Posted() {
  const job = useSubmission((s) => s.lanes.create);

  const cPicks = useCreate((s) => s.picks);
  const cTags = useCreate((s) => s.tags);
  const rerender = useCreate((s) => s.rerender);
  const startAgain = useCreate((s) => s.startAgain);
  const entered = useEntry((s) => s.entered);
  const phase = useSession((s) => s.phase);

  /** Frozen at mount, not re-derived on every render — otherwise clearing the
   *  submission below would flip the content mid-view. */
  const [view] = useState(() => ({
    picks: job?.picks ?? cPicks.map((p) => p.name),
    tags: job?.tags ?? cTags,
  }));

  /* The verdict is NOT frozen: the window is a live thing, and a reaction
     landing while this screen is open has to close the offer. */
  const verdict = rerenderVerdict({
    publishedAt: job?.publishedAt ?? null,
    rerenderUsed: job?.rerenderUsed ?? false,
    reactions: job?.reactions ?? 0,
    now: Date.now(),
  });

  return (
    <Screen>
      <LogoBlock title="It’s up" subtitle="Somewhere in the magazine" />

      <Scroll>
        <View style={{ marginTop: 6 }}>
          <ComposedFlatLay pieces={view.picks} />
        </View>

        {view.tags.length ? (
          <Tiny style={{ marginTop: 12 }}>{view.tags.map(chipLabel).join('  ')}</Tiny>
        ) : null}

        <Body style={{ marginTop: 10 }}>
          No score, no placing. Somebody might spend a token on it — you&apos;ll know if they do.
        </Body>

        <View style={s_block}>
          <Kick tone="muted">one more go at it</Kick>
          <Body style={{ marginTop: 6 }}>{RERENDER_NOTE}</Body>
          {verdict.allowed ? (
            <Button label="Generate it again" variant="ghost" style={{ marginTop: 12 }} onPress={rerender} />
          ) : (
            <Tiny style={{ marginTop: 10 }}>{RERENDER_BLOCK_LINES[verdict.because]}</Tiny>
          )}
        </View>

        <Gap />
      </Scroll>

      <Foot>
        <Button label="Go to the magazine" onPress={() => router.push('/(tabs)/magazine')} />

        {/* Offered only if there is still a job to enter. Once you are in,
            this disappears — there is nothing to go back to. */}
        {!entered ? (
          <Button
            label={phase === 'entry' ? "Enter today's job" : 'Vote now'}
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={() =>
              router.push(phase === 'entry' ? '/(tabs)/today/build' : '/(tabs)/today/judging')
            }
          />
        ) : null}

        {/* "Make another" is gone. There is no another — one render a day, and
            offering a second is the tab promising something it will refuse two
            taps later. The Create tab's own `spent` state is where the user
            lands instead, and it says when the next one arrives. */}
        <Tiny
          color={palette.link}
          style={{ marginTop: 14, textAlign: 'center', fontFamily: 'Archivo_700Bold' }}
          onPress={() => {
            startAgain();
            router.replace('/create');
          }}
        >
          Back to Create →
        </Tiny>
      </Foot>
    </Screen>
  );
}

const s_block = {
  marginTop: 24,
  paddingTop: 16,
  borderTopWidth: border.hair,
  borderTopColor: palette.rule,
};

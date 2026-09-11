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
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Body, Hero, Link, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { RenderedLook } from '@/ui/RenderedLook';
import { chipLabel } from '@/domain/tags';
import { useCreate } from '@/state/create';
import { useSubmission } from '@/state/submission';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';

export default function Posted() {
  const job = useSubmission((s) => s.lanes.create);

  const cPicks = useCreate((s) => s.picks);
  const cTags = useCreate((s) => s.tags);
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

  return (
    <Screen>
      {/* THE HEADLINE IS ON THE SCREEN, NOT IN THE BAR (Katya, 4 Sep). "It's
          up" was the masthead's title with "Somewhere in the magazine" as its
          subtitle — a piece of news set as chrome, on the one screen whose
          whole job is to deliver it. The bar is a bare chevron now and the
          news is a heading. */}
      <Header onBack={() => router.back()} />

      <Scroll>
        <Hero>{'It’s\nup.'}</Hero>
        {/* One paragraph, replacing three fragments: the subtitle, the
            "no score, no placing" line, and the re-render panel's note. It
            says what happened, what might happen, and when to come back —
            which is everything this screen has to do. */}
        <Body style={{ marginTop: 10 }}>
          That&apos;s your freestyle look for today. We&apos;ve posted it to the Magazine.
          Somebody might spend a token on it — you&apos;ll know if they do. Come back tomorrow
          to create another one.
        </Body>

        {/* SMALLER (Katya, 4 Sep). It was full width, which made a screen with
            one message on it mostly picture — and you have just spent two
            screens looking at these pieces. */}
        {/* The published look, worn (Katya, 7 Sep) — not the flat lay. It has
            generated and posted by the time this screen exists. */}
        <View style={s_preview}>
          {/* WATERMARKED — the finished look at the end of the Create
              journey. One of four sites; see ui/LookWatermark.tsx. */}
          <RenderedLook watermark />
        </View>

        {view.tags.length ? (
          <Tiny style={{ marginTop: 12 }}>{view.tags.map(chipLabel).join('  ')}</Tiny>
        ) : null}

        {/* ⚠ THE RE-RENDER IS NOT OFFERED HERE ANY MORE (Katya, 4 Sep). It was
            a panel with the three constraints and a "Generate it again"
            button. Create brief AC 9 wants it "on a17 and on the owner's own
            magazine card"; it now lives ONLY in the Create tab's `spent`
            state, which is where you land next and which reads the same
            verdict. The window is unchanged — frozen input, in place, and it
            shuts on the first reaction or 15 minutes — so removing the control
            here shortens the window in practice, because you have to navigate
            to find it. Say if it should come back. */}

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
        <Link
          style={{ marginTop: 14, textAlign: 'center' }}
          onPress={() => {
            startAgain();
            router.replace('/create');
          }}
        >
          Back to Create →
        </Link>
      </Foot>
    </Screen>
  );
}

/** A third of the width. Enough to confirm which look it was, not enough to
 *  become the screen. */
const s_preview = { width: '46%' as const, marginTop: 18 };


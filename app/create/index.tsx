/**
 * a11 · CREATE — the freestyle flow, and the tab that hosts it.
 *
 * NO BRIEF AND NO SCORE. This is the pressure valve: the daily job is one
 * entry with a deadline, and this is where you make things for no reason.
 * NOTHING HERE IS A BRIEF — no brief title, no slots against a brief, no
 * entry, no comparison pool, no band, no result screen, no voting. A freestyle
 * look never settles. Asserted in tests/renders.test.ts, because two flows
 * sharing a chassis makes sharing the copy with it perpetually tempting.
 *
 * ══ THE TAB IS A STATE MACHINE, NOT A SCREEN ══
 *
 * Six states (`createTabState` in domain/renders.ts), and only two of them are
 * the flow. The important one is `spent`: since the save-unrendered path was
 * deleted on 4 Sep, a spent user cannot do anything with a look, so they never
 * see step 1 at all. That is not a restriction bolted on — it is the whole
 * reason the flow is blocked at ENTRY rather than at the commit button.
 *
 * ══ FOUR STEPS: PICK · LOOK · TAG · RENDER ══
 *
 * Model came out of the ribbon (4 Sep). Casting is a screen shared with the
 * builder, not a step, which is how the builder already treats it — so the
 * header's "of 4" is finally true.
 *
 * ⚑ THE COMMIT IS AT STEP 2, on the flat lay, and it is the only irreversible
 * tap in the tab. There is NO see-then-decide step anywhere after it: by the
 * time a render exists the decision to publish it is minutes old. Backing out
 * of step 2 asks first, because with no save path abandonment is lossy.
 *
 * ⚠ JACK'S OPEN QUESTION 4 is still open: Create allows layering, a brief
 * entry is five slots. The renderer has to know which contract it is
 * honouring.
 */

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Pinned, Screen, Scroll } from '@/ui/layout';
import { Hero, Big, Lede, Body, Tiny, Kick, Link } from '@/ui/text';
import { Bar, Button, ChipRow } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { GarmentGrid, SlotStrip } from '@/ui/pieces';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { RenderStrip } from '@/ui/RenderStrip';
import { SubmissionSheet } from '@/ui/SubmissionSheet';
import { ConfirmSheet } from '@/ui/ConfirmSheet';
import { TagInput } from '@/ui/TagInput';
import { Card, EmptyState } from '@/ui/cards';
import { palette, border } from '@/theme/tokens';
import { CATEGORIES, categoryOf, slotOf, type Category } from '@/domain/garments';
import { MAX_PIECES, MIN_PIECES, isPicked, isSlotOccupied, slotStrip } from '@/domain/entry';
import {
  CREATE_RIBBON,
  LEAVE_WITHOUT_RENDERING,
  NEXT_RENDER_LINE,
  ONE_A_DAY_AMBIENT,
  ONE_A_DAY_AT_COMMIT,
  ONE_A_DAY_WHEN_SPENT,
  RERENDER_BLOCK_LINES,
  RERENDER_NOTE,
  createTabState,
  rerenderVerdict,
} from '@/domain/renders';
import { MAX_TAGS, chipLabel } from '@/domain/tags';
import { BUILDER_POOL_ESTABLISHED } from '@/data/inventory';
import { garmentImage } from '@/data/catalogue';
import { useCreate, useFreestyleLeft } from '@/state/create';
import { useSubmission } from '@/state/submission';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';

/**
 * THE WAY OUT OF CREATE. It moved out of the tab bar on 4 Sep, so there is no
 * bar underneath its home states to leave by — this is the only exit, and
 * every screen wearing the masthead has to offer it.
 *
 * Falls back to the Wardrobe rather than failing silently: a cold deep link
 * straight to `/create` has nothing to pop, and the Wardrobe is where the door
 * in is. Same defensive shape as the builder's chevron.
 */
const leaveCreate = () =>
  router.canGoBack() ? router.back() : router.replace('/(tabs)/wardrobe');

export default function Create() {
  const c = useCreate();
  const left = useFreestyleLeft();
  const day = useSession((s) => s.day);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);
  const owned = useWardrobe((s) => s.pieces);
  const job = useSubmission((s) => s.lanes.create);

  const [leaving, setLeaving] = useState(false);
  const [tagFocused, setTagFocused] = useState(false);

  /* Create offers what you OWN, always — it is the pressure valve, not a
     shop. On Day 1 that is the look you entered this morning, which is the
     point: freestyle is for recombining your own wardrobe. */
  const pool: readonly string[] = day >= 3 ? BUILDER_POOL_ESTABLISHED : owned.map((p) => p.name);

  const state = createTabState({
    poolSize: pool.length,
    minPieces: MIN_PIECES,
    left,
    inFlight: job?.status === 'pending',
    failed: job?.status === 'failed',
    inFlow: c.step > 1,
  });

  if (state === 'failed') return <Failed />;
  if (state === 'insufficient') return <Insufficient />;
  /* RENDER IS A STATE, NOT A STEP IN THE SWITCH. It takes no input, and a
     re-render is launched from the `spent` state where `step` has already been
     reset to 1 — so driving it off `step` alone showed the PICKER while a job
     was in flight. It reads the job record, which is also what makes a
     re-render's frozen input free: there is nothing else for it to read. */
  if (state === 'rendering' || c.step === 4) return <Rendering />;
  if (state === 'spent') return <Spent />;

  /* ── available · building · rendering: the flow itself ───────────────── */

  const visible = pool.filter((n) => c.filter === 'All' || categoryOf(n) === c.filter);
  /* Only rails the pool can actually fill — an empty rail is a dead end.
     Canonical order, and the full category list so a legacy Accessories name
     stays reachable by filter (see railsFor in today/build.tsx). */
  const railsPresent = new Set(pool.map(categoryOf));
  const rails = CATEGORIES.filter((cat) => railsPresent.has(cat));

  /* Casting has no segment, so the ribbon reads the step directly — which is
     the point of taking Model out of it. */
  const ribbon = statesFor(
    CREATE_RIBBON.map((s) => ({ label: s.label })),
    c.step,
  );

  const canAdvance = c.picks.length >= MIN_PIECES;

  /* Step 2 is the only place the chevron can lose work, so it is the only
     place that asks. Step 3 is PAST the commit and has nothing to go back to,
     so it gets no chevron at all rather than a dead one. */
  const onBack = c.step === 2 ? () => setLeaving(true) : undefined;

  return (
    <Screen>
      {/* THE IN-FLOW HEADER, ON EVERY CREATE SCREEN (Katya, 4 Sep).
          ⟲ This REVERSES the masthead she asked for on the same screen earlier
          the same day, and the reversal is correct: Create was a tab then. It
          is a pushed route now, entered from the Wardrobe banner, so a
          `LogoBlock` claimed a place in the hierarchy it no longer has — the
          same reasoning that took the masthead off the challenges list.

          ══ AND NO TITLE IN IT AT ALL (Katya, 7 Sep) ══
          It read "Create" on all five states. That came off for the same
          reason the day's flow lost "Pick your pieces", "Preview your look"
          and the rest on 4 Sep: the ribbon directly below says which step you
          are on, and every step has its own heading. The bar keeps the chevron
          and the token badge, which are the only things on it that are not
          repetition.

          ⚠ WHAT THE LABEL WAS ACTUALLY FOR, so nobody re-adds it by accident
          and nobody is surprised: it was the only thing on screen saying WHICH
          FLOW you were in. Create's step 1 and the builder's step 1 now both
          read "Pick your pieces" under a bare chevron, and nothing
          distinguishes them. That is the accepted cost — the two flows are
          reached from different places and only one of them has a brief above
          the grid — but it is a real one. Katya's call.

          No count in it either. The tag count lives beside the FIELD it
          governs (ui/TagInput.tsx) — in the header it was a second copy of the
          same number three lines above the first, which is the same mistake
          the builder's "0 of 6" made before it moved into the slot strip. */}
      <Header onBack={c.step === 1 ? leaveCreate : onBack} />

      <StepRibbonBleed steps={ribbon} />

      {/* ── 1 · PICK ────────────────────────────────────────────────────── */}
      {c.step === 1 ? (
        <>
          <Pinned>
            <View style={s_row}>
              <Kick>your look</Kick>
              <Tiny color={palette.ink} style={{ fontFamily: 'Archivo_700Bold' }}>
                {c.picks.length} of {MAX_PIECES}
              </Tiny>
            </View>
            <View style={{ marginTop: 8 }}>
              <SlotStrip
                slots={slotStrip(c.picks).map((sl) => ({
                  slot: sl.slot,
                  name: sl.pick?.name,
                  image: sl.pick ? garmentImage(sl.pick.name) : undefined,
                }))}
                onClear={(name) => c.putBack(name)}
              />
            </View>
            <View style={{ marginTop: 9 }}>
              <Bar progress={c.picks.length / MAX_PIECES} />
            </View>
            {/* No instruction under the strip — see the note in
                today/build.tsx. It explained what the strip already shows. */}
          </Pinned>

          <Scroll>
            {/* MATCHED TO THE BUILDER'S BRIEF TITLE (Katya, 4 Sep) — `Lede`,
              not the display `Hero` it was. The two screens are the same step
              of two flows and sat directly across from each other in review:
              one shouting in 36px caps, the other stating the job in 23px
              italic. This is Create's brief — it has none, and "Make anything"
              IS the brief — so it should be set like one. */}
          <Lede>Make anything.</Lede>
            {/* Placement 1 of the one-a-day rule (§7): ambient, present, not
                argued. Never in onboarding — this is learned in context. */}
            <Body style={{ marginTop: 8 }}>
              No brief and no score. {ONE_A_DAY_AMBIENT}
            </Body>

            <View style={{ marginTop: 14 }}>
              <ChipRow
                items={['All', ...rails]}
                value={c.filter}
                onChange={(v) => c.setFilter(v as Category | 'All')}
              />
            </View>

            <GarmentGrid
              style={{ marginTop: 11 }}
              items={visible.map((n) => ({
                name: n,
                image: garmentImage(n),
                selected: isPicked(c.picks, n),
                /* A filled slot dims but stays tappable — picking into it
                   swaps rather than refusing. */
                dimmed: isSlotOccupied(c.picks, slotOf(n)) && !isPicked(c.picks, n),
              }))}
              onPress={c.toggle}
            />
            <Gap />
          </Scroll>
        </>
      ) : null}

      {/* ── 2 · LOOK — ⚑ the commit ─────────────────────────────────────── */}
      {c.step === 2 ? (
        <Scroll>
          {/* "Together." became a question (Katya, 4 Sep). This is the commit
              screen, and a statement about the pieces was the wrong register
              for the one tap that cannot be undone — the heading should ask
              for the decision it is about to take.

              "Not a render — the actual pieces, laid out. No body, no fit."
              came off earlier the same day, for the same reason the plate's
              own caption bar went on 3 Sep: the picture below is a picture of
              clothes, and a sentence stating what it ISN'T is the loudest
              thing on the screen. */}
          <Hero>{'Ready to\ngenerate\nthis look?'}</Hero>
          {/* The rule, once, here — and NOT again above the button. It used to
              be both: this line explained the spend and the footer repeated it
              in a kicker plus a `Lede`. Two statements of one rule on one
              screen is how a rule stops being read. */}
          <Body style={{ marginTop: 10 }}>{ONE_A_DAY_AT_COMMIT}</Body>
          <View style={{ marginTop: 16 }}>
            <ComposedFlatLay pieces={c.picks.map((p) => p.name)} />
          </View>
          <Gap />
        </Scroll>
      ) : null}

      {/* ── 3 · TAG ─────────────────────────────────────────────────────── */}
      {c.step === 3 ? (
        <Scroll>
          <Hero>Tag it.</Hero>
          {/* THE INSTRUCTION SITS ON THE FIELD, not at the top of the screen
              (Katya, 4 Sep). It tells you what to type, so it belongs where
              you type — two paragraphs above the input it was a preamble, and
              the cap it names is enforced by the input's own "n of 5".

              The paragraph that was here — "skip it if you like… cannot be
              changed once it posts" — came off with it. Both facts are still
              true and both are still enforced (zero tags publishes fine;
              TAGS_EDITABLE_AFTER_PUBLISH is false), they are just no longer
              argued at someone who has not typed anything yet. */}
          <View style={{ marginTop: 20 }}>
            <Body style={{ marginBottom: 10 }}>
              Add up to {MAX_TAGS} — think occasion, style, mood, trend. Your words, not ours.
            </Body>
            <TagInput
              tags={c.tags}
              draft={c.draft}
              rejection={c.rejection}
              focused={tagFocused}
              onChangeDraft={c.setDraft}
              onCommit={c.commitDraft}
              onRemove={c.removeTag}
              onFocus={() => setTagFocused(true)}
              onBlur={() => setTagFocused(false)}
            />
          </View>

          {/* The "already paid for" panel came off (Katya, 4 Sep). It said the
              generation was spent and there was nothing left to decide — on
              the screen that is asking you to decide something. The
              irreversibility is stated at the commit, which is where it costs
              something; repeating it afterwards only makes the remaining steps
              feel like paperwork. */}
          <Gap />
        </Scroll>
      ) : null}

      <Foot>
        {c.step === 1 ? (
          <Button
            label={
              canAdvance
                ? 'See them together →'
                : `At least ${MIN_PIECES} pieces (${c.picks.length} of ${MAX_PIECES})`
            }
            variant={canAdvance ? 'solid' : 'off'}
            onPress={canAdvance ? () => c.setStep(2) : undefined}
          />
        ) : null}

        {/* ONE action, not two. The private-save half is deleted: render or
            nothing (§2.2).

            Placement 2 of the one-a-day rule, and the load-bearing one: the
            rule at the moment it costs something. It sits IN THE FOOTER rather
            than above the plate because the plate is tall enough to push
            anything above it off screen — a rule about spending that is not
            visible when you spend is not a placement.

            IT IS NO LONGER A LINE OF SMALL PRINT (Katya, 4 Sep). It was the
            prototype's #crendnote verbatim — "rendering is the expensive bit,
            so it is one a day, and only rendered looks can go in the
            magazine" — set in `Tiny` above the button, which is the size the
            eye skips at exactly the moment it must not. Now a kicker naming
            the rule and one short line at `Lede`, so the constraint is read
            rather than available to be read.

            The magazine clause went with it. It was true when an unrendered
            look could be saved instead; §2.2 deleted that path, so it now
            distinguishes rendered looks from nothing at all. */}
        {c.step === 2 ? (
          /* The one-a-day rule moved INTO the body copy above (Katya, 4 Sep),
             so the footer is the action alone. It was a kicker plus a `Lede`
             directly under a body line making the same point — the second
             telling was the one people stopped reading. */
          <Button label="Generate it and post it" onPress={c.commit} />
        ) : null}

        {/* Not "CREATE A LOOK". The create decision happened at step 2, and
            repeating it here implies it hasn't. */}
        {c.step === 3 ? (
          <Button
            label="Who wears it →"
            onPress={() => {
              c.commitDraft();
              setCastingOrigin('create');
              router.push('/casting');
            }}
          />
        ) : null}
      </Foot>

      {/* §2.2 consequence 2: no save path means abandonment is lossy, so it
          asks. One line, not a ceremony — and nothing is refunded because
          nothing has been spent yet. */}
      <ConfirmSheet
        visible={leaving}
        kick="nothing is kept"
        question={LEAVE_WITHOUT_RENDERING}
        note="Your pieces go back to the wardrobe. Today's generation is still yours to spend."
        confirmLabel="Leave it"
        cancelLabel="Keep going"
        onConfirm={() => {
          setLeaving(false);
          c.startAgain();
        }}
        onCancel={() => setLeaving(false)}
      />
    </Screen>
  );
}

const s_row = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'baseline' as const,
};

const s_paid = {
  marginTop: 24,
  paddingTop: 16,
  borderTopWidth: border.hair,
  borderTopColor: palette.rule,
};

/* ═════════════════════════ the other four states ═════════════════════════ */

/**
 * §6 · `rendering`. The render is a JOB, NOT A SCREEN: start it and the user
 * may navigate away, close the app, or come back hours later. Leaving is safe
 * and the copy says so, because a user who waits here has misunderstood what
 * the tab is doing.
 *
 * PUBLICATION IS A CONSEQUENCE OF THE JOB COMPLETING, not of anyone seeing it.
 * Nothing on this screen decides anything — the decision was the step-2 commit.
 *
 * It reads the JOB RECORD rather than the flow's picks, which is what makes a
 * re-render's frozen input free: the record is the only input there is, so
 * there is nothing to accidentally re-read from a form.
 *
 * ⚠ JACK'S OPEN QUESTION 2: whether this is a few seconds or a state people
 * live in for hours depends on a render latency nobody has measured yet. It is
 * built as the latter — leaving is safe, and the dot on the tab is the return
 * path — because that shape survives either answer.
 */
function Rendering() {
  const c = useCreate();
  const job = useSubmission((s) => s.lanes.create);
  const markSeen = useSubmission((s) => s.markSeen);
  const ready = job?.status === 'ready';

  const [showLook, setShowLook] = useState(false);

  const pieces = job?.picks ?? c.picks.map((p) => p.name);
  const tags = job?.tags ?? c.tags;

  /* OPENING THE DRAWER IS WHAT COUNTS AS HAVING SEEN IT, and `markSeen` is the
     only thing that clears the dot on the Wardrobe tab. Leaving for the
     wardrobe without opening it deliberately does NOT clear it — the dot is
     the record that something landed while you were away, so it may not be
     spent by walking past. */
  const openLook = () => {
    markSeen('create');
    setShowLook(true);
  };

  return (
    <Screen>
      {/* Bare, like the rest of the flow (see the note on step 1's header).
          The state is on the ribbon (4 · GENERATE) and in the Hero below it.
          No chevron either: the render is committed, and the footer button is
          the way out. */}
      <Header />

      <StepRibbonBleed
        steps={statesFor(
          CREATE_RIBBON.map((st) => ({ label: st.label })),
          4,
          [true, true, true],
        )}
      />

      <Scroll>
        {/* ══ THE READY HEADLINE IS "YOUR LOOK IS READY." (Katya, 7 Sep) ══
            It was "It's up." — which is true, and is also what a17 says, and
            said nothing about the thing that had just changed. What changed is
            that there is now something to LOOK AT.

            ⚠ THE STRIP USED TO SAY THESE EXACT SIX WORDS, one line below. That
            is why it is gone from the ready state (see below) — the same
            sentence in a Hero and in an accent strip stacked on top of each
            other is the duplication every round on this project has removed. */}
        <Hero>{ready ? 'Your look\nis ready.' : 'On its way.'}</Hero>
        <Body style={{ marginTop: 7 }}>
          {ready
            ? 'Posted itself, exactly as committed.'
            : /* "the dot on this tab" was true while Create was a tab. It came
                 out of the bar on 4 Sep, so the dot is on Wardrobe now — which
                 is also where the way back in is (ui/CreateBanner.tsx). */
              'It posts itself when it lands. Go and do something else — the dot on Wardrobe will tell you.'}
        </Body>

        {ready ? (
          /* ══ A LINK INTO A DRAWER, NOT A ROUTE (Katya, 7 Sep: "mirror the
                behaviour of the view-rendered-look on today's challenge, i.e.
                show in a drawer") ══
             Which is exactly what the Today card does — a 16px `Link` and a
             `SubmissionSheet` — so the two places you go to look at your own
             finished work now behave the same way.

             ⚠ CONSEQUENCE, AND IT IS KATYA'S CALL: this was one of the two
             routes into a17 (`create/posted`), and the footer below was the
             other. Both are gone, so a17 is now reachable ONLY by leaving and
             coming back through the Wardrobe banner once the render has
             landed. It has not been deleted — it is still the screen that
             banner opens — but if this drawer is meant to replace it, say so
             and it can go. */
          <Link style={{ marginTop: 16 }} onPress={openLook}>
            Take a look →
          </Link>
        ) : (
          <>
            {/* The same strip the Today challenge card uses, so the two async
                renders read alike. PENDING ONLY now — on `ready` its label was
                the Hero's own sentence. */}
            <View style={{ marginTop: 14 }}>
              <RenderStrip status="pending" pendingNote="A few seconds" onPress={() => {}} />
            </View>

            {/* §6: the look as a flat lay while it renders. Not the render —
                that does not exist yet, and inventing one here would be the
                only place in the app that showed a look it had not made.

                GONE FROM THE READY STATE, because the drawer holds it now.
                Same trade the Today card made on 4 Sep: inline, it was the
                tallest thing on a screen with nothing left to do. */}
            <View style={{ marginTop: 16 }}>
              <ComposedFlatLay pieces={pieces} />
            </View>

            {tags.length ? (
              <Tiny style={{ marginTop: 12 }}>{tags.map(chipLabel).join('  ')}</Tiny>
            ) : null}
          </>
        )}

        <Gap />
      </Scroll>

      <Foot>
        {/* SECONDARY, AND IT GOES TO THE WARDROBE (Katya, 7 Sep). It was a
            solid "See it" into a17. Ghost is right for what this now is: the
            look is already offered above, so the footer is only the way OUT —
            and the wardrobe is where Create is entered from and where the
            create lane's dot lives, so it is the honest destination.

            `replace`, not `push`: the render is committed and there is nothing
            on this screen to come back to. */}
        <Button
          label={ready ? 'Back to Wardrobe' : 'Leave it running'}
          variant="ghost"
          onPress={() =>
            ready ? router.replace('/(tabs)/wardrobe') : router.push('/(tabs)/magazine')
          }
        />
      </Foot>

      {/* Outside the Scroll — it is a Modal and has to float over the screen
          rather than scroll with it. */}
      <SubmissionSheet
        visible={showLook}
        pieces={pieces}
        caption={tags.length ? tags.map(chipLabel).join('  ') : undefined}
        onDismiss={() => setShowLook(false)}
      />
    </Screen>
  );
}


/**
 * §6.1 · THE SPENT STATE CARRIES THE WHOLE TAB. Because the save path is gone,
 * this is the only thing in Create for most of the day, so it has to read as a
 * reward rather than a lockout:
 *
 *   · today's render AT FULL SIZE — it is the best thing the user made today
 *     and it cost real money
 *   · its tags, and its reaction count if there is one
 *   · the time to 07:00 phrased as the NEXT thing, not the absence of this one
 *   · a route to the magazine, to see it in place
 *   · NO "come back tomorrow" empty state. There is a render to look at.
 *
 * It is also placement 3 of the one-a-day rule (§7) — where the rule stops
 * being information and becomes the situation. This is where it is learned.
 *
 * THE RE-RENDER LIVES HERE TOO, not only on a17. The brief asks for it "on the
 * owner's own magazine card"; there is no ownership model in the feed (Create's
 * posts don't enter it — see data/looks.ts), and this is the screen that
 * actually holds the user's own look, so this is where the offer belongs.
 */
function Spent() {
  const c = useCreate();
  const job = useSubmission((s) => s.lanes.create);
  const verdict = rerenderVerdict({
    publishedAt: job?.publishedAt ?? null,
    rerenderUsed: job?.rerenderUsed ?? false,
    reactions: job?.reactions ?? 0,
    now: Date.now(),
  });

  const pieces = job?.picks ?? c.picks.map((p) => p.name);
  const tags = job?.tags ?? c.tags;

  return (
    <Screen>
      {/* Pushed, like every other Create screen — see the note on step 1's
          header. The subtitle went with the masthead; "today's generation" is
          what the body says anyway. */}
      <Header onBack={leaveCreate} />

      <Scroll>
        {/* §6.1's ORDER, and it is the whole point of the screen: the render
            FIRST, at full size, then its tags, then its reactions, and only
            then the time to 07:00. The 7am line was the Hero at the top for
            one draft and it out-shouted the thing it was sitting above — a
            state that has to read as a reward cannot lead with the rule. */}
        <View style={{ marginTop: 4 }}>
          <ComposedFlatLay pieces={pieces} />
        </View>

        {tags.length ? (
          <Tiny style={{ marginTop: 12 }}>{tags.map(chipLabel).join('  ')}</Tiny>
        ) : null}

        {job ? (
          <Tiny style={{ marginTop: 8 }}>
            {job.reactions === 0
              ? 'No reactions yet.'
              : `${job.reactions} ${job.reactions === 1 ? 'reaction' : 'reactions'} so far.`}
          </Tiny>
        ) : null}

        <View style={s_paid}>
          {/* Placement 3 of the one-a-day rule (§7) — where it stops being
              information and becomes the situation. This is where it is
              actually learned. */}
          <Kick tone="muted">one a day</Kick>
          <Big size={22} style={{ marginTop: 7 }}>
            {NEXT_RENDER_LINE}
          </Big>
          <Body style={{ marginTop: 7 }}>{ONE_A_DAY_WHEN_SPENT}</Body>
        </View>

        <View style={s_paid}>
          <Kick tone="muted">one more go at it</Kick>
          <Body style={{ marginTop: 6 }}>{RERENDER_NOTE}</Body>
          {verdict.allowed ? (
            <Button
              label="Generate it again"
              variant="ghost"
              style={{ marginTop: 12 }}
              onPress={c.rerender}
            />
          ) : (
            <Tiny style={{ marginTop: 10 }}>{RERENDER_BLOCK_LINES[verdict.because]}</Tiny>
          )}
        </View>

        <Gap />
      </Scroll>

      <Foot>
        <Button label="See it in the magazine" onPress={() => router.push('/(tabs)/magazine')} />
      </Foot>
    </Screen>
  );
}

/**
 * §6 · `failed`. The allowance came back, so this is a retry and not an
 * apology. Refunds are for system failure ONLY — never for a user changing
 * their mind, or delete-and-retry becomes the reroll the frozen-input
 * constraint exists to prevent.
 */
function Failed() {
  const refundFailure = useCreate((s) => s.refundFailure);

  return (
    <Screen>
      <Header onBack={leaveCreate} />
      <Scroll>
        <EmptyState
          kick="that didn’t generate"
          body="Something went wrong at our end, not yours."
          note="Your generation is back. Nothing was charged for the attempt."
        >
          <Button label="Start again" style={{ marginTop: 12 }} onPress={refundFailure} />
        </EmptyState>
        <Gap />
      </Scroll>
    </Screen>
  );
}

/**
 * §6 · `insufficient` — Create's front door, in its empty state.
 *
 * One card, three lines, in Katya's order (4 Sep): what the tab is, what it
 * costs, and what it needs. The masthead says "Create", so the card no longer
 * repeats it as a kicker — and the old fourth line ("enter today's challenge
 * and the pieces you pick are yours to keep…") came off with it.
 *
 * "MAKE ANYTHING." IS INSIDE THE CARD, not floating above it. Loose over the
 * card it read as the screen's headline with an unrelated notice below; inside
 * it, the three lines are one statement.
 *
 * ══ THE BUTTON IS DISABLED, AND THAT IS THE DECISION (Katya, 4 Sep) ══
 *
 * "Create a look" has to mean the create path — Create is the flow with the
 * tagging in it, and a button on this tab that opened the daily challenge was
 * the tab sending you somewhere else under its own name. But the create path
 * has nothing to open onto here: Create builds from what you OWN, and owning
 * a garment needs a token, which needs judging (invariant 1, no judging no
 * clothes). Routing there would land on an empty grid with a dead CTA.
 *
 * So the label stays true and the control states the condition instead. Three
 * options were on the table — lend pieces from the catalogue, relabel the
 * button for the challenge, or route into an empty flow — and Katya took none
 * of them: name the missing thing, and disable the button.
 *
 * ⚠ A DISABLED BUTTON, DELIBERATELY, and it is NOT the one that was reversed.
 * The rejected one was the magazine sheet's "No tokens" — that walled off a
 * sheet at the moment someone was most engaged, AND it had a free action
 * available to offer instead (Save for later). Neither is true here: there is
 * no alternative action to offer, and the tab bar is the way on. Do not
 * "restore" a CTA to this card by citing that reversal.
 */
function Insufficient() {
  return (
    <Screen>
      <Header onBack={leaveCreate} />
      <Scroll>
        <Card style={{ marginTop: 4 }}>
          {/* The state, named before the pitch — so the disabled button below
              is already explained by the time you reach it. `alert` is the
              kicker tone the app uses for a condition, not a warning colour. */}
          <Kick tone="alert">no wardrobe pieces</Kick>
          <Hero size={34} style={{ marginTop: 10 }}>
            {'Make\nanything.'}
          </Hero>
          <Body style={{ marginTop: 10 }}>No brief and no score. {ONE_A_DAY_AMBIENT}</Body>
          <Body style={{ marginTop: 8 }}>
            Create is for recombining pieces you already own, and you need {MIN_PIECES} to
            start.
          </Body>
          <Button label="Create a look" variant="off" style={{ marginTop: 14 }} />
        </Card>
        <Gap />
      </Scroll>
    </Screen>
  );
}

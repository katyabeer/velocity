/**
 * a8 · THE BUILDER. Pick → Look. (Render and Vote happen downstream.)
 *
 * Four rules, all of them deliberate and all of them easy to "improve" wrongly:
 *
 * 1. FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE. Not by register, not by
 *    trend, not by what "goes with" the job — deciding that is the skill being
 *    tested. The rails are Outerwear / Tops / Dresses / Bottoms / Shoes /
 *    Extras, which is the delivery sheet's own set with dresses split out.
 *
 * 2. PERFORMANCE HISTORY NEVER APPEARS HERE. Seeing "best: top of the room"
 *    while choosing turns styling into optimising, and optimised looks are worse
 *    signal than honest ones.
 *
 * 3. THE FIRST RUN OFFERS EVERYTHING (Katya, 3 Sep). A brand-new user picks
 *    from the whole catalogue, and the look they enter becomes their wardrobe —
 *    see `adoptLook` in state/wardrobe.ts. That replaced the capsule picker,
 *    and it is the actual fix to the day-one wardrobe problem: the first
 *    decision a new user makes is about a job they can see, not a menu.
 *    From Day 2 the grid comes from what you own, exactly as before.
 *
 * 4. TWO LOANER PIECES so a thin wardrobe can never lock you out. Not offered
 *    on the first run — you already have everything, so a shelf of "pieces you
 *    don't own" would be a lie.
 *
 * NO WALKTHROUGH TOOLTIP (Katya, 3 Sep). "No hints, on purpose" used to sit
 * above the grid. It was a hint about there being no hints, in the largest
 * accent panel on the screen, directly above the thing it was talking about —
 * and it pushed the grid down on the one screen where seeing the clothes is
 * the whole job. The rule it stated is still true and still enforced (see
 * rule 1 above); it just no longer says so out loud.
 *
 * Step 2 is a CONFIRMATION, AND NOW A REAL ONE. It composes the actual cutouts
 * on the delivery's flat-lay template rather than listing names in boxes. Still
 * not a render: nothing renders before you commit, which is what keeps
 * invariant 5 intact with no re-roll machinery.
 */

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Hero, Lede, Body, Tiny, Kick, B } from '@/ui/text';
import { Bar, Button } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { PiecePicker, SlotGrid } from '@/ui/SlotBuilder';
import { ComposedFlatLay, TIGHTEN_PREVIEW } from '@/ui/ComposedFlatLay';
import { palette } from '@/theme/tokens';
import { slotOf } from '@/domain/garments';
import {
  ENTRY_STEPS,
  LOANS_PER_BRIEF,
  MAX_PIECES,
  MIN_PIECES,
  PIECE_RULE,
  loansUsed,
  slotStrip,
} from '@/domain/entry';
import { TONIGHTS_BRIEF } from '@/data/challenges';
import { BUILDER_POOL_ESTABLISHED, LOAN_PIECES } from '@/data/inventory';
import { cataloguePool, garmentImage } from '@/data/catalogue';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';

/* `railsFor` went with the category chips (Katya, 7 Sep). It narrowed the rail
   list to the categories the pool actually held, so an empty rail could never
   be a dead end — the same job the picker now does by construction, because a
   slot's drawer only ever contains that slot's pieces. */

export default function Build() {
  const day = useSession((s) => s.day);
  const rails = useSession((s) => s.rails);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);

  const owned = useWardrobe((s) => s.pieces);
  const picks = useEntry((s) => s.picks);
  const step = useEntry((s) => s.step);
  const entered = useEntry((s) => s.entered);
  const toggle = useEntry((s) => s.toggle);
  const putBack = useEntry((s) => s.putBack);
  const setStep = useEntry((s) => s.setStep);
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);

  /**
   * Day 1 is the first run: the whole catalogue, ordered by the rails
   * preference as a SOFT sort. Everything stays reachable — a hard filter here
   * splits the garment pool, which splits the room and multiplies the
   * cold-start floor. Established keeps the fixed twelve; Day 2 uses inventory.
   */
  const firstRun = day === 1;
  const pool: readonly string[] = firstRun
    ? cataloguePool(rails).map((g) => g.name)
    : day >= 3
      ? BUILDER_POOL_ESTABLISHED
      : owned.map((p) => p.name);

  const loansLeft = LOANS_PER_BRIEF - loansUsed(picks);

  const cells = slotStrip(picks).map((sl) => ({
    slot: sl.slot,
    name: sl.pick?.name,
    isLoan: sl.pick?.source === 'loan',
    image: sl.pick ? garmentImage(sl.pick.name) : undefined,
  }));

  /* ══ THE PICKER'S STATE, AND IT IS POSITIONAL ══
     `open` is a CELL INDEX, not a slot, because two cells are both `Extra`.
     `pending` is the selection the drawer is holding; nothing reaches the look
     until Confirm, which is what makes Cancel mean something. */
  const [open, setOpen] = useState<number | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const openCell = cells[open ?? -1];

  /**
   * What the drawer offers for the open cell: everything in the pool that
   * classifies into that slot, plus the two loaners if any are left, MINUS
   * anything already used in another cell.
   *
   * The exclusion matters for `Extra`: without it the second Extra's drawer
   * would offer the piece sitting in the first, and `toggle` would read that
   * as a de-selection and quietly remove it from the look.
   */
  const usedElsewhere = new Set(picks.map((p) => p.name).filter((n) => n !== openCell?.name));
  const loanable: readonly string[] = firstRun || loansLeft <= 0 ? [] : LOAN_PIECES;
  const pickerItems = openCell
    ? [...pool, ...loanable]
        .filter((n) => slotOf(n) === openCell.slot && !usedElsewhere.has(n))
        .map((n) => ({ name: n, image: garmentImage(n), isLoan: LOAN_PIECES.includes(n as never) }))
    : [];

  const openSlot = (i: number) => {
    setOpen(i);
    setPending(cells[i]?.name ?? null);
  };

  const closePicker = () => {
    setOpen(null);
    setPending(null);
  };

  /* Take the cell's current piece out FIRST, then put the new one in. Order is
     load-bearing on `Extra`: adding before removing would hit the two-piece
     cap and `toggle` would evict the wrong accessory. */
  const confirmPick = () => {
    const was = openCell?.name;
    if (was && was !== pending) putBack(was);
    if (pending && pending !== was) {
      toggle(pending, LOAN_PIECES.includes(pending as never) ? 'loan' : 'owned');
    }
    closePicker();
  };

  const removePick = () => {
    if (openCell?.name) putBack(openCell.name);
    closePicker();
  };

  const ribbon = statesFor(
    ENTRY_STEPS.map((s) => ({ label: s.label })),
    step,
    [false, false, entered, callsCast >= quota],
  );

  const canAdvance = picks.length >= MIN_PIECES;

  const onPrimary = () => {
    if (step === 1 && canAdvance) return setStep(2);
    if (step === 2) {
      setCastingOrigin('brief');
      router.push('/casting');
    }
  };

  return (
    <Screen>
      {/* ══ NO TITLE IN THE BAR (Katya, 4 Sep) ══
          Every screen of the day's flow had one — "Pick your pieces",
          "Preview your look", "Who wears it", "In · can't be changed", "Vote 1
          of 5" — and every one restated something the screen already said
          louder. The step ribbon names the step, and each screen leads with
          its own heading. The bar keeps the chevron and the token badge, which
          are the only things on it that are not repetition. */}
      <Header
        onBack={() => {
          if (step > 1) return setStep(1);
          /* The first-run walkthrough arrives here with `replace`, so this is
             the root of the Today stack and there is nothing to pop — without
             the fallback the chevron is dead on exactly the screen a new user
             is most likely to want out of. */
          return router.canGoBack() ? router.back() : router.replace('/(tabs)/today');
        }}
        /* The count used to sit here. It moved into the slot strip (Katya,
           4 Sep), which is the thing it counts — in the header it was a number
           floating next to the token badge with nothing to attach itself to. */
      />

      <StepRibbonBleed steps={ribbon} />

      {/* ══ NOTHING IS PINNED ANY MORE (Katya, 7 Sep) ══
          The slot strip used to be sticky, outside the `Scroll`, and the
          reason was the sixty-tile grid it had to survive: you needed to see
          what you were filling while you scrolled the catalogue. There is no
          catalogue on this screen now — the slots ARE the screen and the
          catalogue is what a slot opens — so there is nothing to stay put
          against, and `Pinned` came off with the grid. */}

      {step === 1 ? (
        <Scroll>
          {/* A kicker names it, so the title does not have to carry the job of
              saying what it is (Katya, 4 Sep) — which is why it can come down
              from `Lede`'s 23px. */}
          <Kick tone="muted">styling brief</Kick>
          <Lede size={18} style={{ marginTop: 5 }}>
            {TONIGHTS_BRIEF.title}
          </Lede>

          {/* ══ THE SIX SLOTS, 3 x 2, AND THEY ARE THE SCREEN NOW ══
              What came off with the grid (Katya, 7 Sep):
                · the category chips — a slot IS the category, so choosing one
                  and then filtering to it was the same decision twice
                · sixty garment tiles — now behind whichever slot you tap
                · the separate loaner section — the two loaners live inside the
                  drawer for their own slot, flagged NEW, which is where
                  someone filling that slot will actually meet them
              See ui/SlotBuilder.tsx for why this shape is the right way round. */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Kick>your look</Kick>
              <Tiny color={palette.ink} style={{ fontFamily: 'Archivo_700Bold' }}>
                {picks.length} of {MAX_PIECES}
              </Tiny>
            </View>

            <View style={{ marginTop: 9 }}>
              <SlotGrid cells={cells} onOpen={openSlot} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Bar progress={picks.length / MAX_PIECES} />
            </View>

            {/* THE RULE, SUCCINCTLY — and derived, so it cannot drift from the
                gate that enforces it. See PIECE_RULE in domain/entry.ts. */}
            <Tiny style={{ marginTop: 9 }}>
              {PIECE_RULE}
              {firstRun || loansLeft <= 0
                ? ''
                : ` ${loansLeft} of the pieces on offer are loaners for tonight.`}
            </Tiny>
          </View>

          <Gap />
        </Scroll>
      ) : (
        <Scroll>
          {/* RESTRUCTURED, 4 Sep. It was "Together." over two lines, one of
              which said what the picture ISN'T — the same sentence that came
              off Create's Look step and off the plate's own caption bar before
              that. Now: what the screen is, what it costs, and which job it is
              answering, in that order.

              ══ AND THE BRIEF TITLE IS GONE FROM HERE (Katya, 7 Sep) ══
              It was a ruled-off block below the body — "tonight's job" over
              the challenge title. Cut with its divider: the brief is on the
              screen you just came from, permanently, above the grid you
              picked these pieces out of. Restating it at the commit made the
              screen ask "which job was this again" on the reader's behalf,
              and answered it with the loudest type on the page. */}
          <Hero>{'Preview\nyour look.'}</Hero>
          {/* Katya's copy, 7 Sep — replacing "Once you enter, nothing can be
              changed." It says the same thing and adds what the button does,
              which on the commit screen is the whole point.

              ⚠ ONE TYPO FIXED: "All look generations and final" → "ARE
              final". Left as dictated it is the one sentence on the screen
              that has to be unambiguous, so it was corrected rather than
              shipped. Say if you meant something else by it. */}
          <Body style={{ marginTop: 10 }}>
            Press &lsquo;Submit&rsquo; below and your outfit will be submitted for generation.{' '}
            <B>All look generations are final</B>, so use wisely!
          </Body>
          <View style={{ marginTop: 16 }}>
            {/* Tightened, so the pieces read as one arrangement rather than a
                grid of separate photographs. See TIGHTEN_PREVIEW. */}
            <ComposedFlatLay pieces={picks.map((p) => p.name)} tighten={TIGHTEN_PREVIEW} />
          </View>
          <Gap />
        </Scroll>
      )}

      {/* Outside the Scroll — a Modal has to float over the screen rather than
          scroll with it. Mounted for both steps: harmless on step 2, where it
          is never visible, and it keeps the tree stable across the step
          change. */}
      <PiecePicker
        visible={open !== null}
        slot={openCell?.slot ?? null}
        items={pickerItems}
        pending={pending}
        onSelect={(n) => setPending((cur) => (cur === n ? null : n))}
        onConfirm={confirmPick}
        onRemove={openCell?.name ? removePick : undefined}
        onCancel={closePicker}
      />

      <Foot>
        <Button
          label={
            step === 2
              ? 'Submit'
              : canAdvance
                ? 'See them together →'
                : `At least ${MIN_PIECES} pieces (${picks.length} of ${MAX_PIECES})`
          }
          variant={step === 2 || canAdvance ? 'solid' : 'off'}
          onPress={onPrimary}
        />
      </Foot>
    </Screen>
  );
}

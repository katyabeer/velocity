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

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Pinned, Screen, Scroll } from '@/ui/layout';
import { Hero, Lede, Body, Tiny, Kick, B } from '@/ui/text';
import { Bar, Button, ChipRow } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { GarmentGrid, SlotStrip } from '@/ui/pieces';
import { ComposedFlatLay, TIGHTEN_PREVIEW } from '@/ui/ComposedFlatLay';
import { palette, border } from '@/theme/tokens';
import { CATEGORIES, categoryOf, slotOf, type Category } from '@/domain/garments';
import {
  ENTRY_STEPS,
  LOANS_PER_BRIEF,
  MAX_PIECES,
  MIN_PIECES,
  isPicked,
  isSlotOccupied,
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

/**
 * The rails: every category the pool actually holds, in canonical order.
 *
 * Narrowed to what is PRESENT because an empty rail is a dead end — on Day 2 a
 * thin wardrobe would otherwise show six rails and fill one. Drawn from the
 * domain's full CATEGORIES rather than the catalogue's six, so a legacy fixture
 * name that classifies as Accessories (Established's 'silk scarf') is still
 * reachable by filter and not only under All.
 */
function railsFor(pool: readonly string[]): Category[] {
  const present = new Set(pool.map(categoryOf));
  return CATEGORIES.filter((c) => present.has(c));
}

export default function Build() {
  const day = useSession((s) => s.day);
  const rails = useSession((s) => s.rails);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);

  const owned = useWardrobe((s) => s.pieces);
  const picks = useEntry((s) => s.picks);
  const step = useEntry((s) => s.step);
  const filter = useEntry((s) => s.filter);
  const entered = useEntry((s) => s.entered);
  const toggle = useEntry((s) => s.toggle);
  const putBack = useEntry((s) => s.putBack);
  const setStep = useEntry((s) => s.setStep);
  const setFilter = useEntry((s) => s.setFilter);
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

  const visible = pool.filter((n) => filter === 'All' || categoryOf(n) === filter);
  const loansLeft = LOANS_PER_BRIEF - loansUsed(picks);

  const strip = slotStrip(picks).map((sl) => ({
    slot: sl.slot,
    name: sl.pick?.name,
    isLoan: sl.pick?.source === 'loan',
    image: sl.pick ? garmentImage(sl.pick.name) : undefined,
  }));

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

      {/* ══ YOUR LOOK SITS ABOVE THE BRIEF (Katya, 4 Sep) ══
          They were the other way round. The two swapped because only one of
          them needs to be permanently on screen: the slot strip is the thing
          you are filling and it has to stay put while you scroll a grid of
          sixty garments, whereas the brief is read once at the start.

          STICKY BY CONSTRUCTION, not by a prop — `Pinned` sits OUTSIDE the
          `Scroll`, so it cannot move. The brief moved INTO the Scroll for the
          same reason, and now yields its space as you browse rather than
          holding the top of the screen for the rest of the session. */}
      {step === 1 ? (
        <Pinned>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Kick>your look</Kick>
            <Tiny color={palette.ink} style={{ fontFamily: 'Archivo_700Bold' }}>
              {picks.length} of {MAX_PIECES}
            </Tiny>
          </View>
          <View style={{ marginTop: 8 }}>
            <SlotStrip slots={strip} onClear={(name: string) => putBack(name)} />
          </View>
          <View style={{ marginTop: 9 }}>
            <Bar progress={picks.length / MAX_PIECES} />
          </View>
          {/* NO INSTRUCTION UNDER THE STRIP (Katya, 4 Sep). "Tap a filled slot
              to put it back. The last two are both for extras." explained two
              things the strip itself shows: a filled slot is obviously filled,
              and the two EXTRA labels are already side by side. It was the
              last thing between the strip and the grid on the one screen where
              seeing the clothes is the whole job. Both behaviours are
              unchanged. */}
        </Pinned>
      ) : null}

      {step === 1 ? (
        /* `contentStyle` trims the Scroll's own 20pt top pad. `Pinned` already
           contributes 12 of its own, so the default put ~36pt between the slot
           strip and the brief — see the note on the Lede below. */
        <Scroll contentStyle={{ paddingTop: 8 }}>
          {/* The job, and only the job. Its explainer line ("Cold field, warm
              marquee…") came off on 4 Sep — the brief is the title, and the
              sentence under it was read once and then occupied the top of the
              screen for the rest of the session. It is still the first thing a
              new user meets, on the first-challenge screen.

              STEP 1 ONLY. Step 2 states the job itself under its own kicker,
              so leaving this there printed the same title twice on one
              screen. */}
          {/* Tight to the slot strip above it (Katya, 4 Sep). Between
              `Pinned`'s own 12pt bottom pad, the Scroll's 20pt top pad and a
              13pt margin here, there were ~36pt between the thing you are
              filling and the job it answers — they belong together. Now 20,
              and NOT zero: the earlier note on this file records that when the
              two blocks touched they read as one. */}
          {/* A kicker names it, so the title does not have to carry the job of
              saying what it is (Katya, 4 Sep) — which is why it can come down
              from `Lede`'s 23px. */}
          <Kick tone="muted">styling brief</Kick>
          <Lede size={18} style={{ marginTop: 5 }}>
            {TONIGHTS_BRIEF.title}
          </Lede>

          {/* NO LABEL OVER THE FILTERS, and that is settled rather than
              missing (Katya, 4 Sep). It read "everything we have" — which
              describes the POOL rather than the task, and said "your wardrobe"
              on Day 2, which the Wardrobe tab already owns. Renaming it to
              "Pick your pieces" put that phrase on the screen twice, since the
              header says it too, so it came off entirely. The header names the
              screen; the chips are self-evident.

              The count went with it: sixty is a fact about the catalogue, not
              about the decision, and it sat where the eye lands after reading
              the brief. */}
          <View style={{ marginTop: 18 }}>
            <ChipRow
              items={['All', ...railsFor(pool)]}
              value={filter}
              onChange={(v) => setFilter(v as Category | 'All')}
            />
          </View>

          <GarmentGrid
            style={{ marginTop: 11 }}
            items={visible.map((n) => ({
              name: n,
              image: garmentImage(n),
              selected: isPicked(picks, n),
              /* A FULL slot dims, but stays tappable — picking into it swaps
                 rather than refusing. Extra with one piece in it is not full,
                 so it does not dim. */
              dimmed: isSlotOccupied(picks, slotOf(n)) && !isPicked(picks, n),
            }))}
            onPress={(n) => toggle(n, 'owned')}
          />

          {/* ── the two loaners. Not on the first run: you already have the
                whole catalogue, so "pieces you don't own" would be untrue. ── */}
          {firstRun ? null : (
            <View style={{ marginTop: 18, paddingTop: 14, borderTopWidth: border.hair, borderTopColor: palette.ink }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Kick tone="alert">new — unlocked for tonight</Kick>
                <Tiny color={palette.ink}>{loansLeft}</Tiny>
              </View>
              <Body style={{ marginTop: 6 }}>
                Two pieces you don&apos;t own, yours to use for this job only. They go back at close.
              </Body>
              <GarmentGrid
                style={{ marginTop: 10 }}
                items={LOAN_PIECES.map((n) => ({
                  name: n,
                  image: garmentImage(n),
                  selected: isPicked(picks, n),
                }))}
                onPress={(n) => toggle(n, 'loan')}
              />
            </View>
          )}

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
          <Body style={{ marginTop: 10 }}>
            Once you enter, <B>nothing can be changed</B>. The generation comes after, and at 8pm
            you judge the field alongside everyone else.
          </Body>
          <View style={{ marginTop: 16 }}>
            {/* Tightened, so the pieces read as one arrangement rather than a
                grid of separate photographs. See TIGHTEN_PREVIEW. */}
            <ComposedFlatLay pieces={picks.map((p) => p.name)} tighten={TIGHTEN_PREVIEW} />
          </View>
          <Gap />
        </Scroll>
      )}

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

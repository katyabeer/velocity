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
      <Header
        onBack={() => {
          if (step > 1) return setStep(1);
          /* The first-run walkthrough arrives here with `replace`, so this is
             the root of the Today stack and there is nothing to pop — without
             the fallback the chevron is dead on exactly the screen a new user
             is most likely to want out of. */
          return router.canGoBack() ? router.back() : router.replace('/(tabs)/today');
        }}
        title={step === 1 ? 'Pick your pieces' : 'Preview your look'}
        /* The count used to sit here. It moved into the slot strip (Katya,
           4 Sep), which is the thing it counts — in the header it was a number
           floating next to the token badge with nothing to attach itself to. */
      />

      <StepRibbonBleed steps={ribbon} />

      {/* paddingBottom, not just paddingTop: the brief and the slot strip were
          touching, so the job and the thing you build it with read as one
          block. */}
      {/* The job, and only the job. Its explainer line ("Cold field, warm
          marquee…") came off on 4 Sep — the brief is the title, and the
          sentence under it was being read once and then occupying the top of
          the screen for the rest of the session. It is still the first thing a
          new user meets, on the first-challenge screen.

          STEP 1 ONLY. Step 2 now states the job itself, under its own kicker
          and below its headline, so leaving this here printed the same title
          twice on one screen — once above the fold and once below it. */}
      {step === 1 ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 13, paddingBottom: 18 }}>
          <Lede>{TONIGHTS_BRIEF.title}</Lede>
        </View>
      ) : null}

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
          {/* Stays small. It is a control's instruction, not prose — and at
              16px it took two lines and pushed the grid down on the one screen
              where seeing the clothes is the whole job, which is the same
              reason the walkthrough tooltip came off it. */}
          <Tiny style={{ marginTop: 7 }}>
            Tap a filled slot to put it back. The last two are both for extras.
          </Tiny>
        </Pinned>
      ) : null}

      {step === 1 ? (
        <Scroll>
          <View style={{ marginTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Kick tone="muted">{firstRun ? 'everything we have' : 'your wardrobe'}</Kick>
            <Tiny>{pool.length} pieces</Tiny>
          </View>

          <View style={{ marginTop: 9 }}>
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

              The brief title sits BELOW the body rather than above it because
              the screen's own name has to come first — you arrive here from a
              grid of clothes, and "which job was this again" is the second
              question, not the first. */}
          <Hero>{'Preview\nyour look.'}</Hero>
          <Body style={{ marginTop: 10 }}>
            Once you enter, <B>nothing can be changed</B>. The generation comes after, and at 8pm
            you judge the field alongside everyone else.
          </Body>
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: border.hair, borderTopColor: palette.rule }}>
            <Kick tone="muted">tonight&apos;s job</Kick>
            <Lede style={{ marginTop: 5 }}>{TONIGHTS_BRIEF.title}</Lede>
          </View>
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

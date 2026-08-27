/**
 * a8 · THE BUILDER. Pick → Look. (Render and Vote happen downstream.)
 *
 * Four rules, all of them deliberate and all of them easy to "improve" wrongly:
 *
 * 1. FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE. Nothing is sorted by what
 *    "goes with" the brief, because deciding that is the skill being tested.
 *
 * 2. PERFORMANCE HISTORY NEVER APPEARS HERE. Seeing "best: top of the room"
 *    while choosing turns styling into optimising, and optimised looks are worse
 *    signal than honest ones.
 *
 * 3. THE BUILDER OFFERS WHAT YOU ACTUALLY OWN. On days 1 and 2 the grid comes
 *    from your inventory — day one being the capsule you chose at signup.
 *
 * 4. TWO LOANER PIECES so nobody is locked out. They go back at close.
 *
 * Step 2 is a CONFIRMATION, NOT A RENDER. Nothing renders before you commit —
 * that is what keeps invariant 5 intact with no re-roll machinery.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Pinned, Screen, Scroll } from '@/ui/layout';
import { Hero, Kick, Lede, Tiny, B } from '@/ui/text';
import { Bar, Button, ChipRow } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { FlatLay, GarmentGrid, SlotStrip } from '@/ui/pieces';
import { Tip } from '@/ui/cards';
import { palette, border } from '@/theme/tokens';
import { SLOTS, slotOf, type Slot } from '@/domain/garments';
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
import { useEntry } from '@/state/entry';
import { useSession, TIPS, TIP_LEAD } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';

export default function Build() {
  const day = useSession((s) => s.day);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);
  const tipDismissed = useSession((s) => s.dismissedTips.build);
  const dismissTip = useSession((s) => s.dismissTip);

  const owned = useWardrobe((s) => s.pieces);
  const picks = useEntry((s) => s.picks);
  const step = useEntry((s) => s.step);
  const filter = useEntry((s) => s.filter);
  const entered = useEntry((s) => s.entered);
  const toggle = useEntry((s) => s.toggle);
  const clear = useEntry((s) => s.clear);
  const setStep = useEntry((s) => s.setStep);
  const setFilter = useEntry((s) => s.setFilter);
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);

  /** Established keeps the fixed twelve; days 1 and 2 use your inventory. */
  const pool: readonly string[] =
    day >= 3 ? BUILDER_POOL_ESTABLISHED : owned.map((p) => p.name);

  const visible = pool.filter((n) => filter === 'All' || slotOf(n) === filter);
  const loansLeft = LOANS_PER_BRIEF - loansUsed(picks);

  const strip = slotStrip(picks).map((sl) => ({
    slot: sl.slot,
    name: sl.pick?.name,
    isLoan: sl.pick?.source === 'loan',
  }));

  const ribbon = statesFor(
    ENTRY_STEPS.map((s) => ({ label: s.label, hint: s.hint })),
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
        onBack={() => (step > 1 ? setStep(1) : router.back())}
        title={step === 1 ? 'Pick your pieces' : 'Have a look'}
        right={
          step === 1 ? (
            <Tiny color={palette.ink} style={{ fontFamily: 'Archivo_700Bold' }}>
              {picks.length} of {MAX_PIECES}
            </Tiny>
          ) : undefined
        }
      />

      <StepRibbonBleed steps={ribbon} />

      <View style={{ paddingHorizontal: 22, paddingTop: 13 }}>
        <Lede>{TONIGHTS_BRIEF.title}</Lede>
        <Tiny style={{ marginTop: 6 }}>{TONIGHTS_BRIEF.note}</Tiny>
      </View>

      {step === 1 ? (
        <Pinned>
          <Kick>your look</Kick>
          <View style={{ marginTop: 8 }}>
            <SlotStrip slots={strip} onClear={(sl: Slot) => clear(sl)} />
          </View>
          <View style={{ marginTop: 9 }}>
            <Bar progress={picks.length / MAX_PIECES} />
          </View>
          <Tiny style={{ marginTop: 7 }}>Tap a filled slot to put it back.</Tiny>
        </Pinned>
      ) : null}

      {step === 1 ? (
        <Scroll>
          {!tipDismissed ? (
            <Tip
              lead={TIP_LEAD.build}
              body={TIPS.build.replace(TIP_LEAD.build, '').trim()}
              onDismiss={() => dismissTip('build')}
            />
          ) : null}

          <View style={{ marginTop: 11 }}>
            <ChipRow
              items={['All', ...SLOTS]}
              value={filter}
              onChange={(v) => setFilter(v as Slot | 'All')}
            />
          </View>

          <GarmentGrid
            style={{ marginTop: 11 }}
            items={visible.map((n) => ({
              name: n,
              selected: isPicked(picks, n),
              /* A slot that is already filled dims, but stays tappable — picking
                 into it swaps rather than refusing. */
              dimmed: isSlotOccupied(picks, slotOf(n)) && !isPicked(picks, n),
            }))}
            onPress={(n) => toggle(n, 'owned')}
          />

          {/* ── the two loaners ── */}
          <View style={{ marginTop: 18, paddingTop: 14, borderTopWidth: border.hair, borderTopColor: palette.shock }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Kick tone="alert">new — unlocked for tonight</Kick>
              <Tiny color={palette.shock}>{loansLeft}</Tiny>
            </View>
            <Tiny style={{ marginTop: 6 }}>
              Two pieces you don&apos;t own, yours to use for this job only. They go back at close.
            </Tiny>
            <GarmentGrid
              style={{ marginTop: 10 }}
              items={LOAN_PIECES.map((n) => ({
                name: n,
                selected: isPicked(picks, n),
              }))}
              onPress={(n) => toggle(n, 'loan')}
            />
          </View>

          <Gap />
        </Scroll>
      ) : (
        <Scroll>
          <Hero>Together.</Hero>
          <Tiny style={{ marginTop: 7 }}>Not a render — just the pieces, side by side.</Tiny>
          <View style={{ marginTop: 14 }}>
            <FlatLay pieces={picks.map((p) => p.name)} />
          </View>
          <Tiny style={{ marginTop: 12 }}>
            Once you enter, <B>nothing can be changed</B>. The render comes after, and at 8pm you
            judge the field alongside everyone else.
          </Tiny>
          <Gap />
        </Scroll>
      )}

      <Foot>
        <Button
          label={
            step === 2
              ? 'Enter · no changes after this'
              : canAdvance
                ? 'See them together →'
                : `At least three pieces (${picks.length} of ${MAX_PIECES})`
          }
          variant={step === 2 || canAdvance ? 'solid' : 'off'}
          onPress={onPrimary}
        />
      </Foot>
    </Screen>
  );
}

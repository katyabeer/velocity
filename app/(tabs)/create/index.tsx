/**
 * a11 · CREATE — Pick → Tag → Model → Render → Success.
 *
 * NO BRIEF AND NO SCORE. This is the pressure valve: the daily job is one entry
 * with a deadline, and this is where you make things for no reason.
 *
 * CREATE KEEPS ITS TAG STEP. The brief flow does not (locked decision 18). The
 * reason is not symmetry, it is information: a freestyle post has no brief, so
 * its tags are the only thing telling the magazine what it is. Don't unify the
 * two flows.
 *
 * NO SEPARATE LOOK STEP. There used to be one between Pick and Tag, showing
 * the pieces together. Cut because the Render step already shows exactly
 * that same preview right before you commit — seeing your pieces together
 * makes more sense as the last look before it renders than as its own early
 * stop you'd otherwise see twice.
 *
 * MODEL COMES BEFORE RENDER, both consuming the day's one render — "save to
 * my looks" only means an instant, unrendered, unlimited fallback once
 * today's render is already spent (see the Render step below). Model is its
 * own ribbon step even though its screen lives at /casting, shared with the
 * brief flow — see CREATE_STEPS in domain/entry.ts.
 *
 * ASYNC SUBMIT, NOT A WAIT SCREEN. Tapping either render button doesn't show
 * a "please wait" animation any more — it tells you, lets you carry on, and a
 * dot appears on the Create tab once it's ready (ui/TabIcon.tsx). It used to be
 * a chip in every screen's header; that was retired on 3 Sep, see
 * state/submission.ts. Create's render runs in its own lane, so submitting one
 * here can no longer wipe out the daily brief's.
 *
 * ⚠ JACK'S OPEN QUESTION 4: Create allows layering, brief entry is five slots.
 * Unresolved — the renderer has to know which contract it is honouring.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Pinned, Screen, Scroll, Wrap } from '@/ui/layout';
import { Hero, Kick, Tiny, B } from '@/ui/text';
import { Bar, Button, Chip, ChipRow } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { GarmentGrid, SlotStrip } from '@/ui/pieces';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { RenderStrip } from '@/ui/RenderStrip';
import { EmptyState } from '@/ui/cards';
import { palette, border } from '@/theme/tokens';
import { CATEGORIES, categoryOf, slotOf, type Category } from '@/domain/garments';
import {
  CREATE_STEPS,
  MAX_PIECES,
  MIN_PIECES,
  isPicked,
  isSlotOccupied,
  slotStrip,
} from '@/domain/entry';
import { FREE_TAG_BANK, OCCASIONS } from '@/data/challenges';
import { BUILDER_POOL_ESTABLISHED } from '@/data/inventory';
import { garmentImage } from '@/data/catalogue';
import { useCreate, useRendersLeft, type CreateStep } from '@/state/create';
import { useRenderBadge, useSubmission } from '@/state/submission';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';

export default function Create() {
  const c = useCreate();
  const rendersLeft = useRendersLeft();
  const day = useSession((s) => s.day);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);
  const owned = useWardrobe((s) => s.pieces);
  const renderReady = useRenderBadge('create');
  const markSeen = useSubmission((s) => s.markSeen);

  /* Create offers what you OWN, always — it is the pressure valve, not a
     shop. On Day 1 that is the look you entered this morning, which is the
     point: freestyle is for recombining your own wardrobe. */
  const pool: readonly string[] = day >= 3 ? BUILDER_POOL_ESTABLISHED : owned.map((p) => p.name);
  const visible = pool.filter((n) => c.filter === 'All' || categoryOf(n) === c.filter);
  /* Only rails the pool can actually fill — an empty rail is a dead end.
     Canonical order, and the full category list so a legacy Accessories name
     stays reachable by filter (see railsFor in today/build.tsx). */
  const railsPresent = new Set(pool.map(categoryOf));
  const rails = CATEGORIES.filter((cat) => railsPresent.has(cat));

  const ribbon = statesFor(
    CREATE_STEPS.map((s) => ({ label: s.label, hint: s.hint })),
    // Internal steps are 1–3 (Pick/Tag/Render); Model is ribbon position 3
    // but lives on the separate /casting screen, so once we're past Tag the
    // ribbon position is one ahead of the internal step.
    c.step >= 3 ? c.step + 1 : c.step,
  );

  const canAdvance = c.picks.length >= MIN_PIECES;
  const titles = ['Pick your pieces', 'Tag it', 'Render'] as const;

  const primary = (() => {
    if (c.step === 1)
      return {
        label: canAdvance
          ? 'Tag it →'
          : `At least ${MIN_PIECES} (${c.picks.length} of ${MAX_PIECES})`,
        variant: canAdvance ? ('solid' as const) : ('off' as const),
        onPress: canAdvance ? () => c.setStep(2) : undefined,
      };
    // step 2
    return rendersLeft > 0
      ? {
          label: c.occasion ? 'Pick a model →' : 'Pick where you would wear it',
          variant: c.occasion ? ('solid' as const) : ('off' as const),
          onPress: c.occasion
            ? () => {
                setCastingOrigin('create');
                router.push('/casting');
              }
            : undefined,
        }
      : {
          label: c.occasion ? 'Continue →' : 'Pick where you would wear it',
          variant: c.occasion ? ('solid' as const) : ('off' as const),
          onPress: c.occasion ? () => c.setStep(3) : undefined,
        };
  })();

  return (
    <Screen>
      <Header
        onBack={c.step > 1 ? () => c.setStep((c.step - 1) as CreateStep) : undefined}
        title={titles[c.step - 1]}
        right={c.step === 1 ? <Tiny>{c.picks.length} of {MAX_PIECES}</Tiny> : undefined}
      />

      <StepRibbonBleed steps={ribbon} />

      {/* The Create tab's dot leads here, so the way through to the finished
          render has to be here too — tapping it is the only thing that clears
          the dot (see state/submission.ts). */}
      {renderReady ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <RenderStrip
            ready
            onPress={() => {
              markSeen('create');
              router.push('/(tabs)/create/posted');
            }}
          />
        </View>
      ) : null}

      {c.step === 1 && pool.length > 0 ? (
        <Pinned>
          <Kick>your look</Kick>
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
          <Tiny style={{ marginTop: 7 }}>
            Tap a filled slot to put it back. The last two are both for extras.
          </Tiny>
        </Pinned>
      ) : null}

      {c.step === 1 ? (
        <Scroll>
          <Hero size={36}>{'Make\nanything.'}</Hero>
          <Tiny style={{ marginTop: 8 }}>
            No brief and no score. {MIN_PIECES} pieces minimum, {MAX_PIECES} maximum.
          </Tiny>

          {/* CREATE OFFERS WHAT YOU OWN, and on a brand-new account that is
              nothing at all — the capsule that used to pre-fill the wardrobe
              is gone (see state/wardrobe.ts). Saying so, and saying how to fix
              it, rather than showing an empty grid under a live filter rail. */}
          {pool.length === 0 ? (
            <EmptyState
              kick="nothing to make with yet"
              body="Create is for recombining pieces you already own, and you don’t own any yet."
              note="Enter today’s challenge and the pieces you pick are yours to keep — then come back and make something with no brief and no score."
            >
              <Button
                label="Enter today’s challenge"
                style={{ marginTop: 12 }}
                onPress={() => router.push('/(tabs)/today/build')}
              />
            </EmptyState>
          ) : (
            <View style={{ marginTop: 14 }}>
              <ChipRow
                items={['All', ...rails]}
                value={c.filter}
                onChange={(v) => c.setFilter(v as Category | 'All')}
              />
            </View>
          )}

          {pool.length === 0 ? null : (
          <GarmentGrid
            style={{ marginTop: 11 }}
            items={visible.map((n) => ({
              name: n,
              image: garmentImage(n),
              selected: isPicked(c.picks, n),
              /* A slot that is already filled dims, but stays tappable — picking
                 into it swaps rather than refusing. */
              dimmed: isSlotOccupied(c.picks, slotOf(n)) && !isPicked(c.picks, n),
            }))}
            onPress={c.toggle}
          />
          )}
          <Gap />
        </Scroll>
      ) : null}

      {c.step === 2 ? (
        <Scroll>
          <Hero>{'Where\nwould you\nwear it?'}</Hero>

          <Tiny style={{ marginTop: 10 }}>
            {rendersLeft > 0 ? (
              <>
                You get <B>one render with a model</B> today — the next step spends it, so get
                your tags right first.
              </>
            ) : (
              <>
                You&apos;ve used today&apos;s render. This will save as an unrendered combination
                instead — that part&apos;s unlimited.
              </>
            )}
          </Tiny>

          <Wrap style={{ marginTop: 16 }}>
            {OCCASIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                tone={c.occasion === o ? 'on' : 'default'}
                onPress={() => c.setOccasion(c.occasion === o ? null : o)}
              />
            ))}
          </Wrap>

          <View style={{ marginTop: 22, paddingTop: 16, borderTopWidth: border.hair, borderTopColor: palette.rule }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Kick>your own words</Kick>
              <Tiny>optional</Tiny>
            </View>
            <Wrap style={{ marginTop: 9 }}>
              {c.freeTags.length ? (
                c.freeTags.map((t) => (
                  <Chip key={t} label={`${t} ×`} tone="green" onPress={() => c.removeFreeTag(t)} />
                ))
              ) : (
                <Tiny>None yet.</Tiny>
              )}
            </Wrap>
            {/* The prototype faked free text with a bank, because a static page
                has no keyboard. Replace with a real TextInput — and read Jack's
                open question 3 first: the standing suggestion is DECORATION
                ONLY, never used for filtering, sorting or the dataset. */}
            <Button
              label="Add a tag"
              variant="quiet"
              style={{ marginTop: 9 }}
              onPress={() => c.addFreeTag(FREE_TAG_BANK[c.freeTags.length % FREE_TAG_BANK.length]!)}
            />
          </View>
          <Gap />
        </Scroll>
      ) : null}

      {c.step === 3 ? (
        <Scroll>
          <Hero>Ready.</Hero>
          <Tiny style={{ marginTop: 7 }}>
            {rendersLeft > 0
              ? 'Last look before it renders — nothing changes after this.'
              : "No render left today — this saves as an unrendered combination."}
          </Tiny>
          <View style={{ marginTop: 14 }}>
            <ComposedFlatLay pieces={c.picks.map((p) => p.name)} />
          </View>
          {c.occasion || c.freeTags.length ? (
            <Wrap style={{ marginTop: 12 }}>
              {c.occasion ? <Chip label={c.occasion} tone="on" /> : null}
              {c.freeTags.map((t) => (
                <Chip key={t} label={t} tone="green" />
              ))}
            </Wrap>
          ) : null}
          <Gap />
        </Scroll>
      ) : null}

      <Foot>
        {c.step === 3 ? (
          rendersLeft > 0 ? (
            <>
              <Button
                label="Render and post"
                onPress={() => {
                  c.renderAndPost();
                  c.startAgain();
                  router.replace('/(tabs)/today');
                }}
              />
              <Button
                label="Render and save privately"
                variant="ghost"
                style={{ marginTop: 8 }}
                onPress={() => {
                  c.renderAndSavePrivately();
                  c.startAgain();
                  router.replace('/(tabs)/today');
                }}
              />
            </>
          ) : (
            <Button
              label="Save to my looks"
              onPress={() => {
                c.saveUnrendered();
                router.push('/(tabs)/create/posted');
              }}
            />
          )
        ) : (
          <Button label={primary.label} variant={primary.variant} onPress={primary.onPress} />
        )}
      </Foot>
    </Screen>
  );
}

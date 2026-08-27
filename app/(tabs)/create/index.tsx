/**
 * a11 · CREATE — four steps: Pick → Look → Tag → Render.
 *
 * NO BRIEF AND NO SCORE. This is the pressure valve: the daily job is one entry
 * with a deadline, and this is where you make things for no reason.
 *
 * CREATE KEEPS ITS TAG STEP. The brief flow does not (locked decision 18). The
 * reason is not symmetry, it is information: a freestyle post has no brief, so
 * its tags are the only thing telling the magazine what it is. Don't unify the
 * two flows.
 *
 * ONE RENDER A DAY — rendering is the expensive bit, and only rendered looks can
 * go in the magazine. SAVE AS A SET is unlimited and writes into the Wardrobe's
 * Looks tab, which is how that tab first fills on Day 1.
 *
 * ⚠ JACK'S OPEN QUESTION 4: Create allows layering, brief entry is five slots.
 * Unresolved — the renderer has to know which contract it is honouring.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll, Wrap } from '@/ui/layout';
import { Hero, Kick, Tiny, B } from '@/ui/text';
import { Button, Chip, ChipRow } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { FlatLay, GarmentGrid, PieceTile } from '@/ui/pieces';
import { RenderStage } from '@/ui/RenderStage';
import { palette, border } from '@/theme/tokens';
import { SLOTS, slotOf, type Slot } from '@/domain/garments';
import { CREATE_STEPS, MAX_PIECES, MIN_PIECES } from '@/domain/entry';
import { FREE_TAG_BANK, OCCASIONS } from '@/data/challenges';
import { BUILDER_POOL_ESTABLISHED } from '@/data/inventory';
import { useCreate, useRendersLeft } from '@/state/create';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';

export default function Create() {
  const c = useCreate();
  const rendersLeft = useRendersLeft();
  const day = useSession((s) => s.day);
  const setCastingOrigin = useSession((s) => s.setCastingOrigin);
  const owned = useWardrobe((s) => s.pieces);
  const saveSet = useWardrobe((s) => s.saveSet);

  const pool: readonly string[] = day >= 3 ? BUILDER_POOL_ESTABLISHED : owned.map((p) => p.name);
  const visible = pool.filter((n) => c.filter === 'All' || slotOf(n) === c.filter);

  const ribbon = statesFor(
    CREATE_STEPS.map((s) => ({ label: s.label, hint: s.hint })),
    c.step,
  );

  const canAdvance = c.picks.length >= MIN_PIECES;

  const titles = ['Pick your pieces', 'Have a look', 'Tag it', 'Rendering'] as const;

  const primary = (() => {
    if (c.step === 1)
      return {
        label: canAdvance ? 'See them together →' : `At least three (${c.picks.length} of ${MAX_PIECES})`,
        variant: canAdvance ? ('solid' as const) : ('off' as const),
        onPress: canAdvance ? () => c.setStep(2) : undefined,
      };
    if (c.step === 3)
      return {
        label: c.occasion ? 'Who wears it →' : 'Pick where you would wear it',
        variant: c.occasion ? ('solid' as const) : ('off' as const),
        onPress: c.occasion
          ? () => {
              setCastingOrigin('create');
              router.push('/casting');
            }
          : undefined,
      };
    return { label: 'Rendering…', variant: 'off' as const, onPress: undefined };
  })();

  return (
    <Screen>
      <Header
        onBack={c.step > 1 ? () => c.setStep((c.step === 3 ? 2 : c.step - 1) as 1 | 2 | 3) : undefined}
        title={titles[c.step - 1]}
        right={c.step === 1 ? <Tiny>{c.picks.length} of {MAX_PIECES}</Tiny> : undefined}
      />

      <StepRibbonBleed steps={ribbon} />

      {c.step === 1 ? (
        <Scroll>
          <Hero size={36}>{'Make\nanything.'}</Hero>
          <Tiny style={{ marginTop: 8 }}>
            No brief and no score. Three pieces minimum, five maximum.
          </Tiny>

          <View style={{ flexDirection: 'row', gap: 5, paddingTop: 14 }}>
            {c.picks.length ? (
              c.picks.map((n) => (
                <View key={n} style={{ flex: 1 }}>
                  <PieceTile name={n} state="held" onPress={() => c.drop(n)} />
                </View>
              ))
            ) : (
              <Tiny>Nothing yet. Tap three to five pieces below.</Tiny>
            )}
          </View>

          <View style={{ marginTop: 14 }}>
            <ChipRow
              items={['All', ...SLOTS]}
              value={c.filter}
              onChange={(v) => c.setFilter(v as Slot | 'All')}
            />
          </View>

          <GarmentGrid
            style={{ marginTop: 11 }}
            items={visible.map((n) => ({ name: n, selected: c.picks.includes(n) }))}
            onPress={c.toggle}
          />
          <Gap />
        </Scroll>
      ) : null}

      {c.step === 2 ? (
        <Scroll>
          <Hero>Together.</Hero>
          <Tiny style={{ marginTop: 7 }}>Not a render — just the pieces, side by side.</Tiny>
          <View style={{ marginTop: 14 }}>
            <FlatLay pieces={c.picks} />
          </View>

          {c.destination === 'set' ? (
            <Tiny style={{ marginTop: 12 }}>
              <B>Saved.</B> It is in your looks as a combination. Render it another day if you want
              to post it.
            </Tiny>
          ) : (
            <Tiny style={{ marginTop: 12 }}>
              {rendersLeft > 0 ? (
                <>
                  Rendering is the expensive bit, so it is <B>one a day</B> — and only rendered looks
                  can go in the magazine.
                </>
              ) : (
                "Today's render is used. Saving keeps it as a combination in your looks."
              )}
            </Tiny>
          )}
          <Gap />
        </Scroll>
      ) : null}

      {c.step === 3 ? (
        <Scroll>
          <Hero>{'Where\nwould you\nwear it?'}</Hero>
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

          <View style={{ marginTop: 22, paddingTop: 16, borderTopWidth: border.hair, borderTopColor: palette.line }}>
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

      {c.step === 4 ? (
        <Scroll>
          <Hero>Making it.</Hero>
          <View style={{ marginTop: 16 }}>
            <RenderStage
              pieces={c.picks}
              height={250}
              onComplete={() => router.push('/(tabs)/create/posted')}
            />
          </View>
          <Gap />
        </Scroll>
      ) : null}

      <Foot>
        {c.step === 2 ? (
          <>
            <Button
              label={rendersLeft > 0 ? 'Render it and post it' : 'No render left today'}
              variant={rendersLeft > 0 ? 'solid' : 'off'}
              onPress={
                rendersLeft > 0
                  ? () => {
                      c.setDestination('magazine');
                      c.setStep(3);
                    }
                  : undefined
              }
            />
            <Button
              label="Save to my looks"
              variant="ghost"
              style={{ marginTop: 8 }}
              onPress={() => {
                c.setDestination('set');
                saveSet({
                  job: 'Untitled combination',
                  band: 'flat',
                  when: 'just now',
                  note: `${c.picks.length} pieces · saved as a set`,
                });
              }}
            />
          </>
        ) : (
          <Button label={primary.label} variant={primary.variant} onPress={primary.onPress} />
        )}
      </Foot>
    </Screen>
  );
}

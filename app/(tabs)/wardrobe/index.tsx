/**
 * a15 · WARDROBE — inventory and record. "Nothing ever leaves."
 *
 * Three views: Pieces · Looks · Saved.
 *
 * THIS is where performance history lives — worn counts and best bands. Not in
 * the builder, where it would turn styling into optimising. The same data, in
 * two places, means two different things.
 *
 * DAY 1: the "try these" rail is HIDDEN, because a shuffled nudge drawn from
 * eight things you can already see is noise. Looks and Saved carry real empty
 * states, and saving a freestyle set is how the Looks tab first fills.
 *
 * WARDROBE CAP is 99 in the prototype; the handover recommends 40 for the test
 * build so the cap is actually reachable in a session. See WARDROBE_CAP.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll, SectionHead } from '@/ui/layout';
import { Body, Tiny, Kick, B } from '@/ui/text';
import { Button, ChipRow, Segmented } from '@/ui/controls';
import { EmptyState, NewBox } from '@/ui/cards';
import { InventoryTile } from '@/ui/pieces';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { ConfirmSheet } from '@/ui/ConfirmSheet';
import { CreateBanner } from '@/ui/CreateBanner';
import { garmentImage } from '@/data/catalogue';
import { palette, border, space } from '@/theme/tokens';
import { CATEGORIES, type Category } from '@/domain/garments';
import { WARDROBE_CAP } from '@/domain/economy';
import { dayConfig } from '@/config/testState';
import { groupByCategory, pieceLabel, useWardrobe, type WardrobeView } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';
import { useSession } from '@/state/session';
import { useEntry } from '@/state/entry';
import { useRenderBadge, useSubmission } from '@/state/submission';

export default function Wardrobe() {
  const day = useSession((s) => s.day);
  const cfg = dayConfig(day);

  const w = useWardrobe();
  const createReady = useRenderBadge('create');
  const markSeen = useSubmission((st) => st.markSeen);
  const entered = useEntry((s) => s.entered);
  const starred = useEconomy((s) => s.starred);
  const held = useEconomy((s) => s.held);
  const toggleStar = useEconomy((s) => s.toggleStar);

  /** The piece the removal drawer is asking about, or null when it's shut.
   *  Local, not in the store: it is a question this screen is asking, and it
   *  should not survive navigating away mid-question. */
  const [pendingDrop, setPendingDrop] = useState<string | null>(null);

  const groups = groupByCategory(w.pieces, w.filter);
  const populatedCategories = CATEGORIES.filter((c) => w.pieces.some((p) => p.category === c));

  return (
    <Screen>
      <LogoBlock title="Wardrobe" subtitle={pieceLabel(w.count)} />

      <Scroll>
        {/* THE DOOR INTO CREATE, above the segmented control — Create left the
            tab bar on 4 Sep and this is the only way in. Above rather than
            below the filter because it is about the whole wardrobe, not about
            whichever of the three views you happen to be in. */}
        <CreateBanner
          ready={createReady}
          onPress={() => {
            if (createReady) {
              markSeen('create');
              return router.push('/create/posted');
            }
            router.push('/create');
          }}
        />

        {/* 20pt between the banner and the filters (Katya, 4 Sep). They were
            8 apart, which read as one stacked control — an accent panel
            directly above a segmented control looks like its header. The gap
            is what separates "a door out of this screen" from "a filter on
            this screen". */}
        <View style={{ height: 20 }} />

        <Segmented
          items={[
            { key: 'pieces', label: 'Pieces' },
            { key: 'looks', label: 'Looks' },
            { key: 'saved', label: starred.length ? `Saved · ${starred.length}` : 'Saved' },
          ]}
          value={w.view}
          onChange={(v) => w.setView(v as WardrobeView)}
        />

        {/* ══ PIECES ══ */}
        {w.view === 'pieces' ? (
          <>
            {day === 2 ? (
              <View style={{ marginTop: 12 }}>
                <NewBox
                  kick="three arrived overnight"
                  title={`${w.count} pieces.`}
                  body="Three came out of last night's judging. Nothing you own can ever leave."
                />
              </View>
            ) : null}

            {w.count >= WARDROBE_CAP ? (
              <View style={s.full}>
                <Kick tone="alert">wardrobe full · {WARDROBE_CAP} of {WARDROBE_CAP}</Kick>
                <Text style={s.fullTitle}>Drop something before you take anything else.</Text>
                <Body color={palette.grey} style={{ marginTop: 6 }}>
                  Nothing is lost for good — a dropped piece can be taken again with a token.
                </Body>
              </View>
            ) : w.count >= WARDROBE_CAP - 5 ? (
              <Tiny style={{ marginTop: 12 }}>
                {WARDROBE_CAP - w.count} spaces left of {WARDROBE_CAP}.
              </Tiny>
            ) : null}

            <View style={{ marginTop: 12 }}>
              <ChipRow
                items={['All', ...populatedCategories]}
                value={w.filter}
                onChange={(v) => w.setFilter(v as Category | 'All')}
              />
            </View>

            {/* Hidden on Day 1 — a nudge from eight visible things is noise. */}
            {cfg.showTryTheseRail ? (
              <>
                <SectionHead title="Try these" />
                <View style={s.rail}>
                  {w.pieces.slice(0, 5).map((p) => (
                    <View key={p.name} style={s.railCard}>
                      <View style={s.railThumb}>
                        <Text style={s.railThumbLabel}>{p.name.split(' ')[0]}</Text>
                      </View>
                      <Text style={s.railName}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {groups
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <View key={g.category}>
                  <SectionHead title={g.category} />
                  <View style={s.inv}>
                    {g.items.map((p) => (
                      <InventoryTile
                        key={p.name}
                        name={p.name}
                        isNew={p.isNew}
                        image={p.image}
                        onDrop={() => setPendingDrop(p.name)}
                      />
                    ))}
                  </View>
                </View>
              ))}
          </>
        ) : null}

        {/* ══ LOOKS ══ */}
        {w.view === 'looks' ? (
          <>
            <SectionHead
              title="Everything you've entered"
              note={w.archive.length ? 'newest first' : 'nothing yet'}
            />
            {w.archive.length === 0 ? (
              <EmptyState
                kick="no looks yet"
                body="Every look you enter is kept here for good, with what it earned attached."
                note="Combinations you save in Create land here too — no generation, no score, just a set of pieces waiting for the right job."
              >
                <Button
                  label="Make something"
                  variant="quiet"
                  style={{ marginTop: 12 }}
                  onPress={() => router.push('/create')}
                />
              </EmptyState>
            ) : (
              <View style={s.arch}>
                {w.archive.map((a, i) => (
                  <View
                    key={`${a.job}-${i}`}
                    style={[s.archRow, i === w.archive.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    {/* A real plate when the entry carries its pieces — the
                        empty grey box is only for the pre-dated fixtures that
                        have no piece list to draw. */}
                    <View style={s.archPlate}>
                      {a.pieces?.length ? (
                        <ComposedFlatLay pieces={a.pieces} />
                      ) : null}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.archJob}>{a.job}</Text>
                      <Text style={s.archNote}>
                        {a.when} · {a.note}
                      </Text>
                    </View>
                    {/* 'live' and 'flat' are not bands — see ArchiveEntry. An
                        unsettled entry reports when it will settle, never a
                        placing it does not have yet. */}
                    <Text
                      style={[
                        s.archBand,
                        (a.band === 'flat' || a.band === 'live') && s.archBandQuiet,
                      ]}
                    >
                      {a.band === 'flat'
                        ? 'not generated'
                        : a.band === 'live'
                          ? 'settles 7am'
                          : a.band}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}

        {/* ══ SAVED ══ Saving is free; these wait until you have a token.
            The store still calls it `starred` / `toggleStar` — the copy moved
            to "save" (3 Sep) to match the magazine sheet's "Save for later",
            the internals didn't. Renaming the store is churn with no reader. */}
        {w.view === 'saved' ? (
          <>
            <SectionHead title="Want, don't own" note={pieceLabel(starred.length)} />
            {starred.length === 0 ? (
              <EmptyState
                kick="nothing saved yet"
                body="Save pieces from the magazine and they wait here until you have a token."
              />
            ) : (
              <>
                <View style={s.inv}>
                  {starred.map((n) => (
                    <InventoryTile
                      key={n}
                      name={n}
                      history={held.includes(n) ? 'yours now' : 'saved · costs a token'}
                      image={garmentImage(n)}
                      /* No NEW flag here. It used to be set to "not owned
                         yet", but everywhere else in the app NEW means
                         "arrived today" — on a saved piece it claims the
                         opposite of what the row says. The caption carries
                         the status. */
                      onPress={() => toggleStar(n)}
                    />
                  ))}
                </View>
                <Body style={{ marginTop: 9 }}>
                  Tap one to take it off the list. <B>Spend tokens in the magazine.</B>
                </Body>
              </>
            )}
          </>
        ) : null}

        <Gap />
      </Scroll>

      <Foot>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Button
            label="Find more pieces"
            variant="quiet"
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/magazine')}
          />
          {/* HIDDEN ONCE YOU'RE IN (Katya, 3 Sep), not relabelled. The builder
              is a dead screen after entry — every control on it no-ops,
              because nothing can be changed — and on Day 1 the walkthrough
              means you have already entered by the time you first see this
              tab, so the button would be dead on arrival. "Find more pieces"
              takes the full width on its own. */}
          {entered ? null : (
            <Button
              label="Build tonight's look"
              variant="quiet"
              style={{ flex: 1 }}
              onPress={() => router.push('/(tabs)/today/build')}
            />
          )}
        </View>
      </Foot>
      {/* NOTHING EVER LEAVES is the wardrobe's whole promise, so dropping a
          piece is the one action here that contradicts it and the only one
          that asks first. The note is the reassurance that keeps the promise
          true: a dropped piece is not destroyed, it costs a token to take
          again. */}
      <ConfirmSheet
        visible={pendingDrop !== null}
        kick="remove a piece"
        question={'Are you sure you’d like to remove this piece from your wardrobe?'}
        subject={pendingDrop ?? undefined}
        image={pendingDrop ? garmentImage(pendingDrop) : undefined}
        note="Nothing is lost for good — you can take it again from the magazine for a token."
        confirmLabel="Yes, remove"
        cancelLabel="Keep it"
        onConfirm={() => {
          if (pendingDrop) w.remove(pendingDrop);
          setPendingDrop(null);
        }}
        onCancel={() => setPendingDrop(null)}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  /** No alert hue survives the v3 collapse — ink border, sunk ground. */
  full: {
    marginTop: 12,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.creamSunk,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  fullTitle: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 13,
    lineHeight: 17.5,
    color: palette.ink,
    marginTop: 6,
  },
  inv: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  rail: { flexDirection: 'row', gap: 7 },
  railCard: {
    width: 96,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
  },
  railThumb: { height: 52, alignItems: 'center', justifyContent: 'center' },
  railThumbLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 15,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  railName: {
    backgroundColor: palette.cream,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8.5,
    lineHeight: 9.8,
    color: palette.ink,
  },
  arch: { borderWidth: border.hair, borderColor: palette.rule, backgroundColor: palette.creamRaised },
  archRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  /** Wide enough for the flat lay to be legible as a thumbnail — ComposedFlatLay
   *  sets its own 3:4 aspect, so no height here. */
  archPlate: {
    width: 54,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  archJob: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, lineHeight: 14.4, color: palette.ink },
  archNote: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 12.4,
    color: palette.greyMute,
    marginTop: 3,
  },
  archBandQuiet: {
    color: palette.greyMute,
    fontFamily: 'Archivo_600SemiBold',
    textTransform: 'none',
  },
  /** disp800 retired — see cards.tsx statValue for the same call. */
  archBand: {
    maxWidth: 74,
    textAlign: 'right',
    fontFamily: 'Archivo_900Black',
    fontSize: 12,
    lineHeight: 12.6,
    textTransform: 'uppercase',
    color: palette.ink,
  },
});

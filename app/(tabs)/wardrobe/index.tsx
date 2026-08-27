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

import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll, SectionHead } from '@/ui/layout';
import { Kick, Tiny, B } from '@/ui/text';
import { Button, ChipRow, Segmented } from '@/ui/controls';
import { EmptyState, FirstRun, NewBox } from '@/ui/cards';
import { InventoryTile } from '@/ui/pieces';
import { TokenBadge } from '@/ui/TokenBadge';
import { palette, border, space } from '@/theme/tokens';
import { CATEGORIES, type Category } from '@/domain/garments';
import { WARDROBE_CAP } from '@/domain/economy';
import { capsuleByKey } from '@/data/capsules';
import { dayConfig } from '@/config/testState';
import { groupByCategory, useWardrobe, wornLabel, type WardrobeView } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';
import { useSession } from '@/state/session';

export default function Wardrobe() {
  const day = useSession((s) => s.day);
  const capsuleKey = useSession((s) => s.capsule);
  const cfg = dayConfig(day);

  const w = useWardrobe();
  const starred = useEconomy((s) => s.starred);
  const held = useEconomy((s) => s.held);
  const toggleStar = useEconomy((s) => s.toggleStar);

  const groups = groupByCategory(w.pieces, w.filter);
  const capsuleName = capsuleKey ? capsuleByKey(capsuleKey).name.toLowerCase() : 'starter';

  return (
    <Screen>
      <LogoBlock
        title="Wardrobe"
        subtitle={`${w.count} pieces · nothing ever leaves`}
        right={<TokenBadge />}
      />

      <Scroll>
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
            {day === 1 ? (
              <View style={{ marginTop: 12 }}>
                <FirstRun
                  kick="brand new · nothing earned yet"
                  title={`${w.count} pieces. That is the lot.`}
                  body={`The ${capsuleName} capsule you picked, and nothing else. Enough to enter with, nowhere near enough to be good — the rest comes out of the magazine, and every piece in there is one somebody put in a look.`}
                />
              </View>
            ) : null}

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
                <Tiny color={palette.shockMid} style={{ marginTop: 6 }}>
                  Nothing is lost for good — a dropped piece can be taken again with a token.
                </Tiny>
              </View>
            ) : w.count >= WARDROBE_CAP - 5 ? (
              <Tiny style={{ marginTop: 12 }}>
                {WARDROBE_CAP - w.count} spaces left of {WARDROBE_CAP}.
              </Tiny>
            ) : null}

            <View style={{ marginTop: 12 }}>
              <ChipRow
                items={['All', ...CATEGORIES]}
                value={w.filter}
                onChange={(v) => w.setFilter(v as Category | 'All')}
              />
            </View>

            {/* Hidden on Day 1 — a nudge from eight visible things is noise. */}
            {cfg.showTryTheseRail ? (
              <>
                <SectionHead title="Try these" note="shuffled daily" />
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
                <Tiny style={{ marginTop: 6 }}>
                  A nudge, not a reshuffle — the grid below stays where you left it, so you can
                  actually find things.
                </Tiny>
              </>
            ) : null}

            {groups.map((g) => (
              <View key={g.category}>
                <SectionHead title={g.category} note={`${g.items.length} pieces`} />
                <View style={s.inv}>
                  {g.items.map((p) => (
                    <InventoryTile
                      key={p.name}
                      name={p.name}
                      history={wornLabel(p)}
                      provenance={p.provenance}
                      isNew={p.isNew}
                      onDrop={() => w.remove(p.name)}
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
                note="Combinations you save in Create land here too — no render, no score, just a set of pieces waiting for the right job."
              >
                <Button
                  label="Make something"
                  variant="quiet"
                  style={{ marginTop: 12 }}
                  onPress={() => router.push('/(tabs)/create')}
                />
              </EmptyState>
            ) : (
              <View style={s.arch}>
                {w.archive.map((a, i) => (
                  <View
                    key={`${a.job}-${i}`}
                    style={[s.archRow, i === w.archive.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={s.archPlate} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.archJob}>{a.job}</Text>
                      <Text style={s.archNote}>
                        {a.when} · {a.note}
                      </Text>
                    </View>
                    <Text style={[s.archBand, a.band === 'flat' && { color: palette.faint }]}>
                      {a.band === 'flat' ? 'not rendered' : a.band}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}

        {/* ══ SAVED ══ Starring is free; these wait until you have a token. */}
        {w.view === 'saved' ? (
          <>
            <SectionHead title="Want, don't own" note={`${starred.length} pieces`} />
            {starred.length === 0 ? (
              <EmptyState
                kick="nothing starred"
                body="Star pieces in the magazine and they wait here until you have a token."
              />
            ) : (
              <>
                <View style={s.inv}>
                  {starred.map((n) => (
                    <InventoryTile
                      key={n}
                      name={n}
                      history={held.includes(n) ? 'yours now' : '★ saved · costs a token'}
                      provenance="starred"
                      isNew={!held.includes(n)}
                      onPress={() => toggleStar(n)}
                    />
                  ))}
                </View>
                <Tiny style={{ marginTop: 9 }}>
                  Tap to unstar. <B>Spend tokens in the magazine.</B>
                </Tiny>
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
          <Button
            label="Build tonight's look"
            variant="quiet"
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/today/build')}
          />
        </View>
      </Foot>
    </Screen>
  );
}

const s = StyleSheet.create({
  full: {
    marginTop: 12,
    borderWidth: border.mid,
    borderColor: palette.shock,
    backgroundColor: palette.shockTint,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  fullTitle: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 13,
    lineHeight: 17.5,
    color: palette.shockInk,
    marginTop: 6,
  },
  inv: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  rail: { flexDirection: 'row', gap: 7 },
  railCard: {
    width: 96,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
  },
  railThumb: { height: 52, alignItems: 'center', justifyContent: 'center' },
  railThumbLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 15,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  railName: {
    backgroundColor: palette.paper,
    borderTopWidth: border.hair,
    borderTopColor: palette.line,
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8.5,
    lineHeight: 9.8,
    color: palette.ink,
  },
  arch: { borderWidth: border.hair, borderColor: palette.line, backgroundColor: palette.card },
  archRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.line,
  },
  archPlate: {
    width: 42,
    height: 52,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
  },
  archJob: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, lineHeight: 14.4, color: palette.ink },
  archNote: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 12.4,
    color: palette.faint,
    marginTop: 3,
  },
  archBand: {
    maxWidth: 74,
    textAlign: 'right',
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: 12,
    lineHeight: 12.6,
    textTransform: 'uppercase',
    color: palette.klein,
  },
});

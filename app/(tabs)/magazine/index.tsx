/**
 * a5 · THE MAGAZINE — appetite, and the only shop.
 *
 * Rewritten from a scroll listener onto a FlatList, which is the one place the
 * port genuinely improves on the prototype: the prototype re-rendered the whole
 * feed on every state change (`refreshFeed()` rebuilt every card to update one
 * reaction count). Here the list is virtualised and a card re-renders alone.
 *
 * ══ READ domain/magazine.ts BEFORE CHANGING ANYTHING IN HERE ══
 * SAMPLE, DON'T SORT. Never weight by popularity, reactions, token counts or
 * placing. That single change would quietly ruin the product by converging every
 * wardrobe, and it is the most tempting "improvement" anyone will propose.
 *
 * ELIGIBLE POOL: settled entries · free posts · house editorial. NEVER a live
 * entry — otherwise you are reading tonight's rivals.
 *
 * OUT OF TOKENS ROUTES TO SAVE, NOT TO A WALL. The sheet's row button becomes
 * "Save for later" when a token can't be spent — see ui/BottomSheet.tsx for why,
 * and note that saving grants nothing: invariant 1 still holds, and the piece
 * only enters the wardrobe when a token is spent on it.
 *
 * REACTIONS ARE ON THE CARD, NOT BEHIND A BUTTON (Katya, 4 Sep) — the nine
 * values, per `reactions-logic.md`. The rules live in domain/reactions.ts; the
 * cluster is ui/Reactions.tsx. This screen only carries the held value from the
 * store to the card and back. It must never sort by any of it.
 *
 * ⚠ KNOWN INCOMPLETE, carried over: the filter rail is visually live but does
 * not change the content pool. Do not demo it as working.
 */

import { useEffect } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { LogoBlock, Screen } from '@/ui/layout';
import { Tiny } from '@/ui/text';
import { Chip, FilterTab } from '@/ui/controls';
import { SearchSheet } from '@/ui/SearchSheet';
import { SearchIcon } from '@/ui/TabIcon';
import { BottomSheet } from '@/ui/BottomSheet';
import { LookCard, SpreadCapped, SpreadCard } from '@/ui/FeedCards';
import { palette, border, space } from '@/theme/tokens';
import { canTake } from '@/domain/economy';
import { MAGAZINE_FILTERS, feedIsFinite, thinResultNote, trendingVisible } from '@/domain/magazine';
import { FEED_LOOKS } from '@/data/looks';
import { garmentImage } from '@/data/catalogue';
import { cards, spreadIsCapped, FIRST_PAGE, NEXT_PAGE, useMagazine } from '@/state/magazine';
import { useEconomy } from '@/state/economy';
import { useWardrobe } from '@/state/wardrobe';

/**
 * The chips, in order. `Trending` is dropped unless its flag is on and its
 * eligible set clears the floor — `trendingVisible` owns both conditions, so
 * the chip cannot appear for one reason and not the other.
 *
 * ⚠ THE ELIGIBLE COUNT IS 0 HERE. There is no reaction-velocity data in the
 * prototype (reactions carry no timestamps), so nothing can compute a rolling
 * 24h window. The chip is therefore always absent, which is also what the
 * brief expects at the ~125 DAU launch floor. `trendingSet` in
 * domain/magazine.ts is the real computation, tested, waiting for data.
 */
const TRENDING_ELIGIBLE_COUNT = 0;
const RAIL = MAGAZINE_FILTERS.filter(
  (f: string) => f !== 'Trending' || trendingVisible(TRENDING_ELIGIBLE_COUNT),
);

const s_rail = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 3,
  borderBottomWidth: border.hair,
  borderBottomColor: palette.rule,
};
const s_searchBtn = { paddingHorizontal: space.gutter - 6, paddingVertical: 8 };
const s_activeRow = { flexDirection: 'row' as const, paddingHorizontal: space.gutter, paddingTop: 10 };
const s_thin = { paddingHorizontal: space.gutter, paddingTop: 10 };

export default function Magazine() {
  /* Selected field by field on purpose. `useMagazine()` with no selector
     subscribes to the whole store, which re-renders every card on every
     reaction tap — exactly the prototype behaviour this screen replaced. */
  const length = useMagazine((s) => s.length);
  const spreadIndex = useMagazine((s) => s.spreadIndex);
  const calls = useMagazine((s) => s.calls);
  const reactions = useMagazine((s) => s.reactions);
  const filter = useMagazine((s) => s.filter);
  const sheet = useMagazine((s) => s.sheet);
  const extend = useMagazine((s) => s.extend);
  const call = useMagazine((s) => s.call);
  const react = useMagazine((s) => s.react);
  const setFilter = useMagazine((s) => s.setFilter);
  const pool = useMagazine((s) => s.pool);
  const garments = useMagazine((s) => s.garments);
  const query = useMagazine((s) => s.query);
  const searchOpen = useMagazine((s) => s.searchOpen);
  const toggleGarment = useMagazine((s) => s.toggleGarment);
  const setQuery = useMagazine((s) => s.setQuery);
  const clearSearch = useMagazine((s) => s.clearSearch);
  const openSearch = useMagazine((s) => s.openSearch);
  const closeSearch = useMagazine((s) => s.closeSearch);
  const openSheet = useMagazine((s) => s.openSheet);
  const closeSheet = useMagazine((s) => s.closeSheet);
  const focusPiece = useMagazine((s) => s.focusPiece);

  const economy = useEconomy();
  const wardrobeCount = useWardrobe((s) => s.count);
  const wardrobeCap = useWardrobe((s) => s.cap);
  const addToWardrobe = useWardrobe((s) => s.add);
  const removeFromWardrobe = useWardrobe((s) => s.remove);

  useEffect(() => {
    if (length === 0) extend(FIRST_PAGE);
  }, [length, extend]);

  const list = cards({ length, spreadIndex, pool, filter });
  /* ONE SOURCE for what is on screen and what the screen says about it — the
     note and the feed both read `pool`, so they can never disagree. */
  const thin = thinResultNote(pool.length, filter);
  const searchActive = garments.length > 0 || query.trim().length > 0;
  /* A filtered stream ends when the matches run out — see `feedIsFinite`. So
     the endless-scroll affordances have to go with it: no `onEndReached`, and
     a footer that says it is the end rather than inviting more. */
  const finite = feedIsFinite(filter, garments, query);
  const exhausted = finite && list.filter((c) => c.kind !== 'S').length >= pool.length;
  const sheetLook = sheet !== null ? FEED_LOOKS[sheet % FEED_LOOKS.length]! : null;

  /**
   * Taking a piece moves the token balance AND the inventory, together. The
   * prototype once moved only the counter — invisible at 96 pieces, glaring at 8.
   */
  const toggleTake = (name: string) => {
    if (economy.held.includes(name)) {
      economy.putBack(name);
      removeFromWardrobe(name);
      return;
    }
    if (!canTake(economy, wardrobeCount, wardrobeCap)) return;
    economy.take(name);
    addToWardrobe(name);
  };

  const openPiece = (name: string, from: string, tags: readonly string[]) => {
    focusPiece({ name, from, tags });
    closeSheet();
    router.push('/(tabs)/magazine/piece');
  };

  return (
    <Screen>
      <LogoBlock title="Magazine" />

      {/* ══ THE RAIL IS LIVE NOW (4 Sep) ══
          It was two chips and a dead "Filter" label, and `filter` was stored
          and read by nothing. Every chip narrows the pool; the SAMPLER still
          samples within it. A filter must never become an ordering — the long
          version of why is at the top of domain/magazine.ts.

          `Trending` is absent unless its flag is on AND its eligible set
          clears the floor of 12. It is the one chip that lets reactions decide
          anything, and it is off by default. */}
      <View style={s_rail}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.gutter - 9 }}
        >
          {RAIL.map((f) => (
            <FilterTab
              key={f}
              label={f}
              on={filter === f}
              onPress={() => {
                setFilter(f);
                extend(FIRST_PAGE);
              }}
            />
          ))}
        </ScrollView>

        {/* The search icon sits OUTSIDE the scrolling chips so it cannot be
            scrolled off — it is the other axis, not another chip. */}
        <Pressable
          onPress={openSearch}
          accessibilityRole="button"
          accessibilityLabel="Find a piece"
          style={s_searchBtn}
        >
          <SearchIcon on={searchActive} />
        </Pressable>
      </View>

      {/* The active garment selection, as a removable chip under the rail.
          It is not in the rail itself because the rail is single-select by
          kind and this is a second, multi-select axis — one control that did
          both would have to explain which of the two a tap meant. */}
      {searchActive ? (
        <View style={s_activeRow}>
          <Chip
            label={`${[...garments, ...(query.trim() ? [query.trim()] : [])].join(' · ')} ×`}
            tone="on"
            onPress={() => {
              clearSearch();
              extend(FIRST_PAGE);
            }}
          />
        </View>
      ) : null}

      {/* Honest about a thin pool, and it offers the widening move rather
          than silently relaxing anything. */}
      {thin ? <Tiny style={s_thin}>{thin}</Tiny> : null}

      <FlatList
        data={list}
        keyExtractor={(c) => String(c.index)}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.6}
        onEndReached={exhausted ? undefined : () => extend(NEXT_PAGE)}
        ListFooterComponent={
          <Tiny style={{ paddingHorizontal: space.gutter, paddingVertical: 20, textAlign: 'center' }}>
            {exhausted
              ? pool.length === 1
                ? 'That is the only one.'
                : `That is all ${pool.length} of them.`
              : 'keep scrolling'}
          </Tiny>
        }
        renderItem={({ item }) => {
          if (item.kind === 'S') {
            return spreadIsCapped(item.spreadNumber) ? (
              <SpreadCapped />
            ) : (
              <SpreadCard
                index={item.index}
                spreadNumber={item.spreadNumber}
                called={calls[item.index]}
                onCall={(side) => call(item.index, side)}
              />
            );
          }
          const look = FEED_LOOKS[item.lookIndex % FEED_LOOKS.length]!;
          return (
            <LookCard
              look={look}
              index={item.index}
              held={reactions[item.index]}
              /* THE WALKTHROUGH TIP IS GONE (Katya, 4 Sep). It sat on the
                 first card and read "This is where clothes come from. Judging
                 earns tokens. This is the only place to spend them." — three
                 rules stated at once, in the largest accent panel on the
                 screen, above the first photograph anyone sees. Same reasoning
                 that took the builder's "No hints, on purpose" tooltip off on
                 3 Sep: it pushed the thing the screen exists to show down the
                 page in order to explain it. All three rules are still
                 enforced, and the token badge already says what a token is. */
              onOpenSheet={() => openSheet(item.index)}
              onReact={(v) => react(item.index, v)}
            />
          );
        }}
      />

      {/* The other axis. Chrome is ui/Sheet.tsx, shared with the wardrobe's
          confirm and the Today card's submission drawer. */}
      <SearchSheet
        visible={searchOpen}
        categories={garments}
        query={query}
        matchCount={pool.length}
        onToggleCategory={(c) => {
          toggleGarment(c);
          extend(FIRST_PAGE);
        }}
        onChangeQuery={(q) => {
          setQuery(q);
          extend(FIRST_PAGE);
        }}
        onClear={() => {
          clearSearch();
          extend(FIRST_PAGE);
        }}
        onDismiss={closeSearch}
      />

      <BottomSheet
        visible={sheet !== null}
        rows={
          sheetLook
            ? sheetLook.pieces.map((p) => ({
                name: p,
                held: economy.held.includes(p),
                starred: economy.starred.includes(p),
                image: garmentImage(p),
              }))
            : []
        }
        canTake={canTake(economy, wardrobeCount, wardrobeCap)}
        onClose={closeSheet}
        onToggleTake={toggleTake}
        onToggleSave={economy.toggleStar}
        onOpenPiece={(name) =>
          sheetLook ? openPiece(name, sheetLook.by, sheetLook.tags) : undefined
        }
      />
    </Screen>
  );
}

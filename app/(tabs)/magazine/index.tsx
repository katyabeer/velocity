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
 * ⚠ KNOWN INCOMPLETE, carried over: the filter rail is visually live but does
 * not change the content pool. Do not demo it as working.
 */

import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { LogoBlock, Screen } from '@/ui/layout';
import { Tiny } from '@/ui/text';
import { FilterTab } from '@/ui/controls';
import { Tip } from '@/ui/cards';
import { BottomSheet } from '@/ui/BottomSheet';
import { LookCard, SpreadCapped, SpreadCard } from '@/ui/FeedCards';
import { palette, border, space } from '@/theme/tokens';
import { canTake } from '@/domain/economy';
import { FEED_LOOKS } from '@/data/looks';
import { garmentImage } from '@/data/catalogue';
import { cards, spreadIsCapped, FIRST_PAGE, NEXT_PAGE, useMagazine } from '@/state/magazine';
import { useEconomy } from '@/state/economy';
import { useWardrobe } from '@/state/wardrobe';
import { useSession, TIPS, TIP_LEAD } from '@/state/session';

export default function Magazine() {
  /* Selected field by field on purpose. `useMagazine()` with no selector
     subscribes to the whole store, which re-renders every card on every
     reaction tap — exactly the prototype behaviour this screen replaced. */
  const length = useMagazine((s) => s.length);
  const spreadIndex = useMagazine((s) => s.spreadIndex);
  const revealed = useMagazine((s) => s.revealed);
  const reactions = useMagazine((s) => s.reactions);
  const filter = useMagazine((s) => s.filter);
  const sheet = useMagazine((s) => s.sheet);
  const extend = useMagazine((s) => s.extend);
  const reveal = useMagazine((s) => s.reveal);
  const react = useMagazine((s) => s.react);
  const setFilter = useMagazine((s) => s.setFilter);
  const openSheet = useMagazine((s) => s.openSheet);
  const closeSheet = useMagazine((s) => s.closeSheet);
  const focusPiece = useMagazine((s) => s.focusPiece);

  const economy = useEconomy();
  const wardrobeCount = useWardrobe((s) => s.count);
  const wardrobeCap = useWardrobe((s) => s.cap);
  const addToWardrobe = useWardrobe((s) => s.add);
  const removeFromWardrobe = useWardrobe((s) => s.remove);
  const tipDismissed = useSession((s) => s.dismissedTips.magazine);
  const dismissTip = useSession((s) => s.dismissTip);

  useEffect(() => {
    if (length === 0) extend(FIRST_PAGE);
  }, [length, extend]);

  const list = cards({ length, spreadIndex });
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

      {/* The filter rail. See the warning at the top of this file — "Filter"
          is a static entry point only, not wired to the fuller FILTERS list
          (data/magazine.ts documents the whole rail as visual-only for MVP). */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: space.gutter - 9,
          paddingVertical: 3,
          borderBottomWidth: border.hair,
          borderBottomColor: palette.rule,
        }}
      >
        <FilterTab
          label="All"
          on={filter === 'All'}
          onPress={() => {
            setFilter('All');
            extend(FIRST_PAGE);
          }}
        />
        <FilterTab
          label="From the room"
          on={filter === 'From the room'}
          onPress={() => {
            setFilter('From the room');
            extend(FIRST_PAGE);
          }}
        />
        <FilterTab label="Filter" />
      </View>

      <FlatList
        data={list}
        keyExtractor={(c) => String(c.index)}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.6}
        onEndReached={() => extend(NEXT_PAGE)}
        ListHeaderComponent={
          tipDismissed ? null : (
            <View style={{ paddingHorizontal: space.gutter }}>
              <Tip
                lead={TIP_LEAD.magazine}
                body={TIPS.magazine.replace(TIP_LEAD.magazine, '').trim()}
                onDismiss={() => dismissTip('magazine')}
              />
            </View>
          )
        }
        ListFooterComponent={
          <Tiny style={{ paddingHorizontal: space.gutter, paddingVertical: 20, textAlign: 'center' }}>
            keep scrolling
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
                revealed={!!revealed[item.index]}
                onCall={() => reveal(item.index)}
              />
            );
          }
          const look = FEED_LOOKS[item.lookIndex % FEED_LOOKS.length]!;
          return (
            <LookCard
              look={look}
              index={item.index}
              activeReaction={reactions[item.index]}
              onOpenSheet={() => openSheet(item.index)}
              onReact={(j) => react(item.index, j)}
              onTag={(t) => {
                setFilter(t);
                extend(FIRST_PAGE);
              }}
            />
          );
        }}
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

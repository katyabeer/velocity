/**
 * The three magazine card types. Three only, for MVP (locked decision 8).
 *
 *   H  house-made look
 *   U  user look
 *   S  spread — two looks; you get the room's split immediately
 *
 * THE SPREAD IS WHERE FREE VOTING WENT. Not a separate destination — the feed
 * asks you to call one every few pages, hands you the split and the reason
 * immediately, and scores your eye without settling anything.
 *
 * REACTIONS ARE ON LOOKS ONLY, never on individual garments, and per R-F4 they
 * NEVER FEED THE RANKING — they are for the maker. Jack has flagged REACT as the
 * cheapest mechanic to cut, so test it rather than defend it.
 *
 * TO TAKE A GARMENT: tap the look → bottom sheet. That is the only route.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, tintFor } from '@/theme/tokens';
import { REACTIONS, splitVerdict } from '@/domain/magazine';
import { LookPlate, SplitBar } from './LookPlate';
import { Hero, Tiny } from './text';
import type { FeedLook } from '@/data/looks';
import { JUDGING_LOOKS, SPREAD_SPLITS } from '@/data/looks';

/** A full-bleed look card: plate, tags, five reaction words. */
export function LookCard({
  look,
  activeReaction,
  onOpenSheet,
  onReact,
  onTag,
}: {
  look: FeedLook;
  activeReaction?: number;
  onOpenSheet: () => void;
  onReact: (i: number) => void;
  onTag: (tag: string) => void;
}) {
  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.headKick}>{look.house ? 'ours' : look.by}</Text>
        <Text style={s.headMeta}>{look.house ? 'editorial' : 'from the room'}</Text>
      </View>

      <Pressable onPress={onOpenSheet} accessibilityRole="button">
        <View style={[s.bleedPlate, { backgroundColor: tintFor(look.tint) }]}>
          <Text style={s.bleedGhost}>{look.tags[0]?.replace(' ', '\n')}</Text>
          <View style={s.tapme}>
            <Text style={s.tapmeLabel}>{look.pieces.length} pieces →</Text>
          </View>
        </View>
      </Pressable>

      <View style={s.tagRow}>
        {look.tags.map((t) => (
          <Text key={t} style={s.tag} onPress={() => onTag(t)}>
            #{t.replace(' ', '')}
          </Text>
        ))}
      </View>

      <View style={s.reactRow}>
        {REACTIONS.map((r, j) => {
          const on = activeReaction === j;
          return (
            <Pressable
              key={r}
              onPress={() => onReact(j)}
              style={[s.react, on && s.reactOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[s.reactLabel, on && { color: palette.ink }]}>{r}</Text>
              <Text style={s.reactCount}>{(look.reactionCounts[j] ?? 0) + (on ? 1 : 0)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * A spread. Before you call it: two plates and a question. After: the split,
 * and what it means.
 *
 * SPREADS ARE CAPPED AT SIX A DAY. They are scored, so uncapped they are
 * grindable — and a scored mechanic you can grind stops measuring anything.
 */
export function SpreadCard({
  index,
  spreadNumber,
  revealed,
  onCall,
}: {
  index: number;
  spreadNumber: number;
  revealed: boolean;
  onCall: () => void;
}) {
  const split = SPREAD_SPLITS[spreadNumber % SPREAD_SPLITS.length]!;
  const left = JUDGING_LOOKS[(index * 2) % JUDGING_LOOKS.length]!;
  const right = JUDGING_LOOKS[(index * 2 + 1) % JUDGING_LOOKS.length]!;

  return (
    <View style={s.spread}>
      <View style={s.head}>
        <Text style={s.headKick}>train your eye · {spreadNumber + 1} of 6</Text>
        <Text style={s.headMeta}>{split.occasion}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 12 }}>
        <View style={{ flex: 1 }}>
          <LookPlate {...left} height={210} onPress={revealed ? undefined : onCall} />
        </View>
        <View style={{ flex: 1 }}>
          <LookPlate {...right} height={210} onPress={revealed ? undefined : onCall} />
        </View>
      </View>

      {!revealed ? (
        <Tiny style={{ paddingHorizontal: 22, paddingTop: 11 }}>
          Which one works? Tap it — the room has already voted.
        </Tiny>
      ) : (
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <Hero size={44} color={split.share >= 50 ? palette.klein : palette.ink}>
            {split.share}%
          </Hero>
          <Text style={s.spreadLine}>of people picked the same one.</Text>
          <View style={{ marginTop: 12 }}>
            <SplitBar share={split.share} />
          </View>
          <Tiny style={{ marginTop: 9 }}>{splitVerdict(split.share)}</Tiny>
        </View>
      )}
    </View>
  );
}

/** Past the daily cap, the slot renders this instead. */
export function SpreadCapped() {
  return (
    <View style={s.spread}>
      <View style={s.head}>
        <Text style={[s.headKick, { color: palette.shock }]}>that&apos;s your six</Text>
        <Text style={s.headMeta}>spreads</Text>
      </View>
      <Hero size={38} style={{ paddingHorizontal: 22 }}>
        {'Come back\ntomorrow.'}
      </Hero>
      <Tiny style={{ paddingHorizontal: 22, paddingTop: 12 }}>
        Six a day, so the eye score means something. Looks keep coming.
      </Tiny>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.line,
  },
  spread: {
    backgroundColor: palette.fill,
    paddingTop: 20,
    paddingBottom: 22,
    borderTopWidth: border.mid,
    borderBottomWidth: border.mid,
    borderColor: palette.ink,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 22,
    marginBottom: 9,
  },
  headKick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: palette.klein,
  },
  headMeta: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 8.5,
    letterSpacing: 1.02,
    textTransform: 'uppercase',
    color: palette.faint,
  },
  bleedPlate: { height: 296, alignItems: 'center', justifyContent: 'center' },
  bleedGhost: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 30,
    lineHeight: 27,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.16)',
    textAlign: 'center',
  },
  tapme: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: palette.paper,
    borderWidth: border.mid,
    borderColor: palette.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tapmeLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  tagRow: { flexDirection: 'row', gap: 11, flexWrap: 'wrap', paddingHorizontal: 22, paddingTop: 11 },
  tag: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, lineHeight: 14.4, color: palette.klein },
  reactRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 22, paddingTop: 11 },
  react: {
    flex: 1,
    height: 40,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  reactOn: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.fill },
  reactLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  reactCount: { fontFamily: 'Archivo_400Regular', fontSize: 8, color: palette.faint },
  spreadLine: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 14,
    lineHeight: 18.9,
    color: palette.ink,
    marginTop: 6,
  },
});

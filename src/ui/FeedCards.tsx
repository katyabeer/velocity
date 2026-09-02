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
 *
 * v3 restyle (a5 · Magazine — the feed.pdf, 2 Sep 2026): feed images now tilt
 * and round per quintets.css's rotation/radius tokens; the old "N pieces →"
 * corner chip is now the `.qt-cta-pieces` "Save pieces" tag; the always-open
 * five-reaction row collapses behind a "Rate look" button (tap to reveal) so
 * the card matches the PDF's cleaner default state — REACTIONS THEMSELVES
 * ARE UNCHANGED, still five words, still display-only, never ranking. The
 * PDF's "Follow" button on non-house cards is NOT implemented — onboarding's
 * handle screen says explicitly "no followers, there's nowhere to put them,"
 * and there's no follow relationship anywhere in state. Flagging the
 * contradiction rather than quietly building a feature with nothing behind
 * it — Katya's call whether followers are actually coming back.
 */

import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, radius, rotation, tintFor, useReducedMotion } from '@/theme/tokens';
import { REACTIONS, shareForTierGap, splitVerdict } from '@/domain/magazine';
import { LookPlate, SplitBar } from './LookPlate';
import { Button } from './controls';
import { Hero, Tiny } from './text';
import type { FeedLook } from '@/data/looks';
import { JUDGING_LOOKS } from '@/data/looks';

/** A look card: a tilted, rounded plate; tags; five reaction words behind
 *  "Rate look". No longer literally edge-to-edge — quintets.css's rounded
 *  feed-image treatment needs an inset to actually read as rounded. */
export function LookCard({
  look,
  index,
  activeReaction,
  onOpenSheet,
  onReact,
  onTag,
}: {
  look: FeedLook;
  /** Feed position — alternates the image tilt direction, left/right. */
  index: number;
  activeReaction?: number;
  onOpenSheet: () => void;
  onReact: (i: number) => void;
  onTag: (tag: string) => void;
}) {
  const [rating, setRating] = useState(false);
  const reducedMotion = useReducedMotion();
  const tilt = reducedMotion ? 0 : index % 2 === 0 ? -rotation.r1 : rotation.r1;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.handle}>{look.house ? '@house' : look.by}</Text>
        <Text style={s.headMeta}>{look.house ? 'editorial' : 'from the room'}</Text>
      </View>

      <Pressable onPress={onOpenSheet} accessibilityRole="button">
        <View
          style={[s.bleedPlate, { backgroundColor: tintFor(look.tint), transform: [{ rotate: `${tilt}deg` }] }]}
        >
          {look.image ? (
            <Image source={look.image} style={s.bleedPhoto} resizeMode="cover" />
          ) : (
            <Text style={s.bleedGhost}>{look.tags[0]?.replace(' ', '\n')}</Text>
          )}
          <View style={s.savePieces}>
            <Text style={s.savePiecesLabel}>Save pieces</Text>
            <View style={s.savePiecesCount}>
              <Text style={s.savePiecesCountLabel}>{look.pieces.length}</Text>
            </View>
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

      {rating ? (
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
      ) : (
        <View style={{ paddingHorizontal: 22, paddingTop: 11 }}>
          <Button label="Rate look" variant="ghost" onPress={() => setRating(true)} />
        </View>
      )}
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
  const reducedMotion = useReducedMotion();
  const left = JUDGING_LOOKS[(index * 2) % JUDGING_LOOKS.length]!;
  const right = JUDGING_LOOKS[(index * 2 + 1) % JUDGING_LOOKS.length]!;
  /** Stand-in for a real per-look settled split (Jack's open question 5) —
   *  see shareForTierGap's doc comment in domain/magazine.ts. */
  const share = shareForTierGap(left.tier ?? 'mid', right.tier ?? 'mid');
  const tilt = reducedMotion ? 0 : rotation.r2;

  return (
    <View style={s.spread}>
      <View style={s.spreadHead}>
        <Text style={s.spreadTitle}>Train your eye</Text>
        <Text style={s.spreadSub}>which one works better?</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 12 }}>
        <View style={{ flex: 1, transform: [{ rotate: `${-tilt}deg` }] }}>
          <LookPlate {...left} height={300} onPress={revealed ? undefined : onCall} />
          {!revealed ? (
            <View style={s.votePill}>
              <Text style={s.votePillLabel}>Vote A</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, transform: [{ rotate: `${tilt}deg` }] }}>
          <LookPlate {...right} height={300} onPress={revealed ? undefined : onCall} />
          {!revealed ? (
            <View style={s.votePill}>
              <Text style={s.votePillLabel}>Vote B</Text>
            </View>
          ) : null}
        </View>
      </View>

      {!revealed ? (
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <Text style={s.briefLabel}>Brief: {left.occasion}</Text>
          <Tiny style={{ marginTop: 8 }}>
            Which one works? Tap it — the room has already voted.
          </Tiny>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          {/* Used to go klein when share >= 50 — no accent-as-text option
              survives the v3 collapse (accent is illegible on cream), so
              this majority cue is gone unless Katya wants it back some
              other way (bold weight, an icon). */}
          <Hero size={44} color={palette.ink}>
            {share}%
          </Hero>
          <Text style={s.spreadLine}>of people picked the same one.</Text>
          <View style={{ marginTop: 12 }}>
            <SplitBar share={share} />
          </View>
          <Tiny style={{ marginTop: 9 }}>{splitVerdict(share)}</Tiny>
        </View>
      )}
    </View>
  );
}

/** Past the daily cap, the slot renders this instead. */
export function SpreadCapped() {
  return (
    <View style={s.spread}>
      <View style={s.spreadHead}>
        <Text style={s.spreadTitle}>Train your eye</Text>
        <Text style={s.spreadSub}>that&apos;s your six for today</Text>
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
    borderBottomColor: palette.rule,
  },
  spread: {
    backgroundColor: palette.creamSunk,
    paddingTop: 20,
    paddingBottom: 22,
    borderTopWidth: border.mid,
    borderBottomWidth: border.mid,
    borderColor: palette.ink,
  },
  head: {
    paddingHorizontal: 22,
    marginBottom: 9,
  },
  handle: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 13,
    lineHeight: 15.6,
    color: palette.ink,
  },
  headMeta: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.greyMute,
    marginTop: 2,
  },
  spreadHead: { paddingHorizontal: 22, marginBottom: 12 },
  spreadTitle: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 14,
    lineHeight: 16.8,
    color: palette.ink,
  },
  spreadSub: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.greyMute,
    marginTop: 3,
  },
  briefLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 14,
    lineHeight: 16.8,
    color: palette.ink,
  },
  /** `.qt-img-feed` — rounded, tilted. Overflow hidden so the ghost watermark
   *  and tag both clip to the rounded corners even under rotation. */
  bleedPlate: {
    height: 560,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bleedPhoto: { width: '100%', height: '100%' },
  bleedGhost: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 30,
    lineHeight: 27,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.16)',
    textAlign: 'center',
  },
  /** `.qt-cta-pieces` — accent fill, ink text, ground-colored keyline, a
   *  small ink count badge. Replaces the old "N pieces →" corner chip. */
  savePieces: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.accent,
    borderWidth: border.key,
    borderColor: palette.cream,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  savePiecesLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  savePiecesCount: {
    width: 15,
    height: 15,
    borderRadius: radius.xs,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePiecesCountLabel: { fontFamily: 'Archivo_700Bold', fontSize: 9, color: palette.cream },
  /** `.qt-pill` — the Vote A / Vote B overlay on the spread pair. */
  votePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: palette.accent,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  votePillLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  tagRow: { flexDirection: 'row', gap: 11, flexWrap: 'wrap', paddingHorizontal: 22, paddingTop: 11 },
  /** `.qt-tag` — hashtags are interactive text, link-green. */
  tag: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, lineHeight: 14.4, color: palette.link },
  reactRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 22, paddingTop: 11 },
  react: {
    flex: 1,
    height: 40,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  reactOn: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.creamSunk },
  reactLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  reactCount: { fontFamily: 'Archivo_400Regular', fontSize: 8, color: palette.greyMute },
  spreadLine: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 14,
    lineHeight: 18.9,
    color: palette.ink,
    marginTop: 6,
  },
});

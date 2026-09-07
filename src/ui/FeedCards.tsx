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
 * REACTIONS ARE ON LOOKS ONLY, never on individual garments, and they NEVER
 * FEED THE RANKING. The nine-value system replaced five display-only words on
 * 4 Sep — see domain/reactions.ts, which carries the whole spec, and
 * ui/Reactions.tsx for the cluster.
 *
 * TO TAKE A GARMENT: tap the look → bottom sheet. That is the only route.
 *
 * "RATE LOOK" IS GONE (Katya, 4 Sep). It collapsed the reactions behind a tap,
 * which cost two taps for the common case and — the real problem — left a card
 * showing no sign that anyone had reacted at all. The one signal a maker gets
 * was invisible unless you went looking for it. The cluster and the look's
 * count are on the card now, always.
 *
 * THE TIP POINTS AT SAVE PIECES. It used to sit above the whole feed as a list
 * header with its caret aimed at the filter rail, which is not where clothes
 * come from — the Save pieces tag is. It now renders inside the first card,
 * directly under the image, caret at the right, pointing up at the tag.
 *
 * v3 restyle (a5 · Magazine — the feed.pdf, 2 Sep 2026): feed images tilt
 * and round per quintets.css's rotation/radius tokens; the old "N pieces →"
 * corner chip is the `.qt-cta-pieces` "Save pieces" tag. The
 * PDF's "Follow" button on non-house cards is NOT implemented — onboarding's
 * handle screen says explicitly "no followers, there's nowhere to put them,"
 * and there's no follow relationship anywhere in state. Flagging the
 * contradiction rather than quietly building a feature with nothing behind
 * it — Katya's call whether followers are actually coming back.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, border, radius, rotation, tintFor, useReducedMotion } from '@/theme/tokens';
import { shareForTierGap, splitVerdict } from '@/domain/magazine';
import { ownerStats, publicStats, type ReactionValue } from '@/domain/reactions';
import { LookPlate, SplitBar } from './LookPlate';
import { LockIcon } from './TabIcon';
import { OwnReactionRead, ReactionCluster } from './Reactions';
import { Hero, Tiny } from './text';
import { isEditorial, type FeedLook } from '@/data/looks';
import { JUDGING_LOOKS } from '@/data/looks';

/** A look card: a tilted, rounded plate; tags; the reaction cluster. No longer
 *  literally edge-to-edge — quintets.css's rounded feed-image treatment needs
 *  an inset to actually read as rounded. */
export function LookCard({
  look,
  index,
  held,
  onOpenSheet,
  onReact,
  tip,
}: {
  look: FeedLook;
  /** Feed position — alternates the image tilt direction, left/right. */
  index: number;
  /** The one reaction this user holds on this look, if any. */
  held?: ReactionValue;
  onOpenSheet: () => void;
  onReact: (v: ReactionValue) => void;
  /** Rendered directly under the image, pointing up at Save pieces. Only the
   *  first card in the feed passes one. */
  tip?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const editorial = isEditorial(look);
  const tilt = reducedMotion ? 0 : index % 2 === 0 ? -rotation.r1 : rotation.r1;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.handle}>{editorial ? '@house' : look.by}</Text>
        <Text style={s.headMeta}>
          {editorial ? 'editorial' : look.mine ? 'yours' : 'from the room'}
        </Text>
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

      {/* Directly under the image so the caret points up at the Save pieces
          tag, which sits at the image's bottom-right. */}
      {tip}

      <View style={s.tagRow}>
        {/* ⚠ NOT TAPPABLE, AND THAT IS AN INVARIANT (fixed 4 Sep). These used
            to set the feed's filter to the tag. domain/tags.ts is explicit:
            tags are "not clickable, not filterable, and they must NEVER reach
            the feed sampler — a tag filter is a sort, and invariant 7 is
            sample-don't-sort". Free text does not aggregate either, so
            `#wedding`, `#weddingvibes` and `#bigday` were three different
            filters over one idea. They are a caption on the look. */}
        {look.tags.map((t) => (
          <Text key={t} style={s.tag}>
            #{t.replace(' ', '')}
          </Text>
        ))}
      </View>

      {/* YOUR OWN LOOK GETS NO TAP TARGET (spec §1) — a read-only panel of the
          positives you received, and the room's read once five people have
          weighed in. Everyone else's look gets the cluster.

          Note which stats function each branch calls: `publicStats` returns a
          type with no negative field on it at all, so the non-owner branch
          cannot render one even by mistake. */}
      {look.mine ? (
        <OwnReactionRead
          view={ownerStats(look.reactions)}
          tally={look.reactions}
          /* ⚠ No declared word exists for a brief entry — locked decision 18
             removed the tag step, and open question C is whether it returns.
             Freestyle posts do carry an occasion, but the feed fixture does not
             record which one, so the gap sentence degrades to the room's read
             alone rather than inventing half of it. */
          declared={null}
        />
      ) : (
        /* NEGATIVES ARE STRIPPED HERE, at the boundary, so the cluster is
           never handed a number it must not render. `positiveBreakdown` is all
           it needs, and §6's rule then holds by construction rather than by
           the component remembering to be careful. */
        <ReactionCluster
          seeded={publicStats(look.reactions).positiveBreakdown}
          held={held}
          onReact={onReact}
        />
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
 *
 * ─── CALLING ONE LOCKS THE OTHER (Katya, 4 Sep) ─────────────────────────────
 * The plate you did not pick dims, settles back and takes a padlock; the one
 * you did keeps its full weight and says so. Neither is tappable afterwards —
 * there is no re-roll on a scored call, same as an entry, and the store
 * refuses a second call on the same spread even if a tap got through.
 *
 * THE LOCK IS NOT JUST AN OPACITY. §"never by colour alone" applies to state
 * generally: a dimmed plate could read as loading. The padlock says which of
 * the two things happened, and `LockIcon` already exists for the month-ahead
 * list, so it is the app's established mark for "closed".
 *
 * ─── NONE OF THIS GATES THE CALL ────────────────────────────────────────────
 * `onCall` fires on touch and the store records it immediately. Every animation
 * here is decoration layered over state that has already changed — the exact
 * opposite of the judging round, where the exit animation owns the vote and
 * needed a timeout fallback (see ui/LookPlate.tsx). Nothing to lose to a
 * starved frame loop, so nothing to guard.
 */
export function SpreadCard({
  index,
  spreadNumber,
  called,
  onCall,
}: {
  index: number;
  spreadNumber: number;
  /** Which side was called, or undefined while the spread is still open. */
  called?: 'a' | 'b';
  onCall: (side: 'a' | 'b') => void;
}) {
  const reducedMotion = useReducedMotion();
  const revealed = !!called;

  /* Was this card ALREADY called when it mounted? The feed is virtualised, so
     scrolling a settled spread back into view remounts it — replaying the
     reveal there would animate something the user settled ten cards ago. */
  const wasCalledOnMount = useRef(revealed);
  const reveal = useRef(new Animated.Value(revealed ? 1 : 0)).current;

  useEffect(() => {
    if (!revealed || wasCalledOnMount.current) return;
    if (reducedMotion) {
      reveal.setValue(1);
      return;
    }
    Animated.timing(reveal, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, reducedMotion, reveal]);

  /** The plate you didn't pick: dimmed and settled back. Driven off the same
   *  value as the reveal so the lock and the result arrive together. */
  const lockStyle = {
    opacity: reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
    transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }],
  };

  const resultStyle = {
    opacity: reveal,
    transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };
  const left = JUDGING_LOOKS[(index * 2) % JUDGING_LOOKS.length]!;
  const right = JUDGING_LOOKS[(index * 2 + 1) % JUDGING_LOOKS.length]!;
  /** Stand-in for a real per-look settled split (Jack's open question 5) —
   *  see shareForTierGap's doc comment in domain/magazine.ts. */
  const share = shareForTierGap(left.tier ?? 'mid', right.tier ?? 'mid');
  const tilt = reducedMotion ? 0 : rotation.r2;

  return (
    <View style={s.spread}>
      {/* SWAPPED AND CENTRED (Katya, 4 Sep), the same way the judging screen's
          pair was. The question is what each spread is asking; "Train your eye"
          is the section's name and is identical on every one of them, so
          setting it largest made the loudest line the one that never changes.
          Centred, because the two plates below are symmetrical and a
          left-aligned head over them pulls the eye off the axis the comparison
          happens on. */}
      <View style={s.spreadHead}>
        {/* The section name reads FIRST (Katya, 4 Sep) — kicker above the
            question, which is the order every other kicker in the app uses.
            The sizes stay as they are: "Train your eye" names the section and
            is identical on every spread, so the question is still the line
            set large. Only the vertical order changed. */}
        <Text style={s.spreadSub}>train your eye</Text>
        <Text style={s.spreadTitle}>Which one works better?</Text>
        {/* The brief moved ABOVE the plates. It is the condition both looks
            are being judged against, so it has to be read before they are —
            underneath, it was an explanation arriving after the decision. */}
        <Text style={s.briefLabel}>Brief: {left.occasion}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 12 }}>
        {(['a', 'b'] as const).map((side) => {
          const look = side === 'a' ? left : right;
          const locked = revealed && called !== side;
          const rotate = side === 'a' ? -tilt : tilt;
          return (
            <Animated.View
              key={side}
              style={[
                { flex: 1, transform: [{ rotate: `${rotate}deg` }] },
                locked && lockStyle,
              ]}
            >
              <LookPlate
                {...look}
                height={300}
                /* No tap target once called, on EITHER plate — the call is made
                   and there is no re-roll. */
                onPress={revealed ? undefined : () => onCall(side)}
              />

              {!revealed ? (
                <View style={s.votePill}>
                  <Text style={s.votePillLabel}>{side === 'a' ? 'Vote A' : 'Vote B'}</Text>
                </View>
              ) : locked ? (
                /* The padlock, not just the dimming — a dimmed plate on its own
                   could read as still loading. */
                <Animated.View style={[s.lockPill, { opacity: reveal }]}>
                  <LockIcon open={false} />
                </Animated.View>
              ) : (
                <Animated.View style={[s.callPill, { opacity: reveal }]}>
                  <Text style={s.votePillLabel}>Your call</Text>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Nothing under the plates until a call is made. "Which one works? Tap
          it — the room has already voted." came off (Katya, 4 Sep): the head
          now asks the question, the Vote A / Vote B pills say how to answer,
          and the second half was telling you the result exists before you had
          given an answer to compare it with. */}
      {!revealed ? null : (
        <Animated.View style={[{ paddingHorizontal: 22, paddingTop: 14 }, resultStyle]}>
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
        </Animated.View>
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
  spreadHead: { paddingHorizontal: 22, marginBottom: 12, alignItems: 'center' },
  /** The question now carries the weight the section name had. Bigger than the
   *  14 it replaced, because it is a heading rather than a label — and it is
   *  the only line on the card anyone needs to read before tapping. */
  spreadTitle: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 19,
    lineHeight: 23,
    textAlign: 'center',
    color: palette.ink,
  },
  /** Demoted to the kicker it always was, and now sitting above the question
   *  like every other kicker in the app. No top margin — it is the first
   *  thing in the head. */
  spreadSub: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: palette.greyMute,
    marginBottom: 5,
  },
  briefLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 12.5,
    lineHeight: 16,
    textAlign: 'center',
    color: palette.grey,
    marginTop: 8,
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
  /** The padlock on the plate you didn't pick. Same corner as the vote pill it
   *  replaces, so the two read as one slot changing state. */
  lockPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: palette.cream,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  /** And on the one you did — accent, because this is the answer you gave. */
  callPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
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
  spreadLine: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 14,
    lineHeight: 18.9,
    color: palette.ink,
    marginTop: 6,
  },
});

/**
 * The reaction cluster and its panel. Implements `reactions-logic.md` §4.
 *
 * ═══ VISIBLE UP FRONT, NOT BEHIND A BUTTON (Katya, 4 Sep) ═══════════════════
 * This replaced a "Rate look" ghost button that collapsed five words behind a
 * tap. Two things were wrong with it: reacting cost two taps for the common
 * case, and — worse — a card gave no sign that anyone had reacted at all, so
 * the one signal a maker gets was invisible unless you went looking. The
 * cluster and the look's positive count are now always on the card.
 *
 *   [ 👍 ]  [ 👎 ]  [ ✦ ]        12 · Bold · Iconic
 *
 * `✦` is the affordance, NOT a value. It opens the panel of seven words.
 *
 * ═══ THE PANEL ══════════════════════════════════════════════════════════════
 * Anchored over the cluster with a caret pointing at it, positives first, one
 * divider, then the negatives.
 *
 * IT RENDERS IN A MODAL, positioned from a real measurement, and that is not
 * over-engineering. §4 says the anchor "flips above/below the icon depending on
 * space; never let it clip the viewport". A popover that is a CHILD of the card
 * cannot honour that: the card lives inside a virtualised FlatList, so the list
 * clips it — the first attempt put the panel above the cluster and the top five
 * of seven rows were cut off by the filter rail. A Modal escapes the list's
 * overflow entirely, and `measureInWindow` is what tells it whether there is
 * room above.
 *
 * NEGATIVES ARE NOT RED. §4: "Red tags were tried and read as aggressive.
 * Negatives are distinguished by position and the divider, in the same ink as
 * the positives." That reversal is also on this repo's own do-not-re-propose
 * list, so it is doubly locked.
 *
 * ═══ WHAT THIS COMPONENT WILL NOT RENDER ════════════════════════════════════
 * It is handed a `PublicReactionView` for someone else's look, and that type
 * has NO negative field on it at all. A component cannot leak what it was never
 * given. The owner's view is a separate type and a separate branch.
 *
 * ⚠ In a real client the gate is the server's (§6) — this split is the contract
 * to build against, not a substitute. See domain/reactions.ts.
 *
 * ═══ ACCESSIBILITY (§4) ═════════════════════════════════════════════════════
 * Every target is at least 44x44, and state is carried by the word plus
 * `aria-checked`, never by colour alone.
 *
 * §4 asks for `role="menuitemradio"`. React Native's `role` union does not
 * contain it (it stops at `menuitem`), so the rows are `menuitem` with an
 * explicit `aria-checked` — which is the half of the requirement that actually
 * does the work, since it is what a screen reader announces. A real web client
 * can tighten the role to `menuitemradio`.
 *
 * ⚠ NOT DONE: focus trapping, arrow-key navigation and Esc-to-close. React
 * Native has no focus-trap primitive and this is a phone prototype — on web the
 * panel is reachable and operable by tab and Enter, but it does not trap. Flag
 * for whoever ships this on a real web target.
 */

import { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as RNView,
} from 'react-native';
import { palette, border, radius } from '@/theme/tokens';
import {
  NOT_ENOUGH_READS,
  PANEL_DIVIDER_AFTER,
  PANEL_VALUES,
  REACTION_LABELS,
  breakdownWords,
  publicStats,
  readSentence,
  withOwnReaction,
  type OwnerReactionView,
  type ReactionTally,
  type ReactionValue,
} from '@/domain/reactions';

/** §4: every target >= 44x44pt. */
const TARGET = 44;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** 7 rows at the target height, one divider, and the panel's own padding.
 *  Used only to decide which way to flip, so an estimate is fine. */
const PANEL_H = 7 * TARGET + 11 + 10;
const PANEL_W = 200;
/** Gap between the caret's tip and the icon it points at. */
const ANCHOR_GAP = 8;

type Anchor = { x: number; y: number; w: number; h: number };

function Icon({
  glyph,
  label,
  held,
  onPress,
}: {
  glyph: string;
  label: string;
  held: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.icon, held && s.iconHeld]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: held }}
    >
      <Text style={s.glyph}>{glyph}</Text>
    </Pressable>
  );
}

/**
 * Someone else's look: three targets, the public positive count, and the
 * breakdown as words.
 */
export function ReactionCluster({
  seeded,
  held,
  onReact,
}: {
  /**
   * What other people have said, POSITIVES ONLY — the caller strips negatives
   * at the boundary (see FeedCards). That is deliberate rather than defensive:
   * this component genuinely cannot leak a negative count, because it is never
   * handed one. §6's rule is about the payload, not the view.
   *
   * Your own held value arrives separately and may well be a negative; it moves
   * no positive count, because `publicStats` only ever sums positives.
   */
  seeded: ReactionTally;
  held?: ReactionValue;
  onReact: (v: ReactionValue) => void;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const sparkRef = useRef<RNView | null>(null);

  const commit = (v: ReactionValue) => {
    onReact(v);
    /* §4: "Panel dismisses immediately on commit. No confirm step, no toast." */
    setAnchor(null);
  };

  const togglePanel = () => {
    if (anchor) return setAnchor(null);
    /* Measured rather than assumed — the card scrolls, so where the icon is on
       screen is only knowable at the moment of the tap. */
    sparkRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, w, h }));
  };

  /* §4: "When a panel value is held, `✦` renders that value's label in the
     committed style, so the card shows what you said without opening
     anything." A thumb held shows on its own icon instead. */
  const heldInPanel = held && (PANEL_VALUES as readonly string[]).includes(held);

  /* §4's optimistic commit: the card shows your reaction the instant you make
     it, so the number and the words agree with the icon you just lit. The
     arithmetic is in the domain (`withOwnReaction`) because the one-per-person
     rule is what makes it safe — it can only ever add one. */
  const shown = publicStats(withOwnReaction(seeded, held));

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Icon
          glyph="👍"
          label={REACTION_LABELS.thumbs_up}
          held={held === 'thumbs_up'}
          onPress={() => commit('thumbs_up')}
        />
        <Icon
          glyph="👎"
          label={REACTION_LABELS.thumbs_down}
          held={held === 'thumbs_down'}
          onPress={() => commit('thumbs_down')}
        />

        <Pressable
          ref={sparkRef}
          onPress={togglePanel}
          style={[s.icon, s.spark, heldInPanel && s.sparkHeld]}
          accessibilityRole="button"
          accessibilityLabel={heldInPanel ? `Your read: ${REACTION_LABELS[held!]}` : 'Say how it reads'}
          accessibilityState={{ expanded: !!anchor }}
        >
          {heldInPanel ? (
            /* One line, always. The pill sizes to the word, so it never needs
               to wrap — and if a longer value is ever added to the vocabulary,
               truncating is better than a two-line pill in a 44pt row. */
            <Text style={s.sparkWord} numberOfLines={1}>
              {REACTION_LABELS[held!]}
            </Text>
          ) : (
            <Text style={s.glyph}>✦</Text>
          )}
        </Pressable>

        {/* The look's own reads, as words. Never a table of numbers (§6). */}
        {shown.positiveCount > 0 ? (
          <View style={s.tally}>
            <Text style={s.tallyCount}>{shown.positiveCount}</Text>
            <Text style={s.tallyWords} numberOfLines={1}>
              {breakdownWords(shown.positiveBreakdown, 2).join(' · ')}
            </Text>
          </View>
        ) : null}
      </View>

      {anchor ? (
        <ReactionPanel
          anchor={anchor}
          held={held}
          onPick={commit}
          onDismiss={() => setAnchor(null)}
        />
      ) : null}
    </View>
  );
}

function ReactionPanel({
  anchor,
  held,
  onPick,
  onDismiss,
}: {
  anchor: Anchor;
  held?: ReactionValue;
  onPick: (v: ReactionValue) => void;
  onDismiss: () => void;
}) {
  /* §4: flip above/below on available space, never clip the viewport. */
  const roomAbove = anchor.y - PANEL_H - ANCHOR_GAP > 0;
  const place = roomAbove
    ? { bottom: SCREEN_H - anchor.y + ANCHOR_GAP }
    : { top: anchor.y + anchor.h + ANCHOR_GAP };

  /* Align the panel's caret to the icon's centre, then keep the whole panel on
     screen — the icon can sit close enough to an edge that a centred panel
     would hang off it. */
  const iconCentre = anchor.x + anchor.w / 2;
  const left = Math.max(10, Math.min(iconCentre - 28, SCREEN_W - PANEL_W - 10));
  const caretLeft = Math.max(10, Math.min(iconCentre - left - 6, PANEL_W - 22));

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      {/* §4's "tap outside → idle". */}
      <Pressable style={s.outside} onPress={onDismiss} accessibilityLabel="Close" />
      <View style={[s.panel, place, { left, width: PANEL_W }]} role="menu">
        <View
          style={[
            s.caret,
            { left: caretLeft },
            roomAbove ? s.caretDown : s.caretUp,
          ]}
        />
      {PANEL_VALUES.map((v, i) => {
        const on = held === v;
        return (
          <View key={v}>
            {/* One divider, before the negatives. The ONLY thing distinguishing
                them — no colour. */}
            {i === PANEL_DIVIDER_AFTER ? <View style={s.divider} /> : null}
            <Pressable
              onPress={() => onPick(v)}
              style={[s.rowItem, on && s.rowItemOn]}
              role="menuitem"
              aria-checked={on}
              accessibilityState={{ checked: on }}
              accessibilityLabel={REACTION_LABELS[v]}
            >
              <Text style={[s.rowLabel, on && s.rowLabelOn]}>{REACTION_LABELS[v]}</Text>
              {on ? <Text style={s.rowTick}>✓</Text> : null}
            </Pressable>
          </View>
        );
      })}
      </View>
    </Modal>
  );
}

/**
 * YOUR OWN LOOK. §1: "Render the cluster in a read-only state showing the
 * look's own received positives, with no tap target."
 *
 * The negatives, if the threshold is met, arrive only as the read sentence —
 * never as a bare count. §6: "Never '3 people found this overdone'. The count
 * is available to the owner; leading with it is what makes it punitive."
 */
export function OwnReactionRead({
  view,
  declared,
  tally,
}: {
  view: OwnerReactionView;
  /** The word you declared when you built it, if the flow captured one. */
  declared?: string | null;
  tally: ReactionTally;
}) {
  const sentence = readSentence(tally, declared);
  const words = breakdownWords(view.positiveBreakdown, 3);

  return (
    <View style={s.own}>
      <Text style={s.ownKick}>your look · how it read</Text>
      {view.distinctReactorCount > 0 ? (
        <Text style={s.ownCount}>
          {/* Both numbers, because the owner is allowed both (§6) and because
              calling the positive count "reads" understates a look that also
              drew negatives. Neither number is the negative count, and the
              negatives are never named as a figure — that is the whole of §6's
              "a read, never a verdict". */}
          {view.positiveCount} positive · {view.distinctReactorCount}{' '}
          {view.distinctReactorCount === 1 ? 'read' : 'reads'}
          {words.length ? ` · ${words.join(' · ')}` : ''}
        </Text>
      ) : (
        <Text style={s.ownCount}>No reads yet.</Text>
      )}
      <Text style={s.ownLine}>{sentence ?? NOT_ENOUGH_READS}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 12, position: 'relative' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  /**
   * `minWidth`, NOT `width` — and that distinction is the whole of a bug worth
   * remembering. The spark used to override a fixed `width: TARGET` here with
   * `width: undefined`, and RN style composition DROPS an undefined value
   * rather than resetting the property. So the pill stayed 44pt wide and any
   * label longer than about six characters ("Creative", "Overdone", "Too safe")
   * spilled straight out through both borders.
   *
   * A 44pt minimum satisfies §4's target size for the two thumbs, which have no
   * horizontal padding and so measure exactly 44; the spark grows past it to fit
   * its word. Nothing needs to override anything.
   */
  icon: {
    minWidth: TARGET,
    height: TARGET,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Held state is the app's selected-card token: an ink border, no colour
   *  pairing. Accent fill would read as "yours" (see the token rules). */
  iconHeld: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.creamSunk },
  glyph: { fontSize: 17, lineHeight: 21, color: palette.ink },
  spark: { paddingHorizontal: 11 },
  sparkHeld: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.creamSunk },
  sparkWord: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  tally: { flex: 1, minWidth: 0, marginLeft: 4 },
  tallyCount: {
    fontFamily: 'Archivo_900Black',
    fontSize: 15,
    lineHeight: 16,
    color: palette.ink,
  },
  tallyWords: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: palette.greyMute,
    marginTop: 2,
  },
  /** Full-screen dismiss target behind the panel. */
  outside: StyleSheet.absoluteFillObject,
  /** Placed from a measurement — see ReactionPanel. */
  panel: {
    position: 'absolute',
    borderWidth: border.mid,
    borderColor: palette.ink,
    borderRadius: radius.sm,
    backgroundColor: palette.cream,
    paddingVertical: 5,
  },
  caret: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: palette.cream,
    borderColor: palette.ink,
    transform: [{ rotate: '45deg' }],
  },
  /** Panel above the icon: the caret sits on its bottom edge, pointing down. */
  caretDown: { bottom: -7, borderRightWidth: border.mid, borderBottomWidth: border.mid },
  /** Panel below the icon: caret on the top edge, pointing up. */
  caretUp: { top: -7, borderLeftWidth: border.mid, borderTopWidth: border.mid },
  rowItem: {
    minHeight: TARGET,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowItemOn: { backgroundColor: palette.creamSunk },
  rowLabel: {
    fontFamily: 'Archivo_500Medium',
    fontSize: 15,
    lineHeight: 19,
    color: palette.ink,
  },
  rowLabelOn: { fontFamily: 'Archivo_700Bold' },
  rowTick: { fontFamily: 'Archivo_700Bold', fontSize: 13, color: palette.ink },
  /** The divider is the whole distinction between positive and negative. */
  divider: {
    height: border.hair,
    backgroundColor: palette.rule,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  own: {
    marginHorizontal: 22,
    marginTop: 12,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamRaised,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  ownKick: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  ownCount: {
    fontFamily: 'Archivo_900Black',
    fontSize: 15,
    lineHeight: 18,
    textTransform: 'uppercase',
    color: palette.ink,
    marginTop: 6,
  },
  ownLine: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: palette.grey,
    marginTop: 6,
  },
});

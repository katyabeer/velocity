/**
 * Cards, stats, roundels, the band ladder, milestones, tips, and the two
 * early-day notices.
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, space } from '@/theme/tokens';
import { BANDS, MILESTONES, type BandKey } from '@/domain/bands';
import type { JobStep } from '@/domain/today';
import { Kick, Tiny } from './text';

/** `.card` / `.card.ink` */
export function Card({
  children,
  ink,
  style,
}: {
  children: React.ReactNode;
  ink?: boolean;
  style?: ViewStyle;
}) {
  return <View style={[s.card, ink && s.cardInk, style]}>{children}</View>;
}

/**
 * A STATUS BADGE, top-right of a card. Two tones and no more:
 *
 *   open      accent fill + its keyline — the app's emphasis pair. It is the
 *             one that means "there is something to do".
 *   done      a hairline outline on the sunk ground. Quiet on purpose: a
 *             finished thing should not shout as loudly as a live one, and an
 *             accent badge on every completed card would make the whole feed
 *             look urgent.
 *
 * No red, no green. `palette.error` is validation-only and the do-not-propose
 * list is explicit that a coloured status chip reads as an alert.
 *
 * ⚠ `ui/ResultCard.tsx` still has its own local badge with three tones. It
 * predates this and could collapse onto it, but its `alert` tone has no
 * equivalent here — worth doing as its own pass, not as a side effect.
 */
export function Badge({ label, tone = 'open' }: { label: string; tone?: 'open' | 'done' }) {
  return (
    <View style={[s.badge, tone === 'done' && s.badgeDone]}>
      <Text style={s.badgeLabel}>{label}</Text>
    </View>
  );
}

/**
 * THE DAY'S THREE STEPS, STACKED (Katya, 4 Sep). It replaced the `StepRibbon`
 * on the Today card — three columns of hairline rule with a word under each,
 * which had to drop its second line to fit and so lost the deadlines that were
 * the useful part.
 *
 * Stacked rows have the width to carry them: "Build by 8pm", not "Build". The
 * number goes in a disc, which is the same mark Milestones uses for an unearned
 * one, so "a numbered thing you have not done yet" already means something in
 * this app.
 *
 * FOUR STATES, and `shut` is the one worth understanding. After 8pm Build is
 * not "todo" — it is gone for the day — so it is struck through and dimmed
 * rather than left looking like something still ahead of you. See `jobSteps` in
 * domain/today.ts.
 */
export function JobStepList({ steps }: { steps: readonly JobStep[] }) {
  return (
    <View style={s.steps}>
      {steps.map((st) => {
        const done = st.state === 'done';
        const shut = st.state === 'shut';
        const now = st.state === 'now';
        return (
          <View key={st.n} style={s.stepRow}>
            <View style={[s.stepDisc, done && s.stepDiscDone, now && s.stepDiscNow]}>
              <Text style={[s.stepNum, done && { color: palette.cream }]}>
                {done ? '✓' : st.n}
              </Text>
            </View>
            <Text
              style={[
                s.stepLabel,
                now && { fontFamily: 'Archivo_700Bold', color: palette.ink },
                shut && s.stepLabelShut,
              ]}
            >
              {st.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * A NUMBERED EXPLAINER LIST — what the day is, in three rows.
 *
 * Not `JobStepList`, which reports PROGRESS through the same three stages and
 * has four states to do it with. This one is static: it explains the loop to
 * someone who has never seen it, so every row looks the same and none of them
 * is "current". Two components for two jobs, sharing the disc so they read as
 * the same family.
 *
 * Not `Roundel` either — its disc is 66px, built to hold a word ("Strength"),
 * and a number rattles around inside it.
 *
 * FILLED DISCS, matching `stepDiscDone`. On this screen nothing has happened
 * yet, so an outlined disc would be the "not done" mark on a list that is not
 * a checklist — the fill keeps it reading as a numeral rather than a state.
 */
export function NumberedList({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <View style={s.numbered}>
      {items.map((it, i) => (
        <View key={it.title} style={s.numberedRow}>
          <View style={s.numberedDisc}>
            <Text style={s.numberedNum}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.numberedTitle}>{it.title}</Text>
            <Text style={s.numberedBody}>{it.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** `.stat` — a label/value row with a hairline under it. */
export function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.stat, last && { borderBottomWidth: 0 }]}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

/** `.roundel` — a circular label beside a strength / weakness / try-this. */
export function Roundel({
  label,
  tone = 'plain',
  title,
  body,
}: {
  label: string;
  tone?: 'plain' | 'accent' | 'alert';
  title: string;
  body: string;
}) {
  return (
    <View style={s.roundel}>
      <View
        style={[
          s.roundelDisc,
          tone === 'accent' && { borderColor: palette.accentEdge, backgroundColor: palette.accent },
          /** No alert hue survives the v3 collapse — ink border + sunk ground. */
          tone === 'alert' && { borderColor: palette.ink, backgroundColor: palette.creamSunk },
        ]}
      >
        <Text style={s.roundelDiscLabel}>{label}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.roundelTitle}>{title}</Text>
        <Text style={s.roundelBody}>{body}</Text>
      </View>
    </View>
  );
}

/** `.earned` — the overnight token roundel. Hidden on Day 1, because a zero
 *  there would be a lie. */
export function EarnedRow({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={s.earned}>
      <Text style={s.earnedNum}>+{count}</Text>
      <Text style={s.earnedText}>
        {count} token{count === 1 ? '' : 's'} earned from other people saving garments from your
        looks
      </Text>
    </View>
  );
}

/**
 * The band ladder. Five rows, the user's band inverted.
 * NEVER a number — locked decision 5. The percentile column is the band's
 * definition, not the user's score.
 */
export function BandLadder({ active }: { active: BandKey }) {
  return (
    <View style={s.bands}>
      {BANDS.map((b, i) => {
        const on = b.key === active;
        return (
          <View
            key={b.key}
            style={[s.bandRow, on && { backgroundColor: palette.ink }, i === BANDS.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={[s.bandName, on && { color: palette.cream }]}>{b.name}</Text>
            <Text style={[s.bandRange, on && { color: palette.accent }]}>{b.range}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Milestones — six, fixed, and that is all there are. */
export function Milestones({ earned }: { earned: number }) {
  return (
    <View style={s.miles}>
      {MILESTONES.map((m, i) => {
        const got = i < earned;
        return (
          <View key={m.key} style={[s.mile, got && s.mileOn]}>
            <Text style={[s.mileMark, got && { borderColor: palette.accentEdge, color: palette.ink }]}>
              {got ? '✓' : '·'}
            </Text>
            <Text style={[s.mileName, got && { color: palette.ink }]}>{m.name}</Text>
            <Text style={s.mileHint}>{m.hint}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * The walkthrough tooltip. Accent fill, a notch, dismissible.
 *
 * `notch` moved from a fixed left offset to an alignment (4 Sep) because a tip
 * has to be able to point at the thing it is about. The magazine's tip points
 * at the Save pieces tag, which sits at the RIGHT edge of the feed image — a
 * caret pinned 26pt from the left was pointing at nothing.
 */
export function Tip({
  lead,
  body,
  onDismiss,
  notch = 'left',
}: {
  lead: string;
  body: string;
  onDismiss: () => void;
  /** Which end of the tip the caret sits at, and therefore what it points at. */
  notch?: 'left' | 'right';
}) {
  return (
    <View style={s.tip}>
      <View style={[s.tipNotch, notch === 'right' ? s.tipNotchRight : s.tipNotchLeft]} />
      <Text style={s.tipText}>
        <Text style={s.tipLead}>{lead}</Text> {body}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} style={s.tipClose} accessibilityLabel="Dismiss">
        <Text style={s.tipCloseLabel}>×</Text>
      </Pressable>
    </View>
  );
}

/** `.newbox` — the Klein "something changed overnight" notice. */
export function NewBox({ kick, title, body }: { kick: string; title: string; body: string }) {
  return (
    <View style={s.newBox}>
      <Kick>{kick}</Kick>
      <Text style={s.newBoxTitle}>{title}</Text>
      <Text style={s.newBoxBody}>{body}</Text>
    </View>
  );
}

/** `.firstrun` — the shock-pink day-one notice. Used sparingly, and only where
 *  something is genuinely an exception. */
export function FirstRun({
  kick,
  title,
  body,
  children,
}: {
  kick: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={s.firstRun}>
      <Kick tone="alert">{kick}</Kick>
      <Text style={s.firstRunTitle}>{title}</Text>
      <Text style={s.firstRunBody}>{body}</Text>
      {children}
    </View>
  );
}

/** `.reach` — three or four small figures in a row. */
export function Reach({ items }: { items: readonly { value: string; label: string }[] }) {
  return (
    <View style={s.reach}>
      {items.map((it) => (
        <View key={it.label} style={s.reachCell}>
          <Text style={s.reachValue}>{it.value}</Text>
          <Text style={s.reachLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** `.trend` — the nine-job sparkline. Bars, not a line; no axis, no numbers. */
export function Trend({ values }: { values: readonly number[] }) {
  const max = Math.max(...values, 1);
  return (
    <View style={s.trend}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            s.trendBar,
            { height: `${(v / max) * 100}%` },
            /** accent fill needs its ink edge on a light ground — see tokens.ts */
            i >= values.length - 4 && {
              backgroundColor: palette.accent,
              borderWidth: border.hair,
              borderColor: palette.accentEdge,
            },
          ]}
        />
      ))}
    </View>
  );
}

/** An empty state that says what will fill it, and offers the action. */
export function EmptyState({
  kick,
  body,
  note,
  children,
}: {
  kick: string;
  body: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <Kick tone="muted">{kick}</Kick>
      <Text style={s.emptyBody}>{body}</Text>
      {note ? <Tiny style={{ marginTop: 8 }}>{note}</Tiny> : null}
      {children}
    </Card>
  );
}

const s = StyleSheet.create({
  numbered: { marginTop: 18, gap: 15 },
  numberedRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  numberedDisc: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    /* Nudged down so the numeral sits on the title's cap line rather than its
       ascender — the row reads as one thing at a glance. */
    marginTop: 1,
  },
  numberedNum: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 12,
    lineHeight: 15,
    color: palette.cream,
  },
  numberedTitle: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  numberedBody: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 14,
    lineHeight: 19,
    color: palette.grey,
    marginTop: 3,
  },
  badge: {
    borderWidth: border.mid,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },
  badgeDone: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
  },
  badgeLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  steps: { marginTop: 14, gap: 9 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDisc: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Filled ink for done — the same inversion the band ladder uses for the row
   *  you are on. */
  stepDiscDone: { borderColor: palette.ink, backgroundColor: palette.ink },
  stepDiscNow: { borderWidth: border.mid, borderColor: palette.ink },
  stepNum: { fontFamily: 'Archivo_700Bold', fontSize: 10.5, lineHeight: 13, color: palette.ink },
  stepLabel: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 13.5,
    lineHeight: 17,
    color: palette.grey,
  },
  /** Struck through AND dimmed. Colour alone would be the only signal, and the
   *  app never carries a state on colour by itself. */
  stepLabelShut: { textDecorationLine: 'line-through', color: palette.greyDecor },
  card: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    padding: 14,
  },
  cardInk: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.cream },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  statLabel: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 15,
    color: palette.grey,
    flex: 1,
  },
  statValue: {
    /** disp700 retired — the display face is now onboarding-headline + button
     *  only. Archivo Black is the new workhorse for emphasized values. */
    fontFamily: 'Archivo_900Black',
    fontSize: 17,
    textTransform: 'uppercase',
    color: palette.ink,
    textAlign: 'right',
  },
  roundel: { flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 12 },
  roundelDisc: {
    width: 66,
    height: 66,
    borderRadius: 99,
    borderWidth: border.mid,
    borderColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  roundelDiscLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9.2,
    letterSpacing: 0.64,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: palette.ink,
  },
  roundelTitle: { fontFamily: 'Archivo_600SemiBold', fontSize: 12.5, lineHeight: 15.6, color: palette.ink },
  roundelBody: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: palette.grey,
    marginTop: 4,
  },
  earned: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  earnedNum: {
    width: 42,
    height: 42,
    borderRadius: 99,
    borderWidth: border.mid,
    borderColor: palette.accentEdge,
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 39,
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 17,
  },
  earnedText: {
    flex: 1,
    fontFamily: 'Archivo_400Regular',
    fontSize: 11.5,
    lineHeight: 16,
    color: palette.grey,
  },
  bands: { borderWidth: border.hair, borderColor: palette.rule, backgroundColor: palette.creamRaised },
  bandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  bandName: { fontFamily: 'Archivo_600SemiBold', fontSize: 11.5, lineHeight: 15, color: palette.ink },
  bandRange: { fontFamily: 'DMMono_400Regular', fontSize: 10, color: palette.greyMute },
  miles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  mile: {
    width: '31.5%',
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 7,
    alignItems: 'center',
  },
  mileOn: { borderColor: palette.accentEdge, backgroundColor: palette.accent },
  mileMark: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: border.mid,
    borderColor: palette.rule,
    textAlign: 'center',
    lineHeight: 25,
    fontFamily: 'Archivo_700Bold',
    fontSize: 12,
    color: palette.greyMute,
  },
  mileName: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10.5,
    lineHeight: 12.6,
    marginTop: 7,
    color: palette.ink,
    textAlign: 'center',
  },
  mileHint: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 8.5,
    lineHeight: 11,
    color: palette.greyMute,
    marginTop: 3,
    textAlign: 'center',
  },
  /** Accent-filled now, ink text (text-on-accent), not klein+white. */
  tip: {
    marginTop: 12,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    paddingLeft: 14,
    paddingRight: 34,
    paddingTop: 12,
    paddingBottom: 13,
  },
  /** Two complete positions rather than one overriding the other: RN style
   *  composition DROPS an `undefined` value rather than resetting the property,
   *  so `{ left: undefined, right: 26 }` layered over `{ left: 26 }` left the
   *  caret on the left and silently added a right offset too. */
  tipNotchLeft: { left: 26 },
  tipNotchRight: { right: 26 },
  tipNotch: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    transform: [{ rotate: '45deg' }],
  },
  tipText: { fontFamily: 'Archivo_400Regular', fontSize: 12, lineHeight: 18, color: palette.ink },
  tipLead: { fontFamily: 'Archivo_700Bold' },
  tipClose: { position: 'absolute', top: 8, right: 9, width: 20, height: 20, alignItems: 'center' },
  tipCloseLabel: { fontSize: 15, lineHeight: 18, color: palette.ink },
  newBox: { borderWidth: border.hair, borderColor: palette.accentEdge, backgroundColor: palette.accent, paddingHorizontal: 13, paddingVertical: 12 },
  newBoxTitle: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, lineHeight: 17.5, color: palette.ink, marginTop: 5 },
  newBoxBody: { fontFamily: 'Archivo_400Regular', fontSize: 10, lineHeight: 15.5, color: palette.ink, marginTop: 6 },
  /** No alert hue survives the v3 collapse (see tokens.ts) — ink border on
   *  the sunk ground is the day-one notice's only distinction now. */
  firstRun: { borderWidth: border.mid, borderColor: palette.ink, backgroundColor: palette.creamSunk, padding: 13 },
  firstRunTitle: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, lineHeight: 17.5, color: palette.ink, marginTop: 5 },
  firstRunBody: { fontFamily: 'Archivo_400Regular', fontSize: 10, lineHeight: 15.5, color: palette.grey, marginTop: 6 },
  reach: { flexDirection: 'row', gap: space.sm },
  reachCell: {
    flex: 1,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    paddingHorizontal: 7,
    paddingVertical: 9,
    alignItems: 'center',
  },
  /** Not interactive text, so `link` (reserved for tappable rows/tags) isn't
   *  right here — a bare emphasis numeral just goes ink now. */
  reachValue: { fontFamily: 'BigShouldersDisplay_900Black', fontSize: 24, lineHeight: 24, color: palette.ink },
  reachLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8,
    lineHeight: 9.6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palette.grey,
    marginTop: 5,
    textAlign: 'center',
  },
  trend: {
    height: 78,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    padding: 9,
  },
  trendBar: { flex: 1, backgroundColor: palette.creamSunk },
  emptyBody: { fontFamily: 'Archivo_400Regular', fontSize: 12.5, lineHeight: 20, color: palette.grey, marginTop: 5 },
});

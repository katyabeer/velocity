/**
 * Cards, stats, roundels, the band ladder, milestones, tips, and the two
 * early-day notices.
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
import { BANDS, MILESTONES, type BandKey, type MilestoneKey } from '@/domain/bands';
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
/**
 * `title` IS OPTIONAL (7 Sep). A row can be a single sentence, which is what
 * o7's three steps are now — and the sentence goes in the BODY treatment, not
 * the title one: `numberedTitle` is 13px uppercase bold, which reads as a
 * label, and "Build a look that answers a brief" is not a label. With no title
 * the body loses its top margin so the line sits on the disc's centre.
 */
export function NumberedList({
  items,
}: {
  items: readonly { title?: string; body: string }[];
}) {
  return (
    <View style={s.numbered}>
      {items.map((it, i) => (
        <View key={i} style={s.numberedRow}>
          <View style={s.numberedDisc}>
            <Text style={s.numberedNum}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            {it.title ? <Text style={s.numberedTitle}>{it.title}</Text> : null}
            <Text style={[s.numberedBody, !it.title && { marginTop: 0 }]}>{it.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** `.stat` — a label/value row with a hairline under it. */
/**
 * THE STAT GRID — two columns of big numbers, for You.
 *
 * Katya, 7 Sep: "less wordy, more visual". The label/value ROW list below is
 * still right where a value is a sentence ("You backed it" on the result
 * screen); it is wrong for six counts, where the row's job is to make the
 * NUMBER the thing you see and a right-aligned 17pt figure beside a 11.5pt
 * sentence does the opposite.
 *
 * `zero` cells go to the rule colour rather than being dropped. That is the
 * whole day-one argument — see `statCells` in domain/you.ts for why, and for
 * the one-line way back.
 */
export function StatGrid({ cells }: { cells: readonly { label: string; value: string; zero?: boolean }[] }) {
  return (
    <View style={s.grid}>
      {cells.map((c) => (
        <View key={c.label} style={s.gridCell}>
          <Text style={[s.gridValue, c.zero && { color: palette.rule }]}>{c.value}</Text>
          <Text style={[s.gridLabel, c.zero && { color: palette.rule }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

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
 * ══════════════════════════════════════════════════════════════════════════
 *  THE BAND SCALE — the room as one bar, with you in a slice of it
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Katya, 14 Sep: "make the bands more visual — a graph, pointing at where
 * upper half is in the context."
 *
 * The five bands are drawn to their REAL SHARE of the room, straight off
 * `from`/`to` in domain/bands.ts: Top of the room is a 10% sliver and Quiet
 * night is a quarter of the bar. That is the whole argument the ladder was
 * making in words — the bands are not five equal boxes — and it is why the
 * segments are flexed on `to - from` rather than given equal widths.
 *
 * ⚠ IT POINTS AT A REGION, NEVER A POINT, and that is invariant 6 rather than
 * a stylistic preference. Named bands, never numbers: a caret over the middle
 * of a segment says "somewhere in here", where a marker at a computed offset
 * would say "ninth of thirty-eight" — a placing this product does not compute
 * and would not show.
 *
 * ⚠ THE CARET IS ALONE IN THE PROPORTIONAL ROW, and the naming happens in a
 * full-width line under the bar. Putting the band's name up there instead was
 * the obvious build and it overflows: the label is far wider than a 10%
 * segment, so over `Top of the room` it would hang off the left edge of the
 * screen and give the page a horizontal scrollbar — the same trap the result
 * card's confetti had to be capped for. A caret is 10pt wide and fits
 * anywhere.
 */
export function BandScale({ active }: { active: BandKey }) {
  return (
    <View>
      {/* The pointer row — same flex weights as the bar, so the caret lands
          over the middle of its own band however the width changes. */}
      <View style={s.scaleRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {BANDS.map((b) => (
          <View key={b.key} style={{ flex: b.to - b.from, alignItems: 'center' }}>
            {b.key === active ? <View style={s.scaleCaret} /> : null}
          </View>
        ))}
      </View>

      <View
        style={s.scaleBar}
        accessibilityRole="image"
        accessibilityLabel={`The room in five bands. You are in ${
          BANDS.find((b) => b.key === active)?.name ?? ''
        }.`}
      >
        {BANDS.map((b, i) => (
          <View
            key={b.key}
            style={[
              s.scaleSeg,
              { flex: b.to - b.from },
              i === 0 && { borderTopLeftRadius: radius.xs, borderBottomLeftRadius: radius.xs },
              i === BANDS.length - 1 && {
                borderTopRightRadius: radius.xs,
                borderBottomRightRadius: radius.xs,
              },
              b.key === active && s.scaleSegOn,
            ]}
          />
        ))}
      </View>

      {/* THE VOCABULARY, KEPT. The ladder listed all five names and the graph
          would have shown only yours — so they run along one line underneath,
          in order, with yours in ink. Five names is what there are (invariant
          12) and the reader should be able to see the whole set. */}
      <Text style={s.scaleNames}>
        {BANDS.map((b, i) => (
          <Text key={b.key} style={b.key === active ? s.scaleNameOn : undefined}>
            {i > 0 ? '  ·  ' : ''}
            {b.name}
          </Text>
        ))}
      </Text>
    </View>
  );
}

/**
 * The band ladder. Five rows, the user's band inverted.
 * NEVER a number — locked decision 5. The percentile column is the band's
 * definition, not the user's score.
 *
 * ⚠ NO CALLER SINCE 14 Sep — `BandScale` above replaced it on the results
 * screen, which was its only one. Kept rather than deleted, like `Tip` and
 * `NewBox`: it is the one place the bands' RANGES are written out, and if the
 * graph ever needs a companion that spells them out, this is it.
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

/**
 * Milestones — six, fixed, and that is all there are (invariant 12).
 *
 * ⚠ IT TAKES THE EARNED KEYS, NOT A COUNT. It used to be `earned: number` and
 * `i < earned`, which could only ever tick a POSITIONAL PREFIX of the list —
 * so three badges meant `filed · borrowed · weekStraight` and nothing else,
 * and `Good eye` was unreachable by anyone who had not first run seven days
 * straight. That is not a display limitation, it is a model that says these
 * six are a ladder when `MILESTONES` in domain/bands.ts is explicit that they
 * are not ("no levels, no XP, no leaderboard" — six independent facts).
 *
 * Changed 13 Sep for the returning-user state, which needed to tick
 * `upperQuarter` at five days in without claiming a week's streak.
 */
export function Milestones({ earned }: { earned: readonly MilestoneKey[] }) {
  return (
    <View style={s.miles}>
      {MILESTONES.map((m) => {
        const got = earned.includes(m.key);
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

/**
 * ⚠ NO CALLER SINCE 13 Sep. Its only one was the Wardrobe's "two arrived
 * overnight" panel, which came off because it restated what the grid beneath
 * it already showed — the arrivals carry the `NEW` outline on their own tiles.
 *
 * Kept rather than deleted, the same way `Tip` was: it is a designed piece and
 * the shape is worth having if an announcement panel is ever wanted again.
 * Nothing renders it today, so it cannot be the reason a screen looks wrong.
 */
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

/**
 * `.trend` — the sparkline. Bars, not a line; no axis, no numbers.
 *
 * ─── TWO MODES, AND THE ONE-SERIES MODE IS UNCHANGED ───────────────────────
 * With `values` alone it is what it always was: one bar per job, self-
 * normalising, the last four accented to mark "recently". Established reads it
 * that way and nothing about it moved.
 *
 * ⟲ `second` WAS ADDED 13 Sep. Katya: "Show a graph for how their own
 * submissions (via Challenges and Create freestyle) are performing." Those are
 * two different things — one is judged against a brief and the other is not —
 * so blending them into one bar would have answered a question she did not
 * ask. Pass `second` and each slot holds a PAIR: the brief entry and the
 * freestyle post from the same day, side by side.
 *
 * ⚠ THE TWO SERIES SHARE ONE MAXIMUM, which is the only way the pair is
 * comparable. Normalising each to its own peak would draw a quiet freestyle day
 * exactly as tall as a strong brief day.
 *
 * ⚠ AND THE NUMBERS ARE NOT A SCORE. Same rule as the reactions chart: no
 * y-axis, no figures, because invariant 6 is named bands and a bar chart of
 * placings with numbers up the side is the leaderboard invariant 12 forbids.
 * The caption is where meaning goes.
 */
export function Trend({
  values,
  second,
  labels,
}: {
  values: readonly number[];
  /** The second series, same length. Omit for the original single-series read. */
  second?: readonly number[];
  /** Optional ticks under the bars. Same length again. */
  labels?: readonly string[];
}) {
  const max = Math.max(...values, ...(second ?? []), 1);
  const paired = second !== undefined;

  return (
    <View>
      <View style={s.trend}>
        {values.map((v, i) => (
          /* One slot per period. When paired, the slot holds two bars and the
             GAP INSIDE it is tighter than the gap between slots, so the eye
             groups them as a pair rather than reading eight separate bars. */
          <View key={i} style={s.trendSlot}>
            <View
              style={[
                s.trendBar,
                { height: `${(v / max) * 100}%` },
                /** accent fill needs its ink edge on a light ground — see tokens.ts */
                (paired || i >= values.length - 4) && {
                  backgroundColor: palette.accent,
                  borderWidth: border.hair,
                  borderColor: palette.accentEdge,
                },
              ]}
            />
            {paired ? (
              <View
                style={[
                  s.trendBar,
                  s.trendBarAlt,
                  { height: `${((second[i] ?? 0) / max) * 100}%` },
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {labels ? (
        <View style={s.trendAxis}>
          {labels.map((l, i) => (
            <Text key={i} style={s.trendTick} numberOfLines={1}>
              {l}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** The pair's key. Two swatches and two words — it has to be said somewhere,
 *  and a legend is cheaper than captioning every bar. */
export function TrendKey({ a, b }: { a: string; b: string }) {
  return (
    <View style={s.trendKey}>
      <View style={s.trendKeyItem}>
        <View style={[s.trendSwatch, { backgroundColor: palette.accent, borderColor: palette.accentEdge }]} />
        <Text style={s.trendKeyLabel}>{a}</Text>
      </View>
      <View style={s.trendKeyItem}>
        <View style={[s.trendSwatch, { backgroundColor: palette.creamSunk, borderColor: palette.rule }]} />
        <Text style={s.trendKeyLabel}>{b}</Text>
      </View>
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
  /** PALE GREEN (Katya, 4 Sep), not the sunk cream it was. Sunk cream is this
   *  app's disabled ground, so a finished challenge read as an unavailable one
   *  — the opposite of the intended "nothing left to do, and that is good".
   *  See `accentPale` in tokens.ts: it is a new hue and a deliberate one. */
  badgeDone: {
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accentPale,
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
  /** Two up, hairline-separated by the gap showing the ground through it —
   *  the same trick the wardrobe grid uses, so no cell needs a border. */
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  gridCell: { width: '50%', paddingVertical: 10, paddingRight: 10 },
  gridValue: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 34,
    lineHeight: 30,
    color: palette.ink,
  },
  gridLabel: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11,
    lineHeight: 14.5,
    color: palette.grey,
    marginTop: 4,
  },
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
  /** ⟲ 11.5 → 14 (Katya, 13 Sep). It is the only sentence explaining where
   *  tokens come from, sitting between the result card and the day's job, and
   *  at 11.5 it read as a footnote on both. 14 is the floor this project has
   *  settled on for anything meant to be read — the same move as `Skip` and
   *  the 10px text links, which went to 14 and 16 for the same reason. */
  earnedText: {
    flex: 1,
    fontFamily: 'Archivo_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: palette.grey,
  },
  /* ── the band scale ── */
  scaleRow: { flexDirection: 'row', height: 9, marginBottom: 3 },
  /** A CSS triangle, because the app has no icon for this and a text glyph
   *  would render in the platform font — the one thing the thumbs emoji was
   *  cut for on 4 Sep. */
  scaleCaret: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.ink,
  },
  scaleBar: { flexDirection: 'row', height: 22, gap: 2 },
  scaleSeg: { backgroundColor: palette.creamSunk, borderWidth: border.hair, borderColor: palette.rule },
  /** Accent fill takes its ink edge on a light ground — see tokens.ts. */
  scaleSegOn: { backgroundColor: palette.accent, borderColor: palette.accentEdge },
  scaleNames: {
    marginTop: 8,
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 15,
    color: palette.greyMute,
  },
  scaleNameOn: { fontFamily: 'Archivo_700Bold', color: palette.ink },
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
  /**
   * A period. Holds one bar, or two when a second series is passed.
   *
   * ⚠ `flexDirection: 'row'` IS LOAD-BEARING — it is what makes the bars have
   * any height at all, and the single-series chart is the one that proves it.
   *
   * A bar carries `flex: 1` and an explicit `height: X%`. In a ROW the flex
   * sizes the MAIN axis, which is width, leaving the percentage free to size
   * the cross axis — which is exactly how the bars behaved before this slot
   * existed, when they were direct children of `s.trend` (also a row). Give
   * the slot no direction and it defaults to COLUMN, the flex starts sizing
   * HEIGHT, and it overrides the percentage: every bar fills the frame and the
   * sparkline goes flat. That shipped on Established for one round — invisible
   * to tsc, to eslint and to reading it, and found only by measuring the bars.
   *
   * `gap` and `justifyContent` are inert with a single child, which is why one
   * style serves both modes.
   */
  trendSlot: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 1.5,
  },
  trendBar: { flex: 1, backgroundColor: palette.creamSunk },
  /** Freestyle. Sunk cream with a rule outline — it is the SAME KIND of thing
   *  as the accented bar beside it, so it takes a border rather than being a
   *  flat fill, which at 3pt wide would have read as a gap. */
  trendBarAlt: { borderWidth: border.hair, borderColor: palette.rule },
  trendAxis: { flexDirection: 'row', gap: 4, marginTop: 5, paddingHorizontal: 9 },
  trendTick: {
    flex: 1,
    fontFamily: 'DMMono_500Medium',
    fontSize: 8.5,
    letterSpacing: 0.6,
    textAlign: 'center',
    color: palette.greyMute,
  },
  trendKey: { flexDirection: 'row', gap: 14, marginTop: 8 },
  trendKeyItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trendSwatch: { width: 9, height: 9, borderWidth: border.hair, borderRadius: radius.xs },
  trendKeyLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  emptyBody: { fontFamily: 'Archivo_400Regular', fontSize: 12.5, lineHeight: 20, color: palette.grey, marginTop: 5 },
});

/**
 * THE REACTIONS CHART — a fixed seven-day window, and the one animated read
 * on the You screen.
 *
 * Katya, 7 Sep: "Put extra effort into the reactions graph. Animate it as the
 * user opens that tab (graph filling slowly, counts going up)."
 *
 * ─── IT IS A FIXED SEVEN DAYS, NOT A LIST OF THE DAYS THAT HAVE DATA ───────
 * From her mock's own note: a fixed window means filling in reads as PROGRESS
 * rather than as the chart changing size, and a quiet day is visibly a quiet
 * day rather than a missing bar. Day one shows no chart at all — an empty
 * frame is worse than no frame — so the caller decides whether to render this.
 *
 * ─── WHY THE ANIMATION IS A TIMER AND NOT `Animated` ───────────────────────
 *
 * Two reasons, and the first is the load-bearing one.
 *
 * 1. THE FRAME LOOP IS NOT ALWAYS RUNNING. When the Claude preview pane is
 *    hidden, `document.visibilityState` is `hidden` and
 *    `requestAnimationFrame` never fires — which is what lost the judging
 *    round's vote and is why `LookPlate` and `Sheet` both carry timeout
 *    fallbacks. A JS-driven `Animated.Value` in that state sits at its start
 *    value forever, and for a chart animating 0 → its real height that does
 *    not degrade to "no animation", it degrades to AN EMPTY CHART.
 *    (Measured 7 Sep: with the pane VISIBLE, rAF does fire and
 *    `prefers-reduced-motion` is off — so it is conditional, not constant,
 *    which is worse to design against, not better.) `setInterval` fires
 *    either way, so a timer-driven tween is the robust choice rather than the
 *    lazy one.
 *
 * 2. The counts have to change TEXT, which no animated style can do. Driving
 *    bars and numbers off one progress number keeps them in lockstep by
 *    construction — the total cannot finish before the bars do.
 *
 * The cost is a JS re-render per step, so the step count is deliberately low
 * (`STEPS`) and the component holds its own state: nothing else on You
 * re-renders while it runs.
 *
 * REDUCED MOTION JUMPS STRAIGHT TO THE END. It is decoration over a real
 * number, so there is nothing to lose by skipping it — and the final frame is
 * the same frame either way, which is the property that made the timer safe.
 *
 * ⚠ THE MOTION STILL NEEDS A REAL DEVICE to judge. The final state is what
 * the choice above guarantees, and that is what can be checked here.
 */

import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { palette, border, radius, useReducedMotion } from '@/theme/tokens';
import { type as T } from '@/theme/type';

/** ~900ms in 30 steps. Slow enough to read as filling, few enough that the
 *  re-renders are free. */
const RUN_MS = 900;
const STEPS = 30;

/** The tallest a bar can get. The chart is a shape, not a measurement — there
 *  is no y-axis, because a count of reactions is not a score (see
 *  REACTIONS_CAPTION in domain/you.ts). */
const BAR_MAX = 74;
/** What a zero day shows. A stub, not nothing: the day happened. */
const BAR_ZERO = 3;

export function ReactionsChart({
  /** One count per day, oldest first. Length is the window — pass seven. */
  values,
  /** Day labels, same length. The last is "today". */
  labels,
  caption,
}: {
  values: readonly number[];
  labels: readonly string[];
  caption: string;
}) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced ? 1 : 0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * ON FOCUS, NOT ON MOUNT — and that distinction is the brief.
   *
   * Katya asked for it to animate "as the user opens that tab". A tab
   * navigator KEEPS ITS SCREENS MOUNTED, so a mount effect runs once per
   * session: measured here, the bars were already at their final height 92ms
   * after switching back to You, because the component had never unmounted.
   * `useFocusEffect` re-runs every time the tab gains focus, and its cleanup
   * on blur is what resets the bars to zero ready for the next visit.
   */
  useFocusEffect(
    useCallback(() => {
      if (reduced) {
        setP(1);
        return;
      }
      setP(0);
      let step = 0;
      timer.current = setInterval(() => {
        step += 1;
        setP(step / STEPS);
        if (step >= STEPS && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
      }, RUN_MS / STEPS);
      return () => {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
      };
    }, [reduced]),
  );

  /* Ease-out, so it decelerates into the final value rather than stopping
     dead. Cubic, matching the easing on the judging round's plates. */
  const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

  const total = values.reduce((a, b) => a + b, 0);
  const peak = Math.max(...values, 1);

  /* Rounded, so the number ticks up in whole reactions rather than blurring
     through fractions. */
  const shown = Math.round(total * eased);

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* The counting number. Tabular-ish by virtue of the display face
              being uniform-width at these sizes — it does not jitter as the
              digits change. */}
          <Text style={s.total}>{shown}</Text>
          <Text style={s.totalLabel}>
            reaction{total === 1 ? '' : 's'} · {values.length} days
          </Text>
        </View>
      </View>

      <View style={s.bars}>
        {values.map((v, i) => {
          const full = (v / peak) * BAR_MAX;
          /* Each bar leaves a beat after the one before it, so the chart
             fills left to right instead of rising as one block. The last bar
             still lands on the final step — `spread` never pushes past 1. */
          const spread = Math.min(1, Math.max(0, eased * (values.length + 1) - i));
          const h = v === 0 ? BAR_ZERO : Math.max(BAR_ZERO, full * spread);
          return (
            <View key={i} style={s.slot}>
              <View
                style={[
                  s.bar,
                  { height: h },
                  v === 0 && s.barZero,
                  /* Today gets the ink keyline the accent always travels with
                     when it is doing more than tinting — see tokens.ts. */
                  v > 0 && i === values.length - 1 && s.barToday,
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={s.axis}>
        {labels.map((l, i) => (
          <Text key={i} style={[s.tick, i === labels.length - 1 && s.tickNow]} numberOfLines={1}>
            {l}
          </Text>
        ))}
      </View>

      <Text style={s.caption}>{caption}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    borderRadius: radius.lg,
    padding: 14,
  },
  head: { flexDirection: 'row', alignItems: 'flex-end' },
  total: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 44,
    lineHeight: 40,
    color: palette.ink,
  },
  totalLabel: { ...T.eyebrow, marginTop: 5 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    height: BAR_MAX,
    marginTop: 16,
    /* The baseline the bars stand on. Without it a row of short bars floats. */
    borderBottomWidth: border.hair,
    borderBottomColor: palette.ink,
  },
  slot: { flex: 1, justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    backgroundColor: palette.accent,
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.xs,
  },
  /** A day with nothing in it. Sunk cream — the same ground the app uses for
   *  "there is nothing here", and emphatically not a colour. */
  barZero: { backgroundColor: palette.creamSunk },
  barToday: {
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderBottomWidth: 0,
  },
  axis: { flexDirection: 'row', gap: 7, marginTop: 6 },
  tick: {
    flex: 1,
    fontFamily: 'DMMono_500Medium',
    fontSize: 8.5,
    letterSpacing: 0.6,
    textAlign: 'center',
    color: palette.greyMute,
  },
  tickNow: { color: palette.ink },
  caption: { ...T.tiny, marginTop: 10 },
});

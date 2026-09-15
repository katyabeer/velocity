/**
 * ══════════════════════════════════════════════════════════════════════════
 *  THE DEMO SWITCH — day 1 ⇄ day 2+, from inside the prototype
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Katya, 14 Sep: "a very subtle switch button somewhere in the prototype
 * (perhaps at the bottom of Today) that lets the user switch between the day 1
 * and day 2+ experiences."
 *
 * ─── ⚠ IT REVERSES A DOCUMENTED POSITION, KNOWINGLY ────────────────────────
 * The HTML prototype had a HUD with Day 1 / Day 2 / Established buttons and it
 * was DELIBERATELY NOT PORTED — config/testState.ts says so: "it sat next to
 * the prototype and a participant would read it". "In-phone design
 * annotations — they cannot be in front of a participant" is on the
 * do-not-re-propose list, and the same file recommends that if in-session
 * switching ever comes back it should be "a dev-only overlay gated on
 * `__DEV__`".
 *
 * What changed is the AUDIENCE. That ruling was written for moderated
 * participant sessions, where a control revealing the app has "days" teaches
 * someone that what they are looking at is staged. This is a client review:
 * Frame 23 need to see both states in one sitting, and they already know it is
 * a prototype. So it ships visible.
 *
 * ⚠ THAT MEANS A CLIENT WILL SEE IT, and so would a participant if the
 * prototype is ever put in front of one again. `SHOW_DAY_SWITCH` in
 * config/testState.ts is the one line that hides it — set it to false before
 * any moderated session.
 *
 * ─── WHY IT IS A RELOAD AND NOT A STATE CHANGE ─────────────────────────────
 * This is the part that cannot be built the obvious way. `ACTIVE_DAY` is a
 * BUILD CONSTANT, and half the app freezes day-dependent values at MODULE
 * SCOPE off the back of it — `YOUR_LOOK` in today/result.tsx, `RENDERED` in
 * ui/RenderedLook.tsx, `CHALLENGES` and `TONIGHTS_BRIEF` in data/challenges.ts,
 * `PIECES` in ui/ResultCard.tsx. By the time any component could call a
 * setter, those are already decided.
 *
 * So the switch does what the `?day=` override was built for: it navigates to
 * `/?day=N` as a FULL PAGE LOAD, and the app re-seeds from scratch. Anything
 * short of that leaves a half-switched app — day 2's wardrobe under day 1's
 * challenge, and no error to say so.
 *
 * ⚠ WEB ONLY, and it renders nothing on native. `window.location` is what makes
 * it work and React Native has no equivalent — `window` exists there (it
 * aliases `global`) but `location` does not, which is why the guard is on
 * `location` rather than on `window`, the same as `dayFromUrl` in testState.
 *
 * It lands on `/` rather than `/today` on purpose: `/` is the front door, so
 * each state starts where it actually starts — day 1 at the splash and then
 * onboarding from slide 1, day 2 at the splash and then Today.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ACTIVE_DAY, SHOW_DAY_SWITCH, type TestDay } from '@/config/testState';
import { palette, border, radius } from '@/theme/tokens';

/** Only the two states the demo tells a story with. Established (3) is the
 *  far-future reference and is not part of the script — it stays on `?day=3`. */
const OPTIONS: readonly { day: TestDay; label: string }[] = [
  { day: 1, label: 'Day 1' },
  { day: 2, label: 'Day 2+' },
];

const canSwitch = (): boolean =>
  typeof window !== 'undefined' && typeof window.location?.assign === 'function';

export function DaySwitch() {
  if (!SHOW_DAY_SWITCH || !canSwitch()) return null;

  /* A FULL LOAD, not a router push. See the header — expo-router would keep
     the JS context alive and every module-scope constant with it. */
  const go = (day: TestDay) => {
    if (day === ACTIVE_DAY) return;
    window.location.assign(`/?day=${day}`);
  };

  return (
    <View style={s.wrap}>
      {/* Named as what it is. A control that changes the whole app's state
          should not be coy about being a prototype affordance — coy is how it
          gets mistaken for a product feature. */}
      <Text style={s.kick}>prototype</Text>
      <View style={s.row}>
        {OPTIONS.map((o) => {
          const on = o.day === ACTIVE_DAY;
          return (
            <Pressable
              key={o.day}
              onPress={() => go(o.day)}
              /* The current state is not a button. `disabled` is what actually
                 emits `aria-disabled` and drops it from the tab order —
                 `accessibilityState` never reaches the DOM on web, which is a
                 gap this project has already been caught by (ui/controls.tsx). */
              disabled={on}
              accessibilityRole="button"
              accessibilityLabel={
                on ? `${o.label}, currently showing` : `Switch to the ${o.label} experience. Reloads`
              }
              style={[s.pill, on && s.pillOn]}
            >
              <Text style={[s.label, on && s.labelOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  /**
   * QUIET, AND SEPARATED. A hairline above it and a deep gap, so it reads as
   * something appended to the screen rather than the last item on it — the
   * page ends at "See upcoming challenges" and this sits below the fold of
   * that thought.
   */
  wrap: {
    marginTop: 34,
    paddingTop: 12,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kick: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 8.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    /** NON-TEXT grey is not allowed for text; `greyMute` is the AA-safe one
     *  for metadata labels (see tokens.ts). Subtle is not an excuse. */
    color: palette.greyMute,
  },
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.xs,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  /** The current state, marked but NOT accented — the accent is the app's
   *  "do this next" and this is the one option that does nothing. */
  pillOn: { backgroundColor: palette.creamSunk, borderColor: palette.greyDecor },
  label: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 10,
    letterSpacing: 0.4,
    color: palette.link,
  },
  labelOn: { color: palette.ink },
});

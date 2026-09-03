/**
 * a13 · ON IT — and this is the moment you are IN.
 *
 * Entering happens on arrival at this screen, not on the button that led here.
 * That ordering matters: the render is a consequence of having entered, never a
 * step before it. "Can't be changed now" is in the header for the same reason.
 *
 * NOT A WAIT SCREEN ANY MORE (Katya, 3 Sep). It used to hold a four-second
 * render animation and then hand you the finished look. Now it starts a real
 * clock (RENDER_DELAY_MS.brief — a minute) and sends you to the judging round
 * instead, because standing still watching a progress bar is the one thing a
 * sixty-second habit cannot afford. The render lands while you vote, and the
 * Today tab grows a dot when it does.
 *
 * WHAT IT SHOWS IN THE MEANTIME is the composed flat lay of exactly what was
 * picked. That is not a placeholder standing in for the real thing: R-L6 makes
 * the flat lay the unrendered state, and showing the pieces you chose is the
 * only honest thing to put here while the model render does not exist yet.
 *
 * THE FIRST LOOK BECOMES THE WARDROBE. `adoptLook` runs here, with entry — the
 * pieces you actually chose are the ones you keep. That is what replaced the
 * capsule picker (see onboarding/first-challenge.tsx), and it is why Day 1
 * starts with an empty wardrobe rather than eight granted pieces.
 *
 * ⚠ THE DAY 1 TOKEN GRANT FIRES HERE — an exception to "no judging, no
 * clothes", still open question A, and CONFIRMED KEPT on 3 Sep because the
 * success screen's six-token total depends on it (three here, three for the
 * round). It is stated in the copy rather than slipped in silently: a tester
 * who sees the balance move without being told is being taught the wrong rule
 * by accident, which is worse than being taught an exception on purpose.
 *
 * What it still costs: a new player who learns on day one that clothes arrive
 * for ENTERING reads the judging toll as a downgrade on day two. The standing
 * alternative is to drop it — see domain/economy.ts.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Big, Kick, Tiny, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { palette, border } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { DAY_ONE_ENTRY_GRANT_ENABLED } from '@/domain/economy';
import { useEntry } from '@/state/entry';
import { useEconomy } from '@/state/economy';
import { useSession } from '@/state/session';
import { useSubmission } from '@/state/submission';
import { useWardrobe } from '@/state/wardrobe';

export default function Rendering() {
  const picks = useEntry((s) => s.picks);
  const enter = useEntry((s) => s.enter);
  const day = useSession((s) => s.day);
  const setPhase = useSession((s) => s.setPhase);
  const grant = useEconomy((s) => s.grantDayOneTokens);
  const submit = useSubmission((s) => s.submit);
  const adoptLook = useWardrobe((s) => s.adoptLook);

  const entryGrant = dayConfig(1).entryGrant;
  const granted = day === 1 && DAY_ONE_ENTRY_GRANT_ENABLED;

  /* Everything irreversible happens once, on arrival. The store guards are all
     idempotent (enter() no-ops once entered, adoptLook skips what's already
     owned, grantDayOneTokens checks its own flag), so a remount cannot
     double-enter, double-grant or duplicate the wardrobe. */
  useEffect(() => {
    const names = picks.map((p) => p.name);
    enter();
    adoptLook(names);
    if (granted) grant(entryGrant);
    submit('brief', {
      destination: 'brief',
      picks: names,
      occasion: null,
      freeTags: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toJudging = () => {
    setPhase('judging');
    router.replace('/(tabs)/today/judging');
  };

  return (
    <Screen>
      <Header title="In · can’t be changed" />

      <Scroll>
        <Kick>we&apos;re on it</Kick>
        <Big style={{ marginTop: 7 }}>
          {`We’re building your\nlook right now.`}
        </Big>
        <Tiny style={{ marginTop: 8 }}>
          All {picks.length} pieces, exactly as you picked them. It takes about a minute, and you
          don&apos;t have to sit here for it — <B>go and vote</B>, and we&apos;ll put a dot on Today
          the moment it&apos;s ready.
        </Tiny>

        <View style={{ marginTop: 16 }}>
          <ComposedFlatLay
            pieces={picks.map((p) => p.name)}
            caption="Your entry · render in progress"
          />
        </View>

        {granted ? (
          <View style={s.grantNote}>
            <Kick tone="alert">first day only</Kick>
            <Tiny style={{ marginTop: 5 }}>
              <B>{entryGrant} tokens</B> for entering, so you have something to spend tonight. After
              today, tokens only come from judging — and the {picks.length} pieces you just used are
              yours to keep either way.
            </Tiny>
          </View>
        ) : null}

        <Gap />
      </Scroll>

      <Foot>
        {/* Vote is the fourth step on the ribbon, so the judging round reads as
            the END OF THE JOB rather than a separate errand. */}
        <Button label="Last step · vote on tonight’s looks" onPress={toJudging} />
      </Foot>
    </Screen>
  );
}

const s = {
  /** No alert hue survives the v3 collapse (see tokens.ts) — ink border on the
   *  sunk ground is the day-one notice's only distinction now. */
  grantNote: {
    marginTop: 16,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.creamSunk,
    padding: 13,
  },
} as const;

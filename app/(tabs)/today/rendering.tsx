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
 * IT SHOWS NOTHING IN THE MEANTIME (Katya, 3 Sep). It used to hold a composed
 * flat lay of the picks. That card is gone: this screen exists to move you on,
 * and putting the look on it invited you to stay and study something you had
 * just spent two screens looking at. The whole screen is now one sentence and
 * a button, which is what a hand-off should be. The look is still one tap away
 * once it lands — see today/entered.tsx.
 *
 * THE FIRST LOOK BECOMES THE WARDROBE. `adoptLook` runs here, with entry — the
 * pieces you actually chose are the ones you keep. That is what replaced the
 * capsule picker (see onboarding/first-challenge.tsx), and it is why Day 1
 * starts with an empty wardrobe rather than eight granted pieces.
 *
 * ⚠ THE DAY 1 TOKEN GRANT FIRES HERE — an exception to "no judging, no
 * clothes", still open question A, and CONFIRMED KEPT on 3 Sep because the
 * success screen's six-token total depends on it (three here, three for the
 * round).
 *
 * IT IS EXPLAINED ON THE SUCCESS SCREEN, NOT HERE (Katya, 4 Sep). The grant
 * still fires on this screen — it has to, so the badge reads 3 while you vote —
 * but the panel that says what it is moved to today/settled.tsx, where the
 * other tokens land and where a sentence about the economy has something to
 * attach itself to. This screen is a hand-off; it was carrying the longest
 * paragraph in the flow.
 *
 * It is still STATED rather than slipped in silently: a tester who sees the
 * balance move without ever being told is being taught the wrong rule by
 * accident, which is worse than being taught an exception on purpose.
 *
 * What it still costs: a new player who learns on day one that clothes arrive
 * for ENTERING reads the judging toll as a downgrade on day two. The standing
 * alternative is to drop it — see domain/economy.ts.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Big, Body, Kick, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { ENTRY_STEPS } from '@/domain/entry';
import { FIRST_LOOK_BONUS_ENABLED, TOKENS_FOR_FIRST_LOOK } from '@/domain/economy';
import { useEntry } from '@/state/entry';
import { useEconomy } from '@/state/economy';
import { useSession } from '@/state/session';
import { useSubmission } from '@/state/submission';
import { useCreate } from '@/state/create';
import { useWardrobe } from '@/state/wardrobe';

export default function Rendering() {
  const picks = useEntry((s) => s.picks);
  const enter = useEntry((s) => s.enter);
  const day = useSession((s) => s.day);
  const setPhase = useSession((s) => s.setPhase);
  const grant = useEconomy((s) => s.grantDayOneTokens);
  const submit = useSubmission((s) => s.submit);
  const spendBrief = useCreate((s) => s.spendBrief);
  const adoptLook = useWardrobe((s) => s.adoptLook);

  /* One number, from the domain. `dayConfig(1).entryGrant` used to hold a
     second copy of it, which is one place too many for a value the copy quotes. */
  const granted = day === 1 && FIRST_LOOK_BONUS_ENABLED;

  /* Everything irreversible happens once, on arrival. The store guards are all
     idempotent (enter() no-ops once entered, adoptLook skips what's already
     owned, grantDayOneTokens checks its own flag), so a remount cannot
     double-enter, double-grant or duplicate the wardrobe. */
  useEffect(() => {
    const names = picks.map((p) => p.name);
    enter();
    adoptLook(names);
    if (granted) grant(TOKENS_FOR_FIRST_LOOK);
    submit('brief', {
      destination: 'brief',
      picks: names,
      /* A brief entry has no free tags. Its single closed declared word is a
         different field entirely — free text is a FREESTYLE reversal only, and
         Build keeping its closed word is what keeps the gap alive on brief
         entries (domain/tags.ts). */
      tags: [],
    });
    /* The brief's own render allowance, spent here. Two separate counters, so
       entering the day's job leaves the freestyle render untouched and vice
       versa — never one shared counter (domain/renders.ts). */
    spendBrief();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toJudging = () => {
    setPhase('judging');
    router.replace('/(tabs)/today/judging');
  };

  return (
    <Screen>
      <Header title="In · can’t be changed" />

      {/* THE RIBBON IS BACK (Katya, 4 Sep). It was dropped when this stopped
          being a wait screen, which lost the one thing that tells you the day
          is not over: Vote is step 4, and it is the reason the button below
          says "last step". Pick and Look are done; Render is where you are. */}
      <StepRibbonBleed
        steps={statesFor(
          ENTRY_STEPS.map((e) => ({ label: e.label, hint: e.hint })),
          3,
          [true, true],
        )}
      />

      <Scroll>
        <Kick>we&apos;re on it</Kick>
        <Big style={{ marginTop: 7 }}>
          {`We’re building your\nlook right now.`}
        </Big>
        <Body style={{ marginTop: 8 }}>
          All {picks.length} pieces, exactly as you picked them. It takes about a minute, and you
          don&apos;t have to sit here for it — <B>go and vote</B>, and we&apos;ll put a dot on Today
          the moment it&apos;s ready.
        </Body>

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


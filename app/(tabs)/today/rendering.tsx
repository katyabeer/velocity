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
import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Hero, Body, Kick, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { palette } from '@/theme/tokens';
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
  const markFirstEntry = useSession((s) => s.markFirstEntry);
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
    /* THE FIRST ENTRY, and it is what flips the You descriptor off "just
       joined". Not a login date: someone who signs up at 21:00 and cannot
       enter until tomorrow is still just joined, correctly. Idempotent, so a
       remount cannot re-date it. */
    markFirstEntry();
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
      {/* ══ NO TITLE IN THE BAR (Katya, 4 Sep) ══
          Every screen of the day's flow had one — "Pick your pieces",
          "Preview your look", "Who wears it", "In · can't be changed", "Vote 1
          of 5" — and every one of them restated something the screen already
          said louder. The step ribbon names the step, and each screen leads
          with its own heading. The bar keeps the chevron and the token badge,
          which are the only things on it that are not repetition. */}
      <Header />

      {/* THE RIBBON IS BACK (Katya, 4 Sep). It was dropped when this stopped
          being a wait screen, which lost the one thing that tells you the day
          is not over: Vote is step 4, and it is the reason the button below
          says "last step". Pick and Look are done; Render is where you are. */}
      <StepRibbonBleed
        steps={statesFor(
          ENTRY_STEPS.map((e) => ({ label: e.label })),
          3,
          [true, true],
        )}
      />

      <Scroll>
        {/* ══ THE HERO TREATMENT, LIKE THE REST OF THE FLOW (Katya, 7 Sep:
              "match the other heading style") ══
            It was `Big` — the italic `Lede` at 23px — which made it the one
            screen of the day's flow not leading in the display face. Step 2's
            "Preview your look." and step 1's brief are the reference.

            The kicker went with it. "WE'RE ON IT" over "we're building your
            look" was the same reassurance twice, and a `Hero` does not need a
            label telling you it is about to speak.

            ⚠ HEADING TEXT TAKEN FROM HER MESSAGE. She wrote it as if quoting
            the existing heading ("Hold tight, we're building your look…"),
            which it was not — so this is now her words rather than a restyle
            of mine. Say if you only meant the style to change. */}
        <Hero>{'Hold tight,\nwe’re building\nyour look.'}</Hero>

        {/* ⚠ STILL THREE VERBS FOR ONE THING ON ONE SCREEN, and this copy
            keeps two of them: the ribbon step says GENERATE, the heading says
            BUILDING, and the line below says CREATE. The 4 Sep ruling is that
            every user-visible string says *generate*. One word in each place;
            her copy, so still her call. */}
        <Body style={{ marginTop: 12 }}>It takes about a minute to create.</Body>

        <Kick tone="muted" style={{ marginTop: 18 }}>
          what next
        </Kick>
        <View style={{ marginTop: 9 }}>
          {/* A DOT, NOT A "·" GLYPH. Same habit as the tick and the plus: a
              drawn mark takes the ink token, a character takes whatever the
              platform font gives it. Aligned to the first line's cap height
              rather than centred, so a two-line bullet hangs correctly. */}
          <Bullet>We&apos;ll notify you as soon as it&apos;s ready.</Bullet>
          <Bullet>
            Once it&apos;s up it will be entered into a head-to-head vote against other
            designers.
          </Bullet>
          {/* Bold because it is the one bullet that asks for something. The
              other two report; this one routes.

              ⚠ IT SAYS "VOTING" AND NOTHING IS CALLED THAT. The ribbon step
              is VOTE, the footer button below says "Vote now", and there is no
              Voting tab — the round is reached from Today. Not changed,
              because it is her word and it is clear in context, but it is the
              only nav reference in the app that names a place by a word the
              app does not use. */}
          <Bullet last>
            <B>
              In the meantime, head over to Voting to rate on other players&apos; submissions.
            </B>
          </Bullet>
        </View>

        <Gap />
      </Scroll>

      <Foot>
        {/* Vote is the fourth step on the ribbon, so the judging round reads as
            the END OF THE JOB rather than a separate errand. */}
        <Button label="Vote now" onPress={toJudging} />
      </Foot>
    </Screen>
  );
}

/**
 * A bullet row. Local to this screen because it is the only bulleted list in
 * the app — `NumberedList` in ui/cards.tsx is the numbered one, and it earns
 * its place in the shared module by being used on o7 and nowhere near here.
 * If a second list turns up, move this.
 */
function Bullet({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[s_bullet, last && { marginBottom: 0 }]}>
      <View style={s_dot} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Body>{children}</Body>
      </View>
    </View>
  );
}

const s_bullet = { flexDirection: 'row' as const, gap: 10, marginBottom: 9 };
/** 5pt, and nudged down 8 so it sits on the first line's x-height rather than
 *  its top — `body` is a 16px face on a 21px line. */
const s_dot = {
  width: 5,
  height: 5,
  borderRadius: 999,
  backgroundColor: palette.ink,
  marginTop: 8,
};

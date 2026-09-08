/**
 * a18 · WHO WEARS IT — the casting step. Presented as a modal because it is
 * reached from two flows (the builder and Create) and has to return to whichever
 * one opened it. `castingOrigin` in the session store carries that.
 *
 * LOCKED DECISION 10. Presentation · hair · skin tone (3) · body shape (3).
 * The full matrix is 108 combinations, but only THREE RENDERS are needed for the
 * test — variants of the participant's own look. Everyone else gets one model.
 *
 * "Changes the generation, not the clothes." That line is doing real work: casting
 * is a production decision, not a self-description, which is what keeps it
 * consistent with *no bodies-as-you, no fit*.
 *
 * ⚠ ON A MODEL REOPENS A SETTLED QUESTION. Brief §10.7 and resolution §13.4 both
 * hold *no bodies, no fit*, with art direction as the defensible claim. Jack's
 * open question 2 is exactly this, and it multiplies unit cost. The flat-lay
 * presentation on the next screen is the other position, still live.
 *
 * The proposed framing (unsigned off, naming-and-art-direction.md): YOU ARE THE
 * DRESSER, NOT THE ONE GOING OUT. That makes the absence of fit correct rather
 * than missing, and turns this screen from a body-picker into casting.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Header, Screen, Scroll, Wrap, Gap } from '@/ui/layout';
import { Hero, Kick, Tiny } from '@/ui/text';
import { Button, Chip } from '@/ui/controls';
import { StepRibbonBleed, statesFor } from '@/ui/StepRibbon';
import { palette, border } from '@/theme/tokens';
import { ENTRY_STEPS } from '@/domain/entry';
import { CREATE_RIBBON } from '@/domain/renders';
import { useSession, type Casting } from '@/state/session';
import { useCreate } from '@/state/create';

const GROUPS: readonly { key: keyof Casting; label: string; options: readonly string[] }[] = [
  { key: 'presentation', label: 'Presentation', options: ['Womenswear', 'Menswear', 'Neither'] },
  { key: 'hair', label: 'Hair', options: ['Short', 'Long', 'Cropped', 'Wrapped'] },
  { key: 'skin', label: 'Skin', options: ['Light', 'Mid', 'Deep'] },
  { key: 'body', label: 'Body', options: ['Slim', 'Average', 'Fuller'] },
];

export default function CastingScreen() {
  const casting = useSession((s) => s.casting);
  const setCasting = useSession((s) => s.setCasting);
  const origin = useSession((s) => s.castingOrigin);
  const startCreateRender = useCreate((s) => s.startRender);

  const go = () => {
    if (origin === 'create') {
      /* Casting is the LAST INPUT the job needs, so this is where the job
         actually starts. It is not where the allowance is spent — that was the
         step-2 commit, and it stayed there deliberately: if the allowance were
         only spent on success, a user could start a render, kill the app and
         start again, which is a reroll through the back door. */
      startCreateRender();
      router.replace('/create');
    } else {
      router.replace('/(tabs)/today/rendering');
    }
  };

  return (
    <Screen>
      {/* NO "SAME AS LAST TIME" (Katya, 4 Sep). It was a header shortcut that
          skipped straight to `go()` — but the casting PERSISTS between
          sessions, so arriving here and pressing the footer button without
          touching anything already reuses it. The link was a second control
          for the thing the primary control already did, and at 16px it pushed
          "Who wears it" onto two lines in a bar meant for one. */}
      {/* ══ NO TITLE IN THE BAR (Katya, 4 Sep) ══
          Every screen of the day's flow had one — "Pick your pieces",
          "Preview your look", "Who wears it", "In · can't be changed", "Vote 1
          of 5" — and every one restated something the screen already said
          louder. The step ribbon names the step, and each screen leads with
          its own heading. The bar keeps the chevron and the token badge, which
          are the only things on it that are not repetition. */}
      <Header onBack={() => router.back()} />

      {/* Whichever flow opened this, its own ribbon, so the screen reads as a
          step OF that journey rather than a flow it dropped out of.

          CASTING HAS NO SEGMENT OF ITS OWN in either ribbon (Katya, 4 Sep).
          Create used to give it one, labelled MODEL, which made a five-segment
          ribbon numbered 1,2,2,3,4 under a header reading "3 of 4". Now both
          flows sit at RENDER here, because rendering is what the next tap
          starts — and Create's "of 4" is finally true. */}
      <StepRibbonBleed
        steps={
          origin === 'create'
            ? statesFor(CREATE_RIBBON.map((s) => ({ label: s.label })), 4, [
                true,
                true,
                true,
              ])
            : statesFor(ENTRY_STEPS.map((s) => ({ label: s.label })), 3, [
                true,
                true,
              ])
        }
      />

      <Scroll>
        {/* ══ RENAMED FROM "WHO'S WEARING IT?" (Katya, 7 Sep) ══
            ⚠ AND IT MOVES THE SCREEN'S FRAMING, WHICH IS WHY THIS NOTE IS
            LONG. Katya's call, built as asked — but Jack should see it, because
            the old words were load-bearing rather than decorative.

            Brief §10.7 and resolution §13.4 both hold *no bodies, no fit*, with
            ART DIRECTION as the defensible claim. "Who's wearing it?" plus
            "changes the generation, not the clothes" is what made this screen
            CASTING — a production decision about the photograph — rather than a
            description of the person using the app. The unsigned-off framing in
            naming-and-art-direction.md puts it plainly: YOU ARE THE DRESSER,
            NOT THE ONE GOING OUT. That is the sentence that makes the absence
            of fit correct rather than missing.

            "Model customisation" and "customise the model" are configuration
            words. They read closer to the body-picker the casting framing was
            built to avoid, and they drop the "not the clothes" clause that kept
            the two apart. It is also Jack's open question 2 (render on a body
            vs flat lay) leaning further toward the body.

            The nearest thing that keeps her structure and the position:
            "Model customisation" / "Customise the model wearing your outfit —
            it changes the generation, not the clothes." One clause back.

            BRITISH SPELLING, deliberately: she typed "customization", and the
            product's copy is British throughout ("One colour", "optimising",
            "itemised"). This would have been the only US spelling on screen.

            ALSO GONE: the flow-specific closer. For the brief that was "The
            next tap enters your look — nothing can be changed after it", which
            is invariant 4 stated at the point of no return. It is still said
            one screen earlier — step 2 now reads "All look generations are
            final, so use wisely!" — and the footer button says "Build and
            submit", so it is not unsaid. It is no longer said HERE. */}
        <Hero size={32}>{'Model\ncustomisation'}</Hero>
        <Tiny style={{ marginTop: 8 }}>
          Here you can customise the model wearing your outfit.
        </Tiny>

        <View style={{ marginTop: 16 }}>
          {GROUPS.map((g, i) => (
            <View
              key={g.key}
              style={{
                paddingVertical: 13,
                borderBottomWidth: i === GROUPS.length - 1 ? 0 : border.hair,
                borderBottomColor: palette.creamSunk,
              }}
            >
              <Kick tone="muted">{g.label}</Kick>
              <Wrap style={{ marginTop: 8 }}>
                {g.options.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    tone={casting[g.key] === o ? 'on' : 'default'}
                    onPress={() => setCasting(g.key, o as never)}
                  />
                ))}
              </Wrap>
            </View>
          ))}
        </View>

        <Gap />
      </Scroll>

      <Foot>
        {/* The brief's button has to say what it commits to. "Render it" is
            true for Create, where nothing is entered into anything; here the
            same tap is the point of no return (invariant 4). */}
        <Button label={origin === 'brief' ? 'Build and submit' : 'Generate it'} onPress={go} />
      </Foot>
    </Screen>
  );
}

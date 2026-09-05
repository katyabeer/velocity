/**
 * a14 · YOUR LOOK — the finished render, and the read.
 *
 * REACHED DIFFERENTLY NOW (Katya, 3 Sep). It used to be the screen straight
 * after the render animation, on the way to judging. The render is async now,
 * so this is where you arrive when you go and look at the finished thing: from
 * the Today card once the challenge card reads *complete*, or from the dot on
 * the Today tab if the render landed while you were elsewhere.
 *
 * LOOKING AT IT IS WHAT CLEARS THE DOT. `markSeen('brief')` runs on mount and
 * nothing else sets it — the badge is the only record that something finished
 * while you were away, so it may not expire on a timer or on a tab change.
 *
 * One look, TWO PRESENTATIONS: on a model, or the composed flat lay. The toggle
 * in the header is not a preference — it is the two positions on Jack's open
 * question 2, side by side, so a session can watch which one people believe.
 *
 * THE FLAT LAY IS NOT A FALLBACK. It is the unrendered state, and R-L6 says a
 * failed generation still enters the pool as a composed flat lay. It has to
 * exist regardless — which is also why it is the one presentation here built
 * from the real cutouts rather than a wireframe.
 *
 * ⚠ OPEN QUESTION C lives on this screen. "The gap" — *you went for clean, it
 * read as brave* — was the line the earlier handover called the most useful in
 * the product, and it currently has no input anywhere (locked decision 18
 * removed the tag step). If it comes back, THIS is still the cheapest home: one
 * tap here, after the render has landed. It costs no step before entry, and
 * declaring after you have seen it is arguably a truer reading.
 *
 * Right now it is absent BY CONSEQUENCE rather than by decision. Katya's call.
 */

import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Big, Body, Tiny, Kick } from '@/ui/text';
import { Button } from '@/ui/controls';
import { RenderedFigure } from '@/ui/RenderStage';
import { ComposedFlatLay } from '@/ui/ComposedFlatLay';
import { palette } from '@/theme/tokens';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';
import { useEconomy } from '@/state/economy';
import { useSubmission } from '@/state/submission';

export default function Entered() {
  const picks = useEntry((s) => s.picks);
  const mode = useSession((s) => s.renderMode);
  const setMode = useSession((s) => s.setRenderMode);
  const setPhase = useSession((s) => s.setPhase);
  const callsCast = useEconomy((s) => s.callsCast);
  const quota = useEconomy((s) => s.quota);
  const markSeen = useSubmission((s) => s.markSeen);

  const judged = callsCast >= quota;

  useEffect(() => {
    markSeen('brief');
    // Deliberately once, on mount — arriving here IS having seen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <Header
        onBack={() => router.back()}
        title="In · can’t be changed"
        right={
          <Pressable onPress={() => setMode(mode === 'model' ? 'flat' : 'model')}>
            <Tiny color={palette.link} style={{ fontFamily: 'Archivo_700Bold' }}>
              {mode === 'model' ? 'On a model' : 'Flat lay'}
            </Tiny>
          </Pressable>
        }
      />

      <Scroll>
        {mode === 'model' ? (
          <RenderedFigure />
        ) : (
          <ComposedFlatLay pieces={picks.map((p) => p.name)} />
        )}

        <View style={{ paddingTop: 14 }}>
          <Kick>you&apos;re in</Kick>
          <Big style={{ marginTop: 6 }}>That&apos;s your answer in.</Big>
          <Body style={{ marginTop: 7 }}>
            {judged
              ? 'Nothing can be changed now. The room is comparing it against everyone else’s, and the result lands at 7am with tomorrow’s job.'
              : 'Nothing can be changed now. One thing left tonight — judge the field alongside everyone else, and the result lands at 7am.'}
          </Body>

          <Gap />
        </View>
      </Scroll>

      <Foot>
        {judged ? (
          <Button
            label="Go and spend your tokens"
            onPress={() => router.push('/(tabs)/magazine')}
          />
        ) : (
          <Button
            label="Vote now"
            onPress={() => {
              setPhase('judging');
              router.push('/(tabs)/today/judging');
            }}
          />
        )}
      </Foot>
    </Screen>
  );
}

/**
 * a14 · YOU'RE IN — the render and the read, combined.
 *
 * One look, TWO PRESENTATIONS: on a model, or flat lay. The toggle in the header
 * is not a preference — it is the two positions on Jack's open question 2, side
 * by side, so a session can watch which one people believe.
 *
 * THE FLAT LAY IS NOT A FALLBACK. It is the unrendered state, and R-L6 says a
 * failed generation still enters the pool as a composed flat lay. It has to
 * exist regardless.
 *
 * ⚠ OPEN QUESTION C lives on this screen. "The gap" — *you went for clean, it
 * read as brave* — was the line the earlier handover called the most useful in
 * the product, and it currently has no input anywhere (locked decision 18
 * removed the tag step). If it comes back, THIS is the cheapest home: one tap
 * here, after the render lands. It costs no step before entry, and declaring
 * after you have seen it is arguably a truer reading.
 *
 * Right now it is absent BY CONSEQUENCE rather than by decision. Katya's call.
 */

import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll } from '@/ui/layout';
import { Big, Kick, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { RenderedFigure } from '@/ui/RenderStage';
import { FlatLay } from '@/ui/pieces';
import { palette } from '@/theme/tokens';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';

export default function Entered() {
  const picks = useEntry((s) => s.picks);
  const mode = useSession((s) => s.renderMode);
  const setMode = useSession((s) => s.setRenderMode);
  const setPhase = useSession((s) => s.setPhase);

  return (
    <Screen>
      <Header
        title="In · can't be changed"
        right={
          <Pressable onPress={() => setMode(mode === 'model' ? 'flat' : 'model')}>
            <Tiny color={palette.link} style={{ fontFamily: 'Archivo_700Bold' }}>
              {mode === 'model' ? 'On a model' : 'Flat lay'}
            </Tiny>
          </Pressable>
        }
      />

      <Scroll bleed>
        <View style={{ paddingHorizontal: 22 }}>
          {mode === 'model' ? (
            <RenderedFigure />
          ) : (
            <FlatLay
              pieces={picks.map((p) => p.name)}
              height={330}
              caption="Flat lay · no body, no fit"
            />
          )}
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <Kick>you&apos;re in</Kick>
          <Big style={{ marginTop: 6 }}>That&apos;s your answer in.</Big>
          <Tiny style={{ marginTop: 7 }}>
            Nothing can be changed now. At 8pm you judge the field alongside everyone else, and the
            result lands at 7am.
          </Tiny>

          <Gap />
        </View>
      </Scroll>

      <Foot>
        {/* Vote is the fourth step on the ribbon, so the judging round reads as
            the END OF THE JOB rather than a separate errand. */}
        <Button
          label="Last step · judge tonight's drinks"
          onPress={() => {
            setPhase('judging');
            router.push('/(tabs)/today/judging');
          }}
        />
      </Foot>
    </Screen>
  );
}

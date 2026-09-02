/**
 * a18 · WHO WEARS IT — the casting step. Presented as a modal because it is
 * reached from two flows (the builder and Create) and has to return to whichever
 * one opened it. `castingOrigin` in the session store carries that.
 *
 * LOCKED DECISION 10. Presentation · hair · skin tone (3) · body shape (3).
 * The full matrix is 108 combinations, but only THREE RENDERS are needed for the
 * test — variants of the participant's own look. Everyone else gets one model.
 *
 * "Changes the render, not the clothes." That line is doing real work: casting
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
import { palette, border } from '@/theme/tokens';
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
  const useRender = useCreate((s) => s.useRender);
  const setCreateStep = useCreate((s) => s.setStep);

  const go = () => {
    if (origin === 'create') {
      useRender();
      setCreateStep(4);
      router.replace('/(tabs)/create');
    } else {
      router.replace('/(tabs)/today/rendering');
    }
  };

  return (
    <Screen>
      <Header
        onBack={() => router.back()}
        title="Who wears it"
        right={
          <Tiny color={palette.link} onPress={go} style={{ fontFamily: 'Archivo_700Bold' }}>
            Same as last time →
          </Tiny>
        }
      />

      <Scroll>
        <Hero>{'Who’s\nwearing it?'}</Hero>
        <Tiny style={{ marginTop: 8 }}>
          Changes the render, not the clothes. Set it once and reuse it.
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
        <Button label="Render it" onPress={go} />
      </Foot>
    </Screen>
  );
}

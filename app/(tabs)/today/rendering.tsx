/**
 * a13 · RENDERING — and this is the moment you are IN.
 *
 * Entering happens on arrival at this screen, not on the button that led here.
 * That ordering matters: the render is a consequence of having entered, never a
 * step before it. "Can't be changed now" is in the header for the same reason.
 *
 * ⚠ THE DAY 1 TOKEN GRANT FIRES HERE — an exception to "no judging, no clothes",
 * and unresolved (open question A). Without it a Day 1 tester enters at 19:40
 * and has nothing to do until judging opens, so never reaches the moment the
 * wardrobe fills.
 *
 * What it costs: the coupling is the cleanest thing in version A. A new player
 * who learns on day one that clothes arrive for ENTERING reads the judging toll
 * as a downgrade on day two. The standing recommendation is to drop it and make
 * the starter capsule eleven pieces instead — see domain/economy.ts.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { Header, Screen, Scroll } from '@/ui/layout';
import { Big, Kick, Tiny } from '@/ui/text';
import { RenderStage } from '@/ui/RenderStage';
import { palette } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { DAY_ONE_ENTRY_GRANT_ENABLED } from '@/domain/economy';
import { useEntry } from '@/state/entry';
import { useEconomy } from '@/state/economy';
import { useSession } from '@/state/session';

export default function Rendering() {
  const picks = useEntry((s) => s.picks);
  const enter = useEntry((s) => s.enter);
  const markRendered = useEntry((s) => s.markRendered);
  const day = useSession((s) => s.day);
  const grant = useEconomy((s) => s.grantDayOneTokens);

  useEffect(() => {
    enter();
    if (day === 1 && DAY_ONE_ENTRY_GRANT_ENABLED) grant(dayConfig(1).entryGrant);
  }, [enter, grant, day]);

  const done = () => {
    markRendered();
    router.replace('/(tabs)/today/entered');
  };

  return (
    <Screen>
      <Header
        title="Entered · rendering"
        right={
          <Tiny color={palette.klein} onPress={done} style={{ fontFamily: 'Archivo_700Bold' }}>
            Skip →
          </Tiny>
        }
      />
      <Scroll>
        <Kick>putting it together</Kick>
        <Big style={{ marginTop: 7 }}>Exactly the {picks.length} you picked.</Big>
        <RenderStage pieces={picks.map((p) => p.name)} onComplete={done} />
        <Tiny style={{ marginTop: 8 }}>Usually about four seconds.</Tiny>
      </Scroll>
    </Screen>
  );
}

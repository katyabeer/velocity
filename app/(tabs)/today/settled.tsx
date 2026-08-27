/**
 * a4 · SETTLED — the tokens land.
 *
 * MARK-THEN-MINT: this is the only place +3 appears, because finishing the ten
 * is the only thing that mints it. Pinching used to mint on the spot, so you
 * could cast one vote, take three pieces and leave — 2 comparisons supplied for
 * 3 pieces, against 20 for the same 3 if you finished.
 *
 * "Nothing else is asked of you tonight." Sixty seconds can be a habit;
 * ninety-plus is a chore. The screen's job is to end the day cleanly and point
 * at the magazine, not to open a second loop.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll } from '@/ui/layout';
import { Big, Kick, Num, Tiny } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Card } from '@/ui/cards';
import { palette, border } from '@/theme/tokens';
import { TOKENS_PER_JUDGING_ROUND } from '@/domain/economy';
import { useEconomy, tokenLabel } from '@/state/economy';

export default function Settled() {
  const balance = useEconomy((s) => s.balance);
  const overnight = useEconomy((s) => s.overnightTokens);

  return (
    <Screen>
      <LogoBlock title="Settled" subtitle="Tonight's drinks are done. Sixty-one seconds." />

      <Scroll>
        <View style={{ borderWidth: border.mid, borderColor: palette.shock, backgroundColor: palette.shockTint, padding: 16 }}>
          <Kick tone="alert">you unlocked</Kick>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'baseline', marginTop: 9 }}>
            <Num color={palette.shock}>+{TOKENS_PER_JUDGING_ROUND}</Num>
            <View style={{ flex: 1 }}>
              <Big size={20} color={palette.shockInk}>
                tokens
              </Big>
              <Tiny color={palette.shockMid} style={{ marginTop: 5 }}>
                {tokenLabel(balance)} to spend
                {overnight
                  ? ` — three for judging, ${overnight} from people taking your pieces.`
                  : '.'}
              </Tiny>
            </View>
          </View>
        </View>

        <Card style={{ marginTop: 16 }}>
          <Kick tone="muted">what happens now</Kick>
          <Tiny style={{ marginTop: 5, fontSize: 12.5, lineHeight: 20, color: palette.soft }}>
            Twenty people compare your look with someone else&apos;s. When enough have, it settles —
            and you hear at 7am, along with tomorrow&apos;s job.
          </Tiny>
        </Card>

        <Tiny style={{ marginTop: 13, paddingTop: 12, borderTopWidth: border.hair, borderTopColor: palette.line }}>
          Nothing else is asked of you tonight.
        </Tiny>

        <Gap />
      </Scroll>

      <Foot>
        <Button label="Go and spend them" onPress={() => router.push('/(tabs)/magazine')} />
      </Foot>
    </Screen>
  );
}

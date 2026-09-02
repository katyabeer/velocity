/**
 * a17 · IT'S UP.
 *
 * "No score, no placing. Somebody might spend a token on it — you'll know if
 * they do."
 *
 * That sentence is the whole economy in one line. A freestyle post cannot place,
 * but it CAN earn: one token per distinct person who takes a piece from it. That
 * decoupling from the daily brief is locked decision 3, and it is what prices
 * submission supply — previously unpriced, and the design's most serious
 * structural fault.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Foot, Gap, LogoBlock, Screen, Scroll, Wrap } from '@/ui/layout';
import { Tiny } from '@/ui/text';
import { Button, Chip } from '@/ui/controls';
import { LookPlate } from '@/ui/LookPlate';
import { palette } from '@/theme/tokens';
import { useCreate } from '@/state/create';
import { useEntry } from '@/state/entry';
import { useSession } from '@/state/session';

export default function Posted() {
  const occasion = useCreate((s) => s.occasion);
  const freeTags = useCreate((s) => s.freeTags);
  const startAgain = useCreate((s) => s.startAgain);
  const entered = useEntry((s) => s.entered);
  const phase = useSession((s) => s.phase);

  return (
    <Screen>
      <LogoBlock title="It's up" subtitle="Somewhere in the magazine" />

      <Scroll>
        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
          <View style={{ width: 106 }}>
            <LookPlate
              tint="t4"
              occasion={occasion ?? 'Freestyle'}
              height={132}
              label="Yours"
              showCaption={false}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Wrap>
              {occasion ? <Chip label={occasion} tone="on" /> : null}
              {freeTags.map((t) => (
                <Chip key={t} label={t} tone="green" />
              ))}
            </Wrap>
            <Tiny style={{ marginTop: 10 }}>
              No score, no placing. Somebody might spend a token on it — you&apos;ll know if they do.
            </Tiny>
          </View>
        </View>
        <Gap />
      </Scroll>

      <Foot>
        <Button label="Go to the magazine" onPress={() => router.push('/(tabs)/magazine')} />

        {/* Offered only if there is still a job to enter. Once you are in, this
            disappears — there is nothing to go back to. */}
        {!entered ? (
          <Button
            label={phase === 'entry' ? "Enter today's job" : "Judge tonight's drinks"}
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={() =>
              router.push(phase === 'entry' ? '/(tabs)/today/build' : '/(tabs)/today/judging')
            }
          />
        ) : null}

        <Tiny
          color={palette.link}
          style={{ marginTop: 14, textAlign: 'center', fontFamily: 'Archivo_700Bold' }}
          onPress={() => {
            startAgain();
            router.replace('/(tabs)/create');
          }}
        >
          Make another →
        </Tiny>
      </Foot>
    </Screen>
  );
}

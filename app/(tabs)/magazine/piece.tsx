/**
 * a16 · A PIECE, CLOSE UP.
 *
 * STARRING IS FREE; TAKING COSTS A TOKEN. The star button top-right and the
 * button in the footer are two different acts, and the copy has to keep them
 * apart: starring is "I want this", taking is "this is mine now".
 *
 * The two figures — held by / top half — are the ONE place a level is shown
 * rather than a movement, and it is deliberate: you are deciding about this
 * specific garment, not reading the room. The FEED read-out reports movement
 * only, never level. Don't unify them.
 *
 * "Put it back" refunds the token. Nothing is ever lost for good — no market,
 * no expiry, nothing bought or sold.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Foot, Gap, Header, Screen, Scroll, Wrap } from '@/ui/layout';
import { H2, Kick, Num, Tiny } from '@/ui/text';
import { Button, Chip } from '@/ui/controls';
import { Card } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { SaveIcon } from '@/ui/TabIcon';
import { palette, border } from '@/theme/tokens';
import { canTake } from '@/domain/economy';
import { useMagazine } from '@/state/magazine';
import { useEconomy } from '@/state/economy';
import { useWardrobe } from '@/state/wardrobe';

export default function Piece() {
  const piece = useMagazine((s) => s.focusedPiece);
  const economy = useEconomy();
  const count = useWardrobe((s) => s.count);
  const cap = useWardrobe((s) => s.cap);
  const add = useWardrobe((s) => s.add);
  const remove = useWardrobe((s) => s.remove);

  /* No focused piece means this route was reached directly — a deep link, or a
     reload on it. It used to call `router.back()` here, DURING RENDER, which
     React 19 flags as a setState in another component's render pass and which
     has nowhere to go on a cold load anyway. `<Redirect>` is the declarative
     equivalent and is safe at render time. */
  if (!piece) return <Redirect href="/(tabs)/magazine" />;

  const held = economy.held.includes(piece.name);
  const starred = economy.starred.includes(piece.name);
  const takeable = canTake(economy, count, cap);

  const primary = held
    ? { label: 'Put it back', variant: 'ghost' as const, onPress: () => { economy.putBack(piece.name); remove(piece.name); } }
    : takeable
      ? {
          label: `Spend a token · ${economy.balance}`,
          variant: 'solid' as const,
          onPress: () => { economy.take(piece.name); add(piece.name); },
        }
      : {
          label: economy.roundComplete ? 'No tokens left' : 'Judge to earn tokens',
          variant: 'off' as const,
          onPress: undefined,
        };

  return (
    <Screen>
      <Header onBack={() => router.back()} title="A piece" />

      <Scroll>
        <View style={{ position: 'relative' }}>
          <LookPlate tint="t3" occasion={piece.name} height={186} label="·" showCaption={false} />
          <Pressable
            onPress={() => economy.toggleStar(piece.name)}
            style={[s.save, starred && { backgroundColor: palette.ink }]}
            accessibilityRole="button"
            accessibilityLabel={starred ? 'Remove from saved' : 'Save for later'}
          >
            <SaveIcon filled={starred} />
          </Pressable>
        </View>

        <H2 size={27} style={{ marginTop: 13 }}>
          {piece.name}
        </H2>
        <Tiny style={{ marginTop: 6 }}>seen on {piece.from}</Tiny>

        <Wrap style={{ marginTop: 10 }}>
          {piece.tags.map((t) => (
            <Chip key={t} label={t} />
          ))}
        </Wrap>

        {held ? (
          <View style={s.owned}>
            {/* Sits on the accent-filled panel — text-on-accent is ink. */}
            <Num size={26} color={palette.ink}>
              ✓
            </Num>
            <Tiny color={palette.ink} style={{ fontFamily: 'Archivo_600SemiBold', fontSize: 12 }}>
              Yours.
            </Tiny>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 15 }}>
          <Card style={{ flex: 1, padding: 11 }}>
            <Kick tone="muted">held by</Kick>
            <Num size={26} style={{ marginTop: 4 }}>
              18%
            </Num>
          </Card>
          <Card style={{ flex: 1, padding: 11 }}>
            <Kick tone="muted">top half</Kick>
            <Num size={26} style={{ marginTop: 4 }}>
              61%
            </Num>
          </Card>
        </View>

        <Gap />
      </Scroll>

      <Foot>
        <Button label={primary.label} variant={primary.variant} onPress={primary.onPress} />
      </Foot>
    </Screen>
  );
}

const s = StyleSheet.create({
  save: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  owned: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});

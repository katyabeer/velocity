/**
 * o6 · first wardrobe — pick a capsule.
 *
 * THE CAPSULE *IS* THE DAY-ONE WARDROBE, and the builder honours it. Picking
 * *Street and sport* here means the builder later offers a parka and a hoodie,
 * not a wool coat. That is why choosing writes straight into the wardrobe store.
 *
 * The four capsules deliberately overlap and all cover all five slots, so no
 * choice can lock you out of entering (asserted in tests/capsules.test.ts).
 *
 * ⚠ OPEN QUESTION A lives here too. If the Day 1 token grant is dropped — the
 * standing recommendation — this becomes ELEVEN pieces instead of eight, and the
 * copy below changes with it. One number, one sentence. See
 * STARTER_CAPSULE_SIZE_IF_GRANT_DROPPED in domain/economy.ts.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Big, Tiny } from '@/ui/text';
import { palette, border } from '@/theme/tokens';
import { CAPSULES, type CapsuleKey } from '@/data/capsules';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';
import { STARTER_CAPSULE_SIZE } from '@/domain/economy';

export default function CapsulePicker() {
  const capsule = useSession((s) => s.capsule);
  const setCapsule = useSession((s) => s.setCapsule);
  const day = useSession((s) => s.day);
  const hydrate = useWardrobe((s) => s.hydrate);

  const choose = (key: CapsuleKey) => {
    setCapsule(key);
    /* Rebuild the inventory the moment the choice changes — the capsule is the
       wardrobe, so a stale inventory here is a wrong builder later. */
    hydrate(day, key);
  };

  return (
    <OnboardingFrame
      index={5}
      label="Your first wardrobe"
      onBack={() => router.back()}
      cta={capsule ? 'Take me in →' : 'Pick one to carry on'}
      ctaVariant={capsule ? 'solid' : 'off'}
      onCta={capsule ? () => router.replace('/(tabs)/today') : undefined}
      topAlign
    >
      <Big size={26}>{`${STARTER_CAPSULE_SIZE === 8 ? 'Eight' : 'Eleven'} pieces to start with.\nWhich ${STARTER_CAPSULE_SIZE === 8 ? 'eight' : 'eleven'}?`}</Big>
      <Tiny style={{ marginTop: 8 }}>
        Yours to keep. Everything else you&apos;ll find yourself.
      </Tiny>

      <ScrollView style={{ marginTop: 15 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          {CAPSULES.map((c) => {
            const on = c.key === capsule;
            return (
              <Pressable
                key={c.key}
                onPress={() => choose(c.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[s.opt, on && s.optOn]}
              >
                <Text style={[s.optName, on && { color: palette.klein }]}>{c.name}</Text>
                <Text style={s.optChar}>{c.character}</Text>
                <View style={s.pieces}>
                  {c.pieces.map((p) => (
                    <Text key={p} style={[s.piece, on && { borderColor: palette.kleinLine }]}>
                      {p}
                    </Text>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  opt: {
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.card,
    padding: 12,
  },
  optOn: { borderWidth: border.mid, borderColor: palette.klein, backgroundColor: palette.kleinTint },
  optName: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: 19,
    lineHeight: 19,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  optChar: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11,
    lineHeight: 15.4,
    color: palette.soft,
    marginTop: 5,
  },
  pieces: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 9 },
  piece: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8.5,
    lineHeight: 10,
    letterSpacing: 0.34,
    textTransform: 'uppercase',
    color: palette.soft,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
});

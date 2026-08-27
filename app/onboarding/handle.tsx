/**
 * o5 · two questions: a handle, and which rails to show.
 *
 * LOCKED DECISION 16 — the rails question is Men's / Women's / Both, SOFT,
 * default Both.
 *
 * Katya's call, and it is the better question: it is a preference about
 * CLOTHES, not a claim about the PERSON, so it does not reopen the no-bodies
 * position.
 *
 * ⚠ KEEP IT SOFT. A hard filter splits the garment pool, which splits the room,
 * and the cold-start floor then multiplies by the number of catalogues —
 * ~125 DAU becomes ~375. This is a settlement problem disguised as a
 * personalisation feature. The copy says "this just changes what we put in
 * front of you first" and that has to stay true in the implementation.
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Big, Kick, Tiny } from '@/ui/text';
import { palette, border } from '@/theme/tokens';
import { useSession, type Rails } from '@/state/session';

const OPTIONS: readonly { key: Rails; name: string; note: string }[] = [
  { key: 'mens', name: "Men's", note: 'Mostly menswear' },
  { key: 'womens', name: "Women's", note: 'Mostly womenswear' },
  { key: 'both', name: 'Both', note: 'Every rail, unsorted' },
];

export default function Handle() {
  const handle = useSession((s) => s.handle);
  const rails = useSession((s) => s.rails);
  const setRails = useSession((s) => s.setRails);

  return (
    <OnboardingFrame
      index={4}
      label="Two questions"
      onBack={() => router.back()}
      cta="Nearly there"
      onCta={() => router.push('/onboarding/capsule')}
      topAlign
    >
      <Kick tone="muted">what shall we call you</Kick>
      <View style={s.field}>
        <Text style={s.fieldValue}>{handle}</Text>
        <Text style={s.fieldFlag}>Available</Text>
      </View>
      <Tiny style={{ marginTop: 7 }}>
        A handle, nothing else. No bio, no photo, no followers — there&apos;s nowhere to put them.
      </Tiny>

      <Kick tone="muted" style={{ marginTop: 24 }}>
        and what shall we show you
      </Kick>
      <Big size={20} style={{ marginTop: 7 }}>
        Which rails do you want to shop?
      </Big>

      <View style={s.row}>
        {OPTIONS.map((o) => {
          const on = o.key === rails;
          return (
            <Pressable
              key={o.key}
              onPress={() => setRails(o.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[s.cat, on && s.catOn]}
            >
              <Text style={s.catName}>{o.name}</Text>
              <Text style={[s.catNote, on && { color: palette.kleinMid }]}>{o.note}</Text>
            </Pressable>
          );
        })}
      </View>

      <Tiny style={{ marginTop: 9 }}>
        This just changes what we put in front of you first. Everything stays reachable, and you can
        change it whenever.
      </Tiny>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  field: {
    marginTop: 8,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.card,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: { fontFamily: 'Archivo_500Medium', fontSize: 14, color: palette.ink },
  fieldFlag: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.klein,
  },
  row: { flexDirection: 'row', gap: 7, marginTop: 9 },
  cat: {
    flex: 1,
    borderWidth: border.mid,
    borderColor: palette.line,
    backgroundColor: palette.card,
    paddingVertical: 13,
    paddingHorizontal: 9,
    alignItems: 'center',
  },
  catOn: { borderColor: palette.klein, backgroundColor: palette.kleinTint },
  catName: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: 17,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  catNote: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9,
    lineHeight: 11.7,
    color: palette.faint,
    marginTop: 5,
    textAlign: 'center',
  },
});

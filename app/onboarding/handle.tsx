/**
 * o6 · YOUR PROFILE — two questions: a handle, and which rails to show.
 *
 * Retitled from "Two questions" (Katya, 3 Sep). The screen is the profile, and
 * calling it what it is beats counting the questions on it.
 *
 * THE FIELD STARTS EMPTY and the user types their own handle. It used to be
 * pre-filled with `katya.b`, which is a moderated-test convenience that reads
 * as "we already know who you are" and let a tester walk past the one thing
 * this screen exists to collect. The session's default is empty on day one for
 * the same reason (see state/session.ts).
 *
 * THE AVAILABILITY CHECK IS A MOCK, and it always says yes. It debounces, shows
 * a checking state, then a tick — the shape of the real thing, so a session can
 * see whether people wait for it or ignore it.
 *   ⚠ There is NO taken-handle path. Nothing here can say "that one's gone",
 *   which means the test cannot observe how someone reacts to being refused
 *   their first choice — arguably the more interesting moment. Say if you want
 *   a reserved-names list to make that reachable.
 *
 * VALIDATION IS EMPTY-ONLY, per the ask. No length rule, no character rule, no
 * profanity list. A one-character handle passes. Worth deciding before this is
 * in front of anyone, because it is the field that becomes public.
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
 * personalisation feature. The shortened copy ("You can always change it
 * later") no longer says that everything stays reachable, so that promise now
 * lives ONLY in the implementation — see `cataloguePool` in data/catalogue.ts,
 * which sorts and never filters. Do not let it become a filter.
 */

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Big, Kick, Tiny } from '@/ui/text';
import { palette, border, radius } from '@/theme/tokens';
import { useSession, type Rails } from '@/state/session';

const OPTIONS: readonly { key: Rails; name: string; note: string }[] = [
  { key: 'mens', name: "Men's", note: 'Mostly menswear' },
  { key: 'womens', name: "Women's", note: 'Mostly womenswear' },
  { key: 'both', name: 'Both', note: 'Every rail, unsorted' },
];

/** Long enough to feel like a lookup, short enough not to be in the way. */
const DEBOUNCE_MS = 400;
const CHECK_MS = 500;

type Availability = 'idle' | 'checking' | 'available';

export default function Profile() {
  const stored = useSession((s) => s.handle);
  const rails = useSession((s) => s.rails);
  const setRails = useSession((s) => s.setRails);
  const setHandle = useSession((s) => s.setHandle);

  const [draft, setDraft] = useState(stored);
  const [status, setStatus] = useState<Availability>(stored ? 'available' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* One place to drop every pending timer, so a fast typist can't have an
     older check land after a newer one and report the wrong handle. */
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const onChange = (next: string) => {
    /* No spaces in a handle — swallowed rather than rejected, because a space
       is almost always a typo for nothing rather than a request to be told off. */
    const cleaned = next.replace(/\s/g, '');
    setDraft(cleaned);
    setError(null);
    clearTimers();

    if (!cleaned.trim()) return setStatus('idle');

    setStatus('checking');
    timers.current.push(setTimeout(() => setStatus('available'), DEBOUNCE_MS + CHECK_MS));
  };

  const onContinue = () => {
    if (!draft.trim()) {
      setError('Pick a name first — this is the one thing we need.');
      return;
    }
    setHandle(draft.trim());
    router.push('/onboarding/first-challenge');
  };

  return (
    <OnboardingFrame
      index={1}
      label="Your profile"
      onBack={() => router.back()}
      cta="Nearly there"
      onCta={onContinue}
      topAlign
    >
      <Kick tone="muted">what shall we call you</Kick>
      <View style={[s.field, !!error && s.fieldError]}>
        <TextInput
          value={draft}
          onChangeText={onChange}
          placeholder="yourname"
          placeholderTextColor={palette.greyDecor}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={onContinue}
          style={s.input}
          accessibilityLabel="Your profile name"
        />
        {/* Was the word "Available". Now a tick, per the mockup — and a
            checking state, because a result that appears instantly reads as
            decoration rather than as a lookup. */}
        {status === 'checking' ? (
          <Text style={s.checking}>checking…</Text>
        ) : status === 'available' ? (
          <View style={s.tick} accessibilityLabel="That name is available">
            <Text style={s.tickMark}>✓</Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <Tiny color={palette.ink} style={s.error}>
          {error}
        </Tiny>
      ) : null}

      <Tiny style={{ marginTop: 7 }}>
        This is your profile name that will be visible to other users when you publish looks.
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
              <Text style={s.catNote}>{o.note}</Text>
            </Pressable>
          );
        })}
      </View>

      <Tiny style={{ marginTop: 9 }}>You can always change it later.</Tiny>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  field: {
    marginTop: 8,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamRaised,
    paddingLeft: 13,
    paddingRight: 11,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  /** No alert hue survives the v3 token collapse (see tokens.ts) — an ink
   *  border at the selected weight is the only emphasis available, and it is
   *  enough next to a message that says what to do. */
  fieldError: { borderWidth: border.mid, borderColor: palette.ink },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Archivo_500Medium',
    fontSize: 14,
    color: palette.ink,
    /* RN adds its own vertical padding on Android; zero it so the text sits on
       the row's centre line like every other label in the app. */
    paddingVertical: 0,
  },
  checking: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
  /** The accent disc + ink tick already used for a selected garment tile
   *  (ui/pieces.tsx `cellTick`). Same meaning, so the same mark. */
  tick: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 12,
    lineHeight: 14,
    color: palette.ink,
  },
  error: { marginTop: 7, fontFamily: 'Archivo_700Bold' },
  row: { flexDirection: 'row', gap: 7, marginTop: 9 },
  cat: {
    flex: 1,
    borderWidth: border.mid,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
    paddingVertical: 13,
    paddingHorizontal: 9,
    alignItems: 'center',
  },
  /** quintets.css's dedicated selected-state token: a 4px ink border, no
   *  color pairing (see tokens.ts border.sel). */
  catOn: { borderWidth: border.sel, borderColor: palette.ink },
  catName: {
    fontFamily: 'Archivo_900Black',
    fontSize: 17,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  catNote: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9,
    lineHeight: 11.7,
    color: palette.greyMute,
    marginTop: 5,
    textAlign: 'center',
  },
});

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
 * THE AVAILABILITY CHECK IS STILL A MOCK, but it can now say no. It debounces,
 * shows a checking state, then either a tick or the refusal — the shape of the
 * real thing, so a session can see whether people wait for it or ignore it.
 *
 * IT REFUSES A TAKEN HANDLE, which it could not before (4 Sep). The old note
 * here said "there is NO taken-handle path… the test cannot observe how someone
 * reacts to being refused their first choice — arguably the more interesting
 * moment". `TAKEN` in domain/handle.ts is the reserved list that makes that
 * moment reachable; you-brief AC 2 requires the refusal to be INLINE AND
 * IMMEDIATE rather than on submit, which is why it lands with the debounce and
 * not with the button.
 *
 * VALIDATION IS REAL NOW, and it lives in domain/handle.ts because it is a rule
 * about a public identifier, not a detail of this screen: 3–20 characters,
 * unicode letters and digits and `_`, no leading digit, case-preserved for
 * display and case-insensitive for uniqueness. It was empty-only — a
 * one-character handle passed — on a field that becomes public.
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
import { Platform, StyleSheet, Text, TextInput, View, Pressable, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Body, Kick } from '@/ui/text';
import { palette, border, radius } from '@/theme/tokens';
import { useSession, type Rails } from '@/state/session';
import {
  HANDLE_MAX_LENGTH,
  handleRejection,
  handleRejectionMessage,
  shapeRejection,
} from '@/domain/handle';

const OPTIONS: readonly { key: Rails; name: string; note: string }[] = [
  { key: 'mens', name: "Men's", note: 'Mostly menswear' },
  { key: 'womens', name: "Women's", note: 'Mostly womenswear' },
  { key: 'both', name: 'Both', note: 'Every rail, unsorted' },
];

/** Long enough to feel like a lookup, short enough not to be in the way. */
const DEBOUNCE_MS = 400;
const CHECK_MS = 500;

type Availability = 'idle' | 'checking' | 'available';

/**
 * The browser draws its own focus ring INSIDE the input on web, which lands a
 * blue rounded rectangle inside our own field border — two borders, one of them
 * not ours. Katya, 4 Sep: the focus state belongs on the field.
 *
 * `outlineStyle` is a react-native-web style property with no React Native
 * equivalent, so it is not in the RN types; the cast is the documented way to
 * pass one. Guarded by platform so nothing odd reaches native.
 */
const NO_BROWSER_OUTLINE = (Platform.OS === 'web'
  ? { outlineStyle: 'none' }
  : {}) as TextStyle;

export default function Profile() {
  const stored = useSession((s) => s.handle);
  const rails = useSession((s) => s.rails);
  const setRails = useSession((s) => s.setRails);
  const setHandle = useSession((s) => s.setHandle);

  const [draft, setDraft] = useState(stored);
  const [status, setStatus] = useState<Availability>(stored ? 'available' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
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

    /* SHAPE FIRST, and it does NOT wait for the debounce. Telling someone
       their handle is taken when it was never a legal handle sends them
       looking for a different name instead of a different character, so the
       two checks run at different moments: shape on the keystroke, uniqueness
       after the pause. */
    const shape = shapeRejection(cleaned);
    if (shape) {
      setStatus('idle');
      /* Length, only while they are still typing towards it, is not an error —
         it is a state. Everything else is worth saying at once. */
      if (shape.reason !== 'short') setError(handleRejectionMessage(shape));
      return;
    }

    setStatus('checking');
    timers.current.push(
      setTimeout(() => {
        /* INLINE AND IMMEDIATE, not on submit (AC 2). */
        const taken = handleRejection(cleaned);
        if (taken) {
          setStatus('idle');
          setError(handleRejectionMessage(taken));
          return;
        }
        setStatus('available');
      }, DEBOUNCE_MS + CHECK_MS),
    );
  };

  const onContinue = () => {
    const rejection = handleRejection(draft);
    if (rejection) {
      setError(handleRejectionMessage(rejection));
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
      {/* Order matters: an error outranks focus, because "this is wrong" is
          more use than "you are here". */}
      <View style={[s.field, focused && s.fieldFocused, !!error && s.fieldError]}>
        <TextInput
          value={draft}
          onChangeText={onChange}
          placeholder="yourname"
          placeholderTextColor={palette.greyDecor}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          maxLength={HANDLE_MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={onContinue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[s.input, NO_BROWSER_OUTLINE]}
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
        <Text style={s.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Body style={{ marginTop: 7 }}>
        This is your profile name that will be visible to other users when you publish looks.
      </Body>

      {/* "Which rails do you want to shop?" came off (Katya, 4 Sep). The
          kicker already asks the question, and the three named options answer
          it — a headline restating it made the second question on the screen
          twice the size of the first one, which is the one that matters. */}
      <Kick tone="muted" style={{ marginTop: 24 }}>
        and what shall we show you
      </Kick>

      <View style={s.row}>
        {OPTIONS.map((o) => {
          const on = o.key === rails;
          return (
            <Pressable
              key={o.key}
              onPress={() => setRails(o.key)}
              accessibilityRole="radio"
              /* `accessibilityState.selected` maps to aria-selected, which a
                 radio does not use — without aria-checked a screen reader is
                 told there are three rails and nothing about which one is on. */
              aria-checked={on}
              accessibilityState={{ selected: on, checked: on }}
              style={[s.cat, on && s.catOn]}
            >
              <Text style={s.catName}>{o.name}</Text>
              <Text style={s.catNote}>{o.note}</Text>
            </Pressable>
          );
        })}
      </View>

      <Body style={{ marginTop: 9 }}>You can always change it later.</Body>
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
  /** Focus, in the app's own selected-state language: an ink border at the
   *  committed weight. Not accent — accent is a fill and would read as "done". */
  fieldFocused: { borderWidth: border.mid, borderColor: palette.ink },
  /** Red now (Katya, 4 Sep) — `palette.error` is the first hue added since the
   *  v3 collapse and exists for exactly this. Border AND message, so the state
   *  is never carried by colour alone. */
  fieldError: { borderWidth: border.mid, borderColor: palette.error },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Archivo_500Medium',
    /** 16px (Katya, 4 Sep). It is the one field in the app anyone types into,
     *  and 14 left the row feeling cramped against a 50pt field. 16 is also the
     *  threshold below which mobile Safari zooms the viewport on focus, which
     *  is its own reason to sit here rather than under it. */
    fontSize: 16,
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
  /** 14px minimum, per Katya — a validation message that is smaller than the
   *  body copy around it is the one piece of text guaranteed to be read under
   *  pressure. Bold and red, and it says what to do rather than what went
   *  wrong. */
  error: {
    marginTop: 8,
    fontFamily: 'Archivo_700Bold',
    fontSize: 14,
    lineHeight: 19,
    color: palette.error,
  },
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

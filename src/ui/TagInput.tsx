/**
 * FREE-TEXT TAGS, as chips. Create step 3.
 *
 * The prototype faked this with a bank of five canned tags, because a static
 * HTML page has no keyboard. This is the real thing — and it is a reversal, so
 * read domain/tags.ts before changing anything: free text overturns D-brief
 * invariant 8 and settles Jack's open question 3 against his own suggestion.
 *
 * CHIPS, NOT ONE TEXT LINE. Space or comma commits what you have typed. That
 * is not a nicety: it is what makes the cap of five VISIBLE before it bites,
 * and deletion per-tag rather than per-sentence.
 *
 * THE COUNT IS ALWAYS ON, not only at the cap. "3 of 5" while there is room is
 * what stops "5 of 5" being a surprise.
 *
 * EVERY REFUSAL NAMES THE TAG. §5: reject with the offending tag named, don't
 * silently drop it — a tag that vanishes reads as a bug and gets retyped. The
 * message replaces the hint line rather than appearing under it, so the block
 * does not change height and push the chips around.
 *
 * NO AUTOCOMPLETE HERE, and if one is ever added it suggests from the user's
 * OWN history only. A global popular-tag list converges everybody's vocabulary
 * and is popularity-weighting by the back door — the one change that would
 * quietly ruin the product (invariant 7). `OWN_HISTORY_ONLY` in domain/tags.ts.
 *
 * The field's focus and error treatment is deliberately the same as the
 * onboarding handle field (app/onboarding/handle.tsx): ink border at the
 * committed weight for focus, `palette.error` for a refusal, and the browser's
 * own focus ring suppressed so there is never a second border inside ours.
 */

import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
import { Kick, Tiny } from './text';
import {
  MAX_TAGS,
  chipLabel,
  countLabel,
  rejectionMessage,
  type TagRejection,
} from '@/domain/tags';

/** See handle.tsx — `outlineStyle` is react-native-web only and not in the RN
 *  types, so the cast is the documented way to pass it. */
const NO_BROWSER_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as TextStyle;

export function TagInput({
  tags,
  draft,
  rejection,
  focused,
  onChangeDraft,
  onCommit,
  onRemove,
  onFocus,
  onBlur,
}: {
  tags: readonly string[];
  draft: string;
  rejection: TagRejection | null;
  focused: boolean;
  onChangeDraft: (v: string) => void;
  onCommit: () => void;
  onRemove: (tag: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const full = tags.length >= MAX_TAGS;

  return (
    <View>
      <View style={s.head}>
        <Kick tone="muted">your words</Kick>
        {/* The count, not the word "optional" — optionality is stated in the
            subhead, and this row's job is the cap. */}
        <Tiny color={full ? palette.ink : undefined} style={full ? s.countFull : undefined}>
          {countLabel(tags.length)}
        </Tiny>
      </View>

      <View style={[s.field, focused && s.fieldFocused, !!rejection && s.fieldError]}>
        <TextInput
          value={draft}
          onChangeText={onChangeDraft}
          onSubmitEditing={onCommit}
          /* Blur commits too. Tapping straight onto the CTA with a word still
             in the field would otherwise throw it away, which is the one thing
             a tag field must not do. */
          onBlur={() => {
            onCommit();
            onBlur();
          }}
          onFocus={onFocus}
          placeholder={full ? `That is ${MAX_TAGS} — remove one to add another` : 'wedding, cold field, second hand'}
          placeholderTextColor={palette.greyDecor}
          editable={!full}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          returnKeyType="done"
          blurOnSubmit={false}
          style={[s.input, NO_BROWSER_OUTLINE]}
          accessibilityLabel={`Add a tag. ${countLabel(tags.length)}.`}
        />
      </View>

      {/* One line, either the hint or the refusal — never both, so the block
          keeps its height and the chips below do not jump. */}
      {rejection ? (
        <Text style={s.error} accessibilityRole="alert">
          {rejectionMessage(rejection)}
        </Text>
      ) : (
        <Tiny style={{ marginTop: 8 }}>Space or comma adds it. Tap a tag to take it off.</Tiny>
      )}

      {tags.length ? (
        <View style={s.chips}>
          {tags.map((t) => (
            <Pressable
              key={t}
              onPress={() => onRemove(t)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${t}`}
              style={s.chip}
            >
              {/* The hash is presentation and lives only here — the stored
                  value never carries one (domain/tags.ts). */}
              <Text style={s.chipText}>{chipLabel(t)}</Text>
              <Text style={s.chipX}>×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  countFull: { fontFamily: 'Archivo_700Bold' },
  field: {
    marginTop: 8,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamRaised,
    paddingHorizontal: 13,
    height: 50,
    justifyContent: 'center',
  },
  fieldFocused: { borderWidth: border.mid, borderColor: palette.ink },
  fieldError: { borderWidth: border.mid, borderColor: palette.error },
  input: {
    fontFamily: 'Archivo_500Medium',
    /** 16px, same as the handle field: it is the threshold below which mobile
     *  Safari zooms the viewport on focus. */
    fontSize: 16,
    color: palette.ink,
    paddingVertical: 0,
  },
  /** 14px minimum and red, matching the handle field's validation — a
   *  message smaller than the body copy around it is the one piece of text
   *  guaranteed to be read under pressure. */
  error: {
    marginTop: 8,
    fontFamily: 'Archivo_700Bold',
    fontSize: 14,
    lineHeight: 19,
    color: palette.error,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: 12 },
  /** quintets.css's `.qt-tag`: a bare text mark, not a pill. User-authored
   *  words should not look like the app's own controls. */
  chip: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  chipText: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 12.5,
    lineHeight: 16,
    color: palette.link,
  },
  chipX: { fontFamily: 'Archivo_400Regular', fontSize: 13, color: palette.greyMute },
});

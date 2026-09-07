/**
 * THE SEARCH DRAWER — garment filtering, on the magazine.
 *
 * WHY A DRAWER AND NOT MORE CHIPS. Garment type is the functionally useful
 * axis: people browse the magazine to find PIECES, and a good black coat is a
 * good black coat wherever it turns up. But it has six values plus a text
 * field, and putting that on the rail would swamp a rail doing a different job
 * — the rail narrows by KIND, this narrows by CONTENTS.
 *
 * Chrome is `ui/Sheet.tsx`, shared with ConfirmSheet and the submission
 * drawer. This file is the payload.
 *
 * ══ WHAT IS DELIBERATELY NOT SEARCHABLE ══
 *
 * NOT TAGS. Free text does not aggregate — `wedding`, `weddingvibes` and
 * `bigday` are three strings — so tags make a poor index. Excluded by the
 * create brief §5, and the exclusion is enforced in `matchesQuery`, not here.
 *
 * NOT PEOPLE, NOT HANDLES. There is no social graph in this product, and
 * searching for a person is the one thing that would start building one. This
 * is the load-bearing one: it is a single line of code away at any time.
 *
 * ══ OR, NOT AND ══
 *
 * Selections WIDEN. At the ~125 DAU floor, `AND` across two categories is
 * reliably a handful of looks and an empty screen is a worse answer than a
 * broad one. The copy says so out loud, because a multi-select that widens is
 * the opposite of what most filter UIs do.
 */

import { Platform, StyleSheet, TextInput, View, type TextStyle } from 'react-native';
import { Sheet } from './Sheet';
import { Big, Body, Kick, Tiny } from './text';
import { Button, Chip } from './controls';
import { palette, border, radius } from './../theme/tokens';
import { CATEGORIES, type Category } from '@/domain/garments';

/** The browser draws its own focus ring inside the input on web, which lands a
 *  second border inside ours. Same treatment as the handle field — see
 *  onboarding/handle.tsx for the full note. */
const NO_BROWSER_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as TextStyle;

export function SearchSheet({
  visible,
  categories,
  query,
  matchCount,
  onToggleCategory,
  onChangeQuery,
  onClear,
  onDismiss,
}: {
  visible: boolean;
  categories: readonly Category[];
  query: string;
  /** How many looks the current selection matches. Shown so the widening move
   *  is obvious BEFORE the drawer closes — a filter that turns out to match
   *  two looks is better known about here than discovered on the feed. */
  matchCount: number;
  onToggleCategory: (c: Category) => void;
  onChangeQuery: (q: string) => void;
  onClear: () => void;
  onDismiss: () => void;
}) {
  const active = categories.length > 0 || query.trim().length > 0;

  return (
    <Sheet visible={visible} onDismiss={onDismiss} dismissLabel="Close search">
      <Kick tone="muted">find a piece</Kick>
      <Big size={22} style={{ marginTop: 8 }}>
        What are you after?
      </Big>

      <View style={s.field}>
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="wool coat, loafer…"
          placeholderTextColor={palette.greyDecor}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          returnKeyType="search"
          style={[s.input, NO_BROWSER_OUTLINE]}
          accessibilityLabel="Search garment names"
        />
      </View>
      {/* Says what it searches, because what it does NOT search is the
          surprising part — someone typing a handle or a tag should find out
          here rather than concluding the feed is broken. */}
      <Tiny style={{ marginTop: 7 }}>Garment names only. Not tags, not people.</Tiny>

      <Kick tone="muted" style={{ marginTop: 20 }}>
        or by type
      </Kick>
      <View style={s.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            tone={categories.includes(c) ? 'on' : 'default'}
            onPress={() => onToggleCategory(c)}
          />
        ))}
      </View>
      <Tiny style={{ marginTop: 8 }}>Pick as many as you like — they widen the search.</Tiny>

      {/* Honest about a thin result rather than padding it. */}
      {active ? (
        <Body style={{ marginTop: 16 }}>
          {matchCount === 0
            ? 'Nothing matches that yet.'
            : `${matchCount} ${matchCount === 1 ? 'look' : 'looks'} match.`}
        </Body>
      ) : null}

      <Button
        label={active ? 'Show them' : 'Close'}
        style={{ marginTop: 14 }}
        onPress={onDismiss}
      />
      {active ? (
        <Button label="Clear" variant="ghost" style={{ marginTop: 8 }} onPress={onClear} />
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  field: {
    marginTop: 14,
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamRaised,
    paddingHorizontal: 13,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Archivo_500Medium',
    /** 16px — below it mobile Safari zooms the viewport on focus. Same reason
     *  the handle field sits here. */
    fontSize: 16,
    color: palette.ink,
    paddingVertical: 0,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
});

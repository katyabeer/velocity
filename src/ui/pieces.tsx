/**
 * Garment tiles, the slot strip, the builder grid, and the flat lay.
 *
 * THE BUILDER OFFERS WHAT YOU ACTUALLY OWN. On days 1 and 2 the grid is
 * generated from your inventory — which on day one is the capsule you chose —
 * rather than a fixed list. Picking *Street and sport* at signup means the
 * builder offers a parka and a hoodie, not a wool coat.
 *
 * FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE, and PERFORMANCE HISTORY NEVER
 * APPEARS HERE. Neither of those is an oversight — see domain/entry.ts.
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, space } from '@/theme/tokens';
import type { Slot } from '@/domain/garments';

/** `.pc` — the small square tile used in the slot strip and the sheet grid. */
export function PieceTile({
  name,
  state = 'default',
  onPress,
  isLoan,
}: {
  name: string;
  state?: 'default' | 'held' | 'empty' | 'unavailable';
  onPress?: () => void;
  isLoan?: boolean;
}) {
  return (
    <Pressable
      onPress={state === 'unavailable' ? undefined : onPress}
      accessibilityRole="button"
      style={[
        s.tile,
        state === 'held' && s.tileHeld,
        state === 'unavailable' && { opacity: 0.4 },
        isLoan && s.tileLoan,
      ]}
    >
      {isLoan ? <Text style={s.loanFlag}>NEW</Text> : null}
      {state === 'held' ? <Text style={s.tick}>✓</Text> : null}
      <Text style={[s.tileLabel, state === 'empty' && { color: palette.faint }]}>{name}</Text>
    </Pressable>
  );
}

/**
 * The slot strip — five slots, one piece each, Outer through Extra.
 * Tap a filled slot to put it back.
 */
export function SlotStrip({
  slots,
  onClear,
}: {
  slots: readonly { slot: Slot; name?: string; isLoan?: boolean }[];
  onClear: (slot: Slot) => void;
}) {
  return (
    <View style={s.strip}>
      {slots.map((sl) => (
        <View key={sl.slot} style={{ flex: 1 }}>
          {sl.name ? (
            <PieceTile
              name={sl.name}
              state="held"
              isLoan={sl.isLoan}
              onPress={() => onClear(sl.slot)}
            />
          ) : (
            <PieceTile name={sl.slot} state="empty" />
          )}
        </View>
      ))}
    </View>
  );
}

/** `.grid3 .cellph` — the three-across garment grid the builder picks from. */
export function GarmentGrid({
  items,
  onPress,
  style,
}: {
  items: readonly { name: string; selected?: boolean; dimmed?: boolean }[];
  onPress: (name: string) => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[s.grid, style]}>
      {items.map((it) => (
        <Pressable
          key={it.name}
          onPress={() => onPress(it.name)}
          accessibilityRole="button"
          accessibilityState={{ selected: !!it.selected }}
          style={[s.cell, it.selected && s.cellSelected, it.dimmed && { opacity: 0.4 }]}
        >
          <Text style={s.cellLabel}>{it.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * The flat lay — the pieces laid out, no body, no fit.
 *
 * NOT A FALLBACK. It is the unrendered state, and it is also the position that
 * brief §10.7 and resolution §13.4 both hold: no bodies, no fit, with art
 * direction as the defensible claim. Jack's open question 2 is whether the model
 * render reopens that.
 */
export function FlatLay({
  pieces,
  height = 210,
  caption = 'Combination · not rendered',
}: {
  pieces: readonly string[];
  height?: number;
  caption?: string;
}) {
  return (
    <View style={[s.stage, { height }]}>
      <View style={s.flat}>
        {pieces.map((p) => (
          <View key={p} style={s.flatCell}>
            <Text style={s.flatLabel}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={s.stageCaption}>
        <Text style={s.stageCaptionText}>{caption}</Text>
      </View>
    </View>
  );
}

/** A wardrobe inventory tile, with history. Only ever shown in the wardrobe and
 *  on the result screen — never in the builder. */
export function InventoryTile({
  name,
  history,
  provenance,
  isNew,
  onPress,
  onDrop,
}: {
  name: string;
  history: string;
  provenance: string;
  isNew?: boolean;
  onPress?: () => void;
  onDrop?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.invTile, isNew && { borderColor: palette.klein }]}>
      <View style={s.invThumb}>
        <Text style={s.invThumbLabel}>{name.split(' ')[0]}</Text>
      </View>
      <View style={[s.invMeta, isNew && { backgroundColor: palette.kleinTint }]}>
        <Text style={s.invName}>{name}</Text>
        <Text style={s.invHistory}>{history}</Text>
        <View style={s.invFoot}>
          <Text style={s.invProvenance}>{isNew ? 'new today' : provenance}</Text>
          {onDrop ? (
            <Text onPress={onDrop} style={s.dropBtn} accessibilityRole="button">
              drop
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: {
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
    height: 82,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  tileHeld: { backgroundColor: palette.kleinTint, borderColor: palette.klein },
  tileLoan: { borderColor: palette.shock, backgroundColor: palette.shockTint },
  tick: {
    position: 'absolute',
    top: 5,
    right: 6,
    color: palette.klein,
    fontFamily: 'Archivo_700Bold',
    fontSize: 11,
  },
  loanFlag: {
    position: 'absolute',
    top: 5,
    left: 5,
    color: palette.shock,
    fontFamily: 'Archivo_700Bold',
    fontSize: 7,
    letterSpacing: 0.6,
  },
  tileLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 0.48,
    textTransform: 'uppercase',
    color: palette.soft,
    textAlign: 'center',
  },
  strip: { flexDirection: 'row', gap: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: {
    width: '31.5%',
    height: 100,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
    justifyContent: 'flex-end',
    padding: 6,
  },
  cellSelected: {
    borderWidth: 2.5,
    borderColor: palette.klein,
    backgroundColor: palette.kleinTint,
  },
  cellLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8,
    lineHeight: 9.2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  stage: {
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
    overflow: 'hidden',
  },
  flat: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: 12 },
  flatCell: {
    width: '31%',
    height: 74,
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    justifyContent: 'flex-end',
    padding: 6,
  },
  flatLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 7.5,
    lineHeight: 8.3,
    letterSpacing: 0.38,
    textTransform: 'uppercase',
    color: palette.soft,
  },
  stageCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.paper,
    borderTopWidth: border.hair,
    borderTopColor: palette.line,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stageCaptionText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 7.5,
    lineHeight: 10,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.disabledInk,
  },
  invTile: {
    width: '31.5%',
    borderWidth: border.hair,
    borderColor: palette.line,
    backgroundColor: palette.fill,
  },
  invThumb: { height: 62, alignItems: 'center', justifyContent: 'center' },
  invThumbLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 19,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  invMeta: {
    backgroundColor: palette.paper,
    borderTopWidth: border.hair,
    borderTopColor: palette.line,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  invName: { fontFamily: 'Archivo_600SemiBold', fontSize: 9, lineHeight: 11, color: palette.ink },
  invHistory: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 8,
    lineHeight: 10.4,
    color: palette.faint,
    marginTop: 3,
  },
  invFoot: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invProvenance: { fontFamily: 'Archivo_400Regular', fontSize: 8, color: palette.faint },
  dropBtn: {
    borderWidth: border.hair,
    borderColor: palette.shock,
    color: palette.shock,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontFamily: 'Archivo_700Bold',
    fontSize: 7,
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
});

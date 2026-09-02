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

import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
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
      <Text style={[s.tileLabel, state === 'empty' && { color: palette.greyMute }]}>{name}</Text>
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

/**
 * A wardrobe inventory tile. Only ever shown in the wardrobe and on the
 * result screen — never in the builder.
 *
 * `history` is optional and Pieces-view no longer passes it — the Saved
 * view still does, for its starred-status caption ("yours now" / "★ saved
 * · costs a token"), which is unrelated to worn-history despite sharing the
 * prop. `image` is optional too, real photos only for the Day 1 review
 * pieces so far (see INVENTORY_DAY_ONE_REVIEW) — everything else falls back
 * to the text placeholder, same as before.
 */
export function InventoryTile({
  name,
  history,
  provenance,
  isNew,
  image,
  onPress,
  onDrop,
}: {
  name: string;
  history?: string;
  provenance: string;
  isNew?: boolean;
  image?: ImageSourcePropType;
  onPress?: () => void;
  onDrop?: () => void;
}) {
  return (
    <View style={s.invWrap}>
      <Pressable onPress={onPress} style={s.invCard}>
        <View style={s.invPhoto}>
          {image ? (
            <Image source={image} style={s.invImage} resizeMode="contain" />
          ) : (
            <View style={s.invThumb}>
              <Text style={s.invThumbLabel}>{name.split(' ')[0]}</Text>
            </View>
          )}
          {isNew ? (
            <View style={s.newBadge}>
              <Text style={s.newBadgeLabel}>New</Text>
            </View>
          ) : null}
        </View>
        <View style={s.invMeta}>
          <Text style={s.invName}>{name}</Text>
          {history ? <Text style={s.invHistory}>{history}</Text> : null}
          <Text style={s.invProvenance}>{provenance}</Text>
        </View>
      </Pressable>
      {onDrop ? (
        <Pressable
          onPress={onDrop}
          style={s.dropCircle}
          accessibilityRole="button"
          accessibilityLabel="Drop"
        >
          <Text style={s.dropCircleLabel}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  tile: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    height: 82,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  tileHeld: { backgroundColor: palette.accent, borderColor: palette.accentEdge },
  /** No alert hue survives the v3 collapse — ink border on the sunk ground
   *  is the only distinction left for "on loan". */
  tileLoan: { borderColor: palette.ink, backgroundColor: palette.creamSunk },
  tick: {
    position: 'absolute',
    top: 5,
    right: 6,
    /** Sits on the accent-filled tile — text-on-accent is ink, not link. */
    color: palette.ink,
    fontFamily: 'Archivo_700Bold',
    fontSize: 11,
  },
  loanFlag: {
    position: 'absolute',
    top: 5,
    left: 5,
    color: palette.ink,
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
    color: palette.grey,
    textAlign: 'center',
  },
  strip: { flexDirection: 'row', gap: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: {
    width: '31.5%',
    height: 100,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    justifyContent: 'flex-end',
    padding: 6,
  },
  /** quintets.css's dedicated selected-state token: a 4px ink border, no
   *  color pairing (see tokens.ts border.sel / flag 7 in the migration plan). */
  cellSelected: {
    borderWidth: border.sel,
    borderColor: palette.ink,
  },
  cellLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8,
    lineHeight: 9.2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  stage: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  flat: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: 12 },
  flatCell: {
    width: '31%',
    height: 74,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.cream,
    justifyContent: 'flex-end',
    padding: 6,
  },
  flatLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 7.5,
    lineHeight: 8.3,
    letterSpacing: 0.38,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  stageCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.cream,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
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
  /** Plain, unclipped wrapper so the drop circle can overlap invCard's
   *  rounded corner without being cut off by its overflow: hidden. */
  invWrap: { width: '31.5%', position: 'relative' },
  /** The LookPlate treatment (src/ui/LookPlate.tsx `s.plate`) — one
   *  continuous rounded card, image and caption both inside it. */
  invCard: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  invPhoto: {
    height: 96,
    backgroundColor: palette.creamSunk,
  },
  invImage: { width: '100%', height: '100%' },
  invThumb: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  invThumbLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 19,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  /** Non-interactive, decorative tilt — matches the app's existing
   *  static-rotation convention on feed/pair imagery (tokens.ts rotation.r2). */
  newBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    transform: [{ rotate: '-3deg' }],
  },
  newBadgeLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8,
    lineHeight: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  invMeta: {
    backgroundColor: palette.cream,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  invName: { fontFamily: 'Archivo_600SemiBold', fontSize: 9, lineHeight: 11, color: palette.ink },
  invHistory: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 8,
    lineHeight: 10.4,
    color: palette.greyMute,
    marginTop: 3,
  },
  invProvenance: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 8,
    color: palette.greyMute,
    marginTop: 3,
  },
  /** No circular icon-button existed anywhere in the app before this — see
   *  the plan's flag on it being a new pattern, not a reused one. Sits on
   *  invWrap (unclipped), overlapping invCard's rounded top-right corner. */
  dropCircle: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: border.mid,
    borderColor: palette.ink,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropCircleLabel: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 13,
    lineHeight: 13,
    color: palette.ink,
  },
});

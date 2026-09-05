/**
 * Garment tiles, the slot strip, the builder grid, and the wardrobe tile.
 *
 * The flat lay used to live here as a labelled grid. It is now a real composed
 * plate on the delivery's own template — see ui/ComposedFlatLay.tsx.
 *
 * WHAT THE BUILDER OFFERS, AND WHEN. On the FIRST run it offers the whole
 * catalogue — that is the day-one wardrobe fix (Katya, 3 Sep): you build from
 * everything, and the look you enter becomes the wardrobe. On every later day
 * it offers what you actually own, plus the two loaners, exactly as before.
 * Established keeps its fixed twelve.
 *
 * FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE, and PERFORMANCE HISTORY NEVER
 * APPEARS HERE. Neither of those is an oversight — see domain/entry.ts.
 */

import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { palette, border, radius, space } from '@/theme/tokens';
import type { Slot } from '@/domain/garments';

/** `.pc` — the small square tile used in the slot strip and the sheet grid.
 *  `image` is the real cutout when the catalogue has one; without it the tile
 *  falls back to its name, exactly as the whole app did before the AW26
 *  delivery landed. */
export function PieceTile({
  name,
  state = 'default',
  onPress,
  isLoan,
  image,
}: {
  name: string;
  state?: 'default' | 'held' | 'empty' | 'unavailable';
  onPress?: () => void;
  isLoan?: boolean;
  image?: ImageSourcePropType;
}) {
  return (
    <Pressable
      onPress={state === 'unavailable' ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={state === 'empty' ? `${name} — empty` : name}
      style={[
        s.tile,
        state === 'held' && s.tileHeld,
        state === 'unavailable' && { opacity: 0.4 },
        isLoan && s.tileLoan,
      ]}
    >
      {image ? <Image source={image} style={s.tileImage} resizeMode="contain" /> : null}
      {isLoan ? <Text style={s.loanFlag}>NEW</Text> : null}
      {state === 'held' ? <Text style={s.tick}>✓</Text> : null}
      {image ? null : (
        <Text style={[s.tileLabel, state === 'empty' && { color: palette.greyMute }]}>{name}</Text>
      )}
    </Pressable>
  );
}

/**
 * The slot strip — SIX cells now, because Extra holds two (see STRIP_SLOTS in
 * domain/entry.ts). Tap a filled cell to put that piece back.
 *
 * KEYED BY INDEX, NOT BY SLOT: two cells are both called 'Extra', so a
 * slot-name key would collide and React would reuse the wrong cell. And clearing
 * is BY NAME, not by slot — clearing 'Extra' would take out both accessories
 * when the user tapped one.
 */
export function SlotStrip({
  slots,
  onClear,
}: {
  slots: readonly { slot: Slot; name?: string; isLoan?: boolean; image?: ImageSourcePropType }[];
  onClear: (name: string) => void;
}) {
  return (
    <View style={s.strip}>
      {slots.map((sl, i) => (
        <View key={`${sl.slot}-${i}`} style={{ flex: 1 }}>
          {sl.name ? (
            <PieceTile
              name={sl.name}
              state="held"
              isLoan={sl.isLoan}
              image={sl.image}
              onPress={() => onClear(sl.name!)}
            />
          ) : (
            <PieceTile name={sl.slot} state="empty" />
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * `.grid3 .cellph` — the three-across garment grid the builder picks from.
 *
 * FILTERS ARE BY GARMENT TYPE AND NOTHING ELSE, and PERFORMANCE HISTORY NEVER
 * APPEARS HERE. Neither is an oversight — see domain/entry.ts. The cell shows a
 * photo and a name, and that is the whole of what it is allowed to tell you.
 */
export function GarmentGrid({
  items,
  onPress,
  style,
}: {
  items: readonly {
    name: string;
    selected?: boolean;
    dimmed?: boolean;
    image?: ImageSourcePropType;
  }[];
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
          accessibilityLabel={it.name}
          accessibilityState={{ selected: !!it.selected }}
          style={[s.cell, it.selected && s.cellSelected, it.dimmed && { opacity: 0.4 }]}
        >
          <View style={s.cellPhoto}>
            {it.image ? (
              <Image source={it.image} style={s.cellImage} resizeMode="contain" />
            ) : (
              <Text style={s.cellPlaceholder}>{it.name.split(' ')[0]}</Text>
            )}
            {it.selected ? (
              <View style={s.cellTick}>
                <Text style={s.cellTickMark}>✓</Text>
              </View>
            ) : null}
          </View>
          {/* Fixed-height box, not just numberOfLines: react-native-web's
              line clamp still lets a third line spill, and one taller cell
              makes the whole row uneven. Two lines' worth, always. */}
          <View style={s.cellLabelBox}>
            <Text style={s.cellLabel} numberOfLines={2}>
              {it.name}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * A wardrobe inventory tile. Only ever shown in the wardrobe and on the
 * result screen — never in the builder.
 *
 * NO PROVENANCE LINE (Katya, 3 Sep). The tile used to carry a third line
 * saying how the piece arrived — 'starter' / 'taken' / 'piece-brief'. It is
 * gone from every card: it is the kind of metadata that reads as a status when
 * it is only a footnote, and at three lines of caption the grid stopped being
 * a picture of clothes. `Provenance` still exists on the data (state/wardrobe
 * sets it, and the result screen may want it back) — it is only unrendered.
 *
 * `history` is optional and Pieces-view does not pass it — the Saved view
 * still does, for its starred-status caption ("yours now" / "★ saved · costs
 * a token"), which is a live status rather than an origin, and is the reason
 * that prop survived and provenance did not. `image` is optional too:
 * anything in the AW26 catalogue carries its cutout (state/wardrobe.ts
 * attaches it on the way in), and the legacy fixture names for Days 2 and 3
 * fall back to the text placeholder.
 */
export function InventoryTile({
  name,
  history,
  isNew,
  image,
  onPress,
  onDrop,
}: {
  name: string;
  history?: string;
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
          {/* Clamped to two lines in a fixed-height box, same reason as the
              builder grid: a flex-wrap grid with uneven card heights reads as
              broken, and react-native-web's line clamp alone still spills. */}
          <View style={s.invNameBox}>
            <Text style={s.invName} numberOfLines={2}>
              {name}
            </Text>
          </View>
          {history ? <Text style={s.invHistory}>{history}</Text> : null}
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
    height: 68,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 3,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  /** Fills the tile when there's a cutout — the name is redundant next to a
   *  photograph of the thing, and at six cells wide there is no room for it. */
  tileImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
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
  /** Six cells now, so they are narrower — the strip stays one row rather
   *  than wrapping, which is what makes it readable as "your look" at a
   *  glance. */
  strip: { flexDirection: 'row', gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: {
    /** TWO ACROSS (Katya, 4 Sep). It was three, at 31.5%. The wardrobe made
     *  the same move on 3 Sep for the same reason — a third of the width holds
     *  about thirteen characters, so the longer AW26 names truncated, and the
     *  photograph got a third of a phone to be legible in. Two across doubles
     *  the area of every cutout, which is the thing the screen exists to show. */
    width: '48.5%',
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.sm,
    backgroundColor: palette.creamRaised,
    overflow: 'hidden',
  },
  /** quintets.css's dedicated selected-state token: a 4px ink border, no
   *  color pairing (see tokens.ts border.sel / flag 7 in the migration plan).
   *  The 4px eats into the cell rather than growing it, so a selected tile
   *  does not shove the grid around — `overflow: hidden` above plus the
   *  fixed photo height keep the row heights equal. */
  cellSelected: {
    borderWidth: border.sel,
    borderColor: palette.ink,
  },
  cellPhoto: {
    height: 94,
    backgroundColor: palette.creamSunk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellImage: { width: '100%', height: '100%' },
  cellPlaceholder: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 17,
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.15)',
  },
  cellTick: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTickMark: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 10,
    lineHeight: 12,
    color: palette.ink,
  },
  cellLabelBox: {
    /** 2 x 9.6 line-height plus the padding below. Clipped, so a long name
     *  truncates rather than growing the cell. */
    height: 32,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingTop: 6,
    backgroundColor: palette.cream,
  },
  cellLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 8,
    lineHeight: 9.6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palette.grey,
  },
  /** TWO ACROSS, not three (3 Sep). Three-across is the builder's density and
   *  it works there because the label is 8px. At the wardrobe's 14px name a
   *  third of the width holds about 13 characters a line, so "belted double
   *  breasted overcoat" truncated to "belted double..." — the name was made
   *  bigger in order to be read, and then couldn't be. Two across holds
   *  ~19 characters a line, which fits every name in the AW26 catalogue in two
   *  lines, and gives the photograph room besides.
   *
   *  ⚠ The trade is density: Established's 96-piece wardrobe is now 48 rows
   *  rather than 32. Worth a look on that day specifically.
   *
   *  Plain, unclipped wrapper so the drop circle can overlap invCard's
   *  rounded corner without being cut off by its overflow: hidden. */
  invWrap: { width: '48.5%', position: 'relative' },
  /** The LookPlate treatment (src/ui/LookPlate.tsx `s.plate`) — one
   *  continuous rounded card, image and caption both inside it. */
  invCard: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  invPhoto: {
    /** Taller with the wider tile, so the card stays a picture of a garment
     *  rather than a letterbox with a caption. */
    height: 150,
    backgroundColor: palette.creamSunk,
  },
  invImage: { width: '100%', height: '100%' },
  invThumb: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  invThumbLabel: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 26,
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
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 9,
  },
  /** Two lines of 14/17, clipped. ⚠ At three tiles across (~90pt of text
   *  width) 14px fits about 13 characters a line, so the longest AW26 names
   *  ("belted double breasted overcoat") truncate. If every name has to read
   *  in full, the fix is two tiles across, not a smaller size — say which. */
  invNameBox: { height: 34, overflow: 'hidden' },
  /** 14px (Katya, 3 Sep), up from 9. These are the names of clothes in the
   *  wardrobe — the one place in the app where reading them matters, rather
   *  than the builder's grid where the photograph does the work. Two lines of
   *  14/17 is why the provenance line had to go: three captions under a 96pt
   *  photo made the tile all text. */
  invName: { fontFamily: 'Archivo_600SemiBold', fontSize: 14, lineHeight: 17, color: palette.ink },
  invHistory: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 10,
    lineHeight: 13,
    color: palette.greyMute,
    marginTop: 4,
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

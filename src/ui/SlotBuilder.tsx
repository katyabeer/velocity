/**
 * THE BUILDER, REBUILT AROUND THE SLOTS (Katya, 7 Sep).
 *
 * "Instead of listing all the items per category, we focus on the look slots."
 *
 * ─── WHAT CHANGED, AND WHY IT IS A BETTER SHAPE ────────────────────────────
 *
 * It used to be a long scrolling grid of every garment in the pool, with
 * category chips over it and a six-cell strip pinned above showing what you
 * had picked. So the SLOTS — the thing you are actually filling — were a
 * read-out, and the CATALOGUE was the screen. That is backwards for a job
 * whose whole task is "answer this brief in up to six pieces": the empty slot
 * is the question, and it was the smallest thing on the page.
 *
 * Now the six slots ARE the screen, in a 3×2 grid, and the catalogue is what a
 * slot opens. One tap on `Shoes` and you see the shoes — which is the same
 * filter the chips did, except you cannot get it wrong and there is no state
 * to read back.
 *
 * ⚠ INVARIANT 15 IS UNTOUCHED, and worth checking against because this looks
 * like a filter change. "Builder filters are by garment type and nothing
 * else." A slot IS a garment type (`slotOf` derives it from the name), so this
 * is the same axis, arrived at by tapping the thing you want to fill rather
 * than by choosing a chip. Nothing here sorts by what "goes with" the brief —
 * deciding that is still the skill being tested.
 *
 * ─── THE SIXTH CELL IS THE SECOND `Extra` ──────────────────────────────────
 * `STRIP_SLOTS` is Outer · Top · Bottom · Shoes · Extra · Extra, because Extra
 * is the one slot that holds two (invariant 3). So the grid is exactly six
 * cells with no arithmetic, and two of them carry the same label. Cells are
 * POSITIONAL: key on the index, never on the slot name, or React reuses the
 * wrong cell — the same trap `SlotStrip` carried.
 *
 * ─── HOW A PIECE COMES OUT AGAIN ───────────────────────────────────────────
 * It used to be "tap a filled slot to put it back". Tapping a filled slot now
 * opens the picker, so removal moved INTO the picker as its own control. That
 * is a deliberate trade: the old gesture was faster but undiscoverable, and it
 * also meant the same tap did two different things depending on state.
 */

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { Sheet } from './Sheet';
import { GarmentGrid } from './pieces';
import { Button } from './controls';
import { Kick } from './text';
import { PlusIcon } from './TabIcon';
import { palette, border, radius } from '@/theme/tokens';
import { type as T } from '@/theme/type';
import type { Slot } from '@/domain/garments';

export type SlotCellData = {
  slot: Slot;
  /** The piece in it, if any. */
  name?: string;
  image?: ImageSourcePropType;
  /** A loaner rather than something you own — flagged, per handover §5. */
  isLoan?: boolean;
};

/* ══════════════════════════════════════════════════════════════════════════
   THE GRID
   ══════════════════════════════════════════════════════════════════════════ */

export function SlotGrid({
  cells,
  onOpen,
}: {
  cells: readonly SlotCellData[];
  /** The cell's INDEX, not its slot — two cells are both `Extra`. */
  onOpen: (index: number) => void;
}) {
  return (
    <View style={s.grid}>
      {cells.map((c, i) => (
        <Pressable
          key={`${c.slot}-${i}`}
          onPress={() => onOpen(i)}
          accessibilityRole="button"
          accessibilityLabel={c.name ? `${c.slot}: ${c.name}. Change it` : `Add ${c.slot.toLowerCase()}`}
          style={[s.cell, c.name ? s.cellFull : s.cellEmpty]}
        >
          {c.name ? (
            <>
              <View style={s.photo}>
                {c.image ? (
                  <Image source={c.image} style={s.photoImg} resizeMode="contain" />
                ) : (
                  /* Legacy fixture names carry no cutout — see
                     data/inventory.ts. The name is the fallback, not a bug. */
                  <Text style={s.fallback} numberOfLines={2}>
                    {c.name}
                  </Text>
                )}
                {c.isLoan ? <Text style={s.loan}>NEW</Text> : null}
              </View>
              <Text style={s.name} numberOfLines={2}>
                {c.name}
              </Text>
            </>
          ) : (
            /* STACKED, and the plus does the work (Katya: "it needs to be very
               clear that a slot is clickable and empty and needs filling").
               Dashed ground plus a mark plus a verb — three signals, because
               an empty cell that only carries its own noun reads as a caption
               on a hole. */
            <View style={s.addWrap}>
              <PlusIcon size={20} color={palette.grey} weight={2.2} />
              <Text style={s.add}>{c.slot}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PICKER
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Everything in one slot's category, in a drawer.
 *
 * ONE PENDING SELECTION, CONFIRMED OR ABANDONED. The picker does not touch the
 * look until Confirm — which is what makes Cancel mean something, and what
 * lets the same drawer serve an empty slot and a filled one with no mode
 * switch. The caller owns the pending value so this component stays dumb about
 * what a "look" is.
 *
 * IT SCROLLS, AND IT HAS TO. `Sheet` sizes itself to its content with no cap,
 * so a slot holding twenty shoes would push the drawer off the top of the
 * screen. The cap is a fraction of the window rather than a fixed number
 * because the drawer has to sit inside whatever device it is on, and the
 * scrolling child carries `flexShrink` — see the flex note in ui/layout.tsx
 * for the class of bug this avoids.
 */
export function PiecePicker({
  visible,
  slot,
  items,
  /** The name currently pending. `null` means the slot will be left empty. */
  pending,
  onSelect,
  onConfirm,
  onRemove,
  onCancel,
}: {
  visible: boolean;
  slot: Slot | null;
  items: readonly { name: string; image?: ImageSourcePropType; isLoan?: boolean }[];
  pending: string | null;
  onSelect: (name: string) => void;
  onConfirm: () => void;
  /** Only passed when the slot already holds something. */
  onRemove?: () => void;
  onCancel: () => void;
}) {
  const { height } = useWindowDimensions();

  return (
    <Sheet
      visible={visible}
      onDismiss={onCancel}
      dismissLabel="Cancel"
      style={{ maxHeight: height * 0.78 }}
    >
      <Kick tone="muted">{slot ? `choose ${slot.toLowerCase()}` : 'choose a piece'}</Kick>

      <ScrollView
        style={s.pickScroll}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {items.length ? (
          <GarmentGrid
            items={items.map((it) => ({
              name: it.name,
              image: it.image,
              selected: it.name === pending,
            }))}
            /* Tapping the pending piece again clears it, so the drawer can
               empty a slot as well as fill one without a second control doing
               the same job. `onRemove` below is the discoverable route; this
               is the fast one. */
            onPress={(n) => onSelect(n)}
          />
        ) : (
          /* An honest empty: on day 1 the pool is the whole catalogue, so this
             only happens once a wardrobe is thin in one category. */
          <Text style={s.none}>Nothing in your wardrobe for this slot yet.</Text>
        )}
      </ScrollView>

      {/* THREE LABELS FOR ONE BUTTON, and each is what the tap actually does.
          `onRemove` is only passed for a filled slot, so it doubles as "was
          there something in here?" — which is what separates "leave it empty"
          (clears a piece) from "cancel" (changes nothing). A button that says
          `Leave it empty` on a slot that is already empty is offering to do
          nothing, which is worse than saying so. */}
      <Button
        label={pending ? 'Confirm' : onRemove ? 'Leave it empty' : 'Cancel'}
        style={{ marginTop: 12 }}
        onPress={pending || onRemove ? onConfirm : onCancel}
      />
      {onRemove ? (
        <Button
          label="Take it out"
          variant="ghost"
          style={{ marginTop: 8 }}
          onPress={onRemove}
        />
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  /* ── grid ── */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  /** Three across: `(100% - two gaps) / 3`, expressed as a percentage so it
   *  holds on any width. 31.5 leaves the 8pt gaps their room. */
  cell: {
    width: '31.5%',
    aspectRatio: 0.82,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    overflow: 'hidden',
  },
  cellFull: {
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
  },
  /** Dashed and transparent — the app's "nothing here yet" ground, same as
   *  onboarding's slot grid.
   *  ⚠ Android draws `borderStyle: 'dashed'` as solid when a radius is
   *  present. It degrades to a plain outline, which still reads as empty
   *  beside the filled cells. */
  cellEmpty: {
    borderWidth: border.mid,
    borderStyle: 'dashed',
    borderColor: palette.greyDecor,
  },
  photo: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  photoImg: { width: '100%', height: '100%' },
  fallback: { ...T.tiny, textAlign: 'center', color: palette.greyMute },
  name: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 9.5,
    lineHeight: 11.5,
    textAlign: 'center',
    color: palette.ink,
    marginTop: 4,
  },
  loan: {
    position: 'absolute',
    top: 0,
    right: 0,
    ...T.micro,
    fontSize: 7.5,
    color: palette.ink,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.xs,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  addWrap: { alignItems: 'center', gap: 5 },
  add: { ...T.micro, color: palette.grey },

  /* ── picker ── */
  /** `flexShrink` is what keeps the drawer inside its own maxHeight; without
   *  it the ScrollView takes its content's full height and the cap does
   *  nothing. */
  pickScroll: { flexShrink: 1 },
  none: { ...T.body, color: palette.grey, paddingVertical: 8 },
});

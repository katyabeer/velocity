/**
 * The composed flat lay — the real cutouts, laid out on the delivery's own
 * template. This is what the preview screen shows before you enter, and what
 * the finished entry shows afterwards.
 *
 * NOT A FALLBACK. R-L6: a failed generation still enters the pool as a composed
 * flat lay, so this had to exist as a first-class presentation regardless. It is
 * also the position brief §10.7 and resolution §13.4 both hold — no bodies, no
 * fit, art direction as the defensible claim. `RenderStage`'s figure is the
 * other position, still live (Jack's open question 2).
 *
 * NO CAPTION BY DEFAULT (Katya, 3 Sep). The plate used to carry a mono
 * "FLAT LAY · NO BODY, NO FIT" bar across its foot on every appearance. It is
 * off unless a call site asks for one — the plate is a picture of clothes, and
 * a caption stating what it isn't was the loudest thing on it.
 *
 * ⚠ That line was doing one real job: "no body, no fit" is the app's stated
 * art-direction position (brief §10.7, resolution §13.4), and it is now
 * unstated in the UI. `today/entered.tsx` still labels the presentation in its
 * header toggle ("Flat lay" / "On a model"), which is the only place it is
 * still said. Katya — flag if the claim needs to be visible somewhere.
 *
 * ─── THE GEOMETRY IS NOT INVENTED ───────────────────────────────────────────
 * Boxes, canvas and the two templates are copied verbatim from the AW26
 * delivery README (`velocity-aw26-assets/README.txt`), in its own units: a
 * 1200x1600 canvas, each box `(x, y, w, h)`, contain-fit per box, extras split
 * horizontally when there is more than one. Everything here is expressed as a
 * percentage of that canvas, so the layout is resolution-independent and the
 * numbers stay comparable to the sheet.
 *
 * ─── THE CUTOUTS ARE CROPPED TO THEIR CONTENT (4 Sep) ──────────────────────
 * They were not. The delivery's tiles are 1000x1000 (resized here to 512) with
 * the garment floating in a large transparent margin — measured, the peplum
 * knit top occupied 15% of its frame, the clutch 22%, a knee boot 26%. Since a
 * box here contain-fits a SQUARE, five-sixths of what got laid out was air, and
 * the plate read as four small things adrift in a lot of paper.
 *
 * Every file in assets/garments is now cropped to its alpha bounding box plus
 * a 3% margin, so a garment's pixels are the garment. They are no longer
 * square, which is fine and in fact better: `contain` inside a square box means
 * `flatlay_scale` now sizes the garment's LONGEST side rather than the side of
 * a mostly-empty frame.
 *
 * Re-croppable from the delivery at any time; nothing here depends on the old
 * dimensions.
 *
 * ─── flatlay_scale, AND THE ONE JUDGEMENT CALL IN THIS FILE ─────────────────
 * The sheet calls `flatlay_scale` a REQUIRED multiplier: it is what puts true
 * relative scale back, 1.0 being a full-length coat and 0.104 a pump heel.
 *
 * Applied literally against the f=1.0 anchor (the 700-unit outerwear box), a
 * pair of sunglasses at 0.052 lands at 36 canvas units — about 10pt on a phone,
 * which is not a picture of sunglasses, it is a speck. So this floors every
 * piece at MIN_BOX_FRACTION of its own box.
 *
 * ⚠ KATYA'S CALL, and cheaper to judge now. The floor came down from 0.45 to
 * 0.3 with the crop, because a floored piece is now all garment rather than
 * mostly margin — so the smallest items stay legible at a truer size. Set
 * MIN_BOX_FRACTION to 0 for the sheet's literal scale; it is one constant.
 */

import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, border, radius } from '@/theme/tokens';
import { slotOf, type Slot } from '@/domain/garments';
import { garment } from '@/data/catalogue';

/** The delivery's canvas, in its own units. Everything below is relative. */
const CANVAS_W = 1200;
const CANVAS_H = 1600;

type Box = { x: number; y: number; w: number; h: number };

/** Verbatim from the delivery README. Do not tidy the numbers. */
const STANDARD: Partial<Record<Slot, Box>> = {
  Outer: { x: 50, y: 60, w: 560, h: 700 },
  Top: { x: 660, y: 90, w: 470, h: 560 },
  Bottom: { x: 80, y: 810, w: 560, h: 720 },
  Shoes: { x: 680, y: 770, w: 440, h: 380 },
  Extra: { x: 680, y: 1190, w: 440, h: 350 },
};

/** The dress template: one tall box instead of top-plus-bottom, and shoes and
 *  extras shift left into the space the bottom box vacated. */
const DRESS: Partial<Record<Slot, Box>> = {
  Outer: { x: 50, y: 60, w: 560, h: 700 },
  Top: { x: 630, y: 60, w: 510, h: 860 },
  Shoes: { x: 150, y: 810, w: 440, h: 380 },
  Extra: { x: 150, y: 1190, w: 440, h: 350 },
};

/** The box height that `flatlay_scale: 1.0` — a full-length coat — fills. */
const SCALE_ANCHOR = STANDARD.Outer!.h;

/** See the header note. 0 gives the sheet's literal true scale. */
const MIN_BOX_FRACTION = 0.3;

/** Gap between the two extras when both are in, in canvas units. */
const EXTRAS_GAP = 20;

/** A piece the catalogue doesn't know (a legacy fixture name) gets a middling
 *  scale rather than vanishing at the floor or dominating at 1.0. */
const UNKNOWN_SCALE = 0.6;

/** Split one box into `n` side-by-side boxes — the sheet's rule for extras. */
function split(box: Box, n: number): Box[] {
  if (n <= 1) return [box];
  const w = (box.w - EXTRAS_GAP * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ ...box, x: box.x + i * (w + EXTRAS_GAP), w }));
}

/** True scale, then the legibility floor, capped so nothing outgrows its box.
 *  Returns the side of a SQUARE the garment is contain-fitted into, so for a
 *  tall piece this is its height and for a wide one its width. */
function sideFor(box: Box, scale: number): number {
  const fit = Math.min(box.w, box.h);
  return Math.min(fit, Math.max(scale * SCALE_ANCHOR, fit * MIN_BOX_FRACTION));
}

type Placement = { name: string; box: Box; side: number };

/**
 * Where each piece lands. Exported and pure so the arithmetic can be read (and
 * argued with) without a screen attached.
 */
export function compose(pieces: readonly string[]): {
  template: 'standard' | 'dress';
  placements: Placement[];
} {
  const bySlot = new Map<Slot, string[]>();
  pieces.forEach((name) => {
    const slot = slotOf(name);
    bySlot.set(slot, [...(bySlot.get(slot) ?? []), name]);
  });

  /* The dress template has no bottom box, so it is only usable when nothing is
     in the Bottom slot. Six pieces means a dress AND a trouser is now reachable
     — the sheet's template never anticipated that, and the standard template
     holds a dress in its top box perfectly well, so that is what it falls to. */
  const top = bySlot.get('Top')?.[0];
  const isDressLook = !!top && !!garment(top)?.isDress && !bySlot.has('Bottom');
  const template = isDressLook ? DRESS : STANDARD;

  const placements: Placement[] = [];
  (['Outer', 'Top', 'Bottom', 'Shoes', 'Extra'] as const).forEach((slot) => {
    const names = bySlot.get(slot);
    const base = template[slot];
    if (!names?.length || !base) return;
    split(base, names.length).forEach((box, i) => {
      const name = names[i]!;
      placements.push({
        name,
        box,
        side: sideFor(box, garment(name)?.flatlayScale ?? UNKNOWN_SCALE),
      });
    });
  });

  return { template: isDressLook ? 'dress' : 'standard', placements };
}

export function ComposedFlatLay({
  pieces,
  caption,
  showCaption = false,
  style,
}: {
  pieces: readonly string[];
  caption?: string;
  showCaption?: boolean;
  style?: ViewStyle;
}) {
  const { placements } = compose(pieces);
  const label = showCaption ? caption : undefined;

  return (
    <View style={[s.stage, style]}>
      {placements.map(({ name, box, side }) => {
        const image = garment(name)?.image;
        /* Percentages of the two canvas axes. The stage's aspect ratio is the
           canvas's, so a square in canvas units renders square on screen. */
        const frame = {
          left: `${((box.x + (box.w - side) / 2) / CANVAS_W) * 100}%`,
          top: `${((box.y + (box.h - side) / 2) / CANVAS_H) * 100}%`,
          width: `${(side / CANVAS_W) * 100}%`,
          height: `${(side / CANVAS_H) * 100}%`,
        } as const;

        return (
          <View key={name} style={[s.slot, frame]}>
            {image ? (
              /* `contain`, so a cropped non-square cutout keeps its proportions
                 inside the square the scale maths produced. */
              <Image source={image} style={s.image} resizeMode="contain" />
            ) : (
              /* Legacy fixture names carry no cutout — the labelled tile the
                 whole app used before the AW26 delivery landed. */
              <View style={s.placeholder}>
                <Text style={s.placeholderLabel} numberOfLines={3}>
                  {name}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {label ? (
        <View style={s.caption}>
          <Text style={s.captionText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  stage: {
    aspectRatio: CANVAS_W / CANVAS_H,
    width: '100%',
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.lg,
    backgroundColor: palette.creamRaised,
    overflow: 'hidden',
  },
  slot: { position: 'absolute' },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  placeholderLabel: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 7.5,
    lineHeight: 8.6,
    letterSpacing: 0.38,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: palette.grey,
  },
  caption: {
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
  captionText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 7.5,
    lineHeight: 10,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: palette.disabledInk,
  },
});

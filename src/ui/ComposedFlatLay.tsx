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
import { CUTOUT_ASPECT, DEFAULT_ASPECT } from '@/data/cutoutAspects';

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

/**
 * ─── EVERY PIECE GETS ROUGHLY THE SAME VISUAL MASS (Katya, 7 Sep) ──────────
 * "Some of the items appear disproportionately small compared to others. Is it
 * possible to make them roughly the same size? Keep the overlapping."
 *
 * TWO THINGS WERE MAKING A SHOE A SPECK, and it needed both fixed.
 *
 * 1. TRUE RELATIVE SCALE. `flatlay_scale` is the delivery's real-world ratio —
 *    1.0 a full-length coat, 0.104 a pump heel, 0.052 sunglasses. A 19x range,
 *    faithfully rendered. `MIN_BOX_FRACTION` floored it, but the floor is a
 *    fraction of the piece's OWN box, and the Shoes box is smaller than the
 *    Outer one, so the floor did not close the gap either.
 *
 * 2. THE PIECE WAS CONTAIN-FITTED INTO A SQUARE. A shoe cutout is about 2.5:1,
 *    so in a 114-unit square it drew 114 wide and 46 tall — a quarter of the
 *    area the number implied. This is the bigger of the two effects and it was
 *    invisible in the arithmetic, because the arithmetic only ever produced
 *    one number per piece.
 *
 * So a placement now carries WIDTH AND HEIGHT, derived from the cutout's own
 * aspect, sized so every piece's geometric mean — sqrt(w*h), its visual mass —
 * lands on one shared value. Equal mass rather than equal longest side: a
 * shoe as wide as a trouser is tall would be the same problem upside down.
 *
 * `EQUALISE` blends between the delivery's true scale and full equality, so
 * this is one constant to dial and 0 restores the old picture exactly.
 */

/** 0 = the delivery's true relative scale. 1 = every piece the same mass. */
const EQUALISE = 1;

/** The shared geometric-mean side, in canvas units. Sized so a full-length
 *  coat still fills most of the 560x700 Outer box rather than shrinking to
 *  meet the small pieces — equalising should lift the specks, not flatten
 *  everything to the smallest common size. */
const EQUAL_MASS = 380;

/**
 * How far a piece may exceed its template box before it is clamped.
 *
 * ⚠ THIS WAS 1.18 AND IT WAS WRONG. Equalising made the small pieces big
 * enough that the slack let them spread out of their own boxes — the pump heel
 * and the sunglasses grew leftward across the Shoes/Extra boundary at x=680
 * and sat on top of the skirt. Measured on a five-piece look: at 1.18 the heel
 * drew 519 units wide in a 440 box.
 *
 * The template's box widths are the collision geometry: the sheet spaced them
 * so nothing touches. Equalising is allowed to change how big a piece is
 * WITHIN its box; it is not allowed to move it into the next one. 1.02 leaves
 * the tighten's growth a hair of room on already-small pieces and clamps the
 * ones that would otherwise trespass.
 */
const BOX_SLACK = 1.02;

/**
 * The cutout's natural aspect (w/h), from a GENERATED table.
 *
 * ⚠ `Image.resolveAssetSource` WAS THE OBVIOUS CALL AND IT DOES NOT EXIST ON
 * WEB. A static require resolves to a plain URL under react-native-web, so the
 * first version of this threw `_Image.default.resolveAssetSource is not a
 * function` on the first placement — caught by running the screen, not by tsc,
 * because the web shim's types still declare it. `Image.getSize` works on both
 * platforms but is asynchronous, which would lay the plate out square and then
 * re-flow it.
 *
 * The cutouts are static files whose dimensions cannot change at runtime, so
 * they are read once at build time: `node scripts/gen-cutout-aspects.js`.
 * Re-run it after any re-crop of the delivery.
 *
 * A name with no entry falls back to square — which is exactly what the plate
 * did before any of this, so a missing row degrades to the old picture rather
 * than to a broken one.
 */
const aspectOf = (name: string): number => CUTOUT_ASPECT[name] ?? DEFAULT_ASPECT;

/**
 * The piece's equalised box in canvas units, BEFORE the tighten's growth and
 * before the box clamp.
 *
 * Both of those live in the render, and the clamp has to: `grow` is applied
 * there, so clamping here would let a grown piece exceed its box by the growth
 * factor — which is how a shoe at tighten 1 ended up wider than the canvas in
 * the first version of this.
 */
function dimsFor(box: Box, scale: number, aspect: number): { w: number; h: number } {
  /* The mass the delivery's own scale would give it, and the mass everything
     converges on. `MIN_BOX_FRACTION` still floors the true-scale end so
     EQUALISE = 0 behaves as it always did. */
  const fit = Math.min(box.w, box.h);
  const trueMass = Math.max(scale * SCALE_ANCHOR, fit * MIN_BOX_FRACTION);
  const mass = trueMass + (EQUAL_MASS - trueMass) * EQUALISE;

  /* mass = sqrt(w * h) with w/h = aspect, so w = mass*sqrt(aspect). */
  const r = Math.sqrt(aspect);
  return { w: mass * r, h: mass / r };
}

type Placement = { name: string; box: Box; w: number; h: number };

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
        ...dimsFor(box, garment(name)?.flatlayScale ?? UNKNOWN_SCALE, aspectOf(name)),
      });
    });
  });

  return { template: isDressLook ? 'dress' : 'standard', placements };
}

/**
 * HOW CLOSE THE PIECES SIT. 0 is the delivery template's own geometry; 1 is as
 * close as the arrangement goes before pieces start hiding each other.
 *
 * Two things happen together, and it needs both (Katya, 4 Sep: "force the
 * items to overlap slightly so they look closer together"):
 *
 *   GROW — each piece's square expands about its own centre, so it fills more
 *   of the gutter the template left around it.
 *   PULL — each square's centre moves toward the centroid of all of them, so
 *   the whole arrangement converges instead of just fattening.
 *
 * Growing alone was not enough, which is worth knowing before someone "simplifies"
 * this back to a scale factor: the template's boxes are far apart by design and
 * every cutout is `contain`-fit inside its square, so a tall narrow garment
 * leaves most of a bigger box empty and the gap barely closes. The pull is what
 * actually brings a bag up beside a skirt.
 *
 * The ceilings are deliberately modest. Past them the extras start sitting on
 * top of the shoes, and a flat lay whose pieces occlude each other stops being
 * a readable list of what you picked — which is the one job it has.
 */
const MAX_GROW = 0.3;
const MAX_PULL = 0.34;

export const TIGHTEN_DEFAULT = 0;
export const TIGHTEN_PREVIEW = 1;

export function ComposedFlatLay({
  pieces,
  caption,
  showCaption = false,
  tighten = TIGHTEN_DEFAULT,
  style,
}: {
  pieces: readonly string[];
  caption?: string;
  showCaption?: boolean;
  /** 0–1. See TIGHTEN_DEFAULT — 0 leaves the delivery template alone. */
  tighten?: number;
  style?: ViewStyle;
}) {
  const { placements } = compose(pieces);
  const label = showCaption ? caption : undefined;

  const t = Math.max(0, Math.min(1, tighten));
  const grow = 1 + MAX_GROW * t;
  const pull = MAX_PULL * t;

  /* The centroid of the pieces actually placed — NOT the canvas centre. A
     three-piece look sits in one corner of the template, and pulling it toward
     the middle of an empty canvas would slide the whole arrangement rather
     than close it up. */
  const centres = placements.map(({ box }) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 }));
  const hub = {
    x: centres.reduce((n, c) => n + c.x, 0) / (centres.length || 1),
    y: centres.reduce((n, c) => n + c.y, 0) / (centres.length || 1),
  };

  return (
    <View style={[s.stage, style]}>
      {placements.map(({ name, box, w, h }) => {
        const image = garment(name)?.image;
        /* Grow on both axes, so a piece expands about its own centre without
           changing shape — then clamp the RESULT to its box plus the slack.
           Clamping before the growth is what let a shoe run off the canvas. */
        const k = Math.min(1, (box.w * BOX_SLACK) / (w * grow), (box.h * BOX_SLACK) / (h * grow));
        const gw = w * grow * k;
        const gh = h * grow * k;
        /* Move the box's centre toward the hub, then draw the frame around
           wherever it ended up. */
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;
        const x = cx + (hub.x - cx) * pull;
        const y = cy + (hub.y - cy) * pull;
        /* Percentages of the two canvas axes. The stage's aspect ratio is the
           canvas's, so canvas units render true on both axes — which is what
           lets the frame be the garment's real proportion rather than a
           square it has to fit inside. */
        const frame = {
          left: `${((x - gw / 2) / CANVAS_W) * 100}%`,
          top: `${((y - gh / 2) / CANVAS_H) * 100}%`,
          width: `${(gw / CANVAS_W) * 100}%`,
          height: `${(gh / CANVAS_H) * 100}%`,
        } as const;

        return (
          <View key={name} style={[s.slot, frame]}>
            {image ? (
              /* `contain` still, but the frame is now the cutout's own
                 proportion — so contain has nothing left to letterbox and the
                 garment fills it. That is the whole fix for effect 2 in the
                 note above. */
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

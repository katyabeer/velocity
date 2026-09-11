/**
 * THE PLACEHOLDER WATERMARK — over every photograph standing in for a
 * generated look.
 *
 * Katya, 9 Sep: "Watermark all 'generated' looks visuals across the app — put
 * some semi-transparent layer over them with a copy: Placeholder."
 *
 * ⟲ NARROWED THE NEXT DAY, and the first version is the cautionary tale. I put
 * it inside all three components that draw a look photograph — `RenderedLook`,
 * `LookPlate` and `FeedCards` — which is every photograph in the app: every
 * magazine card, both plates of every judging pair, the results screen, You's
 * strips, the wardrobe thumbnails. Katya: "They're EVERYWHERE now in the app
 * which isn't great." She was right. A mark on everything marks nothing, and
 * the magazine is the one screen whose whole job is to be looked at.
 *
 * ─── WHAT IT IS ACTUALLY FOR ───────────────────────────────────────────────
 * None of this photography is output. It is 28 stock frames in
 * `assets/looks/d1` standing in for Jack's pipeline, and the mark exists so a
 * stakeholder looking at YOUR FINISHED GENERATION does not read it as real
 * output. That risk lives at the end of a build flow, where the app has just
 * claimed to have made something — not on a feed of other people's looks,
 * which nobody thinks this app generated.
 *
 * ─── EXACTLY FOUR CALL SITES ───────────────────────────────────────────────
 * `RenderedLook` is the only host, and it takes `watermark` as an OPT-IN prop
 * (default off — the failure mode above was a default of always-on):
 *
 *   `today/entered.tsx`      a14 — the day's flow, finished look
 *   `create/posted.tsx`      a17 — the end of the Create journey
 *   `ui/SubmissionSheet.tsx` the drawer, from Create's ready state and the
 *                            day's completed card
 *   `create/index.tsx`       Create's `spent` state — the judgement call; see
 *                            the note at that call site
 *
 * ⚠ NOT `LookPlate` or `FeedCards` any more: the judging pair, the results
 * screen, the magazine feed, You's strips. Other people's looks, and a list
 * of your own past ones, are not the thing being mistaken for output.
 *
 * ⚠ NOT `ComposedFlatLay`, and that was never an omission. The flat lay is
 * built from real garment cutouts — actual product photography — and it is the
 * picture the app shows when NOTHING has been generated: the pre-commit
 * preview, the pending state, and the fallback a failed generation enters the
 * pool as (R-L6). Marking it would label the one honest picture as the fake
 * one.
 *
 * ⚠ NOT the garment cutouts anywhere else either — the wardrobe, the picker
 * drawers, the slot cells. Same reason.
 *
 * ─── IT STILL SIZES ITSELF ─────────────────────────────────────────────────
 * The four remaining surfaces run about 170pt (a17's preview is 46% of the
 * width) to full-bleed, so the band is measured off its container
 * (`onLayout`) and the type scales. `MIN_TEXT_W`'s wash-only fallback no
 * longer fires anywhere — it was for the 46pt thumbnails, which are unmarked
 * now — and it is kept because it is what stops a future small call site
 * rendering an illegible smear.
 *
 * ─── NO NEW TOKENS ─────────────────────────────────────────────────────────
 * The wash is `ink` at low alpha and the band is `cream` at low alpha, both
 * expressed with `rgba` because the palette has no alpha variants and adding
 * two would be a new hue by the back door (see tokens.ts). If a translucent
 * ink and a translucent cream are ever wanted elsewhere, they belong in
 * `palette` — not copied out of here.
 */

import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

/** Below this the word cannot be set legibly — wash only. See the header. */
const MIN_TEXT_W = 88;

/** The band's type as a fraction of the container's width, floored and capped
 *  so a 90pt thumbnail and a 560pt plate both read. */
const TEXT_RATIO = 0.085;
const TEXT_MIN = 7.5;
const TEXT_MAX = 15;

export function LookWatermark() {
  const [w, setW] = useState(0);

  const size = Math.max(TEXT_MIN, Math.min(TEXT_MAX, w * TEXT_RATIO));

  return (
    <View
      style={s.fill}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      /* DECORATION OVER A PICTURE, AND IT MUST NOT EAT A TAP. Every surface
         this sits on is pressable underneath — the feed card opens its sheet,
         the judging plate casts the call, a slot opens its picker. A
         full-bleed overlay without this would kill all three. */
      pointerEvents="none"
      /* The photo it covers is already unlabelled decoration; the word is for
         the eye, not the screen reader, and announcing "placeholder" over
         someone's look would be noise. */
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={s.wash} />
      {w >= MIN_TEXT_W ? (
        <View style={s.band}>
          <Text style={[s.label, { fontSize: size, letterSpacing: size * 0.18 }]} numberOfLines={1}>
            PLACEHOLDER
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  /** Absolute rather than a wrapper, so no call site has to change its
   *  layout — the mark is a sibling of the Image inside the existing plate. */
  fill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    /** Clips the over-wide band here as well as at the host. All three hosts
     *  do clip (checked), but this makes the component self-contained — a
     *  future plate without `overflow: 'hidden'` would otherwise leak a
     *  diagonal stripe past its own edge. */
    overflow: 'hidden',
  },
  /** Light enough that the photograph still reads as a photograph. The point
   *  is to label it, not to hide it. */
  wash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,17,16,0.18)' },
  /**
   * A rotated band rather than repeated tiles. Tiling reads as "this asset is
   * watermarked" (a stock-library signal); one band across the middle reads as
   * "this picture is a placeholder", which is the actual message. -18°, and it
   * is the second rotated text in the app after `StarBadge`'s 12° — worth
   * knowing, because a third would make all of them look like a mistake.
   */
  band: {
    /** WIDER THAN THE PLATE, and it has to be. At `stretch` the band is
     *  exactly the container's width, so rotating it pulls both ends inside
     *  the frame and the stripe stops short of the corners — it read as a
     *  floating bar rather than a mark across the picture. 150% overshoots on
     *  both sides; `s.fill` below clips it, so the excess is free. */
    width: '150%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(247,243,234,0.42)',
    transform: [{ rotate: '-18deg' }],
  },
  label: {
    fontFamily: 'Archivo_900Black',
    textTransform: 'uppercase',
    color: 'rgba(18,17,16,0.62)',
  },
});

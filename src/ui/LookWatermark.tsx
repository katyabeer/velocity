/**
 * THE PLACEHOLDER WATERMARK — over every photograph standing in for a
 * generated look.
 *
 * Katya, 9 Sep: "Watermark all 'generated' looks visuals across the app — put
 * some semi-transparent layer over them with a copy: Placeholder."
 *
 * ─── WHAT IT IS ACTUALLY FOR ───────────────────────────────────────────────
 * None of this photography is output. It is 28 stock frames in
 * `assets/looks/d1`, standing in for Jack's pipeline, and the better the
 * screens got the more likely a stakeholder was to read them as real
 * generations. The mark exists so nobody in a review has to be told.
 *
 * ─── WHERE IT GOES, AND THE ONE PLACE IT MUST NOT ──────────────────────────
 * Three components draw a look photograph and all three take it:
 *
 *   `RenderedLook`   your own finished generation — 7 surfaces
 *   `LookPlate`      the judging pair, `ResultCard`, the results screen, You
 *   `FeedCards`      the magazine feed
 *
 * ⚠ NOT `ComposedFlatLay`, and that is the point rather than an omission. The
 * flat lay is built from real garment cutouts — actual product photography of
 * actual clothes — and it is the picture the app shows when NOTHING has been
 * generated: the pre-commit preview, the pending state, and the fallback a
 * failed generation enters the pool as (R-L6). Watermarking it would label the
 * one honest picture in the app as the fake one.
 *
 * ⚠ NOT the garment cutouts anywhere else either — the wardrobe, the picker
 * drawers, the slot cells. Same reason.
 *
 * ─── IT SIZES ITSELF, BECAUSE THE SURFACES RANGE 46pt TO 560pt ─────────────
 * The same mark has to sit on a 46pt post-row thumbnail and a 560pt feed
 * plate. A fixed font size is either illegible on one or shouting on the
 * other, so the band is measured off the container (`onLayout`) and the type
 * scales with it.
 *
 * Below `MIN_TEXT_W` the word cannot be set legibly at any size, so those
 * cells get the WASH ONLY. That is deliberate: the wash still visibly marks
 * them, and the risk the mark exists to cover — a hero image mistaken for
 * output — does not live on a 46pt thumbnail.
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

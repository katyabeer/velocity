/**
 * THE GENERATED LOOK — a photograph of the look, worn.
 *
 * Katya, 7 Sep: "All 'ready' looks (on the Create flow or the Today's
 * challenge flow) need to be looks, not flat pieces shown together."
 *
 * Every surface that shows a FINISHED generation used to draw
 * `ComposedFlatLay` — the delivery sheet's flat-lay template, built out of the
 * garment cutouts. That is the right picture for two moments and the wrong one
 * for the rest:
 *
 *   RIGHT   before you commit (the day's step 2, Create's step 2). Nothing
 *           renders before commit — the plate IS the confirmation, and it is
 *           deliberately not a render.
 *   RIGHT   while it is generating. §6 wants the flat lay there, and R-L6
 *           makes it the fallback a FAILED generation enters the pool as.
 *   WRONG   once it is ready. A finished look is the thing the render cost
 *           money to make, and a grid of cutouts is not it.
 *
 * So this component is only for the ready surfaces. The pre-commit and pending
 * ones keep the flat lay, and that is a distinction to preserve rather than
 * tidy away — see the call sites.
 *
 * ─── IT IS A PLACEHOLDER, AND IT IS SHAPED TO BE SWAPPED ───────────────────
 * `ui/RenderStage.tsx` says the intended change is "replacing this component
 * with a real image and a real progress signal … the surrounding flow should
 * not need to move". This is that, for the finished frame: one component, one
 * list of sources, `index` picking between them. When Jack's pipeline exists,
 * this takes a URI and nothing else moves.
 *
 * ⟲ THERE IS A DAY-2 ASSET SET NOW (13 Sep), so this went from one pool to
 * two. It used to say there wasn't: `assets/looks/` held only `d1`, and the
 * stand-ins were its magazine frames led by `look_d1_mag_06` because
 * `data/looks.ts` flags that fixture as `mine`.
 *
 * Katya, 13 Sep: "Use a different to Day 1 placeholder for their submissions."
 * The returning state's pool leads with `look_d3_mag_01` for the same reason —
 * it is the frame `FEED_LOOKS_DAY_TWO` flags as `mine`, so it is the one
 * photograph in that library already meant to be the user's.
 *
 * ⚠ BOTH POOLS DRAW FROM THE MAGAZINE AND EDITORIAL SETS, NEVER THE JUDGING
 * ONE, and that is deliberate: the judging frames are TONIGHT'S FIELD. A
 * photograph shown as your own finished generation and then again as a plate in
 * the round you are asked to judge reads as the app having leaked your entry
 * into the pairs.
 *
 * ⚠ AND IT LEANS ON JACK'S OPEN QUESTION 2, which is render-on-a-body vs flat
 * lay. Showing every finished look as worn photography answers it in practice,
 * in the direction `casting.tsx` already assumes ("changes the generation, not
 * the clothes"). It is not a decision this file is entitled to make on its
 * own: the flat lay still exists, a14 still toggles to it, and one line here
 * puts it back. Flagging rather than burying.
 */

import { Image, StyleSheet, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { LookWatermark } from './LookWatermark';
import { palette, border, radius } from '@/theme/tokens';
import { ACTIVE_DAY } from '@/config/testState';

/**
 * The stand-in photography. Ordered, so a caller with several looks to show
 * (the wardrobe's archive) gets different pictures down the list rather than
 * the same one nine times.
 */
const RENDERED_DAY_ONE: readonly ImageSourcePropType[] = [
  require('../../assets/looks/d1/look_d1_mag_06.jpg'),
  require('../../assets/looks/d1/look_d1_mag_09.jpg'),
  require('../../assets/looks/d1/look_d1_mag_12.jpg'),
  require('../../assets/looks/d1/look_d1_mag_04.jpg'),
  require('../../assets/looks/d1/look_d1_mag_13.jpg'),
];

/** The returning state's. Led by the frame flagged `mine` in that day's feed. */
const RENDERED_DAY_TWO: readonly ImageSourcePropType[] = [
  require('../../assets/looks/d2/look_d3_mag_01.jpg'),
  require('../../assets/looks/d2/look_d2_mag_04.jpg'),
  require('../../assets/looks/d2/look_d2_mag_07.jpg'),
  require('../../assets/looks/d2/look_d2_beat_02.jpg'),
  require('../../assets/looks/d2/look_d2_mag_02.jpg'),
];

const RENDERED: readonly ImageSourcePropType[] =
  ACTIVE_DAY === 2 ? RENDERED_DAY_TWO : RENDERED_DAY_ONE;

export function RenderedLook({
  /** Which of the stand-ins. Defaults to 0 — the fixture flagged as yours. */
  index = 0,
  /**
   * The PLACEHOLDER mark. OFF by default and passed at four call sites — see
   * the note above. Opt-in rather than opt-out because "every look in the app"
   * is the thing that went wrong the first time: a default of `true` makes the
   * next call site marked unless someone remembers not to be.
   */
  watermark = false,
  style,
}: {
  index?: number;
  watermark?: boolean;
  style?: ViewStyle;
}) {
  const source = RENDERED[Math.abs(index) % RENDERED.length]!;
  return (
    <View style={[s.plate, style]}>
      {/* `cover` with NOTHING TO CROP. The plate's 3:4 is the photography's own
          675×900, so cover fills it exactly — which is the whole reason the
          aspect is stated rather than left to the image. Change one and the
          other has to change with it, or this starts cutting into the subject
          the way the onboarding collage did on 4 Sep. */}
      <Image source={source} style={s.photo} resizeMode="cover" />
      {watermark ? <LookWatermark /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  /** Deliberately identical to `ComposedFlatLay`'s stage — same 3:4, same
   *  hairline, same corner — so this is a drop-in at every call site and the
   *  two presentations of one look sit in the same frame. */
  plate: {
    aspectRatio: 3 / 4,
    width: '100%',
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.lg,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
});

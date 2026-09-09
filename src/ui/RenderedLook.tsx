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
 * ⚠ THERE IS NO DAY-2 ASSET SET. Katya asked for "one of the day 2 looks from
 * the asset library" — `assets/looks/` contains ONE folder, `d1`, holding 14
 * judging photographs and 14 magazine ones. Nothing else was ever delivered.
 * These are drawn from the magazine set, and `look_d1_mag_06` leads because
 * `data/looks.ts` already flags that exact fixture as `mine` — it is the app's
 * designated "your own look", so it is the one photograph in the library that
 * is already meant to be the user's. Say if a day-2 set exists somewhere and
 * this should point at it instead.
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

/**
 * The stand-in photography. Ordered, so a caller with several looks to show
 * (the wardrobe's archive) gets different pictures down the list rather than
 * the same one nine times.
 */
const RENDERED: readonly ImageSourcePropType[] = [
  require('../../assets/looks/d1/look_d1_mag_06.jpg'),
  require('../../assets/looks/d1/look_d1_mag_09.jpg'),
  require('../../assets/looks/d1/look_d1_mag_12.jpg'),
  require('../../assets/looks/d1/look_d1_mag_04.jpg'),
  require('../../assets/looks/d1/look_d1_mag_13.jpg'),
];

export function RenderedLook({
  /** Which of the stand-ins. Defaults to 0 — the fixture flagged as yours. */
  index = 0,
  style,
}: {
  index?: number;
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
      {/* THE PLACEHOLDER MARK. None of this photography is output — see
          ui/LookWatermark.tsx for what it is for and the one picture in the
          app that deliberately does not carry it. */}
      <LookWatermark />
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

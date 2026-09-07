/**
 * o1–o4 — the intro carousel. FOUR slides now, down from five (Katya, 3 Sep):
 * "Vote, learn, earn" is gone, and "The community" is reworked into "Get
 * inspired". Copy is from the mockup, verbatim except where noted below.
 *
 * ─── NOTHING MOVES BETWEEN SLIDES ───────────────────────────────────────────
 * The eyebrow, heading and body sit at the SAME y on all four, and the artwork
 * centres in the same box beneath them. That is what `TEXT_BLOCK_H` buys: a
 * fixed-height text block, not a `minHeight`, so a two-line heading or a
 * four-line body cannot push the artwork down and make the page jump as you
 * page through. All four currently use one heading line and three body lines,
 * with room in the block for four — if new copy needs more than that, raise
 * the constant rather than letting the block grow.
 *
 * ⚠ SLIDE NUMBERING. The mockup's eyebrows read 01, 02, 04, 05 — the numbering
 * from before "Vote, learn, earn" was cut. Renumbered 01–04 here, on the
 * assumption that a visible gap is a leftover rather than a decision. Say if
 * the original numbers were deliberate.
 *
 * ⚠ ONE COPY CHANGE I DID NOT MAKE VERBATIM, and it is not a style preference.
 * The mockup's slide 04 reads "Spend your tokens to purchase garments in any
 * look." *Purchase* is the one word invariant 16 exists to avoid — nothing is
 * bought, sold, traded, gifted or lost — and locked decision 4 (copy-minting)
 * is the deliberate regulatory distance from the Sorare and DraftKings
 * precedents. "Purchase" reads as a transaction for a good, in the first
 * screens a new user sees, which is precisely the framing that created the
 * exposure in those cases. It says "Spend your tokens on garments from any
 * look" instead. That keeps the mockup's meaning and its sentence shape.
 * KATYA'S CALL — if you want the mockup's word, say so and I'll put it back,
 * but Jack should see it first.
 *
 * ⚠ OPEN QUESTION D, STILL OPEN AND NOW WIDER. Cutting "Vote, learn, earn"
 * removed the one slide that stated the judging-to-tokens link outright.
 * Slide 02 still carries it ("vote on other looks to earn tokens"), so it is
 * not gone — but nothing now teaches the OTHER half, that tokens are the only
 * way a garment reaches a wardrobe. A new user is still never told "no
 * judging, no clothes", and there is one fewer place it could have been said.
 */

import { Image, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Hero, Lede, Kick } from '@/ui/text';
import { palette, border, radius, rotation, useReducedMotion } from '@/theme/tokens';
import { garment } from '@/data/catalogue';
import { FEED_LOOKS } from '@/data/looks';

const TOTAL = 4;

/**
 * The gap between the header rule and the eyebrow, and the height reserved for
 * eyebrow + heading + body. Both fixed, both the reason nothing jumps.
 *
 * 150 = eyebrow 11 + 10 + heading 33 + 12 + four body lines at 21.
 */
const TOP_PAD = 76;
const TEXT_BLOCK_H = 150;

/** Caps the artwork so it centres in a consistent box rather than filling
 *  whatever height the device has left. */
const MEDIA_MAX_H = 300;

const SLIDES = [
  {
    n: '01',
    heading: 'Be a stylist',
    body: 'Select from a variety of garments to build different looks and share with the community.',
    cta: 'Next',
  },
  {
    n: '02',
    heading: 'Daily challenges',
    body: 'Enter a styling challenge every day and vote on other looks to earn tokens.',
    cta: 'Next',
  },
  {
    n: '03',
    heading: 'Get inspired',
    body: 'Flick through the magazine to see what’s trending and post your looks to it for inspiration.',
    cta: 'Next',
  },
  {
    n: '04',
    heading: 'Hunt for items',
    /* See the header note: "purchase" deliberately not used. */
    body: 'Need to boost your wardrobe? Spend your tokens on garments from any look.',
    cta: 'Get started',
  },
] as const;

/** A garment cutout on the sunk ground. Square, because every delivered cutout
 *  is a 1000x1000 frame (resized to 512 — see data/catalogue.ts). */
function Cutout({ name, tilt = 0, flex = 1 }: { name: string; tilt?: number; flex?: number }) {
  const image = garment(name)?.image;
  if (!image) return null;
  return (
    <View style={[s.cutout, { flex, transform: [{ rotate: `${tilt}deg` }] }]}>
      <Image source={image} style={s.fill} resizeMode="contain" />
    </View>
  );
}

/** A look photo. `mat` puts it on an accent passepartout — the lime frame in
 *  the mockup's slide 02. A FILL with padding, not an accent border: accent is
 *  a fill colour only (see tokens.ts), and a mat is what the mockup actually
 *  shows anyway. */
function LookPhoto({
  index,
  mat,
  tilt = 0,
  flex = 1,
}: {
  index: number;
  mat?: boolean;
  tilt?: number;
  flex?: number;
}) {
  const image = FEED_LOOKS[index % FEED_LOOKS.length]?.image;
  if (!image) return null;
  return (
    <View style={[mat ? s.mat : s.plain, { flex, transform: [{ rotate: `${tilt}deg` }] }]}>
      {/* `contain`, NOT `cover` (Katya, 4 Sep — "image is cut off on the left
          hand side"). The look photography is portrait and full-length; in a
          cell wider than the source's aspect, `cover` fills by cropping the
          SIDES, and centred cropping cut into the subject — a head off the top
          and an arm off the left on the two bottom cells. A marketing slide
          showing half a person is worse than one with a margin.

          Both variants have a ground and padding for exactly this reason, so a
          contained photo reads as mounted on a mat rather than as a picture
          that failed to fill its box. */}
      <Image source={image} style={s.photo} resizeMode="contain" />
    </View>
  );
}

/**
 * The artwork, per slide.
 *
 * Slide 01 is the delivered collage asset. The other three are composed from
 * the real AW26 catalogue and look photography rather than the mockup's grey
 * placeholder boxes — the assets exist, so a stand-in would be a downgrade.
 * Nothing here is a recommendation: the pieces are fixed, so no slide can be
 * read as "these go together".
 */
function Media({ index, reduced }: { index: number; reduced: boolean }) {
  const tilt = (deg: number) => (reduced ? 0 : deg);

  if (index === 0) {
    return (
      <Image
        source={require('../../../assets/onboarding/onboarding-screen-1.png')}
        style={s.fill}
        resizeMode="contain"
      />
    );
  }

  if (index === 1) {
    return (
      <View style={s.stack}>
        <View style={s.row}>
          <Cutout name="black lace gothic dress" tilt={tilt(-rotation.r3)} />
          <Cutout name="boxy broad shoulder knit" tilt={tilt(rotation.r2)} />
        </View>
        <View style={[s.row, { flex: 1.5 }]}>
          <LookPhoto index={4} mat tilt={tilt(-rotation.r2)} />
          <LookPhoto index={10} tilt={tilt(rotation.r1)} />
        </View>
      </View>
    );
  }

  if (index === 2) {
    /* The magazine, as a spread — three photos, unsorted. SAMPLE, DON'T SORT
       applies to the feed itself and not to a marketing slide, but showing a
       ranked-looking arrangement here would still teach the wrong thing. */
    return (
      <View style={s.row}>
        <LookPhoto index={0} tilt={tilt(-rotation.r1)} flex={1.2} />
        <View style={{ flex: 1, gap: 8 }}>
          <LookPhoto index={6} tilt={tilt(rotation.r2)} />
          <LookPhoto index={12} tilt={tilt(-rotation.r2)} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.row}>
      <LookPhoto index={8} tilt={tilt(-rotation.r1)} flex={1.3} />
      <View style={{ flex: 1, gap: 8 }}>
        <Cutout name="suede tailored skirt" tilt={tilt(rotation.r2)} />
        <Cutout name="fair isle cable jumper" tilt={tilt(-rotation.r3)} />
      </View>
    </View>
  );
}

export default function Intro() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Math.min(Math.max(Number(step) || 1, 1), TOTAL) - 1;
  const slide = SLIDES[index]!;
  const reduced = useReducedMotion();

  const next = () =>
    index === TOTAL - 1
      ? router.push('/onboarding/sign-up')
      : router.push(`/onboarding/intro/${index + 2}`);

  return (
    <OnboardingFrame
      index={index}
      totalDots={TOTAL}
      onBack={index > 0 ? () => router.push(`/onboarding/intro/${index}`) : undefined}
      onSkip={() => router.push('/onboarding/sign-up')}
      cta={slide.cta}
      onCta={next}
      ctaVariant="onboarding"
      topAlign
    >
      {/* Order is deliberate and the same on every slide: eyebrow, heading,
          sub-heading, THEN the image — per Katya's reference layout. Don't
          put an image block before the Lede again. */}
      <View style={s.textBlock}>
        <Kick tone="muted">{slide.n}</Kick>
        <Hero size={38} style={{ marginTop: 10 }}>
          {slide.heading}
        </Hero>
        <Lede size={17} style={{ marginTop: 12 }}>
          {slide.body}
        </Lede>
      </View>

      <View style={s.media}>
        <Media index={index} reduced={reduced} />
      </View>
    </OnboardingFrame>
  );
}

const s = StyleSheet.create({
  /** FIXED height, not minHeight — see the header. This is the whole
   *  no-jumping mechanism. */
  textBlock: { marginTop: TOP_PAD, height: TEXT_BLOCK_H },
  media: {
    flex: 1,
    maxHeight: MEDIA_MAX_H,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: { width: '100%', height: '100%' },
  stack: { flex: 1, width: '100%', gap: 10 },
  row: { flex: 1, flexDirection: 'row', gap: 10, width: '100%' },
  cutout: {
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    overflow: 'hidden',
  },
  /** The sunk mat. Same padding as the accent one below so the two bottom
   *  cells sit on the same optical inset — without it the contained photo went
   *  edge to edge in one cell and was framed in the other. */
  plain: {
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    padding: 6,
    overflow: 'hidden',
  },
  /** The accent mat. Padding, so the lime reads as a frame the photo sits on
   *  rather than as a coloured border on the photo. */
  mat: {
    borderRadius: radius.sm,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    padding: 6,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%', borderRadius: radius.xs },
});

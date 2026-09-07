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
 * ─── THE ARTWORK: FOUR DIFFERENT COMPOSITIONS (7 Sep, onboarding-visuals) ───
 *
 * All four slides used to be the same thing: one big tile plus two small ones.
 * Three consequences, and they are why it changed. Four screens of identical
 * structure read as ONE screen shown four times, so nobody scans past the
 * first. Slides 03 and 04 were indistinguishable — both a look photo beside
 * two stacked tiles. And every visual showed a NOUN while every caption
 * described a VERB: the copy says select, vote, flick, spend, and the artwork
 * showed garments and models. Nothing demonstrated the mechanic it described.
 *
 * Each slide now demos its own verb and is structurally unlike its neighbours:
 *
 *   01  a 2×2 of slots, TWO OF THEM EMPTY — the builder's own slot strip,
 *       half filled. The gap is the invitation: a finished collage says "look
 *       at this", an unfinished one says "your turn".
 *   02  the judging pair, head to head, with the real Vote A / Vote B pills
 *       and the payout underneath. The old 2×2 with one tile highlighted read
 *       as *selected*, not *voted*.
 *   03  the feed as a column CLIPPED AT BOTH EDGES. The crop is the whole
 *       idea — a tidy grid of three reads as a gallery; a column cut top and
 *       bottom reads as something that scrolls and does not end.
 *   04  one look with the bottom sheet slid up over it, pieces priced. This
 *       is also the real route (tap a look → sheet), so the last slide before
 *       sign-up teaches a gesture instead of showing more clothes.
 *
 * NO NEW ASSETS. Every composition is built from the AW26 catalogue cutouts
 * and the Day 1 look photography already in `assets/`. One consequence:
 * `assets/onboarding/onboarding-screen-1.png` — the only bespoke onboarding
 * image — is now UNREFERENCED. It is deliberately left on disk rather than
 * deleted, so slide 01 can be reverted with a one-line change.
 *
 * ⚠ EVERY NUMBER ON THESE SLIDES COMES FROM A CONSTANT, and three of them do
 * not match the reference mockup. The mockup shows "Ten pairs", "+2 tokens"
 * and per-garment prices of "3 tokens" / "2 tokens". The real economy says a
 * round is `JUDGING_QUOTA` pairs (5 at test scale, 10 documented), it pays
 * `TOKENS_PER_JUDGING_ROUND`, and EVERY piece costs `TOKEN_COST_PER_TAKE` —
 * there is no per-garment pricing anywhere in the product. Onboarding is the
 * one place a made-up price would be read as the rule, so the constants win
 * and the numbers move on their own if the economy is retuned.
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
 * ⚠ SLIDE 03'S COPY IS UNCHANGED, AND IT NOW UNDER-DESCRIBES ITS ARTWORK.
 * The body still says "flick through the magazine to see what's trending"; the
 * picture is now a feed. The visuals brief proposes "An endless feed of looks
 * from the room, plus our own editorial" and marks it KATYA'S CALL, so the
 * string is untouched here. Note "trending" is also the one word on the slide
 * that names a feature which is BUILT BUT OFF (`TRENDING_ENABLED = false`).
 *
 * ⚠ OPEN QUESTION D, STILL OPEN AND NOW NARROWER BUT NOT CLOSED. Tokens
 * appear twice in the artwork now — as a reward on 02 and as a price on 04 —
 * so a new user can see the loop's two ends. Nothing still SAYS what a token
 * is, that you start with none, or that judging is the only way to get one.
 * That is a copy problem and it should not be quietly solved with pictures.
 *
 * ⚠ ALL FOUR ARE STILL. Slide 02 in particular wants half a second of a plate
 * swiping away, and that is a separate change — note that animation cannot be
 * verified in the Claude preview pane (`visibilityState` is `hidden`, so
 * `requestAnimationFrame` never fires and JS-driven values sit at their start
 * value forever).
 */

import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { OnboardingFrame } from '@/ui/OnboardingFrame';
import { Hero, Lede, Kick } from '@/ui/text';
import { type as T } from '@/theme/type';
import { palette, border, radius, rotation, useReducedMotion } from '@/theme/tokens';
import { garment } from '@/data/catalogue';
import { FEED_LOOKS, JUDGING_LOOKS, isEditorial, type FeedLook } from '@/data/looks';
import {
  JUDGING_QUOTA,
  TOKENS_PER_JUDGING_ROUND,
  TOKEN_COST_PER_TAKE,
} from '@/domain/economy';

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

/** The look photography is 675×900 throughout — 0.75. Every cell below that
 *  uses `cover` is cut to this ratio ON PURPOSE, so `cover` has nothing to
 *  crop. Getting it wrong is what took a head off the top and an arm off the
 *  left on 4 Sep. */
const PHOTO_RATIO = 0.75;

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

/* ══════════════════════════════════════════════════════════════════════════
   01 · THE HALF-BUILT LOOK
   ══════════════════════════════════════════════════════════════════════════ */

/** Two real pieces, in two different slots, so the grid cannot be read as a
 *  recommendation about what goes with what. */
const SLOT_PIECES = ['structured trench coat', 'pleated wool trouser'] as const;

/** Both are members of `SLOTS` in domain/garments — the builder's own slot
 *  names, not invented labels. Not imported: the grid holds four of the five
 *  slots, so picking two by index would read as arbitrary either way. */
const EMPTY_SLOTS = ['Shoes', 'Extra'] as const;

/** The lime tick. An SVG stroke, not a "✓" — a glyph would render in the
 *  platform font and could not take the ink colour, which is the bug that
 *  removed the last emoji from the app on 4 Sep. */
function Tick() {
  return (
    <View style={s.tick}>
      <Svg width={10} height={10} viewBox="0 0 24 24">
        <Path
          d="M4.5 12.5 10 18.5 19.5 6"
          fill="none"
          stroke={palette.ink}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function FilledSlot({ name, tilt }: { name: string; tilt: number }) {
  const image = garment(name)?.image;
  return (
    <View style={[s.slot, { transform: [{ rotate: `${tilt}deg` }] }]}>
      {image ? <Image source={image} style={s.slotPhoto} resizeMode="contain" /> : null}
      <Tick />
    </View>
  );
}

/** Transparent ground and a dashed rule — the two things that say "nothing
 *  here yet" without drawing a ghost garment, which would read as a
 *  suggestion. No tick, deliberately: the tick means committed.
 *
 *  ⚠ ANDROID renders `borderStyle: 'dashed'` as solid when a borderRadius is
 *  present. It degrades to a plain outline, which still reads as empty
 *  against the two sunk, filled cells beside it. */
function EmptySlot({ label, tilt }: { label: string; tilt: number }) {
  return (
    <View style={[s.slotEmpty, { transform: [{ rotate: `${tilt}deg` }] }]}>
      <Text style={s.slotLabel}>{label}</Text>
    </View>
  );
}

/**
 * THE GRID IS INSET BY `SLOT_TILT_INSET`, and that is the whole reason the
 * tilt is safe (Katya, 7 Sep — "make sure they fit the width of the frame and
 * don't get cut off because of the tilt").
 *
 * Rotating a rectangle grows its BOUNDING BOX; it does not move it. A slot is
 * about 160×144 in the media box, and at `rotation.r2` that box gains 4.9px of
 * width and 5.5px of height — half of each sticking out on every side. Without
 * the inset the two outer slots would break the page's own left and right
 * edges, which the header rule and the CTA both sit on, and the top row would
 * ride over the `Lede` above it.
 *
 * 5 rather than the computed 2.46/2.75, because the slot size is flex-derived
 * and only approximately known here. If the tilt ever goes past `rotation.r2`,
 * recompute it: dx = (w·cosθ + h·sinθ − w) / 2.
 */
const SLOT_TILT_INSET = 5;

function SlotGrid({ tilt }: { tilt: (deg: number) => number }) {
  return (
    <View style={s.slots}>
      {/* Alternating, not a shared angle — four cells leaning the same way
          read as one sheared plane rather than as four separate cards. */}
      <View style={s.slotRow}>
        {SLOT_PIECES.map((n, i) => (
          <FilledSlot key={n} name={n} tilt={tilt(i === 0 ? -rotation.r2 : rotation.r2)} />
        ))}
      </View>
      <View style={s.slotRow}>
        {EMPTY_SLOTS.map((l, i) => (
          <EmptySlot key={l} label={l} tilt={tilt(i === 0 ? rotation.r2 : -rotation.r2)} />
        ))}
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   02 · HEAD TO HEAD
   ══════════════════════════════════════════════════════════════════════════ */

/** `JUDGING_LOOKS`, not `FEED_LOOKS` — this is the pair photography, and the
 *  two flows use different pools. Indices 4 and 9 are the mockup's own
 *  specimens (judge_03 and judge_07). */
const PAIR = [JUDGING_LOOKS[4], JUDGING_LOOKS[9]] as const;

function Plate({
  image,
  label,
  tilt,
}: {
  image?: ImageSourcePropType;
  label: string;
  tilt: number;
}) {
  return (
    <View style={[s.plate, { transform: [{ rotate: `${tilt}deg` }] }]}>
      {/* `cover` IS CORRECT HERE, and it is the one exception in this file.
          The plate is a PORTRAIT cell — taller than 0.75 — so cover crops the
          top and bottom, which is what LookPlate already does on the judging
          round. It is `cover` on a cell WIDER than the source that cuts into
          the subject sideways. */}
      {image ? <Image source={image} style={s.fill} resizeMode="cover" /> : null}
      <View style={s.votePill}>
        <Text style={s.votePillLabel}>{label}</Text>
      </View>
    </View>
  );
}

function HeadToHead({ tilt }: { tilt: (deg: number) => number }) {
  return (
    <View style={s.vs}>
      {/* The occasion off the fixture, not a written string — the pair and its
          brief cannot drift apart. */}
      <Text style={s.brief}>Brief: {PAIR[0]?.occasion ?? 'today’s job'}</Text>

      <View style={s.pair}>
        <Plate image={PAIR[0]?.image} label="Vote A" tilt={tilt(-rotation.r2)} />
        <Plate image={PAIR[1]?.image} label="Vote B" tilt={tilt(rotation.r2)} />
      </View>

      {/* Where tokens come from, said once, in the first place onboarding can
          say it. Both numbers are constants — see the header. */}
      <View style={s.earn}>
        <Text style={s.earnLabel}>{JUDGING_QUOTA} pairs</Text>
        <View style={s.coin}>
          <Text style={s.coinLabel}>+{TOKENS_PER_JUDGING_ROUND} tokens</Text>
        </View>
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   03 · THE FEED, CLIPPED AT BOTH EDGES
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Three real fixtures, and WHICH ONE GOES WHERE IS DECIDED BY THE CROP.
 *
 * The window shows the BOTTOM of the first card and the TOP of the second, so
 * the two halves of a feed card are split across them: the first card
 * contributes the photo's lower half, the Save tag that sits in its
 * bottom-right, the caption and the heart; the second contributes the handle
 * line. So the ANATOMY CARD IS FIRST, and the house editorial is SECOND —
 * @house is only legible on the card whose head is in frame, and the whole
 * reason it is on the slide is to show that the feed carries house content as
 * well as the room's.
 *
 * ⚠ THE ORDER IS NOT A RANKING AND MUST NEVER BECOME ONE. Invariant 7 is
 * sample-don't-sort; the real feed is sampled, so any order is a valid sample,
 * but nothing may be weighted by popularity, reactions or token counts. These
 * three were chosen for LEGIBILITY — one house card, two from the room, three
 * different first tags so the captions don't read as a repeat — and for
 * nothing else. If you swap one, swap it for the same reason.
 */
const FEED_TRIO: readonly FeedLook[] = [8, 0, 10]
  .map((i) => FEED_LOOKS[i])
  .filter((l): l is FeedLook => !!l);

/** Which card carries the Save tag: the one whose photo bottom is in frame. */
const ANATOMY_AT = 0;

/**
 * ── FULL WIDTH, AND WHAT THAT COST (Katya, 7 Sep, twice: "too thin", then
 *    "still too narrow, make it wider") ─────────────────────────────────────
 *
 * The column WAS 118px, then 150px, and both were capped by a rule I had set
 * myself and not by anything on the screen: that the middle of three cards
 * should be visible WHOLE. The image cell is cut to PHOTO_RATIO, so width buys
 * height — at 150 the card was already 232 of the 298px box, and a whole card
 * put a hard ceiling of about 197px on the column. That ceiling is gone.
 *
 * It is the full width of the media box now, and NO CARD IS WHOLE. Two are in
 * frame: the bottom of one and the top of the next, both cut. That is what the
 * reference mockup actually renders, and it serves the slide's own argument
 * better than three small cards did — the crop is the idea, "a column cut at
 * both edges reads as something that scrolls and does not end", and a big
 * photograph cut at both ends says it louder than a small one.
 *
 * What was given up, so nobody re-adds it by halves: you can no longer see a
 * complete feed card here. The anatomy is split across the seam instead — see
 * FEED_TRIO for which half each card contributes.
 *
 * ── WHY THE HEIGHT IS MEASURED AND NOT A CONSTANT ─────────────────────────
 * The card's height is now the FRAME's width divided by PHOTO_RATIO plus the
 * chrome, so it depends on the device. The clip offset depends on the card
 * height. So the container measures itself (`onLayout`) and both are derived
 * from that — a hard-coded width here would have had to know
 * OnboardingFrame's own padding, which is exactly the coupling that breaks
 * silently when someone re-pads the frame.
 */
const F_PAD_X = 11;
const F_PAD_Y = 9;
/** Handle OVER meta, stacked, as on the real feed card. */
const F_HEAD_H = 29;
const F_GAP = 6;
const F_META_H = 21;
/** Everything in a card that is not the photograph. The photograph's height is
 *  derived at runtime; this is what gets added to it. */
const F_CHROME_H = F_PAD_Y * 2 + F_HEAD_H + F_GAP + F_META_H + border.hair;

/**
 * How much of the FIRST card stays in frame, from its bottom edge up — and it
 * is DELIBERATELY MEAN, because every pixel it takes comes off the photograph
 * below it.
 *
 * `F_META_H + F_PAD_Y` of it is the caption row; the rest is the bottom of a
 * picture. The look photography is full length, so the bottom of it is SHOES
 * ON A FLOOR: at 140 that band was 110px of feet and concrete, and it was the
 * first thing the eye landed on, on the slide whose heading is "Get inspired".
 *
 * 96 leaves about 66px of picture — enough to carry the Save tag, which is the
 * only reason the band is there at all (it is the gesture slide 04 pays off),
 * and not enough to become the subject. The 44px it gives back go to the
 * second card's photograph, which is the one showing a person.
 *
 * If you raise it, check what is actually in the band. If you lower it past
 * about 80, the Save tag walks off the top edge.
 */
const F_TOP_SLICE = 96;

/** A cream wash over the cut edge, so the column fades out rather than
 *  stopping at a hard line. react-native-svg rather than a gradient library —
 *  it is already a dependency, and this is the app's only gradient. */
function Fade({ edge }: { edge: 'top' | 'bottom' }) {
  const id = `feedFade_${edge}`;
  return (
    <View style={[s.fade, edge === 'top' ? s.fadeTop : s.fadeBottom]} pointerEvents="none">
      {/* The Svg carries its own width/height rather than inheriting them from
          a style — an `<svg>` positioned by CSS alone measured 0×0 on
          react-native-web, so the wash was in the tree and invisible. */}
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1={edge === 'top' ? '0' : '1'} x2="0" y2={edge === 'top' ? '1' : '0'}>
            <Stop offset="0" stopColor={palette.cream} stopOpacity={1} />
            <Stop offset="1" stopColor={palette.cream} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function FeedCard({
  look,
  anatomy,
  imgH,
}: {
  look: FeedLook;
  anatomy: boolean;
  imgH: number;
}) {
  const editorial = isEditorial(look);
  return (
    <View style={s.fcard}>
      <View style={s.fhead}>
        <Text style={s.fhandle} numberOfLines={1}>
          {editorial ? '@house' : look.by}
        </Text>
        <Text style={s.fmeta} numberOfLines={1}>
          {editorial ? 'editorial' : 'from the room'}
        </Text>
      </View>

      <View style={[s.fimg, { height: imgH }]}>
        {look.image ? <Image source={look.image} style={s.fill} resizeMode="cover" /> : null}
        {anatomy ? (
          <View style={s.savePieces}>
            <Text style={s.savePiecesLabel}>Save pieces</Text>
            <View style={s.savePiecesCount}>
              <Text style={s.savePiecesCountLabel}>{look.pieces.length}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={s.frow}>
        {/* ⚠ DISPLAY TEXT, NOT A CONTROL. domain/tags.ts: tags are not
            clickable, not filterable, and must never reach the feed sampler.
            On a still slide that is free — do not make it a Pressable. */}
        <Text style={s.ftag} numberOfLines={1}>
          #{look.tags[0]?.replace(' ', '') ?? ''}
        </Text>
        {/* The positive count only, and only when there is one. There is no
            reaction cluster on this slide and no negative anywhere near it —
            invariant 10. `thumbs_up` is the heart's own value (it is the like,
            see ui/Reactions), so nothing here has to sum a vocabulary. */}
        <View style={s.heart}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M12 20.5 4.2 13a5 5 0 0 1 7.1-7l.7.7.7-.7a5 5 0 1 1 7.1 7Z"
              fill={palette.ink}
              stroke={palette.ink}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={s.heartCount}>{look.reactions.thumbs_up ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * The clip. The column is absolutely positioned and centred on its own middle
 * — `top: 50%` less half its height — which puts the MIDDLE card dead centre
 * whatever height the media box actually gets, and leaves the first and third
 * hanging out of the frame at both ends. Three equal cards is what makes that
 * one line of arithmetic work; give one of them a different height and the
 * middle stops being centred.
 */
function ClippedFeed() {
  /* 0 until the first layout pass. The column is not rendered at 0 — a card
     with no width would lay out at the wrong height and then jump. */
  const [width, setWidth] = useState(0);

  const imgH = Math.round((width - F_PAD_X * 2) / PHOTO_RATIO);
  const cardH = imgH + F_CHROME_H;

  return (
    <View
      style={s.feedwrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        /* Pulled up by all but the last `F_TOP_SLICE` of the first card, so
           the seam between card one and card two lands inside the frame. Not
           centred on a card any more — with a card taller than the box there
           is no centre worth hitting, and centring showed one card and no
           seam at all. */
        <View style={[s.feed, { marginTop: -(cardH - F_TOP_SLICE) }]}>
          {FEED_TRIO.map((look, i) => (
            <FeedCard key={i} look={look} anatomy={i === ANATOMY_AT} imgH={imgH} />
          ))}
        </View>
      ) : null}
      <Fade edge="top" />
      <Fade edge="bottom" />
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   04 · THE SHEET, OVER A REAL LOOK
   ══════════════════════════════════════════════════════════════════════════ */

/** The pictured look. The rows below come OUT OF ITS OWN `pieces`, so the
 *  sheet can never list a garment that is not in the photograph. */
const SHOWCASE = FEED_LOOKS[0];

/** Indices into `SHOWCASE.pieces`. The last one is shown as saved-not-taken,
 *  so both row states are on the slide. */
const SHOWCASE_ROWS = [0, 3, 4] as const;
const SAVED_ROW = 4;

function PieceRow({ name, saved }: { name: string; saved: boolean }) {
  const image = garment(name)?.image;
  return (
    <View style={s.prow}>
      <View style={s.pthumb}>
        {image ? <Image source={image} style={s.pthumbPhoto} resizeMode="contain" /> : null}
      </View>
      <Text style={s.pname} numberOfLines={2}>
        {name}
      </Text>
      {/* EVERY piece costs the same — `TOKEN_COST_PER_TAKE`. The mockup's
          per-garment prices are not a thing the product has. */}
      <View style={saved ? s.costOff : s.cost}>
        <Text style={saved ? s.costOffLabel : s.costLabel}>
          {saved ? 'Saved' : `${TOKEN_COST_PER_TAKE} token${TOKEN_COST_PER_TAKE === 1 ? '' : 's'}`}
        </Text>
      </View>
    </View>
  );
}

function LookWithSheet() {
  const pieces = SHOWCASE?.pieces ?? [];
  return (
    <View style={s.lookCard}>
      {/* The card is cut to PHOTO_RATIO, so `cover` fills it with nothing to
          crop — see the constant. */}
      {SHOWCASE?.image ? (
        <Image source={SHOWCASE.image} style={s.fill} resizeMode="cover" />
      ) : null}

      <View style={s.sheet}>
        <View style={s.shead}>
          <Text style={s.sheadLabel}>{pieces.length} pieces in this look</Text>
          {/* A balance, so the prices below have something to be spent from.
              `TOKENS_PER_JUDGING_ROUND` — what one round pays, which is the
              first balance a real user will ever hold. */}
          <View style={s.balance}>
            <Text style={s.balanceNum}>{TOKENS_PER_JUDGING_ROUND}</Text>
            <Text style={s.balanceLabel}>yours</Text>
          </View>
        </View>

        {SHOWCASE_ROWS.map((i) => {
          const name = pieces[i];
          return name ? <PieceRow key={name} name={name} saved={i === SAVED_ROW} /> : null;
        })}
      </View>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */

function Media({ index, reduced }: { index: number; reduced: boolean }) {
  /* Every rotation on every slide goes through this one helper, so reduced
     motion zeroes all of them at once. A static tilt is still vestibular noise
     for some people and it carries no information. */
  const tilt = (deg: number) => (reduced ? 0 : deg);

  if (index === 0) return <SlotGrid tilt={tilt} />;
  if (index === 1) return <HeadToHead tilt={tilt} />;
  if (index === 2) return <ClippedFeed />;
  return <LookWithSheet />;
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

  /* ── 01 ─────────────────────────────────────────────────────────────── */
  slots: { flex: 1, width: '100%', gap: 10, padding: SLOT_TILT_INSET },
  slotRow: { flex: 1, flexDirection: 'row', gap: 10 },
  slot: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** 86% so the cutout sits inside the cell with air around it, the way it
   *  does in the builder's slot strip. */
  slotPhoto: { width: '86%', height: '86%' },
  slotEmpty: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: border.mid,
    borderStyle: 'dashed',
    /* NON-TEXT use of greyDecor, which is what it is for. */
    borderColor: palette.greyDecor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLabel: { ...T.micro, color: palette.greyMute },
  tick: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 19,
    height: 19,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── 02 ─────────────────────────────────────────────────────────────── */
  vs: { flex: 1, width: '100%' },
  brief: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 11.5,
    lineHeight: 15,
    textAlign: 'center',
    color: palette.grey,
  },
  pair: { flex: 1, flexDirection: 'row', gap: 9, marginTop: 9 },
  plate: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    overflow: 'hidden',
  },
  /** Same corner, same offsets and the same label recipe as SpreadCard's
   *  votePill — this is the control the slide is previewing. */
  votePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: palette.accent,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  votePillLabel: { ...T.micro, color: palette.ink },
  earn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
  },
  earnLabel: { ...T.micro, fontSize: 10, letterSpacing: 1.1, color: palette.grey },
  coin: {
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coinLabel: { ...T.micro, fontSize: 10, letterSpacing: 1.1, color: palette.ink },

  /* ── 03 ─────────────────────────────────────────────────────────────── */
  feedwrap: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    /* `cream` is SURFACE (see tokens) — a pinned panel over the page, which is
       what a feed column is. The fades resolve to the same value. */
    backgroundColor: palette.cream,
    borderWidth: border.hair,
    borderColor: palette.rule,
    overflow: 'hidden',
  },
  feed: { position: 'absolute', left: 0, right: 0, top: 0 },
  fcard: {
    paddingHorizontal: F_PAD_X,
    paddingVertical: F_PAD_Y,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  fhead: { height: F_HEAD_H },
  fhandle: { fontFamily: 'Archivo_700Bold', fontSize: 13, lineHeight: 15.6, color: palette.ink },
  fmeta: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.greyMute,
    marginTop: 2,
  },
  fimg: {
    width: '100%',
    marginTop: F_GAP,
    borderRadius: radius.sm,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
  },
  /** The real tag, shrunk: accent fill, ink count box, and the ground-coloured
   *  keyline that stops the lime floating on the photograph. */
  savePieces: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.accent,
    borderWidth: border.key,
    borderColor: palette.cream,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  savePiecesLabel: { ...T.micro, color: palette.ink },
  savePiecesCount: {
    width: 15,
    height: 15,
    borderRadius: radius.xs,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePiecesCountLabel: { fontFamily: 'Archivo_700Bold', fontSize: 9, color: palette.cream },
  frow: {
    height: F_META_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7,
  },
  ftag: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, lineHeight: 14.4, color: palette.link, flexShrink: 1 },
  heart: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heartCount: { fontFamily: 'Archivo_700Bold', fontSize: 12, lineHeight: 14.4, color: palette.ink },
  fade: { position: 'absolute', left: 0, right: 0 },
  fadeTop: { top: 0, height: 22 },
  fadeBottom: { bottom: 0, height: 46 },

  /* ── 04 ─────────────────────────────────────────────────────────────── */
  lookCard: {
    height: '100%',
    aspectRatio: PHOTO_RATIO,
    borderRadius: radius.lg,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    overflow: 'hidden',
  },
  /** Slid up over the lower part of the look, ink-topped and rounded on the
   *  two upper corners — the same shape as the real sheet. */
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.creamRaised,
    borderTopWidth: border.hair,
    borderTopColor: palette.ink,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 11,
  },
  shead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  sheadLabel: { ...T.micro, fontSize: 8.5, letterSpacing: 1, color: palette.ink },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  balanceNum: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 14,
    lineHeight: 13,
    color: palette.ink,
  },
  balanceLabel: { ...T.micro, fontSize: 8, letterSpacing: 1, color: palette.greyMute },
  prow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    borderTopWidth: border.hair,
    borderTopColor: palette.rule,
  },
  pthumb: {
    width: 30,
    height: 30,
    borderRadius: radius.xs,
    backgroundColor: palette.creamSunk,
    borderWidth: border.hair,
    borderColor: palette.rule,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pthumbPhoto: { width: '88%', height: '88%' },
  pname: {
    flex: 1,
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 10.5,
    lineHeight: 13,
    color: palette.ink,
  },
  cost: {
    backgroundColor: palette.accent,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  costLabel: { ...T.micro, fontSize: 8.5, letterSpacing: 1, color: palette.ink },
  /** Saved is FREE and grants nothing (see BottomSheet) — so it reads as an
   *  absence of a price, not as a cheaper one. No accent. */
  costOff: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  costOffLabel: { ...T.micro, fontSize: 8.5, letterSpacing: 1, color: palette.greyMute },
});

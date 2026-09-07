/**
 * THE `NEW` BADGE ON THE DAY'S CARD, AS A STARBURST — the one deliberately
 * playful mark in the app.
 *
 * ⟲ IT WAS UNRENDERED FOR THREE DAYS. It badged every state of the job card
 * for one round on 4 Sep, was replaced by a pale-green pill for all of them
 * the next, and came back on 7 Sep for ONE state only. That split is the
 * resolution, and both halves of it are right:
 *
 *   New          this. An invitation, not a status — and a badge breaking the
 *                border is a sticker where a badge inside it is a label.
 *   every other  `Badge` in ui/cards.tsx, a pill inside the card. 4 Sep's
 *   state        objection holds for `Completed`: a star hanging off a card
 *                with nothing left to do is a lot of shape for "done".
 *
 * See `s_star` in `(tabs)/today/index.tsx` for the offsets, which are
 * arithmetic against the title's first line and not a matter of taste. Nothing
 * else should pick this component up — a second sticker makes both look like a
 * mistake, which is the same reason the 12° tilt below is unique in the app.
 *
 * It overlaps the card's top-right corner rather than sitting inside it, which
 * is the whole point: a badge inside the border is a label, a badge breaking
 * the border is a sticker. The card is the hero of the screen and this is the
 * thing that stops it reading as an admin panel.
 *
 * ══ WHY IT IS A PATH AND NOT A GLYPH OR AN IMAGE ══
 *
 * Drawn from the point count and two radii, so it takes the ink and accent
 * tokens like everything else and needs no asset at any density. A `✦` in a
 * text node would render in the platform's font — the same problem that made
 * the reaction thumbs inconsistent per device and unable to take the ink
 * colour.
 *
 * ══ THE TILT IS 12°, AND IT IS THE ONLY ROTATED TEXT IN THE APP ══
 *
 * Enough to read as hand-placed, little enough to stay legible. It follows the
 * reference exactly. Nothing else should pick this up — a second rotated label
 * somewhere makes both look like a mistake.
 *
 * ⚠ NOT A COLOUR CODE. The accent fill is the app's emphasis pair (always with
 * `accentEdge`), and the quiet variant is the sunk ground with a hairline. No
 * red, no green: `palette.error` is validation-only and a coloured status chip
 * is on the do-not-re-propose list.
 */

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { palette, border } from '@/theme/tokens';

/** Twelve, matching the reference. Fewer reads as a badge; many more reads as a
 *  sun and stops having points at all. */
const POINTS = 12;
/** Outer and inner radius as fractions of the box. The gap between them is the
 *  spikiness — closer together and it is a circle with a rough edge. */
const OUTER = 0.5;
const INNER = 0.33;

/**
 * The points, alternating outer and inner, as an SVG polygon. Started at -90°
 * so a point sits at the top rather than a valley, which is what makes it look
 * placed rather than spun.
 */
function starPoints(size: number): string {
  const c = size / 2;
  return Array.from({ length: POINTS * 2 }, (_, i) => {
    const r = (i % 2 === 0 ? OUTER : INNER) * size;
    const a = (Math.PI * i) / POINTS - Math.PI / 2;
    return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

/**
 * THE WORD HAS TO FIT INSIDE THE INNER CIRCLE, not the outer one — text
 * crossing the spikes reads as a mistake rather than as a badge.
 *
 * The star's usable width is `INNER * 2 * size`, about 49pt at the default, and
 * the label rotates so its bounding box is wider than its line. "New" fits at
 * 13; "Complete" is eight characters and does not, so the size steps down
 * rather than the star growing — a badge that changes size between states
 * jumps as the day progresses, which is worse than a smaller word.
 */
function fontFor(label: string, size: number): number {
  const usable = INNER * 2 * size * 0.84;
  /* Archivo Black runs about 0.62em per character at these sizes. Measured off
     the rendered widths rather than guessed. */
  return Math.min(13, Math.max(8.5, usable / (label.length * 0.62)));
}

export function StarBadge({
  label,
  tone = 'accent',
  size = 74,
}: {
  label: string;
  tone?: 'accent' | 'quiet';
  size?: number;
}) {
  const accent = tone === 'accent';
  const fontSize = fontFor(label, size);
  return (
    <View
      style={[s.wrap, { width: size, height: size }]}
      /* One label for the whole mark — the star is decoration and the word is
         the content, so a screen reader should get the word once. */
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Polygon
          points={starPoints(size)}
          fill={accent ? palette.accent : palette.creamSunk}
          stroke={accent ? palette.accentEdge : palette.rule}
          strokeWidth={accent ? border.mid : border.hair}
        />
      </Svg>
      <Text style={[s.label, { fontSize, lineHeight: fontSize * 1.15 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: 'Archivo_900Black',
    letterSpacing: 0.2,
    color: palette.ink,
    /* See the header: 12°, and nothing else in the app is rotated. */
    transform: [{ rotate: '-12deg' }],
  },
});

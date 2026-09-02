/**
 * The render stage — the wireframe figure with garment shapes dropping onto it,
 * one per second, while the "AI render" is notionally happening.
 *
 * NOTHING RENDERS BEFORE THE USER COMMITS. The flow is:
 *   pick → view them together (a CONFIRMATION, not a render) → enter → generate
 *
 * There is nothing to re-roll, which is what keeps brief invariant 5 ("the
 * render is faithful") intact without any extra machinery. Do not add a
 * "try again" button here.
 *
 * REVERSED, DO NOT RE-PROPOSE: rendering inside Create before submission.
 *
 * These SVG paths are placeholders standing in for Jack's pipeline. Replacing
 * this component with a real image and a real progress signal is the intended
 * change — the surrounding flow should not need to move.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { palette, border } from '@/theme/tokens';

const FIG_STROKE = '#B4AEA2';
const GAR_FILL = '#CFCABD';
const GAR_STROKE = '#A9A395';

/** One shape per garment, in slot order. The last one is Klein-highlighted, as
 *  the prototype does for the accessory. */
const GARMENT_SHAPES = [
  <Path key="0" d="M60 78c0-11 20-17 45-17s45 6 45 17l10 44h-22l-4 20h-58l-4-20h-22z" />,
  <Rect key="1" x={82} y={70} width={46} height={40} rx={2} />,
  <Rect key="2" x={86} y={118} width={38} height={52} rx={2} />,
  <Rect key="3" x={88} y={172} width={14} height={10} rx={2} />,
  <Path key="4" d="M146 96c8 2 13 8 13 14s-5 11-13 11" />,
];

const STEP_MS = 620;

export function RenderStage({
  pieces,
  onComplete,
  height = 196,
}: {
  pieces: readonly string[];
  onComplete?: () => void;
  height?: number;
}) {
  const [placed, setPlaced] = useState(0);

  useEffect(() => {
    if (placed >= pieces.length) {
      const t = setTimeout(() => onComplete?.(), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPlaced((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [placed, pieces.length, onComplete]);

  return (
    <View>
      <View style={[s.stage, { height }]}>
        <Svg width="100%" height="100%" viewBox="0 0 300 196">
          <G fill="none" stroke={FIG_STROKE} strokeWidth={1.4}>
            <Circle cx={150} cy={34} r={15} />
            <Path d="M150 49v24M118 76c0-6 14-11 32-11s32 5 32 11M118 76l-9 46M182 76l9 46M126 122h48M132 122l-5 60M168 122l5 60" />
          </G>
          <G fill={GAR_FILL} stroke={GAR_STROKE} strokeWidth={1.2}>
            {GARMENT_SHAPES.slice(0, placed).map((shape, i) =>
              i === GARMENT_SHAPES.length - 1
                ? // the highlighted accessory
                  <G key="hi" fill={palette.accent} stroke={palette.accentEdge}>
                    {shape}
                  </G>
                : shape,
            )}
          </G>
        </Svg>
        <View style={s.caption}>
          <Text style={s.captionText}>
            {placed >= pieces.length ? 'AI render · done' : 'AI render · in progress'}
          </Text>
        </View>
      </View>

      <View style={s.list}>
        {pieces.map((p, i) => {
          const done = i < placed;
          return (
            <View key={p} style={[s.listRow, i === pieces.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={[s.listName, done && { color: palette.ink }]}>{p}</Text>
              <Text style={[s.listState, done && { color: palette.ink }]}>
                {done ? 'placed' : 'waiting'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** The finished render — a single larger figure, fully dressed. */
export function RenderedFigure({ height = 330 }: { height?: number }) {
  return (
    <View style={[s.stage, { height }]}>
      <Svg width="100%" height="100%" viewBox="0 0 320 330">
        <G fill={GAR_FILL} stroke={GAR_STROKE} strokeWidth={1.2}>
          <Path d="M96 78c0-12 28-19 64-19s64 7 64 19l14 100h-30l-5 128h-86l-5-128h-30z" />
          <Rect x={120} y={180} width={80} height={112} rx={3} />
          <Path d="M110 178h100l-4 22h-92z" />
          <Rect x={126} y={292} width={30} height={22} rx={3} />
          <Rect x={164} y={292} width={30} height={22} rx={3} />
          <G fill={palette.accent} stroke={palette.accentEdge}>
            <Path d="M212 128c14 4 24 12 24 22s-10 17-24 17" />
          </G>
        </G>
        <G fill="none" stroke={FIG_STROKE} strokeWidth={1.4}>
          <Circle cx={160} cy={38} r={21} />
          <Path d="M160 59v19" />
        </G>
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  stage: {
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamSunk,
    overflow: 'hidden',
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
  list: {
    marginTop: 14,
    borderWidth: border.hair,
    borderColor: palette.rule,
    backgroundColor: palette.creamRaised,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  listName: { fontFamily: 'Archivo_500Medium', fontSize: 11.5, color: palette.greyMute },
  listState: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: palette.greyMute,
  },
});

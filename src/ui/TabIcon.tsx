/**
 * Tab bar icons, ported from the inline SVG in the prototype's <nav class="tabbar">.
 *
 * The prototype repeated that nav element FOURTEEN TIMES across the flat views.
 * Here it exists once, as the tab navigator in app/(tabs)/_layout.tsx. That is
 * the main structural difference between the prototype and this app.
 *
 * Stroke weight goes 1.6 → 2.2 when the tab is active, matching `.tabbar a.on svg`.
 */

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { palette, border } from '@/theme/tokens';

export type TabKey = 'today' | 'magazine' | 'create' | 'wardrobe' | 'you';

const PATHS: Record<TabKey, React.ReactNode> = {
  today: <Path d="M4 5h16M4 12h16M4 19h10" />,
  magazine: <Path d="M4 4h7v16H4zM13 4h7v16h-7z" />,
  create: <Path d="M12 5v14M5 12h14" />,
  wardrobe: <Path d="M4 8h16v12H4zM8 8V5h8v3" />,
  you: (
    <>
      <Circle cx={12} cy={8} r={3.4} />
      <Path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </>
  ),
};

/**
 * `badge` is the async render's only persistent signal: a finished render you
 * have not looked at yet. It replaces the chip that used to float in every
 * screen's header (see state/submission.ts) — on a tab it says *where* the
 * thing is, which the header chip never did, and it costs no page furniture.
 *
 * Accent fill with its ink keyline, per the token rules — accent is a fill
 * colour only, and it needs the edge to separate it from the cream tab bar.
 */
export function TabIcon({
  name,
  focused,
  badge,
}: {
  name: TabKey;
  focused: boolean;
  badge?: boolean;
}) {
  return (
    <View style={{ width: 21, height: 21 }}>
      <Svg
        width={21}
        height={21}
        viewBox="0 0 24 24"
        fill="none"
        stroke={focused ? palette.ink : palette.greyDecor}
        strokeWidth={focused ? 2.2 : 1.6}
      >
        {PATHS[name]}
      </Svg>
      {badge ? <View style={s.badge} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: border.hair,
    borderColor: palette.accentEdge,
    backgroundColor: palette.accent,
  },
});

/** The star / bookmark used on the magazine save button. */
export function SaveIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? palette.cream : 'none'} stroke={filled ? palette.cream : palette.ink} strokeWidth={2}>
      <Path d="M6 4h12v17l-6-4-6 4z" />
    </Svg>
  );
}

/** Open / locked marks on the month-ahead list. */
export function LockIcon({ open }: { open: boolean }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={open ? palette.ink : palette.greyDecor} strokeWidth={1.7}>
      {open ? (
        <Path d="M5 12l5 5L19 8" />
      ) : (
        <>
          <Path d="M5 11h14v9H5z" />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      )}
    </Svg>
  );
}

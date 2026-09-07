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

/**
 * TAB ORDER IS THE PRODUCT'S ORDER — see app/(tabs)/_layout.tsx, which builds
 * the bar from this list.
 *
 * It lives here rather than in the layout because a second thing now needs it:
 * the magazine's take-a-piece animation flies a thumbnail at the Wardrobe tab,
 * and it works out where that tab is from this array's index. Two hard-coded
 * orders would drift apart the first time a tab moved.
 *
 * ══ CREATE IS NOT IN THE BAR (Katya, 4 Sep) ══
 *
 * It is FOUR TABS now. Create moved OUT of the tabs group entirely, to
 * `app/create/` — it is entered from a banner at the top of the Wardrobe,
 * which is where the pieces you build from already live. Keeping it as a
 * hidden tab was tried twice and trapped the user on it both times; see
 * (tabs)/_layout.tsx.
 *
 * This list is the VISIBLE bar, so removing it here is what moves the flying
 * thumbnail: `tabCentreFraction` divides by this length, and Wardrobe went
 * from column 4 of 5 to column 3 of 4. Nothing needed to be told that
 * separately, which is the reason the order lives in one place.
 */
/** The keys that are actually IN the bar. Narrower than `TabKey`, which still
 *  carries `create` because the icon set and the route name do — typing the
 *  order as plain `TabKey[]` let the layout build an href for a tab that no
 *  longer exists, and expo-router's typed routes caught it. */
export type VisibleTabKey = Exclude<TabKey, 'create'>;

export const TAB_ORDER: readonly VisibleTabKey[] = ['today', 'magazine', 'wardrobe', 'you'];

/** Horizontal centre of a tab, as a fraction of screen width. The bar lays its
 *  items out in equal flex columns, so the centre of column i of n is
 *  (i + 0.5) / n — no measurement needed, and it cannot fall out of step with
 *  the bar because both read TAB_ORDER. */
export const tabCentreFraction = (key: VisibleTabKey): number => {
  const i = TAB_ORDER.indexOf(key);
  return (i < 0 ? 0 : i + 0.5) / TAB_ORDER.length;
};

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
export function LockIcon({ open, size = 15 }: { open: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={open ? palette.ink : palette.greyDecor} strokeWidth={1.7}>
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

/** The magazine's search affordance. Fills its stroke when a garment filter is
 *  active, so the icon reports state as well as offering the action — the rail
 *  next to it has no room for a second chip saying "search is on". */
export function SearchIcon({ on }: { on?: boolean }) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 24 24"
      fill="none"
      stroke={palette.ink}
      strokeWidth={on ? 2.4 : 1.8}
      strokeLinecap="round"
    >
      <Circle cx={10.5} cy={10.5} r={6.5} />
      <Path d="M15.5 15.5L21 21" />
    </Svg>
  );
}

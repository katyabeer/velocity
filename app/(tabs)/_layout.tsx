/**
 * THE FIVE TABS. This is the file the whole port exists to produce.
 *
 *   Today      the day's spine        yesterday's result → today's job → build
 *                                     → judge → the month ahead
 *   Magazine   appetite, and the only shop
 *   Create     free posting, no job, no score
 *   Wardrobe   inventory and record
 *   You        trajectory, not activity
 *
 * In the prototype this <nav> was copy-pasted into fourteen screens and the
 * "tabs" were just more siblings. Here each tab is its own stack, so pushing
 * the builder keeps you in Today, and switching tabs keeps your place.
 *
 * TAB ORDER IS THE PRODUCT'S ORDER — Today first because the day is the spine,
 * Magazine second because that is where clothes come from. Don't reorder them
 * for symmetry.
 */

import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { TabIcon, type TabKey } from '@/ui/TabIcon';
import { palette, border } from '@/theme/tokens';
import { type as T } from '@/theme/type';
import { useRenderBadge, type RenderLane } from '@/state/submission';

/** `lane` marks the two tabs that can own a finished-but-unseen render. The
 *  badge lives here rather than in every screen's header — see
 *  state/submission.ts on why the floating chip was retired. */
const TABS: readonly { name: string; key: TabKey; label: string; lane?: RenderLane }[] = [
  { name: 'today', key: 'today', label: 'Today', lane: 'brief' },
  { name: 'magazine', key: 'magazine', label: 'Magazine' },
  { name: 'create', key: 'create', label: 'Create', lane: 'create' },
  { name: 'wardrobe', key: 'wardrobe', label: 'Wardrobe' },
  { name: 'you', key: 'you', label: 'You' },
];

export default function TabsLayout() {
  /* Two fixed subscriptions rather than a hook inside the map — hook order has
     to be stable, and the tab list is a constant anyway. */
  const briefReady = useRenderBadge('brief');
  const createReady = useRenderBadge('create');
  const badgeFor = (lane?: RenderLane) =>
    lane === 'brief' ? briefReady : lane === 'create' ? createReady : false;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.bar,
        tabBarLabelStyle: [T.tab, s.label],
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.greyDecor,
        tabBarItemStyle: { paddingTop: 8 },
        sceneStyle: { backgroundColor: palette.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarIcon: ({ focused }) => (
              <TabIcon name={t.key} focused={focused} badge={badgeFor(t.lane)} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: palette.cream,
    borderTopWidth: border.heavy,
    borderTopColor: palette.ink,
    /* The prototype's tab bar had no shadow and no translucency — it is a
       newspaper rule, not a floating bar. */
    elevation: 0,
    shadowOpacity: 0,
  },
  label: { marginTop: 2 },
});

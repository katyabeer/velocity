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
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { TabIcon, TAB_ORDER, type TabKey } from '@/ui/TabIcon';
import { palette, border } from '@/theme/tokens';
import { type as T } from '@/theme/type';
import { useRenderBadge, type RenderLane } from '@/state/submission';

/** `lane` marks the two tabs that can own a finished-but-unseen render. The
 *  badge lives here rather than in every screen's header — see
 *  state/submission.ts on why the floating chip was retired.
 *
 *  ORDER COMES FROM TAB_ORDER (ui/TabIcon.tsx), which the magazine's
 *  fly-to-wardrobe animation also reads to find the target tab. Keep the order
 *  there, not here. */
const META: Record<TabKey, { label: string; lane?: RenderLane }> = {
  today: { label: 'Today', lane: 'brief' },
  magazine: { label: 'Magazine' },
  /* Not in the bar any more — kept so the record stays exhaustive over
     TabKey, and so its label is there if it ever comes back. */
  create: { label: 'Create' },
  /* CARRIES THE CREATE LANE'S BADGE. The dot means "the look you made is
     ready", and the badge has to sit on the tab that leads to it — which is
     Wardrobe now, because the banner at the top of it is the only way into
     Create. Without this the async freestyle render would finish with nothing
     anywhere to say so, which is the one thing the badge exists for. */
  wardrobe: { label: 'Wardrobe', lane: 'create' },
  you: { label: 'You' },
};

const TABS = TAB_ORDER.map((key) => ({ name: key, key, label: META[key].label, lane: META[key].lane }));

/**
 * ══ CREATE IS NOT IN THIS FOLDER ANY MORE (Katya, 4 Sep) ══
 *
 * It moved to `app/create/`, a root-stack route alongside `casting` — because
 * a flow you enter from a banner and leave again is not a tab, and pretending
 * otherwise did not work. Both ways of keeping it here as a hidden tab FAILED
 * THE SAME WAY, and the failure is worth recording so nobody retries them:
 *
 *   · `href: null` — the screen renders when pushed, but the bar can no longer
 *     transition away from it.
 *   · `tabBarItemStyle: { display: 'none' }` — identical symptom.
 *
 * In both cases pressing another tab changed the URL and left the Create
 * screen on screen, every tab dead. A user who opened Create was TRAPPED. It
 * is not the `tabPress` listener below: the same thing happens with the
 * listener removed entirely.
 */

/**
 * PRESSING A TAB TAKES YOU TO THAT TAB'S HOME. Every tab has one, and this is
 * what makes the tab bar an escape hatch rather than a set of five bookmarks.
 *
 * It has to be explicit. React Navigation pops a focused tab's stack to the top
 * for free, but that never fired here: on web the bar renders real links, so
 * the press is handled as link navigation and `tabPress` default behaviour
 * never runs. The symptom Katya hit was the challenge-complete screen — tapping
 * Today did nothing at all, because that screen was the entire Today stack (see
 * today/_layout.tsx, which now anchors `index` beneath it).
 *
 * It navigates the nested stack BY NAME rather than dispatching a targeted
 * `popToTop`. A tab route's `state` carries its `routes` and `index` but NOT a
 * `key` (it is a rehydrated partial state), and a stack action with no target
 * bubbles UP to the root stack rather than down into the tab — which would pop
 * the wrong navigator entirely. Navigating to a route already in the stack
 * unwinds to it, which is the same outcome by a safer route.
 *
 * ══ IT CAME BACK, AND THE LISTENER WAS ONLY HALF THE FIX (4 Sep) ══
 *
 * Katya hit the same dead Today tab on the same screen. The listener was fine;
 * the LINK underneath it was not. React Navigation builds each tab's `href`
 * from that tab's remembered route, so after the evening's replace chain the
 * Today tab rendered as `<a href="/today/rendering">` — a link pointing into
 * the middle of its own stack. Clicking it was a no-op: the target is already
 * inside the focused tab, so nothing moved, and the press never reached the
 * listener because the anchor handled it.
 *
 * Two changes, and both are needed:
 *   · `href` is PINNED to the tab's root below, so the link can never address
 *     an inner screen however the stack was reshaped.
 *   · the listener no longer returns early when `nested.index` is falsy. That
 *     guard existed to "defer to the default at the root", but it also meant
 *     one bad read of a partial state left the press unhandled. Navigating to
 *     `index` when already on `index` is a no-op, so there is nothing to
 *     defer to and nothing to lose.
 */
function homeOnTabPress({
  navigation,
  route,
}: {
  navigation: { navigate: (name: string, params?: object) => void };
  route: RouteProp<ParamListBase, string>;
}) {
  return {
    tabPress: (e: { preventDefault: () => void }) => {
      /* Unconditional. Going to `index` when already on `index` does nothing,
         which is cheaper than reading a partial state to find out. */
      e.preventDefault();
      navigation.navigate(route.name, { screen: 'index' });
    },
  };
}

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
          listeners={homeOnTabPress}
          options={{
            title: t.label,
            /* PINNED. Without this the bar renders whatever route the tab
               happens to be showing — `/today/rendering` after the evening's
               replace chain — and the link then points inside the tab it is
               meant to reset. */
            href: `/(tabs)/${t.name}`,
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

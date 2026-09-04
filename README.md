# The styling game — React Native

Port of `velocity-A-ritual.v2.html` (21 screens) to Expo + expo-router + TypeScript.
All 21 prototype screens are present as routes. The name is unresolved — see
`src/config/app.ts`.

## Getting it running

```bash
npm install
npx expo install --fix     # aligns every package to the installed Expo SDK
npm start                  # then i / a, or scan with Expo Go
```

Verified on **Expo SDK 53.0.27 · React Native 0.79.2 · expo-router 5.0.7**, Node 22.

```bash
npm run typecheck    # tsc --noEmit — currently clean, strict, noUncheckedIndexedAccess
npm test             # 53 assertions over the domain layer — currently 53/53
```

## Where things are

`CLAUDE.md` is the working brief for Cursor — invariants, reversed decisions, open
questions, and the map of where the prototype's state object went. Read that first.

```
app/          routes; the navigation tree is the folder structure
src/domain/   the rules, pure and tested
src/data/     fixtures
src/state/    six zustand stores
src/theme/    tokens.ts · type.ts
src/ui/       shared components
tests/        node:test
```

## What changed from the prototype, deliberately

| prototype | here | why |
|---|---|---|
| 21 sibling `<section>`s toggled by a CSS class | 5 tab stacks + an onboarding stack + one modal | this was the point of the exercise |
| the tab bar markup, copy-pasted 14 times | one tab navigator | a copy change now lands once |
| one flat `S` object, ~45 keys | six typed stores, one per domain | a screen subscribes only to what it reads |
| rules inlined in click handlers | `src/domain/*`, pure and tested | the settlement maths has been wrong before; now a test fails instead of a demo |
| the feed rebuilt entirely on every state change | virtualised `FlatList`, per-card re-render | `refreshFeed()` redrew every card to update one reaction count |
| HUD side panel with Day 1 / 2 / Established buttons | `ACTIVE_DAY` in `src/config/testState.ts` | your call — it sat beside the prototype and a participant would read it (open question E, now closed) |
| a drawn fake iOS status bar (9:41, signal bars) | the real one, plus safe-area insets | the only place the port intentionally drops pixels |
| the product name hard-coded throughout | `APP_NAME` in `src/config/app.ts` | the client rejected *Velocity*; renaming is one line plus `app.json` |
| `S.pinch` internally, "tokens" in the UI | `tokens` everywhere | the naming is a regulatory position, and a stale variable name is how it leaks back |

Dead code from the prototype was **not** carried over: `MOVERS`, `EDITS`, `STUDY` and the
Taste Test data were unreachable once the magazine went to three content types.

## ⚠ Not yet verified — needs your eye in Cursor

The typecheck and the tests pass, and neither of them can see a screen. This port was
written without a simulator, so **everything below is unconfirmed** and is the first
thing to look at:

1. **All layout.** Every dimension was converted from CSS px to RN points 1:1 against a
   390×844 reference. Line heights were computed from unitless CSS ratios, so text blocks
   are where errors will cluster — particularly the display faces with their tight leading
   (`pageTitle` at 50/42, `hero` at 34/29).
2. **Percentage-width grids.** CSS `calc(33.333% - 4px)` became `width: '31.5%'` with a
   flex gap in `ui/pieces.tsx` and `ui/cards.tsx`. Three-across grids are the likeliest
   thing to wrap wrongly.
3. **The tab bar height and safe-area inset** on a device with a home indicator.
4. **`ui/layout.tsx` `Scroll`** — whether every screen's footer actually pins. The flex
   gotcha from the prototype's hazard list is the failure mode.
5. **The bottom sheet** as a `Modal` rather than an absolutely-positioned div — the dim
   layer and the 76% max height in particular.
6. **`react-native-svg` paths** in `ui/RenderStage.tsx` and `ui/TabIcon.tsx`, lifted
   verbatim from inline SVG.
7. **Fonts loading at all.** Export names are verified against the installed packages, but
   whether Big Shoulders 900 actually looks like the prototype at 50pt is a visual call.
8. **The render animation timing** — 620ms a step, ported as `setTimeout` in an effect.
   It should feel like about four seconds total. NOTE: the brief flow no longer plays
   this at all (the render is async now); `RenderStage` is only reachable from the
   model presentation on `today/entered.tsx`.

### Verified on 3 Sep 2026, in a browser at 375×812

The first-run walkthrough was run end to end and looked at, on all three test days:
onboarding → first challenge → builder (all 60 garments) → composed preview → casting →
"we're building your look" → five votes → challenge complete → the finished look, plus
the Today card in all four of its states, the tab dots on both lanes, and Create's
empty state. Days 2 and 3 were regression-checked (owned-pieces pool, the two loaners,
legacy fixture names falling back to text tiles).

### Verified on 3 Sep 2026 (second pass — onboarding rework)

Walked the whole chain by tapping, at 375×812: the loading beat (3s, pulsing
dot, tap-to-skip), all four carousel slides forward and via Skip, sign-up by
tapping a method, the profile screen's empty-field validation and its mock
availability tick, and on into the builder. The carousel's eyebrow and heading
were measured on all four slides and sit at an identical y (130 / 151).

**Still unverified**, because a browser at 375×812 is not a phone:

- The pulsing dot on a real device. `useNativeDriver: true` on opacity and
  scale, which react-native-web ignores — the native driver path itself has
  not run.
- The keyboard on the profile screen. There is no `KeyboardAvoidingView`: the
  field sits high enough that it should be fine on a phone, and it is the only
  `TextInput` in the app, so this is the one screen where that assumption has
  never been tested.
- The token badge's tilt at native pixel density. A 2° rotation on a small
  element with a hairline border is where aliasing shows.

- The composed flat lay on a real device. It is `aspectRatio: 3/4` with absolutely
  positioned percentage boxes; that is the layout most likely to differ under RN's
  native layout engine rather than react-native-web's.
- `MIN_BOX_FRACTION` in `ui/ComposedFlatLay.tsx` — the legibility floor on true scale.
  It is one constant and it is a design call; see that file's header.
- The 20MB of garment cutouts on a cold native start. 60 × 1000×1000 PNG-24 with alpha
  is fine over a dev server and untested as a bundled asset load.
- The tab-icon dot at native pixel density (10pt circle, hairline border).

### Full regression pass, 4 Sep 2026

Static gates all clean: `tsc --noEmit`, 61/61 domain tests, `eslint .` (0 problems),
and a production `expo export -p web` with all 60 garment and 28 look assets bundled.

Runtime: every route loaded on all three test days (13 routes x 3), with
`console.error`, `window.onerror` and `unhandledrejection` captured throughout —
**zero errors, no error boundaries**. The full day flow was walked end to end on
Day 1 and Day 3 (build -> preview -> casting -> building -> five votes -> settled
-> back to Today), plus the wardrobe's three views and its removal drawer (both
answers), the magazine sheet down to a zero balance and on into Save for later,
and the Saved tab receiving it.

Two real bugs found and fixed by that pass, both pre-existing:

- `magazine/piece.tsx` called `router.back()` DURING RENDER as its
  no-focused-piece guard. React 19 flags it as a setState in another component's
  render, and it has nowhere to go on a cold load. Now `<Redirect>`.
- "1 PIECES" on the Saved tab. `pieceLabel` in `state/wardrobe.ts` now handles it.

## Carried-over known incomplete

- **The magazine filter rail is visually live but does not change the content pool.**
  Weighting rules unimplemented. Do not demo it as working —
  `FILTER_RAIL_IS_FUNCTIONAL` is `false` and a test asserts it.
- **Free-text tags are faked from a bank**, because the prototype had no keyboard. Wire a
  real `TextInput` — and read Jack's open question 3 first.
- **Look plates are tinted panels, not images.** When the renders arrive, add an `image`
  field in `data/looks.ts` and swap the fallback in `ui/LookPlate.tsx`; nothing else
  should need to move.
- **Everything is in-memory.** No persistence, no API, no auth. Sign-up is three buttons
  that navigate.

## Things worth deciding before Jo starts

1. **Wardrobe cap.** 99 in the prototype; the handover recommends 40 for the test build so
   the cap is reachable in a session. Currently 99 — `WARDROBE_CAP` in `domain/economy.ts`.
2. **Native platform count** — still unconfirmed with Jo. Expo Go covers iOS and Android
   without app-store friction, which is why the scaffold uses it.
3. **The live circuit-breaker.** `circuitBreaker()` in `domain/settlement.ts` says which
   lever is needed; it does not pull it. Version A cannot ship without one.
4. **Per-look settled splits.** Jack's open question 5 — they cannot be backfilled. If the
   pipeline is not writing them now, the spreads and the eye score have no data later.
# velocity

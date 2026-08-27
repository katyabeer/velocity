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
   It should feel like about four seconds total.

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

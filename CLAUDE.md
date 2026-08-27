# Working on this codebase

React Native port of the styling-game prototype (`velocity-A-ritual.v2.html`, 21 screens).
Client is **Frame 23**, agency is **No Fuzz Digital**, prototype audience is **ZOZO**.
Katya (Lead Product Designer) owns the design decisions. **Flag design calls for her to
overrule rather than silently embedding them.**

The authority on *why* anything is the way it is: `HANDOVER-v2.md`. This file is the
short version for someone editing code.

---

## Before you change anything

Read the header comment of the file you are editing. Every non-obvious decision in this
codebase has its reasoning written directly above the code, including the ones that look
like oversights. **If something looks wrong, check the comment before "fixing" it.**

Three files carry the load-bearing rules and are worth reading in full before a first
change:

| file | what it protects |
|---|---|
| `src/domain/settlement.ts` | the voting arithmetic. Has been wrong before |
| `src/domain/economy.ts` | "no judging, no clothes" — the whole economy |
| `src/domain/magazine.ts` | sample-don't-sort — the rule most likely to be broken |

---

## Invariants. Do not break these without asking Katya.

1. **No judging, no clothes.** Completing a ten-call round is how tokens arrive. Tokens
   are the only way a garment enters a wardrobe. Break this and version A becomes
   version B, which was rejected.
2. **Mark-then-mint.** Tokens land on the tenth call, never during. Minting on the spot
   lets someone cast one vote, take three pieces and leave.
3. **5 slots max, 3 min, one piece per slot** — briefs *and* freestyle.
4. **Once you enter, nothing can be changed.** No edit path, no re-roll. That is what
   keeps "the render is faithful" true with no extra machinery.
5. **Nothing renders before commit.** pick → look (a confirmation) → enter → render.
6. **Named bands, never numbers.** Five, cohort-relative, minimum cell size 12.
7. **Sample, don't sort.** Never weight the feed by popularity, reactions, token counts
   or placing. This is the single change that would quietly ruin the product.
8. **Never a live entry in the feed.** Only settled entries, free posts, house editorial.
9. **The room read-out reports movement, never level.**
10. **Reactions are on looks only**, and never feed the ranking.
11. **No comments anywhere.** The room votes; that is its entire vocabulary.
12. **No levels, no XP, no leaderboard.** Six fixed milestones.
13. **Copy-minting.** Taking a piece mints a copy — the owner loses nothing and is never
    told. No market, no expiry. This is deliberate regulatory distance from the Sorare and
    DraftKings precedents, not a simplification.
14. **Performance history never appears in the builder.** Wardrobe and result screen only.
15. **Builder filters are by garment type and nothing else.** Nothing is sorted by what
    "goes with" the brief — deciding that is the skill being tested.
16. **Nothing is bought, sold, traded, gifted or lost.**
17. **Judging opens only after entry closes** (20:00). The anti-copying rule is a
    consequence of the schedule, not a rule.
18. **Tokens, never "keeps" or "pinches"** — including in variable names. The naming is a
    regulatory position (R-G5, brief invariant 7).
19. **The rails question is soft.** A hard filter splits the garment pool, which splits the
    room, and multiplies the cold-start floor from ~125 DAU to ~375.

## Reversed. Do not re-propose.

A fresh session will be tempted by several of these. They were tried and rejected.

- Judging yesterday's closed brief
- Five magazine content types (cut to three for MVP)
- Rendering inside Create before submission
- Reactions on individual garments
- Red tags (read as aggressive; now green)
- Displaying remaining token quota as "pinches earned" (framed depletion as gain)
- Three progression unlocks
- "15 is the lowest toll that settles" — wrong, 14 gives 1.07×
- A judging round as 20 looks — it is **10 pairs**
- Boxed, filled step ribbons — they read as rows of buttons; now flat rules
- In-phone design annotations — they cannot be in front of a participant

---

## Open questions marked in the code

Search for `⚠` to find every one. All are Katya's or Jack's call, not yours.

| where | question |
|---|---|
| `domain/economy.ts`, `today/rendering.tsx`, `onboarding/capsule.tsx` | **A** — the Day 1 token grant. Recommendation on the table: drop it, make the starter capsule eleven pieces |
| `you/index.tsx` (`SHOW_STREAK`) | **B** — `Streak · 9 days`. Recommendation: cut the row, keep the *Week straight* milestone |
| `today/entered.tsx` | **C** — does "the gap" come back? If yes, this screen is its cheapest home |
| `onboarding/intro/[step].tsx` | **D** — onboarding never teaches the coupling. A new user is currently never told "no judging, no clothes" |
| `casting.tsx`, `ui/pieces.tsx` | Jack 2 — render on a body, or flat lay |
| `data/challenges.ts`, `create/index.tsx` | Jack 3 — free tags. Suggestion: decoration only |
| `create/index.tsx` | Jack 4 — layered looks in the renderer |
| `domain/magazine.ts`, `data/looks.ts` | Jack 5 — per-look settled splits must be stored. **Cannot be backfilled** |
| `config/app.ts` | the name. Client rejected *Velocity*. No availability checks run on any candidate |

---

## Architecture

```
app/                       expo-router routes — the navigation tree IS this folder
  _layout.tsx              fonts, root stack, the casting modal
  index.tsx                redirect: new user → onboarding, otherwise → Today
  onboarding/              o1–o6
  (tabs)/_layout.tsx       THE FIVE TABS
    today/                 a1 a12 a7 a8 a13 a14 a2 a4  (the day, in order)
    magazine/              a5 a16
    create/                a11 a17
    wardrobe/              a15
    you/                   a10
  casting.tsx              a18 — a modal, because two flows open it

src/
  domain/     pure, testable, no React. The rules live here
  data/       fixtures — looks, capsules, challenges, inventory
  state/      six zustand stores, one per domain
  theme/      tokens.ts (colours, spacing) · type.ts (the four typefaces)
  ui/         shared components
  config/     app.ts (the NAME, once) · testState.ts (which day boots)
tests/        node:test over the domain layer
```

**Where the prototype's `S` object went.** It was one flat blob with ~45 keys. Now:

| old | new |
|---|---|
| `S.day`, `phase`, `yState`, `capsule`, `rmode`, `tips` | `state/session.ts` |
| `S.picked`, `bstep`, `loans`, `entered` | `state/entry.ts` |
| `S.pinch`, `taken`, `unlocked`, `earnedOvernight` | `state/economy.ts` |
| `S.ward`, `wview`, `wfilter`, `saved` | `state/wardrobe.ts` |
| `S.page`, `feedLen`, `reacts`, `rev`, `spIdx`, `sheet` | `state/magazine.ts` |
| `S.cstep`, `cpick`, `cocc`, `cfree`, `cdest` | `state/create.ts` |

**Subscribe with a selector**, always — `useMagazine((s) => s.filter)`, not
`useMagazine()`. Taking the whole store re-renders the entire feed on one reaction tap,
which is precisely the prototype behaviour the port removed.

---

## Test states

There is no HUD. The seed state is one constant: `ACTIVE_DAY` in
`src/config/testState.ts`. Change it, save, Fast Refresh reboots into that state.

| | Day 1 | Day 2 | Established |
|---|---|---|---|
| onboarding | yes, from slide 1 | skipped | skipped |
| yesterday's result | **absent entirely** | first result | as before |
| wardrobe | 8 (your capsule) | 11 | 96 |
| looks archive | empty | 1 | 9 |
| tokens at start | 0 | 2 | 2 |
| overnight roundel | hidden | shown | shown |
| You sections | milestones only | posts · stats · milestones | all five |

**Day 1 has no result act at all** — absent, not an empty state, so the job card leads.
The overnight roundel is hidden because a zero there would be a lie. The shuffled
*try these* rail is hidden because a nudge drawn from eight visible things is noise.

---

## Before you call something done

```
npm run typecheck      # tsc --noEmit, strict + noUncheckedIndexedAccess
npm test               # 53 assertions over the domain layer
```

Then **run it on a device or simulator and look at it.** Neither command above catches
layout, and the prototype's history is full of things that passed structural checks and
broke visually. The known-unverified list is in `README.md`.

If the footer of a screen floats away from the bottom, it is the flex gotcha: the
scrolling child needs `flex: 1` *and* `minHeight: 0`. `Scroll` in `ui/layout.tsx` does
both — a screen that hand-rolls a ScrollView will not.

---

## How Katya wants to work

- Direct and collaborative. **Not** formal or padded.
- **Push back on vague questions and over-broad scope.** She has explicitly asked for
  adversarial criticism and for risks and illogic to be flagged.
- **Make concrete recommendations** rather than presenting neutral options.
- Flag commercial and practical problems early — recruitment difficulty, unrealistic
  timelines.
- **Flag design calls explicitly for her to overrule** rather than silently embedding them.
- Don't explain research or design fundamentals. The help needed is operational overhead.
- She engages with arithmetic when it is presented in tables.
- **She is right often enough that when she says something does not make sense, the first
  move is to check whether it actually does not.**

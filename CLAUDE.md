<!-- px-instructions-start -->
<!-- px-guide-version: 212 -->
## px CLI — MANDATORY tool usage

`px` is on PATH: STRUCTURED, CODE INTELLIGENCE!. **Use px instead of grep, cat, find, tree, curl, wc, head, tail.**

**Default to `--format text`** (json outputted by default, use when needed). Cap big stdout when needed: `<cmd> | px text truncate --tokens N` (or `--strategy smart` for head+tail) — but never truncate template/instructional output you must follow (e.g. `px pulse inject plan`).

### Rules
0.  ORIENT FIRST — once per session; again for "what is X / explain X" Qs. NEVER read directories blindly: `px text tree . --depth 2` + `px arch overview [dir] --format text` (module map + cross-deps; `[dir]` scopes to a subtree); for understanding a file's functions/code: `px ast summary . --summary-only` (structural map). `px xray run [--query "<topic>"]` (scoped or full code xray! [--format text for trunc version])
1.  NEVER read whole files               — `px ast surface <file>` / `px ast body <fn> <file>`
2a. NEVER grep raw (exact token)         — `px search run '<pat>' <path> --scope --format text`
    (index-only: searches files, NOT stdin — no `| px search`, no trailing `-`)
2b. NEVER guess at why/how/fuzzy Qs      — `px kb search '<q>' -n 5`
    (markdown + code; e.g. `'tokenise text using wordpiece'` → embedder_tokenizer.h)
2c. NEVER re-derive code you've seen     — `px code similar <file>:<line> -n 10`  (KNN over code embeddings)
3.  NEVER curl/fetch web pages           — `px web strip <url> --format md --main-only`
4.  ESCALATE chunk → doc                 — `px kb get qmd://collection/path`  (whole doc; add `--headings` for the md outline)
5.  SAVE findings                        — `px kb ingest qmd://findings/<name>.md --scope project`

### Quick ref (remaining)
```
px context budget . --query "<q>" --tokens 4000 --format md  # BM25-ranked code; --include-kb folds in kb (why/design Qs)
px code suggest <file>                         # impact check BEFORE editing (80%+ = must update)
px code blast-radius <symbol> [--depth N]      # callers + tests + co-change + kb; --depth >1 walks callers/callees transitively
px code callers <fn> [--depth N]               # --depth >1 = transitive caller tree (cycle-safe)
px code patterns <dir>                         # conventions before implementing
px ast deps <file>                             # imports/includes from one file
px search ast 'fn:*' . --lang c                # structural (fn/call/class/type/import)
px context refine . --query "<q>" --exclude "f:sym"
px test select --changed --format text
px run exec <sym> --file <path> --input '<json>'  # call fn for real (sandboxed)
<cmd> 2>&1 | px cmd filter                     # pipe builds (also | px test parse, | px err parse)
git diff | px diff semantic --format text      # function-level semantic diff
```

**kb.** Markdown + source. Hybrid BM25 + dense (RRF-fused project+install). NL paraphrases hit code. Narrative ("why"/"plan") + fuzzy code ("the fn that does X"); structural Qs stay on `ast`/`search`/`callers`. Hits prefixed `[rule|rationale|decision|state|synthesis]` — filter with `--kind`. Sub-kbs (`<sub>/.px/kb/`) query in-place from that dir, or from anywhere via `--sub <path>` (e.g. `px kb search 'foo' --sub plans/sprints-pulse`). **Code wins on conflict.** Adding: `kb ingest <qmd>` for synthesis/decisions worth keeping; removing: `px kb rm <qmd|#docid>` (synced removal tombstones + enqueues `kb.delete`; server-gated on `kb_remove`, owner/install-admin bypass; local docs removed unconditionally). **Project sharing:** docs default **local/private**; `px kb ingest --visibility project|installation` (or `px kb scope <doc> <vis>`) shares cross-client, gated by `kb_scope_change` (⟂ storage `--scope`). Pin mechanics + tag semantics → invoke skill `px-tools:px-toolkit` or `px help kb`.

**Memory (rare).** `px memory recall "<q>" --max 3` only for user-referenced prior work or explicit recall. Escalate `--full` or `px memory thread <id>` (paginate `--after <last-id>`).

<!-- pulse-section-start -->
**Pulse.** Sprint OS for genuinely hairy multi-file work (rewrites, schema migrations, new subsystems, multi-day refactors) — a `plan → beats → per-beat criteria-gate → sign-off` state machine; the last beat's sign-off auto-closes the Pulse. Criteria are the headless done-contract (a beat is done ⟺ its criteria pass/waive); strikes are its struggle log.
- **Skip it for single-file fixes, typo edits, prose tweaks, one-line patches** — ceremony cost is punitive on small work.
- **Start one:** invoke skill `pulse-plan` — it decomposes a brief into a Pulse + Beats via `px pulse plan --apply`, folds in the project's live plan-phase template (`px pulse inject plan`), and carries the schema rail, scope handshake, and full lifecycle mechanics.
- **Orient / re-engage:** `px pulse now` is your operational map — it recommends the next action across your pulses (the session-init hook surfaces it on pickup); then `px pulse show --format md` for the full pulse, `px pulse status` for state.
- **Two rules to hold up front, both irreversible:** no secrets in Beat/Pulse text — it **syncs in plaintext**; and sign-off honors the beat's `requires_ack_kind` — you **MAY** sign off when it's unset/`llm`/`either`, but **DEFER `human`-ack beats to the user**.
- **Then the hooks take over** — don't memorise mechanics, read what arrives verbatim: every prompt injects the live beat context + pinned rules (**never paraphrase**); `beat start`/`resume` inhales the prior-beat recap to stderr; every completion (signoff / criterion check / skip) exhales your single next action + the exact command (incl. the `--pass cN` for any pending criterion). Verb reference, signoff grammar, and the action-criteria subsystem live in the `pulse-plan` skill and `px pulse --help`.
<!-- pulse-section-end -->

**Installations.** `px` clients enrol in N px-Server installations; each lives in `~/.local/px/installations/<guid>/`. `px config installation {list,add,remove,show,migrate-project}` manages enrolment. Per-install data is filesystem-isolated; resolution at every command is from `.px/pulse.toml` (per-project pin) / `--installation` flag / `PX_INSTALLATION_ID` env — **never from a stored default**. Commands in unpinned dirs refuse to run rather than guess (airgap mandate).

**Hands-off.** `kb sync`, `memory mine`, `memory refresh`, `code build`, `code watch` auto-run via hooks — never invoke. Never pass `--unsafe` to `px run exec`.

More: `px code {build,watch,cochange,tests,graph,query --fuzzy,churn,dead,metrics,clones,typed-callers,concepts}`, `px {dep trace,arch coupling,arch cycles,git experts,git trajectory,config trace,project info}`, `px memory {search,forget,promote}`, `px {diff parse,schema infer,schema codegen,text truncate,err parse,run history}`. Deep docs: `px help kb`, `px help run`.

<!-- px-instructions-end -->

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
3. **6 pieces max, 3 min, one piece per slot except Extra, which takes two** —
   briefs *and* freestyle. Amended 3 Sep 2026 (Katya); it was 5 max. Extra is the
   only slot that doubles because the delivery sheet's flat-lay template is the
   only thing that can hold a second piece there. `MAX_PIECES` is derived from
   `SLOT_CAPACITY`, so don't hand-write the number.
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
- A Continue button under the sign-up methods. Cut 3 Sep: the three methods
  *are* the progression, and a fourth control could not know which you meant
- Pre-filling the handle field with `katya.b`. It read as "we already know who
  you are" and let a tester walk past the one thing that screen collects
- The capsule picker ("eight pieces to start with — which eight?"). Cut 3 Sep. It
  asked a new user to choose clothes before they had seen a job, and then stocked
  the builder with only those eight. The first-run builder offers the whole
  catalogue and the look you enter becomes the wardrobe
- A wait screen for the render. It is asynchronous now: submit, go and vote, and
  the Today card and tab tell you when it has landed
- A render-status chip floating in every screen's header. The status belongs on
  the job card, which is the one screen the job is on

---

## Open questions marked in the code

Search for `⚠` to find every one. All are Katya's or Jack's call, not yours.

| where | question |
|---|---|
| `domain/economy.ts`, `today/rendering.tsx` | **A** — the Day 1 token grant. CONFIRMED KEPT 3 Sep (the success screen's six depends on it: 3 for entering, 3 for the round) but not closed — the standing alternative is still to drop it. The "eleven-piece capsule" half of the old recommendation is dead: there is no capsule any more |
| `you/index.tsx` (`SHOW_STREAK`) | **B** — `Streak · 9 days`. Recommendation: cut the row, keep the *Week straight* milestone |
| `today/entered.tsx` | **C** — does "the gap" come back? If yes, this screen is its cheapest home |
| `onboarding/intro/[step].tsx` | **D** — onboarding never teaches the coupling. A new user is currently never told "no judging, no clothes" |
| `casting.tsx`, `ui/pieces.tsx` | Jack 2 — render on a body, or flat lay |
| `data/challenges.ts`, `create/index.tsx` | Jack 3 — free tags. Suggestion: decoration only |
| `create/index.tsx` | Jack 4 — layered looks in the renderer |
| `domain/magazine.ts`, `data/looks.ts` | Jack 5 — per-look settled splits must be stored. **Cannot be backfilled** |
| `config/app.ts` | the name. Now **Editorial.** (3 Sep), after *quintets.*, after the *Velocity* rejection. STILL no availability or trademark checks on any candidate, and "Editorial" is a common noun in this exact category — the most contested of the three so far |

---

## Architecture

```
app/                       expo-router routes — the navigation tree IS this folder
  _layout.tsx              fonts, root stack, the casting modal
  index.tsx                redirect: new user → onboarding, otherwise → Today
  onboarding/              splash (the loading beat), intro/1–4 (the carousel),
                           then the three-step setup chain: sign-up, handle
                           ("Your profile"), first-challenge.
                           The capsule picker is GONE — see first-challenge.tsx.
                           Two separate dot sequences, 4 then 3 — see
                           ui/OnboardingFrame.tsx for why they aren't one run.
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
| wardrobe | **0**, then the 3–6 you enter | 11 | 96 |
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

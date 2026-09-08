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

**Pulse.** Sprint OS for genuinely hairy multi-file work (rewrites, schema migrations, new subsystems, multi-day refactors) — a `plan → beats → per-beat criteria-gate → sign-off` state machine; the last beat's sign-off auto-closes the Pulse. Criteria are the headless done-contract (a beat is done ⟺ its criteria pass/waive); strikes are its struggle log.
- **Skip it for single-file fixes, typo edits, prose tweaks, one-line patches** — ceremony cost is punitive on small work.
- **Start one:** invoke skill `pulse-plan` — it decomposes a brief into a Pulse + Beats via `px pulse plan --apply`, folds in the project's live plan-phase template (`px pulse inject plan`), and carries the schema rail, scope handshake, and full lifecycle mechanics.
- **Orient / re-engage:** `px pulse now` is your operational map — it recommends the next action across your pulses (the session-init hook surfaces it on pickup); then `px pulse show --format md` for the full pulse, `px pulse status` for state.
- **Two rules to hold up front, both irreversible:** no secrets in Beat/Pulse text — it **syncs in plaintext**; and sign-off honors the beat's `requires_ack_kind` — you **MAY** sign off when it's unset/`llm`/`either`, but **DEFER `human`-ack beats to the user**.
- **Then the hooks take over** — don't memorise mechanics, read what arrives verbatim: every prompt injects the live beat context + pinned rules (**never paraphrase**); `beat start`/`resume` inhales the prior-beat recap to stderr; every completion (signoff / criterion check / skip) exhales your single next action + the exact command (incl. the `--pass cN` for any pending criterion). Verb reference, signoff grammar, and the action-criteria subsystem live in the `pulse-plan` skill and `px pulse --help`.

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
| `src/domain/renders.ts` | the re-render's three constraints. Drop one and it is a slot machine |

---

## Invariants. Do not break these without asking Katya.

1. **No judging, no clothes.** Completing a ten-call round is how tokens arrive. Tokens
   are the only way a garment enters a wardrobe. Break this and version A becomes
   version B, which was rejected.
2. **Mark-then-mint.** Tokens land on the tenth call, never during. Minting on the spot
   lets someone cast one vote, take three pieces and leave.
3. **6 pieces max, 4 min, one piece per slot except Extra, which takes two** —
   briefs *and* freestyle. Amended 3 Sep 2026 (Katya); it was 5 max. **The floor
   moved 3 → 4 on 7 Sep (Katya)** — `MIN_PIECES` in `domain/entry.ts` carries
   what that gates and what it costs. Extra is the
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
   A live entry is *not reactable*, and if one is ever rendered the reaction
   cluster must be **absent, not disabled**.
9. **The room read-out reports movement, never level.**
10. **Reactions are on looks only**, and never feed the ranking. Nine values, one
    per person per look, mutually exclusive — see `domain/reactions.ts`, which
    carries the whole spec. **No public negative count, ever**: negatives reach
    the owner alone, only at 5+ reactions, and only as a read ("the room mostly
    read it as bold"), never as a figure. The feed sampler must never import
    `domain/reactions` — asserted in `tests/reactions.test.ts`.
11. **No comments anywhere.** The room votes; that is its entire vocabulary.
12. **No levels, no XP, no leaderboard.** Six fixed milestones.
13. **Copy-minting.** Taking a piece mints a copy — the owner loses nothing and is never
    told. No market, no expiry. This is deliberate regulatory distance from the Sorare and
    DraftKings precedents, not a simplification.
14. **Performance history never appears in the builder.** Wardrobe and result screen only.
15. **Builder filters are by garment type and nothing else.** Nothing is sorted by what
    "goes with" the brief — deciding that is the skill being tested. ⟲ 7 Sep:
    the category chips are gone and a SLOT opens its own pieces instead
    (`ui/SlotBuilder.tsx`). Same axis — a slot *is* a garment type — reached by
    tapping the thing you are filling rather than by choosing a chip.
16. **Nothing is bought, sold, traded, gifted or lost.**
17. **Judging opens only after entry closes** (20:00). The anti-copying rule is a
    consequence of the schedule, not a rule.
18. **Tokens, never "keeps" or "pinches"** — including in variable names. The naming is a
    regulatory position (R-G5, brief invariant 7).
19. **The rails question is soft.** A hard filter splits the garment pool, which splits the
    room, and multiplies the cold-start floor from ~125 DAU to ~375.
20. **Freestyle is render-or-nothing.** No private save, no unrendered save, no unlimited
    fallback. A spent user is blocked at the ENTRY of Create, not at the commit button —
    they never see step 1. Amended 4 Sep (Katya), reversing HANDOVER §3.
21. **Create's commit is at step 2, and the allowance goes at the commit** — not at
    completion. Spend-on-success lets someone start a render, kill the app and start
    again, which is a reroll through the back door. Refunds are for SYSTEM FAILURE only;
    never for a user changing their mind, or delete-and-retry becomes that same reroll.
22. **Two render allowances, never one shared counter** — `brief` 1/day, `freestyle` 1/day
    plus 1 re-render. Both reset at **07:00 local, not midnight**: 07:00 is the day
    boundary everywhere else, and two boundaries in one app is a bug generator.
23. **The one re-render needs all three constraints or it is a slot machine.** Frozen
    input · replaces in place · window shuts on the **first reaction or 15 minutes**,
    whichever comes first. Amended 4 Sep (Katya), reversing D-brief invariant 5. If a
    constraint has to go, the feature goes with it.
24. **Free-text tags, on freestyle looks only.** Max 5, normalised, not clickable, not
    filterable, and they must NEVER reach the feed sampler — a tag filter is a sort, and
    invariant 7 is sample-don't-sort. Amended 4 Sep (Katya), reversing D-brief invariant 8.
    The accepted consequence was meant to be *the gap is now brief-only*. It is worse
    than that: **the gap has no input at all**, because the builder has no declared word
    either (locked decision 18 removed its tag step). See the open question below.
25. **You never invents.** A section on a10 appears only when it has something
    true to say — and "we'll tell you about your eye later" is an IOU against
    the most expensive computation in the product, so `Just for you` is ABSENT
    rather than empty. A `Weakness` tip never renders alone; it is held, not
    dropped.

## Reversed. Do not re-propose.

A fresh session will be tempted by several of these. They were tried and rejected.

- Judging yesterday's closed brief
- Five magazine content types (cut to three for MVP)
- Rendering inside Create before submission
- Reactions on individual garments
- Red tags (read as aggressive; now green). NOTE: `palette.error` was added
  4 Sep for form validation and is the only red in the system — it is not a
  general alert colour and emphatically not for tags
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
- A three-across wardrobe grid. Cut 3 Sep with the jump to 14px names: a third
  of the width holds ~13 characters, so the longer AW26 names truncated. Two
  across, and the photograph gets room
- The provenance line on wardrobe cards ('starter' / 'taken' / 'piece-brief').
  Cut 3 Sep. The field still exists on the data, it is only unrendered
- The builder's "No hints, on purpose" tooltip. Cut 3 Sep. It was a hint about
  there being no hints, in the biggest accent panel on the screen, directly
  above the grid it was pushing down. The rule it stated is still enforced
- The flat lay's "FLAT LAY · NO BODY, NO FIT" caption bar. Cut 3 Sep — the
  plate is a picture of clothes, and a caption stating what it isn't was the
  loudest thing on it. The claim still appears in the builder's own copy
- The composed flat lay on the "we're building your look" screen. Cut 3 Sep:
  that screen exists to move you on, and putting the look on it invited you to
  stay and study something you had just spent two screens looking at
- A disabled "No tokens" button in the magazine sheet. It walled off the sheet
  at exactly the moment someone was most engaged. It offers the free action —
  Save for later — instead of refusing the paid one. NOTE this is not a ban on
  disabled buttons: Create's empty state has one ("Create a look", 4 Sep), and
  it is correct there because there is no alternative action to offer
- The save-unrendered path in Create ("Render and save privately", "Save to my
  looks"). Cut 4 Sep with invariant 20. It let the flow be a corridor to a
  closed door, and it made a17 carry three different faces
- The closed occasion axis (`OCCASIONS`, nine words, one choosable) and the fake
  `FREE_TAG_BANK`. Replaced by real free text 4 Sep. The cost is that occasion
  stops aggregating: `wedding`, `weddingvibes` and `bigday` are three tags
- MODEL as a ribbon segment in Create. Cut 4 Sep: casting is a screen shared by
  both flows, not a step, which is how the builder already treated it. It made a
  five-segment ribbon numbered 1, 2, 2, 3, 4 under a header reading "3 of 4"
- "Make another →" on a17. There is no another — one render a day, and offering
  a second is the tab promising something it refuses two taps later
- Clearing the create submission lane on a17's mount. It used to be correct; it
  now throws away `publishedAt` and `rerenderUsed`, which ARE the re-render
  window, and read on screen as "Not published yet". `markSeen` clears the dot
- `profileMeta`, a pre-baked descriptor string on You. Cut 4 Sep. It is why the
  header read "@katyabeer · just joined · 0 looks" above a body reporting 74
  jobs entered — the descriptor was a fixture, wired to nothing
- `brave` and `sharp` on You ("the room reads you as brave", "sharp most read").
  Cut 4 Sep: both are the OLD REGISTER LIST, in neither vocabulary, so the
  screen could say "you build quiet and the room reads you as sharp" out of
  words it does not have. Every word for how the room read you now comes from
  the reaction vocabulary
- Three tips as a fixed trio on You. They are a POOL with entry thresholds, and
  the section renders only what qualifies — one tip is a valid section, and the
  Strength/Weakness/Try-this labels are roles, not slots
- A day-one grid of zeros under Stats. An empty state that names a future is
  fine; one that names an absence is not. Milestones is the roadmap; zeros are
  an accusation
- `youSections` in testState, which let the day fixture decide what You was
  allowed to say. The sections derive themselves now
- "Not a render — the actual pieces, laid out. No body, no fit." on Create's
  Look step. Cut 4 Sep, for the same reason the plate's own caption bar went on
  3 Sep: the picture below it is a picture of clothes, and a sentence saying
  what it ISN'T is the loudest thing on the screen. The claim still appears in
  the builder's copy, where a new user meets it first
- The prototype's `#crendnote` verbatim at Create's commit ("rendering is the
  expensive bit, so it is one a day — and only rendered looks can go in the
  magazine"). Twenty-one words in `Tiny` above the button is the size the eye
  skips at exactly the moment it must not. Now a kicker plus one `Lede` line.
  The magazine clause went with it: §2.2 deleted the unrendered path, so it
  argued against an option that no longer exists
- `SectionHead` for "Today's styling challenge", and the masthead reading
  "Today's challenge" above it. The masthead is **Today** now (the tab's own
  label) and the heading is an accent kicker — as a SectionHead it was
  identical to "Try these" in the Wardrobe: a quiet grey label on the loudest
  thing on the screen
- A square job card with an inline badge. It is rounded, and the state badge is
  a STARBURST breaking the top-right corner (`ui/StarBadge.tsx`) — inside the
  border it is a label, breaking out it is a sticker. `Card` itself stays
  square: it is also the settlement panel and the wardrobe's boxes, which are
  documents rather than objects
- `Open` as the badge on an untouched job. It is **New**; `Open` now means
  started-but-unfinished, so the badge has three values and never tells someone
  a card they already built on is new
- The `LogoBlock` masthead on Create. ⟲ It was asked for and added on 4 Sep,
  when Create was still a tab; it left the tab bar the same day, so a masthead
  claimed a place in the hierarchy it no longer has. Every Create screen wears
  the in-flow `Header` labelled **Create** — not the step name, because the
  ribbon below already says the step and each screen has its own heading, and
  without it step 1 would read "Pick your pieces", identical to the builder's
  step 1 in a different flow
- The brief above the slot strip in the builder. They swapped 4 Sep: only one
  of them needs to be permanently on screen, and it is the thing you are
  filling. `Pinned` is sticky by construction (it sits outside `Scroll`), so
  the brief moved INTO the scroll and now yields its space as you browse. It
  also brings the builder into line with Create's step 1, which already read
  slot-strip-then-heading
- `Hero` for Create's "Make anything." It is a `Lede`, matching the builder's
  brief title — the two screens are the same step of two flows, and one
  shouting in 36px caps beside the other stating the job in 23px italic was
  the mismatch. NOTE the empty-state card keeps its display heading: that card
  is a front door, not step 1 of a flow
- The starburst state badge **on the finished states**, ⟲ one round after it
  went on. Those are a **pale green pill inside the card**, top right, reading
  `Completed` — on a card with nothing left to do a star breaking the border
  was a lot of shape for "done". `accentPale` is a NEW HUE and the only green.
  ⟲⟲ AMENDED AGAIN 7 Sep: `New` gets the starburst back, breaking the
  top-right corner, because that state is an INVITATION and not a status — a
  badge inside the border is a label, one breaking it is a sticker. So the
  card has two badge treatments and one rule could not serve both. The header
  row is a `minHeight` floor either way, which is what keeps the title on the
  same line as the day progresses; `s_star`'s offsets in `today/index.tsx` are
  arithmetic against the title's first line, not taste
- The sunk-cream ground on the locked next-job card. Sunk cream is this app's
  DISABLED ground, so a locked-but-coming card read as broken; it is
  `creamRaised` now and sits above the page rather than pressed into it
- "Tap a filled slot to put it back. The last two are both for extras." on the
  builder and Create. It explained what the strip already shows — a filled slot
  looks filled, and the two EXTRA labels sit side by side
- `Tiny` (10px) inline-styled text links, in eight places. There is a `Link`
  component now at **16px** using the `linkLg` colour the palette had and never
  used — they are often the only route to a screen, and small print is a poor
  place for that
- The re-render panel on a17 ("one more go at it"). ⚠ Create brief AC 9 wants
  it on a17 AND the owner's magazine card; it now lives ONLY in the Create
  tab's `spent` state. The window is unchanged, so removing the control here
  shortens it in practice — you have to navigate to find it
- A dead filter rail on the magazine, and `Ours` / `From the room` / four
  occasion words as its chips. The occasion words could never have worked —
  occasion stopped aggregating when Create's tags went free text. Five chips
  now, all of them read: **All · Editorial · Challenges · Free posts ·
  Trending**, plus a garment search drawer on the other axis
- **Tappable tags on feed cards.** They set the feed's filter to the tag, which
  is the thing `domain/tags.ts` explicitly forbids — "not clickable, not
  filterable, and they must NEVER reach the feed sampler". Free text does not
  aggregate either, so `#wedding` / `#weddingvibes` / `#bigday` were three
  filters over one idea. They are a caption now
- Cycling the pool to fill an endless scroll under a filter. Three matches
  repeated thirty times is padding, which §5 rules out — a filtered stream
  shows each match once and ends with "that is all 9 of them"
- `resizeMode="cover"` on the onboarding collage photos. The look photography
  is portrait and full-length, so in a cell wider than the source's aspect
  `cover` filled by cropping the SIDES — a head off the top and an arm off the
  left of the two bottom cells at 488px. It is `contain`, and both frames carry
  padding so a contained photo reads as mounted on a mat rather than as one
  that failed to fill its box
- A label over the builder's filter chips. It read "everything we have" (the
  pool, not the task) and "your wardrobe" on Day 2 (which the Wardrobe tab
  owns); renamed to "Pick your pieces" it duplicated the header, so it came off
  entirely along with the "60 pieces" count — a fact about the catalogue, not
  about the decision, sitting where the eye lands after the brief
- The garment teaser on o7 (four cutouts under the brief) and its
  schedule-only copy. Katya's mockup, 4 Sep: the screen now TEACHES THE LOOP —
  build · vote · see how you did, as three numbered rows (`NumberedList`). It
  used to say only that everyone gets the same job until 8pm, which describes
  the schedule and not the game; a new user reached the builder never having
  been told that voting is part of it
- The `·` disc on the locked next-job card, and a comment claiming this app
  has no icons. `LockIcon` already existed and a7 had been using it since it
  was built — the card wears the padlock now, rounded to match the job card
  above it, under a muted `Tomorrow's challenge` kicker
- `Tiny` (10px) on `See upcoming challenges →`. 16px, with its note at 14 — it
  is the only route to the month's list, and at 10 the availability fix was
  shipping into a size the eye skips
- The grey `LookPlate` placeholders on the results screen, and its header
  carrying the job name and field size. Real photographs from the judging
  fixtures, to the RIGHT of the text; the header is a bare chevron and the
  screen has a page title with the field size under it
- The `StepRibbon` on the Today card, and the card's state-as-headline. The
  ribbon lost its deadlines when it went to one line, and three columns had no
  width to say "Build by 8pm" — the steps are STACKED rows with numbered discs
  now (`JobStepList`), and they are absent once the job is done. The card also
  used to replace the challenge title with the state ("Building your look.",
  "Challenge complete."), so the one thing every state shares was the thing
  that vanished as soon as anything happened. Title and description are
  constant; the BADGE carries the state
- The finished look inline on the complete card. It was the tallest element on
  a card with nothing left to do — now a 16px `View your submission →` opening
  a drawer (`ui/SubmissionSheet.tsx`)
- The step ribbon's second line (`3 to 6`, `together`, `who wears it`,
  `from 8pm`). Cut 4 Sep: it doubled the ribbon's height on every screen to
  gloss labels that are a verb each. `Step.hint` is gone from the type, not
  merely unrendered
- "Which rails do you want to shop?" as a headline on the profile screen. The
  kicker asks it and the three named options answer it; the headline made the
  second question on the screen twice the size of the first
- "No profile to fill in. No photos. You'll be building in about a minute."
  Cut 4 Sep — a promise about the absence of work, on the screen with the least
  work on it, above three rows that prove it faster than the sentence reads
- The "what happens now" settlement card on the challenge-complete screen
  (twelve people, twenty comparisons). It put the mechanics of something the
  reader has just finished and cannot affect under the reward, and made the
  last screen of the day the longest read of it
- The 👍 / 👎 pair on magazine cards. Cut 4 Sep: the like is a HEART that
  fills, the count sits inside it, and thumbs-down is gone from the UI
  entirely — "we decided not to capture negative sentiments like that". The
  value stays in the vocabulary so stored ones still read; nothing can cast a
  new one. An emoji was also the one glyph in the app rendering in the
  platform's font, which could not take the ink colour
- "BOLD · LIKED IT" — the count plus the top two reads as words, on every
  card. It restated what the panel says when you open it, and down a feed it
  was the same two or three words repeating. The count moved into the heart
- The LAST TWO walkthrough tooltips, 4 Sep: Today's "Build first, judge
  after…" (between the stepper and the button, explaining a sequence the
  stepper directly above it draws) and the magazine's, below. Nothing renders
  `Tip` / `TIPS` / `dismissedTips` any more — they are kept only because the
  component is a designed piece worth having if one comes back
- Create's step-2 rule stated TWICE — once in the body and again as a kicker
  plus `Lede` above the button. One statement, in the body, is the whole rule:
  `ONE_A_DAY_AT_COMMIT`
- "Skip it if you like… cannot be changed once it posts" on Create's tag step,
  and the "already paid for" panel under the input. The first argued at
  someone who had not typed anything; the second said there was nothing left to
  decide, on the screen asking them to decide something. Both facts are still
  enforced in the domain
- The `LogoBlock` masthead on the challenges list. It is a screen you go TO,
  pushed from Today's card, so it wears the in-flow `Header` and a chevron —
  a masthead made it read as a place you had arrived, with no way back but the
  tab bar
- The magazine's walkthrough tooltip ("This is where clothes come from.
  Judging earns tokens. This is the only place to spend them."). Three rules
  at once, in the largest accent panel on the screen, above the first
  photograph anyone sees. Same reasoning as the builder's "No hints, on
  purpose" tooltip on 3 Sep
- "Which one works? Tap it — the room has already voted." under the spread's
  plates. The head asks the question and the Vote A / Vote B pills say how to
  answer; the rest announced a result before you had given an answer
- "41 answers to it, yours among them" on the voting strip. The field's size
  frames the round as a scale to get through rather than a pair to read
- The Build · Judge · Result stepper on the COMPLETE job card. It is a progress
  read with no progress left to report — three greyed labels under a heading
  already saying the same thing. The countdown is the only part still true.
  It stays on the other three states
- **`title="Create"` in the Create flow's header**, on all five states. Cut
  7 Sep for the same reason the day's flow lost its titles on 4 Sep: the ribbon
  below says the step and every screen leads with its own heading. ⚠ The label
  WAS doing one thing nothing else does — saying which flow you are in. Create
  step 1 and the builder's step 1 now both read "Pick your pieces" under a bare
  chevron
- **"It's up." as the headline on Create's generate step.** It is
  **Your look is ready.** (7 Sep) — "It's up" is also what a17 says, and it
  named the publication rather than the thing that just changed, which is that
  there is something to look at
- The `RenderStrip` and the inline `ComposedFlatLay` on that screen's READY
  state. The strip's ready label was the Hero's own six words one line below
  it; the flat lay is in the drawer now, which is the trade the Today card made
  on 4 Sep. Both are still there while it is PENDING, where the strip is a
  progress read and §6 wants the flat lay
- A solid **See it** CTA there, routing to a17. The footer is a ghost **Back to
  Wardrobe** — the look is offered above, so the footer is only the way out
- Vertically centred onboarding content. Every screen is `topAlign` with a
  shared `ONBOARDING_TOP_GAP` (7 Sep): centring left `sign-up` with a deep
  empty band above its heading, and an 8px gap left `handle` asking its first
  question from inside the chrome
- `TOP_PAD` in the intro carousel. ⟲ It added 76px (later 44) ON TOP of the
  frame's gap, so the four marketing slides were the one part of onboarding
  starting lower than the rest — 84px down where sign-up was 40. Deleted, and
  the carousel takes `ONBOARDING_TOP_GAP` like everything else, so all seven
  screens now start at y=86. The no-jumping mechanism was never the pad; it is
  `TEXT_BLOCK_H` being a fixed height rather than a minHeight
- **The composed flat lay on every FINISHED look** (7 Sep). `ui/RenderedLook`
  shows worn photography instead, on a14's *On a model*, Create's ready drawer
  and `spent` state, a17, and the wardrobe's Looks archive. The flat lay is
  still correct in four places and they are not oversights: the day's step 2
  and Create's step 2 (**nothing renders before commit**), Create's PENDING
  state (§6), a14's explicit *Flat lay* toggle, and archive rows whose band is
  `flat` — a saved combination that never generated, where a worn photo would
  claim a render that does not exist
- `RenderedFigure` — the wireframe body with grey garment shapes, on a14. It
  was always a stand-in for Jack's pipeline and looked like one. `RenderStage`
  still holds the *in-progress* version of the same wireframe
- `renderMode` defaulting to `'flat'`. It is `'model'`, so the one screen that
  shows your finished generation opens on the look
- "One brief a day. Everyone plays." on o7. The three numbered rows below said
  the same two things and then said what you actually do
- The `tonight's job` block on the day's step 2 — a kicker, the challenge title
  and a divider above them. The brief is on the screen you just came from,
  permanently, above the grid you picked the pieces out of
- **True relative scale on the flat lay.** `flatlay_scale` is the delivery's
  real-world ratio — 1.0 a coat, 0.104 a pump heel, 0.052 sunglasses — and
  rendered faithfully it made a shoe a speck (Katya, 7 Sep: "some of the items
  appear disproportionately small"). Two causes, both fixed: the 19× scale
  range, and the fact that every piece was contain-fitted into a SQUARE, so a
  2.5:1 shoe drew a quarter of the area its number implied. A placement now
  carries width AND height from the cutout's own aspect, sized to equal visual
  mass — `EQUALISE` in `ui/ComposedFlatLay.tsx` blends back to true scale in one
  constant. **`BOX_SLACK` must stay near 1**: at 1.18 the equalised heel and
  sunglasses grew out of their boxes and sat on the skirt, and the template's
  box widths are the collision geometry
- `Image.resolveAssetSource` for a cutout's dimensions. **It does not exist on
  react-native-web** — a static require resolves to a plain URL there — and it
  threw on the first placement, invisible to tsc because the web shim still
  declares it. The aspects are generated at build time instead:
  `node scripts/gen-cutout-aspects.js`, re-run after any re-crop
- **The builder as a catalogue.** It was a scrolling grid of every garment in
  the pool with category chips over it and a sticky six-cell strip above
  reading back what you had picked — so the slots were a read-out and the
  catalogue was the screen, on a task whose whole question is the empty slot.
  ⟲ 7 Sep: the six slots ARE the screen, 3×2, and a slot opens a drawer of its
  own category (`ui/SlotBuilder.tsx`). What went with the grid: the chips,
  `railsFor`, the pinned strip, `SlotStrip`, and the separate loaner section —
  the two loaners now appear inside their own slot's drawer, flagged NEW, which
  is where someone filling that slot actually meets them
- "Tap a filled slot to put it back" as the removal gesture. Tapping a filled
  slot opens the drawer now, so removal is a control inside it (**Take it
  out**). The old gesture was faster but undiscoverable, and one tap did two
  different things depending on state
- The label/value ROW list under You's Stats. It is a **two-up grid of big
  numbers** (`StatGrid`, 7 Sep — "less wordy, more visual"): the row's job is
  to make the number the thing you see, and a right-aligned 17pt figure beside
  an 11.5pt sentence did the opposite. `Stat` itself stays — the result screen
  uses it for values that are sentences ("You backed it")
- The grey `LookPlate` strips on You. Finished generations, so they are
  `RenderedLook` photographs, with the band under each — same ruling as the
  drawers and the wardrobe archive
- The label-plus-sentence pairs in o7's three steps ("Be the stylist / Build a
  look that answers the brief.", and two more). One line per step now, in the
  BODY treatment — `numberedTitle` is 13px uppercase and a sentence set in it
  reads as a label, so `NumberedList`'s `title` went optional
- "Who's wearing it?" as the casting screen's heading, and "Changes the
  generation, not the clothes. Set it once and reuse it." under it. It is
  **Model customisation** now (Katya, 7 Sep) — see the open question, because
  those words were load-bearing rather than decorative
- "Once you enter, nothing can be changed." as the whole of step 2's body — it
  lasted one round. Katya's replacement says the same thing and adds what the
  button does, which on a commit screen is the point
- **The captions on the judging plates** — the occasion as a kicker plus the
  full piece list, in an accent block over the bottom of each photograph, on
  every pair of the round. The occasion is identical on both plates and named
  above them; the piece list is a spec sheet under a question asking which look
  WORKS; and reading two of them was most of the work on a screen that wants a
  glance and a tap. `LookPlate` still captions elsewhere — You, `ResultCard`,
  the magazine — so it is `showCaption={false}` on the pair, not a deletion
- The first-pair line on the voting screen ("The same job you just answered.
  Nobody can enter now, so seeing these can't change anyone's look — including
  yours."). It argued the anti-copying rule at someone who had not asked, and
  that rule is a consequence of the 8pm schedule (invariant 17) which the black
  strip at the top of the same screen already states. Every pair gets the count
  now. The challenge title under the question went 13px → 19px italic at the
  same time: it is the only place the job is named on the screen now
- "The generation comes after, and at 8pm you judge the field alongside
  everyone else" on the day's step 2. Both halves are on the step ribbon
  directly above it — GENERATE and VOTE are steps 3 and 4 — and the commit
  screen's one job is to say what the commit costs
- "You won't know when each lands…" under *See upcoming challenges*. It argued
  for the tap instead of offering it, and the screen it leads to makes the
  point with the list in front of you
- `title="Challenges"` in the challenges screen's bar, and the two lines of
  copy under it — the derived count kicker ("14 this month, in no particular
  order") and "You won't know which lands when…", which spent three lines
  arguing for a screen the reader had already arrived on. It has a `PageTitle`
  in the body now, matching `today/result.tsx`, and a two-line subheading

---

## Open questions marked in the code

Search for `⚠` to find every one. All are Katya's or Jack's call, not yours.

| where | question |
|---|---|
| `domain/economy.ts`, `today/rendering.tsx` | **A** — the first-look bonus (was "the Day 1 entry grant"). REFRAMED 4 Sep from "3 tokens for entering" to "3 tokens for your first ever look", which stops the copy having to argue an exception to *no judging, no clothes*. Still open: the standing alternative is to drop it. ⚠ The trigger is still `day === 1`, not "no prior looks" — identical in this prototype, wrong with real accounts |
| `domain/economy.ts` (`awardsForTonight`) | the success screen itemises what a night paid. Katya has more behaviours "to be defined" — each is one entry in `TOKEN_AWARD_LABELS` plus a line in `awardsForTonight`, and the screen needs no change |
| `you/index.tsx` (`SHOW_STREAK`) | **B** — `Streak · 9 days`. Recommendation: cut the row, keep the *Week straight* milestone |
| `today/entered.tsx` | **C** — does "the gap" come back? If yes, this screen is its cheapest home |
| `onboarding/intro/[step].tsx`, `onboarding/first-challenge.tsx` | **D** — onboarding never teaches the coupling. CLOSER 4 Sep: o7's three rows now say you vote on theirs and they vote on yours, so the mechanic is stated. The COUPLING to owning clothes — "no judging, no clothes" — is still never said anywhere in onboarding |
| `casting.tsx`, `ui/pieces.tsx` | Jack 2 — render on a body, or flat lay |
| `data/challenges.ts`, `create/index.tsx` | Jack 3 — free tags. Suggestion: decoration only |
| `create/index.tsx` | Jack 4 — layered looks in the renderer |
| `domain/magazine.ts`, `data/looks.ts` | Jack 5 — per-look settled splits must be stored. **Cannot be backfilled** |
| `ui/Reactions.tsx` | **the panel's three negatives are still live** (clashing · overdone · too safe) after thumbs-down was hidden. They are a different mechanism — never public, never a figure, owner-only at 5+ reactions and only as a sentence. Say if "no negative sentiments" was meant to cover those too; that would be §6 of reactions-logic removed, not a control hidden |
| `domain/reactions.ts` | reactions-logic.md §11, all five defaults taken as written: keep thumbs as a fast path · reactions feed NO milestone · negative threshold 5 · excluded from both ladders · spreads reactable. Say if any should flip |
| `domain/reactions.ts`, `ui/Reactions.tsx` | the negative gate is CLIENT-SIDE here because there is no server. §6 requires it server-side. `publicStats` / `ownerStats` is the contract to build the API against |
| `state/create.ts`, `today/build.tsx` | **Katya 1** — casting order. Create is now tag→cast; the builder is still cast→tag. The create brief recommends moving the builder so both flows are one sequence configured twice. NOT DONE — it changes a screen signed off two days ago, so it is your call |
| `domain/tags.ts` | **Katya 2** — the gap is now brief-only. Confirm you are happy that freestyle looks show a read but never a gap |
| `domain/tags.ts` (`BLOCKED`) | **Katya 3** — nobody owns the tag blocklist or the report queue. `BLOCKED` is a three-word placeholder of the right shape, and the report affordance on the magazine card is NOT built |
| `domain/tags.ts` (`TAG_DELIMITERS`) | space commits a chip, per §5 — so a multi-word tag is impossible and "cold field" lands as `#cold` `#field`. Say if two-word tags need to exist |
| `state/create.ts` | the create brief contradicts itself on when the allowance is spent (§6's `building` says step 3 is still unspent; §3, §4 and AC 2 put the spend at step 2). Resolved in favour of the acceptance criteria — say if you meant it the other way |
| `domain/renders.ts` | **Jack 1** — worst case is now THREE renders per user per day (brief · freestyle · freestyle re-render). Lands on the render cost curve, which is the variable cost that grows as the product succeeds. His sign-off, not ours |
| `domain/today.ts` (`RESULTS_NEED_A_DAY_ROLLOVER`) | the card's `results` state ("View results") is UNREACHABLE on its own — your entry settles at 07:00, by which point it is yesterday's job and the card shows a new one, so the result lands in Act 1 instead. Built because it is the right shape if the card ever persists past 7am; `FORCE_RESULTS_READY` is the only way to see it. Decide which of the two places a result belongs |
| `domain/today.ts` | a failed brief render refunds the brief allowance (`refundBrief`), but `useBriefRendersLeft` is READ BY NOTHING — the brief allowance gates no behaviour today. Kept for symmetry with the freestyle lane; delete both if the allowance is never wired up |
| `state/submission.ts` (`SIMULATED_FAILURE`) | **Jack 2** — render latency and failure rate. Decides whether `rendering` is a spinner or a state people live in for hours. Built as the latter, because that shape survives either answer |
| `domain/you.ts`, `domain/entry.ts` | **THE GAP HAS NO INPUT ANYWHERE.** Both the create brief and the you-brief say it "survives on brief entries, because Build step 3 keeps its single closed declared word" — that step does not exist (locked decision 18 removed it; handover open question C asks whether it returns). Consequence, built strictly: a negative read may appear in the sentence ONLY in gap form, gap form is unreachable, so NO negative reaches the You sentence at all. Katya's you-brief q3 ("set Build's declared words to the four positive reaction words") has nothing to set them on |
| `domain/you.ts` (`SUPPRESS_ZERO_STATS`) | **you-brief q1** — day-one stats: suppress zeros, or the full grid? Recommendation taken (suppress). One line to flip |
| `domain/handle.ts` (`TAKEN`) | **you-brief q2** — is the handle on magazine cards, or is the magazine anonymous? If anonymous, the handle only ever appears on your own You screen and barely earns its onboarding step. Recommendation: attributed |
| `domain/you.ts` (`TIPS`) | **you-brief q4** — the tip thresholds (10 looks · 10 settled · 20 close calls) are ESTIMATES, not measured. They need a pass against real distributions |
| `data/looks.ts` (`mine`) | there is no ownership model — one fixture is flagged as yours so the owner's read is reachable. Create's posts don't enter the feed |
| `domain/magazine.ts` (`TRENDING_ENABLED`) | **TRENDING REVERSES SAMPLE-DON'T-SORT** — the one change the handover calls the one that would quietly ruin the product. Built with all seven guardrails and OFF by default; the eligible count is hardcoded 0 because there is no reaction-velocity data (reactions carry no timestamps), so the chip never shows. ⚠ Its kill criterion has NO OWNER: weekly take-concentration, four-week baseline with it off, removed if top-20 share rises >10 points in six weeks. Without an owner that criterion is decorative — say who owns it before the flag is ever turned on |
| `domain/magazine.ts` (`VOCABULARY_UNSWEPT`) | **brief / job / challenge — three words for one object** across four documents, and the rail now says `Challenges`. Cheap to sweep now, expensive once the demo script is rewritten. The rail argues for *challenge* |
| `data/challenges.ts` (`CHALLENGES` order) | the first two entries after the open one ARE THE SCHEDULE — `nextChallenge()` reads the list in order, so the locked preview card names whatever sits at index 2. Reordering the pool silently reorders the month |
| `data/challenges.ts` (`REVEAL_NEXT_BRIEF`) | the locked next-challenge card NAMES tomorrow's job, which reveals the month's order — withheld everywhere else on purpose ("publish the month's jobs, withhold the order… browsing gets a purpose without becoming shopping for tonight"). Naming it the evening before hands someone thirteen hours to acquire for it. Built as asked, 4 Sep; one line to turn the reveal off and keep the lock |
| `data/you.ts`, `you/index.tsx` (`seeded`) | **DAY 2 ON `You` IS A FIXTURE NOW** (Katya, 7 Sep — "mock data and display what is suggested for Day 3"). It used to be read entirely from the stores, which is why the screen was nearly empty: on day 2 the prototype genuinely holds one archive row and zero reactions. The cost, accepted so the PROGRESSION is demonstrable: a participant who enters a look on day 2 does not see it, and the numbers do not move. **Day 1 is still entirely real** |
| `domain/you.ts` (`statCells`) | ⟲ **you-brief q1 IS REOPENED.** Day 1 shows the full grid of zeros in the RULE COLOUR, per her day-1 mock — which answers the do-not-re-propose objection ("zeros are an accusation") rather than ignoring it: greyed, they carry the shape of the page on the one day nothing else can. `keepZeros: false` at the call site is the whole way back |
| `ui/ReactionsChart.tsx` | the chart is **fixture-fed and animated on focus**. Its series and `reactionsReceived` in the rollup are two separate numbers that must stay in step — the series sums to 6 and so does the stat. Derive one from the other when real reaction data exists |
| `casting.tsx` | **THE SCREEN IS CONFIGURATION NOW, NOT CASTING** (Katya, 7 Sep). "Who's wearing it?" plus "changes the generation, not the clothes" is what made it a production decision about the photograph rather than a description of the user — and §10.7 / §13.4 hold *no bodies, no fit* with ART DIRECTION as the defensible claim. "Model customisation" / "customise the model" are configuration words: they read closer to the body-picker the casting framing exists to avoid, and they drop the "not the clothes" clause that kept the two apart. Nearest thing that keeps her structure and the position: "Customise the model wearing your outfit — it changes the generation, not the clothes." Jack should see it |
| `onboarding/first-challenge.tsx` (`LOOP`) | row 2 lost "**Everyone else votes on yours**" — the only place onboarding said the voting goes BOTH ways, which is what made that step more than a chore. Open question D is wider again, not narrower |
| `data/challenges.ts` (`TONIGHTS_BRIEF`) | **ONE BRIEF, THREE NOTES.** `note`, the new `shortNote` (o7's card), and `CHALLENGES[0].note` on the upcoming list — none derived from the others, so a wording change has to be made three times or the screens disagree |
| `today/rendering.tsx` | **THREE VERBS FOR ONE THING ON ONE SCREEN** — the ribbon step says GENERATE, the heading says "we're BUILDING your look", and Katya's new body (7 Sep) says "we're CREATING your look". The 4 Sep ruling is that every user-visible string says *generate*. The body also restates the heading, so dropping its first clause fixes both at once. One line; her copy, so her call |
| `today/challenges.tsx` | **"pinch the right items" is on screen** (Katya's copy, 7 Sep). Invariant 18 holds that the currency is TOKENS, "never keeps or pinches", because the naming is a regulatory position — the prototype's `S.pinch` was renamed for it and "pinches earned" is on the do-not-re-propose list. The sentence does not call a token a pinch, so it is not the letter of the invariant; it does put the word back as the VERB for acquiring a garment, where the app says TAKE everywhere else. One word fixes it. Jack should see it |
| `today/challenges.tsx` (the bottom hint) | the gap signal — "you are thin on tailoring and you own one pair of decent shoes" — is a HARDCODED FIXTURE, wired to no inventory, and it now sits below the fold under the new subheading, which says the same thing honestly. Katya asked to "remove the rest of the copy" from a screenshot that did not reach it, so it was kept. Say if it goes: the header comment calls it "the whole mechanism", but a fake personalised read is worse than none |
| `ui/RenderedLook.tsx` | **THERE IS NO DAY-2 ASSET SET.** Katya asked for "one of the day 2 looks from the asset library"; `assets/looks/` holds one folder, `d1` — 14 judging and 14 magazine photographs, nothing else ever delivered. The stand-ins come from the magazine set, led by `look_d1_mag_06` because `data/looks.ts` already flags that fixture as `mine`. Say if a day-2 set exists and this should point at it |
| `ui/RenderedLook.tsx`, `casting.tsx` | showing every finished look as worn photography **leans on Jack's open question 2** (render on a body vs flat lay) in the direction `casting.tsx` already assumes. Not settled: the flat lay still exists, a14 still toggles to it, and one line puts it back |
| `data/inventory.ts`, `data/capsules.ts` | **Day 2 and Established show GREY PLACEHOLDERS, not clothes.** Their fixtures use the original prototype's short names (`wool coat`, `roll neck`, `red bag`) and the catalogue has none of them — `garmentImage` returns undefined, so every flat lay, slot strip and wardrobe tile falls back to a named box. Day 1 is fine because it draws from `cataloguePool`. Pre-existing, and it undercuts anything that shows a look on those days |
| `data/challenges.ts` (`YESTERDAYS_BRIEF`) | "The interview" is hardcoded in four other places (`ui/ResultCard.tsx` ×3, `today/result.tsx`, both archive fixtures). They should collapse onto the constant |
| everywhere | **"render" is "generate" in COPY ONLY.** Katya, 4 Sep. Every user-visible string says generate; the code still says render throughout — `domain/renders.ts`, `RENDER_DELAY_MS`, `rerenderVerdict`, the `rendering` route and state, `RenderStrip`. Renaming the internals is a large, purely mechanical diff and it was not asked for. Say if you want it, because the split will confuse a fresh session |
| `onboarding/first-challenge.tsx`, `app/(tabs)/today/index.tsx` | o7's card says **today's brief** (Katya's mockup) and the Today heading says **Today's styling challenge** — two words for one thing on consecutive screens. Built to the mockup; pick one |
| `app/create/index.tsx`, `app/create/posted.tsx` | **a17 HAS ONE ENTRY POINT LEFT.** The generate step's link and its footer both routed to `create/posted`; on 7 Sep they became a `SubmissionSheet` drawer and a Back-to-Wardrobe button, so a17 is now reachable ONLY by leaving and returning through the Wardrobe banner. Not deleted, because that banner still opens it. Say whether the drawer is meant to replace it |
| `src/ui/text.tsx` (`Link`) | **a `Link` renders as a bare `<div>`** — no `role`, no `tabindex` (measured 7 Sep). So the app's text links are unreachable by keyboard and unannounced to a screen reader, in the eight places where they are often the only route to a screen. Same class as the `accessibilityState` gap; pre-existing, not introduced by any one change |
| `config/app.ts` | the name. Now **Editorial.** (3 Sep), after *quintets.*, after the *Velocity* rejection. STILL no availability or trademark checks on any candidate, and "Editorial" is a common noun in this exact category — the most contested of the three so far |

---

## Navigation, and the one thing that bites

**Every tab stack with more than one screen needs `unstable_settings` naming its
anchor**, or a route reached directly — a deep link, or a `router.replace` chain
— becomes that tab's *only* route, with nothing beneath it:

```ts
export const unstable_settings = { initialRouteName: 'index' };
```

The day's flow `replace`s all the way through (`build` → `rendering` → `judging`
→ `settled`) to keep it one-way, so without the anchor the whole Today tab was a
single screen. The symptom was invisible in every individual file: from the
challenge-complete screen, pressing the Today tab did nothing, because pressing
a focused tab pops its stack to the top and the top was already the only route.

**Create is NOT a tab** (4 Sep) and must not become one again by accident. It
is entered from a banner at the top of the Wardrobe. Two ways of keeping it in
`(tabs)/` while hiding its button were tried and BOTH TRAPPED THE USER on it —
pressing any other tab changed the URL and left Create on screen with every tab
dead: `href: null`, and `tabBarItemStyle: { display: 'none' }`. It is a
root-stack route now, like `casting`. Consequences that had to be built with
it: the create lane's badge moved to the **Wardrobe** tab (nothing else leads
to the finished look), and Create's home states need their own way out —
`LogoBlock` takes an `onBack` for exactly this and nothing else should pass it.

**Metro caches the route tree.** After moving a route between folders, Fast
Refresh will keep serving the old one — the tab bar showed a fifth `create` tab
for several minutes after the move. Restart the dev server, don't debug the
ghost.

**Every tab's `href` is pinned to its root**, and that is the other half of
the same bug. React Navigation builds each tab's link from the route that tab
is currently showing, so after the day's replace chain the Today tab rendered
as `<a href="/today/rendering">` — a link pointing into the middle of its own
stack, which on web is a no-op because the target is already inside the focused
tab. The dead Today tab came back on the challenge-complete screen for exactly
this reason, months after the listener below "fixed" it. Pin the href; don't
trust the remembered route.

**Pressing a tab takes you to that tab's home**, and that is explicit —
`homeOnTabPress` in `(tabs)/_layout.tsx`. React Navigation does it for free on
native, but on web the bar renders real links, so the press is handled as link
navigation and the default `tabPress` behaviour never runs. It navigates the
nested stack BY NAME: a tab route's `state` has `routes` and `index` but no
`key`, and an untargeted stack action bubbles UP to the root stack instead of
down into the tab.

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
    wardrobe/              a15 — and the ONLY door into Create (ui/CreateBanner)
    you/                   a10
  create/                  a11 a17 — NOT a tab (4 Sep). A SIX-STATE MACHINE, not
                           a screen: pick · look (the commit) · tag · render,
                           with casting on /casting between 3 and 4
  casting.tsx              a18 — a modal, because two flows open it

src/
  domain/     pure, testable, no React. The rules live here
              tags.ts     free-text tags + the reversal of "no free text anywhere"
              renders.ts  the two allowances, the 07:00 day, the re-render window,
                          and the Create tab's six-state machine
              today.ts    the job card's five states, and why `failed` sits
                          BELOW the round in the ordering
              magazine.ts sample-don't-sort, the filter rail, and TRENDING —
                          the one guarded reversal of it. Read before touching
              looks.ts    `LookKind`, and why it does not live in reactions.ts
              you.ts      what a10 is ALLOWED to say, and when. Empty states,
                          the descriptor ladder, the tip thresholds
              handle.ts   the public identifier: shape, uniqueness, the @
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
| `S.cstep`, `cpick`, `cfree`, `freeRender` | `state/create.ts` |

`S.cocc` (the closed occasion axis) and `S.cdest` (post vs keep) have no successor —
both were deleted on 4 Sep. See invariants 20 and 24.

**Subscribe with a selector**, always — `useMagazine((s) => s.filter)`, not
`useMagazine()`. Taking the whole store re-renders the entire feed on one reaction tap,
which is precisely the prototype behaviour the port removed.

---

**The clock is real now** (4 Sep). `phase` reads `phaseAt(new Date())` at boot
rather than starting at `entry` and only moving when the flow pushed it — which
is why the job never actually shut at 8pm and the card's "closed, now judging"
copy was unreachable to anyone who did not enter. **`FORCE_PHASE` in
`config/testState.ts` overrides it, and a moderated session held in the evening
needs that**: without it a 21:00 session boots into `judging` and the
participant cannot build a look at all.

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
npm test               # 210 assertions over the domain layer
```

**Motion on the spread card is decoration over settled state.** Calling a look
records it immediately and the animations run on top — the opposite of the
judging round, where the exit animation owns the vote and needs a timeout
fallback. Keep it that way: nothing on the spread should wait for a frame.

**Animation cannot be verified in the Claude preview pane.** That surface renders
offscreen — `document.visibilityState` is `hidden` and `requestAnimationFrame`
never fires — so every JS-driven `Animated` value sits at its start value
forever. Static layout screenshots are fine (they're captured out of band);
motion needs a real device or a normal browser tab.

That environment found a real bug, so it is worth knowing: **never gate state on
an animation's completion callback alone.** `Animated.timing(...).start(cb)`
runs `cb` on the JS driver, and a starved frame loop means it never runs. The
judging round's vote was lost exactly this way. `ui/LookPlate.tsx` and
`ui/BottomSheet.tsx` both carry a `setTimeout` fallback for that reason.

Then **run it on a device or simulator and look at it.** Neither command above catches
layout, and the prototype's history is full of things that passed structural checks and
broke visually. The known-unverified list is in `README.md`.

If the footer of a screen floats away from the bottom, it is the flex gotcha: the
scrolling child needs `flex: 1` *and* `minHeight: 0`. `Scroll` in `ui/layout.tsx` does
both — a screen that hand-rolls a ScrollView will not.

**`accessibilityState` does not reach the DOM on web.** A `variant="off"`
button rendered with `role="button"`, `tabindex="0"` and no `aria-disabled`,
so a screen reader was told a dead control was live and a keyboard user could
tab to it and press Enter to nothing. Passing `aria-disabled` / `focusable` by
hand does not help — `Pressable` drops both. Its own `disabled` prop is what
emits the attribute and removes it from the tab order. Same class of gap as
the missing `aria-checked` on the onboarding rails radios. Fixed once, in
`ui/controls.tsx`; check the rendered attributes rather than the props if you
add another dead control.

**`{ someProp: undefined }` does NOT reset a style property.** RN's style
composition *drops* undefined values, so `[base, { width: undefined }]` keeps
`base.width`. It bit twice on 4 Sep — a tooltip caret that stayed on the left and
gained a right offset, and a reaction pill that stayed 44pt wide so any label over
six characters spilled out through both borders. Write two complete styles and
pick between them, or use `minWidth`/`maxWidth` so nothing needs overriding.

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

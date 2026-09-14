/**
 * a10 · YOU — trajectory, not activity.
 *
 * ══ ONE PRINCIPLE DECIDES EVERY EMPTY STATE ON THIS SCREEN ══
 *
 *   An empty state that names a FUTURE is fine.
 *   An empty state that names an ABSENCE is not.
 *
 * Six unearned milestones are a roadmap. A grid of zeros is an accusation. So
 * Milestones shows in full from day one and almost everything else stays out
 * until it has something true to say. The rules are in domain/you.ts, tested,
 * because they are copy decisions that a render is very good at eroding.
 *
 * NOTHING ON THIS SCREEN IS A FIXTURE STRING ANY MORE. The header used to
 * print `cfg.profileMeta`, a pre-baked descriptor — which is why it read
 * "@katyabeer · just joined · 0 looks" above a body reporting 74 jobs entered:
 * the descriptor was not wired to anything. Handle, tenure, look count and
 * token count are all read now.
 *
 * NO LEVELS, NO XP, NO LEADERBOARD. Six fixed milestones instead, and none of
 * them is reaction-shaped. A leaderboard makes the room a place to beat rather
 * than a place to read.
 *
 * ⚠ OPEN QUESTION B — `Streak` under Stats. Recommendation: CUT THE ROW, keep
 * the *Week straight* milestone. It measures attendance twice, and a streak is
 * the one number here that rewards opening the app rather than reading a room.
 * Behind SHOW_STREAK so the decision stays one line. Katya's call.
 *
 * ⚠ IN THE BUILD, RATIONALE NOT RECORDED: the five-section shape, the bands
 * table, the "your calls" framing and the six milestones all arrived in a
 * session whose reasoning is not written down. Do not present these as settled
 * decisions to the client, and do not "correct" them without asking.
 */

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Gap, LogoBlock, Screen, Scroll, Sig } from '@/ui/layout';
import { SigHead, Hero, Lede, Body, Tiny, Kick, B, Link } from '@/ui/text';
import { Button, ChipRow } from '@/ui/controls';
import { Card, Milestones, Reach, Roundel, StatGrid, Trend, TrendKey } from '@/ui/cards';
import { ConfirmSheet } from '@/ui/ConfirmSheet';
import { PostRow } from '@/ui/PostRow';
import { ReactionsChart } from '@/ui/ReactionsChart';
import { RenderedLook } from '@/ui/RenderedLook';
import { radius } from '@/theme/tokens';
import {
  REACTIONS_CAPTION,
  TIPS,
  buildClause,
  piecesLine,
  profileLine,
  qualifyingTips,
  roomClause,
  sentenceChips,
  sentenceState,
  showAllPostsLink,
  showReactionsCaption,
  showTrend,
  showWardrobeRoute,
  statCells,
  topTags,
  type YouRollup,
} from '@/domain/you';
import { TAG_HISTORY_ESTABLISHED } from '@/data/inventory';
import {
  YOU_DAY_TWO_CAPTION,
  YOU_DAY_TWO_DAYS,
  YOU_DAY_TWO_INSIGHT,
  YOU_DAY_TWO_POSTS,
  YOU_DAY_TWO_REACTIONS,
  YOU_DAY_TWO_REACTIONS_TOTAL,
  YOU_DAY_TWO_SUBMISSIONS,
  YOU_DAY_TWO_TAGS,
} from '@/data/you';
import { dayConfig } from '@/config/testState';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { useCreate } from '@/state/create';
import { useMagazine } from '@/state/magazine';
import { useSubmission } from '@/state/submission';

/** OPEN QUESTION B. Set to false to take the recommendation. */
const SHOW_STREAK = true;

/**
 * THE ROLLUP. §8 puts this in the overnight settlement pass — recomputed once,
 * never on screen load, because the eye tip is a cohort query that must never
 * run in a request. Here it is assembled from the stores, which is the same
 * shape read from a different place.
 *
 * ⚠ ESTABLISHED IS STILL PARTLY FIXTURES, and it has to be: there is no real
 * four-month history in a prototype that reboots on save. Days 1 and 2 are
 * READ FROM ACTUAL STATE — enter a look and the numbers move. Where a figure
 * is invented it is invented only for day 3.
 */
function useRollup(): YouRollup {
  const day = useSession((s) => s.day);
  const archive = useWardrobe((s) => s.archive);
  const count = useWardrobe((s) => s.count);
  const held = useEconomy((s) => s.held);
  const roundComplete = useEconomy((s) => s.roundComplete);
  const entered = useEntry((s) => s.entered);
  const tagHistory = useCreate((s) => s.tagHistory);

  const mature = day >= 3;
  /**
   * ⚠ DAY 2 IS A FIXTURE NOW (Katya, 7 Sep: "for Day 2 please mock data and
   * display what is suggested for Day 3"). It used to be read entirely from
   * the stores, and that is why the screen had almost nothing on it: on day 2
   * the prototype genuinely holds one archive row and zero reactions, because
   * there is no server and nobody has reacted to anything.
   *
   * The point of the change is to make the PROGRESSION demonstrable — day 1
   * empty, day 2 forming — which cannot be shown from real state in a
   * prototype that reboots on save. See data/you.ts for what that costs: a
   * participant who enters a look on day 2 will not see it here, and the
   * numbers do not move.
   *
   * DAY 1 IS STILL ENTIRELY REAL. Enter a look on day 1 and every figure on
   * this screen moves, which is the case that matters for the walkthrough.
   */
  const seeded = day === 2;
  /**
   * ⟲ TEN, NOT `YOU_DAY_TWO_POSTS.length`. The post list below shows six, but
   * `looks` is the whole body of work and it is READ BY THE THRESHOLDS — see
   * `TIPS` in domain/you.ts, which gates the `Just for you` section on
   * looks >= 10. Six looks and that section is silently absent, which is the
   * most expensive thing on the page not appearing because a fixture was
   * picked by feel. Six rows is what a list shows before `All 10 posts →`.
   */
  const looks = mature ? 118 : seeded ? 10 : archive.length;

  return {
    looks,
    /* SETTLED, not filed. A look banded 'live' or 'free' has no result yet,
       and the trend line is a line through results. */
    looksSettled: mature
      ? 74
      : seeded
        ? 10
        : archive.filter((a) => a.band !== 'live' && a.band !== 'free').length,
    piecesOwned: count,
    piecesTaken: mature ? 31 : seeded ? 12 : held.length,
    /* EIGHT, which is two short of the `tenHands` milestone — so that badge
       reads as nearly-there rather than as arbitrary. See `milestones` in
       config/testState.ts. */
    distinctTakers: mature ? 6 : seeded ? 8 : 0,
    jobsEntered: mature ? 74 : seeded ? 5 : entered ? 1 : 0,
    freestylePosts: mature ? 44 : seeded ? 5 : archive.filter((a) => a.band === 'free').length,
    judgingRounds: mature ? 96 : seeded ? 7 : roundComplete ? 1 : 0,
    /* SIX — every one of the six days in `ARCHIVE_DAY_TWO` has something
       filed on it, so a shorter streak would contradict the list. ⚠ The row
       itself is open question B; the recommendation is still that it comes off
       and the `Week straight` milestone carries the idea. */
    streakDays: mature ? 9 : seeded ? 6 : 0,
    /* ⚠ SUMMED FROM THE SERIES, not written. The chart's own header counts
       the series and the Stats grid prints this stat, one scroll apart on the
       same screen — so a literal here is a contradiction waiting for someone
       to edit the array. See data/you.ts. */
    reactionsReceived: mature ? 212 : seeded ? YOU_DAY_TWO_REACTIONS_TOTAL : 0,
    distinctReactors: mature ? 88 : seeded ? 19 : 0,
    /* FROM THE REACTION VOCABULARY (AC 11). It used to be the word `brave`,
       which is in neither vocabulary — the old register list — so the screen
       could say "you build quiet and the room reads you as sharp" out of a
       vocabulary containing neither word. */
    /* Day 2's six posts read `fresh` twice and `iconic`, `bold`, `creative`
       once each, so the modal read is `fresh` — the sentence says what the
       room said MOST, not last. Check YOU_DAY_TWO_POSTS if you change it. */
    modalRead: mature ? 'bold' : seeded ? 'fresh' : null,
    /**
     * YOUR OWN construction words, not the room's. AC 11 constrains the words
     * describing how the room read you; these describe what you BUILD, so they
     * are free of the reaction vocabulary.
     *
     * Day 2's are its own now — Katya, 13 Sep: "the summary about them needs
     * to change and talk about their style choices". They are read off
     * `WARDROBE_DAY_TWO`, which is charcoal, black and tailoring almost all the
     * way through, and they agree with that state's top tags.
     *
     * ⚠ DAY 1 STILL SHARES ESTABLISHED'S WORDS, and on day 1 they are a lie —
     * "you build quiet and structured" from an account that has built nothing.
     * It is unreachable rather than wrong on screen: `SENTENCE_MIN_LOOKS` is 3
     * and one day allows at most two looks, so the sentence never renders
     * there. Left alone because fixing it is a change to a signed-off state
     * for no visible gain. Katya's call.
     */
    buildWords: seeded ? ['tailored', 'dark', 'quiet'] : ['quiet', 'structured'],
    /* Real tags typed this session rank ALONGSIDE Established's fixture
       history rather than replacing it, so the section still responds to what
       you do. Days 1 and 2 are entirely real. */
    topTags: topTags(
      mature
        ? [...tagHistory, ...TAG_HISTORY_ESTABLISHED]
        : seeded
          ? [...tagHistory, ...YOU_DAY_TWO_TAGS]
          : tagHistory,
    ),
    /**
     * Feeds the sentence's chip row (`sentenceChips` takes the first two) and
     * nothing else. Day 2's are the three highest `worn` counts in
     * `WARDROBE_DAY_TWO` — real names, real numbers — which is what lets the
     * chips and the `Noticed` insight name the same pieces instead of two
     * different sets of clothes on one screen.
     *
     * ⚠ Established's four are legacy prototype names (`black knit`, `grey
     * trouser`) that the catalogue does not carry. Harmless here because the
     * chips are text, but it is the same rot as its wardrobe fixture.
     */
    mostUsedPieces: mature
      ? [
          { value: '9', label: 'black knit' },
          { value: '8', label: 'grey trouser' },
          { value: '6', label: 'wool coat' },
          { value: '5', label: 'red bag' },
        ]
      : seeded
        ? [
            { value: '5', label: 'fine turtleneck' },
            { value: '4', label: 'funnel neck coat' },
            { value: '3', label: 'poplin shirt' },
          ]
        : [],
    /* TWENTY-ONE, one past the `closeCallsJudged >= 20` threshold that opens
       the Weakness tip — and `qualifyingTips` drops a lone Weakness, so all
       three thresholds have to clear together or none of them show. */
    closeCallsJudged: mature ? 61 : seeded ? 21 : 0,
  };
}

export default function You() {
  const day = useSession((s) => s.day);
  const cfg = dayConfig(day);
  const handle = useSession((s) => s.handle);
  const firstEntryAt = useSession((s) => s.firstEntryAt);
  const dayNumber = useSession((s) => s.dayNumber);
  const balance = useEconomy((s) => s.balance);
  const r = useRollup();

  /* `Noticed` renders on day 2, and it is the same observation as the
     `wardrobe` tip — see the note on `qualifyingTips`. */
  const tips = qualifyingTips(r, { noticedShowing: day === 2 });
  const chips = sentenceChips(r);
  const read = roomClause(r.modalRead);
  /* ZEROS KEPT ON DAY ONE ONLY. See `statCells` in domain/you.ts — this is
     the one line that decides it, and it reopens you-brief q1. */
  const stats = statCells(r, SHOW_STREAK, { keepZeros: r.looks === 0 });

  const seeded = day === 2;
  const [postFilter, setPostFilter] = useState<string>('All');
  const [confirmOut, setConfirmOut] = useState(false);

  /* Every store back to its day-1 shape, then out to the front door. There is
     no auth in this prototype, so "log out" can only mean "start again" —
     which is also the most useful thing it can do in a moderated session
     (it is how you reset between participants without editing testState).

     ⚠ IT IS BEHIND A CONFIRM DELIBERATELY. A participant tapping this out of
     curiosity mid-session would lose the whole run, and that is the one
     genuinely destructive control on the screen. */
  const logOut = () => {
    useSession.getState().resetToDay(1);
    useEconomy.getState().resetToDay(1);
    /* ⟲ THE WARDROBE WAS MISSING FROM THIS LIST, and on a build seeded to day 2
       it shows: log out, and onboarding opens owning thirty pieces — on the run
       whose entire premise is that the wardrobe starts EMPTY and the look you
       enter becomes it (`adoptLook`). It was harmless while the shipped seed
       was day 1, because day 1 seeds nothing.

       `hydrate` in state/wardrobe.ts existed for exactly this and had no
       caller; it does now. */
    useWardrobe.getState().hydrate(1);
    useEntry.getState().reset();
    useCreate.getState().startAgain();
    useMagazine.getState().reset();
    useSubmission.getState().reset();
    router.replace('/onboarding/splash');
  };

  /**
   * THREE, AND THE REST IS BEHIND THE LINK (Katya, 13 Sep: "reduce Your posts
   * to display three recent posts, the rest can go behind a click").
   *
   * The list is newest-first, so the slice is the three most recent — and it is
   * applied AFTER the filter, so a chip still narrows the whole history rather
   * than narrowing the three that happen to be on screen. `All 10 looks →`
   * below is where the rest lives; the Looks archive in the Wardrobe holds all
   * ten of them.
   */
  const POSTS_SHOWN = 3;
  const filteredPosts = seeded
    ? YOU_DAY_TWO_POSTS.filter(
        (post) =>
          postFilter === 'All' ||
          (postFilter === 'Freestyle' ? post.kind === 'freestyle' : post.band === postFilter),
      )
    : [];
  const posts = filteredPosts.slice(0, POSTS_SHOWN);

  return (
    <Screen>
      {/* handle · tenure · body of work, then the token count as the next
          action rather than a bare figure. The handle has no fallback string:
          if it is empty, onboarding did not complete. */}
      <LogoBlock
        title="You"
        subtitle={profileLine({
          handle,
          tenure: { dayNumber, hasEntered: firstEntryAt !== null, looks: r.looks },
          tokens: balance,
        })}
      />

      <Scroll>
        {/* ══ You in a sentence ══
            HIDDEN until there are looks to read it from. The you-brief derives
            a day-one version from the onboarding capsule; there is no capsule
            (cut 3 Sep), so the only day-one declaration is RAILS — a soft
            preference about clothes, far too thin to hang an identity sentence
            on. Inventing one is the thing this screen exists not to do. See
            the header of domain/you.ts. */}
        {sentenceState(r) !== 'hidden' ? (
          <Sig>
            {/* ⟲ "You in a sentence" until 13 Sep. It described the FORM of
                the thing rather than its subject — every other head on this
                screen names what is under it (Your posts, Reactions, Stats,
                Milestones) — and a section called "in a sentence" is a section
                promising to be brief, which is the app talking about itself. */}
            <SigHead>Your style</SigHead>
            <Lede style={{ marginTop: 8 }}>
              You build <B>{buildClause(r.buildWords)}</B>
              {read ? (
                <>
                  , and the room reads you as <B>{read}</B>.
                </>
              ) : (
                <>. The room hasn’t settled on you yet.</>
              )}
            </Lede>
            {/* ROOM-DERIVED, so absent rather than dashed when the room has
                said nothing. */}
            {chips ? (
              <View style={{ marginTop: 11 }}>
                <Reach items={chips} />
              </View>
            ) : null}
            {/* ⟲ "Built from your looks, what you take from the magazine, and
                what the room says back." came off 13 Sep. It explained where
                the sentence above came from, which is the app describing its
                own method underneath the one line on this screen that is
                supposed to be read as a statement about the reader. */}
          </Sig>
        ) : null}

        {/* ══ DAY ONE'S LEAD — the only thing on the page that is a PROMISE ══
            Katya's day-1 concept, 7 Sep. Every other section on this screen
            waits until it has something true to say, which on day one leaves
            the page opening on an empty state — so the one line that IS
            honest on day one is the page introducing itself.

            ONE SENTENCE, not the mock's three ("less wordy, more visual").
            The mock's paragraph lists what the page will eventually hold —
            what you reach for, how the room reads it, where your eye is sharp
            — which is the page describing its own feature set. The sections
            below already show their shape; this only has to say that they
            fill themselves in. */}
        {r.looks === 0 ? (
          <Sig>
            <Hero size={30}>{'Nice to\nmeet you.'}</Hero>
            <Body style={{ marginTop: 10 }}>
              This page fills itself in as you build, judge and get read.
            </Body>
          </Sig>
        ) : null}

        {/* ══ NOTICED — the first insight, and it is the CHEAP kind ══
            Day 2 only. Her note: it counts the user's OWN WARDROBE — no cohort
            maths, no vote history — which is why it can exist on day 2 while
            `Just for you` below is still absent. Those tips need results
            behind them and a cohort query; this needs only what you own.

            It is the one place on You with a route out of it, because it is
            the one observation that names an action. */}
        {/* ⟲ THE `Noticed` HEAD AND THE CTA BOTH CAME OFF, 13 Sep. The card
            already carries its own accent kicker ("from your own looks"), so
            the section head above it was a second label on one object — and
            the link made an observation into an errand. ⚠ This was described
            as "the one place on You with a route out of it"; it no longer has
            one, and nothing on this screen does. `YOU_DAY_TWO_INSIGHT.cta` is
            kept in the fixture, unrendered, in case the route comes back. */}
        {seeded ? (
          <Sig>
            <Card style={{ borderRadius: radius.lg, padding: 15 }}>
              <Kick tone="accent">{YOU_DAY_TWO_INSIGHT.kick}</Kick>
              <Lede style={{ marginTop: 8 }}>{YOU_DAY_TWO_INSIGHT.title}</Lede>
              <Body style={{ marginTop: 8 }}>{YOU_DAY_TWO_INSIGHT.body}</Body>
            </Card>
          </Sig>
        ) : null}

        {/* ══ Just for you — ABSENT, not empty, until a tip qualifies ══
            The tips are the expensive item. "Keep going and we'll tell you
            about your eye" is an IOU against a cohort query, and a lone
            Weakness is the whole section reading as criticism — both handled
            in `qualifyingTips`. */}
        {tips.length ? (
          <Sig>
            <SigHead>Just for you</SigHead>
            <View style={{ marginTop: 4 }}>
              {TIPS.filter((t) => tips.includes(t.key)).map((t) => (
                <Roundel
                  key={t.key}
                  label={t.role}
                  tone={t.role === 'Strength' ? 'accent' : t.role === 'Weakness' ? 'alert' : 'plain'}
                  title={t.title}
                  body={(seeded ? TIP_BODIES_DAY_TWO : TIP_BODIES_ESTABLISHED)[t.key]}
                />
              ))}
            </View>
          </Sig>
        ) : null}

        {/* ══ Your posts — the one section where a CTA empty state is right,
              because the absence has a direct fix and the fix is today ══ */}
        <Sig>
          <SigHead>Your posts</SigHead>
          {r.looks === 0 ? (
            <>
              <Lede style={{ marginTop: 8 }}>Nothing filed yet.</Lede>
              <Body style={{ marginTop: 7 }}>Today’s job closes at 8pm.</Body>
              <Button
                label="Go to today’s job"
                style={{ marginTop: 12 }}
                onPress={() => router.push('/(tabs)/today')}
              />
            </>
          ) : seeded ? (
            <>
              {/* THE CHIPS ARE LIVE, not decoration. A dead filter rail is on
                  the do-not-re-propose list (the magazine had one), and with
                  three posts a working filter costs one `.filter`. They appear
                  only because there is now more than one category to filter
                  — on day 1 there is nothing to sort. */}
              <View style={{ marginTop: 10 }}>
                <ChipRow
                  items={POST_FILTERS}
                  value={postFilter}
                  onChange={setPostFilter}
                />
              </View>

              <View style={{ marginTop: 6 }}>
                {posts.map((post, i) => (
                  <PostRow key={post.title} post={post} last={i === posts.length - 1} />
                ))}
              </View>

              {/* ══ HOW THEIR SUBMISSIONS ARE PERFORMING ══
                  Katya, 13 Sep: "Show a graph for how their own submissions
                  (via Challenges and Create freestyle) are performing."

                  ⟲ THIS SLOT USED TO HOLD AN APOLOGY — "No trend line yet,
                  that needs five settled results" — because two settled
                  results is a point and a point. Ten clears
                  `TREND_MIN_SETTLED`, so the line is real and the apology
                  goes rather than sitting above the thing it says is missing.

                  TWO SERIES, and the legend is what makes them readable: a
                  brief entry is judged against a brief and a free post is not
                  judged at all, so one blended bar would have answered a
                  different question. See `Trend` in ui/cards.tsx. */}
              {showTrend(r) ? (
                <>
                  <View style={{ marginTop: 12 }}>
                    <Trend
                      values={YOU_DAY_TWO_SUBMISSIONS.challenge}
                      second={YOU_DAY_TWO_SUBMISSIONS.freestyle}
                      labels={YOU_DAY_TWO_SUBMISSIONS.days}
                    />
                  </View>
                  {/* The key stays and the caption goes (13 Sep). The two
                      swatches are what make the paired bars readable at all;
                      the sentence under them read the chart back. */}
                  <TrendKey a="Challenges" b="Freestyle" />
                </>
              ) : null}

              {/* The route to the rest of them. The Looks archive in the
                  Wardrobe is where a post list actually lives — this section
                  is a summary of it, and six rows of ten is the point at
                  which that needs saying. */}
              {showAllPostsLink(r) ? (
                <Link style={{ marginTop: 11 }} onPress={() => router.push('/(tabs)/wardrobe')}>
                  All {r.looks} looks →
                </Link>
              ) : null}
            </>
          ) : day >= 3 ? (
            <>
              {/* PHOTOGRAPHS, not the grey plates (7 Sep). These are finished
                  generations, and the ruling from earlier the same day is
                  that every ready look shows as a look — the flat lay and the
                  grey plate both belong to the states BEFORE one exists. The
                  band each one earned is under it, because a picture with no
                  result attached is just clothes. */}
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 9 }}>
                {ESTABLISHED_POSTS.map((post, i) => (
                  <View key={post.band} style={{ flex: 1 }}>
                    <RenderedLook index={i} />
                    <Tiny style={{ marginTop: 5 }}>{post.band}</Tiny>
                    <Tiny>{post.job}</Tiny>
                  </View>
                ))}
              </View>
              {/* A trend line through two points is a decoration. */}
              {showTrend(r) ? (
                <>
                  <View style={{ marginTop: 11 }}>
                    <Trend values={[30, 24, 44, 38, 52, 66, 60, 81, 74]} />
                  </View>
                  <Body style={{ marginTop: 7 }}>
                    Your last nine jobs. Climbing since May, with a dip when you tried colour.
                  </Body>
                </>
              ) : null}
              {showAllPostsLink(r) ? (
                <Link
                  style={{ marginTop: 9 }}
                  onPress={() => router.push('/(tabs)/wardrobe')}
                >
                  All {r.looks} posts →
                </Link>
              ) : null}
            </>
          ) : (
            /* One job is a point, not a line. No trend, and no caption
               pretending there is one. */
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 9 }}>
              <View style={{ width: '33%' }}>
                <RenderedLook />
              </View>
              <View style={{ flex: 1 }}>
                <Lede>Your first one is in.</Lede>
                <Body style={{ marginTop: 8 }}>
                  One job is a point, not a line. The shape of it starts showing up here after
                  about a week.
                </Body>
              </View>
            </View>
          )}
        </Sig>

        {/* ══ REACTIONS — the animated one ══
            AFTER the posts, and her note says why: "the posts are the
            evidence and the chart is the summary of them, so it reads in that
            order."

            ABSENT until there is something in it. Day one shows no chart at
            all rather than an empty frame — the same rule as `Just for you`.
            From day two it is a fixed seven-day window, so filling in reads
            as progress rather than as the chart changing size.

            See ui/ReactionsChart.tsx for why the animation is a timer and not
            an `Animated` value; the short version is that the preview pane
            never fires `requestAnimationFrame`, and an animation that fails
            there leaves an EMPTY graph rather than a still one. */}
        {r.reactionsReceived > 0 && seeded ? (
          <Sig>
            <SigHead>Reactions</SigHead>
            <View style={{ marginTop: 9 }}>
              <ReactionsChart
                values={YOU_DAY_TWO_REACTIONS}
                labels={YOU_DAY_TWO_DAYS}
                caption={YOU_DAY_TWO_CAPTION}
              />
            </View>
          </Sig>
        ) : null}

        {/* ══ Stats — A GRID OF NUMBERS, zeros greyed on day one ══
              A wall of zeros on day one is the single most demoralising thing
              this screen could do, and it teaches nothing Milestones is not
              already teaching in the register of goals rather than deficits.
              `SUPPRESS_ZERO_STATS` in domain/you.ts is the one-line flip. */}
        <Sig>
          <SigHead>Stats</SigHead>
          {stats.length ? <StatGrid cells={stats} /> : null}

          {/* Pre-empts the reading of these numbers as a ranking. Never a
              rate, rank or percentile — reaction volume depends on how often
              the sampler surfaced your look, so it is truthful about you and
              meaningless between people. */}
          {showReactionsCaption(r) ? <Tiny style={{ marginTop: 8 }}>{REACTIONS_CAPTION}</Tiny> : null}

          {r.mostUsedPieces.length ? (
            <>
              <Kick style={{ marginTop: 15 }}>most used</Kick>
              <View style={{ marginTop: 6 }}>
                <Reach items={r.mostUsedPieces} />
              </View>
            </>
          ) : null}

          {/* ⟲ `your words` CAME OFF EVERYWHERE, 13 Sep — the five tags under
              the stats grid.

              ⚠ `topTags` is still computed in the rollup and `YOU_DAY_TWO_TAGS`
              is still a fixture; nothing renders either. They are the only
              thing in the app reading `tagHistory`, which is what Create's tag
              step writes — so deleting them would quietly make that step write
              to nothing. Left wired, unrendered. */}

          {/* ⟲ THE PIECES LINE CAME OFF DAY 2 ONLY, and it took a round to get
              there. Katya asked for "You own 30 pieces. Find something to go
              with the rest →" to go — which was this block's DAY 2 output, but
              the block serves every day, so removing it outright also took
              "Nothing in your wardrobe yet." off Day 1 and Established. Caught
              in the day-1 audit; her call was to restore it outside day 2.

              The route is still conditional on owning something
              (`showWardrobeRoute` is `piecesOwned > 0`): with an empty wardrobe
              it pointed at the remainder of nothing. So on day 1 the line
              appears alone until the first look is adopted, and gains its link
              after — which is the behaviour being put back, not a new one. */}
          {day !== 2 ? (
            <Body style={{ marginTop: 8 }}>
              {piecesLine(r)}
              {showWardrobeRoute(r) ? (
                <>
                  {' '}
                  <Link onPress={() => router.push('/(tabs)/magazine')}>
                    Find something to go with the rest →
                  </Link>
                </>
              ) : null}
            </Body>
          ) : null}
        </Sig>

        {/* ══ Milestones — six, fixed, all shown from day one ══
              The roadmap, and the reason nothing else needs to show zeros.
              None of the six is reaction-shaped and none becomes so. */}
        <Sig last>
          <SigHead>Milestones</SigHead>
          <View style={{ marginTop: 9 }}>
            <Milestones earned={cfg.milestones} />
          </View>
          {/* The count reads back, so the line moves with the ticks rather
              than needing a case per day. Day 2 earns two now (Filed and
              Borrowed — see her mock's day 3), which is what broke the old
              `=== 1` special case. */}
          <Body style={{ marginTop: 9 }}>
            {cfg.milestones.length === 0
              ? "Six, and that's all there are. No levels, no leaderboard."
              : `${cfg.milestones.length} of six. That is all there are — no levels, no leaderboard.`}
          </Body>
        </Sig>

        {/* ══ LOG OUT — last thing on the page, and quiet ══
            Katya, 7 Sep. Ghost rather than solid: it is the least likely
            thing anyone came here to do, and a filled button at the foot of a
            profile reads as the page's primary action. Behind a confirm
            because it resets the whole run — see `logOut`. */}
        <Button
          label="Log out"
          variant="ghost"
          style={{ marginTop: 22 }}
          onPress={() => setConfirmOut(true)}
        />

        <Gap />
      </Scroll>

      {/* Outside the Scroll — a Modal has to float over the screen rather
          than scroll with it. */}
      <ConfirmSheet
        visible={confirmOut}
        kick="log out"
        question="Log out of Editorial?"
        note="There is no account to come back to in this build — logging out starts the whole run again from onboarding."
        confirmLabel="Log out"
        cancelLabel="Stay"
        onConfirm={() => {
          setConfirmOut(false);
          logOut();
        }}
        onCancel={() => setConfirmOut(false)}
      />
    </Screen>
  );
}

/** The post filters. `All` first, then the two categories day 2 actually has
 *  — a filter for a band nobody has placed in would be a dead chip. */
/**
 * ⚠ THESE MUST MATCH THE BANDS THE POSTS ACTUALLY CARRY, or a chip filters to
 * nothing. `Upper quarter` joined when the returning state's result moved a
 * band up (data/results.ts); `Lower half` is deliberately offered too — the
 * room did not like one of their looks and hiding that is the product
 * flattering, which is the one thing the result screen is careful not to do.
 */
const POST_FILTERS = ['All', 'Upper quarter', 'Upper half', 'Lower half', 'Freestyle'] as const;

/** Established's three most recent, as bands rather than as a mock post list:
 *  this branch shows a strip of pictures, not the day-2 row list. */
const ESTABLISHED_POSTS = [
  { band: 'Top of the room', job: 'Airport' },
  { band: 'Upper half', job: 'Interview' },
  { band: 'Freestyle', job: '4 took a piece' },
] as const;

/** The tip copy, keyed off the pool in domain/you.ts. Kept out of the domain
 *  module because that one owns the thresholds, not the prose. */
/**
 * ⚠ THE BODIES CARRY NUMBERS, SO THEY ARE PER-DAY.
 *
 * These were written for Established — 14 looks, 20 close calls — and until
 * 13 Sep that was the only state where any tip qualified. The returning state
 * clears all three thresholds too, and it has 10 looks and 21 close calls, so
 * Established's figures would have contradicted the Stats grid three sections
 * further down the same screen.
 *
 * `wardrobe` has no day-2 entry because it is suppressed there — `Noticed`
 * says it instead. Keep every figure below in step with `useRollup`.
 */
const TIP_BODIES_ESTABLISHED: Record<(typeof TIPS)[number]['key'], string> = {
  wardrobe:
    'The same six turn up in 11 of your last 14 looks. Eleven things you own have never been worn.',
  loudPiece:
    'Your three best results each had exactly one statement piece. When you spread the volume across two, you place lower.',
  eye: 'When the room split on something bold, you picked the safer one 7 times out of 10. Your eye is sharper on quiet pairs.',
};

const TIP_BODIES_DAY_TWO: Record<(typeof TIPS)[number]['key'], string> = {
  wardrobe: '',
  loudPiece:
    'Your two best results each had exactly one statement piece. The look that placed lowest had three competing for attention.',
  eye: 'When the room split on something bold, you picked the safer one 6 times out of 9. Your eye is sharper on quiet pairs.',
};

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
import { Card, Milestones, Reach, Roundel, StatGrid, Trend } from '@/ui/cards';
import { ConfirmSheet } from '@/ui/ConfirmSheet';
import { PostRow } from '@/ui/PostRow';
import { ReactionsChart } from '@/ui/ReactionsChart';
import { RenderedLook } from '@/ui/RenderedLook';
import { radius } from '@/theme/tokens';
import { chipLabel } from '@/domain/tags';
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
  const looks = mature ? 118 : seeded ? YOU_DAY_TWO_POSTS.length : archive.length;

  return {
    looks,
    /* SETTLED, not filed. A look banded 'live' or 'free' has no result yet,
       and the trend line is a line through results. */
    looksSettled: mature
      ? 74
      : seeded
        ? 2
        : archive.filter((a) => a.band !== 'live' && a.band !== 'free').length,
    piecesOwned: count,
    piecesTaken: mature ? 31 : seeded ? 4 : held.length,
    distinctTakers: mature ? 6 : seeded ? 1 : 0,
    jobsEntered: mature ? 74 : seeded ? 2 : entered ? 1 : 0,
    freestylePosts: mature ? 44 : seeded ? 1 : archive.filter((a) => a.band === 'free').length,
    judgingRounds: mature ? 96 : seeded ? 3 : roundComplete ? 1 : 0,
    streakDays: mature ? 9 : seeded ? 3 : 0,
    /* The reaction totals the chart and the counting number both read. Keep
       them and YOU_DAY_TWO_REACTIONS in step — the series sums to 6. */
    reactionsReceived: mature ? 212 : seeded ? 6 : 0,
    distinctReactors: mature ? 88 : seeded ? 5 : 0,
    /* FROM THE REACTION VOCABULARY (AC 11). It used to be the word `brave`,
       which is in neither vocabulary — the old register list — so the screen
       could say "you build quiet and the room reads you as sharp" out of a
       vocabulary containing neither word. */
    /* Day 2 has been read twice `fresh` and once `bold`, so the modal read is
       `fresh` — the sentence says what the room said MOST, not last. */
    modalRead: mature ? 'bold' : seeded ? 'fresh' : null,
    /* YOUR OWN construction words, not the room's. AC 11 constrains words
       describing how the room read you; these describe what you build, so they
       are free to stay. */
    buildWords: ['quiet', 'structured'],
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
    mostUsedPieces: mature
      ? [
          { value: '9', label: 'black knit' },
          { value: '8', label: 'grey trouser' },
          { value: '6', label: 'wool coat' },
          { value: '5', label: 'red bag' },
        ]
      : [],
    closeCallsJudged: mature ? 61 : seeded ? 3 : 0,
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

  const tips = qualifyingTips(r);
  const chips = sentenceChips(r);
  const read = roomClause(r.modalRead);
  /* ZEROS KEPT ON DAY ONE ONLY. See `statCells` in domain/you.ts — this is
     the one line that decides it, and it reopens you-brief q1. */
  const stats = statCells(r, SHOW_STREAK, { keepZeros: r.looks === 0 });
  const words = r.topTags;

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
    useEntry.getState().reset();
    useCreate.getState().startAgain();
    useMagazine.getState().reset();
    useSubmission.getState().reset();
    router.replace('/onboarding/splash');
  };

  const posts = seeded
    ? YOU_DAY_TWO_POSTS.filter(
        (post) =>
          postFilter === 'All' ||
          (postFilter === 'Freestyle' ? post.kind === 'freestyle' : post.band === postFilter),
      )
    : [];

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
            <SigHead>You in a sentence</SigHead>
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
            <Body style={{ marginTop: 7 }}>
              Built from your looks, what you take from the magazine, and what the room says back.
            </Body>
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
        {seeded ? (
          <Sig>
            <SigHead>Noticed</SigHead>
            <Card style={{ marginTop: 8, borderRadius: radius.lg, padding: 15 }}>
              <Kick tone="accent">{YOU_DAY_TWO_INSIGHT.kick}</Kick>
              <Lede style={{ marginTop: 8 }}>{YOU_DAY_TWO_INSIGHT.title}</Lede>
              <Body style={{ marginTop: 8 }}>{YOU_DAY_TWO_INSIGHT.body}</Body>
              <Link style={{ marginTop: 11 }} onPress={() => router.push('/(tabs)/magazine')}>
                {YOU_DAY_TWO_INSIGHT.cta}
              </Link>
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
                  body={TIP_BODIES[t.key]}
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

              {/* Why there is no trend line, said once. Two settled results
                  is a point and a point; `TREND_MIN_SETTLED` is five. */}
              <Tiny style={{ marginTop: 10 }}>No trend line yet — that needs five settled results.</Tiny>
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

          {/* YOUR WORDS — your own tags, now that Create takes free text. A
              self-portrait at no computational cost. Not clickable and not
              filterable, here as everywhere: a tag filter is a sort, and
              invariant 7 is sample-don't-sort. */}
          {words.length ? (
            <>
              <Kick style={{ marginTop: 15 }}>your words</Kick>
              <Body style={{ marginTop: 6 }}>{words.map(chipLabel).join('  ')}</Body>
            </>
          ) : null}

          {/* The route needs a rest to go with — with an empty wardrobe it was
              pointing at the remainder of nothing. */}
          <Body style={{ marginTop: 8 }}>
            {piecesLine(r)}
            {showWardrobeRoute(r) ? (
              <>
                {' '}
                <Link
                  
                  onPress={() => router.push('/(tabs)/magazine')}
                >
                  Find something to go with the rest →
                </Link>
              </>
            ) : null}
          </Body>
        </Sig>

        {/* ══ Milestones — six, fixed, all shown from day one ══
              The roadmap, and the reason nothing else needs to show zeros.
              None of the six is reaction-shaped and none becomes so. */}
        <Sig last>
          <SigHead>Milestones</SigHead>
          <View style={{ marginTop: 9 }}>
            <Milestones earned={cfg.milestonesEarned} />
          </View>
          {/* The count reads back, so the line moves with the ticks rather
              than needing a case per day. Day 2 earns two now (Filed and
              Borrowed — see her mock's day 3), which is what broke the old
              `=== 1` special case. */}
          <Body style={{ marginTop: 9 }}>
            {cfg.milestonesEarned === 0
              ? "Six, and that's all there are. No levels, no leaderboard."
              : `${cfg.milestonesEarned} of six. That is all there are — no levels, no leaderboard.`}
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
const POST_FILTERS = ['All', 'Upper half', 'Freestyle'] as const;

/** Established's three most recent, as bands rather than as a mock post list:
 *  this branch shows a strip of pictures, not the day-2 row list. */
const ESTABLISHED_POSTS = [
  { band: 'Top of the room', job: 'Airport' },
  { band: 'Upper half', job: 'Interview' },
  { band: 'Freestyle', job: '4 took a piece' },
] as const;

/** The tip copy, keyed off the pool in domain/you.ts. Kept out of the domain
 *  module because that one owns the thresholds, not the prose. */
const TIP_BODIES: Record<(typeof TIPS)[number]['key'], string> = {
  wardrobe:
    'The same six turn up in 11 of your last 14 looks. Eleven things you own have never been worn.',
  loudPiece:
    'Your three best results each had exactly one statement piece. When you spread the volume across two, you place lower.',
  eye: 'When the room split on something bold, you picked the safer one 7 times out of 10. Your eye is sharper on quiet pairs.',
};

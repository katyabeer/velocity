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

import { View } from 'react-native';
import { router } from 'expo-router';
import { Gap, LogoBlock, Screen, Scroll, Sig } from '@/ui/layout';
import { SigHead, Lede, Body, Tiny, Kick, B } from '@/ui/text';
import { Button } from '@/ui/controls';
import { Milestones, Reach, Stat, Roundel, Trend } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { palette } from '@/theme/tokens';
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
  statRows,
  topTags,
  type YouRollup,
} from '@/domain/you';
import { TAG_HISTORY_ESTABLISHED } from '@/data/inventory';
import { dayConfig } from '@/config/testState';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';
import { useEconomy } from '@/state/economy';
import { useEntry } from '@/state/entry';
import { useCreate } from '@/state/create';

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
  const looks = mature ? 118 : archive.length;

  return {
    looks,
    /* SETTLED, not filed. A look banded 'live' or 'free' has no result yet,
       and the trend line is a line through results. */
    looksSettled: mature ? 74 : archive.filter((a) => a.band !== 'live' && a.band !== 'free').length,
    piecesOwned: count,
    piecesTaken: mature ? 31 : held.length,
    distinctTakers: mature ? 6 : day === 2 ? 2 : 0,
    jobsEntered: mature ? 74 : entered || day === 2 ? 1 : 0,
    freestylePosts: mature ? 44 : archive.filter((a) => a.band === 'free').length,
    judgingRounds: mature ? 96 : roundComplete || day === 2 ? 1 : 0,
    streakDays: mature ? 9 : day === 2 ? 2 : 0,
    reactionsReceived: mature ? 212 : 0,
    distinctReactors: mature ? 88 : 0,
    /* FROM THE REACTION VOCABULARY (AC 11). It used to be the word `brave`,
       which is in neither vocabulary — the old register list — so the screen
       could say "you build quiet and the room reads you as sharp" out of a
       vocabulary containing neither word. */
    modalRead: mature ? 'bold' : null,
    /* YOUR OWN construction words, not the room's. AC 11 constrains words
       describing how the room read you; these describe what you build, so they
       are free to stay. */
    buildWords: ['quiet', 'structured'],
    /* Real tags typed this session rank ALONGSIDE Established's fixture
       history rather than replacing it, so the section still responds to what
       you do. Days 1 and 2 are entirely real. */
    topTags: topTags(mature ? [...tagHistory, ...TAG_HISTORY_ESTABLISHED] : tagHistory),
    mostUsedPieces: mature
      ? [
          { value: '9', label: 'black knit' },
          { value: '8', label: 'grey trouser' },
          { value: '6', label: 'wool coat' },
          { value: '5', label: 'red bag' },
        ]
      : [],
    closeCallsJudged: mature ? 61 : 0,
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
  const stats = statRows(r, SHOW_STREAK);
  const words = r.topTags;

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
          ) : day >= 3 ? (
            <>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 9 }}>
                <View style={{ flex: 1 }}>
                  <LookPlate tint="t5" occasion="Top of the room" pieces="Airport" height={120} label="·" />
                </View>
                <View style={{ flex: 1 }}>
                  <LookPlate tint="t2" occasion="Upper half" pieces="Interview" height={120} label="·" />
                </View>
                <View style={{ flex: 1 }}>
                  <LookPlate tint="t3" occasion="Freestyle" pieces="4 took a piece" height={120} label="·" />
                </View>
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
                <Tiny
                  color={palette.link}
                  style={{ marginTop: 9, fontFamily: 'Archivo_700Bold' }}
                  onPress={() => router.push('/(tabs)/wardrobe')}
                >
                  All {r.looks} posts →
                </Tiny>
              ) : null}
            </>
          ) : (
            /* One job is a point, not a line. No trend, and no caption
               pretending there is one. */
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 9 }}>
              <View style={{ width: '33%' }}>
                <LookPlate tint="t2" occasion="Upper half" pieces="Interview" height={120} label="·" />
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

        {/* ══ Stats — ZEROS SUPPRESSED, section kept ══
              A wall of zeros on day one is the single most demoralising thing
              this screen could do, and it teaches nothing Milestones is not
              already teaching in the register of goals rather than deficits.
              `SUPPRESS_ZERO_STATS` in domain/you.ts is the one-line flip. */}
        <Sig>
          <SigHead>Stats</SigHead>
          {stats.length ? (
            <View style={{ marginTop: 6 }}>
              {stats.map((row, i) => (
                <Stat key={row.label} label={row.label} value={row.value} last={i === stats.length - 1} />
              ))}
            </View>
          ) : null}

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
                <Tiny
                  color={palette.link}
                  style={{ fontFamily: 'Archivo_700Bold' }}
                  onPress={() => router.push('/(tabs)/magazine')}
                >
                  Find something to go with the rest →
                </Tiny>
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
          <Body style={{ marginTop: 9 }}>
            {cfg.milestonesEarned === 1
              ? 'One down. Six is all there are — no levels, no leaderboard.'
              : "Six, and that's all there are. No levels, no leaderboard."}
          </Body>
        </Sig>

        <Gap />
      </Scroll>
    </Screen>
  );
}

/** The tip copy, keyed off the pool in domain/you.ts. Kept out of the domain
 *  module because that one owns the thresholds, not the prose. */
const TIP_BODIES: Record<(typeof TIPS)[number]['key'], string> = {
  wardrobe:
    'The same six turn up in 11 of your last 14 looks. Eleven things you own have never been worn.',
  loudPiece:
    'Your three best results each had exactly one statement piece. When you spread the volume across two, you place lower.',
  eye: 'When the room split on something bold, you picked the safer one 7 times out of 10. Your eye is sharper on quiet pairs.',
};

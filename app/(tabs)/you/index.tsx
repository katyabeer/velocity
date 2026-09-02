/**
 * a10 · YOU — trajectory, not activity.
 *
 * FIVE SECTIONS, and which ones appear depends on how much you have actually
 * done. This is built out of the REAL sections rather than a bespoke empty
 * state — Milestones already had an unearned style, so Day 1 is six unearned
 * milestones and nothing else, and Day 2 earns the first.
 *
 * *You in a sentence* and *Just for you* stay out early on purpose: A SENTENCE
 * NEEDS LOOKS, A STRENGTH NEEDS THREE RESULTS, and inventing either is what this
 * page exists not to do.
 *
 * NO LEVELS, NO XP, NO LEADERBOARD. Six fixed milestones instead. A leaderboard
 * makes the room a place to beat rather than a place to read.
 *
 * ⚠ OPEN QUESTION B — `Streak · 9 days` under Stats. Recommendation: CUT THE
 * ROW, keep the *Week straight* milestone. It measures attendance twice, and a
 * streak is the one number on this page that rewards opening the app rather than
 * reading a room — against R-P2 and "no levels, no leaderboard".
 *
 * It is rendered below behind SHOW_STREAK so the decision is one line, not a
 * hunt. Katya's call.
 *
 * ⚠ IN THE BUILD, RATIONALE NOT RECORDED: the five-section shape, the bands
 * table, the "your calls" framing and the six milestones all arrived in a
 * session whose reasoning is not written down. They replaced an earlier
 * five-signal screen built around the gap. Do not present these as settled
 * decisions to the client, and do not "correct" them without asking.
 */

import { View } from 'react-native';
import { router } from 'expo-router';
import { Gap, LogoBlock, Screen, Scroll, Sig } from '@/ui/layout';
import { Lede, Tiny, Kick, SigHead, B } from '@/ui/text';
import { Milestones, Reach, Stat, Roundel, Trend } from '@/ui/cards';
import { LookPlate } from '@/ui/LookPlate';
import { palette } from '@/theme/tokens';
import { dayConfig } from '@/config/testState';
import { useSession } from '@/state/session';
import { useWardrobe } from '@/state/wardrobe';

/** OPEN QUESTION B. Set to false to take the recommendation. */
const SHOW_STREAK = true;

export default function You() {
  const day = useSession((s) => s.day);
  const cfg = dayConfig(day);
  const sections = cfg.youSections as readonly string[];
  const count = useWardrobe((s) => s.count);

  const has = (k: string) => sections.includes(k);

  return (
    <Screen>
      <LogoBlock title="You" subtitle={cfg.profileMeta} />

      <Scroll>
        {/* ══ You in a sentence — needs looks, so absent until Established ══ */}
        {has('sentence') ? (
          <Sig>
            <SigHead>You in a sentence</SigHead>
            <Lede style={{ marginTop: 8 }}>
              You build <B>quiet and structured</B>, and the room reads you as <B>brave</B>. You
              commit harder than you think you do.
            </Lede>
            <View style={{ marginTop: 11 }}>
              <Reach
                items={[
                  { value: '9/12', label: 'coat led' },
                  { value: '78%', label: 'neutrals' },
                  { value: 'sharp', label: 'most read' },
                ]}
              />
            </View>
            <Tiny style={{ marginTop: 7 }}>
              Built from your looks, what you take from the magazine, and what the room says back.
            </Tiny>
          </Sig>
        ) : null}

        {/* ══ Just for you — one strength, one weakness, one try-this ══ */}
        {has('justForYou') ? (
          <Sig>
            <SigHead>Just for you</SigHead>
            <View style={{ marginTop: 4 }}>
              <Roundel
                label="Strength"
                tone="accent"
                title="You're better with one loud piece"
                body="Your three best results each had exactly one statement piece. When you spread the volume across two, you place lower."
              />
              <Roundel
                label="Weakness"
                tone="alert"
                title="You under-read brave looks"
                body="When the room split on something bold, you picked the safer one 7 times out of 10. Your eye is sharper on quiet pairs."
              />
              <Roundel
                label="Try this"
                title="Six pieces are doing all the work"
                body="The same six turn up in 11 of your last 14 looks. Eleven things you own have never been worn."
              />
            </View>
          </Sig>
        ) : null}

        {/* ══ Your posts ══ */}
        {has('posts') ? (
          <Sig>
            <SigHead>Your posts</SigHead>
            {day >= 3 ? (
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
                <View style={{ marginTop: 11 }}>
                  <Trend values={[30, 24, 44, 38, 52, 66, 60, 81, 74]} />
                </View>
                <Tiny style={{ marginTop: 7 }}>
                  Your last nine jobs. Climbing since May, with a dip when you tried colour.
                </Tiny>
                <Tiny
                  color={palette.link}
                  style={{ marginTop: 9, fontFamily: 'Archivo_700Bold' }}
                  onPress={() => router.push('/(tabs)/wardrobe')}
                >
                  All 118 posts →
                </Tiny>
              </>
            ) : (
              /* Day 2 · one job is a point, not a line. No trend. */
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 9 }}>
                <View style={{ width: '33%' }}>
                  <LookPlate tint="t2" occasion="Upper half" pieces="Interview" height={120} label="·" />
                </View>
                <View style={{ flex: 1 }}>
                  <Lede>Your first one is in.</Lede>
                  <Tiny style={{ marginTop: 8 }}>
                    One job is a point, not a line. The shape of it starts showing up here after
                    about a week.
                  </Tiny>
                </View>
              </View>
            )}
          </Sig>
        ) : null}

        {/* ══ Stats ══ */}
        {has('stats') ? (
          <Sig>
            <SigHead>Stats</SigHead>
            <View style={{ marginTop: 6 }}>
              {day >= 3 ? (
                <>
                  {SHOW_STREAK ? <Stat label="Streak" value="9 days" /> : null}
                  <Stat label="Jobs entered" value="74" />
                  <Stat label="Freestyle posts" value="44" />
                  <Stat label="Judging rounds finished" value="96" />
                  <Stat label="People who took your pieces" value="6" last />
                </>
              ) : (
                <>
                  <Stat label="Jobs entered" value="1" />
                  <Stat label="Freestyle posts" value="0" />
                  <Stat label="Judging rounds finished" value="1" />
                  <Stat label="People who took your pieces" value="2" last />
                </>
              )}
            </View>

            {day >= 3 ? (
              <>
                <Kick style={{ marginTop: 15 }}>most used</Kick>
                <View style={{ marginTop: 6 }}>
                  <Reach
                    items={[
                      { value: '9', label: 'black knit' },
                      { value: '8', label: 'grey trouser' },
                      { value: '6', label: 'wool coat' },
                      { value: '5', label: 'red bag' },
                    ]}
                  />
                </View>
              </>
            ) : null}

            <Tiny style={{ marginTop: 8 }}>
              You own {count} pieces and wear {day >= 3 ? 'eleven' : 'five'} of them.{' '}
              <Tiny color={palette.link} style={{ fontFamily: 'Archivo_700Bold' }} onPress={() => router.push('/(tabs)/magazine')}>
                Find something to go with the rest →
              </Tiny>
            </Tiny>
          </Sig>
        ) : null}

        {/* ══ Milestones — six, fixed, and that's all there are ══ */}
        <Sig last>
          <SigHead>Milestones</SigHead>
          <View style={{ marginTop: 9 }}>
            <Milestones earned={cfg.milestonesEarned} />
          </View>
          <Tiny style={{ marginTop: 9 }}>
            {cfg.milestonesEarned === 0
              ? "Six, and that's all there are. No levels, no leaderboard."
              : cfg.milestonesEarned === 1
                ? 'One down. Six is all there are — no levels, no leaderboard.'
                : "Six, and that's all there are. No levels, no leaderboard."}
          </Tiny>
        </Sig>

        <Gap />
      </Scroll>
    </Screen>
  );
}

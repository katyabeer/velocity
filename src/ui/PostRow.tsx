/**
 * A POST, AS A ROW — the look, what the room called it, and the likes.
 *
 * Katya's day-2/3 mock, 7 Sep. Her own note on why all three travel together:
 * "the render as a thumbnail, the read as a word, and the likes as a number.
 * The word is what makes the number mean anything; on its own, '2 likes' says
 * nothing about the work."
 *
 * WHAT REPLACES THE GREY PLATE: `RenderedLook`, so a filed post shows the look
 * worn — the same component the drawers and the archive use since 7 Sep. It is
 * width-driven and cut to 3:4, which is why the thumbnail here is a width and
 * no height.
 *
 * `band` IS NOT ALWAYS A BAND. A freestyle post never enters a comparison
 * pool, so it has no placing and says so — the mock's "not scored". Never a
 * number either: locked decision 5, named bands only.
 *
 * ⚠ THE READ IS A WORD FROM THE REACTION VOCABULARY, and it has to stay that
 * way. `brave` and `sharp` were removed from this screen on 4 Sep for being
 * in neither vocabulary; anything passed as `read` must come from
 * domain/reactions.ts, not from a copywriter.
 */

import { StyleSheet, Text, View } from 'react-native';
import { RenderedLook } from './RenderedLook';
import { palette, border, radius } from '@/theme/tokens';
import { type as T } from '@/theme/type';

export type Post = {
  /** The job it answered, or 'Freestyle'. */
  title: string;
  /** `challenge` or `freestyle` — sets the kind label. */
  kind: 'challenge' | 'freestyle';
  /** How the room read it. A reaction word, or null before anyone has. */
  read: string | null;
  /** A band name, or 'not scored' for freestyle. */
  band: string;
  likes: number;
  /** Which stand-in photograph. See RenderedLook. */
  photo?: number;
};

export function PostRow({ post, last }: { post: Post; last?: boolean }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <View style={s.thumb}>
        <RenderedLook index={post.photo ?? 0} />
      </View>

      <View style={s.meta}>
        <Text style={s.title} numberOfLines={1}>
          {post.title}
        </Text>
        <Text style={s.sub} numberOfLines={1}>
          {post.kind === 'challenge' ? 'challenge' : 'freestyle'}
          {post.read ? ` · read as ${post.read}` : ''}
        </Text>
        <Text style={s.band} numberOfLines={1}>
          {post.band}
        </Text>
      </View>

      <View style={s.likes}>
        <Text style={s.likesN}>{post.likes}</Text>
        <Text style={s.likesLabel}>like{post.likes === 1 ? '' : 's'}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: border.hair,
    borderBottomColor: palette.rule,
  },
  /** A width only — `RenderedLook` supplies the 3:4. */
  thumb: { width: 46, borderRadius: radius.sm, overflow: 'hidden' },
  meta: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: 'Archivo_900Black',
    fontSize: 15,
    lineHeight: 17,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  sub: { ...T.eyebrow, marginTop: 4, letterSpacing: 1.1 },
  band: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 11,
    lineHeight: 14,
    color: palette.grey,
    marginTop: 3,
  },
  likes: { alignItems: 'flex-end' },
  likesN: {
    fontFamily: 'BigShouldersDisplay_900Black',
    fontSize: 26,
    lineHeight: 23,
    color: palette.ink,
  },
  likesLabel: { ...T.eyebrow, marginTop: 3 },
});

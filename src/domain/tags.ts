/**
 * FREE-TEXT TAGS on a freestyle look. The whole of the create brief's §5.
 *
 * ══ THIS REVERSES A LOCKED POSITION. Read before "fixing" it. ══
 *
 * D-brief invariant 8 was *no free text anywhere*, and §6 was *three closed
 * axes*. Katya reversed both on 4 Sep, which also settles Jack's open question
 * 3 in the OPPOSITE direction to his suggestion ("decoration only"). Three
 * costs were named and accepted:
 *
 *   1. THE GAP DIES ON FREESTYLE LOOKS. The gap is declared word vs the room's
 *      read, and the handover calls it the only signal that measures taste
 *      development rather than activity. A freestyle look has no declared
 *      word, so there is nothing to compare a reaction against — it shows the
 *      read alone ("read as bold"), never a gap. The gap SURVIVES ON BRIEF
 *      ENTRIES, because the builder keeps its single closed word. That is why
 *      `readSentence` in domain/reactions.ts already degrades gracefully when
 *      `declared` is null; it was written for this.
 *   2. THE OCCASION AXIS STOPS AGGREGATING. `wedding`, `weddingvibes` and
 *      `bigday` are three tags. The D brief called occasion the commercially
 *      valuable axis precisely because it aggregates; free text keeps the
 *      words and loses that.
 *   3. A MODERATION OBLIGATION, mitigated below. Smaller than it looks: tags
 *      are self-authored on your OWN look, so this is a publishing surface,
 *      not a harassment surface — nobody can attach text to someone else's
 *      work.
 *
 * ══ TWO THINGS TAGS MUST NOT DO ══
 *
 * NOT CLICKABLE, NOT FILTERABLE (MVP). The magazine's filter rail is already
 * visually live without touching the content pool; leave it that way. Tags
 * must never reach the feed sampler — invariant 7 is sample-don't-sort, and a
 * tag filter is a sort. `tests/tags.test.ts` asserts the import boundary.
 *
 * AUTOCOMPLETE, IF EVER BUILT, SUGGESTS FROM THE USER'S OWN HISTORY ONLY.
 * Never a global popular-tag list: that converges everyone's vocabulary and is
 * popularity-weighting through the back door, which invariant 7 exists to
 * prevent. `OWN_HISTORY_ONLY` below is the flag to check against.
 *
 * ⚠ OPEN, Katya q3: nobody owns the blocklist or the report queue. `BLOCKED`
 * here is a placeholder of the shape the real list has, not the real list.
 */

/** 5, per §5. The 6th is refused with a quiet "5 of 5" — see `countLabel`. */
export const MAX_TAGS = 5;
export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 20;

/** Space or comma commits a chip. Chips, not one text line, so the cap is
 *  visible and deletion is per-tag. */
export const TAG_DELIMITERS = /[\s,]+/;

/** Stripped silently: `# @ : / \ . ,` and all whitespace. `#` is optional on
 *  input, SHOWN on the chip, and stripped for storage — so the chip's hash is
 *  presentation (see `chipLabel`) and never part of the value. */
const STRIP = /[#@:/\\.,\s]/g;

/**
 * Anything containing these is refused outright rather than cleaned, because
 * what is left after cleaning a URL is not the tag the user meant. Checked on
 * the RAW input: `@` and `.` are in STRIP, so a check after normalising would
 * never fire.
 */
const LINKISH = ['http', 'www', '@', '.com'] as const;

/**
 * Unicode letters and digits, per §5. `\p{L}` needs the `u` flag and ES2018
 * property escapes — fine in Node (the tests) and in Hermes on RN 0.79. If
 * this ever has to run somewhere older, the fallback is a letter/digit table,
 * not `[a-z0-9]`, which would refuse every non-Latin script.
 */
const ALLOWED = /^[\p{L}\p{N}]+$/u;

/**
 * ⚠ PLACEHOLDER. Shape-correct, not content-correct: the real list is an
 * operational asset with an owner, and per Katya q3 it has neither yet. Kept
 * deliberately short so nobody mistakes it for the real thing.
 */
export const BLOCKED: readonly string[] = ['slur', 'onlyfans', 'freemoney'];

export const OWN_HISTORY_ONLY = true as const;

export type TagRejection =
  | { reason: 'empty' }
  | { reason: 'full'; limit: number }
  | { reason: 'link'; tag: string }
  | { reason: 'characters'; tag: string }
  | { reason: 'short'; tag: string; min: number }
  | { reason: 'long'; tag: string; max: number }
  | { reason: 'blocked'; tag: string }
  | { reason: 'duplicate'; tag: string };

/** Storage form: stripped, lowercased. Never carries a `#`. */
export const normalise = (raw: string): string => raw.replace(STRIP, '').toLowerCase();

/** Presentation form. The hash lives here and nowhere else. */
export const chipLabel = (tag: string): string => `#${tag}`;

/** "3 of 5". Shown always, not only at the cap — the cap has to be visible
 *  BEFORE it bites, or the 6th tag being refused is a surprise. */
export const countLabel = (n: number): string => `${n} of ${MAX_TAGS}`;

/**
 * Every rejection message names the offending tag. §5: "reject with the
 * offending tag named, don't silently drop it" — a tag that vanishes reads as
 * a bug, and the user retypes it.
 */
export function rejectionMessage(r: TagRejection): string {
  switch (r.reason) {
    case 'empty':
      return 'Nothing to add.';
    case 'full':
      return `That is ${r.limit} already — remove one to add another.`;
    case 'link':
      return `No links in tags — “${r.tag}” can’t go on.`;
    case 'characters':
      return `Letters and numbers only — “${r.tag}” has something else in it.`;
    case 'short':
      return `“${r.tag}” is too short. ${r.min} characters minimum.`;
    case 'long':
      return `“${r.tag}” is too long. ${r.max} characters maximum.`;
    case 'blocked':
      return `“${r.tag}” can’t go on a look.`;
    case 'duplicate':
      return `“${r.tag}” is already on.`;
  }
}

/**
 * The whole gate, in order. Cap first: if the look is full, nothing about the
 * text matters. Link check on the raw input, everything else on the normalised
 * value.
 */
export function rejectionFor(raw: string, existing: readonly string[]): TagRejection | null {
  if (existing.length >= MAX_TAGS) return { reason: 'full', limit: MAX_TAGS };

  const lower = raw.toLowerCase();
  if (LINKISH.some((l) => lower.includes(l))) return { reason: 'link', tag: raw.trim() };

  const tag = normalise(raw);
  if (!tag) return { reason: 'empty' };
  if (!ALLOWED.test(tag)) return { reason: 'characters', tag };
  if (tag.length < TAG_MIN_LENGTH) return { reason: 'short', tag, min: TAG_MIN_LENGTH };
  if (tag.length > TAG_MAX_LENGTH) return { reason: 'long', tag, max: TAG_MAX_LENGTH };
  if (BLOCKED.includes(tag)) return { reason: 'blocked', tag };
  if (existing.includes(tag)) return { reason: 'duplicate', tag };

  return null;
}

export type CommitResult = {
  tags: readonly string[];
  rejection: TagRejection | null;
};

/** Add one. Returns the list unchanged plus a rejection, never a throw — the
 *  caller is a keystroke handler. */
export function commitTag(existing: readonly string[], raw: string): CommitResult {
  const rejection = rejectionFor(raw, existing);
  if (rejection) return { tags: existing, rejection };
  return { tags: [...existing, normalise(raw)], rejection: null };
}

/**
 * A paste, or a fast typist who got two words in before the handler ran.
 * Splits on the delimiters and commits each in turn, so `wedding, cold field`
 * lands as two tags. Reports the FIRST rejection only: five error messages
 * from one paste is noise, and the first is the one that explains the rest.
 */
export function commitAll(existing: readonly string[], raw: string): CommitResult {
  return raw
    .split(TAG_DELIMITERS)
    .filter(Boolean)
    .reduce<CommitResult>(
      (acc, part) => {
        const next = commitTag(acc.tags, part);
        return { tags: next.tags, rejection: acc.rejection ?? next.rejection };
      },
      { tags: existing, rejection: null },
    );
}

export const removeTag = (existing: readonly string[], tag: string): readonly string[] =>
  existing.filter((t) => t !== tag);

/**
 * NO BACK-OUT AFTER PUBLISH. Tags are set at step 3 and frozen. Editable tags
 * after reactions land is another route to optimising against the room, which
 * is the thing the blind-commit structure exists to prevent — same reasoning
 * as the re-render window in domain/renders.ts.
 */
export const TAGS_EDITABLE_AFTER_PUBLISH = false as const;

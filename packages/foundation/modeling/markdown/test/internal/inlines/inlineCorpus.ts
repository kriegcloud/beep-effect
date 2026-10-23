// A deterministic corpus of GFM inline sources, for the differential that
// pins the inline pass across its complexity refactors. The generator is a
// seeded mulberry32 stream over a token vocabulary chosen to reach every
// branch of the autolink-literal scanners (www., scheme, mailto:/xmpp:
// prefixes, re-anchoring `@`, trailing punctuation and entity trimming),
// strikethrough, emphasis flanking beside astral punctuation and letters,
// and link brackets. It depends on nothing but this file, so the same
// sources come out of any engine version — which is what lets a digest of
// the outputs recorded before a refactor gate the code after it.

import * as A from "effect/Array";

/**
 * The tokens a generated source is spelled from.
 *
 * **Details**
 *
 * `𐄀` (U+10100) is astral punctuation (Po), `🎉` an astral symbol (So) and
 * `𝐀` (U+1D400) an astral letter: one-character strings of these are half a
 * surrogate pair, which is what the flanking rules must not see.
 *
 * @category testing
 * @since 0.0.0
 */
const INLINE_TOKENS: ReadonlyArray<string> = [
  "a",
  "b",
  "x",
  "1",
  "9",
  ".",
  "-",
  "_",
  "+",
  "@",
  ":",
  "/",
  "(",
  ")",
  ";",
  "&",
  "!",
  "?",
  "*",
  "**",
  "~",
  "~~",
  "[",
  "]",
  "<",
  ">",
  " ",
  "\n",
  "www.",
  "http://",
  "https://",
  "ftp://",
  "mailto:",
  "xmpp:",
  "example",
  "com",
  "org",
  "a@",
  "@b.",
  "c.d",
  ".org",
  "ada@ex.org",
  "x_y",
  "/res",
  "&amp;",
  "&hl;",
  "\\",
  "`",
  "é",
  "😀",
  "𐄀",
  "🎉",
  "𝐀",
];

/**
 * `count` sources of 1 to 24 tokens, drawn from a mulberry32 stream seeded
 * with `seed`.
 *
 * @category testing
 * @since 0.0.0
 */
export const inlineCorpus = ({ seed, count }: { readonly seed: number; readonly count: number }) => {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (): string => A.getUnsafe(INLINE_TOKENS, Math.floor(next() * INLINE_TOKENS.length));
  return A.makeBy(count, () => A.join(A.makeBy(1 + Math.floor(next() * 24), pick), ""));
};

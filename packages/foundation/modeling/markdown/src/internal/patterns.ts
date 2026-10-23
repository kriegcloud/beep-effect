import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

// Anchored and forward matching without slicing the subject.
//
// Upstream matches with `re.exec(this.subject.slice(this.pos))`. That is
// correct and, on a 12 MB pathological input, quadratic on its own: every
// attempt materializes the remainder of the subject before the regex engine
// looks at a single character. Sticky and global clones with `lastIndex` do
// the same matching against the original string and copy nothing.
//
// Each operation owns a fresh clone, so its mutable `lastIndex` cannot
// interfere with another operation using the same source pattern.
//
// It also owns `unitAt`, the one character read the inline scanners use in
// their inner loops: an index read rather than an `Option`-returning
// `effect/String` call, so a per-character read allocates nothing.
//
// Leaf module: imports no other module of this package.

const reCursorFlags = /[gy]/g;

const clone: {
  (pattern: RegExp, flag: "y" | "g", dropCaret: boolean): RegExp;
  (flag: "y" | "g", dropCaret: boolean): (pattern: RegExp) => RegExp;
} = dual(3, (pattern: RegExp, flag: "y" | "g", dropCaret: boolean): RegExp => {
  // A leading `^` and the `y` flag say the same thing, but together they say
  // "start of the SUBJECT", which is not what an anchored match at a cursor
  // means. The caret goes; stickiness carries the anchoring.
  const source = dropCaret && Str.startsWith("^")(pattern.source) ? Str.slice(1)(pattern.source) : pattern.source;
  return new RegExp(source, `${Str.replace(reCursorFlags, "")(pattern.flags)}${flag}`);
});

/**
 * The sticky twin of `pattern`, anchored at `lastIndex`.
 *
 * **Details**
 *
 * A fresh clone replaces global or sticky flags with the sticky flag and drops
 * a leading caret so anchoring applies at the cursor rather than the start of
 * the subject. Its mutable `lastIndex` is independent of the source pattern.
 *
 * **Example** (Match at a cursor after dropping the leading caret)
 *
 * ```ts
 * import { stickyOf } from "@beep/markdown/internal/patterns"
 *
 * const pattern = stickyOf(/^word/)
 * pattern.lastIndex = 2
 * console.log(pattern.exec("a word")?.[0]) // word
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const stickyOf = (pattern: RegExp): RegExp => clone(pattern, "y", true);

/**
 * The global twin of `pattern`, searching forward from `lastIndex`.
 *
 * **Details**
 *
 * A fresh clone replaces global or sticky flags with the global flag, keeping
 * the source pattern's leading caret and other flags. Its mutable `lastIndex`
 * is independent of the source pattern.
 *
 * **Example** (Search beyond the current cursor)
 *
 * ```ts
 * import { globalOf } from "@beep/markdown/internal/patterns"
 *
 * const pattern = globalOf(/word/)
 * pattern.lastIndex = 1
 * console.log(pattern.exec("a word")?.index) // 2
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const globalOf = (pattern: RegExp): RegExp => clone(pattern, "g", false);

/**
 * The UTF-16 code unit at `index` as a one-character string, or `""` when
 * `index` is outside `subject`.
 *
 * **Details**
 *
 * The scanners' per-character read. It is `String.prototype.charAt` without
 * the method call: an index read with the end-of-input guard, which never
 * allocates an `Option`. A lone surrogate comes back as itself, exactly the
 * unit `charAt` returns, so code-point decisions stay with the callers.
 *
 * **Gotchas**
 *
 * The `""` guard is load-bearing: a regex tested against the unguarded read
 * would test the string `"undefined"`.
 *
 * Both call forms are kept, but the form is chosen by the first argument's
 * type rather than by `dual`: JavaScriptCore does not inline the
 * `arguments.length` dispatch a `dual` wrapper adds, and on the block
 * scanner's indentation walk that wrapper alone tripled the "deeply nested
 * lists" pathological parse.
 *
 * **Example** (Read inside and past the subject)
 *
 * ```ts
 * import { unitAt } from "@beep/markdown/internal/patterns"
 *
 * console.log(unitAt("ab", 1)) // b
 * console.log(unitAt("ab", 2) === "") // true
 * console.log(unitAt(0)("ab")) // a
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function unitAt(subject: string, index: number): string;
export function unitAt(index: number): (subject: string) => string;
export function unitAt(subjectOrIndex: string | number, index?: number): string | ((subject: string) => string) {
  return P.isString(subjectOrIndex)
    ? (subjectOrIndex[Number(index)] ?? "")
    : (subject: string): string => subject[subjectOrIndex] ?? "";
}

/**
 * Match `pattern` anchored at `cursor.pos` in `cursor.subject`, advancing
 * the cursor past the match; `undefined`, with the cursor untouched, when it
 * does not match there.
 *
 * **Details**
 *
 * The cursor primitive both scanners advance with: a sticky clone run at the
 * cursor, so nothing slices the subject per attempt. A pattern that is
 * already sticky (built once with {@link stickyOf}) is used as is, so hot
 * callers that hoist their sticky twin to a module constant pay no
 * per-attempt `RegExp` construction.
 *
 * **Example** (Advance past a match at the cursor)
 *
 * ```ts
 * import { matchFrom } from "@beep/markdown/internal/patterns"
 *
 * const cursor = { subject: "a word", pos: 2 }
 * console.log(matchFrom(cursor, /^word/), cursor.pos) // word 6
 * console.log(matchFrom(cursor, /^word/), cursor.pos) // undefined 6
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const matchFrom: {
  (cursor: { pos: number; readonly subject: string }, pattern: RegExp): string | undefined;
  (pattern: RegExp): (cursor: { pos: number; readonly subject: string }) => string | undefined;
} = dual(2, (cursor: { pos: number; readonly subject: string }, pattern: RegExp): string | undefined => {
  const sticky = pattern.sticky ? pattern : stickyOf(pattern);
  sticky.lastIndex = cursor.pos;
  const found = sticky.exec(cursor.subject);
  if (found === null) {
    return undefined;
  }
  cursor.pos = sticky.lastIndex;
  return found[0];
});

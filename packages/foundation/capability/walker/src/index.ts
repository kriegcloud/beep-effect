/**
 * Path traversal as Effect primitives.
 *
 * **Details**
 *
 * Upward: ascend a directory chain toward the filesystem root and return the
 * first candidate satisfying a predicate. Each probe absorbs its own failure,
 * so one unreadable ancestor never hides a valid match above it.
 *
 * Downward: descend from a compiled `@beep/glob` pattern's literal prefix and
 * return the matching file paths. Unlike the upward walk, an unreadable
 * subtree fails typed by default — a swallowed subtree is silently missing
 * membership, not a candidate that did not match.
 *
 * **Example** (Construct an upward search)
 *
 * ```ts
 * import { Walker } from "@beep/walker/Walker";
 * import * as Effect from "effect/Effect";
 *
 * const program = Walker.findRoot(["/repo/app", "/repo"], (dir) => Effect.succeed(dir === "/repo"));
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  DescendError,
  DescendOptions,
  DescendRecordOptions,
  DescendResult,
  descend,
  UnreadableDirectory,
} from "./Descend.ts";
export { CompileAndExpandOptions, compileAndExpand, GlobExpansionError } from "./Expand.ts";
export { AscendOptions, Walker } from "./Walker.ts";

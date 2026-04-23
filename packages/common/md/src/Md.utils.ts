/**
 * `@beep/md/Md.utils` - A shared utility module for @beep/md
 *
 * @module @beep/md/Md.utils
 * @since 0.0.0
 */

import { Markdown } from "@beep/schema";
import { A, P, Str } from "@beep/utils";
import { Match, pipe } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const trimBlock = Str.replace(/^\n+|\n+$/g, "");

/**
 * joinBlocks - Join blocks of text into a single markdown document (string).
 *
 * @example
 * ```ts
 * import { joinBlocks } from "@beep/md/Md.utils"
 *
 * const markdown = joinBlocks(["# Title", "Body text"])
 * console.log(markdown) // "# TitleBody text"
 * ```
 *
 * @param blocks {string | ReadonlyArray<string>} - The blocks of text to join.
 * @returns {Markdown} - Markdown document branded string
 * @category utilities
 * @since 0.0.0
 */
export const joinBlocks = (blocks: string | ReadonlyArray<string>): Markdown =>
  pipe(
    Match.value(blocks),
    Match.when(P.isString, (blockStr) => [blockStr]),
    Match.when(S.is(S.Array(S.String)), (blockList) => blockList),
    Match.exhaustive,
    A.map(trimBlock),
    A.filter(P.isTruthy),
    A.join(""),
    Markdown.make
  );

/**
 * Prefixes every line of text with the provided marker.
 *
 * @example
 * ```ts
 * import { prefixLines } from "@beep/md/Md.utils"
 *
 * const quoted = prefixLines("alpha\nbeta", "> ")
 * console.log(quoted) // "> alpha\n> beta"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const prefixLines: {
  (text: string, prefix: string): string;
  (prefix: string): (text: string) => string;
} = dual(2, (text: string, prefix: string): string =>
  pipe(text, Str.split("\n"), A.map(Str.prefix(prefix)), A.join("\n"))
);

/**
 * Escapes markdown control characters in plain text.
 *
 * @example
 * ```ts
 * import { escape } from "@beep/md/Md.utils"
 *
 * const escaped = escape("# title")
 * console.log(escaped) // "\\# title"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escape = Str.replace(/([\\`*_{}[\]()#+\-.!|<>])/g, "\\$1");

/**
 * Returns the length of the longest contiguous backtick run in text.
 *
 * @example
 * ```ts
 * import { maxBackticks } from "@beep/md/Md.utils"
 *
 * const count = maxBackticks("`one` and ```three```")
 * console.log(count) // 3
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const maxBackticks = (text: string): number => {
  let max = 0;
  let current = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "`") {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
};

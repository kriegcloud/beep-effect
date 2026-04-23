/**
 * Shared Markdown and HTML rendering utilities.
 *
 * @module @beep/md/Md.utils
 * @since 0.0.0
 */

import { Markdown } from "@beep/schema";
import { A, P, Str } from "@beep/utils";
import { dual, pipe } from "effect/Function";
import * as S from "effect/Schema";

const trimBlock = Str.replace(/^\n+|\n+$/g, "");

/**
 * Joins rendered Markdown blocks with one blank line between blocks.
 *
 * @example
 * ```ts
 * import { joinBlocks } from "@beep/md/Md.utils"
 *
 * const markdown = joinBlocks(["# Title", "Body text"])
 * console.log(markdown) // "# Title\n\nBody text"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const joinBlocks = (blocks: string | ReadonlyArray<string>): Markdown => {
  const blockList = P.isString(blocks) ? [blocks] : blocks;

  return pipe(blockList, A.map(trimBlock), A.filter(P.isTruthy), A.join("\n\n"), Markdown.make);
};

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
 * @category utilities
 * @since 0.0.0
 */
export const prefixLines: {
  (text: string, prefix: string): string;
  (prefix: string): (text: string) => string;
} = dual(2, (text: string, prefix: string): string =>
  pipe(text, Str.split("\n"), A.map(Str.prefix(prefix)), A.join("\n"))
);

/**
 * Escapes Markdown control characters in plain text.
 *
 * @example
 * ```ts
 * import { escapeMarkdownText } from "@beep/md/Md.utils"
 *
 * const escaped = escapeMarkdownText("# title")
 * console.log(escaped) // "\\# title"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escapeMarkdownText = Str.replace(/([\\`*_{}[\]()#+\-.|<>])/g, "\\$1");

/**
 * Escapes Markdown link or image destination delimiters.
 *
 * @example
 * ```ts
 * import { escapeMarkdownDestination } from "@beep/md/Md.utils"
 *
 * const escaped = escapeMarkdownDestination("https://example.com/a)b")
 * console.log(escaped) // "https://example.com/a\\)b"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escapeMarkdownDestination = Str.replace(/[\\()]/g, "\\$&");

/**
 * Returns the length of the longest contiguous backtick run in text.
 *
 * @example
 * ```ts
 * import { maxBackticks } from "@beep/md/Md.utils"
 *
 * const triple = "`".repeat(3)
 * const count = maxBackticks(`\`one\` and ${triple}three${triple}`)
 * console.log(count) // 3
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const maxBackticks = (text: string): number => {
  let max = 0;
  let current = 0;

  for (let index = 0; index < text.length; index++) {
    if (text[index] === "`") {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
};

/**
 * Builds a Markdown inline code span with an adaptive backtick fence.
 *
 * @example
 * ```ts
 * import { renderInlineCode } from "@beep/md/Md.utils"
 *
 * const code = renderInlineCode("`single`")
 * console.log(code) // "`` `single` ``"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderInlineCode = (text: string): string => {
  const backticks = pipe("`", Str.repeat(maxBackticks(text) + 1));
  const frontPadding = Str.startsWith("`")(text) ? " " : "";
  const backPadding = Str.endsWith("`")(text) ? " " : "";

  return `${backticks}${frontPadding}${text}${backPadding}${backticks}`;
};

/**
 * Builds a Markdown fenced code block with an adaptive backtick fence.
 *
 * @example
 * ```ts
 * import { renderFencedCode } from "@beep/md/Md.utils"
 *
 * const block = renderFencedCode("console.log('beep')", "ts")
 * const fence = "`".repeat(3)
 * console.log(block.includes(`${fence}ts`)) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderFencedCode = (text: string, language: string): string => {
  const fence = pipe("`", Str.repeat(Math.max(maxBackticks(text), 2) + 1));

  return `${fence}${language}\n${text}\n${fence}`;
};

/**
 * Type guard for rendered string arrays accepted by {@link joinBlocks}.
 *
 * @example
 * ```ts
 * import { isStringArray } from "@beep/md/Md.utils"
 *
 * console.log(isStringArray(["a", "b"])) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isStringArray = S.is(S.Array(S.String));

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
 * @category Utility
 * @since 0.0.0
 * @param blocks {string | ReadonlyArray<string>} - The blocks of text to join.
 * @returns {Markdown} - Markdown document branded string
 */
export const joinBlocks = (blocks: string | ReadonlyArray<string>): Markdown =>
  pipe(
    Match.value(blocks).pipe(
      Match.when(P.isString, (blockStr) => [blockStr] as const),
      Match.when(S.is(S.Array(S.String)), (blocks) => blocks),
      Match.exhaustive
    ),
    A.map(trimBlock),
    A.filter(P.isTruthy),
    A.join(""),
    Markdown.make
  );

export const prefixLines: {
  (text: string, prefix: string): string;
  (prefix: string): (text: string) => string;
} = dual(2, (text: string, prefix: string): string =>
  pipe(text, Str.split("\n"), A.map(Str.prefix(prefix)), A.join("\n"))
);

export const escape = Str.replace(/([\\`*_{}[\]()#+\-.!|<>])/g, "\\$1");

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

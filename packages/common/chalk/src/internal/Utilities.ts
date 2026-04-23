/**
 * Internal string helpers used by the Chalk renderer.
 *
 * @module
 * @since 0.0.0
 */

import { pipe } from "effect";
import * as Bool from "effect/Boolean";
import { dual } from "effect/Function";
import * as Str from "effect/String";

const replaceAllLoop = (text: string, substring: string, replacer: string): string => {
  let index = text.indexOf(substring);
  const substringLength = substring.length;
  let endIndex = 0;
  let result = "";

  do {
    result += text.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = text.indexOf(substring, endIndex);
  } while (index !== -1);

  result += text.slice(endIndex);

  return result;
};

const renderLineBreak = (gotCR: boolean): string =>
  Bool.match(gotCR, {
    onFalse: () => "\n",
    onTrue: () => "\r\n",
  });

const renderLineBreakSliceEnd = (nextIndex: number, gotCR: boolean): number =>
  Bool.match(gotCR, {
    onFalse: () => nextIndex,
    onTrue: () => nextIndex - 1,
  });

/**
 * Replace every later occurrence of a substring while preserving the first occurrence.
 *
 * @example
 * ```ts
 * import { stringReplaceAll } from "@beep/chalk/Chalk"
 *
 * const rendered = stringReplaceAll("a-b-c", "-", "+")
 * console.log(rendered)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
type StringReplaceAllOptions = {
  readonly replacer: string;
};

export const stringReplaceAll: {
  (text: string, substring: string, options: StringReplaceAllOptions): string;
  (substring: string, options: StringReplaceAllOptions): (text: string) => string;
} = dual(3, (text: string, substring: string, options: StringReplaceAllOptions): string => {
  return pipe(
    text,
    Str.includes(substring),
    Bool.match({
      onFalse: () => text,
      onTrue: () => replaceAllLoop(text, substring, options.replacer),
    })
  );
});

/**
 * Encase each line break with close and reopen ANSI sequences.
 *
 * @example
 * ```ts
 * import { stringEncaseCRLFWithFirstIndex } from "@beep/chalk/Chalk"
 *
 * const rendered = stringEncaseCRLFWithFirstIndex("a\nb", "<close>", "<open>", 1)
 * console.log(rendered)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
type StringEncaseCrlfOptions = {
  readonly postfix: string;
  readonly index: number;
};

export const stringEncaseCRLFWithFirstIndex: {
  (text: string, prefix: string, options: StringEncaseCrlfOptions): string;
  (prefix: string, options: StringEncaseCrlfOptions): (text: string) => string;
} = dual(3, (text: string, prefix: string, options: StringEncaseCrlfOptions): string => {
  let endIndex = 0;
  let result = "";
  let nextIndex = options.index;

  do {
    const gotCR = text[nextIndex - 1] === "\r";

    result +=
      text.slice(endIndex, renderLineBreakSliceEnd(nextIndex, gotCR)) +
      prefix +
      renderLineBreak(gotCR) +
      options.postfix;
    endIndex = nextIndex + 1;
    nextIndex = text.indexOf("\n", endIndex);
  } while (nextIndex !== -1);

  result += text.slice(endIndex);

  return result;
});

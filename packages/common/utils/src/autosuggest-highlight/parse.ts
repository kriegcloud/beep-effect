/**
 * @since 0.1.0
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { MatchRange, ParsedSegment } from "./types";

/**
 * Creates a non-highlighted segment
 */
const createNonHighlightedSegment = (text: string): ParsedSegment => ({
  text,
  highlight: false,
});

/**
 * Creates a highlighted segment
 */
const createHighlightedSegment = (text: string): ParsedSegment => ({
  text,
  highlight: true,
});

/**
 * Extracts text from a range using Effect String slice
 */
const extractText = (text: string, startIndex: number, endIndex: number): string =>
  pipe(text, Str.slice(startIndex, endIndex));

/**
 * Parses text into segments with highlight information based on match ranges.
 *
 * @param text - The text to parse
 * @param matches - Array of [startIndex, endIndex] tuples representing matches
 * @returns An array of segments with text and highlight boolean
 *
 * @example
 * ```ts
 * import { parse } from "@beep/utils/autosuggest-highlight";
 *
 * parse("Hello world", [[0, 4]]);
 * // [{ text: "Hell", highlight: true }, { text: "o world", highlight: false }]
 *
 * parse("Hello world", [[2, 4], [6, 8]]);
 * // [
 * //   { text: "He", highlight: false },
 * //   { text: "ll", highlight: true },
 * //   { text: "o ", highlight: false },
 * //   { text: "wo", highlight: true },
 * //   { text: "rld", highlight: false }
 * // ]
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const parse = (text: string, matches: readonly MatchRange[]): readonly ParsedSegment[] => {
  // Handle empty matches case
  if (A.isEmptyReadonlyArray(matches)) {
    return [createNonHighlightedSegment(text)];
  }

  const segments: ParsedSegment[] = [];

  // Add leading non-highlighted text if first match doesn't start at 0
  const firstMatchOpt = A.get(0)(matches);
  if (O.isSome(firstMatchOpt) && firstMatchOpt.value[0] > 0) {
    const firstMatch = firstMatchOpt.value;
    const leadingText = extractText(text, 0, firstMatch[0]);
    segments.push(createNonHighlightedSegment(leadingText));
  }

  // Process each match
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    if (currentMatch === undefined) continue;

    const [startIndex, endIndex] = currentMatch;
    const isLast = i === matches.length - 1;
    const nextMatch = matches[i + 1];

    // Add highlighted segment for the match
    const highlightedText = extractText(text, startIndex, endIndex);
    segments.push(createHighlightedSegment(highlightedText));

    // Handle text after the match
    if (isLast) {
      // Last match - add remaining text if any
      if (endIndex < Str.length(text)) {
        const remainingText = extractText(text, endIndex, Str.length(text));
        segments.push(createNonHighlightedSegment(remainingText));
      }
    } else if (nextMatch !== undefined && endIndex < nextMatch[0]) {
      // Not last match - add text between this match and next
      const betweenText = extractText(text, endIndex, nextMatch[0]);
      segments.push(createNonHighlightedSegment(betweenText));
    }
  }

  return segments;
};

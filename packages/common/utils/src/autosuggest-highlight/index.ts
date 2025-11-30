/**
 * Autosuggest highlight utilities for matching and parsing text.
 *
 * A functional TypeScript replacement for the `autosuggest-highlight` library,
 * using Effect patterns for array operations and functional composition.
 *
 * @example
 * ```ts
 * import { match, parse } from "@beep/utils/autosuggest-highlight";
 *
 * const text = "Hello world";
 * const query = "wo";
 *
 * const matches = match(text, query);
 * // [[6, 8]]
 *
 * const segments = parse(text, matches);
 * // [
 * //   { text: "Hello ", highlight: false },
 * //   { text: "wo", highlight: true },
 * //   { text: "rld", highlight: false }
 * // ]
 * ```
 *
 * @module
 */

export { match } from "./match";
export { parse } from "./parse";
export type { MatchOptions, MatchRange, ParsedSegment } from "./types";

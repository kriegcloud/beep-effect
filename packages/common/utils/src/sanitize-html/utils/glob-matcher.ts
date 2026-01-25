/**
 * Glob pattern matching for sanitize-html
 *
 * Converts glob patterns (with * wildcards) to RegExp for matching
 * attribute names, class names, etc.
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as P from "effect/Predicate";
import * as Str from "effect/String";
import { escapeRegex } from "./escape-regex.js";

/**
 * The wildcard character used in glob patterns.
 *
 * @since 0.1.0
 * @category constants
 */
const WILDCARD = "*" as const;

/**
 * The regex pattern that replaces wildcards - matches any sequence of characters.
 *
 * @since 0.1.0
 * @category constants
 */
const WILDCARD_REGEX = ".*" as const;

/**
 * Converts a glob pattern string to a RegExp.
 * Supports `*` as a wildcard matching any sequence of characters.
 *
 * @example
 * ```typescript
 * import { globToRegex } from "@beep/utils/sanitize-html/utils/glob-matcher"
 *
 * const pattern = globToRegex("data-*")
 * pattern.test("data-foo") // true
 * pattern.test("data-bar-baz") // true
 * pattern.test("aria-label") // false
 *
 * const middle = globToRegex("data-*-foo")
 * middle.test("data-bar-foo") // true
 * middle.test("data-foo") // false
 * ```
 *
 * @since 0.1.0
 * @category utils
 */
export const globToRegex = (pattern: string): RegExp => {
  const regexStr = F.pipe(pattern, Str.split(WILDCARD), A.map(escapeRegex), A.join(WILDCARD_REGEX));
  return new RegExp(`^${regexStr}$`);
};

/**
 * Creates a predicate that tests if a string matches a RegExp.
 * Curried to allow partial application in pipelines.
 *
 * @since 0.1.0
 * @category internals
 */
const matchesRegex =
  (regex: RegExp): P.Predicate<string> =>
  (value) =>
    regex.test(value);

/**
 * Creates a predicate that tests if a value matches any of the given RegExps.
 * Uses Effect's `P.or` composition under the hood via `A.some`.
 *
 * @since 0.1.0
 * @category internals
 */
const matchesAnyRegex =
  (regexes: readonly RegExp[]): P.Predicate<string> =>
  (value) =>
    A.some(regexes, (regex) => matchesRegex(regex)(value));

/**
 * Tests if a string matches a glob pattern.
 *
 * @example
 * ```typescript
 * import { matchGlob } from "@beep/utils/sanitize-html/utils/glob-matcher"
 *
 * matchGlob("data-foo", "data-*") // true
 * matchGlob("aria-label", "data-*") // false
 * ```
 *
 * @since 0.1.0
 * @category utils
 */
export const matchGlob = (value: string, pattern: string): boolean => F.pipe(pattern, globToRegex, matchesRegex)(value);

/**
 * Creates a matcher function from multiple glob patterns.
 * Returns true if the value matches any of the patterns.
 *
 * @example
 * ```typescript
 * import { createGlobMatcher } from "@beep/utils/sanitize-html/utils/glob-matcher"
 *
 * const matcher = createGlobMatcher(["data-*", "aria-*"])
 * matcher("data-foo") // true
 * matcher("aria-label") // true
 * matcher("class") // false
 * ```
 *
 * @since 0.1.0
 * @category utils
 */
export const createGlobMatcher = (patterns: readonly string[]): P.Predicate<string> =>
  F.pipe(patterns, A.map(globToRegex), matchesAnyRegex);

/**
 * Type guard that checks if a pattern contains a glob wildcard.
 * Returns true if the pattern contains the `*` character.
 *
 * @example
 * ```typescript
 * import { isGlobPattern } from "@beep/utils/sanitize-html/utils/glob-matcher"
 *
 * isGlobPattern("data-*") // true
 * isGlobPattern("class") // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isGlobPattern: P.Predicate<string> = Str.includes(WILDCARD);

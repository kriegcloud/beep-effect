/**
 * Class name filtering for sanitize-html
 *
 * @since 0.1.0
 * @module
 */

import { thunkFalse, thunkTrue } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { createGlobMatcher, isGlobPattern } from "../utils/glob-matcher";

/**
 * Allowed classes configuration.
 * Maps tag names (or "*" for all tags) to allowed class patterns.
 */
export type AllowedClasses = Record<string, false | readonly (string | RegExp)[]>;

/**
 * Type guard for RegExp patterns.
 */
const isRegExpPattern: P.Refinement<string | RegExp, RegExp> = (pattern): pattern is RegExp =>
  P.isObject(pattern) && pattern instanceof RegExp;

/**
 * Check if a single class name matches a string pattern (exact or glob).
 */
const matchesStringPattern = (normalizedClass: string, pattern: string): boolean =>
  F.pipe(
    Match.value(pattern),
    Match.when((p) => p === normalizedClass, thunkTrue),
    Match.when(isGlobPattern, (p) => createGlobMatcher([p])(normalizedClass)),
    Match.orElse(thunkFalse)
  );

/**
 * Check if a single class name matches a RegExp pattern.
 */
const matchesRegExpPattern = (normalizedClass: string, pattern: RegExp): boolean => pattern.test(normalizedClass);

/**
 * Check if a class name matches a single pattern (string or RegExp).
 */
const matchesPattern =
  (normalizedClass: string) =>
  (pattern: string | RegExp): boolean =>
    F.pipe(
      Match.value(pattern),
      Match.when(isRegExpPattern, (p) => matchesRegExpPattern(normalizedClass, p)),
      Match.orElse((p) => matchesStringPattern(normalizedClass, p))
    );

/**
 * Check if a single class name is allowed against a list of patterns.
 */
const isClassAllowedByPatterns = (className: string, patterns: readonly (string | RegExp)[]): boolean =>
  F.pipe(Str.trim(className), (normalizedClass) => A.some(patterns, matchesPattern(normalizedClass)));

/**
 * Check if a single class name is allowed.
 */
const isClassAllowed = (
  className: string,
  allowedPatterns: false | readonly (string | RegExp)[] | undefined
): boolean =>
  F.pipe(
    Match.value(allowedPatterns),
    Match.when(false, thunkTrue), // false means allow all classes
    Match.when(P.isUndefined, thunkFalse), // undefined means no classes allowed
    Match.orElse((patterns) => isClassAllowedByPatterns(className, patterns))
  );

/**
 * Merge global and tag-specific class patterns.
 */
const mergeClassPatterns = (tagName: string, allowedClasses: AllowedClasses): false | readonly (string | RegExp)[] => {
  const normalizedTag = Str.toLowerCase(tagName);

  const globalPatterns = O.fromNullable(allowedClasses["*"]);
  const tagPatterns = O.fromNullable(allowedClasses[normalizedTag]);

  // If either is false, allow all classes
  const hasFalsePattern = F.pipe(
    [O.getOrUndefined(globalPatterns), O.getOrUndefined(tagPatterns)],
    A.some((p) => p === false)
  );

  if (hasFalsePattern) {
    return false;
  }

  // If neither is defined, return empty (no classes allowed)
  const neitherDefined = O.isNone(globalPatterns) && O.isNone(tagPatterns);

  if (neitherDefined) {
    return [];
  }

  // Merge patterns - extract arrays or default to empty
  const global = F.pipe(
    globalPatterns,
    O.filter((p): p is readonly (string | RegExp)[] => p !== false),
    O.getOrElse(A.empty<string | RegExp>)
  );
  const tag = F.pipe(
    tagPatterns,
    O.filter((p): p is readonly (string | RegExp)[] => p !== false),
    O.getOrElse(A.empty<string | RegExp>)
  );

  return [...global, ...tag];
};

/**
 * Filter class names for a tag based on allowed classes configuration.
 *
 * @example
 * ```typescript
 * import { filterClasses } from "@beep/utils/sanitize-html/filters/class-filter"
 *
 * filterClasses("btn btn-primary hidden", "button", {
 *   "*": ["btn"],
 *   button: ["btn-*"]
 * })
 * // "btn btn-primary"
 * ```
 *
 * @since 0.1.0
 * @category filtering
 */
export const filterClasses = (classValue: string, tagName: string, allowedClasses: AllowedClasses): string => {
  const patterns = mergeClassPatterns(tagName, allowedClasses);

  // false means allow all classes
  if (patterns === false) {
    return classValue;
  }

  // Split class names and filter
  const classes = F.pipe(
    classValue,
    Str.split(/\s+/),
    A.filter((cls) => Str.length(Str.trim(cls)) > 0),
    A.filter((cls) => isClassAllowed(cls, patterns))
  );

  return A.join(classes, " ");
};

/**
 * Check if any classes are allowed for a tag.
 *
 * @since 0.1.0
 * @category guards
 */
export const hasAllowedClasses = (tagName: string, allowedClasses: AllowedClasses): boolean => {
  const patterns = mergeClassPatterns(tagName, allowedClasses);

  return F.pipe(
    Match.value(patterns),
    Match.when(false, thunkTrue),
    Match.orElse((p) => !A.isEmptyReadonlyArray(p))
  );
};

/**
 * Check if any classes would match the allowed patterns.
 * Useful for determining if the class attribute should be included at all.
 *
 * @since 0.1.0
 * @category guards
 */
export const wouldAnyClassMatch = (classValue: string, tagName: string, allowedClasses: AllowedClasses): boolean => {
  const filtered = filterClasses(classValue, tagName, allowedClasses);
  return Str.length(filtered) > 0;
};

/**
 * CSS property filtering based on allowlists
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { CssDeclaration } from "./css-parser.js";
import { isDangerousCssValue, parseStyleAttribute, stringifyDeclarations } from "./css-parser.js";

/**
 * Allowed styles configuration.
 * Maps tag names (or "*" for all tags) to property names to regex patterns.
 */
export type AllowedStyles = Record<string, Record<string, readonly RegExp[]>>;

/**
 * Check if the declaration value is safe (not dangerous).
 */
const isSafeValue: P.Predicate<string> = P.not(isDangerousCssValue);

/**
 * Check if any pattern matches the given value.
 */
const matchesAnyPattern = (value: string, patterns: readonly RegExp[]): boolean =>
  A.some(patterns, (pattern) => pattern.test(value));

/**
 * Filter a CSS declaration against allowed patterns.
 */
const isDeclarationAllowed = (
  declaration: CssDeclaration,
  allowedPatterns: Record<string, readonly RegExp[]>
): boolean =>
  F.pipe(
    declaration.value,
    O.liftPredicate(isSafeValue),
    O.flatMap(() =>
      F.pipe(
        allowedPatterns,
        R.get(declaration.property),
        O.filter((patterns) => matchesAnyPattern(declaration.value, patterns))
      )
    ),
    O.isSome
  );

/**
 * Get rules for a tag name from allowed styles, returning empty record if not found.
 */
const getRulesForTag = (tagName: string, allowedStyles: AllowedStyles): Record<string, readonly RegExp[]> =>
  F.pipe(
    allowedStyles,
    R.get(tagName),
    O.getOrElse(() => ({}))
  );

/**
 * Combine patterns from two sources for the same property.
 */
const combinePatterns = (existing: O.Option<readonly RegExp[]>, incoming: readonly RegExp[]): readonly RegExp[] =>
  F.pipe(
    existing,
    O.match({
      onNone: () => incoming,
      onSome: (existingPatterns) => A.appendAll(existingPatterns, incoming),
    })
  );

/**
 * Merge global and tag-specific style rules.
 */
const mergeStyleRules = (tagName: string, allowedStyles: AllowedStyles): Record<string, readonly RegExp[]> => {
  const globalRules = getRulesForTag("*", allowedStyles);
  const tagRules = getRulesForTag(tagName, allowedStyles);

  // Start with global rules, then merge in tag-specific rules
  return F.pipe(
    Struct.entries(tagRules),
    A.reduce(globalRules, (merged, [prop, patterns]) =>
      F.pipe(merged, R.set(prop, combinePatterns(R.get(merged, prop), patterns)))
    )
  );
};

/**
 * Filter CSS style attribute based on allowed styles configuration.
 *
 * @example
 * ```typescript
 * import { filterStyles } from "@beep/utils/sanitize-html/css/css-filter"
 *
 * const filtered = filterStyles("color: red; font-size: 20px;", "p", {
 *   "*": {
 *     color: [/^#[0-9a-f]{3,6}$/i, /^(red|blue|green)$/]
 *   },
 *   p: {
 *     "font-size": [/^\d+px$/]
 *   }
 * })
 * // "color:red;font-size:20px"
 *
 * const dangerous = filterStyles("background: url(javascript:alert(1))", "div", {
 *   div: { background: [/./] }
 * })
 * // "" (dangerous values are always removed)
 * ```
 *
 * @since 0.1.0
 * @category filtering
 */
export const filterStyles = (style: string, tagName: string, allowedStyles: AllowedStyles): string => {
  const declarations = parseStyleAttribute(style);
  const rules = mergeStyleRules(Str.toLowerCase(tagName), allowedStyles);

  const filtered = A.filter(declarations, (decl) => isDeclarationAllowed(decl, rules));

  return stringifyDeclarations(filtered);
};

/**
 * Check if any styles would be allowed for a tag.
 *
 * @since 0.1.0
 * @category guards
 */
export const hasAllowedStyles = (tagName: string, allowedStyles: AllowedStyles): boolean =>
  F.pipe(mergeStyleRules(Str.toLowerCase(tagName), allowedStyles), Struct.keys, A.isNonEmptyArray);

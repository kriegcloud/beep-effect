/**
 * Attribute filtering for sanitize-html
 *
 * @since 0.1.0
 * @module
 */
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

import type { AllowedAttribute, Attributes } from "../types";
import { createGlobMatcher, isGlobPattern } from "../utils/glob-matcher";
import { isPlainObject } from "../utils/is-plain-object";

/**
 * A valid HTML attribute name pattern.
 * Based on HTML5 spec - excludes characters that would break parsing.
 */
const VALID_ATTRIBUTE_NAME = /^[^\0\t\n\f\r /<=>]+$/;

/**
 * Check if an attribute name is valid per HTML spec.
 *
 * @since 0.1.0
 * @category guards
 */
export const isValidAttributeName = (name: string): boolean => VALID_ATTRIBUTE_NAME.test(name);

/**
 * Configuration for attribute filtering.
 */
interface AttributeFilterConfig {
  readonly allowedAttributes: false | Record<string, readonly AllowedAttribute[]>;
  readonly nonBooleanAttributes: readonly string[];
  readonly allowedEmptyAttributes: readonly string[];
}

/**
 * Type guard for object-style AllowedAttribute with name and values.
 */
const isObjectAllowedAttribute = (
  attr: AllowedAttribute
): attr is { readonly name: string; readonly multiple?: undefined | boolean; readonly values: readonly string[] } =>
  isPlainObject(attr) && P.isString((attr as Record<string, unknown>).name);

/**
 * Check if a string attribute matches the normalized attribute name.
 */
const matchesStringAttribute = (attr: string, normalizedAttr: string): boolean =>
  F.pipe(
    Match.value(attr),
    Match.when(
      (a) => Str.toLowerCase(a) === normalizedAttr,
      () => true
    ),
    Match.when(isGlobPattern, (a) => createGlobMatcher([a])(normalizedAttr)),
    Match.orElse(() => false)
  );

/**
 * Check if an AllowedAttribute matches the normalized attribute name.
 */
const matchesAllowedAttribute = (attr: AllowedAttribute, normalizedAttr: string): boolean =>
  F.pipe(
    Match.value(attr),
    Match.when(P.isString, (a) => matchesStringAttribute(a, normalizedAttr)),
    Match.when(isObjectAllowedAttribute, (a) => Str.toLowerCase(a.name) === normalizedAttr),
    Match.orElse(() => false)
  );

/**
 * Find a matching AllowedAttribute from a list.
 */
const findMatchingAttribute = (
  allowed: readonly AllowedAttribute[] | undefined,
  normalizedAttr: string
): O.Option<AllowedAttribute> =>
  F.pipe(
    O.fromNullable(allowed),
    O.flatMap((attrs) => A.findFirst(attrs, (attr) => matchesAllowedAttribute(attr, normalizedAttr)))
  );

/**
 * Check if an attribute is allowed for a tag.
 */
const isAttributeAllowed = (
  tagName: string,
  attrName: string,
  allowedAttributes: false | Record<string, readonly AllowedAttribute[]>
): O.Option<AllowedAttribute> =>
  F.pipe(
    Match.value(allowedAttributes),
    // false means allow all attributes
    Match.when(false as const, () => O.some(attrName as AllowedAttribute)),
    // undefined means allow none
    Match.when(P.isUndefined, () => O.none()),
    // Record - check tag-specific and global
    Match.orElse((attrs) => {
      const normalizedTag = Str.toLowerCase(tagName);
      const normalizedAttr = Str.toLowerCase(attrName);

      const tagAllowed = attrs[normalizedTag];
      const globalAllowed = attrs["*"];

      return F.pipe(
        findMatchingAttribute(tagAllowed, normalizedAttr),
        O.orElse(() => findMatchingAttribute(globalAllowed, normalizedAttr))
      );
    })
  );

/**
 * Filter attribute value based on allowed values.
 */
const filterAttributeValue = (value: string, allowedAttr: AllowedAttribute): string =>
  F.pipe(
    Match.value(allowedAttr),
    // String attribute - allow any value
    Match.when(P.isString, () => value),
    // Non-plain-object - allow any value
    Match.when(
      (a) => !isPlainObject(a),
      () => value
    ),
    // Object with values constraint
    Match.orElse((attr) => {
      const typedAttr = attr as { readonly values: readonly string[]; readonly multiple?: undefined | boolean };
      const allowedValues = typedAttr.values;
      const multiple = typedAttr.multiple ?? false;

      return F.pipe(
        Match.value(multiple),
        Match.when(true, () => {
          // Filter multiple space-separated values
          const parts = Str.split(value, /\s+/);
          const filtered = A.filter(parts, (part) => A.some(allowedValues, (allowed) => allowed === part));
          return A.join(filtered, " ");
        }),
        Match.orElse(() => {
          // Single value must match exactly
          const isAllowed = A.some(allowedValues, (allowed) => allowed === value);
          return isAllowed ? value : "";
        })
      );
    })
  );

/**
 * Check if an attribute is a boolean attribute.
 */
const isBooleanAttribute = (attrName: string, nonBooleanAttributes: readonly string[]): boolean => {
  const normalizedAttr = Str.toLowerCase(attrName);

  // If "*" is in nonBooleanAttributes, all attributes are non-boolean
  const hasWildcard = A.some(nonBooleanAttributes, (attr) => attr === "*");

  return F.pipe(
    Match.value(hasWildcard),
    Match.when(true, () => false),
    Match.orElse(
      () =>
        // Check if attribute is explicitly marked as non-boolean
        !A.some(nonBooleanAttributes, (attr) => Str.toLowerCase(attr) === normalizedAttr)
    )
  );
};

/**
 * Check if an empty attribute value should be preserved.
 */
const shouldPreserveEmptyValue = (attrName: string, allowedEmptyAttributes: readonly string[]): boolean => {
  const normalizedAttr = Str.toLowerCase(attrName);
  return A.some(allowedEmptyAttributes, (attr) => Str.toLowerCase(attr) === normalizedAttr);
};

/**
 * Process a single attribute entry and return the filtered result.
 */
const processAttribute = (
  tagName: string,
  name: string,
  value: string,
  config: AttributeFilterConfig
): O.Option<readonly [string, string]> => {
  // Check if attribute name is valid
  const isValid = isValidAttributeName(name);

  return F.pipe(
    Match.value(isValid),
    Match.when(false, () => O.none()),
    Match.orElse(() =>
      F.pipe(
        // Check if attribute is allowed
        isAttributeAllowed(tagName, name, config.allowedAttributes),
        O.flatMap((allowedResult) => {
          // Filter value if needed
          const filteredValue = filterAttributeValue(value, allowedResult);

          // Handle empty values
          return F.pipe(
            Match.value(filteredValue === ""),
            Match.when(true, () => {
              const isBoolean = isBooleanAttribute(name, config.nonBooleanAttributes);
              const preserveEmpty = shouldPreserveEmptyValue(name, config.allowedEmptyAttributes);

              return F.pipe(
                Match.value({ isBoolean, preserveEmpty }),
                // Boolean attributes can be empty
                Match.when({ isBoolean: true }, () => O.some([Str.toLowerCase(name), ""] as const)),
                // Empty allowed attributes should be preserved
                Match.when({ preserveEmpty: true }, () => O.some([Str.toLowerCase(name), ""] as const)),
                // Non-boolean empty attributes should be removed
                Match.orElse(() => O.none())
              );
            }),
            Match.orElse(() => O.some([Str.toLowerCase(name), filteredValue] as const))
          );
        })
      )
    )
  );
};

/**
 * Filter attributes for a tag based on allowed attributes configuration.
 *
 * @example
 * ```typescript
 * import { filterAttributes } from "@beep/utils/sanitize-html/filters/attribute-filter"
 *
 * filterAttributes(
 *   "a",
 *   { href: "https://example.com", onclick: "evil()" },
 *   {
 *     allowedAttributes: { a: ["href", "target"] },
 *     nonBooleanAttributes: ["href"],
 *     allowedEmptyAttributes: ["alt"]
 *   }
 * )
 * // { href: "https://example.com" }
 * ```
 *
 * @since 0.1.0
 * @category filtering
 */
export const filterAttributes = (tagName: string, attributes: Attributes, config: AttributeFilterConfig): Attributes =>
  F.pipe(
    Struct.entries(attributes),
    A.filterMap(([name, value]) => processAttribute(tagName, name, value, config)),
    A.reduce({} as Record<string, string>, (acc, [name, value]) => ({
      ...acc,
      [name]: value,
    }))
  );

/**
 * Build glob matchers for allowed attributes.
 * This is used for efficient repeated matching.
 *
 * @since 0.1.0
 * @category utilities
 */
export const buildAttributeGlobMatchers = (
  allowedAttributes: false | Record<string, readonly AllowedAttribute[]>
): Record<string, (attrName: string) => boolean> =>
  F.pipe(
    Match.value(allowedAttributes),
    Match.when(false as const, () => ({})),
    Match.orElse((attrs) =>
      F.pipe(
        Struct.entries(attrs),
        A.filterMap(([tag, attrList]) => {
          const globPatterns = A.filter(attrList, (attr): attr is string => P.isString(attr) && isGlobPattern(attr));

          return F.pipe(
            Match.value(A.isEmptyReadonlyArray(globPatterns)),
            Match.when(true, () => O.none()),
            Match.orElse(() => O.some([tag, createGlobMatcher(globPatterns)] as const))
          );
        }),
        A.reduce({} as Record<string, (attrName: string) => boolean>, (acc, [tag, matcher]) => ({
          ...acc,
          [tag]: matcher,
        }))
      )
    )
  );

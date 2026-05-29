/**
 * Field path formatting, reading, writing, and dirty-path predicates.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { HashSet, Match, Number as N } from "effect";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { TUnsafe } from "@beep/types";

const BRACKET_NOTATION_REGEX = /\[(\d+)]/g;

interface StandardPathSegment {
  readonly key: PropertyKey;
}

const isStandardPathSegment = (segment: PropertyKey | StandardPathSegment): segment is StandardPathSegment =>
  P.isObject(segment) && P.hasProperty(segment, "key") && P.isPropertyKey(segment.key);

const getPathSegmentKey = (segment: PropertyKey | StandardPathSegment): PropertyKey =>
  isStandardPathSegment(segment) ? segment.key : segment;

const propertyKeyToPathSegment = (key: PropertyKey): string =>
  Match.value(key).pipe(
    Match.when(P.isString, (value) => value),
    Match.when(P.isNumber, (value) => `${value}`),
    Match.orElse((value) => value.description ?? "")
  );

/**
 * Converts a schema issue path into dot-and-bracket form field notation.
 *
 * @example
 * ```ts
 * import { schemaPathToFieldPath } from "@beep/form/core/Path"
 *
 * console.log(schemaPathToFieldPath(["items", 0, "name"])) // "items[0].name"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const schemaPathToFieldPath = (path: ReadonlyArray<PropertyKey | StandardPathSegment> | undefined): string => {
  if (path === undefined) return "";
  if (A.length(path) === 0) return "";

  const first = path[0];
  if (first === undefined) return "";

  let result = propertyKeyToPathSegment(getPathSegmentKey(first));
  for (let i = 1; i < A.length(path); i++) {
    const segment = path[i];
    if (segment === undefined) continue;
    const segmentKey = getPathSegmentKey(segment);
    if (P.isNumber(segmentKey)) {
      result += `[${segmentKey}]`;
    } else {
      result += `.${propertyKeyToPathSegment(segmentKey)}`;
    }
  }
  return result;
};

/**
 * Tests whether a path is equal to or nested below a root path.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { isPathUnderRoot } from "@beep/form/core/Path"
 *
 * console.log(isPathUnderRoot("items[0].name", "items")) // true
 * console.log(pipe("items[0].name", isPathUnderRoot("items"))) // true
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isPathUnderRoot: {
  (rootPath: string): (path: string) => boolean;
  (path: string, rootPath: string): boolean;
} = dual(
  2,
  (path: string, rootPath: string): boolean =>
    path === rootPath || pipe(path, Str.startsWith(`${rootPath}.`)) || pipe(path, Str.startsWith(`${rootPath}[`))
);

/**
 * Tests whether a path or one of its parents is marked dirty.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { isPathOrParentDirty } from "@beep/form/core/Path"
 * import * as HashSet from "effect/HashSet"
 *
 * console.log(isPathOrParentDirty(HashSet.make("user"), "user.name")) // true
 * console.log(pipe(HashSet.make("user"), isPathOrParentDirty("user.name"))) // true
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isPathOrParentDirty: {
  (path: string): (dirtyFields: HashSet.HashSet<string>) => boolean;
  (dirtyFields: HashSet.HashSet<string>, path: string): boolean;
} = dual(2, (dirtyFields: HashSet.HashSet<string>, path: string): boolean => {
  if (HashSet.has(dirtyFields, path)) return true;

  let parent = path;
  while (true) {
    const lastDot = pipe(
      Str.lastIndexOf(".")(parent),
      O.getOrElse(() => -1)
    );
    const lastBracket = pipe(
      Str.lastIndexOf("[")(parent),
      O.getOrElse(() => -1)
    );
    const splitIndex = N.max(lastDot, lastBracket);

    if (splitIndex === -1) break;

    parent = pipe(parent, Str.substring(0, splitIndex));
    if (HashSet.has(dirtyFields, parent)) return true;
  }

  return false;
});

/**
 * Reads a value from a dot-and-bracket path.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { getNestedValue } from "@beep/form/core/Path"
 *
 * console.log(getNestedValue({ items: [{ name: "A" }] }, "items[0].name")) // "A"
 * console.log(pipe({ items: [{ name: "A" }] }, getNestedValue("items[0].name"))) // "A"
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const getNestedValue: {
  (path: string): (obj: unknown) => unknown;
  (obj: unknown, path: string): unknown;
} = dual(2, (obj: unknown, path: string): unknown => {
  if (path === "") return obj;
  const parts = pipe(path, Str.replace(BRACKET_NOTATION_REGEX, ".$1"), Str.split("."));
  let current: unknown = obj;
  for (const part of parts) {
    if (!P.isObjectOrArray(current)) return undefined;
    current = (current as TUnsafe.Any as Readonly<Record<string, unknown>>)[part];
  }
  return current;
});

/**
 * Sets a value at a dot-and-bracket path while copying touched containers.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { setNestedValue } from "@beep/form/core/Path"
 *
 * const result = setNestedValue({ user: { name: "Ada" } }, { path: "user.name", value: "Grace" })
 * const piped = pipe({ user: { name: "Ada" } }, setNestedValue({ path: "user.name", value: "Grace" }))
 * console.log(result.user.name) // "Grace"
 * console.log(piped.user.name) // "Grace"
 * ```
 *
 * @category setters
 * @since 0.0.0
 */
export const setNestedValue: {
  (options: { readonly path: string; readonly value: unknown }): <T>(obj: T) => T;
  <T>(obj: T, options: { readonly path: string; readonly value: unknown }): T;
} = dual(2, <T>(obj: T, options: { readonly path: string; readonly value: unknown }): T => {
  const { path, value } = options;
  if (path === "") return value as T;
  const parts = pipe(path, Str.replace(BRACKET_NOTATION_REGEX, ".$1"), Str.split("."));
  const result = { ...(obj as TUnsafe.Any as Record<string, unknown>) } as Record<string, unknown>;

  let current = result;
  for (let i = 0; i < A.length(parts) - 1; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    if (A.isArray(current[part])) {
      current[part] = A.copy(current[part]);
    } else {
      current[part] = { ...(current[part] as TUnsafe.Any as Record<string, unknown>) };
    }
    current = current[part] as TUnsafe.Any as Record<string, unknown>;
  }

  const lastPart = parts[A.length(parts) - 1];
  if (lastPart !== undefined) {
    current[lastPart] = value;
  }
  return result as T;
});

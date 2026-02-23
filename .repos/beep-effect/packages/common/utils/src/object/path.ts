/**
 * Object path utilities exported via `@beep/utils`, covering safe get/set flows
 * that guard against forbidden prototype keys.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const objectPathRecord: FooTypes.Prettify<{ profile: { name: string } }> = {
 *   profile: { name: "Ada" },
 * };
 * const objectPathName = Utils.getPath(objectPathRecord, "profile.name");
 * void objectPathName;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import { thunk } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const isObjectLike = (value: unknown): value is Record<PropertyKey, UnsafeTypes.UnsafeAny> =>
  P.isNotNull(value) && P.isObject(value);

const toPropertyKey = (segment: string): PropertyKey => {
  const numericValue = Number(segment);
  if (!Number.isNaN(numericValue) && `${numericValue}` === segment) {
    return numericValue;
  }
  return segment;
};

const normalizePath = (path: string | ReadonlyArray<PropertyKey>): ReadonlyArray<PropertyKey> => {
  if (!P.isString(path)) {
    return path;
  }

  return F.pipe(
    path,
    Str.replace(/\[(\d+)]/g, ".$1"),
    Str.split("."),
    A.filter((segment) => !Str.isEmpty(segment)),
    A.map(toPropertyKey)
  );
};

/**
 * Safely reads a nested property from an object using dot/bracket notation with
 * support for numeric indices.
 *
 * @example
 * import { getPath } from "@beep/utils/object/path";
 *
 * getPath({ user: { name: "Ada" } }, "user.name");
 *
 * @category Object
 * @since 0.1.0
 */
export const getPath = <T, D = undefined>(
  value: T,
  path: string | ReadonlyArray<PropertyKey>,
  defaultValue?: D | undefined
): T | D | undefined =>
  F.pipe(
    normalizePath(path),
    A.reduce<O.Option<UnsafeTypes.UnsafeAny>, PropertyKey>(O.some(value), (current, segment) =>
      F.pipe(
        current,
        O.filter((currentValue) => currentValue != null),
        O.flatMap((currentValue) => {
          if (P.isString(segment) && FORBIDDEN_KEYS.has(segment)) {
            return O.none();
          }
          const nextValue = currentValue[segment];
          return O.fromNullable(nextValue);
        })
      )
    ),
    O.match({
      onNone: thunk(defaultValue),
      onSome: (result) => result as T | D,
    })
  );

const ensureContainer = (
  parent: Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  key: PropertyKey,
  nextKey: PropertyKey | undefined
): Record<PropertyKey, UnsafeTypes.UnsafeAny> | Array<UnsafeTypes.UnsafeAny> => {
  const current = parent[key];
  if (isObjectLike(current)) {
    return current as Record<PropertyKey, UnsafeTypes.UnsafeAny>;
  }
  const container = P.isNumber(nextKey)
    ? A.empty<UnsafeTypes.UnsafeAny>()
    : ({} as Record<PropertyKey, UnsafeTypes.UnsafeAny>);
  parent[key] = container;
  return container;
};

/**
 * Creates nested objects/arrays as needed and sets a value at the provided
 * path, returning the mutated root object.
 *
 * @example
 * import { setPath } from "@beep/utils/object/path";
 *
 * const obj = {};
 * setPath(obj, "user.profile.name", "Ada");
 *
 * @category Object
 * @since 0.1.0
 */
export const setPath = (
  target: UnsafeTypes.UnsafeAny,
  path: string | ReadonlyArray<PropertyKey>,
  value: UnsafeTypes.UnsafeAny
): UnsafeTypes.UnsafeAny => {
  const segments = normalizePath(path);
  if (A.isEmptyReadonlyArray(segments)) {
    return target;
  }

  const root: Record<PropertyKey, UnsafeTypes.UnsafeAny> = isObjectLike(target) && !A.isArray(target) ? target : {};

  const assign = (
    container: Record<PropertyKey, UnsafeTypes.UnsafeAny> | Array<UnsafeTypes.UnsafeAny>,
    index: number
  ): void => {
    const key = segments[index] as PropertyKey | undefined;
    if (P.isUndefined(key) || (P.isString(key) && FORBIDDEN_KEYS.has(key))) {
      return;
    }
    if (index === segments.length - 1) {
      (container as Record<PropertyKey, UnsafeTypes.UnsafeAny>)[key] = value;
      return;
    }
    const nextKey = segments[index + 1] as PropertyKey | undefined;
    const nextContainer = ensureContainer(container as Record<PropertyKey, UnsafeTypes.UnsafeAny>, key, nextKey);
    assign(nextContainer, index + 1);
  };

  assign(root, 0);
  return root;
};

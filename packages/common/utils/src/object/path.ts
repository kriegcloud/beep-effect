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
 * @category Documentation/Modules
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const isObjectLike = (value: unknown): value is Record<PropertyKey, UnsafeTypes.UnsafeAny> =>
  value !== null && typeof value === "object";

const toPropertyKey = (segment: string): PropertyKey => {
  const numericValue = Number(segment);
  if (!Number.isNaN(numericValue) && `${numericValue}` === segment) {
    return numericValue;
  }
  return segment;
};

const normalizePath = (path: string | ReadonlyArray<PropertyKey>): ReadonlyArray<PropertyKey> => {
  if (typeof path !== "string") {
    return path;
  }

  return F.pipe(
    path,
    Str.replace(/\[(\d+)\]/g, ".$1"),
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
 * @category Object/Path
 * @since 0.1.0
 */
export const getPath = <T, D = undefined>(
  value: T,
  path: string | ReadonlyArray<PropertyKey>,
  defaultValue?: D | undefined
): T | D | undefined =>
  F.pipe(
    normalizePath(path),
    A.reduce<O.Option<UnsafeTypes.UnsafeAny>, PropertyKey>(O.some(value as UnsafeTypes.UnsafeAny), (current, segment) =>
      F.pipe(
        current,
        O.filter((currentValue) => currentValue != null),
        O.flatMap((currentValue) => {
          if (typeof segment === "string" && FORBIDDEN_KEYS.has(segment)) {
            return O.none();
          }
          const nextValue = (currentValue as Record<PropertyKey, UnsafeTypes.UnsafeAny>)[segment];
          return O.fromNullable(nextValue);
        })
      )
    ),
    O.match({
      onNone: () => defaultValue,
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
  const container =
    typeof nextKey === "number"
      ? ([] as Array<UnsafeTypes.UnsafeAny>)
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
 * @category Object/Path
 * @since 0.1.0
 */
export const setPath = (
  target: UnsafeTypes.UnsafeAny,
  path: string | ReadonlyArray<PropertyKey>,
  value: UnsafeTypes.UnsafeAny
): UnsafeTypes.UnsafeAny => {
  const segments = normalizePath(path);
  if (segments.length === 0) {
    return target;
  }

  const root: Record<PropertyKey, UnsafeTypes.UnsafeAny> =
    isObjectLike(target) && !Array.isArray(target) ? (target as Record<PropertyKey, UnsafeTypes.UnsafeAny>) : {};

  const assign = (
    container: Record<PropertyKey, UnsafeTypes.UnsafeAny> | Array<UnsafeTypes.UnsafeAny>,
    index: number
  ): void => {
    const key = segments[index] as PropertyKey | undefined;
    if (key === undefined || (typeof key === "string" && FORBIDDEN_KEYS.has(key))) {
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

/**
 * Implementation backing `Utils.ObjectUtils.cloneDeep`, providing deep
 * cloning similar to lodash's cloneDeep.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 *
 * const original = { a: { b: [1, 2, 3] } };
 * const cloned = ObjectUtils.cloneDeep(original);
 * cloned.a.b.push(4);
 * // original.a.b is still [1, 2, 3]
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as P from "effect/Predicate";

type PlainRecord = Record<PropertyKey, unknown>;

const isPlainObject = (value: unknown): value is PlainRecord => !A.isArray(value) && P.isRecord(value);

/**
 * Creates a deep clone of the provided value. Handles objects, arrays,
 * Date, RegExp, Map, Set, and primitive values.
 *
 * @example
 * import { cloneDeep } from "@beep/utils/data/object.utils/clone-deep";
 *
 * const original = { users: [{ name: "John" }] };
 * const cloned = cloneDeep(original);
 * cloned.users[0].name = "Jane";
 * // original.users[0].name is still "John"
 *
 * @category Data/Object
 * @since 0.1.0
 */
export function cloneDeep<T>(value: T): T {
  return cloneValue(value, new WeakMap()) as T;
}

function cloneValue(value: unknown, seen: WeakMap<object, unknown>): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value as object)) {
    return seen.get(value as object);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  if (value instanceof Map) {
    const clonedMap = new Map();
    seen.set(value, clonedMap);
    for (const [k, v] of value) {
      clonedMap.set(cloneValue(k, seen), cloneValue(v, seen));
    }
    return clonedMap;
  }

  if (value instanceof Set) {
    const clonedSet = new Set();
    seen.set(value, clonedSet);
    for (const v of value) {
      clonedSet.add(cloneValue(v, seen));
    }
    return clonedSet;
  }

  if (A.isArray(value)) {
    const clonedArray: unknown[] = [];
    seen.set(value, clonedArray);
    for (const item of value) {
      clonedArray.push(cloneValue(item, seen));
    }
    return clonedArray;
  }

  if (isPlainObject(value)) {
    const clonedObject: PlainRecord = {};
    seen.set(value, clonedObject);
    for (const key of Object.keys(value)) {
      clonedObject[key] = cloneValue(value[key], seen);
    }
    return clonedObject;
  }

  return value;
}

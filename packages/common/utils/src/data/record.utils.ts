import type { RecordTypes, StringTypes, UnsafeTypes } from "@beep/types";
import { isUnsafeProperty } from "@beep/utils/guards";
import type * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

export const recordKeys = <T extends UnsafeTypes.UnsafeReadonlyRecord>(
  record: RecordTypes.NonEmptyRecordWithStringKeys<T>
): A.NonEmptyReadonlyArray<keyof T> => {
  const set = HashSet.make(...Struct.keys(record));
  return HashSet.values(set) as unknown as A.NonEmptyReadonlyArray<keyof T>;
};

export const recordStringValues = <R extends RecordTypes.RecordStringKeyValueString>(
  r: RecordTypes.NonEmptyRecordStringKeyValues<R>
) => {
  return R.values(r) as unknown as RecordTypes.ReadonlyRecordValuesNonEmptyArray<
    RecordTypes.NonEmptyRecordStringKeyValues<R>
  >;
};

export const reverseRecord = <
  T extends R.ReadonlyRecord<keyof T & StringTypes.NonEmptyString, StringTypes.NonEmptyString>,
>(
  obj: T
): RecordTypes.ReversedRecord<T> =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key] as const));

/**
 * Merges the properties of the source object into the target object.
 *
 * This function performs a deep merge, meaning nested objects and arrays are merged recursively.
 * If a property in the source object is an array or an object and the corresponding property in the target object is also an array or object, they will be merged.
 * If a property in the source object is undefined, it will not overwrite a defined property in the target object.
 *
 * Note that this function mutates the target object.
 *
 * @param {T} target - The target object into which the source object properties will be merged. This object is modified in place.
 * @param {S} source - The source object whose properties will be merged into the target object.
 * @returns {T & S} The updated target object with properties from the source object merged in.
 *
 * @template T - Type of the target object.
 * @template S - Type of the source object.
 *
 * @example
 * const target = { a: 1, b: { x: 1, y: 2 } };
 * const source = { b: { y: 3, z: 4 }, c: 5 };
 *
 * const result = merge(target, source);
 * console.log(result);
 * // Output: { a: 1, b: { x: 1, y: 3, z: 4 }, c: 5 }
 *
 * @example
 * const target = { a: [1, 2], b: { x: 1 } };
 * const source = { a: [3], b: { y: 2 } };
 *
 * const result = merge(target, source);
 * console.log(result);
 * // Output: { a: [3, 2], b: { x: 1, y: 2 } }
 *
 * @example
 * const target = { a: null };
 * const source = { a: [1, 2, 3] };
 *
 * const result = merge(target, source);
 * console.log(result);
 * // Output: { a: [1, 2, 3] }
 */
export function merge<
  T extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
  S extends Record<PropertyKey, UnsafeTypes.UnsafeAny>,
>(target: T, source: S): T & S {
  const sourceKeys = Struct.keys(source);

  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i]!;

    if (isUnsafeProperty(key)) {
      continue;
    }

    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      if (Array.isArray(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge([], sourceValue);
      }
    } else if (P.isRecord(sourceValue)) {
      if (P.isRecord(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge({}, sourceValue);
      }
    } else if (targetValue === undefined || sourceValue !== undefined) {
      target[key] = sourceValue;
    }
  }

  return target;
}

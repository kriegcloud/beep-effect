/**
 * Backing logic for `Utils.RecordUtils`, covering deterministic key/value
 * extraction and guarded merging for dictionary-like structures.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const recordUtilsModuleRecord: FooTypes.Prettify<{ en: string; es: string }> = { en: "English", es: "Español" };
 * const recordUtilsModuleValues = Utils.RecordUtils.recordStringValues(recordUtilsModuleRecord);
 * void recordUtilsModuleValues;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type { RecordTypes, StringTypes, UnsafeTypes } from "@beep/types";
import { isUnsafeProperty } from "@beep/utils/guards";
import type * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

/**
 * Returns a deterministic non-empty array of keys from a record while
 * deduplicating via `HashSet` to guard against prototype pollution.
 *
 * @example
 * import { RecordUtils } from "@beep/utils";
 *
 * const keys = RecordUtils.recordKeys({ a: 1, b: 2 } as const);
 * // ["a", "b"]
 *
 * @category Data
 * @since 0.1.0
 */
export const recordKeys = <T extends UnsafeTypes.UnsafeReadonlyRecord>(
  record: RecordTypes.NonEmptyRecordWithStringKeys<T>
): A.NonEmptyReadonlyArray<keyof T> => {
  const set = HashSet.make(...Struct.keys(record));
  return HashSet.values(set) as unknown as A.NonEmptyReadonlyArray<keyof T>;
};

/**
 * Extracts values from a record whose keys and values are strings, returning a
 * non-empty readonly array typed to the record's literal values.
 *
 * @example
 * import { RecordUtils } from "@beep/utils";
 *
 * const values = RecordUtils.recordStringValues({ json: "application/json" } as const);
 * // ["application/json"]
 *
 * @category Data
 * @since 0.1.0
 */
export const recordStringValues = <R extends RecordTypes.RecordStringKeyValueString>(
  r: RecordTypes.NonEmptyRecordStringKeyValues<R>
) => {
  return R.values(r) as unknown as RecordTypes.ReadonlyRecordValuesNonEmptyArray<
    RecordTypes.NonEmptyRecordStringKeyValues<R>
  >;
};

/**
 * Swaps keys and values in a record whose keys and values are both non-empty
 * strings, returning a new object typed with the reversed mapping.
 *
 * @example
 * import { RecordUtils } from "@beep/utils";
 *
 * const locales = RecordUtils.reverseRecord({ en: "English", es: "Español" });
 * // { English: "en", Español: "es" }
 *
 * @category Data
 * @since 0.1.0
 */
export const reverseRecord = <
  T extends R.ReadonlyRecord<keyof T & StringTypes.NonEmptyString, StringTypes.NonEmptyString>,
>(
  obj: T
): RecordTypes.ReversedRecord<T> =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key] as const));

/**
 * Deeply merges two plain objects or arrays, mutating the target while
 * protecting against unsafe property names via `isUnsafeProperty`.
 *
 * Arrays and objects are merged recursively; primitive values from the source
 * overwrite target values unless the source is `undefined`.
 *
 * @example
 * import { RecordUtils } from "@beep/utils";
 *
 * const merged = RecordUtils.merge({ a: { x: 1 } }, { a: { y: 2 } });
 * // { a: { x: 1, y: 2 } }
 *
 * @category Data
 * @since 0.1.0
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

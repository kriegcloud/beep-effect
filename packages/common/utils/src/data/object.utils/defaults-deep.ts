/**
 * Implementation backing `Utils.ObjectUtils.defaultsDeep`, providing deep
 * default value assignment similar to lodash's defaultsDeep.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 *
 * const result = ObjectUtils.defaultsDeep(
 *   { a: { b: 1 } },
 *   { a: { b: 2, c: 3 } }
 * );
 * // { a: { b: 1, c: 3 } }
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import { isUnsafeProperty } from "@beep/utils/guards";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Struct from "effect/Struct";

type PlainRecord = Record<PropertyKey, unknown>;

const isPlainObject = (value: unknown): value is PlainRecord => !A.isArray(value) && P.isRecord(value);

/**
 * Recursively assigns default values from source objects to the target object.
 * Only assigns values for properties that are `undefined` in the target.
 * Arrays are not merged - target arrays take precedence.
 *
 * @example
 * import { defaultsDeep } from "@beep/utils/data/object.utils/defaults-deep";
 *
 * const defaults = { theme: { mode: "dark", accent: "blue" } };
 * const userConfig = { theme: { mode: "light" } };
 * const result = defaultsDeep({}, userConfig, defaults);
 * // { theme: { mode: "light", accent: "blue" } }
 *
 * @category Data/Object
 * @since 0.1.0
 */
export function defaultsDeep<T extends PlainRecord>(target: T, ...sources: readonly PlainRecord[]): T {
  const result = { ...target } as PlainRecord;

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    for (const [key, sourceValue] of Struct.entries(source)) {
      if (isUnsafeProperty(key)) continue;

      const targetValue = result[key];

      if (targetValue === undefined) {
        result[key] = isPlainObject(sourceValue)
          ? defaultsDeep({}, sourceValue)
          : A.isArray(sourceValue)
            ? [...sourceValue]
            : sourceValue;
      } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        result[key] = defaultsDeep(targetValue as PlainRecord, sourceValue as PlainRecord);
      }
    }
  }

  return result as T;
}

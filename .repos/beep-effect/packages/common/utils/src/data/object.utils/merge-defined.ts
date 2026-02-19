/**
 * Implementation backing `Utils.ObjectUtils.mergeDefined`, providing deep
 * merge functionality that omits undefined/null values.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 *
 * const result = ObjectUtils.mergeDefined(
 *   { a: 1, b: undefined },
 *   { b: 2, c: null }
 * );
 * // { a: 1, b: 2 } (with omitNull: true)
 *
 * @category Documentation
 * @since 0.1.0
 */
import { isUnsafeProperty } from "@beep/utils/guards";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

type PlainRecord = Record<PropertyKey, unknown>;

const isPlainObject = (value: unknown): value is PlainRecord => !A.isArray(value) && P.isRecord(value);

interface MergeDefinedOptions {
  readonly mergeArrays?: undefined | boolean;
  readonly omitNull?: undefined | boolean;
}

/**
 * Deeply merges two source objects, preferring defined values from source1
 * over source2. Optionally omits null/undefined values from the result.
 *
 * @example
 * import { mergeDefined } from "@beep/utils/data/object.utils/merge-defined";
 *
 * const source1 = { a: 1, b: undefined };
 * const source2 = { b: 2, c: 3 };
 * const result = mergeDefined(source1, source2);
 * // { a: 1, b: 2, c: 3 }
 *
 * @category Data
 * @since 0.1.0
 */
export function mergeDefined<TSource1 extends object, TSource2 extends object>(
  source1: TSource1,
  source2: TSource2,
  { mergeArrays = false, omitNull = false }: MergeDefinedOptions = {}
): TSource1 & TSource2 {
  const result: PlainRecord = {};

  const allKeys = new Set([...Struct.keys(source1 as PlainRecord), ...Struct.keys(source2 as PlainRecord)]);

  for (const key of allKeys) {
    if (isUnsafeProperty(key)) continue;

    const value1 = (source1 as PlainRecord)[key];
    const value2 = (source2 as PlainRecord)[key];

    const shouldUseValue2 = omitNull ? P.isUndefined(value1) : P.isNullable(value1);

    if (shouldUseValue2) {
      result[key] = value2;
    } else if (A.isArray(value1) && A.isArray(value2)) {
      result[key] = mergeArrays ? [...value1, ...value2] : value2;
    } else if (isPlainObject(value1) && isPlainObject(value2)) {
      result[key] = mergeDefined(value1, value2, { mergeArrays, omitNull });
    } else {
      result[key] = value1;
    }
  }

  const shouldOmit = omitNull ? (value: unknown) => P.isUndefined(value) : (value: unknown) => P.isNullable(value);

  return pipe(
    Struct.entries(result),
    A.filter(([, value]) => !shouldOmit(value)),
    R.fromEntries
  ) as TSource1 & TSource2;
}

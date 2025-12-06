/**
 * Implementation powering `Utils.enumFromStringArray`, `Utils.enumValues`, and
 * `Utils.enumOf`, showcasing literal-safe enum builders.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const transformationsEnum = Utils.enumFromStringArray("pending", "approved");
 * const transformationsValues: FooTypes.Prettify<readonly string[]> = Utils.enumValues(transformationsEnum);
 * void transformationsValues;
 *
 * @category Documentation
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import type { StringTypes } from "@beep/types";
import { valuesFromEnum } from "@beep/utils/transformations/valuesFromEnum";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import type * as R from "effect/Record";
import { create } from "mutative";
/**
 * Type for helpers that turn literal arrays into `{ key: key }` enums.
 *
 * @example
 * import type { EnumOf } from "@beep/utils/transformations/enumFromStringArray";
 * import { enumOf } from "@beep/utils/transformations/enumFromStringArray";
 *
 * const enumFromStrings: EnumOf = (...values) => enumOf(...values);
 * const enumFromStringsValue = enumFromStrings("draft", "live");
 * void enumFromStringsValue;
 *
 * @category Transformations
 * @since 0.1.0
 */
export type EnumOf = <T extends string>(
  ...literals: A.NonEmptyReadonlyArray<StringTypes.NonEmptyString<T>>
) => {
  readonly [K in T]: K;
};
/**
 * Builds a readonly key/value enum from a non-empty list of literal strings
 * while asserting the result is a record.
 *
 * @example
 * import { enumOf } from "@beep/utils/transformations/enumFromStringArray";
 *
 * const Status = enumOf("pending", "active");
 *
 * @category Transformations
 * @since 0.1.0
 */
export const enumOf: EnumOf = <T extends string>(
  ...literals: A.NonEmptyReadonlyArray<StringTypes.NonEmptyString<T>>
) => {
  const enumObj = A.reduce(literals, {} as { readonly [K in T]: K }, (acc, k) => ({ ...acc, [k]: k }));
  invariant(P.isReadonlyRecord(enumObj), "Expected enum to be a readonly record", {
    file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
    line: 18,
    args: [enumObj],
  });
  return enumObj;
};

/**
 * Extracts the non-empty array of values from a readonly enum.
 *
 * @example
 * import { enumValues } from "@beep/utils/transformations/enumFromStringArray";
 *
 * enumValues({ a: "a", b: "b" } as const);
 *
 * @category Transformations
 * @since 0.1.0
 */
export type EnumValues = <K extends string, A extends string>(o: R.ReadonlyRecord<K, A>) => A.NonEmptyReadonlyArray<A>;

/**
 * Returns a non-empty array of string enum values, verifying all entries are
 * strings.
 *
 * @example
 * import { enumValues } from "@beep/utils/transformations/enumFromStringArray";
 *
 * enumValues({ foo: "foo" } as const);
 *
 * @category Transformations
 * @since 0.1.0
 */
export const enumValues: EnumValues = F.flow(
  <K extends string, A extends string>(o: R.ReadonlyRecord<K, A>): A.NonEmptyReadonlyArray<A> => {
    const values = valuesFromEnum(o);

    invariant(A.isNonEmptyReadonlyArray(values), "Expected enum to have values", {
      file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
      line: 32,
      args: [values],
    });
    invariant(A.every(values, P.isString), "Expected enum values to be strings", {
      file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
      line: 33,
      args: [values],
    });

    return values;
  }
);

/**
 * Factory that turns a list of strings into a readonly enum object.
 *
 * @example
 * import { enumFromStringArray } from "@beep/utils/transformations/enumFromStringArray";
 *
 * enumFromStringArray("one", "two");
 *
 * @category Transformations
 * @since 0.1.0
 */
export type EnumFromStringArray = <T extends A.NonEmptyReadonlyArray<string>>(...values: T) => { [K in T[number]]: K };
/**
 * Builds a readonly object mapping each provided literal to itself, preserving
 * literal inference for downstream usage.
 *
 * @example
 * import { enumFromStringArray } from "@beep/utils/transformations/enumFromStringArray";
 *
 * const Status = enumFromStringArray("pending", "active");
 *
 * @category Transformations
 * @since 0.1.0
 */
export const enumFromStringArray: EnumFromStringArray = <T extends A.NonEmptyReadonlyArray<string>>(...values: T) =>
  A.reduce(
    values,
    {} as { [K in T[number]]: K },
    (acc, k) =>
      create(acc, (draft: { [K in T[number]]: K }) => {
        draft[k as keyof typeof draft] = k;
      }) as { [K in T[number]]: K }
  );

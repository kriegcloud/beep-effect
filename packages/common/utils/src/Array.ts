import type { TUnsafe } from "@beep/types";
import { Function, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { thunkFalse, thunkTrue } from "./thunk.ts";

const { dual, flow } = Function;

/**
 * Returns `true` when the array is non-empty, `false` otherwise.
 *
 * A thin wrapper around `Array.match` that collapses a readonly array into a
 * boolean without inspecting its elements.
 *
 * @example
 * ```ts
 * import { A } from "@beep/utils"
 *
 * const hasItems = A.matchToBoolean([1, 2, 3])
 * // true
 *
 * const empty = A.matchToBoolean([])
 * // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const matchToBoolean = flow(
  A.match({
    onNonEmpty: thunkTrue,
    onEmpty: thunkFalse,
  })
);
const NonEmptyReadonlyArraySchema = S.NonEmptyArray(S.Any);
const NonEmptyArraySchema = NonEmptyReadonlyArraySchema.pipe(S.mutable);

/**
 * Asserts that `input` is a mutable non-empty array, throwing on failure.
 *
 * Uses `Schema.asserts` under the hood so the error includes full decode
 * context when the assertion fails.
 *
 * @example
 * ```ts
 * import { A } from "@beep/utils"
 *
 * const items: unknown = [1, 2, 3]
 * A.assertNonEmptyArray(items)
 * // items is now typed as NonEmptyArray<unknown>
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const assertNonEmptyArray: (input: unknown) => asserts input is A.NonEmptyArray<TUnsafe.Any> =
  S.asserts(NonEmptyArraySchema);
/**
 * Asserts that `input` is a readonly non-empty array, throwing on failure.
 *
 * Uses `Schema.asserts` under the hood so the error includes full decode
 * context when the assertion fails.
 *
 * @example
 * ```ts
 * import { A } from "@beep/utils"
 *
 * const items: unknown = ["a", "b"]
 * A.assertNonEmptyReadonlyArray(items)
 * // items is now typed as NonEmptyReadonlyArray<unknown>
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const assertNonEmptyReadonlyArray: (input: unknown) => asserts input is A.NonEmptyReadonlyArray<TUnsafe.Any> =
  S.asserts(NonEmptyReadonlyArraySchema);

/**
 * Like `Array.map` but asserts the result as `NonEmptyArray`.
 *
 * Safe because mapping a non-empty input always produces a non-empty output.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { A } from "@beep/utils"
 *
 * const items: A.NonEmptyReadonlyArray<number> = [1, 2, 3]
 *
 * // Data-first
 * const doubled = A.mapNonEmpty(items, (n) => n * 2)
 *
 * // Data-last (pipeable)
 * const tripled = pipe(items, A.mapNonEmpty((n) => n * 3))
 *
 * void doubled
 * void tripled
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mapNonEmpty: {
  <T, U>(f: (a: T, i: number) => U): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyArray<U>;
  <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyArray<U>;
} = dual(2, <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyArray<U> => {
  const result = A.map(self, f);
  assertNonEmptyArray(result);
  return result;
});

/**
 * Like `Array.flatMap` but asserts the result as `NonEmptyArray`.
 *
 * Safe because flat-mapping non-empty input with a function returning
 * non-empty arrays always produces a non-empty output.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { A } from "@beep/utils"
 *
 * const items: A.NonEmptyReadonlyArray<number> = [1, 2, 3]
 *
 * // Data-first
 * const expanded = A.flatMapNonEmpty(items, (n): A.NonEmptyReadonlyArray<number> => [n, n * 10])
 *
 * // Data-last (pipeable)
 * const doubled = pipe(items, A.flatMapNonEmpty((n): A.NonEmptyReadonlyArray<number> => [n, n]))
 *
 * void expanded
 * void doubled
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const flatMapNonEmpty: {
  <T, U>(f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyArray<U>;
  <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): A.NonEmptyArray<U>;
} = dual(
  2,
  flow(
    <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): A.NonEmptyArray<U> =>
      A.flatMap(self, f),
    (out) => {
      assertNonEmptyArray(out);
      return out;
    }
  )
);

/**
 * Like `Array.map` but asserts the result as `NonEmptyReadonlyArray`.
 *
 * Safe because mapping a non-empty input always produces a non-empty output.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { A } from "@beep/utils"
 *
 * const items: A.NonEmptyReadonlyArray<string> = ["a", "b", "c"]
 *
 * // Data-first
 * const upper = A.mapNonEmptyReadonly(items, (s) => s.toUpperCase())
 *
 * // Data-last (pipeable)
 * const prefixed = pipe(items, A.mapNonEmptyReadonly((s) => `item-${s}`))
 *
 * void upper
 * void prefixed
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mapNonEmptyReadonly: {
  <T, U>(f: (a: T, i: number) => U): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyReadonlyArray<U>;
  <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyReadonlyArray<U>;
} = dual(2, <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyReadonlyArray<U> => {
  const result = A.map(self, f);
  assertNonEmptyReadonlyArray(result);
  return result;
});

/**
 * Like `Array.flatMap` but asserts the result as `NonEmptyReadonlyArray`.
 *
 * Safe because flat-mapping non-empty input with a function returning
 * non-empty arrays always produces a non-empty output.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { A } from "@beep/utils"
 *
 * const items: A.NonEmptyReadonlyArray<string> = ["hi", "bye"]
 *
 * // Data-first
 * const expanded = A.flatMapNonEmptyReadonly(
 *   items,
 *   (s): A.NonEmptyReadonlyArray<string> => [s, s.toUpperCase()]
 * )
 *
 * // Data-last (pipeable)
 * const doubled = pipe(
 *   items,
 *   A.flatMapNonEmptyReadonly(
 *     (s): A.NonEmptyReadonlyArray<string> => [s, s]
 *   )
 * )
 *
 * void expanded
 * void doubled
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const flatMapNonEmptyReadonly: {
  <T, U>(
    f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>
  ): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyReadonlyArray<U>;
  <T, U>(
    self: A.NonEmptyReadonlyArray<T>,
    f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>
  ): A.NonEmptyReadonlyArray<U>;
} = dual(
  2,
  <T, U>(
    self: A.NonEmptyReadonlyArray<T>,
    f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>
  ): A.NonEmptyReadonlyArray<U> => {
    const out = A.flatMap<T, U>(self, f);
    assertNonEmptyReadonlyArray(out);
    return out;
  }
);

/**
 * Re-export of all helpers from `effect/Array`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/Array";

/**
 * Normalizes a value-or-array into a `ReadonlyArray`.
 *
 * If the input is already an array it is returned as-is; otherwise it is
 * wrapped in a single-element array via `Array.of`.
 *
 * @example
 * ```ts
 * import { A } from "@beep/utils"
 *
 * const single = A.makeReadonly("hello")
 * // ["hello"]
 *
 * const multi = A.makeReadonly(["a", "b"])
 * // ["a", "b"]
 *
 * void single
 * void multi
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeReadonly = <T>(a: T | Array<T>): ReadonlyArray<T> => (A.isArray(a) ? a : A.of(a));

/**
 * Converts an iterable into a `NonEmptyReadonlyArray`, asserting that at
 * least one element is present.
 *
 * Throws if the iterable yields zero elements.
 *
 * @example
 * ```ts
 * import { A } from "@beep/utils"
 *
 * const fromSet = A.fromIterableNonEmpty(new Set([1, 2, 3]))
 * // [1, 2, 3] typed as NonEmptyReadonlyArray<number>
 *
 * void fromSet
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromIterableNonEmpty = <const TArray>(collection: Iterable<TArray>): A.NonEmptyReadonlyArray<TArray> => {
  if (A.isArray(collection)) {
    assertNonEmptyArray(collection);
    return collection;
  }

  return pipe(collection, Array.from, (arr) => {
    assertNonEmptyArray(arr);

    return arr;
  });
};

import type { TUnsafe } from "@beep/types";
import { Function } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { thunkFalse, thunkTrue } from "./thunk.js";

const { dual, flow } = Function;

/**
 * @category pattern matching
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

const assertNonEmptyArray: (input: unknown) => asserts input is A.NonEmptyArray<TUnsafe.Any> =
  S.asserts(NonEmptyArraySchema);
const assertNonEmptyReadonlyArray: (input: unknown) => asserts input is A.NonEmptyReadonlyArray<TUnsafe.Any> =
  S.asserts(NonEmptyReadonlyArraySchema);

/**
 * Like `Array.map` but asserts the result as `NonEmptyArray`.
 * Safe because mapping a non-empty input always produces a non-empty output.
 *
 * @category mapping
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
 * Safe because flat-mapping non-empty input with a function returning non-empty arrays
 * always produces a non-empty output.
 *
 * @category sequencing
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
 * Safe because mapping a non-empty input always produces a non-empty output.
 *
 * @category mapping
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
 * Safe because flat-mapping non-empty input with a function returning non-empty arrays
 * always produces a non-empty output.
 *
 * @category sequencing
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

export * from "effect/Array";

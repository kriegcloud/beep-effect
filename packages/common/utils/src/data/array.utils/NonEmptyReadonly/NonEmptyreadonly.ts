/**
 * Provides the implementation for `Utils.ArrayUtils.NonEmptyReadonly`, giving
 * docgen a namespace-aware location for tuple-safe helpers.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const nonEmptyArrayUtilsItems: FooTypes.Prettify<["one", "two"]> = ["one", "two"];
 * const nonEmptyArrayUtilsMapped = Utils.ArrayUtils.NonEmptyReadonly.mapWith((value: string) => value.toUpperCase())(
 *   nonEmptyArrayUtilsItems
 * );
 * void nonEmptyArrayUtilsMapped;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */

import { invariant } from "@beep/invariant";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
/**
 * Creates a `NonEmptyReadonlyArray` literal either from an existing array or a
 * variadic list of values without losing tuple inference.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 *
 * const statuses = ArrayUtils.NonEmptyReadonly.make("pending", "approved");
 *
 * @category Data/Array
 * @since 0.1.0
 */
export const make: {
  <const Value>(values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
  <const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
} = <const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value> => {
  return values;
};

type MapWith = ReturnType<
  typeof F.dual<
    <const Value, const MappedValue>(
      f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
    ) => (self: A.NonEmptyReadonlyArray<Value>) => A.NonEmptyReadonlyArray<MappedValue>,
    <const Value, const MappedValue>(
      self: A.NonEmptyReadonlyArray<Value>,
      f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
    ) => A.NonEmptyReadonlyArray<MappedValue>
  >
>;

/**
 * Applies a mapper across a non-empty array while preserving the output as a
 * non-empty array, exposing both curried and uncurried call signatures.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 *
 * const upper = ArrayUtils.NonEmptyReadonly.mapWith((value: string) => value.toUpperCase());
 * const result = upper(["a", "b"]);
 *
 * @category Data/Array
 * @since 0.1.0
 */
export const mapWith: MapWith = F.dual<
  <const Value, const MappedValue>(
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ) => (self: A.NonEmptyReadonlyArray<Value>) => A.NonEmptyReadonlyArray<MappedValue>,
  <const Value, const MappedValue>(
    self: A.NonEmptyReadonlyArray<Value>,
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ) => A.NonEmptyReadonlyArray<MappedValue>
>(
  2,
  <const Value, const MappedValue>(
    self: A.NonEmptyReadonlyArray<Value>,
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ): A.NonEmptyReadonlyArray<MappedValue> => {
    const headOption = A.head(self);
    const tailOption = A.tail(self);
    const head = O.getOrThrow(headOption);
    const tail = O.getOrThrow(tailOption);
    const mappedHead = f(head, 0, self);

    if (tail.length === 0) {
      return [mappedHead] as const;
    }

    const mappedTail = A.map(tail, (value, index) => f(value, index + 1, self));

    return [mappedHead, ...mappedTail] as const;
  }
);

/**
 * @category filtering
 * @since 2.0.0
 */
export const filter: {
  /**
   * @category filtering
   * @since 2.0.0
   */
  <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => A.NonEmptyReadonlyArray<B>;
  /**
   * @category filtering
   * @since 2.0.0
   */
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => A.NonEmptyReadonlyArray<A>;
  /**
   * @category filtering
   * @since 2.0.0
   */
  <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): A.NonEmptyReadonlyArray<B>;
  /**
   * @category filtering
   * @since 2.0.0
   */
  <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): A.NonEmptyReadonlyArray<A>;
} = F.dual(2, <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): A.NonEmptyReadonlyArray<A> => {
  const as = A.fromIterable(self);
  const out: Array<A> = [];
  for (let i = 0; i < as.length; i++) {
    if (predicate(as[i]!, i)) {
      out.push(as[i]!);
    }
  }
  invariant(A.isNonEmptyArray(out), "filtered array must be non-empty", {
    file: "@beep/utils/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts",
    line: 134,
    args: [out],
  });
  return out;
});

export const from = <T>(iterable: Iterable<T> | A.NonEmptyReadonlyArray<T>): A.NonEmptyReadonlyArray<T> => {
  const array = A.fromIterable(iterable);
  invariant(A.isNonEmptyArray(array), "array must be non-empty", {
    file: "@beep/utils/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts",
    line: 141,
    args: [array],
  });
  return array;
};

export const fromIterable = <A>(collection: Iterable<A>): A.NonEmptyReadonlyArray<A> => {
  const array = A.fromIterable(collection);
  invariant(A.isNonEmptyArray(array), "array must be non-empty", {
    file: "@beep/utils/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts",
    line: 141,
    args: [array],
  });
  return array;
};

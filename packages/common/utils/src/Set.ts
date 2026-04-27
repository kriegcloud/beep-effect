/**
 * Readonly Set utilities with custom equivalence support.
 *
 * @module
 * @since 0.0.0
 */

import * as A from "effect/Array";
import type * as Equivalence from "effect/Equivalence";
import { dual, identity } from "effect/Function";
import * as O from "effect/Option";
import type * as Order from "effect/Order";
import type * as P from "effect/Predicate";
import * as Result from "effect/Result";

/**
 * Mutable Set alias used when a helper intentionally returns a writable copy.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const values: Set.MutableSet<number> = new globalThis.Set([1, 2])
 * values.add(3)
 *
 * void values
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type MutableSet<A> = globalThis.Set<A>;

/**
 * Readonly Set alias used by the Set utility module.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const values: Set.Set<string> = new globalThis.Set(["beep"])
 *
 * void values
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Set<A> = ReadonlySet<A>;

/**
 * Shared empty readonly Set value.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const size = Set.empty.size
 *
 * void size
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const empty: Set<never> = new globalThis.Set<never>();

/**
 * Clone a mutable Set into a readonly Set.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const mutable = new globalThis.Set([1, 2])
 * const readonly = Set.fromMutable(mutable)
 *
 * void readonly
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function fromMutable<A>(self: MutableSet<A>): Set<A> {
  return new globalThis.Set(self);
}

/**
 * Clone a readonly Set into a mutable Set.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const readonly: Set.Set<number> = new globalThis.Set([1, 2])
 * const mutable = Set.toMutable(readonly)
 * mutable.add(3)
 *
 * void mutable
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function toMutable<A>(self: Set<A>): MutableSet<A> {
  return new globalThis.Set(self);
}

/**
 * Create a Set containing a single value.
 *
 * @example
 * ```ts
 * import { Set } from "@beep/utils"
 *
 * const value = Set.singleton("beep")
 *
 * void value
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function singleton<A>(value: A): Set<A> {
  return new globalThis.Set([value]);
}

/**
 * Create a Set from an array, deduplicating values with an equivalence.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const dataFirst = Set.fromArray([1, 1, 2], Equivalence.strictEqual<number>())
 * const dataLast = pipe([1, 2, 2], Set.fromArray(Equivalence.strictEqual<number>()))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromArray: {
  <A>(equivalence: Equivalence.Equivalence<A>): (self: ReadonlyArray<A>) => Set<A>;
  <A>(self: ReadonlyArray<A>, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(2, fromArray_);

/**
 * Convert a Set to a sorted readonly array.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Order from "effect/Order"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([3, 1, 2])
 * const dataFirst = Set.toArray(values, Order.Number)
 * const dataLast = pipe(values, Set.toArray(Order.Number))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const toArray: {
  <A>(order: Order.Order<A>): (self: Set<A>) => ReadonlyArray<A>;
  <A>(self: Set<A>, order: Order.Order<A>): ReadonlyArray<A>;
} = dual(2, toArray_);

/**
 * Find the first Set value that matches a predicate or refinement.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const dataFirst = Set.findFirst(values, (value) => value > 1)
 * const dataLast = pipe(values, Set.findFirst((value) => value > 2))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category elements
 * @since 0.0.0
 */
export const findFirst: {
  <A, B extends A>(refinement: P.Refinement<A, B>): (self: Set<A>) => O.Option<B>;
  <A>(predicate: P.Predicate<A>): (self: Set<A>) => O.Option<A>;
  <A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): O.Option<B>;
  <A>(self: Set<A>, predicate: P.Predicate<A>): O.Option<A>;
} = dual(2, findFirst_);

/**
 * Find and map the first Set value that returns `Option.some`.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as O from "effect/Option"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set(["a", "bb", "ccc"])
 * const dataFirst = Set.findFirstMap(values, (value) => value.length > 1 ? O.some(value.length) : O.none())
 * const dataLast = pipe(values, Set.findFirstMap((value) => value.length > 2 ? O.some(value) : O.none()))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category elements
 * @since 0.0.0
 */
export const findFirstMap: {
  <A, B>(f: (value: A) => O.Option<B>): (self: Set<A>) => O.Option<B>;
  <A, B>(self: Set<A>, f: (value: A) => O.Option<B>): O.Option<B>;
} = dual(2, findFirstMap_);

/**
 * Test whether at least one Set value satisfies a predicate.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const dataFirst = Set.some(values, (value) => value > 2)
 * const dataLast = pipe(values, Set.some((value) => value > 3))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const some: {
  <A>(predicate: P.Predicate<A>): (self: Set<A>) => boolean;
  <A>(self: Set<A>, predicate: P.Predicate<A>): boolean;
} = dual(2, <A>(self: Set<A>, predicate: P.Predicate<A>): boolean => A.some(A.fromIterable(self), predicate));

/**
 * Test whether every Set value satisfies a predicate.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const dataFirst = Set.every(values, (value) => value > 0)
 * const dataLast = pipe(values, Set.every((value) => value < 4))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const every: {
  <A>(predicate: P.Predicate<A>): (self: Set<A>) => boolean;
  <A>(self: Set<A>, predicate: P.Predicate<A>): boolean;
} = dual(2, <A>(self: Set<A>, predicate: P.Predicate<A>): boolean => A.every(A.fromIterable(self), predicate));

/**
 * Test whether a value is equivalent to an element in the Set.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set(["a", "b"])
 * const eq = Equivalence.strictEqual<string>()
 * const dataFirst = Set.elem(values, "a", eq)
 * const dataLast = pipe(values, Set.elem("c", eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const elem: {
  <A>(value: NoInfer<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => boolean;
  <A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): boolean;
} = dual(3, elem_);

/**
 * Test whether every value in one Set is present in another Set.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const left = new globalThis.Set([1, 2])
 * const right = new globalThis.Set([1, 2, 3])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.isSubset(left, right, eq)
 * const dataLast = pipe(left, Set.isSubset(right, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isSubset: {
  <A>(that: Set<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => boolean;
  <A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): boolean;
} = dual(3, isSubset_);

/**
 * Keep values that satisfy a predicate or refinement.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const dataFirst = Set.filter(values, (value) => value > 1)
 * const dataLast = pipe(values, Set.filter((value) => value < 3))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const filter: {
  <A, B extends A>(refinement: P.Refinement<A, B>): (self: Set<A>) => Set<B>;
  <A>(predicate: P.Predicate<A>): (self: Set<A>) => Set<A>;
  <A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): Set<B>;
  <A>(self: Set<A>, predicate: P.Predicate<A>): Set<A>;
} = dual(2, filter_);

/**
 * Split values by a predicate or refinement into excluded and included Sets.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3, 4])
 * const dataFirst = Set.partition(values, (value) => value % 2 === 0)
 * const dataLast = pipe(values, Set.partition((value) => value > 2))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const partition: {
  <A, B extends A>(refinement: P.Refinement<A, B>): (self: Set<A>) => readonly [Set<A>, Set<B>];
  <A>(predicate: P.Predicate<A>): (self: Set<A>) => readonly [Set<A>, Set<A>];
  <A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): readonly [Set<A>, Set<B>];
  <A>(self: Set<A>, predicate: P.Predicate<A>): readonly [Set<A>, Set<A>];
} = dual(2, partition_);

/**
 * Map Set values while deduplicating mapped values with an equivalence.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set(["a", "bb", "cc"])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.map(values, (value) => value.length, eq)
 * const dataLast = pipe(values, Set.map((value) => value.length + 1, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const map: {
  <A, B>(f: (value: A) => B, equivalence: Equivalence.Equivalence<B>): (self: Set<A>) => Set<B>;
  <A, B>(self: Set<A>, f: (value: A) => B, equivalence: Equivalence.Equivalence<B>): Set<B>;
} = dual(3, map_);

/**
 * Flat-map Set values while deduplicating flattened values with an equivalence.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.chain(values, (value) => new globalThis.Set([value, value + 1]), eq)
 * const dataLast = pipe(values, Set.chain((value) => new globalThis.Set([value * 2]), eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const chain: {
  <A, B>(f: (value: A) => Set<B>, equivalence: Equivalence.Equivalence<B>): (self: Set<A>) => Set<B>;
  <A, B>(self: Set<A>, f: (value: A) => Set<B>, equivalence: Equivalence.Equivalence<B>): Set<B>;
} = dual(3, chain_);

/**
 * Map Set values to `Option` and keep the present mapped values.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import * as O from "effect/Option"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.filterMap(values, (value) => value > 1 ? O.some(value * 2) : O.none(), eq)
 * const dataLast = pipe(values, Set.filterMap((value) => value > 2 ? O.some(value) : O.none(), eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const filterMap: {
  <A, B>(f: (value: A) => O.Option<B>, equivalence: Equivalence.Equivalence<B>): (self: Set<A>) => Set<B>;
  <A, B>(self: Set<A>, f: (value: A) => O.Option<B>, equivalence: Equivalence.Equivalence<B>): Set<B>;
} = dual(3, filterMap_);

/**
 * Remove `Option.none` values and unwrap present values.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import * as O from "effect/Option"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([O.some(1), O.none(), O.some(1)])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.compact(values, eq)
 * const dataLast = pipe(values, Set.compact(eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const compact: {
  <A>(equivalence: Equivalence.Equivalence<A>): (self: Set<O.Option<A>>) => Set<A>;
  <A>(self: Set<O.Option<A>>, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(2, compact_);

/**
 * Split `Result` values into failures and successes.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import * as Result from "effect/Result"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([Result.fail("missing"), Result.succeed(1)])
 * const dataFirst = Set.separate(values, Equivalence.strictEqual<string>(), Equivalence.strictEqual<number>())
 * const dataLast = pipe(values, Set.separate(Equivalence.strictEqual<string>(), Equivalence.strictEqual<number>()))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const separate: {
  <E, A>(
    failureEquivalence: Equivalence.Equivalence<E>,
    successEquivalence: Equivalence.Equivalence<A>
  ): (self: Set<Result.Result<A, E>>) => readonly [Set<E>, Set<A>];
  <E, A>(
    self: Set<Result.Result<A, E>>,
    failureEquivalence: Equivalence.Equivalence<E>,
    successEquivalence: Equivalence.Equivalence<A>
  ): readonly [Set<E>, Set<A>];
} = dual(3, separate_);

/**
 * Partition values with a function returning `Result`.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import * as Result from "effect/Result"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const split = (value: number) => value % 2 === 0 ? Result.succeed(value) : Result.fail(`${value}`)
 * const dataFirst = Set.partitionMap(values, split, Equivalence.strictEqual<string>(), Equivalence.strictEqual<number>())
 * const dataLast = pipe(values, Set.partitionMap(split, Equivalence.strictEqual<string>(), Equivalence.strictEqual<number>()))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const partitionMap: {
  <A, E, B>(
    f: (value: A) => Result.Result<B, E>,
    failureEquivalence: Equivalence.Equivalence<E>,
    successEquivalence: Equivalence.Equivalence<B>
  ): (self: Set<A>) => readonly [Set<E>, Set<B>];
  <A, E, B>(
    self: Set<A>,
    f: (value: A) => Result.Result<B, E>,
    failureEquivalence: Equivalence.Equivalence<E>,
    successEquivalence: Equivalence.Equivalence<B>
  ): readonly [Set<E>, Set<B>];
} = dual(4, partitionMap_);

/**
 * Keep values that are present in both Sets.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const left = new globalThis.Set([1, 2])
 * const right = new globalThis.Set([2, 3])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.intersection(left, right, eq)
 * const dataLast = pipe(left, Set.intersection(right, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const intersection: {
  <A>(that: Set<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, intersection_);

/**
 * Keep values from the first Set that are absent from the second Set.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const left = new globalThis.Set([1, 2, 3])
 * const right = new globalThis.Set([2])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.difference(left, right, eq)
 * const dataLast = pipe(left, Set.difference(right, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const difference: {
  <A>(that: Set<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, difference_);

/**
 * Combine two Sets while deduplicating with an equivalence.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const left = new globalThis.Set([1, 2])
 * const right = new globalThis.Set([2, 3])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.union(left, right, eq)
 * const dataLast = pipe(left, Set.union(right, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const union: {
  <A>(that: Set<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, union_);

/**
 * Insert a value when an equivalent value is not already present.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.insert(values, 3, eq)
 * const dataLast = pipe(values, Set.insert(4, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const insert: {
  <A>(value: NoInfer<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, insert_);

/**
 * Remove values equivalent to the provided value.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2, 3])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.remove(values, 2, eq)
 * const dataLast = pipe(values, Set.remove(3, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category filtering
 * @since 0.0.0
 */
export const remove: {
  <A>(value: NoInfer<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, remove_);

/**
 * Remove a present value or insert an absent value.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([1, 2])
 * const eq = Equivalence.strictEqual<number>()
 * const dataFirst = Set.toggle(values, 2, eq)
 * const dataLast = pipe(values, Set.toggle(3, eq))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const toggle: {
  <A>(value: NoInfer<A>, equivalence: Equivalence.Equivalence<A>): (self: Set<A>) => Set<A>;
  <A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A>;
} = dual(3, toggle_);

/**
 * Reduce Set values in sorted order.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import * as Order from "effect/Order"
 * import { Set } from "@beep/utils"
 *
 * const values = new globalThis.Set([3, 1, 2])
 * const dataFirst = Set.reduce(values, "", (out, value) => `${out}${value}`, Order.Number)
 * const dataLast = pipe(values, Set.reduce("", (out, value) => `${out}${value}`, Order.Number))
 *
 * void dataFirst
 * void dataLast
 * ```
 *
 * @category folding
 * @since 0.0.0
 */
export const reduce: {
  <A, B>(initial: B, f: (accumulator: B, value: A) => B, order: Order.Order<A>): (self: Set<A>) => B;
  <A, B>(self: Set<A>, initial: B, f: (accumulator: B, value: A) => B, order: Order.Order<A>): B;
} = dual(4, reduce_);

/**
 * Bound Set helpers for one ordered/equivalent value domain.
 *
 * @example
 * ```ts
 * import * as Order from "effect/Order"
 * import { Set } from "@beep/utils"
 *
 * const numbers = Set.make(Order.Number)
 * const values = numbers.fromArray([2, 1, 2])
 * const withThree = numbers.insert(values, 3)
 *
 * void withThree
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface SetSchemaExtensions<A> {
  readonly concat: {
    (values: Iterable<A>): (self: Set<A>) => Set<A>;
    (self: Set<A>, values: Iterable<A>): Set<A>;
  };
  readonly difference: {
    (that: Set<A>): (self: Set<A>) => Set<A>;
    (self: Set<A>, that: Set<A>): Set<A>;
  };
  readonly elem: {
    (value: A): (self: Set<A>) => boolean;
    (self: Set<A>, value: A): boolean;
  };
  readonly empty: () => Set<A>;
  readonly filter: {
    <B extends A>(refinement: P.Refinement<A, B>): (self: Set<A>) => Set<B>;
    (predicate: P.Predicate<A>): (self: Set<A>) => Set<A>;
    <B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): Set<B>;
    (self: Set<A>, predicate: P.Predicate<A>): Set<A>;
  };
  readonly filterMap: {
    (f: (value: A) => O.Option<A>): (self: Set<A>) => Set<A>;
    (self: Set<A>, f: (value: A) => O.Option<A>): Set<A>;
  };
  readonly from: (values: Iterable<A>) => Set<A>;
  readonly fromArray: (values: ReadonlyArray<A>) => Set<A>;
  readonly insert: {
    (value: A): (self: Set<A>) => Set<A>;
    (self: Set<A>, value: A): Set<A>;
  };
  readonly intersection: {
    (that: Set<A>): (self: Set<A>) => Set<A>;
    (self: Set<A>, that: Set<A>): Set<A>;
  };
  readonly isSubset: {
    (that: Set<A>): (self: Set<A>) => boolean;
    (self: Set<A>, that: Set<A>): boolean;
  };
  readonly map: {
    (f: (value: A) => A): (self: Set<A>) => Set<A>;
    (self: Set<A>, f: (value: A) => A): Set<A>;
  };
  readonly reduce: {
    <B>(initial: B, f: (accumulator: B, value: A) => B): (self: Set<A>) => B;
    <B>(self: Set<A>, initial: B, f: (accumulator: B, value: A) => B): B;
  };
  readonly remove: {
    (value: A): (self: Set<A>) => Set<A>;
    (self: Set<A>, value: A): Set<A>;
  };
  readonly replace: {
    (value: A): (self: Set<A>) => Set<A>;
    (self: Set<A>, value: A): Set<A>;
  };
  readonly toArray: (self: Set<A>) => ReadonlyArray<A>;
  readonly toggle: {
    (value: A): (self: Set<A>) => Set<A>;
    (self: Set<A>, value: A): Set<A>;
  };
  readonly union: {
    (that: Set<A>): (self: Set<A>) => Set<A>;
    (self: Set<A>, that: Set<A>): Set<A>;
  };
}

/**
 * Create bound Set helpers from an order and optional equivalence.
 *
 * When an equivalence is omitted, equality is derived from the order by
 * considering values equivalent when comparison returns `0`.
 *
 * @example
 * ```ts
 * import * as Order from "effect/Order"
 * import { Set } from "@beep/utils"
 *
 * const numbers = Set.make(Order.Number)
 * const values = numbers.from([3, 1, 2])
 * const sorted = numbers.toArray(values)
 *
 * void sorted
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make: <A>(order: Order.Order<A>, equivalence?: Equivalence.Equivalence<A>) => SetSchemaExtensions<A> =
  make_;

/** @internal */
function fromArray_<A>(self: ReadonlyArray<A>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  const out = new globalThis.Set<A>();

  for (const value of self) {
    if (!elem_(out, value, equivalence)) {
      out.add(value);
    }
  }

  return out;
}

/** @internal */
function toArray_<A>(self: Set<A>, order: Order.Order<A>): ReadonlyArray<A> {
  return A.sort(A.fromIterable(self), order);
}

/** @internal */
function findFirst_<A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): O.Option<B>;
function findFirst_<A>(self: Set<A>, predicate: P.Predicate<A>): O.Option<A>;
function findFirst_<A>(self: Set<A>, predicate: P.Predicate<A>): O.Option<A> {
  return A.findFirst(self, predicate);
}

/** @internal */
function findFirstMap_<A, B>(self: Set<A>, f: (value: A) => O.Option<B>): O.Option<B> {
  return A.findFirst(self, f);
}

/** @internal */
function elem_<A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): boolean {
  for (const item of self) {
    if (equivalence(value, item)) {
      return true;
    }
  }

  return false;
}

/** @internal */
function isSubset_<A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): boolean {
  return every(self, (value) => elem_(that, value, equivalence));
}

/** @internal */
function filter_<A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): Set<B>;
function filter_<A>(self: Set<A>, predicate: P.Predicate<A>): Set<A>;
function filter_<A>(self: Set<A>, predicate: P.Predicate<A>): Set<A> {
  const out = new globalThis.Set<A>();

  for (const value of self) {
    if (predicate(value)) {
      out.add(value);
    }
  }

  return out;
}

/** @internal */
function partition_<A, B extends A>(self: Set<A>, refinement: P.Refinement<A, B>): readonly [Set<A>, Set<B>];
function partition_<A>(self: Set<A>, predicate: P.Predicate<A>): readonly [Set<A>, Set<A>];
function partition_<A>(self: Set<A>, predicate: P.Predicate<A>): readonly [Set<A>, Set<A>] {
  const excluded = new globalThis.Set<A>();
  const included = new globalThis.Set<A>();

  for (const value of self) {
    if (predicate(value)) {
      included.add(value);
    } else {
      excluded.add(value);
    }
  }

  return [excluded, included];
}

/** @internal */
function map_<A, B>(self: Set<A>, f: (value: A) => B, equivalence: Equivalence.Equivalence<B>): Set<B> {
  const out = new globalThis.Set<B>();

  for (const value of self) {
    const mapped = f(value);

    if (!elem_(out, mapped, equivalence)) {
      out.add(mapped);
    }
  }

  return out;
}

/** @internal */
function chain_<A, B>(self: Set<A>, f: (value: A) => Set<B>, equivalence: Equivalence.Equivalence<B>): Set<B> {
  const out = new globalThis.Set<B>();

  for (const value of self) {
    for (const mapped of f(value)) {
      if (!elem_(out, mapped, equivalence)) {
        out.add(mapped);
      }
    }
  }

  return out;
}

/** @internal */
function filterMap_<A, B>(self: Set<A>, f: (value: A) => O.Option<B>, equivalence: Equivalence.Equivalence<B>): Set<B> {
  const out = new globalThis.Set<B>();

  for (const value of self) {
    O.match(f(value), {
      onNone: () => undefined,
      onSome: (mapped) => {
        if (!elem_(out, mapped, equivalence)) {
          out.add(mapped);
        }
      },
    });
  }

  return out;
}

/** @internal */
function compact_<A>(self: Set<O.Option<A>>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return filterMap_(self, identity, equivalence);
}

/** @internal */
function partitionMap_<A, E, B>(
  self: Set<A>,
  f: (value: A) => Result.Result<B, E>,
  failureEquivalence: Equivalence.Equivalence<E>,
  successEquivalence: Equivalence.Equivalence<B>
): readonly [Set<E>, Set<B>] {
  const failures = new globalThis.Set<E>();
  const successes = new globalThis.Set<B>();

  for (const value of self) {
    Result.match(f(value), {
      onFailure: (failure) => {
        if (!elem_(failures, failure, failureEquivalence)) {
          failures.add(failure);
        }
      },
      onSuccess: (success) => {
        if (!elem_(successes, success, successEquivalence)) {
          successes.add(success);
        }
      },
    });
  }

  return [failures, successes];
}

/** @internal */
function separate_<E, A>(
  self: Set<Result.Result<A, E>>,
  failureEquivalence: Equivalence.Equivalence<E>,
  successEquivalence: Equivalence.Equivalence<A>
): readonly [Set<E>, Set<A>] {
  return partitionMap_(self, identity, failureEquivalence, successEquivalence);
}

/** @internal */
function intersection_<A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return filter_(self, (value) => elem_(that, value, equivalence));
}

/** @internal */
function difference_<A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return filter_(self, (value) => !elem_(that, value, equivalence));
}

/** @internal */
function union_<A>(self: Set<A>, that: Set<A>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  const out = new globalThis.Set(self);

  for (const value of that) {
    if (!elem_(out, value, equivalence)) {
      out.add(value);
    }
  }

  return out;
}

/** @internal */
function insert_<A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A> {
  if (elem_(self, value, equivalence)) {
    return self;
  }

  const out = new globalThis.Set(self);
  out.add(value);
  return out;
}

/** @internal */
function remove_<A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return filter_(self, (item) => !equivalence(value, item));
}

/** @internal */
function toggle_<A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return elem_(self, value, equivalence) ? remove_(self, value, equivalence) : insert_(self, value, equivalence);
}

/** @internal */
function reduce_<A, B>(self: Set<A>, initial: B, f: (accumulator: B, value: A) => B, order: Order.Order<A>): B {
  return A.reduce(toArray_(self, order), initial, f);
}

/** @internal */
function concat_<A>(self: Set<A>, values: Iterable<A>, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return union_(self, fromArray_(A.fromIterable(values), equivalence), equivalence);
}

/** @internal */
function replace_<A>(self: Set<A>, value: A, equivalence: Equivalence.Equivalence<A>): Set<A> {
  return insert_(remove_(self, value, equivalence), value, equivalence);
}

/** @internal */
function make_<A>(order: Order.Order<A>, equivalence?: Equivalence.Equivalence<A>): SetSchemaExtensions<A> {
  const eq: Equivalence.Equivalence<A> = equivalence ?? ((self, that) => order(self, that) === 0);

  return {
    empty: () => new globalThis.Set<A>(),
    from: (values) => fromArray_(A.fromIterable(values), eq),
    fromArray: (values) => fromArray_(values, eq),
    toArray: (self) => toArray_(self, order),
    elem: dual(2, (self: Set<A>, value: A): boolean => elem_(self, value, eq)),
    isSubset: dual(2, (self: Set<A>, that: Set<A>): boolean => isSubset_(self, that, eq)),
    insert: dual(2, (self: Set<A>, value: A): Set<A> => insert_(self, value, eq)),
    remove: dual(2, (self: Set<A>, value: A): Set<A> => remove_(self, value, eq)),
    toggle: dual(2, (self: Set<A>, value: A): Set<A> => toggle_(self, value, eq)),
    replace: dual(2, (self: Set<A>, value: A): Set<A> => replace_(self, value, eq)),
    concat: dual(2, (self: Set<A>, values: Iterable<A>): Set<A> => concat_(self, values, eq)),
    union: dual(2, (self: Set<A>, that: Set<A>): Set<A> => union_(self, that, eq)),
    intersection: dual(2, (self: Set<A>, that: Set<A>): Set<A> => intersection_(self, that, eq)),
    difference: dual(2, (self: Set<A>, that: Set<A>): Set<A> => difference_(self, that, eq)),
    map: dual(2, (self: Set<A>, f: (value: A) => A): Set<A> => map_(self, f, eq)),
    filter: dual(2, filter_),
    filterMap: dual(2, (self: Set<A>, f: (value: A) => O.Option<A>): Set<A> => filterMap_(self, f, eq)),
    reduce: dual(
      3,
      <B>(self: Set<A>, initial: B, f: (accumulator: B, value: A) => B): B => reduce_(self, initial, f, order)
    ),
  };
}

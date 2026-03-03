import type { TUnsafe } from "@beep/types";
import { Function as Fn, String as Str } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

type Depth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type PreviousDepth = {
  0: 0;
  1: 0;
  2: 1;
  3: 2;
  4: 3;
  5: 4;
  6: 5;
  7: 6;
  8: 7;
  9: 8;
  10: 9;
};
type IsAny<T> = 0 extends 1 & T ? true : false;
type HasIndexSignature<T extends object> = string extends keyof T ? true : number extends keyof T ? true : false;
type StringKeys<T extends object> = Extract<keyof T, string>;
type DescendTarget<T> = Extract<NonNullable<T>, object>;
type Prepend<Head extends string, Tail extends ReadonlyArray<string>> = readonly [Head, ...Tail];
type CanDescend<T> = [DescendTarget<T>] extends [never]
  ? false
  : DescendTarget<T> extends (...args: ReadonlyArray<unknown>) => unknown
    ? false
    : DescendTarget<T> extends readonly unknown[]
      ? false
      : true;

/**
 * Dot-delimited key paths for a struct with fixed keys.
 *
 * - Rejects open index-signature records like `Record<string, any>`.
 * - Stops recursion at arrays, functions, and primitive leaves.
 * - Uses a bounded depth to avoid runaway type instantiation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StructPath<S extends object, MaxDepth extends Depth = 6> =
  IsAny<S> extends true
    ? never
    : HasIndexSignature<S> extends true
      ? never
      : {
          [K in StringKeys<S>]: CanDescend<S[K]> extends true
            ? MaxDepth extends 0
              ? K
              : K | `${K}.${StructPath<DescendTarget<S[K]>, PreviousDepth[MaxDepth]>}`
            : K;
        }[StringKeys<S>];

/**
 * Tuple key paths for a struct with fixed keys.
 *
 * Prefer this form when keys may contain `.` characters.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StructPathTuple<S extends object, MaxDepth extends Depth = 6> =
  IsAny<S> extends true
    ? never
    : HasIndexSignature<S> extends true
      ? never
      : {
          [K in StringKeys<S>]: CanDescend<S[K]> extends true
            ? MaxDepth extends 0
              ? readonly [K]
              : readonly [K] | Prepend<K, StructPathTuple<DescendTarget<S[K]>, PreviousDepth[MaxDepth]>>
            : readonly [K];
        }[StringKeys<S>];

/**
 * Resolves the value type at a dot-delimited {@link StructPath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StructPathValue<S, P extends string> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof S
    ? StructPathValue<NonNullable<S[Head]>, Tail> | (undefined extends S[Head] ? undefined : never)
    : never
  : P extends keyof S
    ? S[P]
    : never;

/**
 * Resolves the value type at a tuple {@link StructPathTuple}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StructPathTupleValue<S, P extends ReadonlyArray<string>> = P extends readonly [
  infer Head extends string,
  ...infer Tail extends ReadonlyArray<string>,
]
  ? Head extends keyof S
    ? Tail extends []
      ? S[Head]
      : StructPathTupleValue<NonNullable<S[Head]>, Tail> | (undefined extends S[Head] ? undefined : never)
    : never
  : never;

type StructForPath<S extends object, P extends string> = P extends StructPath<S> ? S : never;
type StructValueForPath<S extends object, P extends string> = P extends StructPath<S> ? StructPathValue<S, P> : never;
type StructForPathTuple<S extends object, P extends ReadonlyArray<string>> = P extends StructPathTuple<S> ? S : never;
type StructValueForPathTuple<S extends object, P extends ReadonlyArray<string>> =
  P extends StructPathTuple<S> ? StructPathTupleValue<S, P> : never;
type PathInput = string | ReadonlyArray<string>;
type PathLookup =
  | {
      readonly found: false;
    }
  | {
      readonly found: true;
      readonly value: unknown;
    };

const hasOwn = Object.prototype.hasOwnProperty;

const normalizePath = (path: PathInput): ReadonlyArray<string> => (P.isString(path) ? Str.split(path, ".") : path);

const lookupAtPath = (self: unknown, path: PathInput): PathLookup => {
  const parts = normalizePath(path);
  if (parts.length === 0) {
    return { found: false };
  }

  let current: unknown = self;

  for (const part of parts) {
    if (part.length === 0) {
      return { found: false };
    }

    if (P.isNullish(current)) {
      return { found: false };
    }
    if (P.not(P.isObject)(current) && P.not(P.isFunction)(current)) {
      return { found: false };
    }

    const record = Fn.coerceUnsafe<unknown, Record<string, unknown>>(current);
    if (!hasOwn.call(record, part)) {
      return { found: false };
    }

    current = record[part];
  }

  return {
    found: true,
    value: current,
  };
};

/**
 * Retrieves a value from a struct by a path.
 *
 * Supports a dual API:
 * - Data-last: `dotGet("attributes.name")(self)`
 * - Data-first: `dotGet(self, "attributes.name")`
 * - Tuple paths: `dotGet(["attributes", "name"] as const)(self)`
 *
 * @since 0.0.0
 * @category Utility
 */
export const dotGet: {
  <const P extends string>(path: P): <S extends object>(self: StructForPath<S, P>) => StructValueForPath<S, P>;
  <const P extends ReadonlyArray<string>>(
    path: P
  ): <S extends object>(self: StructForPathTuple<S, P>) => StructValueForPathTuple<S, P>;
  <S extends object, const P extends StructPath<S>>(self: S, path: P): StructPathValue<S, P>;
  <S extends object, const P extends StructPathTuple<S>>(self: S, path: P): StructPathTupleValue<S, P>;
} = Fn.dual(2, <S extends object>(self: S, path: PathInput): unknown => {
  const lookup = lookupAtPath(self, path);
  return lookup.found ? lookup.value : undefined;
}) as {
  <const P extends string>(path: P): <S extends object>(self: StructForPath<S, P>) => StructValueForPath<S, P>;
  <const P extends ReadonlyArray<string>>(
    path: P
  ): <S extends object>(self: StructForPathTuple<S, P>) => StructValueForPathTuple<S, P>;
  <S extends object, const P extends StructPath<S>>(self: S, path: P): StructPathValue<S, P>;
  <S extends object, const P extends StructPathTuple<S>>(self: S, path: P): StructPathTupleValue<S, P>;
};

/**
 * Retrieves a value as an `Option` by a path.
 *
 * Missing paths return `O.none()`. Existing paths always return
 * `O.some(value)`, including `value === undefined`.
 *
 * @since 0.0.0
 * @category Utility
 */
export const dotGetOption: {
  <const P extends string>(
    path: P
  ): <S extends object>(self: StructForPath<S, P>) => O.Option<StructValueForPath<S, P>>;
  <const P extends ReadonlyArray<string>>(
    path: P
  ): <S extends object>(self: StructForPathTuple<S, P>) => O.Option<StructValueForPathTuple<S, P>>;
  <S extends object, const P extends StructPath<S>>(self: S, path: P): O.Option<StructPathValue<S, P>>;
  <S extends object, const P extends StructPathTuple<S>>(self: S, path: P): O.Option<StructPathTupleValue<S, P>>;
} = Fn.dual(2, <S extends object>(self: S, path: PathInput): O.Option<unknown> => {
  const lookup = lookupAtPath(self, path);
  return lookup.found ? O.some(lookup.value) : O.none();
}) as {
  <const P extends string>(
    path: P
  ): <S extends object>(self: StructForPath<S, P>) => O.Option<StructValueForPath<S, P>>;
  <const P extends ReadonlyArray<string>>(
    path: P
  ): <S extends object>(self: StructForPathTuple<S, P>) => O.Option<StructValueForPathTuple<S, P>>;
  <S extends object, const P extends StructPath<S>>(self: S, path: P): O.Option<StructPathValue<S, P>>;
  <S extends object, const P extends StructPathTuple<S>>(self: S, path: P): O.Option<StructPathTupleValue<S, P>>;
};
// bench

/**
 * Retrieves the entries (key-value pairs) of an object, where keys are strings,
 * in a type-safe manner. Symbol keys are excluded from the result.
 *
 * @example
 * ```ts-morph
 * import * as assert from "node:assert"
 * import * as Struct from "@beep/utils/Struct"
 *
 * const c = Symbol("c")
 * const value = { a: "foo", b: 1, [c]: true }
 *
 * const entries: Array<["a" | "b", string | number]> = Struct.entries(value)
 *
 * assert.deepStrictEqual(entries, [["a", "foo"], ["b", 1]])
 * ```
 *
 * @since 3.17.0
 */
export const entries = <const R>(obj: R): Array<[keyof R & string, R[keyof R & string]]> =>
  Object.entries(obj as TUnsafe.Any) as TUnsafe.Any;

/**
 * Re-exports all `Struct` helpers from Effect.
 *
 * @since 0.0.0
 */
export * from "effect/Struct";

/**
 * Struct shape accepted by {@link reverse}.
 *
 * @since 0.1.0
 * @category DomainModel
 */
export interface ReverseableStruct {
  readonly [key: string]: PropertyKey;
  readonly [key: symbol]: PropertyKey;
}

/**
 * Type-level inversion of a struct where each value becomes a key.
 *
 * When multiple keys share the same value, the reversed key type is the union
 * of all matching original keys.
 *
 * @example
 * import type { ReverseStruct } from "@beep/utils/Struct";
 *
 * type Direction = ReverseStruct<{ readonly up: "north"; readonly down: "south" }>;
 * let example!: Direction;
 * void example;
 *
 * @category DomainModel
 * @since 0.1.0
 */
export type ReverseStruct<T extends ReverseableStruct> = {
  readonly [P in T[keyof T]]: {
    readonly [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
};

/**
 * Reverses a struct mapping, producing a new struct where original values
 * become keys and original keys become values.
 *
 * Supports a dual API:
 * - Data-last: `reverse()(self)`
 * - Data-first: `reverse(self)`
 *
 * When duplicate values exist, the last encountered key wins at runtime.
 *
 * @example
 * import { Struct } from "@beep/utils";
 *
 * const ErrorCode = {
 *   SUCCESSFUL_COMPLETION: "00000",
 *   WARNING: "01000",
 * } as const;
 *
 * const reversed = Struct.reverse(ErrorCode);
 *
 * reversed["00000"]; // "SUCCESSFUL_COMPLETION"
 * ErrorCode[reversed[ErrorCode.SUCCESSFUL_COMPLETION]]; // "00000"
 *
 * @since 0.1.0
 * @category DomainModel
 */
export const reverse: {
  <S extends ReverseableStruct>(): (self: S) => ReverseStruct<S>;
  <S extends ReverseableStruct>(self: S): ReverseStruct<S>;
} = Fn.dual(
  (args) => args.length === 1,
  <S extends ReverseableStruct>(self: S): ReverseStruct<S> => {
    const out: Record<PropertyKey, PropertyKey> = {};

    for (const [key, value] of entries(self)) {
      out[value] = key;
    }
    for (const key of Object.getOwnPropertySymbols(self)) {
      out[self[key]] = key;
    }

    return Fn.coerceUnsafe<Record<PropertyKey, PropertyKey>, ReverseStruct<S>>(out);
  }
);

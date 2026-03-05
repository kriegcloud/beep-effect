import type { TUnsafe } from "@beep/types";
import { Function as Fn, String as Str } from "effect";
import type * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type { Get, Paths, Simplify } from "type-fest";

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
    if (!P.isObject(current) && !Array.isArray(current) && !P.isFunction(current)) {
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
 * Uses type-fest `Paths` for path validation and `Get` for value resolution.
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
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => Get<S, P>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Get<S, P>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Get<S, P>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Get<S, P>;
} = Fn.dual(2, <S extends object>(self: S, path: PathInput): unknown => {
  const lookup = lookupAtPath(self, path);
  return lookup.found ? lookup.value : undefined;
}) as {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => Get<S, P>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Get<S, P>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Get<S, P>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Get<S, P>;
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
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<Get<S, P>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<Get<S, P>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<Get<S, P>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<Get<S, P>>;
} = Fn.dual(2, <S extends object>(self: S, path: PathInput): O.Option<unknown> => {
  const lookup = lookupAtPath(self, path);
  return lookup.found ? O.some(lookup.value) : O.none();
}) as {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<Get<S, P>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<Get<S, P>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<Get<S, P>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<Get<S, P>>;
};
// bench

/**
 * Returns all type-level `Paths` of a struct as a `NonEmptyReadonlyArray` of literal strings.
 *
 * Recursively walks the object at runtime, collecting every dot-delimited path
 * that `Paths<S>` would generate at the type level.
 *
 * @since 0.2.0
 * @category Utility
 */
export const pathsOf = <const S extends object>(obj: S): A.NonEmptyReadonlyArray<Extract<Paths<S>, string>> => {
  const result: Array<string> = [];
  const walk = (current: unknown, prefix: string): void => {
    if (P.isNullish(current) || !P.isObject(current)) return;
    for (const key of Object.keys(current as object)) {
      const path = prefix ? `${prefix}.${key}` : key;
      result.push(path);
      walk((current as Record<string, unknown>)[key], path);
    }
  };
  walk(obj, "");
  return result as TUnsafe.Any;
};

/**
 * A single `[key, value]` pair for a string key of `T`, preserving per-key correlation.
 *
 * @since 0.2.0
 * @category DomainModel
 */
export type StringKeyEntry<T> = { [K in keyof T & string]: [K, T[K]] }[keyof T & string];

/**
 * An array of `[key, value]` pairs for all string keys of `T`, preserving per-key correlation.
 *
 * Unlike type-fest's `Entries<T>`, this narrows each entry so that the value type
 * is correlated with its key — `["a", string] | ["b", number]` rather than
 * `["a" | "b", string | number]`.
 *
 * @since 0.2.0
 * @category DomainModel
 */
export type StringKeyEntries<T> = Array<StringKeyEntry<T>>;

/**
 * Retrieves the entries (key-value pairs) of an object, where keys are strings,
 * in a type-safe manner. Symbol keys are excluded from the result.
 *
 * Each entry preserves per-key correlation: for `{ a: string; b: number }`,
 * the return type is `Array<["a", string] | ["b", number]>` rather than
 * `Array<["a" | "b", string | number]>`.
 *
 * @example
 * ```ts-morph
 * import * as assert from "node:assert"
 * import * as Struct from "@beep/utils/Struct"
 *
 * const c = Symbol("c")
 * const value = { a: "foo", b: 1, [c]: true }
 *
 * const entries: Array<["a", string] | ["b", number]> = Struct.entries(value)
 *
 * assert.deepStrictEqual(entries, [["a", "foo"], ["b", 1]])
 * ```
 *
 * @since 3.17.0
 */
export const entries = <const R>(obj: R): StringKeyEntries<R> => Object.entries(obj as TUnsafe.Any) as TUnsafe.Any;

/**
 * Returns the string keys of an object in a type-safe manner.
 *
 * @since 0.2.0
 * @category Utility
 */
export const keys = <const R extends object>(obj: R): Array<keyof R & string> => Object.keys(obj) as TUnsafe.Any;

/**
 * Type-safe `Object.fromEntries` that preserves per-key value types.
 *
 * Accepts an iterable of `[key, value]` pairs and produces an object
 * whose type is the simplified union of all entries.
 *
 * @since 0.2.0
 * @category Utility
 */
export const fromEntries = <const E extends readonly [PropertyKey, unknown]>(
  entries: Iterable<E>
): Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }> => Object.fromEntries(entries) as TUnsafe.Any;

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

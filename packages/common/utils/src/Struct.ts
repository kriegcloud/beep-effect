/**
 * Struct helpers for typed paths, entries, keys, and reverse mappings.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UtilsId } from "@beep/identity/packages";
import { Struct as EffectStruct, Match, pipe } from "effect";
import { cast, dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { Get, Paths, Simplify } from "type-fest";
import * as A from "./Array.ts";
import type { PathLookup as InternalPathLookup, PathInput } from "./internal/StructPath.ts";
import { lookupAtPath, unsafeDotGet } from "./internal/StructPath.ts";

const $I = $UtilsId.create("Struct");

type NonEmptyStringKeyStruct<R extends object> = [keyof R & string] extends [never] ? never : R;

const NonEmptyStringKeys = S.NonEmptyArray(S.String);

/**
 * Thrown when a struct expected to have at least one string key is empty.
 *
 * @example
 * ```ts
 * import { EmptyStructError } from "@beep/utils/Struct"
 *
 * const error = EmptyStructError
 * void error
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export class EmptyStructError extends S.TaggedErrorClass<EmptyStructError>($I`EmptyStructError`)(
  "EmptyStructError",
  {
    input: S.Unknown,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("EmptyStructError", {
    description: "Invariant violation thrown when a struct expected to have at least one string key is empty.",
  })
) {}

function assertStructHasStringKeys<T extends string>(
  input: Array<T>,
  source: object
): asserts input is A.NonEmptyArray<T> {
  return Match.value(S.is(NonEmptyStringKeys)(input)).pipe(
    Match.when(true, () => undefined),
    Match.orElse(() => {
      throw new EmptyStructError({
        input: source,
        cause: O.none(),
      });
    })
  );
}

function assertStructHasStringEntries<T>(
  input: ReadonlyArray<T>,
  source: object
): asserts input is A.NonEmptyReadonlyArray<T> {
  return Match.value(A.isReadonlyArrayNonEmpty(input)).pipe(
    Match.when(true, () => undefined),
    Match.orElse(() => {
      throw new EmptyStructError({
        input: source,
        cause: O.none(),
      });
    })
  );
}

const pathFromOptions = (options: { readonly path: PathInput }): PathInput =>
  P.isObject(options) && P.hasProperty(options, "path") ? cast(options.path) : cast(options);

/**
 * Result of a runtime struct path lookup.
 *
 * @example
 * ```ts
 * import type { PathLookup } from "@beep/utils/Struct"
 *
 * const isFound = (lookup: PathLookup) => lookup.found
 * void isFound
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PathLookup = InternalPathLookup;

/**
 * Retrieves a value from a struct by a dot-delimited or tuple path.
 *
 * Uses type-fest `Paths` for path validation and `Get` for value resolution.
 *
 * Supports a dual API:
 * - Data-last: `dotGet("attributes.name")(self)`
 * - Data-first: `dotGet(self, "attributes.name")`
 * - Tuple paths: `dotGet(["attributes", "name"] as const)(self)`
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Struct } from "@beep/utils"
 *
 * const user = { profile: { name: "Alice", age: 30 } }
 *
 * // Data-first
 * const name = Struct.dotGet(user, "profile.name")
 *
 * // Data-last (pipeable)
 * const age = pipe(user, Struct.dotGet("profile.age"))
 *
 * void name
 * void age
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const dotGet: {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => Get<S, P>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Get<S, P>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Get<S, P>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Get<S, P>;
} = dual(2, <S extends object>(self: S, path: PathInput): unknown => {
  return unsafeDotGet(self, path);
}) as {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => Get<S, P>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Get<S, P>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Get<S, P>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Get<S, P>;
};

/**
 * Retrieves a value as an `Option` by a dot-delimited or tuple path.
 *
 * Missing paths return `Option.none()`. Existing paths always return
 * `Option.some(value)`, including when `value === undefined`.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Struct } from "@beep/utils"
 *
 * const user = { profile: { name: "Alice" } }
 *
 * // Data-first
 * const name = Struct.dotGetOption(user, "profile.name")
 * // Option.some("Alice")
 *
 * // Missing path
 * const missing = Struct.dotGetOption(user, ["profile", "age"])
 * // Option.none()
 *
 * void name
 * void missing
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const dotGetOption: {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<Get<S, P>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<Get<S, P>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<Get<S, P>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<Get<S, P>>;
} = dual(2, <S extends object>(self: S, path: PathInput): O.Option<unknown> => {
  const lookup = lookupAtPath(self, path);
  return Match.value(lookup).pipe(
    Match.when({ found: true }, ({ value }) => O.some(value)),
    Match.orElse(O.none)
  );
}) as {
  <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<Get<S, P>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<Get<S, P>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<Get<S, P>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<Get<S, P>>;
};

/**
 * Applies a unary function to a value retrieved from a struct by path.
 *
 * Uses {@link dotGet} under the hood, so string paths are type-validated and
 * tuple paths resolve via `type-fest` `Get`.
 *
 * Supports a dual API:
 * - Data-last: `pipe(self, Struct.mapPath(renderName, { path: "profile.name" }))`
 * - Data-first: `Struct.mapPath(self, renderName, { path: "profile.name" })`
 * - Tuple paths: `Struct.mapPath(self, renderName, { path: ["profile", "name"] as const })`
 *
 * If the runtime value does not actually satisfy the statically-declared path,
 * `undefined` is forwarded to `f`, matching {@link dotGet}.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Struct } from "@beep/utils"
 *
 * const user = { profile: { name: "alice" } }
 *
 * // Data-first
 * const upper = Struct.mapPath(user, (s: string) => s.toUpperCase(), { path: "profile.name" })
 * // "ALICE"
 *
 * void upper
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mapPath: {
  <A, B, const P extends string>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): B;
} = dual(
  3,
  <S extends object, B>(self: S, f: (a: unknown) => B, options: { readonly path: PathInput }): B =>
    f(unsafeDotGet(self, pathFromOptions(options)))
) as {
  <A, B, const P extends string>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): B;
};

/**
 * Returns a thunk that applies a unary function to a value retrieved from a
 * struct by path.
 *
 * Mirrors {@link mapPath}, but delays both the path lookup and the function
 * application until the returned zero-argument function is invoked.
 *
 * Supports a dual API:
 * - Data-last: `pipe(self, Struct.mapPathLazy(renderName, { path: "profile.name" }))()`
 * - Data-first: `Struct.mapPathLazy(self, renderName, { path: "profile.name" })()`
 * - Tuple paths: `Struct.mapPathLazy(self, renderName, { path: ["profile", "name"] as const })()`
 *
 * If the runtime value does not actually satisfy the statically-declared path,
 * `undefined` is forwarded to `f`, matching {@link dotGet}.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const user = { profile: { name: "alice" } }
 *
 * const lazy = Struct.mapPathLazy(user, (s: string) => s.toUpperCase(), { path: "profile.name" })
 * const value = lazy()
 * // "ALICE"
 *
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mapPathLazy: {
  <A, B, const P extends string>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => () => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => () => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): () => B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): () => B;
} = dual(
  3,
  <S extends object, B>(self: S, f: (a: unknown) => B, options: { readonly path: PathInput }): (() => B) =>
    () =>
      f(unsafeDotGet(self, pathFromOptions(options)))
) as {
  <A, B, const P extends string>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => () => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    options: { readonly path: P }
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => () => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): () => B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    options: { readonly path: P }
  ): () => B;
};

/**
 * Returns a thunk that reads a value from a struct by key.
 *
 * Mirrors `effect/Struct.get`, but delays the property access until the
 * returned zero-argument function is invoked.
 *
 * Supports a dual API:
 * - Data-last: `pipe(self, Struct.getLazy("name"))()`
 * - Data-first: `Struct.getLazy(self, "name")()`
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Struct } from "@beep/utils"
 *
 * const config = { host: "localhost", port: 3000 }
 *
 * // Data-first
 * const getHost = Struct.getLazy(config, "host")
 * const host = getHost()
 * // "localhost"
 *
 * // Data-last (pipeable)
 * const getPort = pipe(config, Struct.getLazy("port"))
 * const port = getPort()
 * // 3000
 *
 * void host
 * void port
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const getLazy: {
  <S extends object, const K extends keyof S>(key: K): (self: S) => () => S[K];
  <S extends object, const K extends keyof S>(self: S, key: K): () => S[K];
} = dual(
  2,
  <S extends object, const K extends keyof S>(self: S, key: K): (() => S[K]) =>
    () =>
      self[key]
);
// bench

/**
 * Returns all type-level `Paths` of a struct as a `NonEmptyReadonlyArray` of
 * literal strings.
 *
 * Recursively walks the object at runtime, collecting every dot-delimited path
 * that `Paths<S>` would generate at the type level.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const config = { db: { host: "localhost", port: 5432 }, debug: true }
 *
 * const paths = Struct.pathsOf(config)
 * // ["db", "db.host", "db.port", "debug"]
 *
 * void paths
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const pathsOf = <const S extends Record<string, unknown>>(
  obj: S
): A.NonEmptyReadonlyArray<Extract<Paths<S>, string>> => {
  const result = A.empty<string>();
  const walk = (current: unknown, prefix: string): void => {
    if (P.isNullish(current) || !P.isObject(current)) return;
    for (const key of R.keys(current)) {
      const nextPath = Match.value(Str.isEmpty(prefix)).pipe(
        Match.when(true, () => key),
        Match.orElse(() => `${prefix}.${key}`)
      );
      result.push(nextPath);
      walk(current[key], nextPath);
    }
  };
  walk(obj, "");
  return cast(result);
};

/**
 * A single `[key, value]` pair for a string key of `T`, preserving per-key correlation.
 *
 * @example
 * ```ts
 * import type { StringKeyEntry } from "@beep/utils/Struct"
 *
 * type Entry = StringKeyEntry<{ readonly host: string; readonly port: number }>
 * const useEntry = (entry: Entry) => entry[0]
 * void useEntry
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type StringKeyEntry<T> = { [K in keyof T & string]: [K, T[K]] }[keyof T & string];

/**
 * An array of `[key, value]` pairs for all string keys of `T`, preserving per-key correlation.
 *
 * Unlike type-fest's `Entries<T>`, this narrows each entry so that the value type
 * is correlated with its key — `["a", string] | ["b", number]` rather than
 * `["a" | "b", string | number]`.
 *
 * @example
 * ```ts
 * import type { StringKeyEntries } from "@beep/utils/Struct"
 *
 * type Entries = StringKeyEntries<{ readonly host: string; readonly port: number }>
 * const entries: Entries = [["host", "localhost"], ["port", 3000]]
 * void entries
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * ```typescript
 * import * as Struct from "@beep/utils/Struct"
 *
 * const c = Symbol("c")
 * const value = { a: "foo", b: 1, [c]: true }
 *
 * const entries: Array<["a", string] | ["b", number]> = Struct.entries(value)
 * void entries
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const entries = <const R extends object>(obj: R): StringKeyEntries<R> =>
  cast<Array<readonly [keyof R & string, R[keyof R & string]]>, StringKeyEntries<R>>(
    pipe(
      EffectStruct.keys(obj),
      A.map((key): readonly [keyof R & string, R[keyof R & string]] => [key, obj[key]])
    )
  );

/**
 * Returns the string-key entries of a non-empty object in a type-safe manner.
 *
 * Empty struct types are rejected at compile time. A runtime empty value still
 * fails fast with {@link EmptyStructError} to protect the invariant.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const config = { host: "localhost", port: 3000 }
 *
 * const result = Struct.entriesNonEmpty(config)
 * // [["host", "localhost"], ["port", 3000]]
 *
 * void result
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const entriesNonEmpty = <const R extends object>(
  obj: R & NonEmptyStringKeyStruct<R>
): A.NonEmptyReadonlyArray<readonly [keyof R & string, R[keyof R & string]]> => {
  const result: Array<readonly [keyof R & string, R[keyof R & string]]> = cast(entries(obj));
  assertStructHasStringEntries(result, obj);
  return result;
};

/**
 * Returns the string keys of an object in a type-safe manner.
 *
 * Symbol keys are excluded from the result.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const config = { host: "localhost", port: 3000 }
 *
 * const result = Struct.keys(config)
 * // ["host", "port"]
 *
 * void result
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const keys = <const R extends object>(obj: R): Array<keyof R & string> => EffectStruct.keys(obj);

/**
 * Returns the string keys of a non-empty object in a type-safe manner.
 *
 * Empty struct types are rejected at compile time. A runtime empty value still
 * fails fast with {@link EmptyStructError} to protect the invariant.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const config = { host: "localhost", port: 3000 }
 *
 * const result = Struct.keysNonEmpty(config)
 * // ["host", "port"] typed as NonEmptyReadonlyArray
 *
 * void result
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const keysNonEmpty = <const R extends object>(
  obj: R & NonEmptyStringKeyStruct<R>
): A.NonEmptyReadonlyArray<keyof R & string> => {
  const result: Array<keyof R & string> = cast(EffectStruct.keys(obj));
  assertStructHasStringKeys(result, obj);
  return cast<Array<keyof R & string>, A.NonEmptyReadonlyArray<keyof R & string>>(result);
};

/**
 * Type-safe `Object.fromEntries` that preserves per-key value types.
 *
 * Accepts an iterable of `[key, value]` pairs and produces an object
 * whose type is the simplified union of all entries.
 *
 * @example
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const entries: ReadonlyArray<readonly ["host", "localhost"] | readonly ["port", 3000]> = [
 *   ["host", "localhost"],
 *   ["port", 3000],
 * ]
 *
 * const obj = Struct.fromEntries(entries)
 * // { host: "localhost", port: 3000 }
 *
 * void obj
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromEntries = <const E extends readonly [PropertyKey, unknown]>(
  entries: Iterable<E>
): Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }> => {
  const out: Record<PropertyKey, unknown> = {};

  for (const [key, value] of entries) {
    Reflect.defineProperty(out, key, {
      configurable: false,
      enumerable: false,
      value,
      writable: false,
    });
  }

  return cast<Record<PropertyKey, unknown>, Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }>>(out);
};

/**
 * Re-export of all helpers from `effect/Struct`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/Struct";

/**
 * Struct shape accepted by {@link reverse}.
 *
 * @example
 * ```ts
 * import type { ReverseableStruct } from "@beep/utils/Struct"
 *
 * const mapping: ReverseableStruct = { active: "A", inactive: "I" }
 * void mapping
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReverseableStruct = Readonly<{
  readonly [key: string]: PropertyKey;
  readonly [key: symbol]: PropertyKey;
}>;

/**
 * Type-level inversion of a struct where each value becomes a key.
 *
 * When multiple keys share the same value, the reversed key type is the union
 * of all matching original keys.
 *
 * @example
 * ```ts
 * import type { ReverseStruct } from "@beep/utils/Struct"
 *
 * type Direction = ReverseStruct<{ readonly up: "north"; readonly down: "south" }>
 * const getNorth = (direction: Direction) => direction.north
 * void getNorth
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * ```ts
 * import { Struct } from "@beep/utils"
 *
 * const errorCode = {
 *   successfulCompletion: "00000",
 *   warning: "01000",
 * } satisfies Struct.ReverseableStruct
 *
 * const reversed = Struct.reverse(errorCode)
 *
 * void reversed
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const reverse: {
  <S extends ReverseableStruct>(): (self: S) => ReverseStruct<S>;
  <S extends ReverseableStruct>(self: S): ReverseStruct<S>;
} = dual(
  (args) => args.length === 1,
  <S extends ReverseableStruct>(self: S): ReverseStruct<S> => {
    const stringEntries = pipe(
      entries(self),
      A.map(([key, value]) => [value, key] as const)
    );
    const symbolEntries = pipe(
      Reflect.ownKeys(self),
      A.filter(P.isSymbol),
      A.map((key) => [self[key], key] as const)
    );

    return cast(fromEntries(A.appendAll(stringEntries, symbolEntries)));
  }
);

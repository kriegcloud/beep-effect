import { $UtilsId } from "@beep/identity/packages";
import { Struct as EffectStruct, Function as Fn, pipe } from "effect";
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
const assertNonEmptyStringKeys: (input: unknown) => asserts input is A.NonEmptyReadonlyArray<string> =
  S.asserts(NonEmptyStringKeys);

/**
 * Thrown when a struct expected to have at least one string key is empty.
 *
 * @since 0.2.0
 * @category DomainModel
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
  try {
    assertNonEmptyStringKeys(input);
  } catch (cause) {
    throw new EmptyStructError({
      input: source,
      cause: S.decodeUnknownOption(S.DefectWithStack)(cause),
    });
  }
}

function assertStructHasStringEntries<T>(
  input: ReadonlyArray<T>,
  source: object
): asserts input is A.NonEmptyReadonlyArray<T> {
  try {
    A.assertNonEmptyReadonlyArray(input);
  } catch (cause) {
    throw new EmptyStructError({
      input: source,
      cause: S.decodeUnknownOption(S.DefectWithStack)(cause),
    });
  }
}

/**
 * Result of a runtime struct path lookup.
 *
 * @since 0.2.0
 * @category DomainModel
 */
export type PathLookup = InternalPathLookup;

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
  return unsafeDotGet(self, path);
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

/**
 * Applies a unary function to a value retrieved from a struct by path.
 *
 * Uses {@link dotGet} under the hood, so string paths are type-validated and
 * tuple paths resolve via `type-fest` `Get`.
 *
 * Supports a dual API:
 * - Data-last: `pipe(self, Struct.mapPath(renderName, "profile.name"))`
 * - Data-first: `Struct.mapPath(self, renderName, "profile.name")`
 * - Tuple paths: `Struct.mapPath(self, renderName, ["profile", "name"] as const)`
 *
 * If the runtime value does not actually satisfy the statically-declared path,
 * `undefined` is forwarded to `f`, matching {@link dotGet}.
 *
 * @since 0.2.0
 * @category Utility
 */
export const mapPath: {
  <A, B, const P extends string>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): B;
} = Fn.dual(
  3,
  <S extends object, B>(self: S, f: (a: unknown) => B, path: PathInput): B => f(unsafeDotGet(self, path))
) as {
  <A, B, const P extends string>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => B;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => B;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): B;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
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
 * - Data-last: `pipe(self, Struct.mapPathLazy(renderName, "profile.name"))()`
 * - Data-first: `Struct.mapPathLazy(self, renderName, "profile.name")()`
 * - Tuple paths: `Struct.mapPathLazy(self, renderName, ["profile", "name"] as const)()`
 *
 * If the runtime value does not actually satisfy the statically-declared path,
 * `undefined` is forwarded to `f`, matching {@link dotGet}.
 *
 * @since 0.2.0
 * @category Utility
 */
export const mapPathLazy: {
  <A, B, const P extends string>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => Fn.LazyArg<B>;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => Fn.LazyArg<B>;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): Fn.LazyArg<B>;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): Fn.LazyArg<B>;
} = Fn.dual(
  3,
  <S extends object, B>(self: S, f: (a: unknown) => B, path: PathInput): Fn.LazyArg<B> =>
    () =>
      f(unsafeDotGet(self, path))
) as {
  <A, B, const P extends string>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => Fn.LazyArg<B>;
  <A, B, const P extends ReadonlyArray<string>>(
    f: (a: A) => B,
    path: P
  ): <S extends object>(self: Get<S, P> extends A ? S : never) => Fn.LazyArg<B>;
  <S extends object, A, B, const P extends string & Paths<S>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): Fn.LazyArg<B>;
  <S extends object, A, B, const P extends ReadonlyArray<string>>(
    self: S,
    f: Get<S, P> extends A ? (a: A) => B : never,
    path: P
  ): Fn.LazyArg<B>;
};

/**
 * Retrieves a thunk that reads a value from a struct by key.
 *
 * Mirrors `effect/Struct.get`, but delays the property access until the
 * returned zero-argument function is invoked.
 *
 * Supports a dual API:
 * - Data-last: `pipe(self, Struct.getLazy("name"))()`
 * - Data-first: `Struct.getLazy(self, "name")()`
 *
 * @since 0.2.0
 * @category Utility
 */
export const getLazy: {
  <S extends object, const K extends keyof S>(key: K): (self: S) => () => S[K];
  <S extends object, const K extends keyof S>(self: S, key: K): () => S[K];
} = Fn.dual(
  2,
  <S extends object, const K extends keyof S>(self: S, key: K): (() => S[K]) =>
    () =>
      self[key]
);
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
export const pathsOf = <const S extends Record<string, unknown>>(
  obj: S
): A.NonEmptyReadonlyArray<Extract<Paths<S>, string>> => {
  const result = A.empty<string>();
  const walk = (current: unknown, prefix: string): void => {
    if (P.isNullish(current) || !P.isObject(current)) return;
    for (const key of R.keys(current)) {
      const path = Str.isEmpty(prefix) ? key : `${prefix}.${key}`;
      result.push(path);
      walk(current[key], path);
    }
  };
  walk(obj, "");
  return Fn.cast(result);
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
 * @since 3.17.0
 * @category Utility
 */
export const entries = <const R extends object>(obj: R): StringKeyEntries<R> =>
  Fn.cast<Array<readonly [keyof R & string, R[keyof R & string]]>, StringKeyEntries<R>>(
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
 * @since 0.2.0
 * @category Utility
 */
export const entriesNonEmpty = <const R extends object>(
  obj: R & NonEmptyStringKeyStruct<R>
): A.NonEmptyReadonlyArray<readonly [keyof R & string, R[keyof R & string]]> => {
  const result: Array<readonly [keyof R & string, R[keyof R & string]]> = Fn.cast(entries(obj));
  assertStructHasStringEntries(result, obj);
  return result;
};

/**
 * Returns the string keys of an object in a type-safe manner.
 *
 * @since 0.2.0
 * @category Utility
 */
export const keys = <const R extends object>(obj: R): Array<keyof R & string> => EffectStruct.keys(obj);

/**
 * Returns the string keys of a non-empty object in a type-safe manner.
 *
 * Empty struct types are rejected at compile time. A runtime empty value still
 * fails fast with {@link EmptyStructError} to protect the invariant.
 *
 * @since 0.2.0
 * @category Utility
 */
export const keysNonEmpty = <const R extends object>(
  obj: R & NonEmptyStringKeyStruct<R>
): A.NonEmptyReadonlyArray<keyof R & string> => {
  const result: Array<keyof R & string> = Fn.cast(EffectStruct.keys(obj));
  assertStructHasStringKeys(result, obj);
  return Fn.cast<Array<keyof R & string>, A.NonEmptyReadonlyArray<keyof R & string>>(result);
};

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
): Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }> => {
  const out: Record<PropertyKey, unknown> = {};

  for (const [key, value] of entries) {
    Reflect.defineProperty(out, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  return Fn.cast<Record<PropertyKey, unknown>, Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }>>(out);
};

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
 * @category Utility
 */
export const reverse: {
  <S extends ReverseableStruct>(): (self: S) => ReverseStruct<S>;
  <S extends ReverseableStruct>(self: S): ReverseStruct<S>;
} = Fn.dual(
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

    return Fn.cast(fromEntries(A.appendAll(stringEntries, symbolEntries)));
  }
);

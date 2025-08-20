import type * as A from "effect/Array";
import type * as S from "effect/Schema";

/* -------------------------------------------------------------------------------------------------
 * Small helpers (readability > cleverness)
 * ----------------------------------------------------------------------------------------------- */

/** Extract only the string keys of an object type. */
type StringKeys<T> = Extract<keyof T, string>;

/** Utility to check if a type resolves to `never`. */
type IsNever<T> = [T] extends [never] ? true : false;

/** Does the set of string keys include the empty string literal `""`? */
type HasEmptyKey<T> = "" extends StringKeys<T> ? true : false;

/* -------------------------------------------------------------------------------------------------
 * String utilities
 * ----------------------------------------------------------------------------------------------- */

/**
 * A string literal that is not the empty string.
 *
 * @example
 * type A = NonEmptyStringLiteral<"foo">     // "foo"
 * type B = NonEmptyStringLiteral<"">        // never
 * type C = NonEmptyStringLiteral<string>    // string  (cannot be proven non-empty at runtime)
 */
export type NonEmptyStringLiteral<S extends string> = S extends "" ? never : S;

/* -------------------------------------------------------------------------------------------------
 * Records with string keys
 * ----------------------------------------------------------------------------------------------- */

/**
 * Readonly dictionary with string keys and value type `V`.
 * Alias for readability when expressing intent (vs `Readonly<Record<string, V>>`).
 */
export type ReadonlyStringMap<V = unknown> = Readonly<Record<string, V>>;

/**
 * A readonly record that:
 *  - has at least one string key, and
 *  - does not contain the empty key `""`.
 *
 * Note: “non-empty” is provable only when `keyof T` is a *finite* union (e.g., object literals).
 *
 * @example
 * type A = NonEmptyReadonlyStringKeyRecord<{a: 1}> // { a: 1 }
 * type B = NonEmptyReadonlyStringKeyRecord<{}>     // never
 * type C = NonEmptyReadonlyStringKeyRecord<Record<string, number>> // T (cannot prove emptiness)
 */
export type NonEmptyReadonlyStringKeyRecord<
  T extends Readonly<Record<string, unknown>>,
> = IsNever<StringKeys<T>> extends true // no string keys at all
  ? never
  : HasEmptyKey<T> extends true // contains the empty string key
    ? never
    : T;

/**
 * A readonly `string -> string` map (alias, documents intent).
 */
export type ReadonlyStringToStringMap = ReadonlyStringMap<string>;

/**
 * A readonly `string -> string` map that is:
 *  - non-empty (at least one string key),
 *  - has no empty-string key `""`,
 *  - and all values are non-empty string literals when known at compile time.
 *
 * @example
 * type A = NonEmptyStringToStringMap<{"x": "y"}>      // {"x": "y"}
 * type B = NonEmptyStringToStringMap<{"": "y"}>       // never (empty key)
 * type C = NonEmptyStringToStringMap<{"x": ""}>       // never (empty value)
 * type D = NonEmptyStringToStringMap<Record<string, string>> // T (values not provably empty/non-empty)
 */
export type NonEmptyStringToStringMap<T extends ReadonlyStringToStringMap> =
  NonEmptyReadonlyStringKeyRecord<T> extends never
    ? never
    : "" extends T[StringKeys<T>] // do any values include the empty string literal?
      ? never
      : T;

/**
 * A non-empty readonly array of the values of a record `T`.
 * Useful when you’ve already established the record is non-empty at the type level.
 *
 * @example
 * type Vals = ValuesNonEmptyArray<{a: 1; b: 2}> // readonly [1 | 2, ...(1 | 2)[]]
 */
export type ValuesNonEmptyArray<T extends Readonly<Record<string, unknown>>> =
  readonly [T[StringKeys<T>], ...T[StringKeys<T>][]];

/* -------------------------------------------------------------------------------------------------
 * Effect Schema struct field maps
 * ----------------------------------------------------------------------------------------------- */

/**
 * A map from string keys to `S.Struct.Field`, matching Effect Schema’s struct definition shape.
 */
export type StructFieldMap = Readonly<Record<string, S.Struct.Field>>;

/**
 * A `StructFieldMap` that is non-empty and has no empty-string key.
 *
 * @example
 * import * as S from "effect/Schema";
 * const fields = {
 *   id: S.string,
 *   name: S.string
 * } satisfies NonEmptyStructFieldMap; // OK
 */
export type NonEmptyStructFieldMap<T extends StructFieldMap> =
  NonEmptyReadonlyStringKeyRecord<T>;

/**
 * A non-empty readonly array of the string keys of a `NonEmptyStructFieldMap`.
 * Mirrors `A.NonEmptyReadonlyArray` from Effect.
 *
 * @example
 * type Keys = NonEmptyStructFieldKeyList<{id: S.Struct.Field; name: S.Struct.Field}>
 * // => A.NonEmptyReadonlyArray<"id" | "name">
 */
export type NonEmptyStructFieldKeyList<T extends StructFieldMap> =
  T extends NonEmptyStructFieldMap<T>
    ? A.NonEmptyReadonlyArray<StringKeys<T>>
    : never;

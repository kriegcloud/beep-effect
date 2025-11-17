/**
 * General-purpose helper types for working with non-empty strings and struct maps.
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 * import * as S from "effect/Schema";
 *
 * type Fields = UtilTypes.NonEmptyStructFieldMap<{ id: S.Struct.Field }>;
 * let example!: Fields;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
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
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type A = UtilTypes.NonEmptyStringLiteral<"foo">;
 * let example!: A;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type NonEmptyStringLiteral<S extends string> = S extends "" ? never : S;

/* -------------------------------------------------------------------------------------------------
 * Records with string keys
 * ----------------------------------------------------------------------------------------------- */

/**
 * Readonly dictionary with string keys and value type `V`.
 * Alias for readability when expressing intent (vs `Readonly<Record<string, V>>`).
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type Headers = UtilTypes.ReadonlyStringMap<number>;
 * let example!: Headers;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
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
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type Safe = UtilTypes.NonEmptyReadonlyStringKeyRecord<{ a: 1 }>;
 * let example!: Safe;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type NonEmptyReadonlyStringKeyRecord<T extends Readonly<Record<string, unknown>>> = IsNever<
  StringKeys<T>
> extends true // no string keys at all
  ? never
  : HasEmptyKey<T> extends true // contains the empty string key
    ? never
    : T;

/**
 * A readonly `string -> string` map (alias, documents intent).
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type Params = UtilTypes.ReadonlyStringToStringMap;
 * let example!: Params;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type ReadonlyStringToStringMap = ReadonlyStringMap<string>;

/**
 * A readonly `string -> string` map that is:
 *  - non-empty (at least one string key),
 *  - has no empty-string key `""`,
 *  - and all values are non-empty string literals when known at compile time.
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type Valid = UtilTypes.NonEmptyStringToStringMap<{ x: "y" }>;
 * let example!: Valid;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
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
 * import type * as UtilTypes from "@beep/types/util.types";
 *
 * type Vals = UtilTypes.ValuesNonEmptyArray<{ a: 1; b: 2 }>;
 * let example!: Vals;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type ValuesNonEmptyArray<T extends Readonly<Record<string, unknown>>> = readonly [
  T[StringKeys<T>],
  ...T[StringKeys<T>][],
];

/* -------------------------------------------------------------------------------------------------
 * Effect Schema struct field maps
 * ----------------------------------------------------------------------------------------------- */

/**
 * A map from string keys to `S.Struct.Field`, matching Effect Schema’s struct definition shape.
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 * import * as S from "effect/Schema";
 *
 * const fields: UtilTypes.StructFieldMap = { id: S.String };
 * void fields;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type StructFieldMap = Readonly<Record<string, S.Struct.Field>>;

/**
 * A `StructFieldMap` that is non-empty and has no empty-string key.
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 * import * as S from "effect/Schema";
 *
 * const fields = {
 *   id: S.String,
 *   name: S.String,
 * } satisfies UtilTypes.NonEmptyStructFieldMap<{
 *   readonly id: S.Struct.Field;
 *   readonly name: S.Struct.Field;
 * }>;
 * void fields;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type NonEmptyStructFieldMap<T extends StructFieldMap> = NonEmptyReadonlyStringKeyRecord<T>;

/**
 * A non-empty readonly array of the string keys of a `NonEmptyStructFieldMap`.
 * Mirrors `A.NonEmptyReadonlyArray` from Effect.
 *
 * @example
 * import type * as UtilTypes from "@beep/types/util.types";
 * import * as S from "effect/Schema";
 *
 * type Keys = UtilTypes.NonEmptyStructFieldKeyList<{ id: S.Struct.Field; name: S.Struct.Field }>;
 * let example!: Keys;
 * void example;
 *
 * @category Types/Utility
 * @since 0.1.0
 */
export type NonEmptyStructFieldKeyList<T extends StructFieldMap> = T extends NonEmptyStructFieldMap<T>
  ? A.NonEmptyReadonlyArray<StringKeys<T>>
  : never;

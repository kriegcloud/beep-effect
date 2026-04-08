import { $SchemaId } from "@beep/identity/packages";
import { thunkFalse, thunkTrue } from "@beep/utils";
import { HashSet, identity, pipe, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("CommonTextSchemas");

const truthyBooleanString = HashSet.fromIterable(["true", "1", "yes", "on"]);
const falseyBooleanString = HashSet.fromIterable(["false", "0", "no", "off"]);

const normalizeBooleanString = (value: string): boolean => {
  const normalized = pipe(value, Str.trim, Str.toLowerCase);
  return Bool.match(HashSet.has(truthyBooleanString, normalized), {
    onTrue: thunkTrue,
    onFalse: () =>
      Bool.match(HashSet.has(falseyBooleanString, normalized), {
        onTrue: thunkFalse,
        onFalse: thunkFalse,
      }),
  });
};

/**
 * Trimmed and non-empty text schema that strips whitespace and rejects empty results.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrimmedNonEmptyText } from "@beep/schema/CommonTextSchemas"
 *
 * const value = S.decodeUnknownSync(TrimmedNonEmptyText)("  hello  ")
 * console.log(value) // "hello"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const TrimmedNonEmptyText = S.String.pipe(
  S.decodeTo(
    S.NonEmptyString,
    SchemaTransformation.transform({
      decode: Str.trim,
      encode: identity,
    })
  ),
  S.annotate(
    $I.annote("TrimmedNonEmptyText", {
      description: "Trimmed text that must be non-empty after normalization.",
    })
  )
);

/**
 * Type for {@link TrimmedNonEmptyText}.
 *
 * @example
 * ```ts
 * import type { TrimmedNonEmptyText } from "@beep/schema/CommonTextSchemas"
 *
 * const name: TrimmedNonEmptyText = "hello" as TrimmedNonEmptyText
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TrimmedNonEmptyText = typeof TrimmedNonEmptyText.Type;

/**
 * Schema that decodes a comma-separated string into a trimmed non-empty string array.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CommaSeparatedList } from "@beep/schema/CommonTextSchemas"
 *
 * const items = S.decodeUnknownSync(CommaSeparatedList)("foo, bar, baz")
 * console.log(items) // ["foo", "bar", "baz"]
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const CommaSeparatedList = S.String.pipe(
  S.decodeTo(
    S.Array(TrimmedNonEmptyText),
    SchemaTransformation.transform({
      decode: (value): ReadonlyArray<string> => pipe(Str.split(",")(value), A.map(Str.trim), A.filter(Str.isNonEmpty)),
      encode: (values: ReadonlyArray<string>) => A.join(values, ","),
    })
  ),
  S.annotate(
    $I.annote("CommaSeparatedList", {
      description: "Comma-separated text decoded into a trimmed non-empty string list.",
    })
  )
);

/**
 * Type for {@link CommaSeparatedList}.
 *
 * @example
 * ```ts
 * import type { CommaSeparatedList } from "@beep/schema/CommonTextSchemas"
 *
 * const tags: CommaSeparatedList = ["a", "b"] as CommaSeparatedList
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CommaSeparatedList = typeof CommaSeparatedList.Type;

/**
 * Schema that normalizes common boolean string spellings (`"true"`, `"1"`, `"yes"`, `"on"`, etc.) to `boolean`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NormalizedBooleanString } from "@beep/schema/CommonTextSchemas"
 *
 * console.log(S.decodeUnknownSync(NormalizedBooleanString)("yes")) // true
 * console.log(S.decodeUnknownSync(NormalizedBooleanString)("0")) // false
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NormalizedBooleanString = S.String.pipe(
  S.decodeTo(
    S.Boolean,
    SchemaTransformation.transform({
      decode: normalizeBooleanString,
      encode: String,
    })
  ),
  S.annotate(
    $I.annote("NormalizedBooleanString", {
      description: "Normalized boolean value decoded from common boolean string values.",
    })
  )
);

/**
 * Type for {@link NormalizedBooleanString}.
 *
 * @example
 * ```ts
 * import type { NormalizedBooleanString } from "@beep/schema/CommonTextSchemas"
 *
 * const flag: NormalizedBooleanString = true
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NormalizedBooleanString = typeof NormalizedBooleanString.Type;

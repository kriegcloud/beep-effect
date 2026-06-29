/**
 * Shared text-normalization schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { A, Str } from "@beep/utils";
import { flow, HashSet, identity, pipe, SchemaTransformation } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("CommonTextSchemas");

const truthyBooleanString = HashSet.fromIterable(["true", "1", "yes", "on"]);

const normalizeBooleanString: (value: string) => boolean = flow(Str.trim, Str.toLowerCase, (normalized) =>
  HashSet.has(truthyBooleanString, normalized)
);

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
 * @category validation
 */
export const TrimmedNonEmptyText = S.String.pipe(
  S.decodeTo(
    S.NonEmptyString,
    SchemaTransformation.transform({
      decode: Str.trim,
      encode: identity,
    })
  ),
  $I.annoteSchema("TrimmedNonEmptyText", {
    description: "Trimmed text that must be non-empty after normalization.",
  })
);

/**
 * Type for {@link TrimmedNonEmptyText}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrimmedNonEmptyText } from "@beep/schema/CommonTextSchemas"
 *
 * const name: TrimmedNonEmptyText = S.decodeUnknownSync(TrimmedNonEmptyText)("  hello  ")
 * console.log(name) // "hello"
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @category validation
 */
export const CommaSeparatedList = S.String.pipe(
  S.decodeTo(
    S.Array(TrimmedNonEmptyText),
    SchemaTransformation.transform({
      decode: (value): ReadonlyArray<string> => pipe(Str.split(",")(value), A.map(Str.trim), A.filter(Str.isNonEmpty)),
      encode: (values: ReadonlyArray<string>) => A.join(values, ","),
    })
  ),
  $I.annoteSchema("CommaSeparatedList", {
    description: "Comma-separated text decoded into a trimmed non-empty string list.",
  })
);

/**
 * Type for {@link CommaSeparatedList}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CommaSeparatedList } from "@beep/schema/CommonTextSchemas"
 *
 * const tags: CommaSeparatedList = S.decodeUnknownSync(CommaSeparatedList)("a, b")
 * console.log(tags.join("|")) // "a|b"
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @category validation
 */
export const NormalizedBooleanString = S.String.pipe(
  S.decodeTo(
    S.Boolean,
    SchemaTransformation.transform({
      decode: normalizeBooleanString,
      encode: String,
    })
  ),
  $I.annoteSchema("NormalizedBooleanString", {
    description: "Normalized boolean value decoded from common boolean string values.",
  })
);

/**
 * Type for {@link NormalizedBooleanString}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NormalizedBooleanString } from "@beep/schema/CommonTextSchemas"
 *
 * const flag: NormalizedBooleanString = S.decodeUnknownSync(NormalizedBooleanString)("yes")
 * console.log(flag) // true
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NormalizedBooleanString = typeof NormalizedBooleanString.Type;

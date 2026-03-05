import { $SchemaId } from "@beep/identity/packages";
import { Boolean as Bool, HashSet, pipe, SchemaTransformation, String as Str } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $SchemaId.create("CommonTextSchemas");

const truthyBooleanString = HashSet.fromIterable(["true", "1", "yes", "on"]);
const falseyBooleanString = HashSet.fromIterable(["false", "0", "no", "off"]);

const normalizeBooleanString = (value: string): boolean => {
  const normalized = pipe(value, Str.trim, Str.toLowerCase);
  return Bool.match(HashSet.has(truthyBooleanString, normalized), {
    onTrue: () => true,
    onFalse: () =>
      Bool.match(HashSet.has(falseyBooleanString, normalized), {
        onTrue: () => false,
        onFalse: () => false,
      }),
  });
};

/**
 * Trimmed and non-empty text schema for shared runtime boundaries.
 *
 * @since 0.0.0
 */
export const TrimmedNonEmptyText = S.String.pipe(
  S.decodeTo(
    S.NonEmptyString,
    SchemaTransformation.transform({
      decode: Str.trim,
      encode: (value) => value,
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
 * @since 0.0.0
 */
export type TrimmedNonEmptyText = typeof TrimmedNonEmptyText.Type;

/**
 * Shared comma-separated list schema that trims and removes empty entries.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type CommaSeparatedList = typeof CommaSeparatedList.Type;

/**
 * Shared boolean-string normalization schema for runtime config boundaries.
 * Accepts common boolean string spellings and normalizes to `boolean`.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type NormalizedBooleanString = typeof NormalizedBooleanString.Type;

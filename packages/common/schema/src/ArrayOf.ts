/**
 * Reusable schema constructors for array-like data.
 *
 * @since 0.0.0
 * @module \@beep/schema/ArrayOf
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("ArrayOf");

/**
 * Schema for `ReadonlyArray<string>`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ArrayOfStrings } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(ArrayOfStrings)(["a", "b", "c"])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ArrayOfStrings = S.Array(S.String).annotate(
  $I.annote("ArrayOfStrings", {
    description: "An array of strings",
  })
);

/**
 * Type for {@link ArrayOfStrings}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayOfStrings = S.Schema.Type<typeof ArrayOfStrings>;

/**
 * Schema for non-empty arrays of strings.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonEmptyArrayOfStrings } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(NonEmptyArrayOfStrings)(["hello"])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonEmptyArrayOfStrings = S.NonEmptyArray(S.String).annotate(
  $I.annote("NonEmptyArrayOfStrings", {
    description: "An array of non-empty strings",
  })
);

/**
 * Type for {@link NonEmptyArrayOfStrings}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyArrayOfStrings = S.Schema.Type<typeof NonEmptyArrayOfStrings>;

/**
 * Schema for arrays of `NonEmptyString` values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ArrayOfNonEmptyStrings } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(ArrayOfNonEmptyStrings)(["hello", "world"])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ArrayOfNonEmptyStrings = S.Array(S.NonEmptyString).annotate(
  $I.annote("ArrayOfNonEmptyStrings", {
    description: "An array of non-empty strings",
  })
);

/**
 * Type for {@link ArrayOfNonEmptyStrings}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayOfNonEmptyStrings = S.Schema.Type<typeof ArrayOfNonEmptyStrings>;

/**
 * Schema for non-empty arrays of `NonEmptyString` values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonEmptyArrayOfNonEmptyStrings } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(NonEmptyArrayOfNonEmptyStrings)(["hello"])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonEmptyArrayOfNonEmptyStrings = S.NonEmptyArray(S.NonEmptyString).annotate(
  $I.annote("NonEmptyArrayOfNonEmptyStrings", {
    description: "An array of non-empty non-empty strings",
  })
);

/**
 * Type for {@link NonEmptyArrayOfNonEmptyStrings}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyArrayOfNonEmptyStrings = S.Schema.Type<typeof NonEmptyArrayOfNonEmptyStrings>;

/**
 * Schema for arrays of numbers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ArrayOfNumbers } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(ArrayOfNumbers)([1, 2, 3])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ArrayOfNumbers = S.Array(S.Number).annotate(
  $I.annote("ArrayOfNumbers", {
    description: "An array of numbers",
  })
);

/**
 * Type for {@link ArrayOfNumbers}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayOfNumbers = S.Schema.Type<typeof ArrayOfNumbers>;

/**
 * Schema for non-empty arrays of numbers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonEmptyArrayOfNumbers } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(NonEmptyArrayOfNumbers)([42])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonEmptyArrayOfNumbers = S.NonEmptyArray(S.Number).annotate(
  $I.annote("NonEmptyArrayOfNumbers", {
    description: "An array of non-empty numbers",
  })
);

/**
 * Type for {@link NonEmptyArrayOfNumbers}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyArrayOfNumbers = S.Schema.Type<typeof NonEmptyArrayOfNumbers>;

/**
 * Schema for arrays of integers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ArrayOfInts } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(ArrayOfInts)([1, 2, 3])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ArrayOfInts = S.Array(S.Int).annotate(
  $I.annote("ArrayOfInts", {
    description: "An array of integers",
  })
);

/**
 * Type for {@link ArrayOfInts}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayOfInts = S.Schema.Type<typeof ArrayOfInts>;

/**
 * Schema for non-empty arrays of integers.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonEmptyArrayOfInts } from "@beep/schema/ArrayOf"
 *
 * const decoded = S.decodeUnknownSync(NonEmptyArrayOfInts)([1])
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonEmptyArrayOfInts = S.NonEmptyArray(S.Int).annotate(
  $I.annote("NonEmptyArrayOfInts", {
    description: "An array of non-empty integers",
  })
);

/**
 * Type for {@link NonEmptyArrayOfInts}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyArrayOfInts = S.Schema.Type<typeof NonEmptyArrayOfInts>;

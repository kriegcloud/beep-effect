/**
 * Shared string normalization schemas.
 *
 * @since 0.0.0
 * @module @beep/schema/String
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("String");

/**
 * Branded non-empty trimmed string schema that strips whitespace and rejects empty results.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NonEmptyTrimmedStr } from "@beep/schema/String"
 *
 * const value = S.decodeUnknownSync(NonEmptyTrimmedStr)("  hello  ")
 * console.log(value) // "hello"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NonEmptyTrimmedStr = S.Trim.check(S.isNonEmpty({ message: "String must not be empty" })).pipe(
  S.brand("NonEmptyTrimmedStr"),
  $I.annoteSchema("NonEmptyTrimmedStr", {
    description: "Non-empty trimmed string",
    documentation: "A string that is not empty and has leading/trailing whitespace removed.",
  })
);

/**
 * Type for {@link NonEmptyTrimmedStr}.
 *
 * @example
 * ```ts
 * import type { NonEmptyTrimmedStr } from "@beep/schema/String"
 *
 * const label: NonEmptyTrimmedStr = "hello" as NonEmptyTrimmedStr
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyTrimmedStr = typeof NonEmptyTrimmedStr.Type;

/**
 * Branded UUID string schema that validates RFC 4122 format.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { UUID } from "@beep/schema/String"
 *
 * const id = S.decodeUnknownSync(UUID)("550e8400-e29b-41d4-a716-446655440000")
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const UUID = NonEmptyTrimmedStr.check(S.isUUID()).pipe(
  S.brand("UUID"),
  $I.annoteSchema("UUID", {
    description: "Universally Unique Identifier",
    documentation: "A 128-bit number used to identify information in computer systems.",
  })
);

/**
 * Type for {@link UUID}.
 *
 * @example
 * ```ts
 * import type { UUID } from "@beep/schema/String"
 *
 * const userId: UUID = "550e8400-e29b-41d4-a716-446655440000" as UUID
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UUID = typeof UUID.Type;

/**
 * A nullable string schema that accepts `string | null`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NullableStr } from "@beep/schema/String"
 *
 * S.decodeUnknownSync(NullableStr)("hello")
 * S.decodeUnknownSync(NullableStr)(null)
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const NullableStr = S.String.pipe(
  S.NullOr,
  $I.annoteSchema("NullableStr", {
    description: "A nullable string",
  })
);

/**
 * Type for {@link NullableStr}.
 *
 * @example
 * ```ts
 * import type { NullableStr } from "@beep/schema/String"
 *
 * const name: NullableStr = null
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type NullableStr = typeof NullableStr.Type;

/**
 * A nullable string that decodes to `Option<string>` using `S.OptionFromNullOr`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { OptionFromNullableStr } from "@beep/schema/String"
 *
 * const result = S.decodeUnknownSync(OptionFromNullableStr)(null)
 * console.log(result) // Option.none()
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const OptionFromNullableStr = S.String.pipe(
  S.OptionFromNullOr,
  $I.annoteSchema("OptionFromNullableStr", {
    description: "An option from a nullable string",
  })
);

/**
 * Type for {@link OptionFromNullableStr}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type OptionFromNullableStr = typeof OptionFromNullableStr.Type;

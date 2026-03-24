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
 * Branded non-empty trimmed string schema.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type NonEmptyTrimmedStr = typeof NonEmptyTrimmedStr.Type;

/**
 * Branded UUID string schema.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type UUID = typeof UUID.Type;

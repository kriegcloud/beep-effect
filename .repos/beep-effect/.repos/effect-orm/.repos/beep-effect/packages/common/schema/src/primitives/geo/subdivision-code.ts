/**
 * Subdivision schema helpers for ISO 3166-2 region codes.
 *
 * Validates uppercase codes like `US-CA` or `GB-ENG` for use in address forms and policies.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { SubdivisionCode } from "@beep/schema/primitives/geo/subdivision-code";
 *
 * const parsed = S.decodeSync(SubdivisionCode)("US-TX");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/geo/subdivision-code");
/**
 * ISO 3166-2 subdivision code schema (e.g., US-CA, CA-ON, GB-ENG, CN-11).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { SubdivisionCode } from "@beep/schema/primitives/geo/subdivision-code";
 *
 * S.decodeSync(SubdivisionCode)("CA-BC");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class SubdivisionCode extends S.NonEmptyTrimmedString.pipe(
  S.uppercased(),
  // CC-XXX where right side is 1..3 letters/digits (covers common patterns)
  S.pattern(/^[A-Z]{2}-[A-Z0-9]{1,3}$/),
  S.brand("SubdivisionCode")
).annotations(
  $I.annotations("subdivision-code/SubdivisionCode", {
    description: "ISO 3166-2 subdivision code (e.g., US-CA, CA-ON, GB-ENG, CN-11)",
    jsonSchema: {
      type: "string",
      format: "subdivision-code",
    },
  })
) {}

/**
 * Namespace exposing helper types for `SubdivisionCode`.
 *
 * @example
 * import type { SubdivisionCode } from "@beep/schema/primitives/geo/subdivision-code";
 *
 * type Subdivision = SubdivisionCode.Encoded;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace SubdivisionCode {
  /**
   * Runtime type produced by the `SubdivisionCode` schema.
   *
   * @example
   * import type { SubdivisionCode } from "@beep/schema/primitives/geo/subdivision-code";
   *
   * let code: SubdivisionCode.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof SubdivisionCode>;
  /**
   * Encoded value accepted by the `SubdivisionCode` schema.
   *
   * @example
   * import type { SubdivisionCode } from "@beep/schema/primitives/geo/subdivision-code";
   *
   * let encoded: SubdivisionCode.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof SubdivisionCode>;
}

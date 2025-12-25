/**
 * Street line schema helpers for capturing address line strings.
 *
 * Allows generous character counts to accommodate apartment info and international formatting.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { StreetLine } from "@beep/schema/primitives/geo/street-line";
 *
 * const parsed = S.decodeSync(StreetLine)("123 Main St Apt 4B");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/geo/street-line");
/**
 * Street line schema with trimmed non-empty string constraints.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { StreetLine } from "@beep/schema/primitives/geo/street-line";
 *
 * const address = S.decodeSync(StreetLine)("742 Evergreen Terrace");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class StreetLine extends S.NonEmptyTrimmedString.pipe(S.maxLength(200)).annotations(
  $I.annotations("street-line/StreetLine", {
    description: "A street line",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.location.streetAddress()),
    jsonSchema: {
      type: "string",
      format: "street-line",
    },
  })
) {}

/**
 * Namespace exposing the `StreetLine` schema helper types.
 *
 * @example
 * import type { StreetLine } from "@beep/schema/primitives/geo/street-line";
 *
 * type Line = StreetLine.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace StreetLine {
  /**
   * Runtime type inferred from the `StreetLine` schema.
   *
   * @example
   * import type { StreetLine } from "@beep/schema/primitives/geo/street-line";
   *
   * let line: StreetLine.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof StreetLine>;
  /**
   * Encoded representation accepted by the `StreetLine` schema.
   *
   * @example
   * import type { StreetLine } from "@beep/schema/primitives/geo/street-line";
   *
   * let encoded: StreetLine.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof StreetLine>;
}

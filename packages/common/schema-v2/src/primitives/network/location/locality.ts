/**
 * Locality schema helpers for capturing user-provided city names.
 *
 * Keeps validation light to accommodate diacritics, punctuation, and regional formatting quirks.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locality } from "@beep/schema-v2/primitives/network/location/locality";
 *
 * const parsed = S.decodeSync(Locality)("San Sebastián");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
import { faker } from "@faker-js/faker";
import type * as B from "effect/Brand";
import { Id } from "@beep/schema-v2/primitives/network/location/_id";
import * as S from "effect/Schema";

/**
 * Human locality / city name schema with lenient character support.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locality } from "@beep/schema-v2/primitives/network/location/locality";
 *
 * const value = S.decodeSync(Locality)("Toronto");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class Locality extends S.String.pipe(
  S.trimmed(),
  S.minLength(1),
  S.maxLength(120),
  // keep it lenient — diacritics, spaces, punctuation are all fine
  // (avoid over-restricting, addresses are messy)
  S.brand("Locality")
).annotations(
  Id.annotations("Locality", {
    description: "Human locality / city name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.location.city() as B.Branded<string, "Locality">),
    jsonSchema: {
      type: "string",
      format: "locality",
    },
  })
) {}

/**
 * Namespace wrapping the `Locality` schema helper types.
 *
 * @example
 * import type { Locality } from "@beep/schema-v2/primitives/network/location/locality";
 *
 * type City = Locality.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace Locality {
  /**
   * Runtime type inferred from the `Locality` schema.
   *
   * @example
   * import type { Locality } from "@beep/schema-v2/primitives/network/location/locality";
   *
   * let city: Locality.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof Locality>;
  /**
   * Encoded representation for the `Locality` schema.
   *
   * @example
   * import type { Locality } from "@beep/schema-v2/primitives/network/location/locality";
   *
   * let encoded: Locality.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof Locality>;
}

/**
 * Postal code schemas covering raw strings and country-specific validators.
 *
 * Provides encoded, decoded, and union schemas built on top of the regex catalog.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PostalCode } from "@beep/schema/primitives/geo/postal-code";
 *
 * const code = S.decodeSync(PostalCode)("94107");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */

import { $GeoId } from "@beep/schema/internal";
import { faker } from "@faker-js/faker";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { POSTAL_CODE_REGEX } from "../../internal/regex/regexes";

const { $PostalCodeId: Id } = $GeoId.compose("postal-code");

/**
 * Raw encoded postal code string schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PostalCodeRawEncoded } from "@beep/schema/primitives/geo/postal-code";
 *
 * const raw = S.decodeSync(PostalCodeRawEncoded)("94107");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class PostalCodeRawEncoded extends S.NonEmptyTrimmedString.pipe(
  S.uppercased(),
  S.minLength(1),
  S.maxLength(16)
).annotations(
  Id.annotations("postal-code/PostalCodeRawEncoded", {
    description: "Postal code in its raw encoded form.",
  })
) {}

/**
 * Namespace describing types for {@link PostalCodeRawEncoded}.
 *
 * @example
 * import type { PostalCodeRawEncoded } from "@beep/schema/primitives/geo/postal-code";
 *
 * type RawPostal = PostalCodeRawEncoded.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace PostalCodeRawEncoded {
  /**
   * Runtime type alias for {@link PostalCodeRawEncoded}.
   *
   * @example
   * import type { PostalCodeRawEncoded } from "@beep/schema/primitives/geo/postal-code";
   *
   * let raw: PostalCodeRawEncoded.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof PostalCodeRawEncoded>;
  /**
   * Encoded type alias for {@link PostalCodeRawEncoded}.
   *
   * @example
   * import type { PostalCodeRawEncoded } from "@beep/schema/primitives/geo/postal-code";
   *
   * let encoded: PostalCodeRawEncoded.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRawEncoded>;
}

/**
 * Branded decoded postal code schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PostalCodeRawDecoded } from "@beep/schema/primitives/geo/postal-code";
 *
 * S.decodeSync(PostalCodeRawDecoded)("12345");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class PostalCodeRawDecoded extends PostalCodeRawEncoded.pipe(S.brand("PostalCodeRaw")).annotations(
  Id.annotations("postal-code/PostalCodeRawDecoded", {
    description: "Postal code in its decoded form.",
  })
) {}

/**
 * Namespace describing types for {@link PostalCodeRawDecoded}.
 *
 * @example
 * import type { PostalCodeRawDecoded } from "@beep/schema/primitives/geo/postal-code";
 *
 * type DecodedPostal = PostalCodeRawDecoded.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace PostalCodeRawDecoded {
  /**
   * Runtime type alias for {@link PostalCodeRawDecoded}.
   *
   * @example
   * import type { PostalCodeRawDecoded } from "@beep/schema/primitives/geo/postal-code";
   *
   * let decoded: PostalCodeRawDecoded.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof PostalCodeRawDecoded>;
  /**
   * Encoded type alias for {@link PostalCodeRawDecoded}.
   *
   * @example
   * import type { PostalCodeRawDecoded } from "@beep/schema/primitives/geo/postal-code";
   *
   * let encoded: PostalCodeRawDecoded.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRawDecoded>;
}

/**
 * Transform enforcing whitespace normalization and branding for postal codes.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PostalCodeRaw } from "@beep/schema/primitives/geo/postal-code";
 *
 * S.decodeSync(PostalCodeRaw)("M5V 1E3");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class PostalCodeRaw extends S.transformOrFail(PostalCodeRawEncoded, PostalCodeRawDecoded, {
  strict: true,
  decode: (input, _, ast) =>
    ParseResult.try({
      try: () => F.pipe(input, Str.replace(/\s+/g, " "), Str.trim, S.decodeUnknownSync(PostalCodeRawDecoded)),
      catch: () => new ParseResult.Type(ast, input, "Invalid postal code"),
    }),
  encode: (value) => ParseResult.succeed(value),
}).annotations(
  Id.annotations("postal-code/PostalCodeRaw", {
    description: "Normalized postal code string.",
  })
) {}

/**
 * Namespace describing types for {@link PostalCodeRaw}.
 *
 * @example
 * import type { PostalCodeRaw } from "@beep/schema/primitives/geo/postal-code";
 *
 * type NormalizedPostal = PostalCodeRaw.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace PostalCodeRaw {
  /**
   * Runtime type alias for {@link PostalCodeRaw}.
   *
   * @example
   * import type { PostalCodeRaw } from "@beep/schema/primitives/geo/postal-code";
   *
   * let normalized: PostalCodeRaw.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof PostalCodeRaw>;
  /**
   * Encoded type alias for {@link PostalCodeRaw}.
   *
   * @example
   * import type { PostalCodeRaw } from "@beep/schema/primitives/geo/postal-code";
   *
   * let encoded: PostalCodeRaw.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRaw>;
}

/**
 * Union schema covering the supported postal code formats across major countries.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PostalCode } from "@beep/schema/primitives/geo/postal-code";
 *
 * const code = S.decodeSync(PostalCode)("SW1A 1AA");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class PostalCode extends S.Union(
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.US)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.CANADA)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.GREAT_BRITAIN)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.GERMANY)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.FRANCE)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.NETHERLANDS)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.AUSTRALIA)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.BRAZIL)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.IRELAND))
).annotations(
  Id.annotations("postal-code/PostalCode", {
    description: "Postal code supporting multiple country formats.",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => PostalCodeRawDecoded.make(faker.location.zipCode())),
  })
) {}

/**
 * Namespace describing types for {@link PostalCode}.
 *
 * @example
 * import type { PostalCode } from "@beep/schema/primitives/geo/postal-code";
 *
 * type Postal = PostalCode.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace PostalCode {
  /**
   * Runtime type alias for {@link PostalCode}.
   *
   * @example
   * import type { PostalCode } from "@beep/schema/primitives/geo/postal-code";
   *
   * let postal: PostalCode.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof PostalCode>;
  /**
   * Encoded type alias for {@link PostalCode}.
   *
   * @example
   * import type { PostalCode } from "@beep/schema/primitives/geo/postal-code";
   *
   * let encoded: PostalCode.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof PostalCode>;
}

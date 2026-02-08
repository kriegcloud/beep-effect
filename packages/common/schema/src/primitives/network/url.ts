/**
 * URL primitives including http/https strings and `URL` instances.
 *
 * Combines trimmed string validation with runtime URL parsing so downstream consumers work with safe URLs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Url } from "@beep/schema/primitives/network/url";
 *
 * S.decodeSync(Url)("https://example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { faker } from "@faker-js/faker";
import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/network/url");
/**
 * URL string schema (http/https).
 *
 * Validation strategy:
 * 1) String hygiene (`NonEmptyTrimmedString`)
 * 2) Shallow pattern check (`/^https?:\/\/.+/`)
 * 3) Host validation via `new URL(...)` (wrapped in `Either.try`)
 *
 * **Note:** This validates *parsability* as a URL, not HTTPS-only security,
 * not reachability, and not any content-type constraints.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { CustomURL } from "@beep/schema/primitives/network/url";
 *
 * const instance = S.decodeUnknownSync(CustomURL)(new URL("https://example.com"));
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class CustomURL extends S.instanceOf(URL)
  .pipe(
    S.filter((a) => Either.try(() => new URL(a)).pipe(Either.isRight)),
    S.annotations({
      arbitrary: () => (fc) => fc.constant(null).map(() => new URL(faker.internet.url())),
    }),
    S.brand("CustomURL")
  )
  .annotations(
    $I.annotations("CustomURL", {
      description: "A URL",
      jsonSchema: { type: "string", format: "url" },
    })
  ) {}

/**
 * Namespace exposing helper types for the `CustomURL` schema.
 *
 * @example
 * import type { CustomURL } from "@beep/schema/primitives/network/url";
 *
 * type CustomURLValue = CustomURL.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace CustomURL {
  /**
   * Runtime type for the `CustomURL` schema.
   *
   * @example
   * import type { CustomURL } from "@beep/schema/primitives/network/url";
   *
   * let url: CustomURL.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof CustomURL.Type;
  /**
   * Encoded representation accepted by the `CustomURL` schema.
   *
   * @example
   * import type { CustomURL } from "@beep/schema/primitives/network/url";
   *
   * type CustomURLEncoded = CustomURL.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof CustomURL.Encoded;
}

/**
 * Schema that transforms arbitrary strings into `URL` instances.
 *
 * Decoding: Parses a string into a `URL` instance, failing if the string is not a valid URL.
 * Encoding: Converts a `URL` instance back to its string representation via `toString()`.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { URLFromString } from "@beep/schema/primitives/network/url";
 *
 * const parsed = S.decodeSync(URLFromString)("https://effect.website");
 * // parsed is a URL instance
 *
 * const encoded = S.encodeSync(URLFromString)(parsed);
 * // encoded is "https://effect.website/"
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export const URLFromString = S.transformOrFail(S.String, CustomURL, {
  strict: true,
  decode: (s, _, ast) =>
    ParseResult.try({
      try: () => new URL(s) as CustomURL.Type,
      catch: () => new ParseResult.Type(ast, s, "Invalid URL string"),
    }),
  encode: (url) => ParseResult.succeed(url.toString()),
}).annotations({
  ...$I.annotations("URLFromString", {
    description: "A URL from a string.",
    jsonSchema: { type: "string", format: "url" },
  }),
  arbitrary: () => (fc) => fc.constant(null).map(() => new URL(faker.internet.url()) as CustomURL.Type),
});

/**
 * Namespace exposing helper types for the `URLFromString` schema.
 *
 * @example
 * import type { URLFromString } from "@beep/schema/primitives/network/url";
 *
 * type URLFromStringValue = URLFromString.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace URLFromString {
  /**
   * Runtime type for the `URLFromString` schema (URL instance).
   *
   * @example
   * import type { URLFromString } from "@beep/schema/primitives/network/url";
   *
   * let parsed: URLFromString.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof URLFromString.Type;
  /**
   * Encoded representation accepted by the `URLFromString` schema (string input).
   *
   * @example
   * import type { URLFromString } from "@beep/schema/primitives/network/url";
   *
   * type URLFromStringEncoded = URLFromString.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof URLFromString.Encoded;
}

/**
 * Trimmed URL string schema that ensures parsable http/https URLs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Url } from "@beep/schema/primitives/network/url";
 *
 * S.decodeSync(Url)("https://example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class Url extends S.Trimmed.pipe(
  S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
  S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight)),
  S.brand("Url")
).annotations(
  $I.annotations("Url", {
    description: "A URL string",
    jsonSchema: { type: "string", format: "url" },
  })
) {}

/**
 * Namespace exposing helper types for the trimmed `Url` schema.
 *
 * @example
 * import type { Url } from "@beep/schema/primitives/network/url";
 *
 * type UrlEncoded = Url.Encoded;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace Url {
  /**
   * Runtime string type for the `Url` schema.
   *
   * @example
   * import type { Url } from "@beep/schema/primitives/network/url";
   *
   * type UrlValue = Url.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof Url.Type;
  /**
   * Encoded representation accepted by the `Url` schema.
   *
   * @example
   * import type { Url } from "@beep/schema/primitives/network/url";
   *
   * type UrlEncoded = Url.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof Url.Encoded;
}

/**
 * HTTPS-only URL string schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpsUrl } from "@beep/schema/primitives/network/url";
 *
 * S.decodeSync(HttpsUrl)("https://example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class HttpsUrl extends S.TemplateLiteral("https://", S.String)
  .pipe(
    S.trimmed({ message: () => "Must be a trimmed string" }),
    S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
    S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight))
  )
  .annotations(
    $I.annotations("HttpsUrl", {
      description: "An https URL",
      jsonSchema: { type: "string", format: "url" },
    })
  ) {}

/**
 * Namespace exposing helper types for the HTTPS-only schema.
 *
 * @example
 * import type { HttpsUrl } from "@beep/schema/primitives/network/url";
 *
 * type HttpsUrlEncoded = HttpsUrl.Encoded;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace HttpsUrl {
  /**
   * Runtime string type for the `HttpsUrl` schema.
   *
   * @example
   * import type { HttpsUrl } from "@beep/schema/primitives/network/url";
   *
   * type HttpsUrlValue = HttpsUrl.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof HttpsUrl.Type;
  /**
   * Encoded representation accepted by the `HttpsUrl` schema.
   *
   * @example
   * import type { HttpsUrl } from "@beep/schema/primitives/network/url";
   *
   * type HttpsUrlEncoded = HttpsUrl.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof HttpsUrl.Encoded;
}

/**
 * HTTP-only URL string schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpUrl } from "@beep/schema/primitives/network/url";
 *
 * S.decodeSync(HttpUrl)("http://localhost:3000");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class HttpUrl extends S.TemplateLiteral("http://", S.String)
  .pipe(
    S.trimmed({ message: () => "Must be a trimmed string" }),
    S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
    S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight))
  )
  .annotations(
    $I.annotations("HttpUrl", {
      description: "An http URL",
      jsonSchema: { type: "string", format: "url" },
    })
  ) {}

/**
 * Namespace exposing helper types for the HTTP-only schema.
 *
 * @example
 * import type { HttpUrl } from "@beep/schema/primitives/network/url";
 *
 * type HttpUrlEncoded = HttpUrl.Encoded;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace HttpUrl {
  /**
   * Runtime string type for the `HttpUrl` schema.
   *
   * @example
   * import type { HttpUrl } from "@beep/schema/primitives/network/url";
   *
   * type HttpUrlValue = HttpUrl.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = typeof HttpUrl.Type;
  /**
   * Encoded representation accepted by the `HttpUrl` schema.
   *
   * @example
   * import type { HttpUrl } from "@beep/schema/primitives/network/url";
   *
   * type HttpUrlEncoded = HttpUrl.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof HttpUrl.Encoded;
}

/**
 * Schema allowing either HTTP or HTTPS URL strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { URLString } from "@beep/schema/primitives/network/url";
 *
 * const parsed = S.decodeSync(URLString)("https://example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class URLString extends S.Union(HttpUrl, HttpsUrl).annotations(
  $I.annotations("UrlString", {
    description: "An http or https URL",
    jsonSchema: { type: "string", format: "url" },
  })
) {
  static readonly make = (i: string) => S.decodeUnknownSync(URLString)(i);
  static readonly is = S.is(URLString);
}

/**
 * Namespace exposing helper types for the union URL schema.
 *
 * @example
 * import type { URLString } from "@beep/schema/primitives/network/url";
 *
 * type URLStringEncoded = URLString.Encoded;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace URLString {
  /**
   * Runtime type representing either HTTP or HTTPS string.
   *
   * @example
   * import type { URLString } from "@beep/schema/primitives/network/url";
   *
   * type URLStringValue = URLString.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = HttpUrl.Type | HttpsUrl.Type;
  /**
   * Encoded representation accepted by the union schema.
   *
   * @example
   * import type { URLString } from "@beep/schema/primitives/network/url";
   *
   * type URLStringEncodedInput = URLString.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = typeof URLString.Encoded;
}

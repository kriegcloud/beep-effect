import { faker } from "@faker-js/faker";
import * as Either from "effect/Either";
import * as S from "effect/Schema";

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
 * @since 0.1.0
 * @category Networking
 */
export class CustomURL extends S.instanceOf(URL)
  .pipe(
    S.filter((a) => Either.try(() => new URL(a)).pipe(Either.isRight)),
    S.annotations({
      arbitrary: () => (fc) => fc.constant(null).map(() => new URL(faker.internet.url())),
    }),
    S.brand("CustomURL")
  )
  .annotations({
    schemaId: Symbol.for("@beep/schema/custom/CustomURL"),
    identifier: "CustomURL",
    description: "A URL",
    title: "URL",
    jsonSchema: { type: "string", format: "url" },
  }) {}

export declare namespace CustomURL {
  /** URL string type (branded). */
  export type Type = typeof CustomURL.Type;
  export type Encoded = typeof CustomURL.Encoded;
}

export class URLString extends S.Trimmed.pipe(
  S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
  S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight)),
  S.brand("URLString")
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/URLString"),
  identifier: "URLString",
  description: "A URL string",
  title: "URL String",
  jsonSchema: { type: "string", format: "url" },
}) {}

export declare namespace URLString {
  /** URL string type (branded). */
  export type Type = typeof URLString.Type;
  export type Encoded = typeof URLString.Encoded;
}

export class HttpsUrl extends S.TemplateLiteral("https://", S.String)
  .pipe(
    S.trimmed({ message: () => "Must be a trimmed string" }),
    S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
    S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight))
  )
  .annotations({
    schemaId: Symbol.for("@beep/schema/custom/HttpsUrl"),
    identifier: "HttpsUrl",
    description: "An https URL",
    title: "Https URL",
    jsonSchema: { type: "string", format: "url" },
  }) {}

export declare namespace HttpsUrl {
  /** URL string type (branded). */
  export type Type = typeof HttpsUrl.Type;
  export type Encoded = typeof HttpsUrl.Encoded;
}

export class HttpUrl extends S.TemplateLiteral("http://", S.String)
  .pipe(
    S.trimmed({ message: () => "Must be a trimmed string" }),
    S.nonEmptyString({ message: () => "Must be a non-empty trimmed string" }),
    S.filter((a) => Either.try(() => new URL(a).toString()).pipe(Either.isRight))
  )
  .annotations({
    schemaId: Symbol.for("@beep/schema/custom/HttpUrl"),
    identifier: "HttpUrl",
    description: "An http URL",
    title: "Http URL",
    jsonSchema: { type: "string", format: "url" },
  }) {}

export declare namespace HttpUrl {
  /** URL string type (branded). */
  export type Type = typeof HttpUrl.Type;
  export type Encoded = typeof HttpUrl.Encoded;
}

export class Url extends S.Union(HttpUrl, HttpsUrl).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Url"),
  identifier: "Url",
  description: "An http or https URL",
  title: "Url",
  jsonSchema: { type: "string", format: "url" },
}) {}

export declare namespace Url {
  /** URL string type (branded). */
  export type Type = typeof Url.Type;
  export type Encoded = typeof Url.Encoded;
}

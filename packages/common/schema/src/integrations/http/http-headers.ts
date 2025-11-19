/**
 * HTTP header schema helpers used across integration builders.
 *
 * @example
 * import { HttpHeaders } from "@beep/schema/integrations/http/http-headers";
 * import * as S from "effect/Schema";
 *
 * const parse = S.decodeSync(HttpHeaders);
 * const headers = parse({ "content-type": "application/json" });
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Schema describing a map of HTTP header key/value pairs.
 *
 * Annotated with identity metadata so docgen surfaces a stable identifier.
 *
 * @category Integrations/Http
 * @since 0.1.0
 * @example
 * import { HttpHeaders } from "@beep/schema/integrations/http/http-headers";
 * import * as S from "effect/Schema";
 *
 * const headers = S.decodeSync(HttpHeaders)({ authorization: "Bearer token" });
 */
export class HttpHeaders extends S.Record({
  key: S.String,
  value: S.String,
}).annotations(
  Id.annotations("HttpHeaders", {
    identifier: "HttpHeaders",
    title: "HTTP Headers",
    description: "Key/value map representing HTTP request or response headers.",
  })
) {}

/**
 * Namespace exposing runtime and encoded types for {@link HttpHeaders}.
 *
 * @category Integrations/Http
 * @since 0.1.0
 * @example
 * import type { HttpHeaders } from "@beep/schema/integrations/http/http-headers";
 *
 * type Value = HttpHeaders.Encoded;
 */
export declare namespace HttpHeaders {
  /**
   * Runtime type inferred from {@link HttpHeaders}.
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Type = typeof HttpHeaders.Type;
  /**
   * Encoded representation emitted by {@link HttpHeaders}.
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Encoded = typeof HttpHeaders.Encoded;
}

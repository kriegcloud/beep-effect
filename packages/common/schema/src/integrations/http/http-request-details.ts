/**
 * HTTP request metadata schema captured during error reporting and telemetry.
 *
 * Wraps the HTTP method, URL, params, hash, and headers so downstream services can serialize request context alongside
 * errors or audit logs.
 *
 * @example
 * import * as Http from "@beep/schema/integrations/http";
 * import * as S from "effect/Schema";
 * import * as O from "effect/Option";
 *
 * const request = S.decodeSync(Http.HttpRequestDetails)({
 *   method: "POST",
 *   url: "https://api.example.com/v1/people",
 *   urlParams: [["orgId", "123"], ["limit", "10"]],
 *   hash: O.some("#profile"),
 *   headers: { "content-type": "application/json" },
 * });
 *
 * @category Integrations/Http
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { URLString } from "../../primitives/network/url";
import { HttpHeaders } from "./http-headers";
import { HttpMethod } from "./http-method";

const $I = $SchemaId.create("integrations/http/http-request-details");
const UrlParamEntry = S.Tuple(S.String, S.String).annotations(
  $I.annotations("HttpRequestDetailsUrlParam", {
    identifier: "HttpRequestDetailsUrlParam",
    title: "HTTP URL Parameter",
    description: "Tuple representing a single query parameter (key/value).",
  })
);

/**
 * Schema describing HTTP request details (method, URL, headers, and hash/params).
 *
 * @example
 * import * as Http from "@beep/schema/integrations/http";
 * import * as S from "effect/Schema";
 * import * as O from "effect/Option";
 *
 * const details = S.decodeSync(Http.HttpRequestDetails)({
 *   method: "GET",
 *   url: "https://example.com/profile",
 *   urlParams: [["tab", "activity"]],
 *   hash: O.some("#stats"),
 *   headers: { authorization: "Bearer token" },
 * });
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export class HttpRequestDetails extends S.Struct({
  method: HttpMethod,
  url: URLString,
  urlParams: S.Array(UrlParamEntry),
  hash: S.OptionFromSelf(S.String),
  headers: HttpHeaders,
}).annotations(
  $I.annotations("HttpRequestDetails", {
    identifier: "HttpRequestDetails",
    title: "HTTP Request Details",
    description: "Captures method, URL, params, hash, and headers for a request.",
  })
) {}

/**
 * Namespace exposing runtime and encoded types for {@link HttpRequestDetails}.
 *
 * @category Integrations/Http
 * @since 0.1.0
 * @example
 * import type { HttpRequestDetails } from "@beep/schema/integrations/http/http-request-details";
 *
 * type Details = HttpRequestDetails.Type;
 */
export declare namespace HttpRequestDetails {
  /**
   * Runtime type produced by {@link HttpRequestDetails}.
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof HttpRequestDetails>;
  /**
   * Encoded representation accepted by {@link HttpRequestDetails}.
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof HttpRequestDetails>;
}

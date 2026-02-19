import { $SchemaId } from "@beep/identity/packages";
import { MappedLiteralKit } from "../../derived/kits";

const $I = $SchemaId.create("integrations/http/http-status-codes");

export class HttpStatusCode extends MappedLiteralKit(
  // 2xx Success
  ["OK", 200],
  ["CREATED", 201],
  ["ACCEPTED", 202],
  ["NO_CONTENT", 204],
  // 3xx Redirection
  ["MULTIPLE_CHOICES", 300],
  ["MOVED_PERMANENTLY", 301],
  ["FOUND", 302],
  ["SEE_OTHER", 303],
  ["NOT_MODIFIED", 304],
  ["TEMPORARY_REDIRECT", 307],
  // 4xx Client Errors
  ["BAD_REQUEST", 400],
  ["UNAUTHORIZED", 401],
  ["PAYMENT_REQUIRED", 402],
  ["FORBIDDEN", 403],
  ["NOT_FOUND", 404],
  ["METHOD_NOT_ALLOWED", 405],
  ["NOT_ACCEPTABLE", 406],
  ["PROXY_AUTHENTICATION_REQUIRED", 407],
  ["REQUEST_TIMEOUT", 408],
  ["CONFLICT", 409],
  ["GONE", 410],
  ["LENGTH_REQUIRED", 411],
  ["PRECONDITION_FAILED", 412],
  ["PAYLOAD_TOO_LARGE", 413],
  ["URI_TOO_LONG", 414],
  ["UNSUPPORTED_MEDIA_TYPE", 415],
  ["RANGE_NOT_SATISFIABLE", 416],
  ["EXPECTATION_FAILED", 417],
  ["IM_A_TEAPOT", 418],
  ["MISDIRECTED_REQUEST", 421],
  ["UNPROCESSABLE_ENTITY", 422],
  ["LOCKED", 423],
  ["FAILED_DEPENDENCY", 424],
  ["TOO_EARLY", 425],
  ["UPGRADE_REQUIRED", 426],
  ["PRECONDITION_REQUIRED", 428],
  ["TOO_MANY_REQUESTS", 429],
  ["REQUEST_HEADER_FIELDS_TOO_LARGE", 431],
  ["UNAVAILABLE_FOR_LEGAL_REASONS", 451],
  // 5xx Server Errors
  ["INTERNAL_SERVER_ERROR", 500],
  ["NOT_IMPLEMENTED", 501],
  ["BAD_GATEWAY", 502],
  ["SERVICE_UNAVAILABLE", 503],
  ["GATEWAY_TIMEOUT", 504],
  ["HTTP_VERSION_NOT_SUPPORTED", 505],
  ["VARIANT_ALSO_NEGOTIATES", 506],
  ["INSUFFICIENT_STORAGE", 507],
  ["LOOP_DETECTED", 508],
  ["NOT_EXTENDED", 510],
  ["NETWORK_AUTHENTICATION_REQUIRED", 511]
).annotations(
  $I.annotations("HttpStatusCode", {
    description: "An HTTP status code.",
  })
) {}

export declare namespace HttpStatusCode {
  /**
   * The decoded value of the HTTP status code.
   * @example
   * ```ts
   * import type { BS } from "@beep/schema";
   * const OkCode: HttpStatusCode.Type = "OK";
   * ```
   */
  export type Type = typeof HttpStatusCode.Type;
  /**
   * The encoded value of the HTTP status code.
   * @example
   * ```ts
   * import type { BS } from "@beep/schema";
   * const OkCode: HttpStatusCode.Encoded = 200;
   * ```
   */
  export type Encoded = typeof HttpStatusCode.Encoded; // 200, 201... etc
}

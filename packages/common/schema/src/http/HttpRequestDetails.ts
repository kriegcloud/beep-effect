import { URLString } from "@beep/schema/custom";
import { HttpHeaders } from "@beep/schema/http/HttpHeaders";
import { HttpMethod } from "@beep/schema/http/HttpMethod";
import * as S from "effect/Schema";

/**
 * Schema for HTTP request details used in error reporting.
 *
 * Captures comprehensive information about HTTP requests that failed,
 * enabling detailed error analysis and debugging.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk";
 * import * as O from "effect/Option";
 * import { BS } from "@beep/schema";
 * const requestDetails: typeof IamError.HttpRequestDetails.Type = {
 *   method: "POST",
 *   url: BS.URLString.make("https://api.openai.com/v1/completions"),
 *   urlParams: [["model", "gpt-4"], ["stream", "false"]],
 *   hash: O.some("#section1"),
 *   headers: { "Content-Type": "application/json" }
 * }
 * ```
 *
 * @since 1.0.0
 * @category Schemas
 */
export class HttpRequestDetails extends S.Class<HttpRequestDetails>("HttpRequestDetails")(
  {
    method: HttpMethod,
    url: URLString,
    urlParams: S.Array(S.Tuple(S.String, S.String)),
    hash: S.Option(S.String),
    headers: HttpHeaders,
  },
  {
    schemaId: Symbol.for("@beep/schema/http/HttpRequestDetails"),
    identifier: "HttpRequestDetails",
    title: "Http Request Details",
    description: "Represents a http request details",
  }
) {}

export declare namespace HttpRequestDetails {
  export type Type = S.Schema.Type<typeof HttpRequestDetails>;
  export type Encoded = S.Schema.Encoded<typeof HttpRequestDetails>;
}

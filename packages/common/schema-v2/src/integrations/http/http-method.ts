/**
 * HTTP method literal kits and schema validators.
 *
 * Ensures RPC contracts, runtime request guards, and documentation surfaces agree on uppercase HTTP verbs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpMethod } from "@beep/schema-v2/integrations/http/http-method";
 *
 * const method = S.decodeSync(HttpMethod)("POST");
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
import type * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Literal kit for HTTP method strings.
 *
 * @example
 * import { HttpMethodKit } from "@beep/schema-v2/integrations/http/http-method";
 *
 * const verbs = HttpMethodKit.Options;
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export const HttpMethodKit = stringLiteralKit("GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS");

/**
 * Schema validating HTTP request methods.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpMethod } from "@beep/schema-v2/integrations/http/http-method";
 *
 * const method = S.decodeSync(HttpMethod)("POST");
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export class HttpMethod extends HttpMethodKit.Schema.annotations(
  Id.annotations("HttpMethod", {
    description: "The HTTP verb used by a request.",
    examples: HttpMethodKit.Options,
  })
) {
  /** @category Integrations/Http @since 0.1.0 */
  static readonly Options = HttpMethodKit.Options;
  /** @category Integrations/Http @since 0.1.0 */
  static readonly Enum = HttpMethodKit.Enum;
}

/**
 * Namespace exposing helper types for {@link HttpMethod}.
 *
 * @example
 * import type { HttpMethod } from "@beep/schema-v2/integrations/http/http-method";
 *
 * let method: HttpMethod.Type;
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export declare namespace HttpMethod {
  /**
   * Runtime type for {@link HttpMethod}.
   *
   * @example
   * import type { HttpMethod } from "@beep/schema-v2/integrations/http/http-method";
   *
   * let method: HttpMethod.Type;
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof HttpMethod>;
  /**
   * Encoded literal representation accepted by {@link HttpMethod}.
   *
   * @example
   * import type { HttpMethod } from "@beep/schema-v2/integrations/http/http-method";
   *
   * let encoded: HttpMethod.Encoded;
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof HttpMethod>;
}

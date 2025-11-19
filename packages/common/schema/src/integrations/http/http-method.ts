/**
 * HTTP method literal kits and schema validators.
 *
 * Ensures RPC contracts, runtime request guards, and documentation surfaces agree on uppercase HTTP verbs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpMethod } from "@beep/schema/integrations/http/http-method";
 *
 * const method = S.decodeSync(HttpMethod)("POST");
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import type * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Schema validating HTTP request methods.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HttpMethod } from "@beep/schema/integrations/http/http-method";
 *
 * const method = S.decodeSync(HttpMethod)("POST");
 *
 * @category Integrations/Http
 * @since 0.1.0
 */
export class HttpMethod extends StringLiteralKit("GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS").annotations(
  Id.annotations("HttpMethod", {
    description: "The HTTP verb used by a request.",
  })
) {
}

/**
 * Namespace exposing helper types for {@link HttpMethod}.
 *
 * @example
 * import type { HttpMethod } from "@beep/schema/integrations/http/http-method";
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
   * import type { HttpMethod } from "@beep/schema/integrations/http/http-method";
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
   * import type { HttpMethod } from "@beep/schema/integrations/http/http-method";
   *
   * let encoded: HttpMethod.Encoded;
   *
   * @category Integrations/Http
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof HttpMethod>;
}

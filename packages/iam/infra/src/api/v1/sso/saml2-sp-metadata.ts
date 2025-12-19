/**
 * @module saml2-sp-metadata
 *
 * Handler implementation for the SAML2 SP metadata endpoint.
 * Returns SAML2 Service Provider metadata XML for configuring identity providers.
 *
 * @category exports
 * @since 0.1.0
 */

import type { V1 } from "@beep/iam-domain/api";
import { IamAuthError } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

type HandlerArgs = {
  readonly urlParams: V1.SSO.Saml2SpMetadata.UrlParams;
};
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the SAML2 SP metadata endpoint.
 *
 * Returns SAML2 Service Provider metadata XML for configuring identity providers.
 * Response Content-Type is application/xml.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SAML2SpMetadata")(
  function* ({ urlParams }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Better Auth requires providerId, use a default if not provided
    const providerId = urlParams.providerId ?? "default";
    const format: "json" | "xml" = urlParams.format === "json" ? "json" : "xml";

    // Call Better Auth - spMetadata may return { status, response } or string
    const result = yield* Effect.tryPromise(() =>
      auth.api.spMetadata({
        query: { providerId, format } as const,
        headers: request.headers as Record<string, string>,
      })
    );

    // Handle different response shapes from Better Auth
    const xmlContent =
      typeof result === "string" ? result : String((result as { response?: unknown })?.response ?? result);

    // Return XML response with proper content type
    return F.pipe(
      HttpServerResponse.text(xmlContent),
      HttpServerResponse.setHeader("Content-Type", format === "json" ? "application/json" : "application/xml")
    );
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get SAML2 SP metadata.",
        cause: e,
      })
  )
);

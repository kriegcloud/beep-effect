/**
 * @module saml2-sp-acs
 *
 * Handler implementation for the SAML2 SP ACS endpoint.
 * Handles SAML2 assertions at the Service Provider Assertion Consumer Service.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, type V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import type * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import { forwardCookieResponse } from "../../common/schema-helpers";

type HandlerArgs = {
  readonly path: V1.SSO.Saml2SpAcs.PathParams;
  readonly payload: V1.SSO.Saml2SpAcs.Payload;
};
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the SAML2 SP ACS endpoint.
 *
 * Handles SAML2 assertions at the Service Provider Assertion Consumer Service endpoint.
 * This endpoint is auto-handled by Better Auth's sso() plugin.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SAML2SpAcs")(function* ({ path, payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  // Build body conditionally to avoid spreading undefined
  const body: BetterAuthBridge.SSOInput.Saml2Callback =
    payload.RelayState != null
      ? { SAMLResponse: payload.SAMLResponse, RelayState: payload.RelayState }
      : { SAMLResponse: payload.SAMLResponse };

  const result = yield* BetterAuthBridge.saml2SpAcs(authApi, {
    providerId: path.providerId,
    body,
    headers: request.headers,
  });

  return yield* forwardCookieResponse(result.headers, result.response);
}, IamAuthError.flowMap("sso"));

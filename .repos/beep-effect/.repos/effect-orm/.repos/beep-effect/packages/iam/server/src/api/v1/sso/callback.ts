/**
 * @module callback
 *
 * Handler implementation for the SSO callback endpoint.
 * Handles OIDC authorization code callback from SSO providers.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, type V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import type * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import { forwardCookieResponse } from "../../common/schema-helpers";

type HandlerArgs = {
  readonly path: V1.SSO.Callback.PathParams;
  readonly urlParams: V1.SSO.Callback.UrlParams;
};
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the SSO callback endpoint.
 *
 * Handles the OIDC authorization code callback from SSO providers.
 * This endpoint is auto-handled by Better Auth's sso() plugin.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SSOCallback")(function* ({ path, urlParams }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  // Cast headers for Better Auth type compatibility
  const result = yield* BetterAuthBridge.ssoCallback(authApi, {
    providerId: path.providerId,
    query: {
      code: (urlParams.code ?? null) as string | null,
      state: (urlParams.state ?? null) as string | null,
      error: (urlParams.error ?? null) as string | null,
      error_description: (urlParams.error_description ?? null) as string | null,
    },
    headers: request.headers as Record<string, string>,
  });

  return yield* forwardCookieResponse(result.headers, result.response);
}, IamAuthError.flowMap("sso-callback"));

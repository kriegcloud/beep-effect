/**
 * @module authorize
 *
 * Handler implementation for the OAuth2 authorize endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";

type HandlerArgs = { readonly urlParams: V1.OAuth2.Authorize.UrlParams };
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the OAuth2 authorize endpoint.
 *
 * Initiates the OAuth2 authorization code flow by proxying
 * to Better Auth's oidcProvider plugin.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2Authorize")(function* ({ urlParams }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2Authorize(authApi, {
    query: {
      client_id: urlParams.client_id,
      redirect_uri: urlParams.redirect_uri,
      response_type: urlParams.response_type,
      scope: O.getOrNull(urlParams.scope),
      state: O.getOrNull(urlParams.state),
      code_challenge: O.getOrNull(urlParams.code_challenge),
      code_challenge_method: O.getOrNull(urlParams.code_challenge_method),
      nonce: O.getOrNull(urlParams.nonce),
      prompt: O.getOrNull(urlParams.prompt),
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.Authorize.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-authorize"));

/**
 * @module token
 *
 * Handler implementation for the OAuth2 token endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.OAuth2.Token.Payload>;

/**
 * Handler for the OAuth2 token endpoint.
 *
 * Exchanges an authorization code for an access token, or refreshes
 * an existing access token using a refresh token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2Token")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2Token(authApi, {
    body: {
      grant_type: payload.grant_type,
      code: payload.code ?? null,
      redirect_uri: payload.redirect_uri ?? null,
      client_id: payload.client_id ?? null,
      client_secret: payload.client_secret ?? null,
      refresh_token: payload.refresh_token ?? null,
      code_verifier: payload.code_verifier ?? null,
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.Token.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-token"));

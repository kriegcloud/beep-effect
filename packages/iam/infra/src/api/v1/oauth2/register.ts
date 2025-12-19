/**
 * @module register
 *
 * Handler implementation for the OAuth2 dynamic client registration endpoint.
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
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.OAuth2.Register.Payload>;

/**
 * Handler for the OAuth2 register endpoint.
 *
 * Dynamically registers a new OAuth2 client application following
 * RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2Register")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2Register(authApi, {
    body: {
      redirect_uris: payload.redirect_uris,
      token_endpoint_auth_method: payload.token_endpoint_auth_method ?? null,
      grant_types: payload.grant_types ?? null,
      response_types: payload.response_types ?? null,
      client_name: payload.client_name ?? null,
      client_uri: payload.client_uri ?? null,
      logo_uri: payload.logo_uri ?? null,
      scope: payload.scope ?? null,
      contacts: payload.contacts ?? null,
      tos_uri: payload.tos_uri ?? null,
      policy_uri: payload.policy_uri ?? null,
      jwks_uri: payload.jwks_uri ?? null,
      jwks: payload.jwks ?? null,
      metadata: payload.metadata ?? null,
      software_id: payload.software_id ?? null,
      software_version: payload.software_version ?? null,
      software_statement: payload.software_statement ?? null,
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.Register.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-register"));

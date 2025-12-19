/**
 * @module consent
 *
 * Handler implementation for the OAuth2 consent endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.OAuth2.Consent.Payload>;

/**
 * Handler for the OAuth2 consent endpoint.
 *
 * Processes the user's consent decision for an OAuth2 authorization request.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2Consent")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2Consent(authApi, {
    body: {
      accept: payload.accept,
      consent_code: payload.consent_code ?? null,
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.Consent.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-consent"));

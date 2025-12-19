/**
 * @module userinfo
 *
 * Handler implementation for the OAuth2/OpenID Connect userinfo endpoint.
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

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for the OAuth2/OpenID Connect userinfo endpoint.
 *
 * Returns claims about the authenticated user. The access token
 * must be provided in the Authorization header.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = () =>
  Effect.gen(function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    const authApi: Record<string, unknown> = auth.api;

    const result = yield* BetterAuthBridge.oauth2Userinfo(authApi, {
      headers: request.headers,
    });

    const decoded = yield* S.decodeUnknown(V1.OAuth2.Userinfo.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  }).pipe(IamAuthError.mapError({ operation: "oauth2-userinfo" }), Effect.withSpan("oauth2-userinfo"));

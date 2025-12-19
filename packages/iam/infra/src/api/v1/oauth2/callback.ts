/**
 * @module callback
 *
 * Handler implementation for the OAuth2 callback endpoint.
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

type HandlerArgs = {
  readonly path: V1.OAuth2.Callback.PathParams;
  readonly urlParams: V1.OAuth2.Callback.UrlParams;
};
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the OAuth2 callback endpoint.
 *
 * Handles the callback from an OAuth2 provider after the user has
 * authorized or denied the request.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2Callback")(function* ({ path, urlParams }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2Callback(authApi, {
    params: { providerId: path.providerId },
    query: {
      code: O.getOrNull(urlParams.code),
      error: O.getOrNull(urlParams.error),
      error_description: O.getOrNull(urlParams.error_description),
      state: O.getOrNull(urlParams.state),
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.Callback.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-callback"));

/**
 * @module get-client
 *
 * Handler implementation for the OAuth2 get client endpoint.
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

type HandlerArgs = {
  readonly path: V1.OAuth2.GetClient.PathParams;
};
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the OAuth2 get client endpoint.
 *
 * Retrieves public information about an OAuth2 client application.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("OAuth2GetClient")(function* ({ path }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const authApi: Record<string, unknown> = auth.api;

  const result = yield* BetterAuthBridge.oauth2GetClient(authApi, {
    params: { id: path.id },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.OAuth2.GetClient.Success)(result);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("oauth2-get-client"));

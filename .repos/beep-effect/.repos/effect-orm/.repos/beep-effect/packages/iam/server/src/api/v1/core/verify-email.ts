/**
 * @module verify-email
 *
 * Handler implementation for the verify-email endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import type * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerArgs = { readonly urlParams: V1.Core.VerifyEmail.UrlParams };
type HandlerEffect = (
  args: HandlerArgs
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;

/**
 * Handler for the verify-email endpoint.
 *
 * Calls Better Auth `auth.api.verifyEmail` to verify a user's email address
 * using a token sent via email. The token is passed as a URL query parameter.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("VerifyEmail")(function* ({ urlParams }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.VerifyEmail.UrlParams,
    successSchema: V1.Core.VerifyEmail.Success,
    payload: urlParams,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.verifyEmail({
          query: body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("verify-email"));

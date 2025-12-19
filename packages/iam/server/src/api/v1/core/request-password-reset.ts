/**
 * @module request-password-reset
 *
 * Handler implementation for the request-password-reset endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Core.RequestPasswordReset.Payload>;

/**
 * Handler for the request-password-reset endpoint.
 *
 * Calls Better Auth `auth.api.requestPasswordReset` to send a password reset email.
 * Note: The client-side method is `forgetPassword`, but server API uses `requestPasswordReset`.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("RequestPasswordReset")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.RequestPasswordReset.Payload,
    successSchema: V1.Core.RequestPasswordReset.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.requestPasswordReset({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("request-password-reset"));

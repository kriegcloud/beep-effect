/**
 * @module send-verification-email
 *
 * Handler implementation for the send-verification-email endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Core.SendVerificationEmail.Payload>;

/**
 * Handler for the send-verification-email endpoint.
 *
 * Calls Better Auth `auth.api.sendVerificationEmail` to send an email
 * verification link to the specified email address.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SendVerificationEmail")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.SendVerificationEmail.Payload,
    successSchema: V1.Core.SendVerificationEmail.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.sendVerificationEmail({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("send-verification-email"));

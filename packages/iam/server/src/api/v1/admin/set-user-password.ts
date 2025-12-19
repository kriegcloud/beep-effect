/**
 * @module set-user-password
 *
 * Handler implementation for the set-user-password endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAdminEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Admin.SetUserPassword.Payload>;

/**
 * Handler for the set-user-password endpoint.
 *
 * Calls Better Auth `auth.api.setUserPassword` to set a user's password.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SetUserPassword")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.SetUserPassword.Payload,
    successSchema: V1.Admin.SetUserPassword.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.setUserPassword({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("set-user-password"));

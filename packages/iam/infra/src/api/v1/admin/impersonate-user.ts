/**
 * @module impersonate-user
 *
 * Handler implementation for the impersonate-user endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAdminEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Admin.ImpersonateUser.Payload>;

/**
 * Handler for the impersonate-user endpoint.
 *
 * Calls Better Auth `auth.api.impersonateUser` to impersonate a user.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ImpersonateUser")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.ImpersonateUser.Payload,
    successSchema: V1.Admin.ImpersonateUser.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.impersonateUser({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("impersonate-user"));

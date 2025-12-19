/**
 * @module unban-user
 *
 * Handler implementation for the unban-user endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Admin.UnbanUser.Payload>;

/**
 * Handler for the unban-user endpoint.
 *
 * Calls Better Auth `auth.api.unbanUser` to unban a user.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("UnbanUser")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.UnbanUser.Payload,
    successSchema: V1.Admin.UnbanUser.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.unbanUser({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("unban-user"));

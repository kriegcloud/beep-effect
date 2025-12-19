/**
 * @module remove-user
 *
 * Handler implementation for the remove-user endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Admin.RemoveUser.Payload>;

/**
 * Handler for the remove-user endpoint.
 *
 * Calls Better Auth `auth.api.removeUser` to remove a user.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("RemoveUser")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.RemoveUser.Payload,
    successSchema: V1.Admin.RemoveUser.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.removeUser({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("remove-user"));

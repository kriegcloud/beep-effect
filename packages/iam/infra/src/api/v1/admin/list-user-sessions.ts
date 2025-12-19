/**
 * @module list-user-sessions
 *
 * Handler implementation for the list-user-sessions endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Admin.ListUserSessions.Payload>;

/**
 * Handler for the list-user-sessions endpoint.
 *
 * Calls Better Auth `auth.api.listUserSessions` to list a user's sessions.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ListUserSessions")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.ListUserSessions.Payload,
    successSchema: V1.Admin.ListUserSessions.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.listUserSessions({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("list-user-sessions"));

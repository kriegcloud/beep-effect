/**
 * @module revoke-user-session
 *
 * Handler implementation for the revoke-user-session endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Admin.RevokeUserSession.Payload>;

/**
 * Handler for the revoke-user-session endpoint.
 *
 * Calls Better Auth `auth.api.revokeUserSession` to revoke a specific session.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("RevokeUserSession")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Admin.RevokeUserSession.Payload,
    successSchema: V1.Admin.RevokeUserSession.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.revokeUserSession({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("revoke-user-session"));

/**
 * @module revoke-other-sessions
 *
 * Handler implementation for the revoke-other-sessions endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthQuery } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for the revoke-other-sessions endpoint.
 *
 * Calls Better Auth `auth.api.revokeOtherSessions` to revoke all other sessions.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("RevokeOtherSessions")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthQuery({
      successSchema: V1.Core.RevokeOtherSessions.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.revokeOtherSessions({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to revoke other sessions.",
        cause: e,
      })
  )
);

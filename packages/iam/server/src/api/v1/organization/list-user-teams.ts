/**
 * @module organization/list-user-teams
 *
 * Handler implementation for the list-user-teams endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAdminQuery } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for the list-user-teams endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ListUserTeams")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAdminQuery({
      successSchema: V1.Organization.ListUserTeams.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.listUserTeams({
            headers,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to list user teams.",
        cause: e,
      })
  )
);

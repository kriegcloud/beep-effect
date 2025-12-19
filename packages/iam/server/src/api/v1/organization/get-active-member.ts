/**
 * @module organization/get-active-member
 *
 * Handler implementation for the get-active-member endpoint.
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
 * Handler for the get-active-member endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetActiveMember")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAdminQuery({
      successSchema: V1.Organization.GetActiveMember.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.getActiveMember({
            headers,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get active member.",
        cause: e,
      })
  )
);

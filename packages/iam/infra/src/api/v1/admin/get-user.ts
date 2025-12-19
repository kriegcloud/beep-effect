/**
 * @module get-user
 *
 * Handler implementation for the get-user endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Admin.GetUser.QueryParams>;

/**
 * Handler for the get-user endpoint.
 *
 * Calls Better Auth `auth.api.getUser` to get a user by ID.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetUser")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    const userId = F.pipe(urlParams.id, O.getOrUndefined);
    if (userId === undefined) {
      return yield* Effect.fail(
        new IamAuthError({
          message: "User ID is required.",
        })
      );
    }

    const response = yield* Effect.tryPromise(() =>
      auth.api.getUser({
        query: {
          id: userId,
        },
        headers: request.headers,
      })
    );

    const decoded = yield* S.decodeUnknown(V1.Admin.GetUser.Success)({ user: response });
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get user.",
        cause: e,
      })
  )
);

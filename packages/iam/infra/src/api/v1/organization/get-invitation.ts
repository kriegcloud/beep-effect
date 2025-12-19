/**
 * @module organization/get-invitation
 *
 * Handler implementation for the get-invitation endpoint.
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

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Organization.GetInvitation.Query>;

/**
 * Handler for the get-invitation endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetInvitation")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    const invitationId = F.pipe(urlParams.id, O.getOrUndefined);
    if (invitationId === undefined) {
      return yield* Effect.fail(
        new IamAuthError({
          message: "Invitation ID is required.",
        })
      );
    }

    const response = yield* Effect.tryPromise(() =>
      auth.api.getInvitation({
        query: {
          id: invitationId,
        },
        headers: request.headers,
      })
    );

    const decoded = yield* S.decodeUnknown(V1.Organization.GetInvitation.InvitationWithDetails)(response);
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get invitation.",
        cause: e,
      })
  )
);

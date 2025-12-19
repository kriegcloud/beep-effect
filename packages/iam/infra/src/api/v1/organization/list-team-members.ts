/**
 * @module organization/list-team-members
 *
 * Handler implementation for the list-team-members endpoint.
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

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Organization.ListTeamMembers.Query>;

/**
 * Handler for the list-team-members endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ListTeamMembers")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    const response = yield* Effect.tryPromise(() =>
      auth.api.listTeamMembers({
        query: {
          teamId: F.pipe(urlParams.teamId, O.getOrUndefined),
        },
        headers: request.headers,
      })
    );

    const decoded = yield* S.decodeUnknown(V1.Organization.ListTeamMembers.Success)(response);
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to list team members.",
        cause: e,
      })
  )
);

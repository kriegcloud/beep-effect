/**
 * @module organization/get-team
 *
 * Handler implementation for the get-team endpoint.
 * Since Better Auth doesn't expose a standalone getTeam API,
 * we use listOrganizationTeams and filter by teamId.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, type V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { Common } from "../../common";

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Organization.GetTeam.Query>;

/**
 * Handler for the get-team endpoint.
 * Uses listOrganizationTeams and filters by teamId since Better Auth
 * doesn't provide a standalone getTeam endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetTeam")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    const teamIdOption = urlParams.teamId;

    // First, get the active team from session if no teamId provided
    const targetTeamId = yield* F.pipe(
      teamIdOption,
      O.match({
        onNone: () =>
          Effect.tryPromise(() =>
            auth.api.getSession({
              headers: request.headers,
            })
          ).pipe(
            Effect.map((response) => O.fromNullable(response?.session?.activeTeamId)),
            Effect.catchAll(() => Effect.succeed(O.none<string>()))
          ),
        onSome: (id) => Effect.succeed(O.some(id)),
      })
    );

    // List teams and filter
    const teamsResponse = yield* Effect.tryPromise(() =>
      auth.api.listOrganizationTeams({
        headers: request.headers,
      })
    );

    const teams = teamsResponse ?? [];

    const foundTeam = F.pipe(
      targetTeamId,
      O.flatMap((id) =>
        F.pipe(
          teams,
          A.findFirst((team) => team.id === id)
        )
      )
    );

    if (O.isNone(foundTeam)) {
      return yield* Effect.fail(
        new IamAuthError({
          message: "Team not found.",
        })
      );
    }

    // Better Auth team doesn't have all fields our Team.Model expects (like slug),
    // so we return the raw team data. Schema validation should be adjusted in domain.
    return yield* HttpServerResponse.json(foundTeam.value);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get team.",
        cause: e,
      })
  )
);

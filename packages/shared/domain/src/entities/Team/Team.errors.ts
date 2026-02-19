import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Team/Team.errors");

export class TeamNotFoundError extends S.TaggedError<TeamNotFoundError>()(
  $I`TeamNotFoundError`,
  {
    id: SharedEntityIds.TeamId,
  },
  $I.annotationsHttp("TeamNotFoundError", {
    status: 404,
    description: "Error when a team with the specified ID cannot be found.",
  })
) {}

export class TeamPermissionDeniedError extends S.TaggedError<TeamPermissionDeniedError>()(
  $I`TeamPermissionDeniedError`,
  {
    id: SharedEntityIds.TeamId,
  },
  $I.annotationsHttp("TeamPermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the team.",
  })
) {}

export const Errors = S.Union(TeamNotFoundError, TeamPermissionDeniedError);
export type Errors = typeof Errors.Type;

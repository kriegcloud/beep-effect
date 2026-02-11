import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/TeamMember/TeamMember.errors");

export class TeamMemberNotFoundError extends S.TaggedError<TeamMemberNotFoundError>()(
  $I`TeamMemberNotFoundError`,
  { id: IamEntityIds.TeamMemberId },
  $I.annotationsHttp("TeamMemberNotFoundError", {
    status: 404,
    description: "Error when a team member with the specified ID cannot be found.",
  })
) {}

export class TeamMemberPermissionDeniedError extends S.TaggedError<TeamMemberPermissionDeniedError>()(
  $I`TeamMemberPermissionDeniedError`,
  { id: IamEntityIds.TeamMemberId },
  $I.annotationsHttp("TeamMemberPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the team member.",
  })
) {}

export const Errors = S.Union(TeamMemberNotFoundError, TeamMemberPermissionDeniedError);
export type Errors = typeof Errors.Type;

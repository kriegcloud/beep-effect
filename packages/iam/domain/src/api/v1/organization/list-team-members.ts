/**
 * @module organization/list-team-members
 *
 * List all members of a team.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { TeamMember } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-team-members");

/**
 * Query parameters for listing team members.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Query extends S.Class<Query>($I`Query`)(
  {
    teamId: S.optionalWith(SharedEntityIds.TeamId, { as: "Option", exact: true }).annotations({
      description: "The ID of the team.",
    }),
  },
  $I.annotations("ListTeamMembersQuery", {
    description: "Query parameters for listing team members.",
  })
) {}

/**
 * Success response with list of team members.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    members: S.Array(TeamMember.Model).annotations({
      description: "List of team members.",
    }),
  },
  $I.annotations("ListTeamMembersSuccess", {
    description: "Success response with list of team members.",
  })
) {}

/**
 * List team members endpoint contract.
 *
 * GET /organization/list-team-members
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-team-members", "/list-team-members")
  .setUrlParams(Query)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

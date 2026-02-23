/**
 * @module organization/add-team-member
 *
 * Add a member to a team.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { TeamMember } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/add-team-member");

/**
 * Payload for adding a team member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId.annotations({
      description: "The team the user should be a member of.",
    }),
    userId: SharedEntityIds.UserId.annotations({
      description: "The user ID of the user to be added as a member.",
    }),
  },
  $I.annotations("AddTeamMemberPayload", {
    description: "Payload for adding a member to a team.",
  })
) {}

/**
 * Add team member endpoint contract.
 *
 * POST /organization/add-team-member
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("add-team-member", "/add-team-member")
  .setPayload(Payload)
  .addSuccess(TeamMember.Model)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to add the team member.",
      })
    )
  );

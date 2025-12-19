/**
 * @module organization/remove-team-member
 *
 * Remove a member from a team.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/remove-team-member");

/**
 * Payload for removing a team member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId.annotations({
      description: "The team the user should be removed from.",
    }),
    userId: SharedEntityIds.UserId.annotations({
      description: "The user ID of the user to be removed from the team.",
    }),
  },
  $I.annotations("RemoveTeamMemberPayload", {
    description: "Payload for removing a member from a team.",
  })
) {}

/**
 * Success response after removing a team member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    message: S.Literal("Team member removed successfully.").annotations({
      description: "Confirmation message indicating successful removal.",
    }),
  },
  $I.annotations("RemoveTeamMemberSuccess", {
    description: "Success response after removing a team member.",
  })
) {}

/**
 * Remove team member endpoint contract.
 *
 * POST /organization/remove-team-member
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("remove-team-member", "/remove-team-member")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to remove the team member.",
      })
    )
  );

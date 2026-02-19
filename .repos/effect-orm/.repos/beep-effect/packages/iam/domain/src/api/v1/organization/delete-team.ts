/**
 * @module organization/delete-team
 *
 * Delete a team from an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/delete-team");

/**
 * Payload for deleting a team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId.annotations({
      description: "The team ID of the team to remove.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The organization ID. Defaults to active organization.",
    }),
  },
  $I.annotations("DeleteTeamPayload", {
    description: "Payload for deleting a team.",
  })
) {}

/**
 * Success response after deleting a team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    message: S.Literal("Team removed successfully.").annotations({
      description: "Confirmation message indicating successful removal.",
    }),
  },
  $I.annotations("DeleteTeamSuccess", {
    description: "Success response after deleting a team.",
  })
) {}

/**
 * Delete team endpoint contract.
 *
 * POST /organization/remove-team
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("remove-team", "/remove-team")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete the team.",
      })
    )
  );

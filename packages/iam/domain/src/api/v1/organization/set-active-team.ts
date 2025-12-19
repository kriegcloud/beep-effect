/**
 * @module organization/set-active-team
 *
 * Set the active team.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Team } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/set-active-team");

/**
 * Payload for setting the active team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.optionalWith(SharedEntityIds.TeamId, { as: "Option", nullable: true }).annotations({
      description: "The team ID to set as active. Can be null to unset.",
    }),
  },
  $I.annotations("SetActiveTeamPayload", {
    description: "Payload for setting the active team.",
  })
) {}

/**
 * Success response with the active team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    team: S.optionalWith(Team.Model, { as: "Option", nullable: true }).annotations({
      description: "The newly active team, or null if unset.",
    }),
  },
  $I.annotations("SetActiveTeamSuccess", {
    description: "Success response with the active team.",
  })
) {}

/**
 * Set active team endpoint contract.
 *
 * POST /organization/set-active-team
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("set-active-team", "/set-active-team")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to set the active team.",
      })
    )
  );

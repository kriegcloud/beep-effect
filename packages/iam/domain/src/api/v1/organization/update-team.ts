/**
 * @module organization/update-team
 *
 * Update an existing team in an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Team } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/update-team");

/**
 * Data object for updating team fields.
 *
 * @since 1.0.0
 * @category Schema
 */
export class UpdateData extends S.Class<UpdateData>($I`UpdateData`)(
  {
    name: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new name of the team.",
    }),
    description: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new description of the team.",
    }),
    metadata: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new JSON metadata for the team.",
    }),
    logo: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The new logo URL of the team.",
    }),
  },
  $I.annotations("UpdateTeamData", {
    description: "Data for updating team fields.",
  })
) {}

/**
 * Payload for updating a team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.String.annotations({
      description: "The ID of the team to be updated.",
    }),
    data: UpdateData.annotations({
      description: "The data to update.",
    }),
  },
  $I.annotations("UpdateTeamPayload", {
    description: "Payload for updating a team.",
  })
) {}

/**
 * Update team endpoint contract.
 *
 * POST /organization/update-team
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("update-team", "/update-team")
  .setPayload(Payload)
  .addSuccess(Team.Model)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update the team.",
      })
    )
  );

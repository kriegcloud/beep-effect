/**
 * @module organization/create-team
 *
 * Create a new team within an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Team } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/create-team");

/**
 * Payload for creating a team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  Team.Model.insert,
  $I.annotations("CreateTeamPayload", {
    description: "Payload for creating a team.",
  })
) {}

/**
 * Create team endpoint contract.
 *
 * POST /organization/create-team
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("create-team", "/create-team")
  .setPayload(Payload)
  .addSuccess(Team.Model)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to create the team.",
      })
    )
  );

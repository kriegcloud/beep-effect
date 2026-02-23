/**
 * @module organization/get-team
 *
 * Get a team by ID.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { Team } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-team");

/**
 * Query parameters for getting a team.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Query extends S.Class<Query>($I`Query`)(
  {
    teamId: S.optionalWith(SharedEntityIds.TeamId, { as: "Option", exact: true }).annotations({
      description: "The ID of the team to retrieve.",
    }),
  },
  $I.annotations("GetTeamQuery", {
    description: "Query parameters for getting a team.",
  })
) {}

/**
 * Get team endpoint contract.
 *
 * GET /organization/get-team
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-team", "/get-team")
  .setUrlParams(Query)
  .addSuccess(Team.Model)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

/**
 * @module organization/list-user-teams
 *
 * List all teams that the current user is a part of.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Team } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-user-teams");

/**
 * Success response with list of user's teams.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    teams: S.Array(Team.Model).annotations({
      description: "List of teams the user is a member of.",
    }),
  },
  $I.annotations("ListUserTeamsSuccess", {
    description: "Success response with list of user's teams.",
  })
) {}

/**
 * List user teams endpoint contract.
 *
 * GET /organization/list-user-teams
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-user-teams", "/list-user-teams")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

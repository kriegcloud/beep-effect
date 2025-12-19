/**
 * @module organization/get-active-member-role
 *
 * Get the role of the active member.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-active-member-role");

/**
 * Success response with active member role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    role: S.String.annotations({ description: "Role of the active member." }),
  },
  $I.annotations("GetActiveMemberRoleSuccess", {
    description: "Active member role for the current user.",
  })
) {}

/**
 * Get active member role endpoint contract.
 *
 * GET /organization/get-active-member-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-active-member-role", "/get-active-member-role")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

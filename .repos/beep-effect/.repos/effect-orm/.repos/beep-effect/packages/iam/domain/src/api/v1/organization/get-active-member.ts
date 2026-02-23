/**
 * @module organization/get-active-member
 *
 * Get the member details of the active organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-active-member");

/**
 * Success response with active member details.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.MemberId.annotations({ description: "Unique identifier of the member." }),
    userId: SharedEntityIds.UserId.annotations({ description: "ID of the user." }),
    organizationId: SharedEntityIds.OrganizationId.annotations({ description: "ID of the organization." }),
    role: S.String.annotations({ description: "Role of the member." }),
  },
  $I.annotations("GetActiveMemberSuccess", {
    description: "Active member details for the current user.",
  })
) {}

/**
 * Get active member endpoint contract.
 *
 * GET /organization/get-active-member
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-active-member", "/get-active-member")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

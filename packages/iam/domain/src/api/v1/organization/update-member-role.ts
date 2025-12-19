/**
 * @module organization/update-member-role
 *
 * Update the role of a member in an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Member } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/update-member-role");

/**
 * Payload for updating a member's role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    role: S.String.annotations({
      description: "The new role to be applied.",
    }),
    memberId: SharedEntityIds.UserId.annotations({
      description: "The member ID to apply the role update to.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The organization ID. Defaults to active organization.",
    }),
  },
  $I.annotations("UpdateMemberRolePayload", {
    description: "Payload for updating a member's role.",
  })
) {}

/**
 * Success response after updating a member's role.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    member: Member.Model.annotations({
      description: "The updated member record.",
    }),
  },
  $I.annotations("UpdateMemberRoleSuccess", {
    description: "Success response after updating a member's role.",
  })
) {}

/**
 * Update member role endpoint contract.
 *
 * POST /organization/update-member-role
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("update-member-role", "/update-member-role")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update the member's role.",
      })
    )
  );

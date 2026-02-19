/**
 * @module organization/remove-member
 *
 * Remove a member from an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Member } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/remove-member");

/**
 * Payload for removing a member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    memberIdOrEmail: S.Union(IamEntityIds.MemberId, BS.Email).annotations({
      description: "The ID or email of the member to remove.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The ID of the organization. Defaults to active organization.",
    }),
  },
  $I.annotations("RemoveMemberPayload", {
    description: "Payload for removing a member from an organization.",
  })
) {}

/**
 * Success response after removing a member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    member: Member.Model.annotations({
      description: "The removed member record.",
    }),
  },
  $I.annotations("RemoveMemberSuccess", {
    description: "Success response after removing a member.",
  })
) {}

/**
 * Remove member endpoint contract.
 *
 * POST /organization/remove-member
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("remove-member", "/remove-member")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to remove the member.",
      })
    )
  );

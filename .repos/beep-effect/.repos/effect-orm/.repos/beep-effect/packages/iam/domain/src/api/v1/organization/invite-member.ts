/**
 * @module organization/invite-member
 *
 * Invite a member to an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/invite-member");

/**
 * Payload for inviting a member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: BS.Email.annotations({
      description: "The email address of the user to invite.",
    }),
    role: Invitation.Model.fields.role.annotations({
      description: "The role(s) to assign to the user. It can be admin, member, or owner.",
    }),
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", exact: true }).annotations({
      description: "The organization ID to invite the user to. Defaults to active organization.",
    }),
    resend: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Resend the invitation email if the user is already invited.",
    }),
    teamId: S.optionalWith(SharedEntityIds.TeamId, { as: "Option", exact: true }).annotations({
      description: "The team ID to add the user to.",
    }),
  },
  $I.annotations("InviteMemberPayload", {
    description: "Payload for inviting a member to an organization.",
  })
) {}

/**
 * Success response after inviting a member.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.InvitationId.annotations({ description: "Unique identifier of the invitation." }),
    email: BS.Email.annotations({ description: "Email address of the invitee." }),
    role: S.String.annotations({ description: "Role assigned to the invitee." }),
    organizationId: SharedEntityIds.OrganizationId.annotations({ description: "ID of the organization." }),
    inviterId: SharedEntityIds.UserId.annotations({ description: "User ID of the inviter." }),
    status: S.String.annotations({ description: "Status of the invitation." }),
    expiresAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the invitation expires.",
    }),
    createdAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the invitation was created.",
    }),
  },
  $I.annotations("InviteMemberSuccess", {
    description: "Success response after inviting a member.",
  })
) {}

/**
 * Invite member endpoint contract.
 *
 * POST /organization/invite-member
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("invite-member", "/invite-member")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to invite the member.",
      })
    )
  );

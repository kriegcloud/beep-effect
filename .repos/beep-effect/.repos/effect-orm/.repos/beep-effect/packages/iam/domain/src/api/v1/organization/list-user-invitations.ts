/**
 * @module organization/list-user-invitations
 *
 * List all invitations a user has received.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-user-invitations");

/**
 * Extended invitation model with organization and inviter details.
 *
 * @since 1.0.0
 * @category Schema
 */
export class InvitationWithDetails extends S.Class<InvitationWithDetails>($I`InvitationWithDetails`)(
  {
    id: S.String.annotations({ description: "Unique identifier of the invitation." }),
    email: BS.Email.annotations({ description: "Email address of the invitee." }),
    role: S.String.annotations({ description: "Role to assign to the invitee." }),
    organizationId: SharedEntityIds.OrganizationId.annotations({ description: "ID of the organization." }),
    inviterId: SharedEntityIds.UserId.annotations({ description: "User ID of the inviter." }),
    status: Invitation.InvitationStatus.annotations({ description: "Status of the invitation." }),
    expiresAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the invitation expires.",
    }),
    organizationName: S.String.annotations({ description: "Name of the organization." }),
    organizationSlug: S.String.annotations({ description: "Slug of the organization." }),
    inviterEmail: S.String.annotations({ description: "Email of the inviter." }),
  },
  $I.annotations("InvitationWithDetails", {
    description: "Invitation with organization and inviter details.",
  })
) {}

/**
 * Success response with list of user invitations.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    invitations: S.Array(InvitationWithDetails).annotations({
      description: "List of invitations the user has received.",
    }),
  },
  $I.annotations("ListUserInvitationsSuccess", {
    description: "Success response with list of user invitations.",
  })
) {}

/**
 * List user invitations endpoint contract.
 *
 * GET /organization/list-user-invitations
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-user-invitations", "/list-user-invitations")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

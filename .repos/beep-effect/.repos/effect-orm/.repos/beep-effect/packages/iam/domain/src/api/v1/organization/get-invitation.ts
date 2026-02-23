/**
 * @module organization/get-invitation
 *
 * Get an invitation by ID.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-invitation");

/**
 * Query parameters for getting an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Query extends S.Class<Query>($I`Query`)(
  {
    id: S.optionalWith(IamEntityIds.InvitationId, { as: "Option", exact: true }).annotations({
      description: "The ID of the invitation to retrieve.",
    }),
  },
  $I.annotations("GetInvitationQuery", {
    description: "Query parameters for getting an invitation.",
  })
) {}

/**
 * Extended invitation model with organization and inviter details.
 *
 * @since 1.0.0
 * @category Schema
 */
export class InvitationWithDetails extends S.Class<InvitationWithDetails>($I`InvitationWithDetails`)(
  {
    id: S.String.annotations({ description: "Unique identifier of the invitation." }),
    email: S.String.annotations({ description: "Email address of the invitee." }),
    role: S.String.annotations({ description: "Role to assign to the invitee." }),
    organizationId: S.String.annotations({ description: "ID of the organization." }),
    inviterId: S.String.annotations({ description: "User ID of the inviter." }),
    status: S.String.annotations({ description: "Status of the invitation." }),
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
 * Get invitation endpoint contract.
 *
 * GET /organization/get-invitation
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-invitation", "/get-invitation")
  .setUrlParams(Query)
  .addSuccess(InvitationWithDetails)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );

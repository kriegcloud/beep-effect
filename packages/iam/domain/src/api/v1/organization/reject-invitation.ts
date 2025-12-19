/**
 * @module organization/reject-invitation
 *
 * Reject an invitation to an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation, Member } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/reject-invitation");

/**
 * Payload for rejecting an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: IamEntityIds.InvitationId.annotations({
      description: "The ID of the invitation to reject.",
    }),
  },
  $I.annotations("RejectInvitationPayload", {
    description: "Payload for rejecting an organization invitation.",
  })
) {}

/**
 * Success response after rejecting an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    invitation: S.optionalWith(Invitation.Model, { as: "Option", nullable: true }).annotations({
      description: "The rejected invitation details.",
    }),
    member: S.optionalWith(Member.Model, { as: "Option", nullable: true }).annotations({
      description: "The member record (if any).",
    }),
  },
  $I.annotations("RejectInvitationSuccess", {
    description: "Success response after rejecting an invitation.",
  })
) {}

/**
 * Reject invitation endpoint contract.
 *
 * POST /organization/reject-invitation
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("reject-invitation", "/reject-invitation")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to reject the invitation.",
      })
    )
  );

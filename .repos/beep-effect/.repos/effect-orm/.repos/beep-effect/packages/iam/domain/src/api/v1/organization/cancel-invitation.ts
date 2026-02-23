/**
 * @module organization/cancel-invitation
 *
 * Cancel a pending invitation.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/cancel-invitation");

/**
 * Payload for cancelling an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: IamEntityIds.InvitationId.annotations({
      description: "The ID of the invitation to cancel.",
    }),
  },
  $I.annotations("CancelInvitationPayload", {
    description: "Payload for cancelling an organization invitation.",
  })
) {}

/**
 * Success response after cancelling an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    invitation: S.optionalWith(Invitation.Model, { as: "Option", nullable: true }).annotations({
      description: "The cancelled invitation details.",
    }),
  },
  $I.annotations("CancelInvitationSuccess", {
    description: "Success response after cancelling an invitation.",
  })
) {}

/**
 * Cancel invitation endpoint contract.
 *
 * POST /organization/cancel-invitation
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("cancel-invitation", "/cancel-invitation")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to cancel the invitation.",
      })
    )
  );

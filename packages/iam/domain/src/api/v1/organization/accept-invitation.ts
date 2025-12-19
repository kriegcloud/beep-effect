/**
 * @module organization/accept-invitation
 *
 * Accept an invitation to join an organization.
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

const $I = $IamDomainId.create("api/v1/organization/accept-invitation");

/**
 * Payload for accepting an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: IamEntityIds.InvitationId.annotations({
      description: "The ID of the invitation to accept.",
    }),
  },
  $I.annotations("AcceptInvitationPayload", {
    description: "Payload for accepting an organization invitation.",
  })
) {}

/**
 * Success response after accepting an invitation.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    invitation: S.optionalWith(Invitation.Model, { as: "Option", nullable: true }).annotations({
      description: "The accepted invitation details.",
    }),
    member: S.optionalWith(Member.Model, { as: "Option", nullable: true }).annotations({
      description: "The newly created member record.",
    }),
  },
  $I.annotations("AcceptInvitationSuccess", {
    description: "Success response after accepting an organization invitation.",
  })
) {}

/**
 * Accept invitation endpoint contract.
 *
 * POST /organization/accept-invitation
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("accept-invitation", "/accept-invitation")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to accept the invitation.",
      })
    )
  );

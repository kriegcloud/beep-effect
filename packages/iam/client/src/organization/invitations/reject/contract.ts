/**
 * @fileoverview
 * Contract for rejecting an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/reject/contract
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/reject");

/**
 * Payload for rejecting an organization invitation.
 *
 * @category Organization/Invitations/Reject
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: IamEntityIds.InvitationId,
  },
  formValuesAnnotation({
    invitationId: "",
  })
) {}

export const Success = Invitation;

/**
 * Wrapper for Reject invitation handler.
 *
 * @category Organization/Invitations/Reject
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Reject", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

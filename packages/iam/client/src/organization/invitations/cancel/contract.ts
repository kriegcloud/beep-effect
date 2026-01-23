/**
 * @fileoverview
 * Contract for canceling an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/cancel/contract
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

const $I = $IamClientId.create("organization/invitations/cancel");

/**
 * Payload for canceling an organization invitation.
 *
 * @category Organization/Invitations/Cancel
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
 * Wrapper for Cancel invitation handler.
 *
 * @category Organization/Invitations/Cancel
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Cancel", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

/**
 * @fileoverview
 * Contract for accepting an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/accept/contract
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/accept");

/**
 * Payload for accepting an organization invitation.
 *
 * @category Organization/Invitations/Accept
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: S.String,
  },
  formValuesAnnotation({
    invitationId: "",
  })
) {}

export const Success = Invitation;

/**
 * Wrapper for Accept invitation handler.
 *
 * @category Organization/Invitations/Accept
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Accept", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

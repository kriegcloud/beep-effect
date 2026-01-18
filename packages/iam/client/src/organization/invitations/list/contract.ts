/**
 * @fileoverview
 * Contract for listing organization invitations.
 *
 * @module @beep/iam-client/organization/invitations/list/contract
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/list");

/**
 * Payload for listing organization invitations.
 *
 * @category Organization/Invitations/List
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
  },
  formValuesAnnotation({
    organizationId: undefined,
  })
) {}

export const Success = S.Array(Invitation).annotations(
  $I.annotations("Success", {
    description: "List of organization invitations.",
  })
);

/**
 * Wrapper for List invitations handler.
 *
 * @category Organization/Invitations/List
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("List", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

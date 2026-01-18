/**
 * @fileoverview
 * Contract for removing an organization member.
 *
 * @module @beep/iam-client/organization/members/remove/contract
 * @category Organization/Members
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/remove");

/**
 * Payload for removing a member from an organization.
 *
 * @category Organization/Members/Remove
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    memberIdOrEmail: S.String, // Can use either member ID or email
  },
  formValuesAnnotation({
    organizationId: undefined,
    memberIdOrEmail: "",
  })
) {}

export const Success = Member;

/**
 * Wrapper for Remove member handler.
 *
 * @category Organization/Members/Remove
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Remove", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

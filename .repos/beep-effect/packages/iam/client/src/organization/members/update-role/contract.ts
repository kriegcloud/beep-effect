/**
 * @fileoverview
 * Contract for updating an organization member's role.
 *
 * @module @beep/iam-client/organization/members/update-role/contract
 * @category Organization/Members
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/update-role");

/**
 * Payload for updating a member's role in an organization.
 *
 * @category Organization/Members/UpdateRole
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(SharedEntityIds.OrganizationId), // Uses active org if omitted
    memberId: IamEntityIds.MemberId,
    role: S.String,
  },
  formValuesAnnotation({
    organizationId: undefined,
    memberId: "",
    role: "member",
  })
) {}

export const Success = Member;

/**
 * Wrapper for UpdateRole member handler.
 *
 * @category Organization/Members/UpdateRole
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UpdateRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

/**
 * @fileoverview
 * Contract for creating an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/create/contract
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Invitation, RoleOrRoles } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/create");

/**
 * Payload for inviting a member to an organization.
 *
 * @category Organization/Invitations/Create
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    email: S.String,
    role: RoleOrRoles, // "admin" | "member" | "owner" or array of roles
  },
  formValuesAnnotation({
    organizationId: undefined,
    email: "",
    role: "member",
  })
) {}

export const Success = Invitation;

/**
 * Wrapper for Create invitation handler.
 *
 * @category Organization/Invitations/Create
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Create", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

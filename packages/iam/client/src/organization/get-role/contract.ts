import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/get-role");

// =============================================================================
// PAYLOAD (Either roleName OR roleId)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(SharedEntityIds.OrganizationId),
    roleName: S.optional(S.String),
    roleId: S.optional(IamEntityIds.OrganizationRoleId),
  },
  $I.annotations("Payload", {
    description: "Payload schema for this operation.",
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  role: Common.OrganizationRole,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("GetRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

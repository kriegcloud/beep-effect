import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/has-permission");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    permission: Common.Permission,
    organizationId: S.optional(SharedEntityIds.OrganizationId),
  },
  $I.annotations("Payload", {
    description: "Payload schema for this operation.",
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("HasPermission", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/get-active-member-role");

// =============================================================================
// PAYLOAD (Optional query params)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: S.optional(SharedEntityIds.UserId),
    organizationId: S.optional(SharedEntityIds.OrganizationId),
    organizationSlug: S.optional(S.String),
  },
  formValuesAnnotation({
    userId: undefined,
    organizationId: undefined,
    organizationSlug: undefined,
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  role: S.String,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("GetActiveMemberRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

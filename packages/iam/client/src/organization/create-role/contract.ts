import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/create-role");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(SharedEntityIds.OrganizationId),
    role: S.String,
    permission: Common.Permission,
  },
  formValuesAnnotation({
    organizationId: undefined,
    role: "",
    permission: {},
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
  roleData: Common.OrganizationRole,
  statements: S.Unknown,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("CreateRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

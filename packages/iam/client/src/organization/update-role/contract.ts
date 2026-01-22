import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/update-role");

// =============================================================================
// PAYLOAD
// =============================================================================

const UpdateData = S.Struct({
  permission: S.optional(Common.Permission),
  roleName: S.optional(S.String),
});

export class Payload extends S.Class<Payload>($I`Payload`)(
	{
		organizationId: S.optional(S.String),
		data: UpdateData,
		/** Either roleName or roleId to identify the role */
		roleName: S.optional(S.String),
		roleId: S.optional(S.String),
	},
	formValuesAnnotation({
		organizationId: undefined,
		data: { permission: undefined, roleName: undefined },
		roleName: undefined,
		roleId: undefined,
	}),
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
  roleData: Common.OrganizationRole,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("UpdateRole", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

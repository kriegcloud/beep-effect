import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/remove-team");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,
    organizationId: S.optional(SharedEntityIds.OrganizationId),
  },
  formValuesAnnotation({
    teamId: "",
    organizationId: undefined,
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  message: S.optional(S.String),
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("RemoveTeam", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

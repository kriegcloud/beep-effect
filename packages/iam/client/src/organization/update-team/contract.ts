import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/update-team");

// =============================================================================
// PAYLOAD
// =============================================================================

const UpdateData = S.Struct({
  name: S.optional(BS.NameAttribute),
  organizationId: S.optional(SharedEntityIds.OrganizationId),
});

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,
    data: UpdateData,
  },
  formValuesAnnotation({
    teamId: "",
    data: { name: undefined, organizationId: undefined },
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  team: S.NullOr(Common.Team),
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("UpdateTeam", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

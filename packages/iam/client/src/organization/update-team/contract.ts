import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/update-team");

// =============================================================================
// PAYLOAD
// =============================================================================

const UpdateData = S.Struct({
  name: S.optional(S.String),
  organizationId: S.optional(S.String),
});

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.String,
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

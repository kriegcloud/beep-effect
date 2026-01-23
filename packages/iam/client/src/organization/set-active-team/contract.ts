import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/set-active-team");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.optionalWith(SharedEntityIds.TeamId, { nullable: true }),
  },
  formValuesAnnotation({
    teamId: null,
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

export const Wrapper = W.Wrapper.make("SetActiveTeam", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

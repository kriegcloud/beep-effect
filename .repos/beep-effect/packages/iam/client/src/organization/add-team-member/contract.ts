import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/add-team-member");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,
    userId: SharedEntityIds.UserId,
  },
  formValuesAnnotation({
    teamId: "",
    userId: "",
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  teamMember: Common.TeamMember,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = Wrap.Wrapper.make("AddTeamMember", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

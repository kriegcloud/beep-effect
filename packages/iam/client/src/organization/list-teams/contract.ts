import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/list-teams");

// =============================================================================
// PAYLOAD (Optional query params)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
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
  teams: S.Array(Common.Team),
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("ListTeams", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("anonymous/delete-user");

// =============================================================================
// PAYLOAD (No payload - requires session)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("DeleteAnonymousUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

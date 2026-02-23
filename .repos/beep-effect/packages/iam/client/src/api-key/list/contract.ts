import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("api-key/list");

// =============================================================================
// PAYLOAD (No payload - empty struct)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  apiKeys: S.Array(Common.ApiKey),
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("List", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

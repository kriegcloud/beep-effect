import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("api-key/create");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optional(S.String),
    expiresIn: S.optional(S.Number), // milliseconds
    userId: S.optional(S.String),
    prefix: S.optional(S.String),
    remaining: S.optional(S.Number),
    metadata: S.optional(S.Unknown),
    refillAmount: S.optional(S.Number),
    refillInterval: S.optional(S.Number),
    rateLimitTimeWindow: S.optional(S.Number),
    rateLimitMax: S.optional(S.Number),
    rateLimitEnabled: S.optional(S.Boolean),
    permissions: S.optional(Common.Permission),
  },
  formValuesAnnotation({
    name: undefined,
    expiresIn: undefined,
    userId: undefined,
    prefix: undefined,
    remaining: undefined,
    metadata: undefined,
    refillAmount: undefined,
    refillInterval: undefined,
    rateLimitTimeWindow: undefined,
    rateLimitMax: undefined,
    rateLimitEnabled: undefined,
    permissions: undefined,
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  apiKey: Common.ApiKeyWithKey,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("Create", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("api-key/update");

// =============================================================================
// PAYLOAD
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    keyId: IamEntityIds.ApiKeyId,
    userId: S.optional(SharedEntityIds.UserId),
    name: S.optional(S.String),
    enabled: S.optional(S.Boolean),
    remaining: S.optional(S.Number),
    refillAmount: S.optional(S.Number),
    refillInterval: S.optional(S.Number),
    metadata: S.optional(S.Unknown),
    expiresIn: S.optionalWith(S.Number, { nullable: true }),
    rateLimitEnabled: S.optional(S.Boolean),
    rateLimitTimeWindow: S.optional(S.Number),
    rateLimitMax: S.optional(S.Number),
    permissions: S.optionalWith(Common.Permission, { nullable: true }),
  },
  formValuesAnnotation({
    keyId: "",
    userId: undefined,
    name: undefined,
    enabled: undefined,
    remaining: undefined,
    refillAmount: undefined,
    refillInterval: undefined,
    metadata: undefined,
    expiresIn: undefined,
    rateLimitEnabled: undefined,
    rateLimitTimeWindow: undefined,
    rateLimitMax: undefined,
    permissions: undefined,
  })
) {}

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  apiKey: Common.ApiKey,
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("Update", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

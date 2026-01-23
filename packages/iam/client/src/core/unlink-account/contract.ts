/**
 * @fileoverview
 * Unlink account contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for unlinking a social provider
 * from an existing user account.
 *
 * @module @beep/iam-client/core/unlink-account/contract
 * @category Core/UnlinkAccount
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/unlink-account");

/**
 * Payload for unlinking a provider from the current user.
 *
 * @example
 * ```typescript
 * import { UnlinkAccount } from "@beep/iam-client/core"
 *
 * const payload = UnlinkAccount.Payload.make({
 *   providerId: "google"
 * })
 * ```
 *
 * @category Core/UnlinkAccount/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: S.String, // External OAuth provider ID (e.g., "google", "github") - intentionally S.String
  },
  formValuesAnnotation({
    providerId: "",
  })
) {}

/**
 * Success response for unlinking an account.
 *
 * @example
 * ```typescript
 * import { UnlinkAccount } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(UnlinkAccount.Success)(response)
 * ```
 *
 * @category Core/UnlinkAccount/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for unlinking a provider from the user's account.",
  })
) {}

/**
 * Contract wrapper for unlink account operations.
 *
 * @example
 * ```typescript
 * import { UnlinkAccount } from "@beep/iam-client/core"
 *
 * const handler = UnlinkAccount.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/UnlinkAccount/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UnlinkAccount", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

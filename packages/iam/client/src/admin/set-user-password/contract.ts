/**
 * @fileoverview
 * Set user password contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for setting a user's password.
 *
 * @module @beep/iam-client/admin/set-user-password/contract
 * @category Admin/SetUserPassword
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/set-user-password");

/**
 * Payload for setting a user's password.
 *
 * @example
 * ```typescript
 * import { SetUserPassword } from "@beep/iam-client/admin"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = SetUserPassword.Payload.make({
 *   userId: "shared_user__abc123",
 *   newPassword: Redacted.make("newSecurePassword123")
 * })
 * ```
 *
 * @category Admin/SetUserPassword/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    newPassword: S.Redacted(S.String),
  },
  formValuesAnnotation({
    userId: "",
    newPassword: "",
  })
) {}

/**
 * Success response for setting a user's password.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import * as Redacted from "effect/Redacted"
 * import { SetUserPassword } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SetUserPassword.Handler({
 *     userId: "shared_user__abc123",
 *     newPassword: Redacted.make("newSecurePassword123")
 *   })
 *   console.log(`Password updated: ${result.success}`)
 * })
 * ```
 *
 * @category Admin/SetUserPassword/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response confirming the password was set.",
  })
) {}

/**
 * Contract wrapper for set user password operations.
 *
 * @example
 * ```typescript
 * import { SetUserPassword } from "@beep/iam-client/admin"
 *
 * const handler = SetUserPassword.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/SetUserPassword/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SetUserPassword", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

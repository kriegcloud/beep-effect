/**
 * @fileoverview
 * Remove user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for permanently removing a user.
 *
 * @module @beep/iam-client/admin/remove-user/contract
 * @category Admin/RemoveUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/remove-user");

/**
 * Payload for removing a user.
 *
 * @example
 * ```typescript
 * import { RemoveUser } from "@beep/iam-client/admin"
 *
 * const payload = RemoveUser.Payload.make({
 *   userId: "shared_user__abc123"
 * })
 * ```
 *
 * @category Admin/RemoveUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  userId: SharedEntityIds.UserId,
}) {}

/**
 * Success response for removing a user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RemoveUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RemoveUser.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`User removed: ${result.success}`)
 * })
 * ```
 *
 * @category Admin/RemoveUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response confirming the user was removed.",
  })
) {}

/**
 * Contract wrapper for remove user operations.
 *
 * @example
 * ```typescript
 * import { RemoveUser } from "@beep/iam-client/admin"
 *
 * const handler = RemoveUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/RemoveUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RemoveUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

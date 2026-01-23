/**
 * @fileoverview
 * Unban user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for unbanning a user.
 *
 * @module @beep/iam-client/admin/unban-user/contract
 * @category Admin/UnbanUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/unban-user");

/**
 * Payload for unbanning a user.
 *
 * @example
 * ```typescript
 * import { UnbanUser } from "@beep/iam-client/admin"
 *
 * const payload = UnbanUser.Payload.make({
 *   userId: "shared_user__abc123"
 * })
 * ```
 *
 * @category Admin/UnbanUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  userId: SharedEntityIds.UserId,
}) {}

/**
 * Success response containing the unbanned user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UnbanUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UnbanUser.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`User ${result.user.name} has been unbanned`)
 * })
 * ```
 *
 * @category Admin/UnbanUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the unbanned user.",
  })
) {}

/**
 * Contract wrapper for unban user operations.
 *
 * @example
 * ```typescript
 * import { UnbanUser } from "@beep/iam-client/admin"
 *
 * const handler = UnbanUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/UnbanUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UnbanUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

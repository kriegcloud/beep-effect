/**
 * @fileoverview
 * Revoke user sessions contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for revoking all sessions of a user.
 *
 * @module @beep/iam-client/admin/revoke-user-sessions/contract
 * @category Admin/RevokeUserSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/revoke-user-sessions");

/**
 * Payload for revoking all sessions of a user.
 *
 * @example
 * ```typescript
 * import { RevokeUserSessions } from "@beep/iam-client/admin"
 *
 * const payload = RevokeUserSessions.Payload.make({
 *   userId: "shared_user__abc123"
 * })
 * ```
 *
 * @category Admin/RevokeUserSessions/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: S.String,
  },
  formValuesAnnotation({
    userId: "",
  })
) {}

/**
 * Success response for revoking all user sessions.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RevokeUserSessions } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RevokeUserSessions.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`All sessions revoked: ${result.success}`)
 * })
 * ```
 *
 * @category Admin/RevokeUserSessions/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response confirming all sessions were revoked.",
  })
) {}

/**
 * Contract wrapper for revoke user sessions operations.
 *
 * @example
 * ```typescript
 * import { RevokeUserSessions } from "@beep/iam-client/admin"
 *
 * const handler = RevokeUserSessions.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/RevokeUserSessions/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RevokeUserSessions", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

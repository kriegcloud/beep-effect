/**
 * @fileoverview
 * Revoke user session contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for revoking a specific user session.
 *
 * @module @beep/iam-client/admin/revoke-user-session/contract
 * @category Admin/RevokeUserSession
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/revoke-user-session");

/**
 * Payload for revoking a specific user session.
 *
 * @example
 * ```typescript
 * import { RevokeUserSession } from "@beep/iam-client/admin"
 *
 * const payload = RevokeUserSession.Payload.make({
 *   sessionToken: "session_token_abc123"
 * })
 * ```
 *
 * @category Admin/RevokeUserSession/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  sessionToken: S.Redacted(S.String),
}) {}

/**
 * Success response for revoking a user session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RevokeUserSession } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RevokeUserSession.Handler({
 *     sessionToken: "session_token_abc123"
 *   })
 *   console.log(`Session revoked: ${result.success}`)
 * })
 * ```
 *
 * @category Admin/RevokeUserSession/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response confirming the session was revoked.",
  })
) {}

/**
 * Contract wrapper for revoke user session operations.
 *
 * @example
 * ```typescript
 * import { RevokeUserSession } from "@beep/iam-client/admin"
 *
 * const handler = RevokeUserSession.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/RevokeUserSession/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RevokeUserSession", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

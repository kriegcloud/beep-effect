/**
 * @fileoverview
 * Revoke user sessions handler implementation.
 *
 * Implements the revoke user sessions contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/revoke-user-sessions/handler
 * @category Admin/RevokeUserSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Revoke user sessions handler that terminates all sessions for a user.
 *
 * Calls Better Auth's admin.revokeUserSessions method and validates the response.
 * Does not mutate current session state (admin operation on target user).
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
 * @category Admin/RevokeUserSessions/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.revokeUserSessions(encodedPayload))
);

/**
 * @fileoverview
 * Revoke user session handler implementation.
 *
 * Implements the revoke user session contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/revoke-user-session/handler
 * @category Admin/RevokeUserSession
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Revoke user session handler that terminates a specific session.
 *
 * Calls Better Auth's admin.revokeUserSession method and validates the response.
 * Does not mutate current session state (admin operation on target session).
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
 * @category Admin/RevokeUserSession/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.revokeUserSession(encodedPayload))
);

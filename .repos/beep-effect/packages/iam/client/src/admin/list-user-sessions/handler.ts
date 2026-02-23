/**
 * @fileoverview
 * List user sessions handler implementation.
 *
 * Implements the list user sessions contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/list-user-sessions/handler
 * @category Admin/ListUserSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List user sessions handler that retrieves all sessions for a specified user.
 *
 * Calls Better Auth's admin.listUserSessions method and validates the response.
 * Does not mutate session state (admin read operation).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUserSessions } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const sessions = yield* ListUserSessions.Handler({
 *     userId: "shared_user__abc123"
 *   })
 *   console.log(`User has ${sessions.length} active sessions`)
 * })
 * ```
 *
 * @category Admin/ListUserSessions/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.listUserSessions(encodedPayload))
);

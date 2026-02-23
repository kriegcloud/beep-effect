/**
 * @fileoverview
 * Unban user handler implementation.
 *
 * Implements the unban user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/unban-user/handler
 * @category Admin/UnbanUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Unban user handler that removes a ban from a user.
 *
 * Calls Better Auth's admin.unbanUser method and validates the response.
 * Does not mutate session state (admin operation).
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
 * @category Admin/UnbanUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.unbanUser(encodedPayload))
);

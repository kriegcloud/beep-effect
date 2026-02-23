/**
 * @fileoverview
 * Remove user handler implementation.
 *
 * Implements the remove user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/remove-user/handler
 * @category Admin/RemoveUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Remove user handler that permanently deletes a user.
 *
 * Calls Better Auth's admin.removeUser method and validates the response.
 * Does not mutate current session state (admin operation on target user).
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
 * @category Admin/RemoveUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.removeUser(encodedPayload))
);

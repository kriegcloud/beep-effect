/**
 * @fileoverview
 * Set user password handler implementation.
 *
 * Implements the set user password contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/set-user-password/handler
 * @category Admin/SetUserPassword
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Set user password handler that updates a user's password.
 *
 * Calls Better Auth's admin.setUserPassword method and validates the response.
 * Does not mutate current session state (admin operation on target user).
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
 * @category Admin/SetUserPassword/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.setUserPassword(encodedPayload))
);

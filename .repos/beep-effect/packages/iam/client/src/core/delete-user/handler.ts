/**
 * @fileoverview
 * Delete user handler implementation.
 *
 * Implements the delete user contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful deletion.
 *
 * @module @beep/iam-client/core/delete-user/handler
 * @category Core/DeleteUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Delete user handler that removes the current user's account.
 *
 * Calls Better Auth's deleteUser method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful deletion.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { DeleteUser } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* DeleteUser.Handler
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/DeleteUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.deleteUser())
);

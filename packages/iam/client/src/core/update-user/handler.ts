/**
 * @fileoverview
 * Update user handler implementation.
 *
 * Implements the update user contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful update.
 *
 * @module @beep/iam-client/core/update-user/handler
 * @category Core/UpdateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Update user handler that modifies the current user's profile.
 *
 * Calls Better Auth's updateUser method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful update.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateUser } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdateUser.Handler({ name: "New Name" })
 *   console.log(result.user.name)
 * })
 * ```
 *
 * @category Core/UpdateUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.updateUser(encodedPayload))
);

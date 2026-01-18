/**
 * @fileoverview
 * Change password handler implementation using wrapIamMethod factory.
 *
 * Implements the change password contract using Better Auth's changePassword client.
 * Automatically encodes/decodes payloads and checks for errors. Notifies
 * `$sessionSignal` after success since session state may change.
 *
 * @module @beep/iam-client/password/change/handler
 * @category Password/Change
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for changing the current user's password.
 *
 * Automatically encodes/decodes payloads and checks for Better Auth errors.
 * Notifies `$sessionSignal` after success since session state may change
 * (especially when revokeOtherSessions is true).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Change } from "@beep/iam-client/password"
 * import * as Redacted from "effect/Redacted"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Change.Handler({
 *     currentPassword: Redacted.make("oldPassword"),
 *     newPassword: Redacted.make("newPassword123"),
 *     revokeOtherSessions: true
 *   })
 *   console.log(result.user.email)
 * })
 * ```
 *
 * @category Password/Change/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.changePassword(encodedPayload))
);

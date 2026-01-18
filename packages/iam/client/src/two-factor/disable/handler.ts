/**
 * @fileoverview
 * Handler for disabling two-factor authentication.
 *
 * @module @beep/iam-client/two-factor/disable/handler
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for disabling two-factor authentication.
 *
 * Features:
 * - Disables 2FA for the current user
 * - Requires password verification
 * - Notifies $sessionSignal (session refreshed with updated user data)
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.Disable.Handler({
 *   password: Redacted.make("password123")
 * })
 * ```
 *
 * @category TwoFactor/Disable
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.twoFactor.disable(encoded))
);

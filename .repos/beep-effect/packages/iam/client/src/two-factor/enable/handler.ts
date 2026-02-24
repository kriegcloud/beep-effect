/**
 * @fileoverview
 * Handler for enabling two-factor authentication.
 *
 * @module @beep/iam-client/two-factor/enable/handler
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for enabling two-factor authentication.
 *
 * Features:
 * - Initializes 2FA setup with TOTP secret and backup codes
 * - Returns TOTP URI for authenticator app
 * - Does NOT notify $sessionSignal (2FA not active until verified)
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.Enable.Handler({
 *   password: Redacted.make("password123")
 * })
 * ```
 *
 * @category TwoFactor/Enable
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.twoFactor.enable(encoded))
);

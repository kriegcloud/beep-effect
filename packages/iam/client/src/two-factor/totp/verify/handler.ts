/**
 * @fileoverview
 * Handler for verifying a TOTP code.
 *
 * @module @beep/iam-client/two-factor/totp/verify/handler
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for verifying a TOTP code.
 *
 * Features:
 * - Verifies TOTP code from authenticator app
 * - Completes 2FA setup OR verifies during 2FA-protected sign-in
 * - Notifies $sessionSignal on success (creates/updates session)
 * - Supports trustDevice for 30-day device trust
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.TOTP.Verify.Handler({ code: "123456" })
 * ```
 *
 * @category TwoFactor/TOTP/Verify
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.twoFactor.verifyTotp(encoded))
);

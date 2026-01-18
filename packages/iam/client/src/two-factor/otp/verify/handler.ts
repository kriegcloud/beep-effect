/**
 * @fileoverview
 * Handler for verifying an OTP code.
 *
 * @module @beep/iam-client/two-factor/otp/verify/handler
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for verifying an OTP code.
 *
 * Features:
 * - Verifies email/SMS OTP during 2FA-protected sign-in
 * - Alternative to TOTP verification
 * - Notifies $sessionSignal on success (creates session)
 * - Supports trustDevice for 30-day device trust
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.OTP.Verify.Handler({ code: "123456" })
 * ```
 *
 * @category TwoFactor/OTP/Verify
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.twoFactor.verifyOtp(encoded))
);

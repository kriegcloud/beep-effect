/**
 * @fileoverview
 * Handler for sending an OTP code.
 *
 * @module @beep/iam-client/two-factor/otp/send/handler
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for sending an OTP code via email/SMS.
 *
 * Features:
 * - Sends one-time password to user's email/phone
 * - Alternative to TOTP for 2FA verification
 * - Does NOT notify $sessionSignal (email-only operation)
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.OTP.Send.Handler({})
 * ```
 *
 * @category TwoFactor/OTP/Send
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((_encoded) => client.twoFactor.sendOtp())
);

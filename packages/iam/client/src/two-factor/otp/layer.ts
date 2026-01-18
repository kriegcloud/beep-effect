/**
 * @fileoverview
 * Layer composition for OTP handlers.
 *
 * @module @beep/iam-client/two-factor/otp/layer
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Send } from "./send";
import { Verify } from "./verify";

/**
 * Wrapper group containing all OTP wrappers.
 *
 * @category TwoFactor/OTP
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Send.Wrapper, Verify.Wrapper);

/**
 * Effect layer providing OTP handlers.
 *
 * @category TwoFactor/OTP
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Send: Send.Handler,
  Verify: Verify.Handler,
});

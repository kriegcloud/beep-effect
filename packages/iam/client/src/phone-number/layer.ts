/**
 * @fileoverview Phone number layer composition.
 *
 * Composes phone number handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/phone-number/layer
 * @category PhoneNumber
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { RequestPasswordReset } from "./request-password-reset";
import { ResetPassword } from "./reset-password";
import { SendOtp } from "./send-otp";
import { Verify } from "./verify";

/**
 * Wrapper group combining all phone number handlers.
 *
 * Provides type-safe handler access and composition for phone number
 * operations including OTP, verification, and password reset.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/phone-number"
 *
 * const handlers = Group.accessHandlers("SendOtp", "Verify")
 * ```
 *
 * @category PhoneNumber/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  SendOtp.Wrapper,
  Verify.Wrapper,
  RequestPasswordReset.Wrapper,
  ResetPassword.Wrapper
);

/**
 * Effect Layer providing all phone number handler implementations.
 *
 * Composes phone number handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/phone-number"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category PhoneNumber/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SendOtp: SendOtp.Handler,
  VerifyPhoneNumber: Verify.Handler,
  RequestPasswordResetPhone: RequestPasswordReset.Handler,
  ResetPasswordPhone: ResetPassword.Handler,
});

/**
 * @fileoverview
 * Contract for sending an OTP code.
 *
 * @module @beep/iam-client/two-factor/otp/send/contract
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/otp/send");

/**
 * Payload for sending an OTP code.
 *
 * Optional payload - trustDevice can be set to enable device trust on verify.
 *
 * @category TwoFactor/OTP/Send
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  trustDevice: S.optional(S.Boolean),
}) {}

/**
 * Success response - OTP sent.
 *
 * @category TwoFactor/OTP/Send
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending an OTP.",
  })
) {}

/**
 * Wrapper for Send OTP handler.
 *
 * @category TwoFactor/OTP/Send
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Send", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

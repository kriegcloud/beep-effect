/**
 * @fileoverview
 * Contract for verifying an OTP code.
 *
 * @module @beep/iam-client/two-factor/otp/verify/contract
 * @category TwoFactor/OTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/otp/verify");

/**
 * Payload for verifying an OTP code.
 *
 * @category TwoFactor/OTP/Verify
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    code: "",
    trustDevice: false,
  })
) {}

/**
 * Success response - OTP verification succeeded.
 *
 * Returns session token and user data after successful verification.
 *
 * @category TwoFactor/OTP/Verify
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.Redacted(S.String),
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after OTP verification.",
  })
) {}

/**
 * Wrapper for Verify OTP handler.
 *
 * @category TwoFactor/OTP/Verify
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Verify", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

/**
 * @fileoverview
 * Contract for verifying a TOTP code.
 *
 * @module @beep/iam-client/two-factor/totp/verify/contract
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/totp/verify");

/**
 * Payload for verifying a TOTP code.
 *
 * @category TwoFactor/TOTP/Verify
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
 * Success response - TOTP verification succeeded.
 *
 * Returns session token and user data after successful 2FA verification.
 * Used both for completing 2FA setup and during 2FA-protected sign-in.
 *
 * @category TwoFactor/TOTP/Verify
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response containing session token and user data.",
  })
) {}

/**
 * Wrapper for Verify TOTP handler.
 *
 * @category TwoFactor/TOTP/Verify
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Verify", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

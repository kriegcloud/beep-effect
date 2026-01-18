/**
 * @fileoverview
 * Contract for enabling two-factor authentication.
 *
 * @module @beep/iam-client/two-factor/enable/contract
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/enable");

/**
 * Payload for enabling two-factor authentication.
 *
 * @category TwoFactor/Enable
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
    issuer: S.optional(S.String),
  },
  formValuesAnnotation({
    password: "",
    issuer: undefined,
  })
) {}

/**
 * Success response - two-factor authentication initialized.
 *
 * Returns TOTP URI for authenticator app setup and backup codes.
 * Note: 2FA is not fully enabled until verifyTotp is called (unless skipVerificationOnEnable is set).
 *
 * @category TwoFactor/Enable
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing TOTP URI and backup codes.",
  })
) {}

/**
 * Wrapper for Enable two-factor handler.
 *
 * @category TwoFactor/Enable
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Enable", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

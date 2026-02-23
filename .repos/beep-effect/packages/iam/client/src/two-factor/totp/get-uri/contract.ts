/**
 * @fileoverview
 * Contract for getting the TOTP URI.
 *
 * @module @beep/iam-client/two-factor/totp/get-uri/contract
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/totp/get-uri");

/**
 * Payload for getting the TOTP URI.
 *
 * @category TwoFactor/TOTP/GetUri
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  formValuesAnnotation({
    password: "",
  })
) {}

/**
 * Success response - TOTP URI for existing 2FA setup.
 *
 * Used to re-display the QR code for an already-configured authenticator.
 *
 * @category TwoFactor/TOTP/GetUri
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
  },
  $I.annotations("Success", {
    description: "The success response containing the TOTP URI for authenticator setup.",
  })
) {}

/**
 * Wrapper for GetUri TOTP handler.
 *
 * @category TwoFactor/TOTP/GetUri
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetUri", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

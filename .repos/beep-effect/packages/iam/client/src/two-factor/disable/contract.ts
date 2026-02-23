/**
 * @fileoverview
 * Contract for disabling two-factor authentication.
 *
 * @module @beep/iam-client/two-factor/disable/contract
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/disable");

/**
 * Payload for disabling two-factor authentication.
 *
 * @category TwoFactor/Disable
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
 * Success response - two-factor authentication disabled.
 *
 * @category TwoFactor/Disable
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for disabling two-factor authentication.",
  })
) {}

/**
 * Wrapper for Disable two-factor handler.
 *
 * @category TwoFactor/Disable
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Disable", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

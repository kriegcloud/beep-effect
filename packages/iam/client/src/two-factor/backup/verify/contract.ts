/**
 * @fileoverview
 * Contract for verifying a backup code.
 *
 * @module @beep/iam-client/two-factor/backup/verify/contract
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/backup/verify");

/**
 * Payload for verifying a backup code.
 *
 * @category TwoFactor/Backup/Verify
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
    disableSession: S.optional(S.Boolean),
  },
  formValuesAnnotation({
    code: "",
    trustDevice: false,
    disableSession: false,
  })
) {}

/**
 * Success response - backup code verification succeeded.
 *
 * Returns session token and user data after successful verification.
 * Token may be absent if disableSession was true.
 *
 * @category TwoFactor/Backup/Verify
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.optional(S.String),
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after backup code verification.",
  })
) {}

/**
 * Wrapper for Verify backup code handler.
 *
 * @category TwoFactor/Backup/Verify
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Verify", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

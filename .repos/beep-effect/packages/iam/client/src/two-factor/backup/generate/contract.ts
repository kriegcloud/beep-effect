/**
 * @fileoverview
 * Contract for generating new backup codes.
 *
 * @module @beep/iam-client/two-factor/backup/generate/contract
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/backup/generate");

/**
 * Payload for generating new backup codes.
 *
 * @category TwoFactor/Backup/Generate
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
 * Success response - new backup codes generated.
 *
 * Replaces all existing backup codes with new ones.
 *
 * @category TwoFactor/Backup/Generate
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing newly generated backup codes.",
  })
) {}

/**
 * Wrapper for Generate backup codes handler.
 *
 * @category TwoFactor/Backup/Generate
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Generate", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

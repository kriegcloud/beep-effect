import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/verify-backup-code");

/**
 * Payload for verifying a backup code.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The backup code to verify.
     */
    code: S.String.annotations({
      description: "The backup code to verify.",
    }),

    /**
     * Whether to disable the session after verification.
     */
    disableSession: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether to disable the session after verification.",
    }),

    /**
     * Whether to trust this device and skip 2FA in future.
     */
    trustDevice: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether to trust this device and skip 2FA in future.",
    }),
  },
  $I.annotations("TwoFactorVerifyBackupCodePayload", {
    description: "Payload for verifying a backup code.",
  })
) {}

/**
 * Success response after verifying a backup code.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The authenticated user.
     */
    user: User.Model,

    /**
     * The created session.
     */
    session: Session.Model,
  },
  $I.annotations("TwoFactorVerifyBackupCodeSuccess", {
    description: "Success response after verifying a backup code.",
  })
) {}

/**
 * Verify backup code endpoint contract.
 *
 * POST /two-factor/verify-backup-code
 *
 * Verifies a backup code and creates a session.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("verify-backup-code", "/verify-backup-code")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify backup code.",
      })
    )
  )
  .addSuccess(Success);

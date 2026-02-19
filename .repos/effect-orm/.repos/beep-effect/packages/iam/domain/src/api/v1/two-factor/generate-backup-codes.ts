import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/generate-backup-codes");

/**
 * Payload for generating backup codes.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The user's password for verification.
     */
    password: CommonFields.UserPassword.annotations({
      description: "The user's password for verification.",
    }),
  },
  $I.annotations("TwoFactorGenerateBackupCodesPayload", {
    description: "Payload for generating backup codes.",
  })
) {}

/**
 * Success response after generating backup codes.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Status indicating success (always true).
     */
    status: S.Literal(true).annotations({
      description: "Status indicating success (always true).",
    }),

    /**
     * Generated backup codes for account recovery.
     */
    backupCodes: S.Array(S.String).annotations({
      description: "Generated backup codes for account recovery.",
    }),
  },
  $I.annotations("TwoFactorGenerateBackupCodesSuccess", {
    description: "Success response after generating backup codes.",
  })
) {}

/**
 * Generate backup codes endpoint contract.
 *
 * POST /two-factor/generate-backup-codes
 *
 * Generates new backup codes for the authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("generate-backup-codes", "/generate-backup-codes")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to generate backup codes.",
      })
    )
  )
  .addSuccess(Success);

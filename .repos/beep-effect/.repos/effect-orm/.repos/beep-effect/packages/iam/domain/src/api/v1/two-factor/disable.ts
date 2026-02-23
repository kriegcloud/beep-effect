import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/disable");

/**
 * Payload for disabling two-factor authentication.
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
  $I.annotations("TwoFactorDisablePayload", {
    description: "Payload for disabling two-factor authentication.",
  })
) {}

/**
 * Success response after disabling two-factor authentication.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Status indicating success.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Status indicating success.",
    }),
  },
  $I.annotations("TwoFactorDisableSuccess", {
    description: "Success response after disabling two-factor authentication.",
  })
) {}

/**
 * Disable two-factor authentication endpoint contract.
 *
 * POST /two-factor/disable
 *
 * Disables two-factor authentication for the authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("disable", "/disable")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to disable two-factor authentication.",
      })
    )
  )
  .addSuccess(Success);

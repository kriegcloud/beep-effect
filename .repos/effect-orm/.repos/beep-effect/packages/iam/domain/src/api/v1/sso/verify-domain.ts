/**
 * @fileoverview SSO domain verification endpoint contract.
 *
 * Verifies domain ownership for an SSO provider by checking DNS records.
 *
 * @category IAM API
 * @subcategory SSO
 * @since 1.0.0
 *
 * @see {@link https://www.better-auth.com/docs/plugins/sso | Better Auth SSO Plugin}
 */
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sso/verify-domain");

/**
 * Request payload for domain verification.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** The SSO provider ID to verify domain for */
    providerId: S.String.annotations({
      description: "The SSO provider ID to verify domain for",
    }),
  },
  $I.annotations("VerifyDomainPayload", {
    description: "Payload for SSO domain verification.",
  })
) {}

/**
 * Success response for domain verification.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** Whether the domain verification was successful */
    success: S.Boolean.annotations({
      description: "Whether the domain verification was successful",
    }),
    /** Human-readable message about the verification result */
    message: S.String.annotations({
      description: "Human-readable message about the verification result",
    }),
  },
  $I.annotations("VerifyDomainSuccess", {
    description: "SSO domain verification success response.",
  })
) {}

/**
 * SSO domain verification endpoint contract.
 *
 * POST /sso/verify-domain
 *
 * Verifies domain ownership for an SSO provider by checking DNS records
 * for the domain verification token.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("verify-domain", "/verify-domain")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error during SSO domain verification.",
      })
    )
  );

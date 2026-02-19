/**
 * @fileoverview SSO domain verification request endpoint contract.
 *
 * Requests a new domain verification token for an SSO provider.
 *
 * @category IAM API
 * @subcategory SSO
 * @since 1.0.0
 *
 * @see {@link https://www.better-auth.com/docs/plugins/sso | Better Auth SSO Plugin}
 */
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sso/request-domain-verification");

/**
 * Request payload for requesting domain verification.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** The SSO provider ID to request domain verification for */
    providerId: S.String.annotations({
      description: "The SSO provider ID to request domain verification for",
    }),
  },
  $I.annotations("RequestDomainVerificationPayload", {
    description: "Payload for requesting SSO domain verification.",
  })
) {}

/**
 * Success response for domain verification request.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** The domain verification token to add to DNS */
    verificationToken: S.String.annotations({
      description: "The domain verification token to add to DNS TXT record",
    }),
    /** Prefix for the DNS TXT record name */
    tokenPrefix: S.String.annotations({
      description: "Prefix for the DNS TXT record name (e.g., _beep-verification)",
    }),
    /** Expiry timestamp for the verification token */
    expiresAt: BS.EpochMillisFromAllAcceptable.annotations({
      description: "Expiry timestamp for the verification token",
    }),
  },
  $I.annotations("RequestDomainVerificationSuccess", {
    description: "SSO domain verification request success response.",
  })
) {}

/**
 * SSO domain verification request endpoint contract.
 *
 * POST /sso/request-domain-verification
 *
 * Requests a new domain verification token for an SSO provider.
 * The token should be added as a DNS TXT record for verification.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("request-domain-verification", "/request-domain-verification")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error during SSO domain verification request.",
      })
    )
  );

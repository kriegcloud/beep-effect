/**
 * @fileoverview SAML2 callback endpoint contract.
 *
 * Handles SAML2 assertion callback from identity providers. This endpoint is
 * auto-handled by Better Auth's sso() plugin.
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

const $I = $IamDomainId.create("api/v1/sso/saml2-callback");

/**
 * Path parameters for SAML2 callback.
 *
 * @since 1.0.0
 */
export class PathParams extends S.Class<PathParams>($I`PathParams`)(
  {
    /** The SSO provider ID */
    providerId: S.String.annotations({
      description: "The SSO provider ID",
    }),
  },
  $I.annotations("SAML2CallbackPathParams", {
    description: "Path parameters for SAML2 callback endpoint.",
  })
) {}

/**
 * Request payload for SAML2 callback.
 *
 * Contains the SAML assertion response from the identity provider.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** Base64-encoded SAML response from the identity provider */
    SAMLResponse: S.String.annotations({
      description: "Base64-encoded SAML response from the identity provider",
    }),
    /** Relay state for maintaining context during SSO flow */
    RelayState: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Relay state for maintaining context during SSO flow",
    }),
  },
  $I.annotations("SAML2CallbackPayload", {
    description: "Payload for SAML2 callback endpoint.",
  })
) {}

/**
 * Success response for SAML2 callback.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** Redirect URL after successful SAML2 callback */
    url: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "Redirect URL after successful SAML2 callback",
    }),
  },
  $I.annotations("SAML2CallbackSuccess", {
    description: "SAML2 callback success response.",
  })
) {}

/**
 * SAML2 callback endpoint contract.
 *
 * POST /sso/saml2/callback/:providerId
 *
 * Handles SAML2 assertion callback from identity providers.
 * Auto-handled by Better Auth's sso() plugin.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("saml2-callback", "/saml2/callback/:providerId")
  .setPath(PathParams)
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error during SAML2 callback processing.",
      })
    )
  );

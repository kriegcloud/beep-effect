/**
 * @fileoverview SAML2 Service Provider metadata endpoint contract.
 *
 * Returns the SAML2 SP metadata XML for configuring identity providers.
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

const $I = $IamDomainId.create("api/v1/sso/saml2-sp-metadata");

/**
 * URL parameters for SAML2 SP metadata.
 * Note: UrlParams must be string-encodeable, so we use S.optional instead of S.optionalWith.
 *
 * @since 1.0.0
 */
export class UrlParams extends S.Class<UrlParams>($I`UrlParams`)(
  {
    /** Optional provider ID to get metadata for a specific provider */
    providerId: S.optional(S.String).annotations({
      description: "Optional provider ID to get metadata for a specific provider",
    }),
    /** Optional format parameter (e.g., 'xml' or 'json') */
    format: S.optional(S.String).annotations({
      description: "Optional format parameter (defaults to XML)",
    }),
  },
  $I.annotations("SAML2SpMetadataUrlParams", {
    description: "URL parameters for SAML2 SP metadata endpoint.",
  })
) {}

/**
 * Success response for SAML2 SP metadata.
 *
 * Note: The actual response is XML content with Content-Type: application/xml.
 * This schema represents the wrapped response for Effect's HttpApiEndpoint.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** XML metadata content (used for schema validation, actual response is raw XML) */
    content: S.String.annotations({
      description: "SAML2 SP metadata XML content",
    }),
  },
  $I.annotations("SAML2SpMetadataSuccess", {
    description: "SAML2 SP metadata success response.",
  })
) {}

/**
 * SAML2 SP metadata endpoint contract.
 *
 * GET /sso/saml2/sp/metadata
 *
 * Returns SAML2 Service Provider metadata XML for configuring identity providers.
 * Response Content-Type is application/xml.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.get("saml2-sp-metadata", "/saml2/sp/metadata")
  .setUrlParams(UrlParams)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error retrieving SAML2 SP metadata.",
      })
    )
  );

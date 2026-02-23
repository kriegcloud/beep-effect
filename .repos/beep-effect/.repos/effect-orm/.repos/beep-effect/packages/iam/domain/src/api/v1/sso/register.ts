/**
 * @fileoverview SSO provider registration endpoint contract.
 *
 * Allows registering new OIDC or SAML SSO providers for enterprise authentication.
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
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sso/register");

/**
 * Request payload for registering an SSO provider.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** Unique identifier for the SSO provider */
    providerId: S.String.annotations({
      description: "Unique identifier for the SSO provider",
    }),
    /** Issuer URL of the identity provider */
    issuer: BS.URLString.annotations({
      description: "Issuer URL of the identity provider",
    }),
    /** Domain associated with this SSO provider */
    domain: S.String.annotations({
      description: "Domain associated with this SSO provider (e.g., company.com)",
    }),
    /** OIDC-specific configuration */
    oidcConfig: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "OIDC-specific configuration (clientId, clientSecret, scopes, etc.)",
    }),
    /** SAML-specific configuration */
    samlConfig: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "SAML-specific configuration (certificate, entryPoint, etc.)",
    }),
    /** Organization ID to associate with this provider */
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true }).annotations({
      description: "Organization ID to associate with this SSO provider",
    }),
    /** Override user info mapping from the identity provider */
    overrideUserInfo: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Override user info mapping from the identity provider",
    }),
  },
  $I.annotations("RegisterSSOProviderPayload", {
    description: "Payload for registering an SSO provider.",
  })
) {}

/**
 * Success response for SSO provider registration.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** Issuer URL of the registered provider */
    issuer: BS.URLString.annotations({
      description: "Issuer URL of the registered provider",
    }),
    /** Domain associated with this provider */
    domain: S.String.annotations({
      description: "Domain associated with this provider",
    }),
    /** Whether the domain has been verified */
    domainVerified: S.optionalWith(S.Boolean, { nullable: true }).annotations({
      description: "Whether the domain has been verified",
    }),
    /** Token for domain verification */
    domainVerificationToken: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Token for domain verification (if not yet verified)",
    }),
    /** OIDC configuration (sanitized) */
    oidcConfig: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "OIDC configuration for the provider",
    }),
    /** SAML configuration (sanitized) */
    samlConfig: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "SAML configuration for the provider",
    }),
    /** Organization ID associated with this provider */
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true }).annotations({
      description: "Organization ID associated with this provider",
    }),
    /** User ID of the admin who registered this provider */
    userId: SharedEntityIds.UserId.annotations({
      description: "User ID of the admin who registered this provider",
    }),
    /** Provider ID */
    providerId: S.String.annotations({
      description: "Provider ID",
    }),
    /** Redirect URI for OIDC/SAML callbacks */
    redirectURI: BS.URLString.annotations({
      description: "Redirect URI for OIDC/SAML callbacks",
    }),
  },
  $I.annotations("RegisterSSOProviderSuccess", {
    description: "SSO provider registration success response.",
  })
) {}

/**
 * SSO provider registration endpoint contract.
 *
 * POST /sso/register
 *
 * Registers a new OIDC or SAML SSO provider for enterprise authentication.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("register", "/register")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error during SSO provider registration.",
      })
    )
  );

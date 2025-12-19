/**
 * @fileoverview SSO (Single Sign-On) API group definition.
 *
 * Aggregates all SSO-related endpoints for enterprise authentication including
 * OIDC callbacks, SAML2 assertions, provider registration, and domain verification.
 *
 * @category IAM API
 * @subcategory SSO
 * @since 1.0.0
 *
 * @see {@link https://www.better-auth.com/docs/plugins/sso | Better Auth SSO Plugin}
 */
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Callback from "./callback.ts";
import * as Register from "./register.ts";
import * as RequestDomainVerification from "./request-domain-verification.ts";
import * as Saml2Callback from "./saml2-callback.ts";
import * as Saml2SpAcs from "./saml2-sp-acs.ts";
import * as Saml2SpMetadata from "./saml2-sp-metadata.ts";
import * as VerifyDomain from "./verify-domain.ts";

/**
 * SSO API group.
 *
 * Includes:
 * - GET /sso/callback/:providerId - OIDC callback (plugin-managed)
 * - POST /sso/register - Register SSO provider
 * - POST /sso/saml2/callback/:providerId - SAML2 callback (plugin-managed)
 * - POST /sso/saml2/sp/acs/:providerId - SAML2 SP ACS (plugin-managed)
 * - GET /sso/saml2/sp/metadata - SAML2 SP metadata
 * - POST /sso/verify-domain - Verify domain ownership
 * - POST /sso/request-domain-verification - Request verification token
 *
 * @since 1.0.0
 */
export class Group extends HttpApiGroup.make("iam.sso")
  .add(Callback.Contract)
  .add(Register.Contract)
  .add(RequestDomainVerification.Contract)
  .add(Saml2Callback.Contract)
  .add(Saml2SpAcs.Contract)
  .add(Saml2SpMetadata.Contract)
  .add(VerifyDomain.Contract)
  .prefix("/sso") {}

export { Callback, Register, RequestDomainVerification, Saml2Callback, Saml2SpAcs, Saml2SpMetadata, VerifyDomain };

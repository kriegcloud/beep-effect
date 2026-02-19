/**
 * @module _group
 *
 * SSO API group handler implementation.
 * Routes all SSO-related endpoints to their handlers.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Callback from "./callback";
import * as Register from "./register";
import * as RequestDomainVerification from "./request-domain-verification";
import * as Saml2Callback from "./saml2-callback";
import * as Saml2SpAcs from "./saml2-sp-acs";
import * as Saml2SpMetadata from "./saml2-sp-metadata";
import * as VerifyDomain from "./verify-domain";

export type Service = HttpApiGroup.ApiGroup<"iam", "sso">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

/**
 * SSO API group routes.
 *
 * Handles:
 * - GET /sso/callback/:providerId - OIDC callback (plugin-managed)
 * - POST /sso/register - Register SSO provider
 * - POST /sso/saml2/callback/:providerId - SAML2 callback (plugin-managed)
 * - POST /sso/saml2/sp/acs/:providerId - SAML2 SP ACS (plugin-managed)
 * - GET /sso/saml2/sp/metadata - SAML2 SP metadata
 * - POST /sso/verify-domain - Verify domain ownership
 * - POST /sso/request-domain-verification - Request verification token
 *
 * @since 0.1.0
 */
export const Routes: Routes = HttpApiBuilder.group(IamApi, "sso", (h) =>
  h
    .handle("callback", Callback.Handler)
    .handle("register", Register.Handler)
    .handle("request-domain-verification", RequestDomainVerification.Handler)
    .handle("saml2-callback", Saml2Callback.Handler)
    .handle("saml2-sp-acs", Saml2SpAcs.Handler)
    .handle("saml2-sp-metadata", Saml2SpMetadata.Handler)
    .handle("verify-domain", VerifyDomain.Handler)
);

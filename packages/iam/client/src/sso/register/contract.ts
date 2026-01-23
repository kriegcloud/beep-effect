/**
 * @fileoverview
 * SSO register contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for registering an SSO provider.
 *
 * @module @beep/iam-client/sso/register/contract
 * @category SSO/Register
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sso/register");

/**
 * OIDC configuration for SSO provider.
 *
 * @category SSO/Register/Schemas
 * @since 0.1.0
 */
export class OidcConfig extends S.Class<OidcConfig>($I`OidcConfig`)(
  {
    clientId: S.String, // External IdP OAuth client ID - intentionally S.String
    clientSecret: S.Redacted(S.String),
    authorizationEndpoint: S.optional(S.String),
    tokenEndpoint: S.optional(S.String),
    jwksEndpoint: S.optional(S.String),
    discoveryEndpoint: S.optional(S.String),
    scopes: S.optional(S.mutable(S.Array(S.String))),
    pkce: S.optional(S.Boolean),
  },
  $I.annotations("OidcConfig", {
    description: "OIDC configuration for SSO provider.",
  })
) {}

/**
 * SP metadata configuration for SAML.
 *
 * @category SSO/Register/Schemas
 * @since 0.1.0
 */
export class SpMetadata extends S.Class<SpMetadata>($I`SpMetadata`)(
  {
    metadata: S.optional(S.String),
    entityID: S.optional(S.String),
    binding: S.optional(S.String),
    privateKey: S.optional(S.String),
    privateKeyPass: S.optional(S.String),
    isAssertionEncrypted: S.optional(S.Boolean),
    encPrivateKey: S.optional(S.String),
    encPrivateKeyPass: S.optional(S.String),
  },
  $I.annotations("SpMetadata", {
    description: "Service Provider metadata configuration.",
  })
) {}

/**
 * SAML configuration for SSO provider.
 *
 * @category SSO/Register/Schemas
 * @since 0.1.0
 */
export class SamlConfig extends S.Class<SamlConfig>($I`SamlConfig`)(
  {
    entryPoint: S.String,
    cert: S.String,
    callbackUrl: S.String,
    spMetadata: SpMetadata,
    audience: S.optional(S.String),
    wantAssertionsSigned: S.optional(S.Boolean),
    signatureAlgorithm: S.optional(S.String),
    digestAlgorithm: S.optional(S.String),
  },
  $I.annotations("SamlConfig", {
    description: "SAML configuration for SSO provider.",
  })
) {}

/**
 * Payload for registering an SSO provider.
 *
 * @example
 * ```typescript
 * import { Register } from "@beep/iam-client/sso"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = Register.Payload.make({
 *   providerId: "acme-corp",
 *   issuer: "https://idp.acme.com",
 *   domain: "acme.com",
 *   oidcConfig: {
 *     clientId: "client123",
 *     clientSecret: Redacted.make("secret456")
 *   }
 * })
 * ```
 *
 * @category SSO/Register/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: IamEntityIds.SsoProviderId,
    issuer: S.String,
    domain: S.String,
    oidcConfig: S.optional(OidcConfig),
    samlConfig: S.optional(SamlConfig),
    organizationId: S.optional(SharedEntityIds.OrganizationId),
  },
  formValuesAnnotation({
    providerId: "",
    issuer: "",
    domain: "",
  })
) {}

/**
 * Success response for registering an SSO provider.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Register } from "@beep/iam-client/sso"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Register.Handler({
 *     providerId: "acme-corp",
 *     issuer: "https://idp.acme.com",
 *     domain: "acme.com"
 *   })
 *   console.log(`Provider registered: ${result.providerId}`)
 * })
 * ```
 *
 * @category SSO/Register/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    providerId: IamEntityIds.SsoProviderId,
    domain: S.String,
    verificationToken: S.optional(S.Redacted(S.String)),
  },
  $I.annotations("Success", {
    description: "Success response containing the registered provider details.",
  })
) {}

/**
 * Contract wrapper for SSO register operations.
 *
 * @example
 * ```typescript
 * import { Register } from "@beep/iam-client/sso"
 *
 * const handler = Register.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SSO/Register/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SsoRegister", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

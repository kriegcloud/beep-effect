/**
 * @module BetterAuthBridge
 *
 * Type bridge for Better Auth organization plugin operations.
 *
 * Better Auth's organization plugin provides Dynamic Access Control methods that
 * are added at runtime via the `dynamicAccessControl` option. These methods aren't
 * reflected in Better Auth's TypeScript types, so this module provides:
 *
 * 1. Type-safe wrappers for Dynamic Access Control methods (getOrgRole, createOrgRole, etc.)
 * 2. Input type definitions for these operations
 *
 * @category adapters
 * @since 0.1.0
 */

/**
 * Query parameter types for Better Auth organization operations.
 *
 * These types document the expected shape of query parameters for GET endpoints.
 */
export namespace OrganizationQuery {
  /**
   * Query for getOrgRole endpoint (dynamicAccessControl).
   */
  export interface GetRole {
    readonly roleId: string;
  }
}

/**
 * Input types for Dynamic Access Control operations.
 *
 * These methods are provided by the `dynamicAccessControl` option in the
 * organization plugin but are not reflected in Better Auth's TypeScript types.
 */
export namespace DynamicAccessControlInput {
  /**
   * Input for createOrgRole endpoint.
   */
  export interface CreateRole {
    readonly role: string;
    readonly permissions: readonly string[];
    readonly organizationId?: string;
  }

  /**
   * Input for deleteOrgRole endpoint.
   */
  export interface DeleteRole {
    readonly roleId: string;
    readonly organizationId?: string;
  }

  /**
   * Input for updateOrgRole endpoint.
   */
  export interface UpdateRole {
    readonly roleId: string;
    readonly permissions?: readonly string[];
    readonly organizationId?: string;
  }
}

import * as Effect from "effect/Effect";

/**
 * Safely calls a dynamic method on an API object.
 *
 * Better Auth's organization plugin adds methods like `getOrgRole`, `createOrgRole`, etc.
 * at runtime via the `dynamicAccessControl` option. These methods aren't in the TypeScript
 * types, so we need to access them dynamically.
 *
 * This function checks if the method exists at runtime and calls it if available.
 *
 * @internal
 */
const callDynamicMethod = <TArgs, TResult>(
  api: Record<string, unknown>,
  methodName: string,
  args: TArgs
): Effect.Effect<TResult, Error> =>
  Effect.gen(function* () {
    const method = api[methodName];
    if (typeof method !== "function") {
      return yield* Effect.fail(
        new Error(
          `Dynamic Access Control method '${methodName}' not available. Ensure dynamicAccessControl is enabled.`
        )
      );
    }
    return yield* Effect.tryPromise({
      try: () => method(args) as Promise<TResult>,
      catch: (error) => new Error(`Failed to call ${methodName}: ${String(error)}`),
    });
  });

/**
 * Get an organization role by ID.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const getOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly query: OrganizationQuery.GetRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "getOrgRole", opts);

/**
 * Create a new organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const createOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.CreateRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "createOrgRole", opts);

/**
 * Delete an organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const deleteOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.DeleteRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "deleteOrgRole", opts);

/**
 * Update an organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const updateOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.UpdateRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "updateOrgRole", opts);

/**
 * List all organization roles.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const listOrgRoles = (
  api: Record<string, unknown>,
  opts: {
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "listOrgRoles", opts);

/**
 * Passkey input types for endpoints that accept WebAuthn responses.
 *
 * WebAuthn response types are complex external types from @simplewebauthn/server.
 * These wrappers allow passing opaque JSON objects that the browser generates.
 */
export namespace PasskeyInput {
  /**
   * Input for verifyPasskeyAuthentication endpoint.
   * The response field contains WebAuthn AuthenticationResponseJSON from the browser.
   */
  export interface VerifyAuthentication {
    readonly response: Record<string, unknown>;
  }

  /**
   * Input for verifyPasskeyRegistration endpoint.
   * The response field contains WebAuthn RegistrationResponseJSON from the browser.
   */
  export interface VerifyRegistration {
    readonly response: Record<string, unknown>;
    readonly name?: string | undefined;
  }
}

/**
 * Verify a passkey authentication response.
 *
 * The WebAuthn response from the browser is passed through opaquely since
 * the AuthenticationResponseJSON type is complex and external.
 *
 * @category Passkey
 * @since 0.1.0
 */
export const verifyPasskeyAuthentication = (
  api: Record<string, unknown>,
  opts: {
    readonly body: PasskeyInput.VerifyAuthentication;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "verifyPasskeyAuthentication", opts);

/**
 * Verify a passkey registration response.
 *
 * The WebAuthn response from the browser is passed through opaquely since
 * the RegistrationResponseJSON type is complex and external.
 *
 * @category Passkey
 * @since 0.1.0
 */
export const verifyPasskeyRegistration = (
  api: Record<string, unknown>,
  opts: {
    readonly body: PasskeyInput.VerifyRegistration;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "verifyPasskeyRegistration", opts);

// =============================================================================
// OAuth2 Provider Endpoints
// =============================================================================

/**
 * Input types for OAuth2 Provider operations.
 *
 * These endpoints are auto-handled by Better Auth's oidcProvider() plugin.
 * The methods are dynamically added and not reflected in TypeScript types.
 */
export namespace OAuth2Input {
  /**
   * Query parameters for the authorize endpoint.
   */
  export interface Authorize {
    readonly client_id: string;
    readonly redirect_uri: string;
    readonly response_type: string;
    readonly scope?: string | null;
    readonly state?: string | null;
    readonly code_challenge?: string | null;
    readonly code_challenge_method?: string | null;
    readonly nonce?: string | null;
    readonly prompt?: string | null;
  }

  /**
   * Input for the callback endpoint.
   */
  export interface Callback {
    readonly providerId: string;
    readonly code?: string | null;
    readonly error?: string | null;
    readonly error_description?: string | null;
    readonly state?: string | null;
  }

  /**
   * Input for the consent endpoint.
   */
  export interface Consent {
    readonly accept: boolean;
    readonly consent_code?: string | null;
  }

  /**
   * Input for the link endpoint.
   */
  export interface Link {
    readonly providerId: string;
    readonly callbackURL: string;
    readonly scopes?: readonly string[] | null;
    readonly errorCallbackURL?: string | null;
  }

  /**
   * Input for the register endpoint (RFC 7591).
   */
  export interface Register {
    readonly redirect_uris: readonly string[];
    readonly token_endpoint_auth_method?: string | null;
    readonly grant_types?: string | null;
    readonly response_types?: string | null;
    readonly client_name?: string | null;
    readonly client_uri?: string | null;
    readonly logo_uri?: string | null;
    readonly scope?: string | null;
    readonly contacts?: readonly string[] | null;
    readonly tos_uri?: string | null;
    readonly policy_uri?: string | null;
    readonly jwks_uri?: string | null;
    readonly jwks?: unknown | null;
    readonly metadata?: unknown | null;
    readonly software_id?: string | null;
    readonly software_version?: string | null;
    readonly software_statement?: string | null;
  }

  /**
   * Input for the token endpoint.
   */
  export interface Token {
    readonly grant_type: string;
    readonly code?: string | null;
    readonly redirect_uri?: string | null;
    readonly client_id?: string | null;
    readonly client_secret?: string | null;
    readonly refresh_token?: string | null;
    readonly code_verifier?: string | null;
  }
}

/**
 * OAuth2 authorize endpoint proxy.
 *
 * Initiates the OAuth2 authorization code flow.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Authorize = (
  api: Record<string, unknown>,
  opts: {
    readonly query: OAuth2Input.Authorize;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Authorize", opts);

/**
 * OAuth2 callback endpoint proxy.
 *
 * Handles the callback from an OAuth2 provider.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Callback = (
  api: Record<string, unknown>,
  opts: {
    readonly query: Omit<OAuth2Input.Callback, "providerId">;
    readonly params: { readonly providerId: string };
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Callback", opts);

/**
 * OAuth2 get client endpoint proxy.
 *
 * Retrieves public information about an OAuth2 client.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2GetClient = (
  api: Record<string, unknown>,
  opts: {
    readonly params: { readonly id: string };
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2GetClient", opts);

/**
 * OAuth2 consent endpoint proxy.
 *
 * Processes user consent for an OAuth2 authorization request.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Consent = (
  api: Record<string, unknown>,
  opts: {
    readonly body: OAuth2Input.Consent;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Consent", opts);

/**
 * OAuth2 link endpoint proxy.
 *
 * Initiates linking an OAuth2 provider to the current user.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Link = (
  api: Record<string, unknown>,
  opts: {
    readonly body: OAuth2Input.Link;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Link", opts);

/**
 * OAuth2 register endpoint proxy.
 *
 * Dynamically registers a new OAuth2 client (RFC 7591).
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Register = (
  api: Record<string, unknown>,
  opts: {
    readonly body: OAuth2Input.Register;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Register", opts);

/**
 * OAuth2 token endpoint proxy.
 *
 * Exchanges authorization codes for access tokens.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Token = (
  api: Record<string, unknown>,
  opts: {
    readonly body: OAuth2Input.Token;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Token", opts);

/**
 * OAuth2 userinfo endpoint proxy.
 *
 * Returns claims about the authenticated user.
 *
 * @category OAuth2
 * @since 0.1.0
 */
export const oauth2Userinfo = (
  api: Record<string, unknown>,
  opts: {
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "oauth2Userinfo", opts);

// =============================================================================
// SSO (Single Sign-On) Provider Endpoints
// =============================================================================

/**
 * Input types for SSO Provider operations.
 *
 * These endpoints are auto-handled by Better Auth's sso() plugin.
 * Some methods are dynamically added and not reflected in TypeScript types.
 */
export namespace SSOInput {
  /**
   * Query parameters for the SSO callback endpoint.
   */
  export interface Callback {
    readonly code?: string | null;
    readonly state?: string | null;
    readonly error?: string | null;
    readonly error_description?: string | null;
  }

  /**
   * Input for the SAML2 callback endpoint.
   */
  export interface Saml2Callback {
    readonly SAMLResponse: string;
    readonly RelayState?: string | null;
  }
}

/**
 * SSO callback endpoint proxy.
 *
 * Handles OIDC authorization code callback from SSO providers.
 * Auto-handled by Better Auth's sso() plugin.
 *
 * @category SSO
 * @since 0.1.0
 */
export const ssoCallback = (
  api: Record<string, unknown>,
  opts: {
    readonly providerId: string;
    readonly query?: SSOInput.Callback;
    readonly headers: unknown;
  }
): Effect.Effect<{ headers: Headers; response: unknown }, Error> => callDynamicMethod(api, "ssoCallback", opts);

/**
 * SAML2 callback endpoint proxy.
 *
 * Handles SAML2 assertion callback from identity providers.
 * Auto-handled by Better Auth's sso() plugin.
 *
 * @category SSO
 * @since 0.1.0
 */
export const saml2Callback = (
  api: Record<string, unknown>,
  opts: {
    readonly providerId: string;
    readonly body: SSOInput.Saml2Callback;
    readonly headers: unknown;
  }
): Effect.Effect<{ headers: Headers; response: unknown }, Error> => callDynamicMethod(api, "saml2Callback", opts);

/**
 * SAML2 SP ACS endpoint proxy.
 *
 * Handles SAML2 assertions at the Service Provider Assertion Consumer Service endpoint.
 * Auto-handled by Better Auth's sso() plugin.
 *
 * @category SSO
 * @since 0.1.0
 */
export const saml2SpAcs = (
  api: Record<string, unknown>,
  opts: {
    readonly providerId: string;
    readonly body: SSOInput.Saml2Callback;
    readonly headers: unknown;
  }
): Effect.Effect<{ headers: Headers; response: unknown }, Error> => callDynamicMethod(api, "saml2SpAcs", opts);

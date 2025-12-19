# SSO API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Enterprise SSO and SAML endpoints

**Priority**: P2
**Milestones**: M14
**Endpoint Count**: 5

## SSO Provider Management Methods

Better Auth provides these methods for managing SSO providers:
- `ssoRegisterProvider` - Register OIDC/SAML provider (covered in this spec)
- `ssoListProviders` - List all registered providers
- `ssoGetProvider` - Get provider details by ID
- `ssoUpdateProvider` - Update provider configuration
- `ssoDeleteProvider` - Remove a provider

**Note**: The sign-in SSO method `signInSSO` is covered in [SIGN_IN.md](./SIGN_IN.md).

## Flow Types

SSO endpoints involve two flow types:

1. **Direct API calls**: Methods called directly by the client (e.g., `ssoRegisterProvider`)
2. **Redirect-based flows**: Endpoints called by external IdPs during OAuth/SAML flows (e.g., callbacks, ACS endpoints)

Callback endpoints are internal handlers that process responses from identity providers and should not be called directly by client code.

## Endpoints

### `GET /sso/callback/{providerId}`

**Description**: This endpoint is used as the callback URL for SSO providers. It handles the authorization code and exchanges it for an access token

**Better Auth Method**: Internal callback handler (no direct method call)

**Flow Type**: Redirect-based (IdP redirects back to this endpoint after authentication)

**Parameters**:

| Name              | Location | Type   | Required | Description |
|-------------------|----------|--------|----------|-------------|
| code              | query    | string | No       |             |
| state             | query    | string | No       |             |
| error             | query    | string | No       |             |
| error_description | query    | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sso/register`

**Description**: This endpoint is used to register an OIDC provider. This is used to configure the provider and link it to an organization

**Better Auth Method**: `ssoRegisterProvider`

**Flow Type**: Direct API call (returns provider configuration)

**Request Body**:

| Field            | Type   | Required | Description                                                                             |
|------------------|--------|----------|-----------------------------------------------------------------------------------------|
| providerId       | string | Yes      | The ID of the provider. This is used to identify the provider during login and callback |
| issuer           | string | Yes      | The issuer of the provider                                                              |
| domain           | string | Yes      | The domain of the provider. This is used for email matching                             |
| oidcConfig       | object | No       |                                                                                         |
| samlConfig       | object | No       |                                                                                         |
| organizationId   | string | No       | If organization plugin is enabled, the organization id to link the provider to          |
| overrideUserInfo | string | No       |                                                                                         |

**Success Response** (`200`):

| Field                   | Type         | Required | Description                                                                      |
|-------------------------|--------------|----------|----------------------------------------------------------------------------------|
| issuer                  | string (uri) | Yes      | The issuer URL of the provider                                                   |
| domain                  | string       | Yes      | The domain of the provider, used for email matching                              |
| domainVerified          | boolean      | No       | A boolean indicating whether the domain has been verified or not                 |
| domainVerificationToken | string       | No       | Domain verification token. It can be used to prove ownership over the SSO domain |
| oidcConfig              | object       | Yes      | OIDC configuration for the provider                                              |
| organizationId          | string       | No       | ID of the linked organization, if any                                            |
| userId                  | string       | Yes      | ID of the user who registered the provider                                       |
| providerId              | string       | Yes      | Unique identifier for the provider                                               |
| redirectURI             | string (uri) | Yes      | The redirect URI for the provider callback                                       |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sso/saml2/callback/{providerId}`

**Description**: This endpoint is used as the callback URL for SAML providers.

**Better Auth Method**: Internal SAML callback handler (no direct method call)

**Flow Type**: Redirect-based (SAML IdP posts response to this endpoint)

**Request Body**:

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| SAMLResponse | string | Yes      |             |
| RelayState   | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sso/saml2/sp/acs/{providerId}`

**Description**: Handles SAML responses from IdP after successful authentication

**Better Auth Method**: Internal SAML ACS handler (no direct method call)

**Flow Type**: Redirect-based (SAML Assertion Consumer Service endpoint)

**Request Body**:

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| SAMLResponse | string | Yes      |             |
| RelayState   | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /sso/saml2/sp/metadata`

**Description**: Returns the SAML metadata for the Service Provider

**Better Auth Method**: Internal metadata handler (no direct method call)

**Flow Type**: Direct API call (returns XML metadata for SAML configuration)

**Parameters**:

| Name       | Location | Type   | Required | Description |
|------------|----------|--------|----------|-------------|
| providerId | query    | string | No       |             |
| format     | query    | string | No       |             |

**Success Response** (`200`):

SAML metadata in XML format

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

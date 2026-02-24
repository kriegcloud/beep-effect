# OAuth 2.0 API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: OAuth 2.0 provider endpoints

**Priority**: P3
**Milestones**: M13
**Endpoint Count**: 8

## Important Notes

- **OAuth2 Provider Plugin**: These endpoints are for when YOUR application acts as an OAuth2 identity provider (IDP) for third-party applications
- **Different from Consumer**: This is distinct from `signInWithOAuth2` which is for consuming external OAuth providers (e.g., signing in with Google, GitHub)
- **Use Case**: Enable other applications to authenticate users via your app using the OAuth2 protocol

## Endpoints

### `GET /oauth2/authorize`

**Description**: Authorize an OAuth2 request

**Better Auth Method**: `oauth2Authorize`

**Flow Type**: Redirect-based OAuth flow (user-facing authorization screen)

**Success Response** (`200`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /oauth2/callback/{providerId}`

**Description**: OAuth2 callback

**Better Auth Method**: `oauth2Callback` (internal handler)

**Flow Type**: Redirect-based OAuth flow (callback from external provider)

**Parameters**:

| Name              | Location | Type   | Required | Description |
|-------------------|----------|--------|----------|-------------|
| code              | query    | string | No       |             |
| error             | query    | string | No       |             |
| error_description | query    | string | No       |             |
| state             | query    | string | No       |             |

**Success Response** (`200`):

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| url   | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /oauth2/client/{id}`

**Description**: Get OAuth2 client details

**Better Auth Method**: `oauth2GetClient`

**Success Response** (`200`):

| Field    | Type   | Required | Description                      |
|----------|--------|----------|----------------------------------|
| clientId | string | Yes      | Unique identifier for the client |
| name     | string | Yes      | Name of the OAuth2 application   |
| icon     | string | No       | Icon URL for the application     |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /oauth2/consent`

**Description**: Handle OAuth2 consent. Supports both URL parameter-based flows (consent_code in body) and cookie-based flows (signed cookie).

**Better Auth Method**: `oauth2CreateConsent`

**Flow Type**: Redirect-based OAuth flow (user consent decision endpoint)

**Request Body**:

| Field        | Type    | Required | Description                                                                           |
|--------------|---------|----------|---------------------------------------------------------------------------------------|
| accept       | boolean | Yes      | Whether the user accepts or denies the consent request                                |
| consent_code | string  | No       | The consent code from the authorization request. Optional if using cookie-based flow. |

**Success Response** (`200`):

| Field       | Type         | Required | Description                                                           |
|-------------|--------------|----------|-----------------------------------------------------------------------|
| redirectURI | string (uri) | Yes      | The URI to redirect to, either with an authorization code or an error |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /oauth2/link`

**Description**: Link an OAuth2 account to the current user session

**Better Auth Method**: `linkSocial`

**Flow Type**: Redirect-based OAuth flow (account linking initiation)

**Request Body**:

| Field            | Type      | Required | Description                                                         |
|------------------|-----------|----------|---------------------------------------------------------------------|
| providerId       | string    | Yes      |                                                                     |
| callbackURL      | string    | Yes      |                                                                     |
| scopes           | unknown[] | No       | Additional scopes to request when linking the account               |
| errorCallbackURL | string    | No       | The URL to redirect to if there is an error during the link process |

**Success Response** (`200`):

| Field    | Type             | Required | Description                                                                  |
|----------|------------------|----------|------------------------------------------------------------------------------|
| url      | string (uri)     | Yes      | The authorization URL to redirect the user to for linking the OAuth2 account |
| redirect | boolean (`True`) | Yes      | Indicates that the client should redirect to the provided URL                |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /oauth2/register`

**Description**: Register an OAuth2 application

**Better Auth Method**: `oauth2CreateApplication`

**Request Body**:

| Field                      | Type      | Required | Description                                                                                                       |
|----------------------------|-----------|----------|-------------------------------------------------------------------------------------------------------------------|
| redirect_uris              | unknown[] | Yes      | A list of redirect URIs. Eg: ["https://client.example.com/callback"]                                              |
| token_endpoint_auth_method | string    | No       |                                                                                                                   |
| grant_types                | string    | No       |                                                                                                                   |
| response_types             | string    | No       |                                                                                                                   |
| client_name                | string    | No       | The name of the application. Eg: "My App"                                                                         |
| client_uri                 | string    | No       | The URI of the application. Eg: "https://client.example.com"                                                      |
| logo_uri                   | string    | No       | The URI of the application logo. Eg: "https://client.example.com/logo.png"                                        |
| scope                      | string    | No       | The scopes supported by the application. Separated by spaces. Eg: "profile email"                                 |
| contacts                   | unknown[] | No       | The contact information for the application. Eg: ["admin@example.com"]                                            |
| tos_uri                    | string    | No       | The URI of the application terms of service. Eg: "https://client.example.com/tos"                                 |
| policy_uri                 | string    | No       | The URI of the application privacy policy. Eg: "https://client.example.com/policy"                                |
| jwks_uri                   | string    | No       | The URI of the application JWKS. Eg: "https://client.example.com/jwks"                                            |
| jwks                       | string    | No       | The JWKS of the application. Eg: {"keys": [{"kty": "RSA", "alg": "RS256", "use": "sig", "n": "...", "e": "..."}]} |
| metadata                   | string    | No       | The metadata of the application. Eg: {"key": "value"}                                                             |
| software_id                | string    | No       | The software ID of the application. Eg: "my-software"                                                             |
| software_version           | string    | No       | The software version of the application. Eg: "1.0.0"                                                              |
| software_statement         | string    | No       | The software statement of the application.                                                                        |

**Success Response** (`200`):

| Field                | Type                     | Required | Description                                                              |
|----------------------|--------------------------|----------|--------------------------------------------------------------------------|
| name                 | string                   | Yes      | Name of the OAuth2 application                                           |
| icon                 | string                   | No       | Icon URL for the application                                             |
| metadata             | object                   | No       | Additional metadata for the application                                  |
| clientId             | string                   | Yes      | Unique identifier for the client                                         |
| clientSecret         | string                   | Yes      | Secret key for the client                                                |
| redirectURLs         | string (uri)[]           | Yes      | List of allowed redirect URLs                                            |
| type                 | string (`web`)           | Yes      | Type of the client                                                       |
| authenticationScheme | string (`client_secret`) | Yes      | Authentication scheme used by the client                                 |
| disabled             | boolean (`False`)        | Yes      | Whether the client is disabled                                           |
| userId               | string                   | No       | ID of the user who registered the client, null if registered anonymously |
| createdAt            | string (date-time)       | Yes      | Creation timestamp                                                       |
| updatedAt            | string (date-time)       | Yes      | Last update timestamp                                                    |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /oauth2/token`

**Description**: Exchange authorization code for access token

**Better Auth Method**: `oauth2Token`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /oauth2/userinfo`

**Description**: Get OAuth2 user information

**Better Auth Method**: `oauth2GetUserInfo`

**Success Response** (`200`):

| Field          | Type           | Required | Description                                                         |
|----------------|----------------|----------|---------------------------------------------------------------------|
| sub            | string         | Yes      | Subject identifier (user ID)                                        |
| email          | string (email) | No       | User's email address, included if 'email' scope is granted          |
| name           | string         | No       | User's full name, included if 'profile' scope is granted            |
| picture        | string (uri)   | No       | User's profile picture URL, included if 'profile' scope is granted  |
| given_name     | string         | No       | User's given name, included if 'profile' scope is granted           |
| family_name    | string         | No       | User's family name, included if 'profile' scope is granted          |
| email_verified | boolean        | No       | Whether the email is verified, included if 'email' scope is granted |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

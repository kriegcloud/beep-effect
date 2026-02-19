# Sign In API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: User authentication endpoints

**Priority**: P0
**Milestones**: M1
**Endpoint Count**: 7

## Endpoints

### `POST /sign-in/anonymous`

**Better Auth API Method**: `auth.api.signInAnonymous`

**Description**: Sign in anonymously

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| user    | [`User`](SCHEMAS.md#user)       | No       |             |
| session | [`Session`](SCHEMAS.md#session) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/email`

**Better Auth API Method**: `auth.api.signInEmail`

**Description**: Sign in with email and password

**Request Body**:

| Field       | Type   | Required | Description                                              |
|-------------|--------|----------|----------------------------------------------------------|
| email       | string | Yes      | Email of the user                                        |
| password    | string | Yes      | Password of the user                                     |
| callbackURL | string | No       | Callback URL to use as a redirect for email verification |
| rememberMe  | string | No       |                                                          |

**Success Response** (`200`):

| Field    | Type                      | Required | Description   |
|----------|---------------------------|----------|---------------|
| redirect | boolean (`False`)         | Yes      |               |
| token    | string                    | Yes      | Session token |
| url      | string                    | No       |               |
| user     | [`User`](SCHEMAS.md#user) | Yes      |               |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/oauth2`

**Better Auth API Method**: `auth.api.signInWithOAuth2`

**Description**: Sign in with OAuth2

**Flow Type**: Redirect-based OAuth flow. Returns `{ url, redirect }` to initiate provider authentication. Session cookies are set during the callback after successful provider authentication, not during this initial request.

**Request Body**:

| Field              | Type                   | Required | Description                                                                                        |
|--------------------|------------------------|----------|----------------------------------------------------------------------------------------------------|
| providerId         | string                 | Yes      | The provider ID for the OAuth provider                                                             |
| callbackURL        | string                 | No       | The URL to redirect to after sign in                                                               |
| errorCallbackURL   | string                 | No       | The URL to redirect to if an error occurs                                                          |
| newUserCallbackURL | string                 | No       | The URL to redirect to after login if the user is new. Eg: "/welcome"                              |
| disableRedirect    | boolean                | No       | Disable redirect                                                                                   |
| scopes             | string[]               | No       | Scopes to be passed to the provider authorization request.                                         |
| requestSignUp      | boolean                | No       | Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider. Eg: false |
| additionalData     | Record<string, any>    | No       | Additional data to pass to the provider (object, not string)                                       |

**Success Response** (`200`):

| Field    | Type    | Required | Description                                                  |
|----------|---------|----------|--------------------------------------------------------------|
| url      | string  | No       | Authorization URL to redirect user to for OAuth flow         |
| redirect | boolean | No       | Indicates whether client should perform redirect to url      |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/phone-number`

**Better Auth API Method**: `auth.api.signInPhoneNumber`

**Description**: Use this endpoint to sign in with phone number

**Request Body**:

| Field       | Type    | Required | Description                                |
|-------------|---------|----------|--------------------------------------------|
| phoneNumber | string  | Yes      | Phone number to sign in. Eg: "+1234567890" |
| password    | string  | Yes      | Password to use for sign in.               |
| rememberMe  | boolean | No       | Remember the session. Eg: true             |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| user    | [`User`](SCHEMAS.md#user)       | No       |             |
| session | [`Session`](SCHEMAS.md#session) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/social`

**Better Auth API Method**: `auth.api.signInSocial`

**Description**: Sign in with a social provider

**Flow Type**: Redirect-based social OAuth flow. Returns `{ url, redirect }` to initiate provider authentication. Session cookies are set during the callback after successful provider authentication, not during this initial request.

**Request Body**:

| Field              | Type                | Required | Description                                                                                 |
|--------------------|---------------------|----------|---------------------------------------------------------------------------------------------|
| callbackURL        | string              | No       | Callback URL to redirect to after the user has signed in                                    |
| newUserCallbackURL | string              | No       |                                                                                             |
| errorCallbackURL   | string              | No       | Callback URL to redirect to if an error happens                                             |
| provider           | string              | Yes      |                                                                                             |
| disableRedirect    | boolean             | No       | Disable automatic redirection to the provider. Useful for handling the redirection yourself |
| idToken            | object              | No       |                                                                                             |
| scopes             | string[]            | No       | Array of scopes to request from the provider. This will override the default scopes passed. |
| requestSignUp      | boolean             | No       | Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider     |
| loginHint          | string              | No       | The login hint to use for the authorization code request                                    |
| additionalData     | Record<string, any> | No       | Additional data to pass to the provider (object, not string)                                |

**Success Response** (`200`):

| Field    | Type                      | Required | Description |
|----------|---------------------------|----------|-------------|
| token    | string                    | Yes      |             |
| user     | [`User`](SCHEMAS.md#user) | Yes      |             |
| url      | string                    | No       |             |
| redirect | boolean (`False`)         | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/sso`

**Better Auth API Method**: `auth.api.signInSSO`

**Description**: This endpoint is used to sign in with an SSO provider. It redirects to the provider's authorization URL

**Flow Type**: Redirect-based SSO flow. Returns `{ url, redirect }` to initiate provider authentication. Session cookies are set during the callback after successful provider authentication, not during this initial request.

**Request Body**:

| Field              | Type   | Required | Description                                                                                                                                                                  |
|--------------------|--------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| email              | string | No       | The email address to sign in with. This is used to identify the issuer to sign in with. It's optional if the issuer is provided                                              |
| issuer             | string | No       | The issuer identifier, this is the URL of the provider and can be used to verify the provider and identify the provider during login. It's optional if the email is provided |
| providerId         | string | No       | The ID of the provider to sign in with. This can be provided instead of email or issuer                                                                                      |
| callbackURL        | string | Yes      | The URL to redirect to after login                                                                                                                                           |
| errorCallbackURL   | string | No       | The URL to redirect to after login                                                                                                                                           |
| newUserCallbackURL | string | No       | The URL to redirect to after login if the user is new                                                                                                                        |
| loginHint          | string | No       | Login hint to send to the identity provider (e.g., email or identifier). If supported, sent as 'login_hint'.                                                                 |

**Success Response** (`200`):

| Field    | Type             | Required | Description                                                   |
|----------|------------------|----------|---------------------------------------------------------------|
| url      | string (uri)     | Yes      | The authorization URL to redirect the user to for SSO sign-in |
| redirect | boolean (`True`) | Yes      | Indicates that the client should redirect to the provided URL |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-in/username`

**Better Auth API Method**: `auth.api.signInUsername`

**Description**: Sign in with username

**Request Body**:

| Field       | Type    | Required | Description                                     |
|-------------|---------|----------|-------------------------------------------------|
| username    | string  | Yes      | The username of the user                        |
| password    | string  | Yes      | The password of the user                        |
| rememberMe  | boolean | No       | Remember the user session                       |
| callbackURL | string  | No       | The URL to redirect to after email verification |

**Success Response** (`200`):

| Field | Type                      | Required | Description                                 |
|-------|---------------------------|----------|---------------------------------------------|
| token | string                    | Yes      | Session token for the authenticated session |
| user  | [`User`](SCHEMAS.md#user) | Yes      |                                             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

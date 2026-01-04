# Core API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Root-level authentication and user management endpoints

**Priority**: P0
**Milestones**: M0, M3-M8
**Endpoint Count**: 29

## Endpoints

### `GET /account-info`

**Description**: Get the account info provided by the provider

**Better Auth Method**: `auth.api.getAccountInfo`

**Success Response** (`200`):

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| user  | object | Yes      |             |
| data  | object | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /change-email`

**Description**: Change the email address of the user

**Better Auth Method**: `auth.api.changeEmail`

**Request Body**:

| Field       | Type   | Required | Description                                                |
|-------------|--------|----------|------------------------------------------------------------|
| newEmail    | string | Yes      | The new email address to set must be a valid email address |
| callbackURL | string | No       | The URL to redirect to after email verification            |

**Success Response** (`200`):

| Field   | Type                                                | Required | Description                                |
|---------|-----------------------------------------------------|----------|--------------------------------------------|
| user    | [`User`](SCHEMAS.md#user)                           | No       |                                            |
| status  | boolean                                             | Yes      | Indicates if the request was successful    |
| message | string (`Email updated`, `Verification email sent`) | No       | Status message of the email change process |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /change-password`

**Description**: Change the password of the user

**Better Auth Method**: `auth.api.changePassword`

**Request Body**:

| Field               | Type    | Required | Description                      |
|---------------------|---------|----------|----------------------------------|
| newPassword         | string  | Yes      | The new password to set          |
| currentPassword     | string  | Yes      | The current password is required |
| revokeOtherSessions | boolean | No       | Must be a boolean value          |

**Success Response** (`200`):

| Field | Type   | Required | Description                                      |
|-------|--------|----------|--------------------------------------------------|
| token | string | No       | New session token if other sessions were revoked |
| user  | object | Yes      |                                                  |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /delete-user`

**Description**: Delete the user

**Better Auth Method**: `auth.api.deleteUser`

**Request Body**:

| Field       | Type   | Required | Description                                               |
|-------------|--------|----------|-----------------------------------------------------------|
| callbackURL | string | No       | The callback URL to redirect to after the user is deleted |
| password    | string | No       | The user's password. Required if session is not fresh     |
| token       | string | No       | The deletion verification token                           |

**Success Response** (`200`):

| Field   | Type                                               | Required | Description                               |
|---------|----------------------------------------------------|----------|-------------------------------------------|
| success | boolean                                            | Yes      | Indicates if the operation was successful |
| message | string (`User deleted`, `Verification email sent`) | Yes      | Status message of the deletion process    |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /delete-user/callback`

**Description**: Callback to complete user deletion with verification token

**Better Auth Method**: Internal redirect handler (no direct API method)

**Flow Type**: Redirect-based (handles token verification via query params)

**Parameters**:

| Name        | Location | Type   | Required | Description |
|-------------|----------|--------|----------|-------------|
| token       | query    | string | No       |             |
| callbackURL | query    | string | No       |             |

**Success Response** (`200`):

| Field   | Type                    | Required | Description                              |
|---------|-------------------------|----------|------------------------------------------|
| success | boolean                 | Yes      | Indicates if the deletion was successful |
| message | string (`User deleted`) | Yes      | Confirmation message                     |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /device`

**Description**: Verify user code and get device authorization status

**Better Auth Method**: `auth.api.getDevice` (Device Code OAuth flow)

**Parameters**:

| Name      | Location | Type   | Required | Description |
|-----------|----------|--------|----------|-------------|
| user_code | query    | string | No       |             |

**Success Response** (`200`):

| Field     | Type                                     | Required | Description                                |
|-----------|------------------------------------------|----------|--------------------------------------------|
| user_code | string                                   | No       | The user code to verify                    |
| status    | string (`pending`, `approved`, `denied`) | No       | Current status of the device authorization |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /error`

**Description**: Displays an error page

**Better Auth Method**: Internal error handler (no direct API method)

**Flow Type**: Error display page

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /get-access-token`

**Description**: Get a valid access token, doing a refresh if needed

**Better Auth Method**: `auth.api.getAccessToken`

**Request Body**:

| Field      | Type   | Required | Description                                      |
|------------|--------|----------|--------------------------------------------------|
| providerId | string | Yes      | The provider ID for the OAuth provider           |
| accountId  | string | No       | The account ID associated with the refresh token |
| userId     | string | No       | The user ID associated with the account          |

**Success Response** (`200`):

| Field                 | Type               | Required | Description |
|-----------------------|--------------------|----------|-------------|
| tokenType             | string             | No       |             |
| idToken               | string             | No       |             |
| accessToken           | string             | No       |             |
| refreshToken          | string             | No       |             |
| accessTokenExpiresAt  | string (date-time) | No       |             |
| refreshTokenExpiresAt | string (date-time) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /get-session`

**Description**: Get the current session

**Better Auth Method**: `auth.api.getSession`

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | Yes      |             |
| user    | [`User`](SCHEMAS.md#user)       | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /is-username-available`

**Description**: Check if a username is available

**Better Auth Method**: `auth.api.isUsernameAvailable`

**Request Body**:

| Field    | Type   | Required | Description           |
|----------|--------|----------|-----------------------|
| username | string | Yes      | The username to check |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /jwks`

**Description**: Get the JSON Web Key Set

**Better Auth Method**: `auth.api.getJwks`

**Success Response** (`200`):

| Field | Type     | Required | Description                   |
|-------|----------|----------|-------------------------------|
| keys  | object[] | Yes      | Array of public JSON Web Keys |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /link-social`

**Description**: Link a social account to the user

**Better Auth Method**: `auth.api.linkSocial`

**Flow Type**: Redirect-based OAuth flow (unless `disableRedirect: true`)

**Request Body**:

| Field            | Type                    | Required | Description                                                                                 |
|------------------|-------------------------|----------|---------------------------------------------------------------------------------------------|
| callbackURL      | string                  | No       | The URL to redirect to after the user has signed in                                         |
| provider         | string                  | Yes      |                                                                                             |
| idToken          | object                  | No       |                                                                                             |
| requestSignUp    | boolean                 | No       |                                                                                             |
| scopes           | unknown[]               | No       | Additional scopes to request from the provider                                              |
| errorCallbackURL | string                  | No       | The URL to redirect to if there is an error during the link process                         |
| disableRedirect  | boolean                 | No       | Disable automatic redirection to the provider. Useful for handling the redirection yourself |
| additionalData   | Record<string, any>     | No       | Additional data to pass to the OAuth provider                                               |

**Success Response** (`200`):

| Field    | Type    | Required | Description                                                         |
|----------|---------|----------|---------------------------------------------------------------------|
| url      | string  | No       | The authorization URL to redirect the user to                       |
| redirect | boolean | Yes      | Indicates if the user should be redirected to the authorization URL |
| status   | boolean | No       |                                                                     |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /list-accounts`

**Description**: List all accounts linked to the user

**Better Auth Method**: `auth.api.listAccounts`

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /list-sessions`

**Description**: List all active sessions for the user

**Better Auth Method**: `auth.api.listSessions`

**Success Response** (`200`):

Success

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /ok`

**Description**: Check if the API is working

**Better Auth Method**: `auth.api.ok` (health check)

**Success Response** (`200`):

| Field | Type    | Required | Description                     |
|-------|---------|----------|---------------------------------|
| ok    | boolean | Yes      | Indicates if the API is working |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /one-time-token/generate`

**Description**: Generate a one-time authentication token

**Better Auth Method**: `auth.api.generateOneTimeToken`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /one-time-token/verify`

**Description**: Verify a one-time authentication token

**Better Auth Method**: `auth.api.verifyOneTimeToken`

**Request Body**:

| Field | Type   | Required | Description                           |
|-------|--------|----------|---------------------------------------|
| token | string | Yes      | The token to verify. Eg: "some-token" |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /refresh-token`

**Description**: Refresh the access token using a refresh token

**Better Auth Method**: `auth.api.refreshToken`

**Request Body**:

| Field      | Type   | Required | Description                                      |
|------------|--------|----------|--------------------------------------------------|
| providerId | string | Yes      | The provider ID for the OAuth provider           |
| accountId  | string | No       | The account ID associated with the refresh token |
| userId     | string | No       | The user ID associated with the account          |

**Success Response** (`200`):

| Field                 | Type               | Required | Description |
|-----------------------|--------------------|----------|-------------|
| tokenType             | string             | No       |             |
| idToken               | string             | No       |             |
| accessToken           | string             | No       |             |
| refreshToken          | string             | No       |             |
| accessTokenExpiresAt  | string (date-time) | No       |             |
| refreshTokenExpiresAt | string (date-time) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /request-password-reset`

**Description**: Send a password reset email to the user

**Better Auth Method**: `auth.api.forgetPassword`

**Flow Type**: Email-based flow (sends reset link)

**Request Body**:

| Field      | Type   | Required | Description                                                                                                                                                                                                                                         |
|------------|--------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| email      | string | Yes      | The email address of the user to send a password reset email to                                                                                                                                                                                     |
| redirectTo | string | No       | The URL to redirect the user to reset their password. If the token isn't valid or expired, it'll be redirected with a query parameter `?error=INVALID_TOKEN`. If the token is valid, it'll be redirected with a query parameter `?token=VALID_TOKEN |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| status  | boolean | No       |             |
| message | string  | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /reset-password`

**Description**: Reset the password for a user

**Better Auth Method**: `auth.api.resetPassword`

**Request Body**:

| Field       | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| newPassword | string | Yes      | The new password to set         |
| token       | string | No       | The token to reset the password |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /reset-password/{token}`

**Description**: Redirects the user to the callback URL with the token

**Better Auth Method**: Internal redirect handler (no direct API method)

**Flow Type**: Redirect-based (forwards token to callbackURL)

**Parameters**:

| Name        | Location | Type   | Required | Description                                          |
|-------------|----------|--------|----------|------------------------------------------------------|
| token       | path     | string | Yes      | The token to reset the password                      |
| callbackURL | query    | string | Yes      | The URL to redirect the user to reset their password |

**Success Response** (`200`):

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| token | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /revoke-other-sessions`

**Description**: Revoke all other sessions for the user except the current one

**Better Auth Method**: `auth.api.revokeOtherSessions`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|

**Success Response** (`200`):

| Field  | Type    | Required | Description                                               |
|--------|---------|----------|-----------------------------------------------------------|
| status | boolean | Yes      | Indicates if all other sessions were revoked successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /revoke-session`

**Description**: Revoke a single session

**Better Auth Method**: `auth.api.revokeSession`

**Request Body**:

| Field | Type   | Required | Description         |
|-------|--------|----------|---------------------|
| token | string | Yes      | The token to revoke |

**Success Response** (`200`):

| Field  | Type    | Required | Description                                       |
|--------|---------|----------|---------------------------------------------------|
| status | boolean | Yes      | Indicates if the session was revoked successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /revoke-sessions`

**Description**: Revoke all sessions for the user

**Better Auth Method**: `auth.api.revokeSessions`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|

**Success Response** (`200`):

| Field  | Type    | Required | Description                                         |
|--------|---------|----------|-----------------------------------------------------|
| status | boolean | Yes      | Indicates if all sessions were revoked successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /send-verification-email`

**Description**: Send a verification email to the user

**Better Auth Method**: `auth.api.sendVerificationEmail`

**Flow Type**: Email-based flow (sends verification link)

**Request Body**:

| Field       | Type   | Required | Description                                    |
|-------------|--------|----------|------------------------------------------------|
| email       | string | Yes      | The email to send the verification email to    |
| callbackURL | string | No       | The URL to use for email verification callback |

**Success Response** (`200`):

| Field  | Type    | Required | Description                                  |
|--------|---------|----------|----------------------------------------------|
| status | boolean | No       | Indicates if the email was sent successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /sign-out`

**Description**: Sign out the current user

**Better Auth Method**: `auth.api.signOut`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /unlink-account`

**Description**: Unlink an account

**Better Auth Method**: `auth.api.unlinkAccount`

**Request Body**:

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| providerId | string | Yes      |             |
| accountId  | string | No       |             |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /update-user`

**Description**: Update the current user

**Better Auth Method**: `auth.api.updateUser`

**Request Body**:

| Field | Type   | Required | Description           |
|-------|--------|----------|-----------------------|
| name  | string | No       | The name of the user  |
| image | string | No       | The image of the user |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /verify-email`

**Description**: Verify the email of the user

**Better Auth Method**: `auth.api.verifyEmail`

**Flow Type**: Token-based verification (via query params)

**Parameters**:

| Name        | Location | Type   | Required | Description                                     |
|-------------|----------|--------|----------|-------------------------------------------------|
| token       | query    | string | Yes      | The token to verify the email                   |
| callbackURL | query    | string | No       | The URL to redirect to after email verification |

**Success Response** (`200`):

| Field  | Type                      | Required | Description                                      |
|--------|---------------------------|----------|--------------------------------------------------|
| user   | [`User`](SCHEMAS.md#user) | Yes      |                                                  |
| status | boolean                   | Yes      | Indicates if the email was verified successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

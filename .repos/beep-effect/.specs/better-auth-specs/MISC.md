# Miscellaneous API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Additional provider and utility endpoints

**Priority**: P3
**Milestones**: M15
**Endpoint Count**: 7

## Endpoints

### `GET /.well-known/openid-configuration`

**Description**: OpenID Connect discovery endpoint

**Better Auth Method**: `openidConfiguration`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /oauth-proxy-callback`

**Description**: OAuth Proxy Callback

**Better Auth Method**: `oauthProxyCallback`

**Parameters**:

| Name        | Location | Type    | Required | Description                            |
|-------------|----------|---------|----------|----------------------------------------|
| callbackURL | query    | unknown | Yes      | The URL to redirect to after the proxy |
| cookies     | query    | unknown | Yes      | The cookies to set after the proxy     |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /one-tap/callback`

**Description**: Use this endpoint to authenticate with Google One Tap

**Better Auth Method**: `oneTapCallback`

**Request Body**:

| Field   | Type   | Required | Description                                                    |
|---------|--------|----------|----------------------------------------------------------------|
| idToken | string | Yes      | Google ID token, which the client obtains from the One Tap API |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | No       |             |
| user    | [`User`](SCHEMAS.md#user)       | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /siwe/nonce`

**Description**: Generate nonce for Sign-In with Ethereum

**Better Auth Method**: `siweNonce`

**Request Body**:

| Field         | Type   | Required | Description |
|---------------|--------|----------|-------------|
| walletAddress | string | Yes      |             |
| chainId       | string | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /siwe/verify`

**Description**: Verify Sign-In with Ethereum signature

**Better Auth Method**: `siweVerify`

**Request Body**:

| Field         | Type   | Required | Description |
|---------------|--------|----------|-------------|
| message       | string | Yes      |             |
| signature     | string | Yes      |             |
| walletAddress | string | Yes      |             |
| chainId       | string | Yes      |             |
| email         | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /stripe/webhook`

**Description**: Stripe webhook handler

**Better Auth Method**: `stripeWebhook`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /token`

**Description**: Get a JWT token

**Better Auth Method**: `getToken`

**Success Response** (`200`):

| Field | Type   | Required | Description |
|-------|--------|----------|-------------|
| token | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

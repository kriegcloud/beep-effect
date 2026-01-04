# Passkey API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: WebAuthn passkey authentication

**Priority**: P2
**Milestones**: M12
**Endpoint Count**: 7

## Endpoints

### `POST /passkey/delete-passkey`

**Description**: Delete a specific passkey

**Better Auth Method**: `passkeyDeleteCredential`

**Request Body**:

| Field | Type   | Required | Description                                            |
|-------|--------|----------|--------------------------------------------------------|
| id    | string | Yes      | The ID of the passkey to delete. Eg: "some-passkey-id" |

**Success Response** (`200`):

| Field  | Type    | Required | Description                                   |
|--------|---------|----------|-----------------------------------------------|
| status | boolean | Yes      | Indicates whether the deletion was successful |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /passkey/generate-authenticate-options`

**Description**: Generate authentication options for a passkey

**Better Auth Method**: `passkeyGenerateAuthenticateOptions`

**Success Response** (`200`):

| Field                  | Type     | Required | Description |
|------------------------|----------|----------|-------------|
| challenge              | string   | No       |             |
| rp                     | object   | No       |             |
| user                   | object   | No       |             |
| timeout                | number   | No       |             |
| allowCredentials       | object[] | No       |             |
| userVerification       | string   | No       |             |
| authenticatorSelection | object   | No       |             |
| extensions             | object   | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /passkey/generate-register-options`

**Description**: Generate registration options for a new passkey

**Better Auth Method**: `passkeyGenerateRegisterOptions`

**Success Response** (`200`):

| Field                  | Type     | Required | Description |
|------------------------|----------|----------|-------------|
| challenge              | string   | No       |             |
| rp                     | object   | No       |             |
| user                   | object   | No       |             |
| pubKeyCredParams       | object[] | No       |             |
| timeout                | number   | No       |             |
| excludeCredentials     | object[] | No       |             |
| authenticatorSelection | object   | No       |             |
| attestation            | string   | No       |             |
| extensions             | object   | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /passkey/list-user-passkeys`

**Description**: List all passkeys for the authenticated user

**Better Auth Method**: `passkeyListCredentials`

**Success Response** (`200`):

Passkeys retrieved successfully

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /passkey/update-passkey`

**Description**: Update a specific passkey's name

**Better Auth Method**: `passkeyGetCredential`

**Request Body**:

| Field | Type   | Required | Description                                                                  |
|-------|--------|----------|------------------------------------------------------------------------------|
| id    | string | Yes      | The ID of the passkey which will be updated. Eg: "passkey-id"                |
| name  | string | Yes      | The new name which the passkey will be updated to. Eg: "my-new-passkey-name" |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| passkey | [`Passkey`](SCHEMAS.md#passkey) | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /passkey/verify-authentication`

**Description**: Verify authentication of a passkey

**Better Auth Method**: `passkeyVerifyAuthentication`

**Request Body**:

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| response | string | Yes      |             |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | No       |             |
| user    | [`User`](SCHEMAS.md#user)       | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /passkey/verify-registration`

**Description**: Verify registration of a new passkey

**Better Auth Method**: `passkeyVerifyRegistration`

**Request Body**:

| Field    | Type   | Required | Description         |
|----------|--------|----------|---------------------|
| response | string | Yes      |                     |
| name     | string | No       | Name of the passkey |

**Success Response** (`200`):

See [`Passkey`](SCHEMAS.md#passkey)

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

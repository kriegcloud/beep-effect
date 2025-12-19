# Device API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Device code flow for OAuth

**Priority**: P3
**Milestones**: M15
**Endpoint Count**: 4

## Endpoints

### `POST /device/approve`

**Description**: Approve device authorization

**Better Auth Method**: `deviceApprove`

**Request Body**:

| Field    | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| userCode | string | Yes      | The user code to approve |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /device/code`

**Description**: Request a device and user code

**Better Auth Method**: `deviceAuthorization`

Follow [rfc8628#section-3.2](https://datatracker.ietf.org/doc/html/rfc8628#section-3.2)

**Request Body**:

| Field     | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| client_id | string | Yes      | The client ID of the application |
| scope     | string | No       | Space-separated list of scopes   |

**Success Response** (`200`):

| Field                     | Type         | Required | Description                                                           |
|---------------------------|--------------|----------|-----------------------------------------------------------------------|
| device_code               | string       | No       | The device verification code                                          |
| user_code                 | string       | No       | The user code to display                                              |
| verification_uri          | string (uri) | No       | The URL for user verification. Defaults to /device if not configured. |
| verification_uri_complete | string (uri) | No       | The complete URL with user code as query parameter.                   |
| expires_in                | number       | No       | Lifetime in seconds of the device code                                |
| interval                  | number       | No       | Minimum polling interval in seconds                                   |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /device/deny`

**Description**: Deny device authorization

**Better Auth Method**: `deviceDeny`

**Request Body**:

| Field    | Type   | Required | Description           |
|----------|--------|----------|-----------------------|
| userCode | string | Yes      | The user code to deny |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /device/token`

**Description**: Exchange device code for access token

**Better Auth Method**: `deviceToken`

Follow [rfc8628#section-3.4](https://datatracker.ietf.org/doc/html/rfc8628#section-3.4)

**Request Body**:

| Field       | Type   | Required | Description                      |
|-------------|--------|----------|----------------------------------|
| grant_type  | string | Yes      | The grant type for device flow   |
| device_code | string | Yes      | The device verification code     |
| client_id   | string | Yes      | The client ID of the application |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | No       |             |
| user    | [`User`](SCHEMAS.md#user)       | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

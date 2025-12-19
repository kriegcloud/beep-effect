# Multi-Session API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Multi-device session management

**Priority**: P2
**Milestones**: M15
**Endpoint Count**: 3

## Endpoints

### `GET /multi-session/list-device-sessions`

**Description**: List all device sessions for the authenticated user

**Better Auth Method**: `multiSessionListDeviceSessions`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /multi-session/revoke`

**Description**: Revoke a device session

**Better Auth Method**: `multiSessionRevokeDeviceSession`

**Request Body**:

| Field        | Type   | Required | Description                 |
|--------------|--------|----------|-----------------------------|
| sessionToken | string | Yes      | The session token to revoke |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /multi-session/set-active`

**Description**: Set the active session

**Better Auth Method**: `multiSessionSetActiveSession`

**Request Body**:

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| sessionToken | string | Yes      | The session token to set as active |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

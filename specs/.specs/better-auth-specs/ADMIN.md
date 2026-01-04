# Admin API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Administrative user management endpoints

**Priority**: P2
**Milestones**: M9
**Endpoint Count**: 15

## Endpoints

### `POST /admin/ban-user`

**Description**: Ban a user

**Better Auth Method**: `auth.api.banUser`

**Request Body**:

| Field        | Type   | Required | Description                                 |
|--------------|--------|----------|---------------------------------------------|
| userId       | string | Yes      | The user id                                 |
| banReason    | string | No       | The reason for the ban                      |
| banExpiresIn | number | No       | The number of seconds until the ban expires |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/create-user`

**Description**: Create a new user

**Better Auth Method**: `auth.api.createUser`

**Request Body**:

| Field    | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| email    | string | Yes      | The email of the user    |
| password | string | Yes      | The password of the user |
| name     | string | Yes      | The name of the user     |
| role     | string | No       |                          |
| data     | string | No       |                          |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /admin/get-user`

**Description**: Get an existing user

**Better Auth Method**: `auth.api.getUser`

**Parameters**:

| Name | Location | Type   | Required | Description |
|------|----------|--------|----------|-------------|
| id   | query    | string | No       |             |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/has-permission`

**Description**: Check if the user has permission

**Better Auth Method**: `auth.api.hasPermission`

**Request Body**:

| Field       | Type   | Required | Description             |
|-------------|--------|----------|-------------------------|
| permission  | object | No       | The permission to check |
| permissions | object | Yes      | The permission to check |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| error   | string  | No       |             |
| success | boolean | Yes      |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/impersonate-user`

**Description**: Impersonate a user

**Better Auth Method**: `auth.api.impersonateUser`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| userId | string | Yes      | The user id |

**Success Response** (`200`):

| Field   | Type                            | Required | Description |
|---------|---------------------------------|----------|-------------|
| session | [`Session`](SCHEMAS.md#session) | No       |             |
| user    | [`User`](SCHEMAS.md#user)       | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/list-user-sessions`

**Description**: List user sessions

**Better Auth Method**: `auth.api.listUserSessions`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| userId | string | Yes      | The user id |

**Success Response** (`200`):

| Field    | Type                              | Required | Description |
|----------|-----------------------------------|----------|-------------|
| sessions | [`Session`](SCHEMAS.md#session)[] | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /admin/list-users`

**Description**: List users

**Better Auth Method**: `auth.api.listUsers`

**Parameters**:

| Name           | Location | Type   | Required | Description |
|----------------|----------|--------|----------|-------------|
| searchValue    | query    | string | No       |             |
| searchField    | query    | string | No       |             |
| searchOperator | query    | string | No       |             |
| limit          | query    | string | No       |             |
| offset         | query    | string | No       |             |
| sortBy         | query    | string | No       |             |
| sortDirection  | query    | string | No       |             |
| filterField    | query    | string | No       |             |
| filterValue    | query    | string | No       |             |
| filterOperator | query    | string | No       |             |

**Success Response** (`200`):

| Field  | Type                        | Required | Description |
|--------|-----------------------------|----------|-------------|
| users  | [`User`](SCHEMAS.md#user)[] | Yes      |             |
| total  | number                      | Yes      |             |
| limit  | number                      | No       |             |
| offset | number                      | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/remove-user`

**Description**: Delete a user and all their sessions and accounts. Cannot be undone.

**Better Auth Method**: `auth.api.removeUser`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| userId | string | Yes      | The user id |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/revoke-user-session`

**Description**: Revoke a user session

**Better Auth Method**: `auth.api.revokeUserSession`

**Request Body**:

| Field        | Type   | Required | Description       |
|--------------|--------|----------|-------------------|
| sessionToken | string | Yes      | The session token |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/revoke-user-sessions`

**Description**: Revoke all user sessions

**Better Auth Method**: `auth.api.revokeUserSessions`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| userId | string | Yes      | The user id |

**Success Response** (`200`):

| Field   | Type    | Required | Description |
|---------|---------|----------|-------------|
| success | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/set-role`

**Description**: Set the role of a user

**Better Auth Method**: `auth.api.setRole`

**Request Body**:

| Field  | Type   | Required | Description                                                                                  |
|--------|--------|----------|----------------------------------------------------------------------------------------------|
| userId | string | Yes      | The user id                                                                                  |
| role   | string | Yes      | The role to set, this can be a string or an array of strings. Eg: `admin` or `[admin, user]` |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/set-user-password`

**Description**: Set a user's password

**Better Auth Method**: `auth.api.setUserPassword`

**Request Body**:

| Field       | Type   | Required | Description      |
|-------------|--------|----------|------------------|
| newPassword | string | Yes      | The new password |
| userId      | string | Yes      | The user id      |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/stop-impersonating`

**Description**: Stop impersonating a user

**Better Auth Method**: `auth.api.stopImpersonating`

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/unban-user`

**Description**: Unban a user

**Better Auth Method**: `auth.api.unbanUser`

**Request Body**:

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| userId | string | Yes      | The user id |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /admin/update-user`

**Description**: Update a user's details

**Better Auth Method**: `auth.api.updateUser`

**Request Body**:

| Field  | Type   | Required | Description             |
|--------|--------|----------|-------------------------|
| userId | string | Yes      | The user id             |
| data   | string | Yes      | The user data to update |

**Success Response** (`200`):

| Field | Type                      | Required | Description |
|-------|---------------------------|----------|-------------|
| user  | [`User`](SCHEMAS.md#user) | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

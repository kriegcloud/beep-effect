# API Key API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: API key management

**Priority**: P2
**Milestones**: M15
**Endpoint Count**: 5

## Endpoints

### `POST /api-key/create`

**Description**: Create a new API key for a user

**Better Auth Method**: `apiKeyCreate`

**Request Body**:

| Field               | Type    | Required | Description                                                                                                                                                                                                                         |
|---------------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                | string  | No       | Name of the Api Key                                                                                                                                                                                                                 |
| expiresIn           | string  | Yes      |                                                                                                                                                                                                                                     |
| userId              | string  | No       | User Id of the user that the Api Key belongs to. server-only. Eg: "user-id"                                                                                                                                                         |
| prefix              | string  | No       |                                                                                                                                                                                                                                     |
| remaining           | string  | Yes      |                                                                                                                                                                                                                                     |
| metadata            | string  | No       |                                                                                                                                                                                                                                     |
| refillAmount        | number  | No       |                                                                                                                                                                                                                                     |
| refillInterval      | number  | No       | Interval to refill the Api Key in milliseconds. server-only. Eg: 1000                                                                                                                                                               |
| rateLimitTimeWindow | number  | No       | The duration in milliseconds where each request is counted. Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset. server-only. Eg: 1000 |
| rateLimitMax        | number  | No       | Maximum amount of requests allowed within a window. Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset. server-only. Eg: 100          |
| rateLimitEnabled    | boolean | No       | Whether the key has rate limiting enabled. server-only. Eg: true                                                                                                                                                                    |
| permissions         | string  | No       | Permissions of the Api Key.                                                                                                                                                                                                         |

**Success Response** (`200`):

| Field               | Type                  | Required | Description                                    |
|---------------------|-----------------------|----------|------------------------------------------------|
| id                  | string                | Yes      | Unique identifier of the API key               |
| createdAt           | string (date-time)    | Yes      | Creation timestamp                             |
| updatedAt           | string (date-time)    | Yes      | Last update timestamp                          |
| name                | string                | No       | Name of the API key                            |
| prefix              | string                | No       | Prefix of the API key                          |
| start               | string                | No       | Starting characters of the key (if configured) |
| key                 | string                | Yes      | The full API key (only returned on creation)   |
| enabled             | boolean               | Yes      | Whether the key is enabled                     |
| expiresAt           | string (date-time)    | No       | Expiration timestamp                           |
| userId              | string                | Yes      | ID of the user owning the key                  |
| lastRefillAt        | string (date-time)    | No       | Last refill timestamp                          |
| lastRequest         | string (date-time)    | No       | Last request timestamp                         |
| metadata            | object                | No       | Metadata associated with the key               |
| rateLimitMax        | number                | No       | Maximum requests in time window                |
| rateLimitTimeWindow | number                | No       | Rate limit time window in milliseconds         |
| remaining           | number                | No       | Remaining requests                             |
| refillAmount        | number                | No       | Amount to refill                               |
| refillInterval      | number                | No       | Refill interval in milliseconds                |
| rateLimitEnabled    | boolean               | Yes      | Whether rate limiting is enabled               |
| requestCount        | number                | Yes      | Current request count in window                |
| permissions         | object (map of array) | No       | Permissions associated with the key            |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /api-key/delete`

**Description**: Delete an existing API key

**Better Auth Method**: `apiKeyDelete`

**Request Body**:

| Field | Type   | Required | Description                     |
|-------|--------|----------|---------------------------------|
| keyId | string | Yes      | The id of the API key to delete |

**Success Response** (`200`):

| Field   | Type    | Required | Description                                       |
|---------|---------|----------|---------------------------------------------------|
| success | boolean | Yes      | Indicates if the API key was successfully deleted |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /api-key/get`

**Description**: Retrieve an existing API key by ID

**Better Auth Method**: `apiKeyGet`

**Parameters**:

| Name | Location | Type   | Required | Description |
|------|----------|--------|----------|-------------|
| id   | query    | string | No       |             |

**Success Response** (`200`):

| Field               | Type               | Required | Description                                                                                                                                                                      |
|---------------------|--------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                  | string             | Yes      | ID                                                                                                                                                                               |
| name                | string             | No       | The name of the key                                                                                                                                                              |
| start               | string             | No       | Shows the first few characters of the API key, including the prefix. This allows you to show those few characters in the UI to make it easier for users to identify the API key. |
| prefix              | string             | No       | The API Key prefix. Stored as plain text.                                                                                                                                        |
| userId              | string             | Yes      | The owner of the user id                                                                                                                                                         |
| refillInterval      | number             | No       | The interval in milliseconds between refills of the `remaining` count. Example: 3600000 // refill every hour (3600000ms = 1h)                                                    |
| refillAmount        | number             | No       | The amount to refill                                                                                                                                                             |
| lastRefillAt        | string (date-time) | No       | The last refill date                                                                                                                                                             |
| enabled             | boolean            | Yes      | Sets if key is enabled or disabled (default: `True`)                                                                                                                             |
| rateLimitEnabled    | boolean            | Yes      | Whether the key has rate limiting enabled                                                                                                                                        |
| rateLimitTimeWindow | number             | No       | The duration in milliseconds                                                                                                                                                     |
| rateLimitMax        | number             | No       | Maximum amount of requests allowed within a window                                                                                                                               |
| requestCount        | number             | Yes      | The number of requests made within the rate limit time window                                                                                                                    |
| remaining           | number             | No       | Remaining requests (every time api key is used this should updated and should be updated on refill as well)                                                                      |
| lastRequest         | string (date-time) | No       | When last request occurred                                                                                                                                                       |
| expiresAt           | string (date-time) | No       | Expiry date of a key                                                                                                                                                             |
| createdAt           | string (date-time) | Yes      | created at                                                                                                                                                                       |
| updatedAt           | string (date-time) | Yes      | updated at                                                                                                                                                                       |
| metadata            | object             | No       | Extra metadata about the apiKey                                                                                                                                                  |
| permissions         | string             | No       | Permissions for the api key (stored as JSON string)                                                                                                                              |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `GET /api-key/list`

**Description**: List all API keys for the authenticated user

**Better Auth Method**: `apiKeyList`

**Success Response** (`200`):

API keys retrieved successfully

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /api-key/update`

**Description**: Update an existing API key by ID

**Better Auth Method**: `apiKeyUpdate`

**Request Body**:

| Field               | Type    | Required | Description                                                                                                                                                                                                                |
|---------------------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| keyId               | string  | Yes      | The id of the Api Key                                                                                                                                                                                                      |
| userId              | string  | No       | The id of the user which the api key belongs to. server-only. Eg: "some-user-id"                                                                                                                                           |
| name                | string  | No       | The name of the key                                                                                                                                                                                                        |
| enabled             | boolean | No       | Whether the Api Key is enabled or not                                                                                                                                                                                      |
| remaining           | number  | No       |                                                                                                                                                                                                                            |
| refillAmount        | number  | No       | The refill amount                                                                                                                                                                                                          |
| refillInterval      | number  | No       | The refill interval                                                                                                                                                                                                        |
| metadata            | string  | No       |                                                                                                                                                                                                                            |
| expiresIn           | string  | Yes      |                                                                                                                                                                                                                            |
| rateLimitEnabled    | boolean | No       | Whether the key has rate limiting enabled.                                                                                                                                                                                 |
| rateLimitTimeWindow | number  | No       | The duration in milliseconds where each request is counted. server-only. Eg: 1000                                                                                                                                          |
| rateLimitMax        | number  | No       | Maximum amount of requests allowed within a window. Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset. server-only. Eg: 100 |
| permissions         | string  | Yes      |                                                                                                                                                                                                                            |

**Success Response** (`200`):

| Field               | Type               | Required | Description                                                                                                                                                                      |
|---------------------|--------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                  | string             | Yes      | ID                                                                                                                                                                               |
| name                | string             | No       | The name of the key                                                                                                                                                              |
| start               | string             | No       | Shows the first few characters of the API key, including the prefix. This allows you to show those few characters in the UI to make it easier for users to identify the API key. |
| prefix              | string             | No       | The API Key prefix. Stored as plain text.                                                                                                                                        |
| userId              | string             | Yes      | The owner of the user id                                                                                                                                                         |
| refillInterval      | number             | No       | The interval in milliseconds between refills of the `remaining` count. Example: 3600000 // refill every hour (3600000ms = 1h)                                                    |
| refillAmount        | number             | No       | The amount to refill                                                                                                                                                             |
| lastRefillAt        | string (date-time) | No       | The last refill date                                                                                                                                                             |
| enabled             | boolean            | Yes      | Sets if key is enabled or disabled (default: `True`)                                                                                                                             |
| rateLimitEnabled    | boolean            | Yes      | Whether the key has rate limiting enabled                                                                                                                                        |
| rateLimitTimeWindow | number             | No       | The duration in milliseconds                                                                                                                                                     |
| rateLimitMax        | number             | No       | Maximum amount of requests allowed within a window                                                                                                                               |
| requestCount        | number             | Yes      | The number of requests made within the rate limit time window                                                                                                                    |
| remaining           | number             | No       | Remaining requests (every time api key is used this should updated and should be updated on refill as well)                                                                      |
| lastRequest         | string (date-time) | No       | When last request occurred                                                                                                                                                       |
| expiresAt           | string (date-time) | No       | Expiry date of a key                                                                                                                                                             |
| createdAt           | string (date-time) | Yes      | created at                                                                                                                                                                       |
| updatedAt           | string (date-time) | Yes      | updated at                                                                                                                                                                       |
| metadata            | object             | No       | Extra metadata about the apiKey                                                                                                                                                  |
| permissions         | string             | No       | Permissions for the api key (stored as JSON string)                                                                                                                              |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

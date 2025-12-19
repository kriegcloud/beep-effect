# Common Error Responses

> Source: `nextjs-better-auth-api-spec.json`

This document describes standard HTTP error responses used across all Better Auth endpoints.

## Standard Error Schema

All error responses follow this structure:

```json
{
  "message": "string"
}
```

| Field   | Type   | Required | Description                      |
|---------|--------|----------|----------------------------------|
| message | string | Yes      | Human-readable error description |

## Error Status Codes

### `400 Bad Request`

**Description**: Bad Request. Usually due to missing parameters, or invalid parameters.

**Response Body**:

| Field   | Type   | Required | Description                              |
|---------|--------|----------|------------------------------------------|
| message | string | Yes      | Error message describing what went wrong |

**Example**:
```json
{
  "message": "Invalid email format"
}
```

---

### `401 Unauthorized`

**Description**: Unauthorized. Due to missing or invalid authentication.

**Response Body**:

| Field   | Type   | Required | Description                                     |
|---------|--------|----------|-------------------------------------------------|
| message | string | Yes      | Error message describing authentication failure |

**Example**:
```json
{
  "message": "Session expired or invalid"
}
```

---

### `403 Forbidden`

**Description**: Forbidden. The authenticated user does not have permission to perform this action.

**Response Body**:

| Field   | Type   | Required | Description                                |
|---------|--------|----------|--------------------------------------------|
| message | string | Yes      | Error message describing permission denial |

**Example**:
```json
{
  "message": "Insufficient permissions"
}
```

---

### `404 Not Found`

**Description**: Not Found. The requested resource does not exist.

**Response Body**:

| Field   | Type   | Required | Description                                 |
|---------|--------|----------|---------------------------------------------|
| message | string | Yes      | Error message describing what was not found |

**Example**:
```json
{
  "message": "User not found"
}
```

---

### `429 Too Many Requests`

**Description**: Too Many Requests. Rate limit exceeded.

**Response Body**:

| Field   | Type   | Required | Description                         |
|---------|--------|----------|-------------------------------------|
| message | string | Yes      | Error message describing rate limit |

**Example**:
```json
{
  "message": "Too many requests, please try again later"
}
```

---

### `500 Internal Server Error`

**Description**: Internal Server Error. An unexpected error occurred on the server.

**Response Body**:

| Field   | Type   | Required | Description                           |
|---------|--------|----------|---------------------------------------|
| message | string | Yes      | Error message describing server error |

**Example**:
```json
{
  "message": "An internal error occurred"
}
```

---

## Usage in Endpoint Documentation

Endpoint documents reference this file instead of repeating error definitions. For example:

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md) - All standard HTTP errors apply.

Specific endpoints may document additional error cases beyond these standard responses.

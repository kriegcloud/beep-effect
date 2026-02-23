# Sign Up API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: User registration endpoints

**Priority**: P0
**Milestones**: M2
**Endpoint Count**: 1

## Endpoints

### `POST /sign-up/email`

**Description**: Sign up a user using email and password

**Request Body**:

| Field       | Type    | Required | Description                                                              |
|-------------|---------|----------|--------------------------------------------------------------------------|
| name        | string  | Yes      | The name of the user                                                     |
| email       | string  | Yes      | The email of the user                                                    |
| password    | string  | Yes      | The password of the user                                                 |
| image       | string  | No       | The profile image URL of the user                                        |
| callbackURL | string  | No       | The URL to use for email verification callback                           |
| rememberMe  | boolean | No       | If this is false, the session will not be remembered. Default is `true`. |

**Success Response** (`200`):

| Field | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| token | string | No       | Authentication token for the session |
| user  | object | Yes      |                                      |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

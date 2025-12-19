# Phone Number API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: Phone number authentication

**Priority**: P2
**Milestones**: M15
**Endpoint Count**: 4

## Endpoints

### `POST /phone-number/request-password-reset`

**Description**: Request OTP for password reset via phone number

**Better Auth Method**: `phoneNumberRequestPasswordReset`

**Request Body**:

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| phoneNumber | string | Yes      |             |

**Success Response** (`200`):

| Field  | Type             | Required | Description                                |
|--------|------------------|----------|--------------------------------------------|
| status | boolean (`True`) | Yes      | Indicates if the OTP was sent successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /phone-number/reset-password`

**Description**: Reset password using phone number OTP

**Better Auth Method**: `phoneNumberResetPassword`

**Request Body**:

| Field       | Type   | Required | Description                                                                                |
|-------------|--------|----------|--------------------------------------------------------------------------------------------|
| otp         | string | Yes      | The one time password to reset the password. Eg: "123456"                                  |
| phoneNumber | string | Yes      | The phone number to the account which intends to reset the password for. Eg: "+1234567890" |
| newPassword | string | Yes      | The new password. Eg: "new-and-secure-password"                                            |

**Success Response** (`200`):

| Field  | Type             | Required | Description                                      |
|--------|------------------|----------|--------------------------------------------------|
| status | boolean (`True`) | Yes      | Indicates if the password was reset successfully |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /phone-number/send-otp`

**Description**: Use this endpoint to send OTP to phone number

**Better Auth Method**: `phoneNumberSendOtp`

**Request Body**:

| Field       | Type   | Required | Description                                 |
|-------------|--------|----------|---------------------------------------------|
| phoneNumber | string | Yes      | Phone number to send OTP. Eg: "+1234567890" |

**Success Response** (`200`):

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| message | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /phone-number/verify`

**Description**: Use this endpoint to verify phone number

**Better Auth Method**: `phoneNumberVerify`

**Request Body**:

| Field             | Type    | Required | Description                                                       |
|-------------------|---------|----------|-------------------------------------------------------------------|
| phoneNumber       | string  | Yes      | Phone number to verify. Eg: "+1234567890"                         |
| code              | string  | Yes      | OTP code. Eg: "123456"                                            |
| disableSession    | boolean | No       | Disable session creation after verification. Eg: false            |
| updatePhoneNumber | boolean | No       | Check if there is a session and update the phone number. Eg: true |

**Success Response** (`200`):

| Field  | Type             | Required | Description                                                                                  |
|--------|------------------|----------|----------------------------------------------------------------------------------------------|
| status | boolean (`True`) | Yes      | Indicates if the verification was successful                                                 |
| token  | string           | No       | Session token if session is created, null if disableSession is true or no session is created |
| user   | object           | No       | User object with phone number details, null if no user is created or found                   |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

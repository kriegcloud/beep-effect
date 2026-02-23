# Two-Factor Authentication API Specifications

> Source: `nextjs-better-auth-api-spec.json`
> Schemas: See [SCHEMAS.md](./SCHEMAS.md)
> Errors: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

**Description**: 2FA/MFA authentication endpoints

**Priority**: P1
**Milestones**: M11
**Endpoint Count**: 8

## Endpoints

### `POST /two-factor/disable`

**Description**: Use this endpoint to disable two factor authentication.

**Better Auth Method**: `twoFactorDisable`

**Request Body**:

| Field    | Type   | Required | Description   |
|----------|--------|----------|---------------|
| password | string | Yes      | User password |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/enable`

**Description**: Use this endpoint to enable two factor authentication. This will generate a TOTP URI and backup codes. Once the user verifies the TOTP URI, the two factor authentication will be enabled.

**Better Auth Method**: `twoFactorEnable`

**Request Body**:

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| password | string | Yes      | User password                  |
| issuer   | string | No       | Custom issuer for the TOTP URI |

**Success Response** (`200`):

| Field       | Type     | Required | Description  |
|-------------|----------|----------|--------------|
| totpURI     | string   | No       | TOTP URI     |
| backupCodes | string[] | No       | Backup codes |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/generate-backup-codes`

**Description**: Generate new backup codes for two-factor authentication

**Better Auth Method**: `twoFactorGenerateBackupCodes`

**Request Body**:

| Field    | Type   | Required | Description         |
|----------|--------|----------|---------------------|
| password | string | Yes      | The users password. |

**Success Response** (`200`):

| Field       | Type             | Required | Description                                               |
|-------------|------------------|----------|-----------------------------------------------------------|
| status      | boolean (`True`) | Yes      | Indicates if the backup codes were generated successfully |
| backupCodes | string[]         | Yes      | Array of generated backup codes in plain text             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/get-totp-uri`

**Description**: Use this endpoint to get the TOTP URI

**Better Auth Method**: `twoFactorGenerateTotpUri`

**Request Body**:

| Field    | Type   | Required | Description   |
|----------|--------|----------|---------------|
| password | string | Yes      | User password |

**Success Response** (`200`):

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| totpURI | string | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/send-otp`

**Description**: Send two factor OTP to the user

**Better Auth Method**: `twoFactorSendOtp`

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/verify-backup-code`

**Description**: Verify a backup code for two-factor authentication

**Better Auth Method**: `twoFactorVerify`

**Request Body**:

| Field          | Type    | Required | Description                                                                                                             |
|----------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------|
| code           | string  | Yes      | A backup code to verify. Eg: "123456"                                                                                   |
| disableSession | boolean | No       | If true, the session cookie will not be set.                                                                            |
| trustDevice    | boolean | No       | If true, the device will be trusted for 30 days. It'll be refreshed on every sign in request within this time. Eg: true |

**Success Response** (`200`):

| Field   | Type   | Required | Description                                                        |
|---------|--------|----------|--------------------------------------------------------------------|
| user    | object | Yes      | The authenticated user object with two-factor details              |
| session | object | Yes      | The current session object, included unless disableSession is true |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/verify-otp`

**Description**: Verify two factor OTP

**Better Auth Method**: `twoFactorVerify`

**Request Body**:

| Field       | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| code        | string  | Yes      | The otp code to verify. Eg: "012345" |
| trustDevice | boolean | No       |                                      |

**Success Response** (`200`):

| Field | Type   | Required | Description                                 |
|-------|--------|----------|---------------------------------------------|
| token | string | Yes      | Session token for the authenticated session |
| user  | object | Yes      | The authenticated user object               |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

### `POST /two-factor/verify-totp`

**Description**: Verify two factor TOTP

**Better Auth Method**: `twoFactorVerifyTotp`

**Request Body**:

| Field       | Type    | Required | Description                                                                                                             |
|-------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------|
| code        | string  | Yes      | The otp code to verify. Eg: "012345"                                                                                    |
| trustDevice | boolean | No       | If true, the device will be trusted for 30 days. It'll be refreshed on every sign in request within this time. Eg: true |

**Success Response** (`200`):

| Field  | Type    | Required | Description |
|--------|---------|----------|-------------|
| status | boolean | No       |             |

**Error Responses**: See [COMMON_ERRORS.md](./COMMON_ERRORS.md)

---

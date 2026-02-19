# Better Auth API Schemas

> Source: `nextjs-better-auth-api-spec.json`
> Version: 1.1.0

This document contains all component schema definitions used across the Better Auth API.

## Table of Contents

- [`Account`](#account)
- [`Apikey`](#apikey)
- [`DeviceCode`](#devicecode)
- [`Invitation`](#invitation)
- [`Jwks`](#jwks)
- [`Member`](#member)
- [`OauthAccessToken`](#oauthaccesstoken)
- [`OauthApplication`](#oauthapplication)
- [`OauthConsent`](#oauthconsent)
- [`Organization`](#organization)
- [`OrganizationRole`](#organizationrole)
- [`Passkey`](#passkey)
- [`Session`](#session)
- [`SsoProvider`](#ssoprovider)
- [`Team`](#team)
- [`TeamMember`](#teammember)
- [`TwoFactor`](#twofactor)
- [`User`](#user)
- [`Verification`](#verification)
- [`WalletAddress`](#walletaddress)

---

## Schemas

### Account

**Type**: `object`

| Field                 | Type               | Required | Description |
|-----------------------|--------------------|----------|-------------|
| id                    | string             | No       |             |
| accountId             | string             | Yes      |             |
| providerId            | string             | Yes      |             |
| userId                | string             | Yes      |             |
| accessToken           | string             | No       |             |
| refreshToken          | string             | No       |             |
| idToken               | string             | No       |             |
| accessTokenExpiresAt  | string (date-time) | No       |             |
| refreshTokenExpiresAt | string (date-time) | No       |             |
| scope                 | string             | No       |             |
| password              | string             | No       |             |
| createdAt             | string (date-time) | No       |             |
| updatedAt             | string (date-time) | No       |             |
| _rowId                | number             | No       |             |
| deletedAt             | string (date-time) | No       |             |
| createdBy             | string             | No       |             |
| updatedBy             | string             | No       |             |
| deletedBy             | string             | No       |             |
| version               | number             | No       |             |
| source                | string             | No       |             |

---

### Apikey

**Type**: `object`

| Field               | Type               | Required | Description                           |
|---------------------|--------------------|----------|---------------------------------------|
| id                  | string             | No       |                                       |
| name                | string             | No       | **(read-only)**                       |
| start               | string             | No       | **(read-only)**                       |
| prefix              | string             | No       | **(read-only)**                       |
| key                 | string             | No       | **(read-only)**                       |
| userId              | string             | No       | **(read-only)**                       |
| refillInterval      | number             | No       | **(read-only)**                       |
| refillAmount        | number             | No       | **(read-only)**                       |
| lastRefillAt        | string (date-time) | No       | **(read-only)**                       |
| enabled             | boolean            | No       | (default: `True`) **(read-only)**     |
| rateLimitEnabled    | boolean            | No       | (default: `True`) **(read-only)**     |
| rateLimitTimeWindow | number             | No       | (default: `86400000`) **(read-only)** |
| rateLimitMax        | number             | No       | (default: `10`) **(read-only)**       |
| requestCount        | number             | No       | (default: `0`) **(read-only)**        |
| remaining           | number             | No       | **(read-only)**                       |
| lastRequest         | string (date-time) | No       | **(read-only)**                       |
| expiresAt           | string (date-time) | No       | **(read-only)**                       |
| createdAt           | string (date-time) | No       | **(read-only)**                       |
| updatedAt           | string (date-time) | No       | **(read-only)**                       |
| permissions         | string             | No       | **(read-only)**                       |
| metadata            | string             | No       |                                       |

---

### DeviceCode

**Type**: `object`

| Field           | Type               | Required | Description |
|-----------------|--------------------|----------|-------------|
| id              | string             | No       |             |
| deviceCode      | string             | Yes      |             |
| userCode        | string             | Yes      |             |
| userId          | string             | No       |             |
| expiresAt       | string (date-time) | Yes      |             |
| status          | string             | Yes      |             |
| lastPolledAt    | string (date-time) | No       |             |
| pollingInterval | number             | No       |             |
| clientId        | string             | No       |             |
| scope           | string             | No       |             |

---

### Invitation

**Type**: `object`

| Field          | Type               | Required | Description          |
|----------------|--------------------|----------|----------------------|
| id             | string             | No       |                      |
| organizationId | string             | Yes      |                      |
| email          | string             | Yes      |                      |
| role           | string             | No       |                      |
| teamId         | string             | No       |                      |
| status         | string             | Yes      | (default: `pending`) |
| expiresAt      | string (date-time) | Yes      |                      |
| createdAt      | string (date-time) | No       |                      |
| inviterId      | string             | Yes      |                      |
| _rowId         | number             | No       |                      |
| deletedAt      | string (date-time) | No       |                      |
| updatedAt      | string (date-time) | No       |                      |
| createdBy      | string             | No       |                      |
| updatedBy      | string             | No       |                      |
| deletedBy      | string             | No       |                      |
| version        | number             | No       |                      |
| source         | string             | No       |                      |

---

### Jwks

**Type**: `object`

| Field      | Type               | Required | Description |
|------------|--------------------|----------|-------------|
| id         | string             | No       |             |
| publicKey  | string             | Yes      |             |
| privateKey | string             | Yes      |             |
| createdAt  | string (date-time) | Yes      |             |
| expiresAt  | string (date-time) | No       |             |

---

### Member

**Type**: `object`

| Field          | Type               | Required | Description         |
|----------------|--------------------|----------|---------------------|
| id             | string             | No       |                     |
| organizationId | string             | Yes      |                     |
| userId         | string             | Yes      |                     |
| role           | string             | Yes      | (default: `member`) |
| createdAt      | string (date-time) | No       |                     |
| status         | string             | Yes      | (default: `active`) |
| invitedBy      | string             | No       |                     |
| invitedAt      | string (date-time) | No       |                     |
| joinedAt       | string (date-time) | No       |                     |
| lastActiveAt   | string (date-time) | No       |                     |
| permissions    | string             | No       |                     |
| _rowId         | number             | No       |                     |
| deletedAt      | string (date-time) | No       |                     |
| updatedAt      | string (date-time) | No       |                     |
| createdBy      | string             | No       |                     |
| updatedBy      | string             | No       |                     |
| deletedBy      | string             | No       |                     |
| version        | number             | No       |                     |
| source         | string             | No       |                     |

---

### OauthAccessToken

**Type**: `object`

| Field                 | Type               | Required | Description |
|-----------------------|--------------------|----------|-------------|
| id                    | string             | No       |             |
| accessToken           | string             | No       |             |
| refreshToken          | string             | No       |             |
| accessTokenExpiresAt  | string (date-time) | No       |             |
| refreshTokenExpiresAt | string (date-time) | No       |             |
| clientId              | string             | No       |             |
| userId                | string             | No       |             |
| scopes                | string             | No       |             |
| createdAt             | string (date-time) | No       |             |
| updatedAt             | string (date-time) | No       |             |

---

### OauthApplication

**Type**: `object`

| Field        | Type               | Required | Description        |
|--------------|--------------------|----------|--------------------|
| id           | string             | No       |                    |
| name         | string             | No       |                    |
| icon         | string             | No       |                    |
| metadata     | string             | No       |                    |
| clientId     | string             | No       |                    |
| clientSecret | string             | No       |                    |
| redirectUrls | string             | No       |                    |
| type         | string             | No       |                    |
| disabled     | boolean            | No       | (default: `False`) |
| userId       | string             | No       |                    |
| createdAt    | string (date-time) | No       |                    |
| updatedAt    | string (date-time) | No       |                    |

---

### OauthConsent

**Type**: `object`

| Field        | Type               | Required | Description |
|--------------|--------------------|----------|-------------|
| id           | string             | No       |             |
| clientId     | string             | No       |             |
| userId       | string             | No       |             |
| scopes       | string             | No       |             |
| createdAt    | string (date-time) | No       |             |
| updatedAt    | string (date-time) | No       |             |
| consentGiven | boolean            | No       |             |

---

### Organization

**Type**: `object`

| Field              | Type               | Required | Description             |
|--------------------|--------------------|----------|-------------------------|
| id                 | string             | No       |                         |
| name               | string             | Yes      |                         |
| slug               | string             | Yes      |                         |
| logo               | string             | No       |                         |
| createdAt          | string (date-time) | No       |                         |
| metadata           | string             | No       |                         |
| type               | string             | Yes      | (default: `individual`) |
| ownerUserId        | string             | No       |                         |
| isPersonal         | boolean            | Yes      |                         |
| maxMembers         | number             | No       |                         |
| features           | json               | No       |                         |
| settings           | json               | No       |                         |
| subscriptionTier   | string             | No       | (default: `free`)       |
| subscriptionStatus | string             | No       | (default: `active`)     |
| _rowId             | number             | No       |                         |
| deletedAt          | string (date-time) | No       |                         |
| updatedAt          | string (date-time) | No       |                         |
| createdBy          | string             | No       |                         |
| updatedBy          | string             | No       |                         |
| deletedBy          | string             | No       |                         |
| version            | number             | No       |                         |
| source             | string             | No       |                         |

---

### OrganizationRole

**Type**: `object`

| Field          | Type               | Required | Description |
|----------------|--------------------|----------|-------------|
| id             | string             | No       |             |
| organizationId | string             | Yes      |             |
| role           | string             | Yes      |             |
| permission     | string             | Yes      |             |
| createdAt      | string (date-time) | No       |             |
| updatedAt      | string (date-time) | No       |             |
| _rowId         | number             | No       |             |
| deletedAt      | string (date-time) | No       |             |
| createdBy      | string             | No       |             |
| updatedBy      | string             | No       |             |
| deletedBy      | string             | No       |             |
| version        | number             | No       |             |
| source         | string             | No       |             |

---

### Passkey

**Type**: `object`

| Field        | Type               | Required | Description |
|--------------|--------------------|----------|-------------|
| id           | string             | No       |             |
| name         | string             | No       |             |
| publicKey    | string             | Yes      |             |
| userId       | string             | Yes      |             |
| credentialID | string             | Yes      |             |
| counter      | number             | Yes      |             |
| deviceType   | string             | Yes      |             |
| backedUp     | boolean            | Yes      |             |
| transports   | string             | No       |             |
| createdAt    | string (date-time) | No       |             |
| aaguid       | string             | No       |             |

---

### Session

**Type**: `object`

| Field                | Type               | Required | Description |
|----------------------|--------------------|----------|-------------|
| id                   | string             | No       |             |
| expiresAt            | string (date-time) | Yes      |             |
| token                | string             | Yes      |             |
| createdAt            | string (date-time) | No       |             |
| updatedAt            | string (date-time) | No       |             |
| ipAddress            | string             | No       |             |
| userAgent            | string             | No       |             |
| userId               | string             | Yes      |             |
| activeOrganizationId | string             | No       |             |
| activeTeamId         | string             | No       |             |
| impersonatedBy       | string             | No       |             |
| _rowId               | number             | No       |             |
| deletedAt            | string (date-time) | No       |             |
| createdBy            | string             | No       |             |
| updatedBy            | string             | No       |             |
| deletedBy            | string             | No       |             |
| version              | number             | No       |             |
| source               | string             | No       |             |

---

### SsoProvider

**Type**: `object`

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| id             | string | No       |             |
| issuer         | string | Yes      |             |
| oidcConfig     | string | No       |             |
| samlConfig     | string | No       |             |
| userId         | string | No       |             |
| providerId     | string | Yes      |             |
| organizationId | string | No       |             |
| domain         | string | Yes      |             |

---

### Team

**Type**: `object`

| Field          | Type               | Required | Description |
|----------------|--------------------|----------|-------------|
| id             | string             | No       |             |
| name           | string             | Yes      |             |
| organizationId | string             | Yes      |             |
| createdAt      | string (date-time) | No       |             |
| updatedAt      | string (date-time) | No       |             |
| description    | string             | No       |             |
| metadata       | string             | No       |             |
| logo           | string             | No       |             |
| _rowId         | number             | No       |             |
| deletedAt      | string (date-time) | No       |             |
| createdBy      | string             | No       |             |
| updatedBy      | string             | No       |             |
| deletedBy      | string             | No       |             |
| version        | number             | No       |             |
| source         | string             | No       |             |

---

### TeamMember

**Type**: `object`

| Field     | Type               | Required | Description |
|-----------|--------------------|----------|-------------|
| id        | string             | No       |             |
| teamId    | string             | Yes      |             |
| userId    | string             | Yes      |             |
| createdAt | string (date-time) | No       |             |

---

### TwoFactor

**Type**: `object`

| Field       | Type   | Required | Description |
|-------------|--------|----------|-------------|
| id          | string | No       |             |
| secret      | string | Yes      |             |
| backupCodes | string | Yes      |             |
| userId      | string | Yes      |             |

---

### User

**Type**: `object`

| Field               | Type               | Required | Description                        |
|---------------------|--------------------|----------|------------------------------------|
| id                  | string             | No       |                                    |
| name                | string             | Yes      |                                    |
| email               | string             | Yes      |                                    |
| emailVerified       | boolean            | No       | (default: `False`) **(read-only)** |
| image               | string             | No       |                                    |
| createdAt           | string (date-time) | No       |                                    |
| updatedAt           | string (date-time) | No       |                                    |
| username            | string             | No       |                                    |
| displayUsername     | string             | No       |                                    |
| twoFactorEnabled    | boolean            | No       |                                    |
| stripeCustomerId    | string             | No       |                                    |
| phoneNumber         | string             | No       |                                    |
| phoneNumberVerified | boolean            | No       |                                    |
| isAnonymous         | boolean            | No       |                                    |
| role                | string             | No       |                                    |
| banned              | boolean            | No       |                                    |
| banReason           | string             | No       | **(read-only)**                    |
| banExpires          | string (date-time) | No       |                                    |
| uploadLimit         | number             | No       |                                    |
| lastLoginMethod     | string             | No       |                                    |
| _rowId              | number             | No       |                                    |
| deletedAt           | string (date-time) | No       |                                    |
| createdBy           | string             | No       |                                    |
| updatedBy           | string             | No       |                                    |
| deletedBy           | string             | No       |                                    |
| version             | number             | No       |                                    |
| source              | string             | No       |                                    |

---

### Verification

**Type**: `object`

| Field      | Type               | Required | Description                       |
|------------|--------------------|----------|-----------------------------------|
| id         | string             | No       |                                   |
| identifier | string             | Yes      |                                   |
| value      | string             | Yes      |                                   |
| expiresAt  | string (date-time) | Yes      |                                   |
| createdAt  | string (date-time) | Yes      | (default: `Generated at runtime`) |
| updatedAt  | string (date-time) | Yes      | (default: `Generated at runtime`) |

---

### WalletAddress

**Type**: `object`

| Field     | Type               | Required | Description        |
|-----------|--------------------|----------|--------------------|
| id        | string             | No       |                    |
| userId    | string             | Yes      |                    |
| address   | string             | Yes      |                    |
| chainId   | number             | Yes      |                    |
| isPrimary | boolean            | No       | (default: `False`) |
| createdAt | string (date-time) | Yes      |                    |

---


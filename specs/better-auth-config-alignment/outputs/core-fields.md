# Better Auth Core Fields Reference

> Generated from Better Auth source code analysis (Phase 0 research)

---

## Overview

Better Auth core fields are defined in `tmp/better-auth/packages/core/src/db/schema/`. These fields are **managed by Better Auth** and should NOT be added to `additionalFields` configuration.

---

## Shared Core Schema

All models inherit from `coreSchema`:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | string | — | Primary key |
| `createdAt` | date | `new Date()` | Auto-set on create |
| `updatedAt` | date | `new Date()` | Auto-set on create/update |

---

## User Model

**Source**: `tmp/better-auth/packages/core/src/db/schema/user.ts`

### Core Fields (DO NOT add to additionalFields)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | From coreSchema |
| `createdAt` | date | ✅ | From coreSchema |
| `updatedAt` | date | ✅ | From coreSchema |
| `email` | string | ✅ | Transformed to lowercase |
| `emailVerified` | boolean | ✅ | Default: `false` |
| `name` | string | ✅ | |
| `image` | string | ❌ | Nullable |

### Plugin-Added Fields (automatically managed)

| Plugin | Field | Type | Notes |
|--------|-------|------|-------|
| username | `username` | string | |
| username | `displayName` | string | Optional |
| phoneNumber | `phoneNumber` | string | |
| phoneNumber | `phoneNumberVerified` | boolean | |
| anonymous | `isAnonymous` | boolean | |
| admin | `role` | string | Default: "user" |
| admin | `banned` | boolean | |
| admin | `banReason` | string | Nullable |
| admin | `banExpires` | date | Nullable |
| lastLoginMethod | `lastLoginMethod` | string | Only if storeInDatabase enabled |

---

## Session Model

**Source**: `tmp/better-auth/packages/core/src/db/schema/session.ts`

### Core Fields (DO NOT add to additionalFields)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | From coreSchema |
| `createdAt` | date | ✅ | From coreSchema |
| `updatedAt` | date | ✅ | From coreSchema |
| `userId` | string | ✅ | FK to user.id |
| `expiresAt` | date | ✅ | Session expiration |
| `token` | string | ✅ | Session token (hashed) |
| `ipAddress` | string | ❌ | Nullable |
| `userAgent` | string | ❌ | Nullable |

### Plugin-Added Fields

| Plugin | Field | Type | Notes |
|--------|-------|------|-------|
| admin | `impersonatedBy` | string | When impersonation is active |
| organization | `activeOrganizationId` | string | Currently active org |

---

## Account Model

**Source**: `tmp/better-auth/packages/core/src/db/schema/account.ts`

### Core Fields (DO NOT add to additionalFields)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | From coreSchema |
| `createdAt` | date | ✅ | From coreSchema |
| `updatedAt` | date | ✅ | From coreSchema |
| `providerId` | string | ✅ | OAuth provider ID |
| `accountId` | string | ✅ | External account ID |
| `userId` | string | ✅ | FK to user.id |
| `accessToken` | string | ❌ | OAuth access token |
| `refreshToken` | string | ❌ | OAuth refresh token |
| `idToken` | string | ❌ | OIDC ID token |
| `accessTokenExpiresAt` | date | ❌ | Token expiration |
| `refreshTokenExpiresAt` | date | ❌ | Refresh token expiration |
| `scope` | string | ❌ | OAuth scopes |
| `password` | string | ❌ | Hashed password (credential provider) |

**Note**: Account model does NOT support `additionalFields` in core options.

---

## Verification Model

**Source**: `tmp/better-auth/packages/core/src/db/schema/verification.ts`

### Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | From coreSchema |
| `createdAt` | date | ✅ | From coreSchema |
| `updatedAt` | date | ✅ | From coreSchema |
| `value` | string | ✅ | Verification value/token |
| `expiresAt` | date | ✅ | Expiration time |
| `identifier` | string | ✅ | What this verifies |

---

## Organization Plugin Models

**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`

### Organization

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `name` | string | ✅ | |
| `slug` | string | ✅ | URL-safe identifier |
| `logo` | string | ❌ | |
| `createdAt` | date | ✅ | |
| `metadata` | string | ❌ | JSON string |

### Member

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `organizationId` | string | ✅ | FK to organization |
| `userId` | string | ✅ | FK to user |
| `role` | string | ✅ | Role in organization |
| `createdAt` | date | ✅ | |

### Invitation

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `organizationId` | string | ✅ | FK to organization |
| `email` | string | ✅ | Invitee email |
| `role` | string | ✅ | Invited role |
| `status` | string | ✅ | pending/accepted/rejected |
| `expiresAt` | date | ✅ | |
| `inviterId` | string | ✅ | FK to user who invited |

### Team

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `organizationId` | string | ✅ | FK to organization |
| `name` | string | ✅ | |
| `createdAt` | date | ✅ | |
| `updatedAt` | date | ✅ | |

### TeamMember

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `teamId` | string | ✅ | FK to team |
| `userId` | string | ✅ | FK to user |
| `createdAt` | date | ✅ | |

---

## beep-effect Table.make Default Columns

The beep-effect codebase uses `Table.make` which adds these columns beyond Better Auth defaults:

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Branded entity ID |
| `_rowId` | number | Internal auto-increment |
| `createdAt` | date | UTC, auto-set |
| `updatedAt` | date | UTC, auto-updated |
| `deletedAt` | date | Soft delete |
| `createdBy` | string | User/system ID |
| `updatedBy` | string | User/system ID |
| `deletedBy` | string | User/system ID |
| `version` | number | Optimistic locking |
| `source` | string | Origin tracking |

### Additional Fields Needed in Better Auth Config

For models that use `Table.make`, these fields need to be added to `additionalFields`:

```typescript
// These are NOT Better Auth core fields and MUST be configured
const additionalFieldsCommon = {
  _rowId: { type: "number", required: false, input: false },
  deletedAt: { type: "date", required: false },
  createdBy: { type: "string", required: false },
  updatedBy: { type: "string", required: false },
  deletedBy: { type: "string", required: false },
  version: { type: "number", required: false, defaultValue: 1 },
  source: { type: "string", required: false },
}
```

---

## Field Configuration Guidelines

### Required vs Optional

Better Auth defaults `required: true`. For nullable Drizzle columns, MUST set `required: false`:

```typescript
{
  myNullableField: {
    type: "string",
    required: false,  // CRITICAL for nullable columns
  }
}
```

### Input/Output Control

```typescript
{
  readOnlyField: {
    type: "string",
    input: false,      // Cannot be set via API
    returned: true,    // Included in responses
  },
  writeOnlyField: {
    type: "string",
    input: true,
    returned: false,   // Excluded from responses
  }
}
```

### Auto-Set Values

```typescript
{
  autoField: {
    type: "number",
    input: false,
    defaultValue: 1,  // Set on create
  },
  timestampField: {
    type: "date",
    input: false,
    defaultValue: () => new Date(),  // Function for dynamic default
    onUpdate: () => new Date(),       // Updated on every update
  }
}
```

# Method Inventory - IAM Client Final Methods

> **Generated**: 2026-01-15
> **Purpose**: Verified method signatures, response shapes, and pattern classifications for remaining Better Auth client methods

---

## Overview

This inventory documents all remaining Better Auth client methods verified against source code in `tmp/better-auth/packages/better-auth/`.

### Pattern Classification Key

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **Factory** | Use `createHandler` factory | Standard `{ data, error }` response, no computed fields |
| **Manual** | Use `Effect.fn` directly | Computed fields, different response shape, multi-step flow, WebAuthn |

### `mutatesSession` Classification

| Value | Description |
|-------|-------------|
| `true` | Sign-in, sign-out, session operations, authentication state changes |
| `false` | Read-only queries, profile reads, non-auth operations |

---

## Priority 1: Sign-In Methods

### 1.1 `signIn.username`

**Source**: `tmp/better-auth/packages/better-auth/src/plugins/username/index.ts:47-82`

**Client Call**: `client.signIn.username()`

**Endpoint**: `POST /sign-in/username`

**Payload Schema**:
```typescript
{
  username: string;          // Required
  password: string;          // Required - SENSITIVE (use S.Redacted)
  rememberMe?: boolean;      // Optional
  callbackURL?: string;      // Optional
}
```

**Success Schema**:
```typescript
{
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    username: string;
    displayUsername: string;
    name: string | null;
    image: string | null;
    createdAt: Date;         // ISO string from API
    updatedAt: Date;         // ISO string from API
  }
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (creates session)

---

## Priority 2: Core Session Methods

### 2.1 `listSessions` (Core)

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/session.ts:105-144`

**Client Call**: `client.listSessions()`

**Endpoint**: `GET /list-sessions`

**Payload**: None (no parameters)

**Success Schema**:
```typescript
Array<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
}>
```

**Pattern**: Factory
**`mutatesSession`**: `false` (read-only)

**Note**: Multi-session plugin's `listDeviceSessions` returns additional fields. This is the CORE session list.

---

### 2.2 `revokeSession` (Core)

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/session.ts:146-202`

**Client Call**: `client.revokeSession()`

**Endpoint**: `POST /revoke-session`

**Payload Schema**:
```typescript
{
  token: string;    // Session token to revoke
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (modifies session state)

---

### 2.3 `revokeSessions` (Core)

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/session.ts:204-250`

**Client Call**: `client.revokeSessions()`

**Endpoint**: `POST /revoke-sessions`

**Payload**: Empty object `{}`

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (revokes all sessions)

---

### 2.4 `revokeOtherSessions` (Core)

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/session.ts:252-304`

**Client Call**: `client.revokeOtherSessions()`

**Endpoint**: `POST /revoke-other-sessions`

**Payload**: Empty object `{}`

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (revokes all except current)

---

## Priority 2: Core Account Methods

### 2.5 `updateUser`

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/update-user.ts:24-143`

**Client Call**: `client.updateUser()`

**Endpoint**: `POST /update-user`

**Payload Schema**:
```typescript
{
  name?: string;
  image?: string | null;
  // Additional custom fields as defined in auth config
  [key: string]: any;
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (updates user in session cookie)

**Gotcha**: Cannot update `email` via this endpoint - throws error.

---

### 2.6 `changePassword`

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/update-user.ts:145-321`

**Client Call**: `client.changePassword()`

**Endpoint**: `POST /change-password`

**Payload Schema**:
```typescript
{
  newPassword: string;           // Required - SENSITIVE
  currentPassword: string;       // Required - SENSITIVE
  revokeOtherSessions?: boolean; // Optional
}
```

**Success Schema**:
```typescript
{
  token: string | null;  // Only present if revokeOtherSessions=true
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (may revoke sessions, always updates auth state)

---

### 2.7 `setPassword`

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/update-user.ts:323-375`

**Client Call**: `client.setPassword()`

**Endpoint**: `POST /set-password`

**Payload Schema**:
```typescript
{
  newPassword: string;  // Required - SENSITIVE
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (links credential, doesn't change session)

**Note**: Only works for users WITHOUT an existing password (OAuth-only users).

---

### 2.8 `deleteUser`

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/update-user.ts:377-574`

**Client Call**: `client.deleteUser()`

**Endpoint**: `POST /delete-user`

**Payload Schema**:
```typescript
{
  callbackURL?: string;   // Optional
  password?: string;      // Optional - SENSITIVE (for verification)
  token?: string;         // Optional (deletion token)
}
```

**Success Schema**:
```typescript
{
  success: boolean;
  message: "User deleted" | "Verification email sent";
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (deletes session on success)

---

### 2.9 `changeEmail`

**Source**: `tmp/better-auth/packages/better-auth/src/api/routes/update-user.ts:674-897`

**Client Call**: `client.changeEmail()`

**Endpoint**: `POST /change-email`

**Payload Schema**:
```typescript
{
  newEmail: string;       // Required (valid email format)
  callbackURL?: string;   // Optional
}
```

**Success Schema**:
```typescript
{
  status: boolean;        // Always true on success
  user?: User;            // Present if email updated immediately
  message?: string;       // "Email updated" | "Verification email sent"
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (may update session cookie with new email)

---

## Priority 2: Admin Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/better-auth/src/plugins/admin/`

### 2.10 `admin.setRole`

**Source**: `admin/routes.ts:87-165`

**Client Call**: `client.admin.setRole()`

**Endpoint**: `POST /admin/set-role`

**Payload Schema**:
```typescript
{
  userId: string;
  role: string | string[];  // Role name(s)
}
```

**Success Schema**:
```typescript
{
  user: UserWithRole;  // Full user object with role field
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation on OTHER user)

---

### 2.11 `admin.getUser`

**Source**: `admin/routes.ts:173-232`

**Client Call**: `client.admin.getUser()`

**Endpoint**: `GET /admin/get-user`

**Payload Schema** (query params):
```typescript
{
  id: string;  // User ID
}
```

**Success Schema**:
```typescript
User  // Full user object (parsed output)
```

**Pattern**: Factory
**`mutatesSession`**: `false` (read-only)

---

### 2.12 `admin.createUser`

**Source**: `admin/routes.ts:283-388`

**Client Call**: `client.admin.createUser()`

**Endpoint**: `POST /admin/create-user`

**Payload Schema**:
```typescript
{
  email: string;
  password: string;         // SENSITIVE
  name: string;
  role?: string | string[]; // Optional
  data?: Record<string, any>; // Additional fields
}
```

**Success Schema**:
```typescript
{
  user: UserWithRole;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (creates OTHER user)

---

### 2.13 `admin.updateUser`

**Source**: `admin/routes.ts:414-510`

**Client Call**: `client.admin.updateUser()`

**Endpoint**: `POST /admin/update-user`

**Payload Schema**:
```typescript
{
  userId: string;
  data: Record<string, any>;  // Fields to update
}
```

**Success Schema**:
```typescript
UserWithRole  // Updated user object
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation on OTHER user)

---

### 2.14 `admin.listUsers`

**Source**: `admin/routes.ts:578-686`

**Client Call**: `client.admin.listUsers()`

**Endpoint**: `GET /admin/list-users`

**Payload Schema** (query params):
```typescript
{
  searchValue?: string;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  limit?: string | number;
  offset?: string | number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filterField?: string;
  filterValue?: string | number | boolean;
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "contains";
}
```

**Success Schema**:
```typescript
{
  users: UserWithRole[];
  total: number;
  limit?: number;
  offset?: number;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (read-only)

---

### 2.15 `admin.listUserSessions`

**Source**: `admin/routes.ts:688-750` (approx)

**Client Call**: `client.admin.listUserSessions()`

**Endpoint**: `POST /admin/list-user-sessions`

**Payload Schema**:
```typescript
{
  userId: string;
}
```

**Success Schema**:
```typescript
Session[]  // Array of session objects
```

**Pattern**: Factory
**`mutatesSession`**: `false` (read-only)

---

### 2.16 `admin.banUser`

**Client Call**: `client.admin.banUser()`

**Endpoint**: `POST /admin/ban-user`

**Payload Schema**:
```typescript
{
  userId: string;
  banReason?: string;
  banExpires?: number;  // Timestamp
}
```

**Success Schema**:
```typescript
{
  user: UserWithRole;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.17 `admin.unbanUser`

**Client Call**: `client.admin.unbanUser()`

**Endpoint**: `POST /admin/unban-user`

**Payload Schema**:
```typescript
{
  userId: string;
}
```

**Success Schema**:
```typescript
{
  user: UserWithRole;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.18 `admin.impersonateUser`

**Client Call**: `client.admin.impersonateUser()`

**Endpoint**: `POST /admin/impersonate-user`

**Payload Schema**:
```typescript
{
  userId: string;
}
```

**Success Schema**:
```typescript
{
  session: Session;
  user: User;
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (switches session)

---

### 2.19 `admin.stopImpersonating`

**Client Call**: `client.admin.stopImpersonating()`

**Endpoint**: `POST /admin/stop-impersonating`

**Payload**: Empty object `{}`

**Success Schema**:
```typescript
{
  session: Session;
  user: User;
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (restores original session)

---

### 2.20 `admin.revokeUserSession`

**Client Call**: `client.admin.revokeUserSession()`

**Endpoint**: `POST /admin/revoke-user-session`

**Payload Schema**:
```typescript
{
  sessionId: string;  // Or sessionToken, verify in source
}
```

**Success Schema**:
```typescript
{
  status: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation)

---

### 2.21 `admin.revokeUserSessions`

**Client Call**: `client.admin.revokeUserSessions()`

**Endpoint**: `POST /admin/revoke-user-sessions`

**Payload Schema**:
```typescript
{
  userId: string;
}
```

**Success Schema**:
```typescript
{
  status: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation)

---

### 2.22 `admin.removeUser`

**Client Call**: `client.admin.removeUser()`

**Endpoint**: `POST /admin/remove-user`

**Payload Schema**:
```typescript
{
  userId: string;
}
```

**Success Schema**:
```typescript
{
  success: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation)

---

### 2.23 `admin.setUserPassword`

**Client Call**: `client.admin.setUserPassword()`

**Endpoint**: `POST /admin/set-user-password`

**Payload Schema**:
```typescript
{
  userId: string;
  newPassword: string;  // SENSITIVE
}
```

**Success Schema**:
```typescript
{
  status: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (admin operation)

---

### 2.24 `admin.userHasPermission`

**Client Call**: `client.admin.userHasPermission()`

**Endpoint**: `GET /admin/user-has-permission`

**Payload Schema** (query params):
```typescript
{
  userId?: string;
  permissions: Record<string, string[]>;  // JSON stringified
}
```

**Success Schema**:
```typescript
{
  hasPermission: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (read-only)

---

## Priority 2: API Key Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/better-auth/src/plugins/api-key/`

### 2.25 `apiKey.create`

**Source**: `api-key/routes/create-api-key.ts`

**Client Call**: `client.apiKey.create()`

**Endpoint**: `POST /api-key/create`

**Payload Schema**:
```typescript
{
  name?: string;
  expiresIn?: number | null;  // Seconds
  prefix?: string;
  // Server-only fields (not allowed from client):
  // userId, remaining, metadata, refillAmount, refillInterval,
  // rateLimitTimeWindow, rateLimitMax, rateLimitEnabled, permissions
}
```

**Success Schema**:
```typescript
{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string | null;
  prefix: string | null;
  start: string | null;
  key: string;              // Full key - ONLY returned on create!
  enabled: boolean;
  expiresAt: Date | null;
  userId: string;
  lastRefillAt: Date | null;
  lastRequest: Date | null;
  metadata: Record<string, any> | null;
  rateLimitMax: number | null;
  rateLimitTimeWindow: number | null;
  remaining: number | null;
  refillAmount: number | null;
  refillInterval: number | null;
  rateLimitEnabled: boolean;
  requestCount: number;
  permissions: Record<string, string[]> | null;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.26 `apiKey.get`

**Client Call**: `client.apiKey.get()`

**Endpoint**: `GET /api-key/get`

**Payload Schema** (query params):
```typescript
{
  id: string;
}
```

**Success Schema**: Same as create but WITHOUT `key` field

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.27 `apiKey.update`

**Client Call**: `client.apiKey.update()`

**Endpoint**: `POST /api-key/update`

**Payload Schema**:
```typescript
{
  id: string;
  name?: string;
  enabled?: boolean;
  // Other updatable fields
}
```

**Success Schema**: ApiKey object (without key)

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.28 `apiKey.delete`

**Client Call**: `client.apiKey.delete()`

**Endpoint**: `POST /api-key/delete`

**Payload Schema**:
```typescript
{
  id: string;
}
```

**Success Schema**:
```typescript
{
  success: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 2.29 `apiKey.list`

**Client Call**: `client.apiKey.list()`

**Endpoint**: `GET /api-key/list`

**Payload**: None or empty query params

**Success Schema**:
```typescript
ApiKey[]  // Array without key field
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

## Priority 3: Anonymous Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/better-auth/src/plugins/anonymous/index.ts`

### 3.1 `signIn.anonymous`

**Source**: `anonymous/index.ts:63-151`

**Client Call**: `client.signIn.anonymous()`

**Endpoint**: `POST /sign-in/anonymous`

**Payload**: None (no parameters)

**Success Schema**:
```typescript
{
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (creates anonymous session)

**Gotcha**: Rejects if already signed in anonymously.

---

### 3.2 `anonymous.deleteAnonymousUser`

**Source**: `anonymous/index.ts:152-241`

**Client Call**: `client.anonymous.deleteAnonymousUser()` or similar

**Endpoint**: `POST /delete-anonymous-user`

**Payload**: None (uses current session)

**Success Schema**:
```typescript
{
  success: boolean;
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (deletes session cookie)

**Gotcha**: Only works for users where `isAnonymous === true`.

---

## Priority 3: Phone Number Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/better-auth/src/plugins/phone-number/routes.ts`

### 3.3 `signIn.phoneNumber`

**Source**: `phone-number/routes.ts:51-211`

**Client Call**: `client.signIn.phoneNumber()`

**Endpoint**: `POST /sign-in/phone-number`

**Payload Schema**:
```typescript
{
  phoneNumber: string;    // E.g., "+1234567890"
  password: string;       // SENSITIVE
  rememberMe?: boolean;
}
```

**Success Schema**:
```typescript
{
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image: string | null;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
```

**Pattern**: Factory
**`mutatesSession`**: `true`

---

### 3.4 `phoneNumber.sendOtp`

**Source**: `phone-number/routes.ts:234-302`

**Client Call**: `client.phoneNumber.sendOtp()`

**Endpoint**: `POST /phone-number/send-otp`

**Payload Schema**:
```typescript
{
  phoneNumber: string;
}
```

**Success Schema**:
```typescript
{
  message: string;  // "code sent"
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 3.5 `phoneNumber.verify`

**Source**: `phone-number/routes.ts:356-670`

**Client Call**: `client.phoneNumber.verify()`

**Endpoint**: `POST /phone-number/verify`

**Payload Schema**:
```typescript
{
  phoneNumber: string;
  code: string;              // OTP code
  disableSession?: boolean;
  updatePhoneNumber?: boolean;
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
  token: string | null;
  user: UserWithPhoneNumber | null;
}
```

**Pattern**: Factory
**`mutatesSession`**: `true` (may create session)

---

### 3.6 `phoneNumber.requestPasswordReset`

**Source**: `phone-number/routes.ts:676-748`

**Client Call**: `client.phoneNumber.requestPasswordReset()`

**Endpoint**: `POST /phone-number/request-password-reset`

**Payload Schema**:
```typescript
{
  phoneNumber: string;
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true (doesn't leak existence)
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 3.7 `phoneNumber.resetPassword`

**Source**: `phone-number/routes.ts:763-875`

**Client Call**: `client.phoneNumber.resetPassword()`

**Endpoint**: `POST /phone-number/reset-password`

**Payload Schema**:
```typescript
{
  otp: string;
  phoneNumber: string;
  newPassword: string;  // SENSITIVE
}
```

**Success Schema**:
```typescript
{
  status: boolean;  // Always true on success
}
```

**Pattern**: Factory
**`mutatesSession`**: `false` (may revoke sessions based on config)

---

## Priority 3: Device Authorization Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/better-auth/src/plugins/device-authorization/`

### 3.8 `deviceAuthorization.requestCode`

**Endpoint**: `POST /device/code`

**Payload Schema**:
```typescript
{
  clientId?: string;
  scope?: string;
}
```

**Success Schema**:
```typescript
{
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
}
```

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 3.9 `deviceAuthorization.token`

**Endpoint**: `POST /device/token`

**Payload Schema**:
```typescript
{
  deviceCode: string;
  clientId?: string;
}
```

**Success Schema**:
```typescript
{
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  // Or error: "authorization_pending" | "slow_down" | "access_denied" | "expired_token"
}
```

**Pattern**: Manual (polling flow with specific error handling)
**`mutatesSession`**: `true` (on success)

---

### 3.10 `deviceAuthorization.verify`

**Endpoint**: `GET /device/verify`

**Payload** (query):
```typescript
{
  userCode: string;
}
```

**Pattern**: Factory (redirect-based, may not need client handler)

---

### 3.11 `deviceAuthorization.approve`

**Endpoint**: `POST /device/approve`

**Pattern**: Factory (user-facing, uses current session)

---

### 3.12 `deviceAuthorization.deny`

**Endpoint**: `POST /device/deny`

**Pattern**: Factory (user-facing)

---

## Priority 2: Passkey Methods

**Plugin Source**: `tmp/better-auth/packages/passkey/src/client.ts`

### 3.13 `signIn.passkey`

**Source**: `passkey/src/client.ts:33-86`

**Client Call**: `client.signIn.passkey()`

**Flow**:
1. GET `/passkey/generate-authenticate-options` → PublicKeyCredentialRequestOptionsJSON
2. Call WebAuthn `startAuthentication()`
3. POST `/passkey/verify-authentication` with response

**Pattern**: **Manual** (multi-step WebAuthn flow)
**`mutatesSession`**: `true`

**Note**: This is a complex WebAuthn flow that requires browser APIs. The client wraps WebAuthn operations.

---

### 3.14 `passkey.addPasskey`

**Source**: `passkey/src/client.ts:88-198`

**Client Call**: `client.passkey.addPasskey()`

**Flow**:
1. GET `/passkey/generate-register-options`
2. Call WebAuthn `startRegistration()`
3. POST `/passkey/verify-registration`

**Pattern**: **Manual** (multi-step WebAuthn flow)
**`mutatesSession`**: `false`

---

### 3.15 `passkey.listUserPasskeys`

**Endpoint**: `GET /passkey/list-user-passkeys`

**Pattern**: Factory
**`mutatesSession`**: `false`

**Success Schema**:
```typescript
Array<{
  id: string;
  name: string | null;
  publicKey: string;
  userId: string;
  webauthnUserID: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports: string | null;
  createdAt: Date;
}>
```

---

### 3.16 `passkey.deletePasskey`

**Endpoint**: `POST /passkey/delete-passkey`

**Payload**: `{ id: string }`

**Pattern**: Factory
**`mutatesSession`**: `false`

---

### 3.17 `passkey.updatePasskey`

**Endpoint**: `POST /passkey/update-passkey`

**Payload**: `{ id: string, name: string }`

**Pattern**: Factory
**`mutatesSession`**: `false`

---

## Priority 2: SSO Plugin Methods

**Plugin Source**: `tmp/better-auth/packages/sso/src/`

**Note**: SSO client (`ssoClient()`) is thin - primarily configures server-side SSO behavior. The actual sign-in flow uses OAuth patterns.

### 3.18 SSO Sign-In

SSO sign-in typically follows OAuth redirect flow:
1. Redirect to `/api/auth/sso/[provider]`
2. Provider authenticates
3. Callback to `/api/auth/callback/[provider]`

**Pattern**: Redirect-based (may not need handler)

---

## Summary Tables

### Pattern Distribution

| Pattern | Count | Methods |
|---------|-------|---------|
| Factory | 35+ | Most methods |
| Manual | 3 | Passkey flows, device token polling |
| Redirect | 2 | SSO sign-in, verifyEmail |

### Methods by `mutatesSession`

| Value | Methods |
|-------|---------|
| `true` | signIn.*, signOut, revokeSession*, admin.impersonate*, deleteUser, anonymous.delete |
| `false` | listSessions, admin.listUsers, admin.getUser, apiKey.*, updateUser (profile only), etc. |

### Priority Implementation Order

**Phase 1** (P1):
- signIn.username

**Phase 2** (P2):
- Core: listSessions, revokeSession, revokeSessions, revokeOtherSessions
- Core: updateUser, changePassword, deleteUser, changeEmail
- Admin: all methods (14 handlers)
- API Key: all methods (5 handlers)

**Phase 3** (P3):
- Anonymous: signIn.anonymous, deleteAnonymousUser
- Phone Number: all methods (5 handlers)
- Device Authorization: core flow (3-5 handlers)
- Passkey: all methods (5 handlers - Manual pattern)

**Phase 4** (P4 - Research):
- SCIM (likely server-only)
- verifyEmail (redirect-based)
- Account linking methods

---

## Next Steps

1. **Create Phase 1 Handoff**: `signIn.username` - straightforward Factory pattern
2. **Create Phase 2 Handoff**: Core session/account methods
3. **Create Phase 3 Handoff**: Admin plugin (14 methods)
4. **Continue incrementally** with remaining phases

Each handoff should follow `HANDOFF_CREATION_GUIDE.md` format with:
- Pre-implementation checklist
- Contract schemas (Effect Schema types)
- Implementation checklist
- Testing verification

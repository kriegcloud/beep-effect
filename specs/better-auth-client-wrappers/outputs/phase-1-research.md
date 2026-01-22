# Phase 1 Research: Core + Username Methods

> Research document for 9 better-auth client wrappers

---

## Summary

| # | Method | Pattern | mutatesSession | Client Path |
|---|--------|---------|----------------|-------------|
| 1 | updateUser | Standard | `true` | `client.updateUser(encoded)` |
| 2 | deleteUser | No-payload | `true` | `client.deleteUser()` |
| 3 | revokeSession | Standard | `true` | `client.revokeSession(encoded)` |
| 4 | revokeOtherSessions | No-payload | `true` | `client.revokeOtherSessions()` |
| 5 | revokeSessions | No-payload | `true` | `client.revokeSessions()` |
| 6 | linkSocial | Standard | `true` | `client.linkSocial(encoded)` |
| 7 | listAccounts | No-payload + Array | `false` | `client.listAccounts()` |
| 8 | unlinkAccount | Standard | `true` | `client.unlinkAccount(encoded)` |
| 9 | isUsernameAvailable | Standard | `false` | `client.username.isUsernameAvailable(encoded)` |

---

## Method Details

### 1. updateUser

**Source**: [Better Auth Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts#update-user)

**Payload**:
```typescript
{
  name?: S.optional(S.String),
  image?: S.optional(S.String),
}
```

**Success**:
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

**Notes**: Updates user profile information. Both fields optional.

---

### 2. deleteUser

**Source**: [Better Auth Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts#delete-user)

**Pattern**: No-payload

**Payload**: None (user must be signed in)

**Success**:
```typescript
{
  success: S.Boolean
}
```

**Notes**: Better Auth docs mention optional `password`, `token`, `callbackURL` for re-authentication, but the basic client call is no-payload. User must be signed in.

---

### 3. revokeSession

**Source**: [Better Auth Session Management](https://www.better-auth.com/docs/concepts/session-management#revoke-session)

**Payload**:
```typescript
{
  token: S.String  // Session token to revoke
}
```

**Success**:
```typescript
{
  success: S.Boolean
}
```

**Notes**: Revokes a specific session by token.

---

### 4. revokeOtherSessions

**Source**: [Better Auth Session Management](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions)

**Pattern**: No-payload

**Payload**: None

**Success**:
```typescript
{
  success: S.Boolean
}
```

**Notes**: Terminates all sessions except the currently active one.

---

### 5. revokeSessions

**Source**: [Better Auth Session Management](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions)

**Pattern**: No-payload

**Payload**: None

**Success**:
```typescript
{
  success: S.Boolean
}
```

**Notes**: Invalidates ALL active sessions for the user, including current.

---

### 6. linkSocial

**Source**: [Better Auth Account Linking](https://www.better-auth.com/docs/concepts/users-accounts#account-linking)

**Payload**:
```typescript
{
  provider: S.String,  // e.g., "google", "github"
  callbackURL?: S.optional(S.String),
}
```

**Success**:
```typescript
{
  url: S.optional(S.String)  // OAuth redirect URL, may be undefined on direct linking
}
```

**Notes**: Links a social provider to existing account. Returns OAuth redirect URL.

---

### 7. listAccounts

**Source**: [Better Auth Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts)

**Pattern**: No-payload + Array response

**Payload**: None

**Success**:
```typescript
S.Array(Account)
// Account = {
//   id: S.String,
//   providerId: S.String,  // e.g., "credential", "google"
//   accountId: S.String,
//   accessToken?: S.optional(S.String),
//   refreshToken?: S.optional(S.String),
//   ...
// }
```

**Notes**: Returns all accounts (auth methods) linked to the user. Define Account schema locally.

---

### 8. unlinkAccount

**Source**: [Better Auth Account Unlinking](https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking)

**Payload**:
```typescript
{
  providerId: S.String  // e.g., "google", "github"
}
```

**Success**:
```typescript
{
  success: S.Boolean
}
```

**Notes**: Unlinks a specific provider from user. Will fail if only one account unless `allowUnlinkingAll` is enabled.

---

### 9. isUsernameAvailable (username plugin)

**Source**: [Better Auth Username Plugin](https://www.better-auth.com/docs/plugins/username#check-if-username-is-available)

**Payload**:
```typescript
{
  username: S.String
}
```

**Success**:
```typescript
{
  status: S.Boolean  // true if available, false if taken
}
```

**Notes**: Can be disabled via `disablePaths` to prevent username enumeration.

---

## Implementation Notes

### Schema Imports Required

All contracts need:
```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
```

### No-payload contracts

Omit `payload` from `W.Wrapper.make()`:
```typescript
export const Wrapper = W.Wrapper.make("MethodName", {
  success: Success,
  error: Common.IamError,
});
```

### Array responses

Use `S.Array(Schema).annotations()`:
```typescript
export const Success = S.Array(Account).annotations(
  $I.annotations("Success", { description: "..." })
);
```

### Directory Structure

```
packages/iam/client/src/
├── core/
│   ├── update-user/
│   ├── delete-user/
│   ├── revoke-session/
│   ├── revoke-other-sessions/
│   ├── revoke-sessions/
│   ├── link-social/
│   ├── list-accounts/
│   └── unlink-account/
└── username/
    └── is-username-available/
```

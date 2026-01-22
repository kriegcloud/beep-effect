# Method Implementation Guide

> Per-method specifications for all 90 better-auth client wrappers

---

## Legend

| Column | Description |
|--------|-------------|
| **Pattern** | Standard, No-payload, Query-wrapped, Array |
| **mutatesSession** | Whether to notify `$sessionSignal` |
| **Client Path** | The Better Auth client method to call |
| **Category** | JSDoc category path |

---

## Phase 1: Core + Username (9 methods)

### 1. updateUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.updateUser(encoded)` |
| Category | `Core/UpdateUser` |
| Schema ID | `$IamClientId.create("core/update-user")` |

**Payload:**
```typescript
{
  name?: string,
  image?: string,
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 2. deleteUser

| Field | Value |
|-------|-------|
| Pattern | **No-payload** |
| mutatesSession | `true` |
| Client Path | `client.deleteUser()` |
| Category | `Core/DeleteUser` |
| Schema ID | `$IamClientId.create("core/delete-user")` |

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 3. revokeSession

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.revokeSession(encoded)` |
| Category | `Core/RevokeSession` |
| Schema ID | `$IamClientId.create("core/revoke-session")` |

**Payload:**
```typescript
{
  token: S.String  // Session token to revoke
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 4. revokeOtherSessions

| Field | Value |
|-------|-------|
| Pattern | **No-payload** |
| mutatesSession | `true` |
| Client Path | `client.revokeOtherSessions()` |
| Category | `Core/RevokeOtherSessions` |
| Schema ID | `$IamClientId.create("core/revoke-other-sessions")` |

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 5. revokeSessions

| Field | Value |
|-------|-------|
| Pattern | **No-payload** |
| mutatesSession | `true` |
| Client Path | `client.revokeSessions()` |
| Category | `Core/RevokeSessions` |
| Schema ID | `$IamClientId.create("core/revoke-sessions")` |

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 6. linkSocial

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.linkSocial(encoded)` |
| Category | `Core/LinkSocial` |
| Schema ID | `$IamClientId.create("core/link-social")` |

**Payload:**
```typescript
{
  provider: S.String,  // e.g., "google", "github"
  callbackURL: S.optional(S.String),
}
```

**Success:**
```typescript
{
  url: S.optional(S.String)  // Redirect URL for OAuth flow
}
```

---

### 7. listAccounts

| Field | Value |
|-------|-------|
| Pattern | **No-payload + Array** |
| mutatesSession | `false` |
| Client Path | `client.listAccounts()` |
| Category | `Core/ListAccounts` |
| Schema ID | `$IamClientId.create("core/list-accounts")` |

**Success:**
```typescript
S.Array(AccountSchema)
// AccountSchema = {
//   id: S.String,
//   providerId: S.String,
//   accountId: S.String,
//   ...
// }
```

**Note:** Define `AccountSchema` in contract or use existing from `_internal/` if available.

---

### 8. unlinkAccount

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.unlinkAccount(encoded)` |
| Category | `Core/UnlinkAccount` |
| Schema ID | `$IamClientId.create("core/unlink-account")` |

**Payload:**
```typescript
{
  providerId: S.String  // e.g., "google", "github"
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 9. isUsernameAvailable (username plugin)

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.username.isUsernameAvailable(encoded)` |
| Category | `Username/IsUsernameAvailable` |
| Schema ID | `$IamClientId.create("username/is-username-available")` |

**Payload:**
```typescript
{
  username: S.String
}
```

**Success:**
```typescript
{
  available: S.Boolean
}
```

---

## Phase 2: Admin Part 1 (7 methods)

### 10. admin.setRole

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.setRole(encoded)` |
| Category | `Admin/SetRole` |
| Schema ID | `$IamClientId.create("admin/set-role")` |

**Payload:**
```typescript
{
  userId: S.String,
  role: S.String  // e.g., "admin", "user"
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 11. admin.createUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.createUser(encoded)` |
| Category | `Admin/CreateUser` |
| Schema ID | `$IamClientId.create("admin/create-user")` |

**Payload:**
```typescript
{
  email: S.String,
  name: S.String,
  password: S.String,
  role?: S.String,
  // Additional fields as needed
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 12. admin.updateUser (admin version)

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.updateUser(encoded)` |
| Category | `Admin/UpdateUser` |
| Schema ID | `$IamClientId.create("admin/update-user")` |

**Payload:**
```typescript
{
  userId: S.String,
  name?: S.String,
  email?: S.String,
  role?: S.String,
  // Additional fields
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 13. admin.listUsers

| Field | Value |
|-------|-------|
| Pattern | **Query-wrapped + Array** |
| mutatesSession | `false` |
| Client Path | `client.admin.listUsers({ query: encoded })` |
| Category | `Admin/ListUsers` |
| Schema ID | `$IamClientId.create("admin/list-users")` |

**Payload:**
```typescript
{
  limit?: S.Number,
  offset?: S.Number,
  sortBy?: S.String,
  sortOrder?: S.Literal("asc", "desc"),
  search?: S.String,
}
```

**Success:**
```typescript
{
  users: S.Array(Common.DomainUserFromBetterAuthUser),
  total?: S.Number
}
```

---

### 14. admin.listUserSessions

| Field | Value |
|-------|-------|
| Pattern | **Query-wrapped + Array** |
| mutatesSession | `false` |
| Client Path | `client.admin.listUserSessions({ query: encoded })` |
| Category | `Admin/ListUserSessions` |
| Schema ID | `$IamClientId.create("admin/list-user-sessions")` |

**Payload:**
```typescript
{
  userId: S.String
}
```

**Success:**
```typescript
S.Array(SessionSchema)  // or { sessions: S.Array(...) }
```

---

### 15. admin.unbanUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.unbanUser(encoded)` |
| Category | `Admin/UnbanUser` |
| Schema ID | `$IamClientId.create("admin/unban-user")` |

**Payload:**
```typescript
{
  userId: S.String
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 16. admin.banUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.banUser(encoded)` |
| Category | `Admin/BanUser` |
| Schema ID | `$IamClientId.create("admin/ban-user")` |

**Payload:**
```typescript
{
  userId: S.String,
  banReason?: S.String,
  banExpiresIn?: S.Number  // Duration in seconds
}
```

**Success:**
```typescript
{
  user: Common.DomainUserFromBetterAuthUser
}
```

---

## Phase 3: Admin Part 2 + SSO + Sign-in (13 methods)

### 17. admin.impersonateUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.admin.impersonateUser(encoded)` |
| Category | `Admin/ImpersonateUser` |
| Schema ID | `$IamClientId.create("admin/impersonate-user")` |

**Payload:**
```typescript
{
  userId: S.String
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 18. admin.stopImpersonating

| Field | Value |
|-------|-------|
| Pattern | **No-payload** |
| mutatesSession | `true` |
| Client Path | `client.admin.stopImpersonating()` |
| Category | `Admin/StopImpersonating` |
| Schema ID | `$IamClientId.create("admin/stop-impersonating")` |

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 19. admin.revokeUserSession

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.revokeUserSession(encoded)` |
| Category | `Admin/RevokeUserSession` |
| Schema ID | `$IamClientId.create("admin/revoke-user-session")` |

**Payload:**
```typescript
{
  sessionToken: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 20. admin.revokeUserSessions

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.revokeUserSessions(encoded)` |
| Category | `Admin/RevokeUserSessions` |
| Schema ID | `$IamClientId.create("admin/revoke-user-sessions")` |

**Payload:**
```typescript
{
  userId: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 21. admin.removeUser

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.removeUser(encoded)` |
| Category | `Admin/RemoveUser` |
| Schema ID | `$IamClientId.create("admin/remove-user")` |

**Payload:**
```typescript
{
  userId: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 22. admin.setUserPassword

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.setUserPassword(encoded)` |
| Category | `Admin/SetUserPassword` |
| Schema ID | `$IamClientId.create("admin/set-user-password")` |

**Payload:**
```typescript
{
  userId: S.String,
  newPassword: S.Redacted(S.String)
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 23. admin.hasPermission

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.admin.hasPermission(encoded)` |
| Category | `Admin/HasPermission` |
| Schema ID | `$IamClientId.create("admin/has-permission")` |

**Payload:**
```typescript
{
  permission: S.String  // or S.Array(S.String)
}
```

**Success:**
```typescript
{
  hasPermission: S.Boolean
}
```

---

### 24. sso.register

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.sso.register(encoded)` |
| Category | `SSO/Register` |
| Schema ID | `$IamClientId.create("sso/register")` |

**Payload:**
```typescript
{
  providerId: S.String,
  issuer: S.String,
  domain: S.String,
  clientId: S.String,
  clientSecret: S.Redacted(S.String),
  // Additional OIDC config
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 25. sso.verifyDomain

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.sso.verifyDomain(encoded)` |
| Category | `SSO/VerifyDomain` |
| Schema ID | `$IamClientId.create("sso/verify-domain")` |

**Payload:**
```typescript
{
  domain: S.String,
  verificationToken: S.String
}
```

**Success:**
```typescript
{
  verified: S.Boolean
}
```

---

### 26. sso.requestDomainVerification

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.sso.requestDomainVerification(encoded)` |
| Category | `SSO/RequestDomainVerification` |
| Schema ID | `$IamClientId.create("sso/request-domain-verification")` |

**Payload:**
```typescript
{
  domain: S.String
}
```

**Success:**
```typescript
{
  verificationToken: S.String,
  txtRecord: S.String
}
```

---

### 27. signIn.sso

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.signIn.sso(encoded)` |
| Category | `SignIn/SSO` |
| Schema ID | `$IamClientId.create("sign-in/sso")` |

**Payload:**
```typescript
{
  organizationId?: S.String,
  callbackURL?: S.String,
}
```

**Success:**
```typescript
{
  url: S.String  // SSO redirect URL
}
```

---

### 28. signIn.passkey

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.signIn.passkey(encoded)` |
| Category | `SignIn/Passkey` |
| Schema ID | `$IamClientId.create("sign-in/passkey")` |

**Payload:**
```typescript
{
  // WebAuthn assertion options will be provided
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 29. signIn.phoneNumber

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.signIn.phoneNumber(encoded)` |
| Category | `SignIn/PhoneNumber` |
| Schema ID | `$IamClientId.create("sign-in/phone-number")` |

**Payload:**
```typescript
{
  phoneNumber: S.String,
  code: S.String  // OTP code
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser
}
```

---

## Phase 4: Passkey + Phone-number + OneTimeToken (10 methods)

### 30. passkey.addPasskey

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.passkey.addPasskey(encoded)` |
| Category | `Passkey/AddPasskey` |
| Schema ID | `$IamClientId.create("passkey/add-passkey")` |

**Payload:**
```typescript
{
  name?: S.String  // Friendly name for the passkey
}
```

**Success:**
```typescript
{
  id: S.String,
  // WebAuthn registration response
}
```

---

### 31. passkey.listUserPasskeys

| Field | Value |
|-------|-------|
| Pattern | **No-payload + Array** |
| mutatesSession | `false` |
| Client Path | `client.passkey.listUserPasskeys()` |
| Category | `Passkey/ListUserPasskeys` |
| Schema ID | `$IamClientId.create("passkey/list-user-passkeys")` |

**Success:**
```typescript
S.Array(PasskeySchema)
// PasskeySchema = { id, name, createdAt, ... }
```

---

### 32. passkey.deletePasskey

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.passkey.deletePasskey(encoded)` |
| Category | `Passkey/DeletePasskey` |
| Schema ID | `$IamClientId.create("passkey/delete-passkey")` |

**Payload:**
```typescript
{
  id: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 33. passkey.updatePasskey

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.passkey.updatePasskey(encoded)` |
| Category | `Passkey/UpdatePasskey` |
| Schema ID | `$IamClientId.create("passkey/update-passkey")` |

**Payload:**
```typescript
{
  id: S.String,
  name: S.String
}
```

**Success:**
```typescript
{
  id: S.String,
  name: S.String,
  // Updated passkey
}
```

---

### 34. phoneNumber.sendOtp

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.phoneNumber.sendOtp(encoded)` |
| Category | `PhoneNumber/SendOtp` |
| Schema ID | `$IamClientId.create("phone-number/send-otp")` |

**Payload:**
```typescript
{
  phoneNumber: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 35. phoneNumber.verify

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.phoneNumber.verify(encoded)` |
| Category | `PhoneNumber/Verify` |
| Schema ID | `$IamClientId.create("phone-number/verify")` |

**Payload:**
```typescript
{
  phoneNumber: S.String,
  code: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 36. phoneNumber.requestPasswordReset

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.phoneNumber.requestPasswordReset(encoded)` |
| Category | `PhoneNumber/RequestPasswordReset` |
| Schema ID | `$IamClientId.create("phone-number/request-password-reset")` |

**Payload:**
```typescript
{
  phoneNumber: S.String
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 37. phoneNumber.resetPassword

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.phoneNumber.resetPassword(encoded)` |
| Category | `PhoneNumber/ResetPassword` |
| Schema ID | `$IamClientId.create("phone-number/reset-password")` |

**Payload:**
```typescript
{
  phoneNumber: S.String,
  code: S.String,
  newPassword: S.Redacted(S.String)
}
```

**Success:**
```typescript
{
  success: S.Boolean
}
```

---

### 38. oneTimeToken.verify

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `true` |
| Client Path | `client.oneTimeToken.verify(encoded)` |
| Category | `OneTimeToken/Verify` |
| Schema ID | `$IamClientId.create("one-time-token/verify")` |

**Payload:**
```typescript
{
  token: S.String
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser
}
```

---

### 39. oneTimeToken.generate

| Field | Value |
|-------|-------|
| Pattern | Standard |
| mutatesSession | `false` |
| Client Path | `client.oneTimeToken.generate(encoded)` |
| Category | `OneTimeToken/Generate` |
| Schema ID | `$IamClientId.create("one-time-token/generate")` |

**Payload:**
```typescript
{
  email: S.String
}
```

**Success:**
```typescript
{
  token: S.String
}
```

---

## Phase 5: OAuth-provider + Device + JWT + Misc Sign-in (22 methods)

### 40-52. oauth2.* Methods

**See Better Auth oauth-provider plugin documentation for exact schemas.**

| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| oauth2.getClient | `client.oauth2.getClient({ query })` | `false` |
| oauth2.publicClient | `client.oauth2.publicClient(encoded)` | `false` |
| oauth2.getClients | `client.oauth2.getClients()` | `false` |
| oauth2.updateClient | `client.oauth2.updateClient(encoded)` | `false` |
| oauth2.client.rotateSecret | `client.oauth2.client.rotateSecret(encoded)` | `false` |
| oauth2.deleteClient | `client.oauth2.deleteClient(encoded)` | `false` |
| oauth2.getConsent | `client.oauth2.getConsent({ query })` | `false` |
| oauth2.getConsents | `client.oauth2.getConsents()` | `false` |
| oauth2.updateConsent | `client.oauth2.updateConsent(encoded)` | `false` |
| oauth2.deleteConsent | `client.oauth2.deleteConsent(encoded)` | `false` |
| oauth2.register | `client.oauth2.register(encoded)` | `false` |
| oauth2.consent | `client.oauth2.consent(encoded)` | `false` |
| oauth2.continue | `client.oauth2.continue(encoded)` | `false` |

---

### 53-56. device.* Methods

| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| device.code | `client.device.code(encoded)` | `false` |
| device.token | `client.device.token(encoded)` | `false` |
| device.approve | `client.device.approve(encoded)` | `true` |
| device.deny | `client.device.deny(encoded)` | `true` |

---

### 57. jwks

| Field | Value |
|-------|-------|
| Pattern | **No-payload** |
| mutatesSession | `false` |
| Client Path | `client.jwks()` |
| Category | `JWT/JWKS` |

---

### 58-61. Additional Sign-in Methods

| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| signIn.social | `client.signIn.social(encoded)` | `true` |
| signIn.oauth2 | `client.signIn.oauth2(encoded)` | `true` |
| signIn.anonymous | `client.signIn.anonymous()` | `true` |
| oauth2.link | `client.oauth2.link(encoded)` | `true` |

---

## Phase 6: Organization + API-key + Remaining (30 methods)

### 62-85. Organization Methods

| Method | Pattern | Client Path | mutatesSession |
|--------|---------|-------------|----------------|
| checkSlug | Standard | `client.organization.checkSlug({ query })` | `false` |
| getInvitation | Standard | `client.organization.getInvitation({ query })` | `false` |
| listUserInvitations | Query-wrapped | `client.organization.listUserInvitations({ query })` | `false` |
| getActiveMember | No-payload | `client.organization.getActiveMember()` | `false` |
| getActiveMemberRole | No-payload | `client.organization.getActiveMemberRole()` | `false` |
| addMember | Standard | `client.organization.addMember(encoded)` | `true` |
| leave | No-payload | `client.organization.leave()` | `true` |
| checkRolePermission | Standard | `client.organization.checkRolePermission(encoded)` | `false` |
| createRole | Standard | `client.organization.createRole(encoded)` | `true` |
| deleteRole | Standard | `client.organization.deleteRole(encoded)` | `true` |
| listRoles | Query-wrapped | `client.organization.listRoles({ query })` | `false` |
| getRole | Standard | `client.organization.getRole({ query })` | `false` |
| updateRole | Standard | `client.organization.updateRole(encoded)` | `true` |
| createTeam | Standard | `client.organization.createTeam(encoded)` | `true` |
| listTeams | Query-wrapped | `client.organization.listTeams({ query })` | `false` |
| updateTeam | Standard | `client.organization.updateTeam(encoded)` | `true` |
| removeTeam | Standard | `client.organization.removeTeam(encoded)` | `true` |
| setActiveTeam | Standard | `client.organization.setActiveTeam(encoded)` | `true` |
| listUserTeams | Query-wrapped | `client.organization.listUserTeams({ query })` | `false` |
| addTeamMember | Standard | `client.organization.addTeamMember(encoded)` | `true` |
| removeTeamMember | Standard | `client.organization.removeTeamMember(encoded)` | `true` |
| scim.generateToken | Standard | `client.scim.generateToken(encoded)` | `false` |
| deleteAnonymousUser | No-payload | `client.deleteAnonymousUser()` | `true` |

---

### 86-90. API-key Methods

| Method | Pattern | Client Path | mutatesSession |
|--------|---------|-------------|----------------|
| apiKey.create | Standard | `client.apiKey.create(encoded)` | `false` |
| apiKey.get | Standard | `client.apiKey.get({ query })` | `false` |
| apiKey.update | Standard | `client.apiKey.update(encoded)` | `false` |
| apiKey.delete | Standard | `client.apiKey.delete(encoded)` | `false` |
| apiKey.list | No-payload | `client.apiKey.list()` | `false` |

---

## Pattern Summary Statistics

| Pattern | Count | Percentage |
|---------|-------|------------|
| Standard (with payload) | ~55 | 61% |
| No-payload | ~15 | 17% |
| Query-wrapped | ~12 | 13% |
| Array response | ~10 | 11% |
| Transform | ~3 | 3% |
| With Captcha | ~6 | 7% |

**Note:** Categories overlap (e.g., Query-wrapped often has Array response).

---

## Quick Reference: Handler Templates

### Standard Handler

```typescript
// handler.ts
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })((encoded) => client.[category].[method](encoded))
);
```

### No-Payload Handler

```typescript
// handler.ts
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })(() => client.[category].[method]())
);
```

### Query-Wrapped Handler

```typescript
// handler.ts
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.[category].[method]({ query: encoded }))
);
```

---

## Notes

1. **Research Required**: Always verify exact payload/response schemas from Better Auth documentation before implementation.

2. **Schema Validation**: Use `S.decodeUnknown` with actual API responses to validate schemas during development.

3. **Sensitive Fields**: Use `S.Redacted(S.String)` for passwords, tokens, and secrets.

4. **ID Validation**: User/Session/Organization IDs should use branded ID schemas from `@beep/shared-domain`.

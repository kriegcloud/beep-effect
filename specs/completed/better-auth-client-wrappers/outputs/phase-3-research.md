# Phase 3 Research: Admin Part 2 + SSO + Sign-in (13 methods)

> Research completed 2026-01-22

---

## Method 17: admin.impersonateUser

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
  userId: S.String,  // Required - user to impersonate
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
}
```

**Notes:** Returns session + user for impersonated account. Mutates current session.

---

## Method 18: admin.stopImpersonating

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
  user: Common.DomainUserFromBetterAuthUser,
}
```

**Notes:** No payload required. Returns admin account session after stopping impersonation.

---

## Method 19: admin.revokeUserSession

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
  sessionToken: S.String,  // Required - specific session token to revoke
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Admin operation to revoke a specific session by token.

---

## Method 20: admin.revokeUserSessions

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
  userId: S.String,  // Required - user whose sessions to revoke
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Revokes ALL sessions for a specific user.

---

## Method 21: admin.removeUser

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
  userId: S.String,  // Required - user to remove
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Permanently removes a user from the system.

---

## Method 22: admin.setUserPassword

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
  userId: S.String,  // Required - user whose password to set
  newPassword: S.String,  // Plain string - Better Auth expects unwrapped
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Better Auth expects plain string for newPassword, not Redacted. However, we use `S.Redacted(S.String)` in contract for logging safety - wrapIamMethod unwraps it.

---

## Method 23: admin.hasPermission

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
  userId: S.optional(S.String),  // Optional - defaults to current user
  role: S.optional(S.String),  // Optional - role to check
  permission: S.optional(S.Record({ key: S.String, value: S.Array(S.String) })),  // Permission map
}
```

**Success:**
```typescript
{
  hasPermission: S.Boolean,
}
```

**Notes:** Checks if a user/role has specific permissions. All fields optional per docs.

---

## Method 24: sso.register

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
  providerId: S.String,  // Required - unique provider ID
  issuer: S.String,  // Required - OIDC issuer URL
  domain: S.String,  // Required - provider domain
  oidcConfig: S.optional(S.Struct({
    clientId: S.String,
    clientSecret: S.Redacted(S.String),  // Sensitive
    authorizationEndpoint: S.optional(S.String),
    tokenEndpoint: S.optional(S.String),
    jwksEndpoint: S.optional(S.String),
    discoveryEndpoint: S.optional(S.String),
    scopes: S.optional(S.Array(S.String)),
    pkce: S.optional(S.Boolean),
  })),
  samlConfig: S.optional(S.Struct({
    entryPoint: S.String,
    cert: S.String,
    callbackUrl: S.String,
    audience: S.String,
    wantAssertionsSigned: S.optional(S.Boolean),
    signatureAlgorithm: S.optional(S.String),
    digestAlgorithm: S.optional(S.String),
  })),
  organizationId: S.optional(S.String),
}
```

**Success:**
```typescript
{
  providerId: S.String,
  domain: S.String,
  verificationToken: S.optional(S.String),  // If domain verification enabled
}
```

**Notes:** Complex payload with OIDC and SAML config options. clientSecret is sensitive.

---

## Method 25: sso.verifyDomain

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
  providerId: S.String,  // Required - provider to verify
}
```

**Success:**
```typescript
{
  verified: S.Boolean,
}
```

**Notes:** Verifies domain ownership for SSO provider.

---

## Method 26: sso.requestDomainVerification

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
  providerId: S.String,  // Required - provider for new token
}
```

**Success:**
```typescript
{
  verificationToken: S.String,
  txtRecord: S.String,
}
```

**Notes:** Request a new verification token when previous expires (1 week expiry).

---

## Method 27: signIn.sso

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
  email: S.optional(S.String),  // Email for provider identification
  organizationSlug: S.optional(S.String),
  providerId: S.optional(S.String),
  domain: S.optional(S.String),
  callbackURL: S.String,  // Required - redirect after login
  errorCallbackURL: S.optional(S.String),
  newUserCallbackURL: S.optional(S.String),
  scopes: S.optional(S.Array(S.String)),
  loginHint: S.optional(S.String),
  requestSignUp: S.optional(S.Boolean),
}
```

**Success:**
```typescript
{
  url: S.String,  // SSO redirect URL
}
```

**Notes:** Redirect-based flow. Returns URL for SSO provider authorization.

---

## Method 28: signIn.passkey

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
  autoFill: S.optional(S.Boolean),  // Default: true - enables conditional UI
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
}
```

**Notes:** WebAuthn passkey authentication. Browser handles credential selection. Always returns data object (never throws).

---

## Method 29: signIn.phoneNumber

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
  phoneNumber: S.String,  // Required - e.g., "+1234567890"
  password: S.Redacted(S.String),  // Required - user password
  rememberMe: S.optional(S.Boolean),  // Default: true
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
}
```

**Notes:** Phone number + password authentication. Password is sensitive.

---

## Summary

| # | Method | Pattern | mutatesSession | Special |
|---|--------|---------|----------------|---------|
| 17 | admin.impersonateUser | Standard | `true` | Session+User response |
| 18 | admin.stopImpersonating | **No-payload** | `true` | Session+User response |
| 19 | admin.revokeUserSession | Standard | `false` | sessionToken param |
| 20 | admin.revokeUserSessions | Standard | `false` | userId param |
| 21 | admin.removeUser | Standard | `false` | userId param |
| 22 | admin.setUserPassword | Standard | `false` | Sensitive newPassword |
| 23 | admin.hasPermission | Standard | `false` | All fields optional |
| 24 | sso.register | Standard | `false` | Complex OIDC/SAML config |
| 25 | sso.verifyDomain | Standard | `false` | providerId only |
| 26 | sso.requestDomainVerification | Standard | `false` | Returns token |
| 27 | signIn.sso | Standard | `true` | Returns redirect URL |
| 28 | signIn.passkey | Standard | `true` | WebAuthn, autoFill option |
| 29 | signIn.phoneNumber | Standard | `true` | Password + phone |

## Implementation Notes

- **No-payload**: Only `stopImpersonating` has no payload - use `() => client.admin.stopImpersonating()`
- **Session-mutating**: All impersonation and sign-in methods mutate session state
- **Sensitive fields**: `newPassword` (setUserPassword), `password` (signIn.phoneNumber), `clientSecret` (sso.register)
- **SSO is new category**: Needs full layer/mod/index setup

## Sources

- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Better Auth SSO Plugin](https://www.better-auth.com/docs/plugins/sso)
- [Better Auth Passkey Plugin](https://www.better-auth.com/docs/plugins/passkey)
- [Better Auth Phone Number Plugin](https://www.better-auth.com/docs/plugins/phone-number)

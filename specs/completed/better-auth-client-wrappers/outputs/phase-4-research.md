# Phase 4 Research: Passkey + Phone-number + OneTimeToken (10 methods)

> Research completed 2026-01-22

---

## Method 30: passkey.addPasskey

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
  name: S.optional(S.String),  // Optional friendly name for the passkey
  authenticatorAttachment: S.optional(S.Literal("platform", "cross-platform")),  // Default: "cross-platform"
}
```

**Success:**
```typescript
{
  id: S.String,
  name: S.optionalWith(S.String, { nullable: true }),
  publicKey: S.String,
  userId: S.String,
  webauthnUserID: S.String,
  counter: S.Number,
  deviceType: S.String,
  backedUp: S.Boolean,
  transports: S.optionalWith(S.String, { nullable: true }),
  createdAt: BS.DateFromAllAcceptable,
}
```

**Notes:** WebAuthn registration flow. Browser handles credential creation. Response includes passkey metadata.

---

## Method 31: passkey.listUserPasskeys

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
// PasskeySchema = {
//   id: S.String,
//   name: S.optionalWith(S.String, { nullable: true }),
//   publicKey: S.String,
//   userId: S.String,
//   webauthnUserID: S.String,
//   counter: S.Number,
//   deviceType: S.String,
//   backedUp: S.Boolean,
//   transports: S.optionalWith(S.String, { nullable: true }),
//   createdAt: BS.DateFromAllAcceptable,
// }
```

**Notes:** No payload required. Returns array of passkeys for current user.

---

## Method 32: passkey.deletePasskey

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
  id: S.String,  // Required - passkey ID to delete
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Permanently removes a passkey from user account.

---

## Method 33: passkey.updatePasskey

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
  id: S.String,  // Required - passkey ID to update
  name: S.String,  // Required - new display name
}
```

**Success:**
```typescript
{
  id: S.String,
  name: S.String,
  publicKey: S.String,
  userId: S.String,
  webauthnUserID: S.String,
  counter: S.Number,
  deviceType: S.String,
  backedUp: S.Boolean,
  transports: S.optionalWith(S.String, { nullable: true }),
  createdAt: BS.DateFromAllAcceptable,
}
```

**Notes:** Updates the friendly name of an existing passkey.

---

## Method 34: phoneNumber.sendOtp

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
  phoneNumber: S.String,  // Required - e.g., "+1234567890"
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Sends OTP to specified phone number for verification.

---

## Method 35: phoneNumber.verify

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
  phoneNumber: S.String,  // Required - e.g., "+1234567890"
  code: S.String,  // Required - OTP code received (Note: string, not number)
  disableSession: S.optional(S.Boolean),  // Default: false
  updatePhoneNumber: S.optional(S.Boolean),  // Default: true
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Verifies phone with OTP code. Can optionally create session or update user's phone number.

---

## Method 36: phoneNumber.requestPasswordReset

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
  phoneNumber: S.String,  // Required - e.g., "+1234567890"
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Sends OTP for phone-based password reset flow.

---

## Method 37: phoneNumber.resetPassword

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
  phoneNumber: S.String,  // Required - e.g., "+1234567890"
  code: S.String,  // Required - OTP code received
  newPassword: S.Redacted(S.String),  // Sensitive - new password
}
```

**Success:**
```typescript
{
  success: S.Boolean,
}
```

**Notes:** Completes phone-based password reset. newPassword is sensitive.

---

## Method 38: oneTimeToken.verify

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
  token: S.String,  // Required - the one-time token to verify
}
```

**Success:**
```typescript
{
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
}
```

**Notes:** Verifies and consumes one-time token, returns session. Mutates session state.

---

## Method 39: oneTimeToken.generate

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
  email: S.String,  // Required - email for token generation
}
```

**Success:**
```typescript
{
  token: S.String,  // Single-use token valid for 3 minutes
}
```

**Notes:** Generates one-time token for the specified email address.

---

## Summary

| # | Method | Pattern | mutatesSession | Special |
|---|--------|---------|----------------|---------|
| 30 | passkey.addPasskey | Standard | `false` | WebAuthn registration |
| 31 | passkey.listUserPasskeys | **No-payload** | `false` | Array response |
| 32 | passkey.deletePasskey | Standard | `false` | id param |
| 33 | passkey.updatePasskey | Standard | `false` | id + name params |
| 34 | phoneNumber.sendOtp | Standard | `false` | phoneNumber param |
| 35 | phoneNumber.verify | Standard | `false` | code as string |
| 36 | phoneNumber.requestPasswordReset | Standard | `false` | phoneNumber param |
| 37 | phoneNumber.resetPassword | Standard | `false` | Sensitive newPassword |
| 38 | oneTimeToken.verify | Standard | `true` | Session response |
| 39 | oneTimeToken.generate | Standard | `false` | email param |

## Implementation Notes

- **No-payload**: Only `listUserPasskeys` has no payload - use `() => client.passkey.listUserPasskeys()`
- **Session-mutating**: Only `oneTimeToken.verify` mutates session state
- **Sensitive fields**: `newPassword` (resetPassword) - use `S.Redacted(S.String)`
- **Three new categories**: All need full layer/mod/index setup (passkey, phone-number, one-time-token)
- **Passkey schema**: Define reusable `Passkey` schema for list/add/update responses

## Sources

- [Better Auth Passkey Plugin](https://www.better-auth.com/docs/plugins/passkey)
- [Better Auth Phone Number Plugin](https://www.better-auth.com/docs/plugins/phone-number)
- [Better Auth One Time Token Plugin](https://www.better-auth.com/docs/plugins/one-time-token)

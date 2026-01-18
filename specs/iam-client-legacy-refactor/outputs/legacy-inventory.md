# Legacy Handler Inventory — Phase 1 Discovery

> Complete inventory of all legacy handlers in `@beep/iam-client` requiring migration to canonical patterns.

---

## Summary

| Module | Handlers | Mutates Session | Has Payload | Pattern Needed |
|--------|----------|-----------------|-------------|----------------|
| `email-verification` | 1 | 0 | 1 | Simple |
| `multi-session` | 3 | 2 | 2 | Simple |
| `password` | 3 | 1 | 3 | Simple (needs form) |
| `two-factor` | 8 | 4 | 8 | Simple (needs form for some) |
| `organization` | 15 | 1 | 13 | Simple |

**Total**: 30 handlers across 5 modules

---

## Module Analysis

### 1. email-verification (1 handler)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| send-verification | ✅ | ❌ | `client.sendVerificationEmail` | Simple |

#### Handler Details

**send-verification**
- **Current Files**: `send-verification.contract.ts`, `send-verification.handler.ts`
- **Target Files**: `contract.ts`, `handler.ts`, `mod.ts`, `index.ts`
- **Payload Fields**: `email: S.String`, `callbackURL: S.optional(S.String)`
- **Success Fields**: `status: S.Boolean`
- **No Wrapper**: Missing `W.Wrapper.make()`
- **Form Needed**: ❌ (email link triggered)

**Module-Level Files Needed**:
- `layer.ts` (single wrapper)
- `service.ts` (Effect.Service + runtime)
- `atoms.ts` (simple atom hooks)
- `mod.ts` (barrel exports)
- `index.ts` (namespace export)

---

### 2. multi-session (3 handlers)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| list-sessions | ❌ | ❌ | `client.multiSession.listDeviceSessions({})` | Simple (no-payload) |
| revoke | ✅ | ✅ | `client.multiSession.revoke` | Simple |
| set-active | ✅ | ✅ | `client.multiSession.setActive` | Simple |

#### Handler Details

**list-sessions**
- **Current Files**: `list-sessions.contract.ts`, `list-sessions.handler.ts`
- **Payload Fields**: None (no-payload handler)
- **Success Fields**: `S.Array(Session)` where Session has: `id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt`
- **Note**: Uses `S.Date` for date fields (Better Auth returns Date objects)
- **Form Needed**: ❌ (programmatic)

**revoke**
- **Current Files**: `revoke.contract.ts`, `revoke.handler.ts`
- **Payload Fields**: `sessionToken: S.String`
- **Success Fields**: `status: S.Boolean`
- **Form Needed**: ❌ (programmatic button click)

**set-active**
- **Current Files**: `set-active.contract.ts`, `set-active.handler.ts`
- **Payload Fields**: `sessionToken: S.String`
- **Success Fields**: `status: S.Boolean`
- **Form Needed**: ❌ (programmatic button click)

**Module-Level Files Needed**:
- `layer.ts` (WrapperGroup with 3 wrappers)
- `service.ts` (Effect.Service + runtime)
- `atoms.ts` (simple atom hooks)
- `mod.ts` (barrel exports)
- `index.ts` (namespace export)

---

### 3. password (3 handlers)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| change | ✅ | ✅ | `client.changePassword` | Simple |
| request-reset | ✅ | ❌ | `client.requestPasswordReset` | Simple |
| reset | ✅ | ❌ | `client.resetPassword` | Simple |

#### Handler Details

**change**
- **Current Files**: `change.contract.ts`, `change.handler.ts`
- **Payload Fields**: `currentPassword: S.String`, `newPassword: S.String`, `revokeOtherSessions: S.optional(S.Boolean)`
- **Success Fields**: `token: S.NullOr(S.String)`, `user: User`
- **Custom User Schema**: Local `User` class defined (should use `Common.DomainUserFromBetterAuthUser`)
- **Form Needed**: ✅ (password change form)
- **Migration Note**: Password fields should use `S.Redacted(S.String)` or `Common.UserPassword`

**request-reset**
- **Current Files**: `request-reset.contract.ts`, `request-reset.handler.ts`
- **Payload Fields**: `email: S.String`, `redirectTo: S.optional(S.String)`
- **Success Fields**: `status: S.Boolean`, `message: S.String`
- **Form Needed**: ✅ (forgot password form)

**reset**
- **Current Files**: `reset.contract.ts`, `reset.handler.ts`
- **Payload Fields**: `newPassword: S.String`, `token: S.String`
- **Success Fields**: `status: S.Boolean`
- **Form Needed**: ✅ (reset password form - triggered by email link)

**Module-Level Files Needed**:
- `layer.ts` (WrapperGroup with 3 wrappers)
- `service.ts` (Effect.Service + runtime)
- `atoms.ts` (atom hooks)
- `form.ts` (change, request-reset, reset forms)
- `mod.ts` (barrel exports)
- `index.ts` (namespace export)

---

### 4. two-factor (8 handlers)

Organized into sub-modules: `backup/`, `otp/`, `totp/`, and root-level `enable/`, `disable/`.

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| enable | ✅ | ❌ | `client.twoFactor.enable` | Simple |
| disable | ✅ | ✅ | `client.twoFactor.disable` | Simple |
| backup/generate | ✅ | ❌ | `client.twoFactor.generateBackupCodes` | Simple |
| backup/verify | ✅ | ✅ | `client.twoFactor.verifyBackupCode` | Simple |
| otp/send | ✅ | ❌ | `client.twoFactor.sendOtp` | Simple |
| otp/verify | ✅ | ✅ | `client.twoFactor.verifyOtp` | Simple |
| totp/get-uri | ✅ | ❌ | `client.twoFactor.getTotpUri` | Simple |
| totp/verify | ✅ | ✅ | `client.twoFactor.verifyTotp` | Simple |

#### Handler Details

**enable**
- **Payload Fields**: `password: S.Redacted(S.String)`, `issuer: S.optional(S.String)`
- **Success Fields**: `totpURI: S.String`, `backupCodes: S.Array(S.String)`
- **Form Needed**: ✅ (password confirmation form)

**disable**
- **Payload Fields**: `password: S.Redacted(S.String)`
- **Success Fields**: `status: S.Boolean`
- **Form Needed**: ✅ (password confirmation form)

**backup/generate**
- **Payload Fields**: `password: S.Redacted(S.String)`
- **Success Fields**: `status: S.Boolean`, `backupCodes: S.Array(S.String)`
- **Form Needed**: ✅ (password confirmation form)

**backup/verify**
- **Payload Fields**: `code: S.String`, `trustDevice: S.optional(S.Boolean)`, `disableSession: S.optional(S.Boolean)`
- **Success Fields**: `token: S.optional(S.String)`, `user: TwoFactorUser`
- **Shared Schema**: Uses `TwoFactorUser` from `_common/user.schema.ts`
- **Form Needed**: ✅ (backup code entry form)

**otp/send**
- **Payload Fields**: `trustDevice: S.optional(S.Boolean)`
- **Success Fields**: `status: S.Boolean`
- **Form Needed**: ❌ (button click)

**otp/verify**
- **Payload Fields**: `code: S.String`, `trustDevice: S.optional(S.Boolean)`
- **Success Fields**: `token: S.String`, `user: TwoFactorUser`
- **Form Needed**: ✅ (OTP code entry form)

**totp/get-uri**
- **Payload Fields**: `password: S.Redacted(S.String)`
- **Success Fields**: `totpURI: S.String`
- **Form Needed**: ✅ (password confirmation form)

**totp/verify**
- **Payload Fields**: `code: S.String`, `trustDevice: S.optional(S.Boolean)`
- **Success Fields**: `token: S.String`, `user: TwoFactorUser`
- **Form Needed**: ✅ (TOTP code entry form)

**Module-Level Files Needed**:
- `layer.ts` (WrapperGroup with all 8 wrappers)
- `service.ts` (Effect.Service + runtime)
- `atoms.ts` (atom hooks)
- `form.ts` (enable, disable, backup-generate, backup-verify, totp-get-uri, totp-verify, otp-verify forms)
- `mod.ts` (barrel exports)
- `index.ts` (namespace export)

**Shared Schemas**:
- `_common/user.schema.ts` - `TwoFactorUser` class (should be moved to module-level or consolidated)

---

### 5. organization (15 handlers)

Organized into sub-modules: `crud/`, `invitations/`, `members/`.

#### CRUD Operations (6 handlers)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| crud/create | ✅ | ❌ | `client.organization.create` | Simple |
| crud/delete | ✅ | ❌ | `client.organization.delete` | Simple |
| crud/get-full | ✅ | ❌ | `client.organization.getFullOrganization` | Simple |
| crud/list | ❌ | ❌ | `client.organization.list` | Simple (no-payload) |
| crud/set-active | ✅ | ✅ | `client.organization.setActive` | Simple |
| crud/update | ✅ | ❌ | `client.organization.update` | Simple |

#### Invitation Operations (5 handlers)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| invitations/accept | ✅ | ❌ | `client.organization.acceptInvitation` | Simple |
| invitations/cancel | ✅ | ❌ | `client.organization.cancelInvitation` | Simple |
| invitations/create | ✅ | ❌ | `client.organization.inviteMember` | Simple |
| invitations/list | ✅ | ❌ | `client.organization.listInvitations` | Simple |
| invitations/reject | ✅ | ❌ | `client.organization.rejectInvitation` | Simple |

#### Member Operations (4 handlers)

| Feature | Has Payload | Mutates Session | Better Auth Method | Pattern |
|---------|-------------|-----------------|-------------------|---------|
| members/list | ✅ | ❌ | `client.organization.listMembers` | Simple |
| members/remove | ✅ | ❌ | `client.organization.removeMember` | Simple |
| members/update-role | ✅ | ❌ | `client.organization.updateMemberRole` | Simple |

**Note**: Missing `members/leave` handler (user leaving org) - may need to add.

#### Shared Schemas in `_common/`:

- `organization.schema.ts` - `Organization`, `EmbeddedUser`
- `full-organization.schema.ts` - `FullOrganization` (with members)
- `member.schema.ts` - `Member`, `FullMember`
- `invitation.schema.ts` - `Invitation`
- `index.ts` - re-exports all schemas

**Module-Level Files Needed**:
- `layer.ts` (WrapperGroup with all 15 wrappers - may need to split by sub-module)
- `service.ts` (Effect.Service + runtime)
- `atoms.ts` (atom hooks)
- `form.ts` (create org, update org, invite member, update role forms)
- `mod.ts` (barrel exports)
- `index.ts` (namespace export)

**Known Issue**: `organization/crud/create/create.handler.ts` has a type error - passing `Boolean(encoded.isPersonal)` which should just be `encoded.isPersonal` with proper typing.

---

## Migration Patterns Analysis

### Simple Pattern (All 30 Handlers)

All legacy handlers can use the **Simple Pattern**:
- Fields map 1:1 to Better Auth API
- No computed fields required
- No password confirmation with mismatch validation

### No Transform Pattern Needed

Unlike `sign-up/email` which requires `PayloadFrom` → `Payload` transform for computed `name` field, none of the legacy handlers have computed fields.

### Middleware Requirements

| Handler | Middleware Needed |
|---------|------------------|
| All handlers | `Common.IamError` for error schema |
| None identified | `Common.CaptchaMiddleware` (no captcha for these operations) |

---

## File Renaming Required

Each handler requires file renaming:

| Current | Target |
|---------|--------|
| `{feature}.contract.ts` | `contract.ts` |
| `{feature}.handler.ts` | `handler.ts` |
| (add) | `mod.ts` |
| (keep) | `index.ts` (update to namespace export) |

---

## Schema Migration Notes

### Password Fields

Current legacy handlers use `S.String` for password fields. Should migrate to:
- `S.Redacted(S.String)` for sensitive password fields
- Or use `Common.UserPassword` if available

Affected handlers:
- `password/change` - `currentPassword`, `newPassword`
- `password/reset` - `newPassword`
- `two-factor/enable` - already uses `S.Redacted(S.String)` ✓
- `two-factor/disable` - already uses `S.Redacted(S.String)` ✓
- `two-factor/backup/generate` - already uses `S.Redacted(S.String)` ✓
- `two-factor/totp/get-uri` - already uses `S.Redacted(S.String)` ✓

### Date Fields

- `two-factor/_common/user.schema.ts` - Uses `S.DateFromString` (correct for API responses)
- `multi-session/list-sessions` - Uses `S.Date` (Better Auth client returns Date objects)

Verify Better Auth client response types to ensure correct date schema.

### Success Schemas

Many handlers use `S.Class` correctly. Some use raw schemas:
- `organization/crud/list` - `S.Array(Organization)` (not wrapped in class)
- `multi-session/list-sessions` - `S.Array(Session)` (not wrapped in class)

Consider whether to wrap in `Success` class for consistency.

---

## Form Requirements Summary

| Module | Forms Needed |
|--------|--------------|
| `email-verification` | ❌ |
| `multi-session` | ❌ |
| `password` | ✅ change, request-reset, reset |
| `two-factor` | ✅ enable, disable, backup-generate, backup-verify, otp-verify, totp-get-uri, totp-verify |
| `organization` | ✅ create, update, invite-member, update-role |

---

## Recommended Migration Order

1. **email-verification** (1 handler) - Simplest, validate patterns
2. **multi-session** (3 handlers) - Simple, no forms, good for testing WrapperGroup
3. **password** (3 handlers) - Introduces form.ts pattern
4. **two-factor** (8 handlers) - Complex structure, multiple sub-modules
5. **organization** (15 handlers) - Most complex, multiple sub-modules, shared schemas

---

## Session Mutation Summary

Handlers that mutate session (require `$sessionSignal` notification):

| Module | Handler | Why |
|--------|---------|-----|
| multi-session | revoke | Removes a session |
| multi-session | set-active | Switches active session |
| password | change | May revoke other sessions |
| two-factor | disable | Changes user 2FA state |
| two-factor | backup/verify | Creates session after 2FA |
| two-factor | otp/verify | Creates session after 2FA |
| two-factor | totp/verify | Creates session after 2FA |
| organization | crud/set-active | Changes active organization context |

**Total**: 8 handlers mutate session

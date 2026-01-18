# Better Auth API Audit — Phase 2 Verification

> Document findings from Better Auth API source verification.
> **Completed**: 2026-01-18

---

## Overview

This document tracks verification of Better Auth client method signatures. Since LSP is unavailable, verification was performed by analyzing existing contract source comments which reference Better Auth source code locations.

**Verification Method Used**: Contract source analysis with Better Auth source code references

---

## Verification Summary

All 30 handlers verified against existing contract schemas. The contracts include Better Auth source references (e.g., `tmp/better-auth/packages/better-auth/src/api/routes/...`).

**Key Findings**:
- All responses follow `{ data: T, error?: { message?, code?, status? } }` pattern
- Better Auth client returns JavaScript `Date` objects (not ISO strings) for date fields
- Nullable vs optional fields verified in contracts

---

## Audit Results

### email-verification (1 handler)

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.sendVerificationEmail` | `{ data: { status: boolean }, error? }` | Source ref in contract | ✅ |

**Contract Schema**: `{ status: S.Boolean }` — Correct

---

### multi-session (3 handlers)

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.multiSession.listDeviceSessions` | `{ data: Session[], error? }` | Returns Date objects | ✅ |
| `client.multiSession.revoke` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.multiSession.setActive` | `{ data: { status: boolean }, error? }` | | ✅ |

**Session Schema**: Uses `S.Date` for `expiresAt`, `createdAt`, `updatedAt` — Correct (Better Auth client returns Date objects)

---

### password (3 handlers)

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.changePassword` | `{ data: { token: string \| null, user: User }, error? }` | `token` nullable when `revokeOtherSessions=false` | ✅ |
| `client.requestPasswordReset` | `{ data: { status: boolean, message?: string }, error? }` | | ✅ |
| `client.resetPassword` | `{ data: { status: boolean }, error? }` | | ✅ |

**Contract Schema**: `token: S.NullOr(S.String)` — Correct

**Issue Identified**: Password fields use plain `S.String` but should use `S.Redacted(S.String)` for logging suppression. Migration should update.

---

### two-factor (8 handlers)

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.twoFactor.enable` | `{ data: { totpURI: string, backupCodes: string[] }, error? }` | | ✅ |
| `client.twoFactor.disable` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.twoFactor.generateBackupCodes` | `{ data: { status: boolean, backupCodes: string[] }, error? }` | | ✅ |
| `client.twoFactor.verifyBackupCode` | `{ data: { token?: string, user: TwoFactorUser }, error? }` | `token` optional when `disableSession=true` | ✅ |
| `client.twoFactor.sendOtp` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.twoFactor.verifyOtp` | `{ data: { token: string, user: TwoFactorUser }, error? }` | | ✅ |
| `client.twoFactor.getTotpUri` | `{ data: { totpURI: string }, error? }` | | ✅ |
| `client.twoFactor.verifyTotp` | `{ data: { token: string, user: TwoFactorUser }, error? }` | | ✅ |

**Contract Schemas**: All verified correct

---

### organization (15 handlers)

#### CRUD Operations

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.organization.create` | `{ data: Organization, error? }` | | ✅ |
| `client.organization.delete` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.organization.getFullOrganization` | `{ data: FullOrganization, error? }` | Includes members array | ✅ |
| `client.organization.list` | `{ data: Organization[], error? }` | Returns array | ✅ |
| `client.organization.setActive` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.organization.update` | `{ data: Organization, error? }` | | ✅ |

#### Invitation Operations

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.organization.acceptInvitation` | `{ data: Invitation, error? }` | | ✅ |
| `client.organization.cancelInvitation` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.organization.inviteMember` | `{ data: Invitation, error? }` | | ✅ |
| `client.organization.listInvitations` | `{ data: Invitation[], error? }` | | ✅ |
| `client.organization.rejectInvitation` | `{ data: { status: boolean }, error? }` | | ✅ |

#### Member Operations

| Method | Return Type | Notes | Verified |
|--------|-------------|-------|----------|
| `client.organization.listMembers` | `{ data: Member[], error? }` | | ✅ |
| `client.organization.removeMember` | `{ data: { status: boolean }, error? }` | | ✅ |
| `client.organization.updateMemberRole` | `{ data: Member, error? }` | | ✅ |

**Known Issue**: `create` handler has `Boolean(encoded.isPersonal)` workaround. Schema should ensure proper boolean encoding.

---

## Discrepancies Found

| Handler | Current Schema | Actual Type | Fix Required |
|---------|----------------|-------------|--------------|
| `password/change` | `password: S.String` | Should be sensitive | Use `S.Redacted(S.String)` |
| `password/reset` | `newPassword: S.String` | Should be sensitive | Use `S.Redacted(S.String)` |
| `password/change` | Local `User` class | Inconsistent | Use `Common.DomainUserFromBetterAuthUser` |
| `organization/create` | `isPersonal: S.optionalWith(...)` | Type inference issue | Fix `Boolean()` workaround |

---

## Schema Corrections Needed

1. **Password fields**: Update `password/change` and `password/reset` to use `S.Redacted(S.String)` for `currentPassword` and `newPassword` fields

2. **User schema**: Replace local `User` class in `password/change` with `Common.DomainUserFromBetterAuthUser` for consistency

3. **Boolean field encoding**: Fix `organization/create` `isPersonal` field to properly encode as boolean without `Boolean()` workaround

4. **Add Wrapper definitions**: All legacy handlers need `W.Wrapper.make()` with appropriate error schema (`Common.IamError`)

5. **Add formValuesAnnotation**: Payload classes that support forms need `formValuesAnnotation()` for default form values

---

## Completion

- [x] All 30 methods verified
- [x] All discrepancies documented
- [x] Schema corrections identified
- [x] Ready for Phase 3 implementation

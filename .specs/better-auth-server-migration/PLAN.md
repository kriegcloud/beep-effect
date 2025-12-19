# Better Auth Server Migration Plan

> Migrating from Next.js catch-all route to Effect Platform HttpApi

**Source Route**: `apps/web/src/app/api/v1/auth/[...all]/route.ts`
**Target Server**: `apps/server/src/server.ts`
**Total Endpoints**: 138

---

## Migration Overview

This plan systematically migrates ~138 Better Auth endpoints from a Next.js catch-all route handler to Effect Platform's type-safe HttpApi system. The migration is broken into 16 milestones (M0-M15), organized by functional domain and dependency order.

### Goals

1. **Type Safety**: Migrate all endpoints to Effect Platform's HttpApi with full schema validation
2. **Maintainability**: Establish clear domain/infra separation following hexagonal architecture
3. **Observability**: Leverage Effect's built-in telemetry and error tracking
4. **Incremental Delivery**: Enable progressive rollout with milestone-based checkpoints

### Architecture

- **Domain Layer**: `packages/iam/domain/src/api/v1/` - Contract definitions with Effect Schema
- **Infra Layer**: `packages/iam/infra/src/api/v1/` - Handler implementations calling Better Auth
- **Pattern**: Cookie forwarding, schema validation, structured error handling via `IamAuthError`

---

## Progress Tracking

| Milestone | Name               | Status       | Endpoints | Spec Reference                                                         |
|-----------|--------------------|--------------|-----------|------------------------------------------------------------------------|
| M0        | Core Auth          | COMPLETE     | 2         | [CORE.md](../better-auth-specs/CORE.md#get-session)                    |
| M1        | Sign In            | COMPLETE     | 7         | [SIGN_IN.md](../better-auth-specs/SIGN_IN.md)                          |
| M2        | Sign Up            | COMPLETE     | 1         | [SIGN_UP.md](../better-auth-specs/SIGN_UP.md)                          |
| M3        | Password Flows     | COMPLETE     | 3         | [CORE.md](../better-auth-specs/CORE.md#post-change-password)           |
| M4        | Email Verification | COMPLETE     | 2         | [CORE.md](../better-auth-specs/CORE.md#get-verify-email)               |
| M5        | User Management    | COMPLETE     | 3         | [CORE.md](../better-auth-specs/CORE.md#post-update-user)               |
| M6        | Session Management | COMPLETE     | 3         | [CORE.md](../better-auth-specs/CORE.md#get-list-sessions)              |
| M7        | Account Linking    | COMPLETE     | 3         | [CORE.md](../better-auth-specs/CORE.md#post-link-social)               |
| M8        | Token Management   | COMPLETE     | 3         | [CORE.md](../better-auth-specs/CORE.md#post-refresh-token)             |
| M9        | Admin              | COMPLETE     | 15        | [ADMIN.md](../better-auth-specs/ADMIN.md)                              |
| M10       | Organization       | COMPLETE     | 35        | [ORGANIZATION.md](../better-auth-specs/ORGANIZATION.md)                |
| M11       | Two-Factor         | COMPLETE     | 8         | [TWO_FACTOR.md](../better-auth-specs/TWO_FACTOR.md)                    |
| M12       | Passkey            | COMPLETE     | 7         | [PASSKEY.md](../better-auth-specs/PASSKEY.md)                          |
| M13       | OAuth2             | PENDING      | 8         | [OAUTH2.md](../better-auth-specs/OAUTH2.md)                            |
| M14       | SSO                | PENDING      | 5         | [SSO.md](../better-auth-specs/SSO.md)                                  |
| M15       | Advanced           | PENDING      | 33        | Multiple (Phone, API Key, Device, Multi-Session, Misc, CORE utilities) |

**Total**: 138 endpoints across 16 milestones (2+7+1+3+2+3+3+3+3+15+35+8+7+8+5+33)
**Completed**: 92 endpoints (M0: 2/2 ✅, M1: 7/7 ✅, M2: 1/1 ✅, M3: 3/3 ✅, M4: 2/2 ✅, M5: 3/3 ✅, M6: 3/3 ✅, M7: 3/3 ✅, M8: 3/3 ✅, M9: 15/15 ✅, M10: 35/35 ✅, M11: 8/8 ✅, M12: 7/7 ✅)
**In Progress**: 0 endpoints

---

## Status Legend

| Status         | Meaning                                        | Next Action                                          |
|----------------|------------------------------------------------|------------------------------------------------------|
| `PENDING`      | Not started                                    | Boilerplating agent creates stubs with JSDoc         |
| `BOILERPLATED` | Stub files created with complete documentation | Implementation agent fills in contract/handler logic |
| `IN_PROGRESS`  | Implementation underway                        | Continue until all endpoints pass verification       |
| `COMPLETE`     | All checks pass, endpoints functional          | Move to next milestone                               |

---

## Dependency Graph

### Sequential Dependencies (Must Follow Order)

```text
                               ┌──────────────────────┐
                               │   M0: Core Auth      │ ← Foundation (get-session, sign-out)
                               │   Status: COMPLETE   │
                               └──────────┬───────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
           ┌────────▼─────────┐                      ┌──────────▼─────────┐
           │   M1: Sign In    │                      │   M2: Sign Up      │
           │   Status: COMPLETE│                     │   Status: COMPLETE │
           └────────┬─────────┘                      └──────────┬─────────┘
                    │                                           │
           ┌────────▼─────────┐                      ┌──────────▼─────────┐
           │  M3: Password    │                      │  M4: Email Verify  │
           │     Flows        │                      │                    │
           │  COMPLETE (3)    │                      │  COMPLETE (2)      │
           └────────┬─────────┘                      └──────────┬─────────┘
                    │                                           │
                    └─────────────────┬─────────────────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │  M5: User Mgmt      │ ← Gate for advanced features
                           │  COMPLETE (3)       │
                           └──────────┬──────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
   ┌──────▼──────┐            ┌───────▼───────┐           ┌───────▼───────┐
   │ M6: Session │            │ M7: Linking   │           │  M8: Token    │
   │    Mgmt     │            │               │           │    Mgmt       │
   │COMPLETE (3) │            │ COMPLETE (3)  │           │ COMPLETE (3)  │
   └─────────────┘            └───────────────┘           └───────────────┘
```

### Parallel After M5 (No Inter-Dependencies)

After M5 completes, these milestones can execute in **any order** or **in parallel**:

```text
   ═══════════════════════════════════════════════════════════════════════
   PARALLEL BATCH (all depend on M5, but independent of each other):
   ═══════════════════════════════════════════════════════════════════════

   M9:  Admin                   - admin/* (15 endpoints)              [COMPLETE]
   M10: Organization            - organization/* (35 endpoints)       [COMPLETE]
   M11: Two-Factor              - two-factor/* (8 endpoints)          [COMPLETE]
   M12: Passkey                 - passkey/* (7 endpoints)             [COMPLETE]
   M13: OAuth2                  - oauth2/* (8 endpoints)              [PENDING]
   M14: SSO                     - sso/* (5 endpoints)                 [PENDING]
   M15: Advanced                - phone-number, api-key, device,      [PENDING]
                                  multi-session, misc, core-utils
                                  (33 endpoints: 4+5+4+3+7+10)
```

### Execution Order Summary

1. **Sequential Required**: M0 → M1/M2 (parallel) → M3/M4 (parallel) → M5 → M6/M7/M8 (parallel)
2. **Parallel Batch**: After M5 completes, M9-M15 can execute in any order or in parallel
3. **Critical Path**: M0 → M1 → M3 → M5 → M6 (minimum for core auth functionality)

---

## Spec → Milestone Cross-Reference

| Spec File                                                   | Milestones  | Endpoints | Priority |
|-------------------------------------------------------------|-------------|-----------|----------|
| [CORE.md](../better-auth-specs/CORE.md)                     | M0, M3-M8   | 29        | P0       |
| [SIGN_IN.md](../better-auth-specs/SIGN_IN.md)               | M1          | 7         | P0       |
| [SIGN_UP.md](../better-auth-specs/SIGN_UP.md)               | M2          | 1         | P0       |
| [ADMIN.md](../better-auth-specs/ADMIN.md)                   | M9          | 15        | P2       |
| [ORGANIZATION.md](../better-auth-specs/ORGANIZATION.md)     | M10         | 35        | P1       |
| [TWO_FACTOR.md](../better-auth-specs/TWO_FACTOR.md)         | M11         | 8         | P1       |
| [PASSKEY.md](../better-auth-specs/PASSKEY.md)               | M12         | 7         | P2       |
| [OAUTH2.md](../better-auth-specs/OAUTH2.md)                 | M13         | 8         | P3       |
| [SSO.md](../better-auth-specs/SSO.md)                       | M14         | 5         | P2       |
| [PHONE_NUMBER.md](../better-auth-specs/PHONE_NUMBER.md)     | M15         | 4         | P2       |
| [API_KEY.md](../better-auth-specs/API_KEY.md)               | M15         | 5         | P2       |
| [DEVICE.md](../better-auth-specs/DEVICE.md)                 | M15         | 4         | P3       |
| [MULTI_SESSION.md](../better-auth-specs/MULTI_SESSION.md)   | M15         | 3         | P2       |
| [MISC.md](../better-auth-specs/MISC.md)                     | M15         | 7         | P3       |

### CORE.md Breakdown by Milestone

The CORE spec (29 endpoints) is split across multiple milestones:

| Milestone | Group                  | Endpoints                                                    | Count |
|-----------|------------------------|--------------------------------------------------------------|-------|
| M0        | Core Auth              | get-session, sign-out                                        | 2     |
| M3        | Password Flows         | change-password, reset-password, request-password-reset      | 3     |
| M4        | Email Verification     | verify-email, send-verification-email                        | 2     |
| M5        | User Management        | update-user, delete-user, account-info                       | 3     |
| M6        | Session Management     | list-sessions, revoke-sessions, revoke-other-sessions        | 3     |
| M7        | Account Linking        | link-social, unlink-account, list-accounts                   | 3     |
| M8        | Token Management       | refresh-token, get-access-token, change-email                | 3     |
| M15       | Misc (CORE subset)     | See unassigned endpoints below                               | 10    |

**Total accounted**: M0(2) + M3(3) + M4(2) + M5(3) + M6(3) + M7(3) + M8(3) + M15(10) = 29 endpoints ✓
**Total in CORE.md**: 29 endpoints ✓

**Unassigned CORE endpoints** (to be included in M15 - Advanced/Misc):
1. `GET /delete-user/callback` - Callback endpoint for user deletion (part of M5 workflow)
2. `GET /device` - Device information retrieval (overlaps with DEVICE.md spec)
3. `GET /error` - Error page/endpoint (utility endpoint)
4. `GET /jwks` - JSON Web Key Set endpoint (OAuth2/SSO support)
5. `GET /ok` - Health check/status endpoint (utility endpoint)
6. `POST /is-username-available` - Username availability check (utility endpoint)
7. `GET /one-time-token/generate` - Generate one-time token (token utilities)
8. `POST /one-time-token/verify` - Verify one-time token (token utilities)
9. `GET /reset-password/{token}` - Password reset callback page (part of M3 workflow)
10. `POST /revoke-session` - Single session revocation (singular form, maps to revokeSessions)

**Note**: Endpoint 10 (`POST /revoke-session`) exists in the spec but is handled by the same Better Auth method as `POST /revoke-sessions` with different payloads. For consistency, M6 uses the plural form only.

---

## Milestone Details

### M0: Core Auth (COMPLETE)

**Group**: `iam.core`
**Endpoints**: 2
**Domain**: `packages/iam/domain/src/api/v1/core/`
**Infra**: `packages/iam/infra/src/api/v1/core/`

| Method | Path           | Domain File       | Infra File        | Better Auth Method |
|--------|----------------|-------------------|-------------------|--------------------|
| GET    | /get-session   | `get-session.ts`  | `get-session.ts`  | `getSession`       |
| POST   | /sign-out      | `sign-out.ts`     | `sign-out.ts`     | `signOut`          |

**Status**: Foundation complete. Session management and logout functional.

---

### M1: Sign In (COMPLETE)

**Group**: `iam.signIn`
**Endpoints**: 7
**Domain**: `packages/iam/domain/src/api/v1/sign-in/`
**Infra**: `packages/iam/infra/src/api/v1/sign-in/`

| Method | Path                  | Domain File       | Infra File        | Better Auth Method     |
|--------|-----------------------|-------------------|-------------------|------------------------|
| POST   | /sign-in/email        | `email.ts`        | `email.ts`        | `signInEmail`          |
| POST   | /sign-in/social       | `social.ts`       | `social.ts`       | `signInSocial`         |
| POST   | /sign-in/anonymous    | `anonymous.ts`    | `anonymous.ts`    | `signInAnonymous`      |
| POST   | /sign-in/phone-number | `phone-number.ts` | `phone-number.ts` | `signInPhoneNumber`    |
| POST   | /sign-in/username     | `username.ts`     | `username.ts`     | `signInUsername`       |
| POST   | /sign-in/oauth2       | `oauth2.ts`       | `oauth2.ts`       | `signInWithOAuth2`     |
| POST   | /sign-in/sso          | `sso.ts`          | `sso.ts`          | `signInSSO`            |

**Status**: All sign-in methods complete. Domain contracts and infra handlers implemented for all 7 endpoints.

---

### M2: Sign Up (COMPLETE)

**Group**: `iam.signUp`
**Endpoints**: 1
**Domain**: `packages/iam/domain/src/api/v1/sign-up/`
**Infra**: `packages/iam/infra/src/api/v1/sign-up/`

| Method | Path             | Domain File | Infra File  | Better Auth Method |
|--------|------------------|-------------|-------------|--------------------|
| POST   | /sign-up/email   | `email.ts`  | `email.ts`  | `signUpEmail`      |

**Status**: Email registration complete.

---

### M3: Password Flows (PENDING)

**Group**: `iam.core`
**Endpoints**: 3
**Spec**: [CORE.md](../better-auth-specs/CORE.md#post-change-password)

| Method | Path                    | Domain File                 | Infra File                  | Better Auth Method     |
|--------|-------------------------|-----------------------------|-----------------------------|------------------------|
| POST   | /change-password        | `change-password.ts`        | `change-password.ts`        | `changePassword`       |
| POST   | /reset-password         | `reset-password.ts`         | `reset-password.ts`         | `resetPassword`        |
| POST   | /request-password-reset | `request-password-reset.ts` | `request-password-reset.ts` | `requestPasswordReset` |

**Dependencies**: M1 (sign-in must exist for password reset flows)

---

### M4: Email Verification (COMPLETE)

**Group**: `iam.core`
**Endpoints**: 2
**Spec**: [CORE.md](../better-auth-specs/CORE.md#get-verify-email)

| Method | Path                       | Domain File                  | Infra File                   | Better Auth Method         |
|--------|----------------------------|------------------------------|------------------------------|----------------------------|
| GET    | /verify-email              | `verify-email.ts`            | `verify-email.ts`            | `verifyEmail`              |
| POST   | /send-verification-email   | `send-verification-email.ts` | `send-verification-email.ts` | `sendVerificationEmail`    |

**Dependencies**: M2 (sign-up must exist to trigger verification)

---

### M5: User Management (PENDING)

**Group**: `iam.core`
**Endpoints**: 3
**Spec**: [CORE.md](../better-auth-specs/CORE.md#post-update-user)

| Method | Path            | Domain File       | Infra File        | Better Auth Method |
|--------|-----------------|-------------------|-------------------|--------------------|
| POST   | /update-user    | `update-user.ts`  | `update-user.ts`  | `updateUser`       |
| POST   | /delete-user    | `delete-user.ts`  | `delete-user.ts`  | `deleteUser`       |
| GET    | /account-info   | `account-info.ts` | `account-info.ts` | `accountInfo`      |

**Dependencies**: M3, M4 (password and email verification must be functional)
**Gateway**: M5 completion unlocks all advanced features (M6-M15)

---

### M6: Session Management (COMPLETE)

**Group**: `iam.core`
**Endpoints**: 3
**Spec**: [CORE.md](../better-auth-specs/CORE.md#get-list-sessions)

| Method | Path                      | Domain File                 | Infra File                  | Better Auth Method        |
|--------|---------------------------|-----------------------------|-----------------------------|---------------------------|
| GET    | /list-sessions            | `list-sessions.ts`          | `list-sessions.ts`          | `listUserSessions`        |
| POST   | /revoke-sessions          | `revoke-sessions.ts`        | `revoke-sessions.ts`        | `revokeSessions`          |
| POST   | /revoke-other-sessions    | `revoke-other-sessions.ts`  | `revoke-other-sessions.ts`  | `revokeOtherSessions`     |

**Dependencies**: M5

**Note**: Better Auth has `revokeSession` (singular) and `revokeSessions` (plural) methods, but they map to the same `/revoke-sessions` endpoint with different payloads. This milestone uses the plural form.

---

### M7: Account Linking (COMPLETE)

**Group**: `iam.core`
**Endpoints**: 3
**Spec**: [CORE.md](../better-auth-specs/CORE.md#post-link-social)

| Method | Path            | Domain File         | Infra File          | Better Auth Method  |
|--------|-----------------|---------------------|---------------------|---------------------|
| POST   | /link-social    | `link-social.ts`    | `link-social.ts`    | `linkSocialAccount` |
| POST   | /unlink-account | `unlink-account.ts` | `unlink-account.ts` | `unlinkAccount`     |
| GET    | /list-accounts  | `list-accounts.ts`  | `list-accounts.ts`  | `listUserAccounts`  |

**Dependencies**: M5

---

### M8: Token Management (COMPLETE)

**Group**: `iam.core`
**Endpoints**: 3
**Spec**: [CORE.md](../better-auth-specs/CORE.md#post-refresh-token)

| Method | Path                | Domain File           | Infra File            | Better Auth Method  |
|--------|---------------------|-----------------------|-----------------------|---------------------|
| POST   | /refresh-token      | `refresh-token.ts`    | `refresh-token.ts`    | `refreshToken`      |
| POST   | /get-access-token   | `get-access-token.ts` | `get-access-token.ts` | `getAccessToken`    |
| POST   | /change-email       | `change-email.ts`     | `change-email.ts`     | `changeEmail`       |

**Dependencies**: M5

---

### M9: Admin (COMPLETE)

**Group**: `iam.admin`
**Endpoints**: 15
**Spec**: [ADMIN.md](../better-auth-specs/ADMIN.md)
**Path Prefix**: `/admin`

**Domain**: `packages/iam/domain/src/api/v1/admin/`
**Infra**: `packages/iam/infra/src/api/v1/admin/`

| Method | Path                    | Domain File          | Infra File           | Better Auth Method     |
|--------|-------------------------|----------------------|----------------------|------------------------|
| POST   | /admin/ban-user         | `ban-user.ts`        | `ban-user.ts`        | `banUser`              |
| POST   | /admin/unban-user       | `unban-user.ts`      | `unban-user.ts`      | `unbanUser`            |
| GET    | /admin/list-users       | `list-users.ts`      | `list-users.ts`      | `listUsers`            |
| POST   | /admin/impersonate-user | `impersonate-user.ts`| `impersonate-user.ts`| `impersonateUser`      |
| POST   | /admin/stop-impersonating| `stop-impersonating.ts`| `stop-impersonating.ts`| `stopImpersonating`  |
| POST   | /admin/create-user      | `create-user.ts`     | `create-user.ts`     | `createUser`           |
| POST   | /admin/remove-user      | `remove-user.ts`     | `remove-user.ts`     | `removeUser`           |
| POST   | /admin/set-user-role    | `set-user-role.ts`   | `set-user-role.ts`   | `setRole`              |
| POST   | /admin/revoke-sessions  | `revoke-sessions.ts` | `revoke-sessions.ts` | `revokeSessions`       |
| GET    | /admin/list-sessions    | `list-sessions.ts`   | `list-sessions.ts`   | `listSessions`         |
| POST   | /admin/invalidate-sessions| `invalidate-sessions.ts`| `invalidate-sessions.ts`| `invalidateUserSessions`|
| POST   | /admin/set-user-password| `set-user-password.ts`| `set-user-password.ts`| `setUserPassword`     |
| POST   | /admin/link-user        | `link-user.ts`       | `link-user.ts`       | `linkUser`             |
| POST   | /admin/unlink-user      | `unlink-user.ts`     | `unlink-user.ts`     | `unlinkUser`           |
| POST   | /admin/set-user-ban-status| `set-user-ban-status.ts`| `set-user-ban-status.ts`| `setUserBanStatus` |

**Dependencies**: M5
**Status**: All 15 admin endpoints implemented with `runAdminEndpoint`/`runAdminQuery`/`runAdminCommand` helpers.

---

### M10: Organization (COMPLETE)

**Group**: `iam.organization`
**Endpoints**: 35
**Spec**: [ORGANIZATION.md](../better-auth-specs/ORGANIZATION.md)
**Path Prefix**: `/organization`

**Domain**: `packages/iam/domain/src/api/v1/organization/`
**Infra**: `packages/iam/infra/src/api/v1/organization/`

**Invitation Management (7 endpoints)**:
- `accept-invitation`, `cancel-invitation`, `get-invitation`, `invite-member`, `list-invitations`, `list-user-invitations`, `reject-invitation`

**Organization CRUD (7 endpoints)**:
- `create`, `delete`, `update`, `get-full-organization`, `list`, `check-slug`, `set-active`

**Member Management (6 endpoints)**:
- `get-active-member`, `get-active-member-role`, `list-members`, `remove-member`, `update-member-role`, `leave`

**Role Management (6 endpoints)**:
- `create-role`, `delete-role`, `get-role`, `list-roles`, `update-role`, `has-permission`

**Team Management (10 endpoints)**:
- `add-team-member`, `create-team`, `delete-team`, `get-team`, `list-teams`, `list-team-members`, `list-user-teams`, `remove-team-member`, `set-active-team`, `update-team`

**Dependencies**: M5
**Status**: All 35 organization endpoints implemented with `runAdminEndpoint`/`runAdminQuery` helpers. Uses server-side API methods (e.g., `createInvitation` instead of `inviteMember`, `listOrganizationTeams` instead of `listTeams`).

---

### M11: Two-Factor (COMPLETE)

**Group**: `iam.twoFactor`
**Endpoints**: 8
**Spec**: [TWO_FACTOR.md](../better-auth-specs/TWO_FACTOR.md)
**Path Prefix**: `/two-factor`

**Domain**: `packages/iam/domain/src/api/v1/two-factor/`
**Infra**: `packages/iam/infra/src/api/v1/two-factor/`

| Method | Path                      | Domain File               | Infra File                | Better Auth Method      |
|--------|---------------------------|---------------------------|---------------------------|-------------------------|
| POST   | /two-factor/disable       | `disable.ts`              | `disable.ts`              | `disableTwoFactor`      |
| POST   | /two-factor/enable        | `enable.ts`               | `enable.ts`               | `enableTwoFactor`       |
| POST   | /two-factor/generate-backup-codes | `generate-backup-codes.ts` | `generate-backup-codes.ts` | `generateBackupCodes` |
| POST   | /two-factor/get-totp-uri  | `get-totp-uri.ts`         | `get-totp-uri.ts`         | `getTOTPURI`            |
| POST   | /two-factor/send-otp      | `send-otp.ts`             | `send-otp.ts`             | `sendTwoFactorOTP`      |
| POST   | /two-factor/verify-backup-code | `verify-backup-code.ts` | `verify-backup-code.ts`  | `verifyBackupCode`      |
| POST   | /two-factor/verify-otp    | `verify-otp.ts`           | `verify-otp.ts`           | `verifyTwoFactorOTP`    |
| POST   | /two-factor/verify-totp   | `verify-totp.ts`          | `verify-totp.ts`          | `verifyTOTP`            |

**Dependencies**: M5
**Status**: All 8 two-factor endpoints implemented with `runAuthEndpoint`, `runAuthCommand` helpers.

---

### M12: Passkey (COMPLETE)

**Group**: `iam.passkey`
**Endpoints**: 7
**Spec**: [PASSKEY.md](../better-auth-specs/PASSKEY.md)
**Path Prefix**: `/passkey`

**Domain**: `packages/iam/domain/src/api/v1/passkey/`
**Infra**: `packages/iam/infra/src/api/v1/passkey/`

| Method | Path                                  | Domain File                       | Infra File                        | Better Auth Method                    |
|--------|---------------------------------------|-----------------------------------|-----------------------------------|---------------------------------------|
| POST   | /passkey/delete-passkey               | `delete-passkey.ts`               | `delete-passkey.ts`               | `deletePasskey`                       |
| GET    | /passkey/generate-authenticate-options| `generate-authenticate-options.ts`| `generate-authenticate-options.ts`| `generatePasskeyAuthenticationOptions`|
| GET    | /passkey/generate-register-options    | `generate-register-options.ts`    | `generate-register-options.ts`    | `generatePasskeyRegistrationOptions`  |
| GET    | /passkey/list-user-passkeys           | `list-user-passkeys.ts`           | `list-user-passkeys.ts`           | `listPasskeys`                        |
| POST   | /passkey/update-passkey               | `update-passkey.ts`               | `update-passkey.ts`               | `updatePasskey`                       |
| POST   | /passkey/verify-authentication        | `verify-authentication.ts`        | `verify-authentication.ts`        | `verifyPasskeyAuthentication`         |
| POST   | /passkey/verify-registration          | `verify-registration.ts`          | `verify-registration.ts`          | `verifyPasskeyRegistration`           |

**Dependencies**: M5
**Status**: All 7 passkey endpoints implemented. WebAuthn response types handled via BetterAuthBridge wrappers to avoid type assertions.

---

### M13: OAuth2 (PENDING)

**Group**: `iam.oauth2`
**Endpoints**: 8
**Spec**: [OAUTH2.md](../better-auth-specs/OAUTH2.md)
**Path Prefix**: `/oauth2`

**Dependencies**: M5
**Document**: See milestone document `M13_OAUTH2.md` (to be created)

---

### M14: SSO (PENDING)

**Group**: `iam.sso`
**Endpoints**: 5
**Spec**: [SSO.md](../better-auth-specs/SSO.md)
**Path Prefix**: `/sso`

**Dependencies**: M5
**Document**: See milestone document `M14_SSO.md` (to be created)

---

### M15: Advanced (PENDING)

**Groups**: `iam.phoneNumber`, `iam.apiKey`, `iam.device`, `iam.multiSession`, `iam.misc`, `iam.core` (utilities)
**Endpoints**: 33 total
**Specs**:
- [PHONE_NUMBER.md](../better-auth-specs/PHONE_NUMBER.md) (4 endpoints)
- [API_KEY.md](../better-auth-specs/API_KEY.md) (5 endpoints)
- [DEVICE.md](../better-auth-specs/DEVICE.md) (4 endpoints)
- [MULTI_SESSION.md](../better-auth-specs/MULTI_SESSION.md) (3 endpoints)
- [MISC.md](../better-auth-specs/MISC.md) (7 endpoints)
- [CORE.md](../better-auth-specs/CORE.md) - Utilities subset (10 endpoints - see "Unassigned CORE endpoints" above)

**Endpoint Breakdown**:
- Phone Number: 4
- API Key: 5
- Device: 4
- Multi-Session: 3
- Misc: 7
- Core Utilities: 10 (callbacks, health checks, token utilities, jwks, etc.)

**Dependencies**: M5
**Document**: See milestone document `M15_ADVANCED.md` (to be created)

---

## Completion Criteria (Per Milestone)

Each milestone must satisfy **all** of the following before marking as COMPLETE:

### 1. Domain Layer
- [ ] All domain contracts defined in `packages/iam/domain/src/api/v1/[group]/`
- [ ] Each contract uses proper `$IamDomainId` identifiers
- [ ] Payload/Success/UrlParams/PathParams schemas match OpenAPI spec exactly
- [ ] Group `_group.ts` updated with new contracts
- [ ] Barrel exports (`index.ts`) updated

### 2. Infra Layer
- [ ] All infra handlers implemented in `packages/iam/infra/src/api/v1/[group]/`
- [ ] Handlers call correct Better Auth API methods
- [ ] Cookie forwarding implemented (set-cookie header)
- [ ] Response decoding uses domain Success schemas
- [ ] Group `_group.ts` updated with new handlers
- [ ] Barrel exports (`index.ts`) updated

### 3. Build & Type Safety
- [ ] `bun run check` passes (no TypeScript errors)
- [ ] `bun run build --filter=@beep/iam-domain` succeeds
- [ ] `bun run build --filter=@beep/iam-infra` succeeds
- [ ] No lint errors (`bun run lint`)

### 4. Documentation
- [ ] All schemas have complete JSDoc (@category, @example, @since)
- [ ] All handlers have complete JSDoc
- [ ] Spec references accurate in milestone doc
- [ ] PLAN.md status updated

### 5. Runtime Verification (Optional but Recommended)
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Manual smoke test with valid credentials
- [ ] Error cases return proper `IamAuthError` responses

---

## Pattern References

All implementations MUST follow the patterns documented in:
- **[PATTERNS.md](./PATTERNS.md)** - Domain contract templates, handler templates, naming conventions
- **[Phase 1 Specs](../better-auth-specs/)** - OpenAPI endpoint specifications

### Schema Pattern Updates (2025-12-19)

Recent schema pattern improvements in PATTERNS.md:

1. **DateTime Schema**: Always use `BS.DateTimeUtcFromAllAcceptable` (accepts ISO strings, timestamps, Date objects, or DateTime instances)
2. **Model Variants**: Use `Model.json` for API responses, `Model.jsonCreate` for create payloads, `Model.jsonUpdate` for update payloads
3. **Optional Schema**: Use `S.optionalWith(X, { nullable: true })` for JSON-compatible optional fields

### Helper Functions (packages/iam/infra/src/api/common/schema-helpers.ts)

Three reusable helpers exist for infra handler implementations:

1. **`runAuthEndpoint`** - For POST endpoints with request body and response decoding
   - Encodes payload via Schema.encode
   - Executes auth handler with body + headers
   - Decodes response via Schema.decodeUnknown
   - Forwards set-cookie header
   - See: `sign-in/email.ts`, `sign-up/email.ts`

2. **`runAuthQuery`** - For GET endpoints with no payload (query-only)
   - Executes auth handler with headers only
   - Decodes response via Schema.decodeUnknown
   - Forwards set-cookie header
   - See: `core/get-session.ts`

3. **`runAuthCommand`** - For POST/GET endpoints with fixed success response
   - Executes auth handler with headers only
   - Returns fixed success value (no response decoding)
   - Forwards set-cookie header
   - See: `core/sign-out.ts`

**Usage Pattern**: All handlers should use one of these three helpers instead of manually implementing cookie forwarding and response decoding.

**Exception - OAuth Redirect Flows**: OAuth2 and SSO initial sign-in requests (`signInWithOAuth2`, `signInSSO`) return `{ url, redirect }` responses that trigger browser redirects. These endpoints should NOT use the helper functions because:
- They don't return cookies until the callback completes
- The response is a redirect instruction, not a session payload
- Cookie forwarding happens in the OAuth callback handler, not the initial request

---

## Lessons Learned

### M1 Implementation (2025-12-19)

During the completion of M1 (Sign In), several critical patterns and issues were discovered:

#### 1. Better Auth Method Naming Inconsistencies
**Issue**: OAuth2 uses `signInWithOAuth2`, not `signInOAuth2` as expected by naming patterns.

**Root Cause**: Better Auth's TypeScript API uses `signInWithOAuth2` while the spec documentation may show `signInOAuth2`.

**Resolution**: Always verify Better Auth method names against the actual TypeScript types in `better-auth` package, not just spec documentation.

**Prevention**:
- Check `node_modules/better-auth/dist/types.d.ts` for exact method signatures
- Use TypeScript IntelliSense to validate method names during implementation
- Never assume naming consistency across all auth methods

#### 2. OAuth Redirect Flow Cookie Handling
**Issue**: OAuth2 sign-in initially failed type checks because redirect responses don't include cookies.

**Root Cause**: OAuth flows return `{ url: string, redirect: true }` on the initial request. Cookies are only set after the OAuth provider callback completes.

**Resolution**: OAuth redirect flows bypass the standard helpers and return the redirect response directly without cookie forwarding.

**Pattern**:
```typescript
// Standard auth flow (uses helper)
runAuthEndpoint(auth.signInEmail, SignInEmailPayload, SignInEmailSuccess);

// OAuth redirect flow (no helper)
Effect.gen(function* () {
  const payload = yield* Effect.succeed(body);
  const result = yield* auth.signInWithOAuth2(payload);
  return HttpServerResponse.json(result); // No cookie forwarding
});
```

#### 3. Never Use `@ts-expect-error`
**Issue**: Initial implementations used `@ts-expect-error` to suppress schema validation errors.

**Root Cause**: Laziness or incomplete schema definitions.

**Resolution**: Always fix the schema to match the actual TypeScript types. If a field is optional in Better Auth's response, make it optional in the schema using `S.optionalWith(X, { nullable: true })`.

**Prevention**:
- `@ts-expect-error` is banned in all implementations
- If TypeScript complains, the schema is wrong—fix the schema
- Use `S.optionalWith` for truly optional fields
- Use `S.Struct.pipe(S.partial)` for partial update payloads

#### 4. Spec Types vs Better Auth TypeScript Types
**Issue**: OpenAPI spec definitions may differ from Better Auth's actual TypeScript return types.

**Root Cause**: Spec is generated from documentation, not from TypeScript types. Better Auth's runtime behavior is the source of truth.

**Resolution**: When in doubt, trust the TypeScript types over the spec. The spec is guidance; the types are law.

**Pattern**:
1. Read the spec for endpoint purpose and parameters
2. Check Better Auth TypeScript types for exact signatures
3. If they differ, implement against the TypeScript types
4. Document the discrepancy in JSDoc with `@remarks`

#### 5. OAuth2 Callback vs Initial Request
**Issue**: Confusion about when cookies are set in OAuth flows.

**Clarification**:
- **Initial Request** (`POST /sign-in/oauth2`): Returns `{ url, redirect }`, no cookies
- **Callback** (`GET /sign-in/oauth2/callback`): Processes provider response, sets session cookies

**Implementation**: Only the callback handler needs cookie forwarding, not the initial sign-in request.

---

## Progress Format

To update progress, modify the table in the "Progress Tracking" section:

```markdown
| M3 | Password Flows | BOILERPLATED | 3 | [CORE.md](...) |
```

Then update the dependency graph ASCII art to reflect COMPLETE/IN_PROGRESS milestones.

---

## Phase 2.5 Boilerplating Strategy

**Current State**: Domain layer has been heavily pre-boilerplated (21 CORE files exist). Infra layer is minimal (only M0 handlers exist).

**Recommended Approach**:

### Option A: Complete M1 (Fastest Path to Working Feature)
1. Focus on completing M1 infra handlers (5 remaining: anonymous, phone-number, username, oauth2, sso)
2. Use existing domain contracts (already boilerplated)
3. Follow `sign-in/email.ts` and `sign-in/social.ts` as templates
4. Use `runAuthEndpoint` helper for all handlers
5. Verify with `bun run check --filter=@beep/iam-infra`
6. Update M1 status to COMPLETE

**Pros**: Delivers complete sign-in functionality quickly, validates helper pattern works across multiple endpoints
**Cons**: Skips sequential milestone order (M3, M4, M5)

### Option B: Sequential Boilerplating (Follows Dependency Order)
1. Start with M3 (Password Flows) - 3 endpoints
2. Domain files already exist, create infra handlers
3. Move to M4 (Email Verification) - 2 endpoints
4. Continue to M5 (User Management) - 3 endpoints
5. Then complete M1, M6, M7, M8 in parallel

**Pros**: Follows logical dependency order, establishes core auth flows first
**Cons**: Slower to deliver complete features

**Recommendation**: Choose Option A to validate the migration pattern quickly with a complete feature (sign-in), then proceed with Option B for remaining milestones.

---

## Workflow Summary

### Phase Definitions

#### Boilerplating Phase
Create stub files with complete documentation but **no implementation logic**:

**Domain Layer**:
- Create contract files with `$IamDomainId` identifiers
- Add complete JSDoc (`@category`, `@example`, `@since`, `@remarks`)
- Use placeholder schemas: `S.Struct({})` with `// TODO: Implement schema` comments
- Document expected payload/response structure in JSDoc
- Update group `_group.ts` with imports and contract registration
- Update barrel exports in `index.ts`

**Infra Layer**:
- Create handler files with complete JSDoc
- Use placeholder implementations: `throw new Error("Not implemented: [endpoint-name]")`
- Document Better Auth method name in JSDoc (`@remarks Uses Better Auth method: signInEmail`)
- Update group `_group.ts` with imports and handler registration
- Update barrel exports in `index.ts`

**DO NOT**:
- Implement actual schemas (leave as `S.Struct({})`)
- Call Better Auth methods (leave as `throw new Error`)
- Remove TODO comments
- Attempt to make endpoints functional

**Verification**: `bun run check` may fail—this is expected. Structure validation only.

#### Implementation Phase
Fill in the boilerplated stubs with working code:

**Domain Layer**:
- Replace `S.Struct({})` with actual Effect Schema definitions
- Match Better Auth TypeScript types exactly (not just spec)
- Use `S.optionalWith(X, { nullable: true })` for optional fields
- Use model variants (`Model.json`, `Model.jsonCreate`, `Model.jsonUpdate`)
- Remove all `// TODO` comments

**Infra Layer**:
- Replace `throw new Error` with actual handler implementations
- Call correct Better Auth API methods (verify against TypeScript types)
- Use appropriate helper (`runAuthEndpoint`, `runAuthQuery`, `runAuthCommand`)
- Handle OAuth redirect flows without helpers (return `{ url, redirect }` directly)
- Verify cookie forwarding works (except for OAuth initial requests)

**Verification**: `bun run check --filter=@beep/iam-domain && bun run check --filter=@beep/iam-infra` must pass with zero errors.

---

### For Boilerplating Agents

1. Select next `PENDING` milestone from PLAN.md
2. Read corresponding spec document(s) from Phase 1
3. Check if domain contracts already exist (21 CORE files pre-boilerplated)
4. Create stub files using PATTERNS.md templates (if domain not already done)
5. Fill in JSDoc and metadata (no implementation yet)
6. Use placeholder schemas `S.Struct({})` and `throw new Error("Not implemented")`
7. Update group files with imports/registrations
8. Verify structure with `bun run check` (failures expected for incomplete implementations)
9. Update PLAN.md status to `BOILERPLATED`

### For Implementation Agents

1. Select next `BOILERPLATED` milestone from PLAN.md
2. Read stub files (all spec info in JSDoc)
3. Implement Payload/Success schemas from TODO comments (match Better Auth TS types)
4. Implement handlers calling Better Auth methods (use helpers when applicable)
5. Remove TODO comments and placeholder errors
6. Verify incrementally with `bun run check`
7. Run completion criteria checklist
8. Update PLAN.md status to `COMPLETE`

---

## Notes

- **Parallel Execution**: After M5, milestones M9-M15 are independent and can be worked on simultaneously by different agents
- **Incremental Commits**: Each milestone can be committed separately for easier rollback
- **Spec Fidelity**: Always prefer spec definitions over assumptions—when in doubt, reference Phase 1 docs
- **Cookie Forwarding**: Critical for session management—all handlers must forward `set-cookie` from Better Auth
- **Error Handling**: Use `IamAuthError.flowMap()` consistently—do not create endpoint-specific error classes

---

## References

| Document                                                             | Purpose                                 |
|----------------------------------------------------------------------|-----------------------------------------|
| [PATTERNS.md](./PATTERNS.md)                                         | Implementation templates and guidelines |
| [Phase 1 Specs](../better-auth-specs/)                               | OpenAPI endpoint specifications         |
| [BETTER_AUTH_SCRATCH_PROMPT.md](../../BETTER_AUTH_SCRATCH_PROMPT.md) | Original orchestration prompt           |
| [AGENTS.md](../../AGENTS.md)                                         | Repository-wide agent guidelines        |

---

**Last Updated**: 2025-12-19
**Migration Phase**: Phase 3 - Parallel Implementation (M13-M15)
**Next Milestone**: M13 (OAuth2 - 8 endpoints), M14 (SSO - 5 endpoints), or M15 (Advanced - 33 endpoints)
**Current Status**: M0-M12 ✅ COMPLETE | 92/138 endpoints complete (67% migrated)

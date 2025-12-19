# Milestone 11: Two-Factor Authentication

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/TWO_FACTOR.md](../better-auth-specs/TWO_FACTOR.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (8 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements all two-factor authentication (2FA/MFA) endpoints for Better Auth. It includes TOTP-based authentication, OTP email verification, backup codes, and device trust management. These endpoints provide enhanced security features for user accounts.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /two-factor/disable | `v1/two-factor/disable.ts` | `v1/two-factor/disable.ts` | `twoFactorDisable` |
| POST | /two-factor/enable | `v1/two-factor/enable.ts` | `v1/two-factor/enable.ts` | `twoFactorEnable` |
| POST | /two-factor/generate-backup-codes | `v1/two-factor/generate-backup-codes.ts` | `v1/two-factor/generate-backup-codes.ts` | `twoFactorGenerateBackupCodes` |
| POST | /two-factor/get-totp-uri | `v1/two-factor/get-totp-uri.ts` | `v1/two-factor/get-totp-uri.ts` | `twoFactorGetTotpUri` |
| POST | /two-factor/send-otp | `v1/two-factor/send-otp.ts` | `v1/two-factor/send-otp.ts` | `twoFactorSendOtp` |
| POST | /two-factor/verify-backup-code | `v1/two-factor/verify-backup-code.ts` | `v1/two-factor/verify-backup-code.ts` | `twoFactorVerifyBackupCode` |
| POST | /two-factor/verify-otp | `v1/two-factor/verify-otp.ts` | `v1/two-factor/verify-otp.ts` | `twoFactorVerifyOtp` |
| POST | /two-factor/verify-totp | `v1/two-factor/verify-totp.ts` | `v1/two-factor/verify-totp.ts` | `twoFactorVerifyTotp` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `disable.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/disable.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/disable`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factordisable`
  - Better Auth method name: `twoFactorDisable`
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec: `password` (string, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec: `status` (boolean, optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `enable.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/enable.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/enable`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorenable`
  - Better Auth method name: `twoFactorEnable`
  - Implementation requirements: Generates TOTP URI and backup codes. User must verify TOTP URI to complete 2FA enablement.
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `password` (string, required), `issuer` (string, optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `totpURI` (string, optional), `backupCodes` (string[], optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `generate-backup-codes.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/generate-backup-codes.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/generate-backup-codes`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorgenerate-backup-codes`
  - Better Auth method name: `twoFactorGenerateBackupCodes`
  - Implementation requirements: Generates new backup codes for existing 2FA setup
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `password` (string, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `status` (boolean, required, value: true), `backupCodes` (string[], required)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `get-totp-uri.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/get-totp-uri.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/get-totp-uri`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorget-totp-uri`
  - Better Auth method name: `twoFactorGetTotpUri`
  - Implementation requirements: Retrieves existing TOTP URI for already enabled 2FA
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `password` (string, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `totpURI` (string, optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `send-otp.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/send-otp.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/send-otp`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorsend-otp`
  - Better Auth method name: `twoFactorSendOtp`
  - Implementation requirements: Sends OTP to user's email for 2FA verification
- [ ] Add `Payload` class stub (note: this endpoint has no body parameters)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `status` (boolean, optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-backup-code.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/verify-backup-code.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/verify-backup-code`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorverify-backup-code`
  - Better Auth method name: `twoFactorVerifyBackupCode`
  - Implementation requirements: Verify backup code for 2FA, supports device trust and session control
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `code` (string, required), `disableSession` (boolean, optional), `trustDevice` (boolean, optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `user` (object, required), `session` (object, required)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-otp.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/verify-otp.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/verify-otp`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorverify-otp`
  - Better Auth method name: `twoFactorVerifyOtp`
  - Implementation requirements: Verify OTP code sent via email, supports device trust
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `code` (string, required), `trustDevice` (boolean, optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `token` (string, required), `user` (object, required)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-totp.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/two-factor/verify-totp.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /two-factor/verify-totp`
  - Spec reference anchor: `.specs/better-auth-specs/TWO_FACTOR.md#post-two-factorverify-totp`
  - Better Auth method name: `twoFactorVerifyTotp`
  - Implementation requirements: Verify TOTP code from authenticator app, supports device trust (30-day trust period, refreshed on each sign-in)
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `code` (string, required), `trustDevice` (boolean, optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `status` (boolean, optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Create `_group.ts`

- [ ] Create file `packages/iam/domain/src/api/v1/two-factor/_group.ts`
- [ ] Import all endpoint contracts:
  - `import * as Disable from "./disable.ts"`
  - `import * as Enable from "./enable.ts"`
  - `import * as GenerateBackupCodes from "./generate-backup-codes.ts"`
  - `import * as GetTotpUri from "./get-totp-uri.ts"`
  - `import * as SendOtp from "./send-otp.ts"`
  - `import * as VerifyBackupCode from "./verify-backup-code.ts"`
  - `import * as VerifyOtp from "./verify-otp.ts"`
  - `import * as VerifyTotp from "./verify-totp.ts"`
- [ ] Create `Group` class extending `HttpApiGroup.make("iam.twoFactor")`
- [ ] Add all contracts to group with `.add()` chain
- [ ] Add `.prefix("/two-factor")` to group
- [ ] Export all endpoint modules

#### Create `index.ts`

- [ ] Create file `packages/iam/domain/src/api/v1/two-factor/index.ts`
- [ ] Export all endpoints using namespace re-export pattern

#### Update parent `v1/api.ts`

- [ ] Import two-factor group: `import { TwoFactor } from "./two-factor/_group.ts"`
- [ ] Add to V1 API class with `.addGroup(TwoFactor.Group)`

### Boilerplate Infra Handlers

#### `disable.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/disable.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorDisable()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `enable.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/enable.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorEnable()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `generate-backup-codes.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/generate-backup-codes.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorGenerateBackupCodes()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `get-totp-uri.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/get-totp-uri.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorGetTotpUri()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `send-otp.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/send-otp.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: no payload for this endpoint)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorSendOtp()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-backup-code.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/verify-backup-code.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorVerifyBackupCode()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-otp.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/verify-otp.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorVerifyOtp()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-totp.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/two-factor/verify-totp.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.twoFactorVerifyTotp()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Create `_group.ts`

- [ ] Create file `packages/iam/infra/src/api/v1/two-factor/_group.ts`
- [ ] Import all endpoint handlers
- [ ] Define `Service`, `ServiceError`, `ServiceDependencies` types
- [ ] Create `Routes` layer with `HttpApiBuilder.group(IamApi, "iam.twoFactor", ...)`
- [ ] Register all handlers with `.handle()` chain

#### Create `index.ts`

- [ ] Create file `packages/iam/infra/src/api/v1/two-factor/index.ts`
- [ ] Export all handlers using namespace re-export pattern

#### Update parent `v1/api.ts`

- [ ] Import two-factor routes: `import { TwoFactor } from "./two-factor/_group.ts"`
- [ ] Add to V1.ApiLive layer composition

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `disable.ts`

- [ ] Implement `Payload` class fields:
  - `password: CommonFields.UserPassword`
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Note: If TwoFactor entity exists, consider using `TwoFactor.Model.jsonUpdate` variant for update operations
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `enable.ts`

- [ ] Implement `Payload` class fields:
  - `password: CommonFields.UserPassword`
  - `issuer: S.optionalWith(S.String, { nullable: true })`
- [ ] Implement `Success` class fields:
  - `totpURI: S.optionalWith(S.String, { nullable: true })`
  - `backupCodes: S.optionalWith(S.Array(S.String), { nullable: true })`
- [ ] Note: If TwoFactor entity exists, consider using `TwoFactor.Model.jsonCreate` variant for initial 2FA setup
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `generate-backup-codes.ts`

- [ ] Implement `Payload` class fields:
  - `password: CommonFields.UserPassword`
- [ ] Implement `Success` class fields:
  - `status: S.Boolean` (note: spec indicates this is always `true` when successful)
  - `backupCodes: S.Array(S.String)`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `get-totp-uri.ts`

- [ ] Implement `Payload` class fields:
  - `password: CommonFields.UserPassword`
- [ ] Implement `Success` class fields:
  - `totpURI: S.optionalWith(S.String, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `send-otp.ts`

- [ ] Implement `Payload` class (empty struct - no body parameters)
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-backup-code.ts`

- [ ] Implement `Payload` class fields:
  - `code: S.String`
  - `disableSession: S.optionalWith(S.Boolean, { nullable: true })`
  - `trustDevice: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Implement `Success` class fields:
  - `user: User.Model.json` (import from `@beep/shared-domain/entities`)
  - `session: Session.Model.json` (import from `@beep/shared-domain/entities`)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-otp.ts`

- [ ] Implement `Payload` class fields:
  - `code: S.String`
  - `trustDevice: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Implement `Success` class fields:
  - `token: S.String`
  - `user: User.Model.json` (import from `@beep/shared-domain/entities`)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-totp.ts`

- [ ] Implement `Payload` class fields:
  - `code: S.String`
  - `trustDevice: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

**Helper Selection**: See `packages/iam/infra/src/api/common/schema-helpers.ts` for available helpers. Import:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

#### `disable.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, password is Redacted (auto-encoded)
  - Call `auth.api.twoFactorDisable()` via helper
  - Success schema: `V1.TwoFactor.Disable.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `enable.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, password is Redacted (auto-encoded)
  - Call `auth.api.twoFactorEnable()` via helper
  - Success schema: `V1.TwoFactor.Enable.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `generate-backup-codes.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, password is Redacted (auto-encoded)
  - Call `auth.api.twoFactorGenerateBackupCodes()` via helper
  - Success schema: `V1.TwoFactor.GenerateBackupCodes.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `get-totp-uri.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, password is Redacted (auto-encoded)
  - Call `auth.api.twoFactorGetTotpUri()` via helper
  - Success schema: `V1.TwoFactor.GetTotpUri.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `send-otp.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET-like POST with no payload, schema-decoded response
  - Call `auth.api.twoFactorSendOtp()` via helper (note: no body parameters)
  - Success schema: `V1.TwoFactor.SendOtp.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-backup-code.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns user/session
  - Call `auth.api.twoFactorVerifyBackupCode()` via helper
  - Payload fields: `code`, `disableSession`, `trustDevice` (auto-encoded)
  - Success schema: `V1.TwoFactor.VerifyBackupCode.Success`
  - Cookie forwarding handled automatically (critical for session creation)
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-otp.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns token/user
  - Call `auth.api.twoFactorVerifyOtp()` via helper
  - Payload fields: `code`, `trustDevice` (auto-encoded)
  - Success schema: `V1.TwoFactor.VerifyOtp.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-totp.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns status boolean
  - Call `auth.api.twoFactorVerifyTotp()` via helper
  - Payload fields: `code`, `trustDevice` (auto-encoded)
  - Success schema: `V1.TwoFactor.VerifyTotp.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-infra` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Special Considerations

1. **Password Redaction**: All endpoints that accept `password` must use `CommonFields.UserPassword` which wraps with `S.Redacted` to prevent leakage in logs.

2. **Device Trust**: Several endpoints support `trustDevice` parameter. When enabled, the device is trusted for 30 days and refreshed on each sign-in request within this period.

3. **Session Control**: `verify-backup-code` endpoint has a `disableSession` parameter to control whether session cookie is set.

4. **Backup Codes**: The `generate-backup-codes` endpoint returns plain text codes. These should be displayed to user only once and stored securely by the client.

5. **TOTP URI Format**: The `totpURI` returned by `enable` and `get-totp-uri` is in the standard TOTP URI format (`otpauth://totp/...`) for use with authenticator apps.

6. **Empty Payload**: The `send-otp` endpoint has no request body parameters. The handler should be adjusted to not expect a `payload` parameter.

7. **Cookie Forwarding**: All verification endpoints (verify-otp, verify-totp, verify-backup-code) create or update sessions, so proper cookie forwarding is critical.

8. **Return Types**: Some endpoints return User/Session objects directly (verify-backup-code, verify-otp), while others return status booleans (enable, disable, verify-totp). Ensure proper domain entity imports where needed.

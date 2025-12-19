# Milestone 12: Passkey Authentication

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/PASSKEY.md](../better-auth-specs/PASSKEY.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (7 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements all WebAuthn passkey authentication endpoints for Better Auth. Passkeys provide passwordless authentication using biometric data or security keys. These endpoints handle registration, authentication, and management of passkeys for user accounts.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /passkey/delete-passkey | `v1/passkey/delete-passkey.ts` | `v1/passkey/delete-passkey.ts` | `passkeyDeletePasskey` |
| GET | /passkey/generate-authenticate-options | `v1/passkey/generate-authenticate-options.ts` | `v1/passkey/generate-authenticate-options.ts` | `passkeyGenerateAuthenticateOptions` |
| GET | /passkey/generate-register-options | `v1/passkey/generate-register-options.ts` | `v1/passkey/generate-register-options.ts` | `passkeyGenerateRegisterOptions` |
| GET | /passkey/list-user-passkeys | `v1/passkey/list-user-passkeys.ts` | `v1/passkey/list-user-passkeys.ts` | `passkeyListUserPasskeys` |
| POST | /passkey/update-passkey | `v1/passkey/update-passkey.ts` | `v1/passkey/update-passkey.ts` | `passkeyUpdatePasskey` |
| POST | /passkey/verify-authentication | `v1/passkey/verify-authentication.ts` | `v1/passkey/verify-authentication.ts` | `passkeyVerifyAuthentication` |
| POST | /passkey/verify-registration | `v1/passkey/verify-registration.ts` | `v1/passkey/verify-registration.ts` | `passkeyVerifyRegistration` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `delete-passkey.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/delete-passkey.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /passkey/delete-passkey`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#post-passkeydelete-passkey`
  - Better Auth method name: `passkeyDeletePasskey`
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec: `id` (string, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec: `status` (boolean, required)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `generate-authenticate-options.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/generate-authenticate-options.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `GET /passkey/generate-authenticate-options`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#get-passkeygenerate-authenticate-options`
  - Better Auth method name: `passkeyGenerateAuthenticateOptions`
  - Implementation requirements: Generates WebAuthn authentication options for passkey login
- [ ] Add `UrlParams` class stub (note: GET request, check if query params exist)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: complex WebAuthn PublicKeyCredentialRequestOptions structure
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `generate-register-options.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/generate-register-options.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `GET /passkey/generate-register-options`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#get-passkeygenerate-register-options`
  - Better Auth method name: `passkeyGenerateRegisterOptions`
  - Implementation requirements: Generates WebAuthn registration options for new passkey
- [ ] Add `UrlParams` class stub (note: GET request, check if query params exist)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: complex WebAuthn PublicKeyCredentialCreationOptions structure
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `list-user-passkeys.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/list-user-passkeys.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `GET /passkey/list-user-passkeys`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#get-passkeylist-user-passkeys`
  - Better Auth method name: `passkeyListUserPasskeys`
  - Implementation requirements: List all passkeys for the authenticated user
- [ ] Add `UrlParams` class stub (note: GET request, check if query params exist)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment: Note that spec says "Passkeys retrieved successfully" but doesn't specify structure - may need to reference Passkey schema or inspect Better Auth types
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `update-passkey.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/update-passkey.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /passkey/update-passkey`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#post-passkeyupdate-passkey`
  - Better Auth method name: `passkeyUpdatePasskey`
  - Implementation requirements: Update passkey name/metadata
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `id` (string, required), `name` (string, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `passkey` (Passkey object, required - see SCHEMAS.md#passkey)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-authentication.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/verify-authentication.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /passkey/verify-authentication`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#post-passkeyverify-authentication`
  - Better Auth method name: `passkeyVerifyAuthentication`
  - Implementation requirements: Verify WebAuthn authentication response and create session
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `response` (string, required - WebAuthn credential response JSON)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `session` (Session, optional), `user` (User, optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-registration.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/passkey/verify-registration.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /passkey/verify-registration`
  - Spec reference anchor: `.specs/better-auth-specs/PASSKEY.md#post-passkeyverify-registration`
  - Better Auth method name: `passkeyVerifyRegistration`
  - Implementation requirements: Verify WebAuthn registration response and store new passkey
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: `response` (string, required), `name` (string, optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment: Returns Passkey object (see SCHEMAS.md#passkey)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Create `_group.ts`

- [ ] Create file `packages/iam/domain/src/api/v1/passkey/_group.ts`
- [ ] Import all endpoint contracts:
  - `import * as DeletePasskey from "./delete-passkey.ts"`
  - `import * as GenerateAuthenticateOptions from "./generate-authenticate-options.ts"`
  - `import * as GenerateRegisterOptions from "./generate-register-options.ts"`
  - `import * as ListUserPasskeys from "./list-user-passkeys.ts"`
  - `import * as UpdatePasskey from "./update-passkey.ts"`
  - `import * as VerifyAuthentication from "./verify-authentication.ts"`
  - `import * as VerifyRegistration from "./verify-registration.ts"`
- [ ] Create `Group` class extending `HttpApiGroup.make("iam.passkey")`
- [ ] Add all contracts to group with `.add()` chain
- [ ] Add `.prefix("/passkey")` to group
- [ ] Export all endpoint modules

#### Create `index.ts`

- [ ] Create file `packages/iam/domain/src/api/v1/passkey/index.ts`
- [ ] Export all endpoints using namespace re-export pattern

#### Update parent `v1/api.ts`

- [ ] Import passkey group: `import { Passkey } from "./passkey/_group.ts"`
- [ ] Add to V1 API class with `.addGroup(Passkey.Group)`

### Boilerplate Infra Handlers

#### `delete-passkey.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/delete-passkey.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyDeletePasskey()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `generate-authenticate-options.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/generate-authenticate-options.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: GET request, use UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyGenerateAuthenticateOptions()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `generate-register-options.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/generate-register-options.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: GET request, use UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyGenerateRegisterOptions()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `list-user-passkeys.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/list-user-passkeys.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: GET request, use UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyListUserPasskeys()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `update-passkey.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/update-passkey.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyUpdatePasskey()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-authentication.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/verify-authentication.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyVerifyAuthentication()`
  - Note: This creates a session, so cookie forwarding is critical
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-registration.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/passkey/verify-registration.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.passkeyVerifyRegistration()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Create `_group.ts`

- [ ] Create file `packages/iam/infra/src/api/v1/passkey/_group.ts`
- [ ] Import all endpoint handlers
- [ ] Define `Service`, `ServiceError`, `ServiceDependencies` types
- [ ] Create `Routes` layer with `HttpApiBuilder.group(IamApi, "iam.passkey", ...)`
- [ ] Register all handlers with `.handle()` chain

#### Create `index.ts`

- [ ] Create file `packages/iam/infra/src/api/v1/passkey/index.ts`
- [ ] Export all handlers using namespace re-export pattern

#### Update parent `v1/api.ts`

- [ ] Import passkey routes: `import { Passkey } from "./passkey/_group.ts"`
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

#### `delete-passkey.ts`

- [ ] Implement `Payload` class fields:
  - `id: IamEntityIds.PasskeyId` (import from `@beep/shared-domain`)
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `generate-authenticate-options.ts`

- [ ] Verify if `UrlParams` needed (GET endpoint, check for query parameters)
- [ ] Implement `Success` class fields (WebAuthn PublicKeyCredentialRequestOptions):
  - `challenge: S.String`
  - `rp: S.optionalWith(S.Unknown, { nullable: true })` (or define proper schema)
  - `user: S.optionalWith(S.Unknown, { nullable: true })`
  - `timeout: S.optionalWith(S.Number, { nullable: true })`
  - `allowCredentials: S.optionalWith(S.Array(S.Unknown), { nullable: true })`
  - `userVerification: S.optionalWith(S.String, { nullable: true })`
  - `authenticatorSelection: S.optionalWith(S.Unknown, { nullable: true })`
  - `extensions: S.optionalWith(S.Unknown, { nullable: true })`
- [ ] Consider creating dedicated schemas for WebAuthn structures or use `S.Unknown` for complex nested objects
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `generate-register-options.ts`

- [ ] Verify if `UrlParams` needed (GET endpoint, check for query parameters)
- [ ] Implement `Success` class fields (WebAuthn PublicKeyCredentialCreationOptions):
  - `challenge: S.String`
  - `rp: S.optionalWith(S.Unknown, { nullable: true })`
  - `user: S.optionalWith(S.Unknown, { nullable: true })`
  - `pubKeyCredParams: S.optionalWith(S.Array(S.Unknown), { nullable: true })`
  - `timeout: S.optionalWith(S.Number, { nullable: true })`
  - `excludeCredentials: S.optionalWith(S.Array(S.Unknown), { nullable: true })`
  - `authenticatorSelection: S.optionalWith(S.Unknown, { nullable: true })`
  - `attestation: S.optionalWith(S.String, { nullable: true })`
  - `extensions: S.optionalWith(S.Unknown, { nullable: true })`
- [ ] Consider creating dedicated schemas for WebAuthn structures or use `S.Unknown` for complex nested objects
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `list-user-passkeys.ts`

- [ ] Verify if `UrlParams` needed (GET endpoint, check for query parameters)
- [ ] Implement `Success` class fields:
  - Note: Spec is vague ("Passkeys retrieved successfully"). Check Better Auth types or SCHEMAS.md for Passkey array structure
  - Likely: `passkeys: S.Array(Passkey.Model)` or similar
- [ ] Import Passkey entity if available from `@beep/iam-domain/entities` or define inline
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `update-passkey.ts`

- [ ] Implement `Payload` class fields:
  - `id: IamEntityIds.PasskeyId` (import from `@beep/shared-domain`)
  - `name: S.String`
- [ ] Implement `Success` class fields:
  - `passkey: Passkey.Model.jsonUpdate` (use update variant for passkey modifications)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-authentication.ts`

- [ ] Implement `Payload` class fields:
  - `response: S.String` (WebAuthn credential response as JSON string)
- [ ] Implement `Success` class fields:
  - `session: S.optionalWith(Session.Model.json, { nullable: true })` (import from `@beep/shared-domain/entities`)
  - `user: S.optionalWith(User.Model.json, { nullable: true })` (import from `@beep/shared-domain/entities`)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-registration.ts`

- [ ] Implement `Payload` class fields:
  - `response: S.String` (WebAuthn credential response as JSON string)
  - `name: S.optionalWith(S.String, { nullable: true })`
- [ ] Implement `Success` class:
  - Note: Spec indicates "See Passkey schema" - the entire response IS a Passkey object (not wrapped)
  - Use `Passkey.Model.jsonCreate` variant for passkey creation
  - Check SCHEMAS.md#passkey for exact structure
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

**Helper Selection**: See `packages/iam/infra/src/api/common/schema-helpers.ts` for available helpers. Import:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

#### `delete-passkey.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthCommand` - POST returning `{ status: true }`
  - Call `auth.api.passkeyDeletePasskey()` via helper
  - Success value: `{ status: true }`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `generate-authenticate-options.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET request, returns WebAuthn options
  - Call `auth.api.passkeyGenerateAuthenticateOptions()` via helper
  - Success schema: `V1.Passkey.GenerateAuthenticateOptions.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `generate-register-options.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET request, returns WebAuthn options
  - Call `auth.api.passkeyGenerateRegisterOptions()` via helper
  - Success schema: `V1.Passkey.GenerateRegisterOptions.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `list-user-passkeys.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthQuery` - GET request, returns passkeys array
  - Call `auth.api.passkeyListUserPasskeys()` via helper
  - Success schema: `V1.Passkey.ListUserPasskeys.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `update-passkey.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns passkey object
  - Call `auth.api.passkeyUpdatePasskey()` via helper
  - Payload fields: `id`, `name` (auto-encoded)
  - Success schema: `V1.Passkey.UpdatePasskey.Success`
  - Cookie forwarding handled automatically
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-authentication.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns session/user (creates session)
  - Call `auth.api.passkeyVerifyAuthentication()` via helper
  - Payload fields: `response` (WebAuthn credential response JSON, auto-encoded)
  - Success schema: `V1.Passkey.VerifyAuthentication.Success`
  - Cookie forwarding handled automatically (CRITICAL - this creates a session)
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-registration.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns passkey object
  - Call `auth.api.passkeyVerifyRegistration()` via helper
  - Payload fields: `response`, `name` (auto-encoded)
  - Success schema: `V1.Passkey.VerifyRegistration.Success`
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

1. **WebAuthn Complexity**: The `generate-authenticate-options` and `generate-register-options` endpoints return complex WebAuthn structures. Consider using `S.Unknown` for nested objects initially, then refine with proper schemas if needed.

2. **Passkey Entity**: The Passkey entity may need to be defined in `@beep/iam-domain/entities` if it doesn't already exist. Check SCHEMAS.md#passkey for structure and create corresponding Model schema.

3. **Response Encoding**: The `verify-authentication` and `verify-registration` endpoints receive WebAuthn credential responses as JSON strings. These are typically complex nested objects serialized by the browser's WebAuthn API.

4. **Session Creation**: The `verify-authentication` endpoint creates a session, so cookie forwarding is absolutely critical for proper authentication flow.

5. **GET vs POST**: Three endpoints are GET requests (generate-authenticate-options, generate-register-options, list-user-passkeys). Ensure handlers use `urlParams` instead of `payload` if query parameters exist.

6. **Passkey Naming**: The `update-passkey` endpoint allows users to set friendly names for their passkeys (e.g., "MacBook Touch ID", "YubiKey 5"). The `verify-registration` endpoint also accepts an optional name during registration.

7. **Deletion**: The `delete-passkey` endpoint removes a specific passkey by ID. Ensure users have at least one authentication method remaining after deletion.

8. **List Response Structure**: The spec for `list-user-passkeys` doesn't provide detailed response structure. Inspect Better Auth types (`auth.api.passkey.listUserPasskeys`) to determine exact return type.

9. **Optional Fields**: Most success response fields are marked as optional in the spec. Use `S.optionalWith` with `nullable: true` for proper nullable semantics.

10. **Schema References**: The spec references SCHEMAS.md#passkey and SCHEMAS.md#session. Ensure these entity models are imported from `@beep/iam-domain/entities` or defined based on SCHEMAS.md.

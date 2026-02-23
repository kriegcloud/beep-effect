# Milestone 6: Account Linking

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/CORE.md](../better-auth-specs/CORE.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**Next Action**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (4 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements account linking functionality, allowing users to connect and manage OAuth provider accounts. Users can link social accounts (Google, GitHub, etc.), view all linked accounts, get detailed account information from providers, and unlink accounts they no longer wish to use.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /link-social | `v1/core/link-social.ts` | `v1/core/link-social.ts` | `linkSocial` |
| POST | /unlink-account | `v1/core/unlink-account.ts` | `v1/core/unlink-account.ts` | `unlinkAccount` |
| GET | /list-accounts | `v1/core/list-accounts.ts` | `v1/core/list-accounts.ts` | `listAccounts` |
| GET | /account-info | `v1/core/account-info.ts` | `v1/core/account-info.ts` | `accountInfo` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `link-social.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/link-social.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /link-social`
  - Spec reference anchor: `.specs/better-auth-specs/CORE.md#post-link-social`
  - Better Auth method name: `linkSocial`
  - Implementation requirements from spec:
    - Handle OAuth provider redirect flow
    - Support optional scopes for additional permissions
    - Handle both redirect and non-redirect modes
    - Forward error callback URL for failed linking attempts
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `provider: S.String` (required) - OAuth provider identifier
    - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })` - Redirect URL after linking
    - `idToken: S.optionalWith(S.Unknown, { nullable: true })` - ID token for token-based linking
    - `requestSignUp: S.optionalWith(S.Boolean, { as: "Option" })` - Flag to request sign-up
    - `scopes: S.optionalWith(S.Array(S.Unknown), { nullable: true })` - Additional provider scopes
    - `errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option" })` - Error redirect URL
    - `disableRedirect: S.optionalWith(S.Boolean, { default: F.constFalse })` - Disable auto-redirect
    - `additionalData: S.optionalWith(S.String, { as: "Option" })` - Extra provider data
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `url: S.optionalWith(BS.URLString, { as: "Option" })` - Authorization URL
    - `redirect: S.Boolean` (required) - Whether to redirect to authorization URL
    - `status: S.optionalWith(S.Boolean, { as: "Option" })` - Linking status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `unlink-account.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/unlink-account.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /unlink-account`
  - Spec reference anchor: `.specs/better-auth-specs/CORE.md#post-unlink-account`
  - Better Auth method name: `unlinkAccount`
  - Implementation requirements from spec:
    - Remove OAuth provider account association
    - Validate user has at least one remaining authentication method
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `providerId: S.String` (required) - Provider identifier to unlink (e.g., "google", "github")
    - `accountId: S.optionalWith(S.String, { as: "Option" })` - Specific account ID (provider-given identifier, not our AccountId)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `status: S.optionalWith(S.Boolean, { as: "Option" })` - Unlinking status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `list-accounts.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/list-accounts.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `GET /list-accounts`
  - Spec reference anchor: `.specs/better-auth-specs/CORE.md#get-list-accounts`
  - Better Auth method name: `listAccounts`
  - Implementation requirements from spec:
    - Retrieve all OAuth accounts linked to current user
    - Return minimal response schema (spec shows "Success" generic response)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment: Spec shows generic success response - investigate Better Auth actual return type
  - Placeholder: `S.Struct({ status: S.Boolean })` (update during implementation)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint, no payload)
- [ ] Update `index.ts` barrel export

#### `account-info.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/account-info.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `GET /account-info`
  - Spec reference anchor: `.specs/better-auth-specs/CORE.md#get-account-info`
  - Better Auth method name: `accountInfo`
  - Implementation requirements from spec:
    - Fetch detailed account information from OAuth provider
    - Requires accountId query parameter
    - Return provider-specific user data (email, name, image, raw data)
- [ ] Add `UrlParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `accountId: S.String` (required) - Provider-given account identifier
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `email: S.optionalWith(S.String, { as: "Option" })` - Email from provider
    - `name: S.optionalWith(S.String, { as: "Option" })` - User name from provider
    - `image: S.optionalWith(BS.URLString, { as: "Option" })` - Profile image URL
    - `provider: S.String` - OAuth provider name
    - `providerAccountId: S.String` - Account ID from provider
    - `raw: S.optionalWith(S.Unknown, { as: "Option" })` - Additional provider-specific data
- [ ] Add `Contract` export with complete JSDoc (GET endpoint with URL params)
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as LinkSocial from "./link-social.ts"`
- [ ] Import `* as UnlinkAccount from "./unlink-account.ts"`
- [ ] Import `* as ListAccounts from "./list-accounts.ts"`
- [ ] Import `* as AccountInfo from "./account-info.ts"`
- [ ] Add `.add(LinkSocial.Contract)` to Group class
- [ ] Add `.add(UnlinkAccount.Contract)` to Group class
- [ ] Add `.add(ListAccounts.Contract)` to Group class
- [ ] Add `.add(AccountInfo.Contract)` to Group class

### Boilerplate Infra Handlers

**Helper Selection**: See PATTERNS.md 'Infra Handler Helpers' section for detailed usage.

#### `link-social.ts`

**Recommended Helper**: `runAuthEndpoint` - POST endpoint with payload and decoded response (no Redacted fields)

- [ ] Create stub file `packages/iam/server/src/api/v1/core/link-social.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type: `Common.HandlerEffect<V1.Core.LinkSocial.Payload>`
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.linkSocial()` with mapped payload
    - Handle both redirect and non-redirect modes
    - Forward `set-cookie` header
    - Decode response with `V1.Core.LinkSocial.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `unlink-account.ts`

**Recommended Helper**: `runAuthCommand` - POST endpoint returning fixed `{ status: true }` response

- [ ] Create stub file `packages/iam/server/src/api/v1/core/unlink-account.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type: `Common.HandlerEffect<V1.Core.UnlinkAccount.Payload>`
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.unlinkAccount()` with mapped payload
    - Forward `set-cookie` header
    - Use fixed success value (no response decoding needed)
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `list-accounts.ts`

**Recommended Helper**: `runAuthQuery` - GET endpoint with decoded response

- [ ] Create stub file `packages/iam/server/src/api/v1/core/list-accounts.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type: `Common.HandlerEffect<void>` (no URL params in spec)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.listAccounts()` (no parameters)
    - Forward `set-cookie` header
    - Decode response with `V1.Core.ListAccounts.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `account-info.ts`

**Recommended Helper**: `runAuthQuery` - GET endpoint with URL params and decoded response

- [ ] Create stub file `packages/iam/server/src/api/v1/core/account-info.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type: `Common.HandlerEffect<V1.Core.AccountInfo.UrlParams>`
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.accountInfo()` with query param `{ accountId }`
    - Forward `set-cookie` header
    - Decode response with `V1.Core.AccountInfo.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as LinkSocial from "./link-social.ts"`
- [ ] Import `* as UnlinkAccount from "./unlink-account.ts"`
- [ ] Import `* as ListAccounts from "./list-accounts.ts"`
- [ ] Import `* as AccountInfo from "./account-info.ts"`
- [ ] Add `.handle("link-social", LinkSocial.Handler)` to Routes
- [ ] Add `.handle("unlink-account", UnlinkAccount.Handler)` to Routes
- [ ] Add `.handle("list-accounts", ListAccounts.Handler)` to Routes
- [ ] Add `.handle("account-info", AccountInfo.Handler)` to Routes

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `link-social.ts`

- [ ] Implement `Payload` class fields:
  - `provider: S.String`
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })`
  - `idToken: S.optionalWith(S.Unknown, { nullable: true })`
  - `requestSignUp: S.optionalWith(S.Boolean, { as: "Option" })`
  - `scopes: S.optionalWith(S.Array(S.Unknown), { nullable: true })`
  - `errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option" })`
  - `disableRedirect: S.optionalWith(S.Boolean, { default: F.constFalse })`
  - `additionalData: S.optionalWith(S.String, { as: "Option" })`
- [ ] Implement `Success` class fields:
  - `url: S.optionalWith(BS.URLString, { as: "Option" })`
  - `redirect: S.Boolean`
  - `status: S.optionalWith(S.Boolean, { as: "Option" })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `unlink-account.ts`

- [ ] Implement `Payload` class fields:
  - `providerId: S.String` (provider identifier like "google", "github")
  - `accountId: S.optionalWith(S.String, { as: "Option" })` (provider-given identifier)
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { as: "Option" })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `list-accounts.ts`

- [ ] Investigate Better Auth actual return type for `listAccounts()`
- [ ] Implement `Success` class fields based on actual API response
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `account-info.ts`

- [ ] Implement `UrlParams` class fields:
  - `accountId: S.String` (provider-given account identifier)
- [ ] Implement `Success` class fields:
  - `email: S.optionalWith(S.String, { as: "Option" })`
  - `name: S.optionalWith(S.String, { as: "Option" })`
  - `image: S.optionalWith(BS.URLString, { as: "Option" })`
  - `provider: S.String`
  - `providerAccountId: S.String`
  - `raw: S.optionalWith(S.Unknown, { as: "Option" })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

#### `link-social.ts`

**Helper**: `runAuthEndpoint` - Handles payload encoding, response decoding, and cookie forwarding

- [ ] Implement `Handler` logic:
  - Use `runAuthEndpoint` with:
    - `payloadSchema: V1.Core.LinkSocial.Payload`
    - `successSchema: V1.Core.LinkSocial.Success`
    - `authHandler` calling `auth.api.linkSocial()` with encoded body
  - Handle `scopes` array properly in payload
  - Handle both redirect and non-redirect modes
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `unlink-account.ts`

**Helper**: `runAuthCommand` - Returns fixed success value without decoding response

- [ ] Implement `Handler` logic:
  - Use `runAuthCommand` with:
    - `successValue: { status: true }` (fixed literal)
    - `authHandler` calling `auth.api.unlinkAccount()` with payload fields
  - Handle `providerId` and optional `accountId`
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `list-accounts.ts`

**Helper**: `runAuthQuery` - GET endpoint with response decoding and cookie forwarding

- [ ] Implement `Handler` logic:
  - Use `runAuthQuery` with:
    - `successSchema: V1.Core.ListAccounts.Success`
    - `authHandler` calling `auth.api.listAccounts()` (no body/params)
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `account-info.ts`

**Helper**: `runAuthQuery` - GET endpoint with URL params, response decoding, and cookie forwarding

- [ ] Implement `Handler` logic:
  - Use `runAuthQuery` with:
    - `successSchema: V1.Core.AccountInfo.Success`
    - `authHandler` calling `auth.api.accountInfo()` with query param `{ accountId }`
  - Handle case where provider is automatically detected from accountId
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Special Considerations

1. **link-social endpoint**: This endpoint has complex OAuth flow handling with multiple modes:
   - Redirect mode: Returns authorization URL and sets `redirect: true`
   - Non-redirect mode: Allows client-side redirect control via `disableRedirect: true`
   - Error handling: Supports custom error callback URL

2. **list-accounts endpoint**: The spec shows a generic "Success" response. During implementation, verify the actual Better Auth API response shape - it likely returns an array of account objects.

3. **account-info endpoint**:
   - Requires `accountId` query parameter
   - Provider is automatically detected from the account ID
   - Returns structured data: `email`, `name`, `image`, `provider`, `providerAccountId`, and `raw` (provider-specific data)
   - The `raw` field contains additional provider-specific data as `Unknown` type

4. **Security**: All endpoints require authenticated sessions. Verify session existence before calling Better Auth methods.

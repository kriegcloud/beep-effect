# Milestone 13: OAuth2

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/OAUTH2.md](../better-auth-specs/OAUTH2.md)
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

This milestone implements OAuth 2.0 provider endpoints, allowing the application to act as an OAuth2 authorization server. This includes authorization flows, token management, client registration, and user information endpoints.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Handling |
|--------|------|-------------|------------|-------------------|
| GET | /oauth2/authorize | `v1/oauth2/authorize.ts` | `v1/oauth2/authorize.ts` | Auto-handled by `oidcProvider()` plugin |
| GET | /oauth2/callback/:providerId | `v1/oauth2/callback.ts` | `v1/oauth2/callback.ts` | Auto-handled by `oidcProvider()` plugin |
| GET | /oauth2/client/:id | `v1/oauth2/get-client.ts` | `v1/oauth2/get-client.ts` | Auto-handled by `oidcProvider()` plugin |
| POST | /oauth2/consent | `v1/oauth2/consent.ts` | `v1/oauth2/consent.ts` | Auto-handled by `oidcProvider()` plugin |
| POST | /oauth2/link | `v1/oauth2/link.ts` | `v1/oauth2/link.ts` | Auto-handled by `oidcProvider()` plugin |
| POST | /oauth2/register | `v1/oauth2/register.ts` | `v1/oauth2/register.ts` | Auto-handled by `oidcProvider()` plugin |
| POST | /oauth2/token | `v1/oauth2/token.ts` | `v1/oauth2/token.ts` | Auto-handled by `oidcProvider()` plugin |
| GET | /oauth2/userinfo | `v1/oauth2/userinfo.ts` | `v1/oauth2/userinfo.ts` | Auto-handled by `oidcProvider()` plugin |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `authorize.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/authorize.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method
  - Spec reference anchor
  - Better Auth method name
  - Implementation requirements from spec
- [ ] Add `UrlParams` class stub (GET request) with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting spec lacks field details - check Better Auth types
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting spec lacks field details - check Better Auth types
  - Note: May return redirect or HTML instead of JSON
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `callback.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/callback.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `PathParams` class stub for `:providerId` (path parameter)
- [ ] Add `UrlParams` class stub for query parameters (code, error, error_description, state)
- [ ] Add `Success` class stub with `url` field (nullable)
- [ ] Add `Contract` export with complete JSDoc, using both `.setPath(PathParams)` and `.setUrlParams(UrlParams)`
- [ ] Update `index.ts` barrel export

#### `get-client.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/get-client.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `PathParams` class stub for `:id` (path parameter)
- [ ] Add `Success` class stub with clientId, name, icon fields
- [ ] Add `Contract` export with complete JSDoc, using `.setPath(PathParams)`
- [ ] Update `index.ts` barrel export

#### `consent.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/consent.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Payload` class stub with accept, consent_code fields
- [ ] Add `Success` class stub with redirectURI field
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `link.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/link.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Payload` class stub with providerId, callbackURL, scopes, errorCallbackURL fields
- [ ] Add `Success` class stub with url, redirect fields
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `register.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/register.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Payload` class stub with redirect_uris, token_endpoint_auth_method, grant_types, response_types, client_name, client_uri, logo_uri, scope, contacts, tos_uri, policy_uri, jwks_uri, jwks, metadata, software_id, software_version, software_statement fields
- [ ] Add `Success` class stub with name, icon, metadata, clientId, clientSecret, redirectURLs, type, authenticationScheme, disabled, userId, createdAt, updatedAt fields
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `token.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/token.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Payload` class stub with TODO for fields (spec lacks details)
- [ ] Add `Success` class stub with TODO for fields (spec lacks details)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `userinfo.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/oauth2/userinfo.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Success` class stub with sub, email, name, picture, given_name, family_name, email_verified fields
- [ ] Add `Contract` export with complete JSDoc (note: no request body/params)
- [ ] Update `index.ts` barrel export

#### Create Group Files

- [ ] Create `packages/iam/domain/src/api/v1/oauth2/_group.ts`
- [ ] Import all endpoint contracts
- [ ] Create Group class extending HttpApiGroup.make("iam.oauth2")
- [ ] Add all contracts with `.add()` calls
- [ ] Add `.prefix("/oauth2")` to Group
- [ ] Export all endpoint namespaces
- [ ] Create `packages/iam/domain/src/api/v1/oauth2/index.ts` barrel export

#### Update Parent V1 API

- [ ] Import OAuth2 group in `packages/iam/domain/src/api/v1/api.ts`
- [ ] Add OAuth2.Group to the V1 Api class
- [ ] Export OAuth2 namespace from `packages/iam/domain/src/api/v1/index.ts`

### Boilerplate Infra Handlers

#### `authorize.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/authorize.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `callback.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/callback.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses PathParams + UrlParams)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `get-client.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/get-client.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses PathParams)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `consent.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/consent.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `link.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/link.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `register.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/register.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `token.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `userinfo.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/oauth2/userinfo.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (no params)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### Create Group Files

- [ ] Create `packages/iam/server/src/api/v1/oauth2/_group.ts`
- [ ] Import all endpoint handlers
- [ ] Define Service, ServiceError, ServiceDependencies types
- [ ] Create Routes layer with HttpApiBuilder.group()
- [ ] Register all handlers with `.handle()` calls
- [ ] Create `packages/iam/server/src/api/v1/oauth2/index.ts` barrel export

#### Update Parent V1 API

- [ ] Import OAuth2 routes in `packages/iam/server/src/api/v1/api.ts`
- [ ] Add OAuth2.Routes to V1.ApiLive layer
- [ ] Export OAuth2 namespace from `packages/iam/server/src/api/v1/index.ts`

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files created and registered
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

**Import EntityIds**:
```typescript
import { SharedEntityIds } from "@beep/shared-domain";
```

#### `authorize.ts`

- [ ] Implement `UrlParams` class (no specific fields documented in spec - check Better Auth types)
- [ ] Implement `Success` class (no specific fields documented in spec - check Better Auth types)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `callback.ts`

- [ ] Implement `PathParams` class:
  - `providerId: S.String`
- [ ] Implement `UrlParams` class:
  - `code: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `error: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `error_description: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `state: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class:
  - `url: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `get-client.ts`

- [ ] Implement `PathParams` class:
  - `id: S.String` (maps to `:id` in path)
- [ ] Implement `Success` class:
  - `clientId: S.String`
  - `name: S.String`
  - `icon: S.optionalWith(BS.URLString, { as: "Option", nullable: true })` (icon URL)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `consent.ts`

- [ ] Implement `Payload` class:
  - `accept: S.Boolean`
  - `consent_code: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class:
  - `redirectURI: BS.URLString` (Note: field name is `redirectURI`, not `redirect_uri`)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `link.ts`

- [ ] Implement `Payload` class:
  - `providerId: S.String`
  - `callbackURL: BS.URLString` (full URL required)
  - `scopes: S.optionalWith(S.Array(S.String), { as: "Option", nullable: true })` (array of scope strings)
  - `errorCallbackURL: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
- [ ] Implement `Success` class:
  - `url: BS.URLString`
  - `redirect: S.Boolean`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `register.ts`

- [ ] Implement `Payload` class with all fields:
  - `redirect_uris: S.Array(S.String)` (required - array of redirect URI strings)
  - `token_endpoint_auth_method: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `grant_types: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `response_types: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `client_name: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `client_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `logo_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `scope: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `contacts: S.optionalWith(S.Array(S.String), { as: "Option", nullable: true })` (email addresses)
  - `tos_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `policy_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `jwks_uri: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `jwks: S.optionalWith(S.Unknown, { as: "Option", nullable: true })` (JWKS object)
  - `metadata: S.optionalWith(S.Unknown, { as: "Option", nullable: true })` (metadata object)
  - `software_id: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `software_version: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `software_statement: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class (use `OAuthApplication.Model.jsonCreate` for guidance):
  - `name: S.String`
  - `icon: S.optionalWith(BS.URLString, { as: "Option", nullable: true })` (icon URL)
  - `metadata: S.optionalWith(S.Unknown, { as: "Option", nullable: true })`
  - `clientId: S.String`
  - `clientSecret: S.String`
  - `redirectURLs: S.Array(BS.URLString)`
  - `type: S.String`
  - `authenticationScheme: S.String`
  - `disabled: S.Boolean`
  - `userId: S.optionalWith(SharedEntityIds.UserId, { as: "Option", nullable: true })`
  - `createdAt: BS.DateTimeUtcFromAllAcceptable`
  - `updatedAt: BS.DateTimeUtcFromAllAcceptable`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `token.ts`

- [ ] Research OAuth2 token endpoint spec to determine fields
- [ ] Implement `Payload` class (typically: grant_type, code, redirect_uri, client_id, client_secret, refresh_token)
- [ ] Implement `Success` class (typically: access_token, token_type, expires_in, refresh_token, scope)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `userinfo.ts`

- [ ] Implement `Success` class:
  - `sub: S.String`
  - `email: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `name: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `picture: S.optionalWith(BS.URLString, { as: "Option", nullable: true })`
  - `given_name: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `family_name: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `email_verified: S.optionalWith(S.Boolean, { as: "Option", nullable: true })`
- [ ] Update JSDoc @example (note: no request payload)
- [ ] Remove TODO comments

### 2. Infra Handlers

**Helper Selection**: OAuth2 endpoints are **plugin-managed** by Better Auth's `oidcProvider()` plugin. Most endpoints require **manual proxying** using `forwardCookieResponse`, NOT the standard helpers.

Import:
```typescript
import { forwardCookieResponse } from "../../common/schema-helpers";
```

#### `authorize.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse` (no standard helper applies)
  - **IMPORTANT**: Better Auth `oidcProvider()` plugin auto-handles this endpoint
  - Handler should **proxy/forward** the request to Better Auth's internal handler
  - Do NOT call `auth.api.*` methods - they don't exist for OAuth2 provider endpoints
  - Forward all query params and headers to Better Auth handler
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `callback.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - Extract `providerId` from path params
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward all query params and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `get-client.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - Extract `id` from path params
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward path params and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `consent.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `link.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `register.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `token.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `userinfo.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse`
  - **IMPORTANT**: Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward headers (requires authentication) to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### CRITICAL: OAuth2 Provider Architecture

**Better Auth does NOT expose `auth.api.oauth2.*` methods.**

The `oidcProvider()` plugin **automatically handles all OAuth2 provider endpoints internally**. Your handlers should:

1. **Proxy/forward requests** to Better Auth's internal request handler
2. **NOT** attempt to call `auth.api.oauth2.*` methods (they don't exist)
3. Forward all request data (params, body, headers) to Better Auth
4. Forward response headers (especially `set-cookie`) back to the client

**Example pattern:**
```typescript
export const Handler = HttpServerRequest.HttpServerRequest.pipe(
  Effect.flatMap((request) => {
    // Extract and validate params using domain contract
    const params = yield* /* decode params */;

    // Forward entire request to Better Auth internal handler
    // Better Auth will handle the OAuth2 logic
    return yield* /* proxy to Better Auth */;
  })
);
```

This is fundamentally different from the sign-in/sign-up endpoints where explicit `auth.api.*` methods exist.

### Path Parameters

Multiple endpoints use path parameters (`:providerId`, `:id`). Ensure proper `PathParams` class definitions and use `.setPath()` in the contract.

### OAuth2 Token Endpoint

The `/oauth2/token` endpoint spec lacks detailed field information in the OpenAPI spec. During implementation:
1. Check Better Auth TypeScript types for `oauth2.token` method signature
2. Refer to [RFC 6749 Section 4.1.3](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3) for standard OAuth2 token request/response formats
3. Common fields include:
   - **Request**: `grant_type`, `code`, `redirect_uri`, `client_id`, `client_secret`, `refresh_token`
   - **Response**: `access_token`, `token_type`, `expires_in`, `refresh_token`, `scope`

### Scopes and Arrays

The `scopes` field in `/oauth2/link` should use `S.Array(S.String)` as scopes are string values. The `contacts` field in `/oauth2/register` should also use `S.Array(S.String)` for email addresses. The `redirect_uris` field must use `S.Array(S.String)` for URI strings.

### Cookie vs URL Parameter Flow

The `/oauth2/consent` endpoint supports both cookie-based flows (signed cookie) and URL parameter flows (consent_code in body). Ensure the handler accommodates both patterns.

### SAML Endpoints

Note that SAML endpoints are in M14 (SSO), not M13. OAuth2 endpoints are strictly OAuth 2.0 protocol flows.

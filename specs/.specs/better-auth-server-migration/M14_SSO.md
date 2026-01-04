# Milestone 14: SSO

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/SSO.md](../better-auth-specs/SSO.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## API Method Verification Summary

**Verified Against**: Better Auth official documentation via WebFetch + Context7

**Key Findings**:
1. ✅ Better Auth DOES have explicit SSO API methods (user was correct)
2. ⚠️ The OpenAPI spec is INCOMPLETE - missing 2 critical endpoints
3. ✅ `organizationId` parameter confirmed for linking SSO providers to organizations
4. ✅ Mixed endpoint pattern: some auto-handled, some with explicit API methods

**Verified API Methods**:
- `auth.api.registerSSOProvider()` - Register OIDC/SAML providers
- `auth.api.spMetadata()` - Get SAML Service Provider metadata
- `auth.api.verifyDomain()` - Verify domain ownership via DNS
- `auth.api.requestDomainVerification()` - Request new verification token

**Auto-Handled Endpoints** (proxy pattern, no explicit API method):
- `/sso/callback/:providerId` - OIDC callback
- `/sso/saml2/callback/:providerId` - SAML callback
- `/sso/saml2/sp/acs/:providerId` - SAML Assertion Consumer Service

**Missing from OpenAPI Spec**:
- `POST /sso/verify-domain` - Domain verification (REQUIRED for production)
- `POST /sso/request-domain-verification` - Token refresh (REQUIRED for production)

These must be added to the implementation.

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (7 endpoints - spec missing 2 domain verification endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements Enterprise SSO (Single Sign-On) and SAML 2.0 endpoints. These endpoints enable integration with enterprise identity providers using both OIDC and SAML protocols, allowing organizations to manage authentication through their existing identity infrastructure.

**IMPORTANT**: The OpenAPI spec only lists 5 endpoints, but Better Auth SSO includes 7 endpoints total. The spec is missing:
- `POST /sso/verify-domain` - Domain ownership verification
- `POST /sso/request-domain-verification` - Token refresh for expired verification tokens

These endpoints are required for the complete domain verification workflow and must be implemented.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| GET | /sso/callback/:providerId | `v1/sso/callback.ts` | `v1/sso/callback.ts` | Auto-handled by `sso()` plugin |
| POST | /sso/register | `v1/sso/register.ts` | `v1/sso/register.ts` | `auth.api.registerSSOProvider()` |
| POST | /sso/saml2/callback/:providerId | `v1/sso/saml2-callback.ts` | `v1/sso/saml2-callback.ts` | Auto-handled by `sso()` plugin |
| POST | /sso/saml2/sp/acs/:providerId | `v1/sso/saml2-sp-acs.ts` | `v1/sso/saml2-sp-acs.ts` | Auto-handled by `sso()` plugin |
| GET | /sso/saml2/sp/metadata | `v1/sso/saml2-sp-metadata.ts` | `v1/sso/saml2-sp-metadata.ts` | `auth.api.spMetadata()` |
| POST | /sso/verify-domain | `v1/sso/verify-domain.ts` | `v1/sso/verify-domain.ts` | `auth.api.verifyDomain()` |
| POST | /sso/request-domain-verification | `v1/sso/request-domain-verification.ts` | `v1/sso/request-domain-verification.ts` | `auth.api.requestDomainVerification()` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `callback.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/callback.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method
  - Spec reference anchor
  - Better Auth method name
  - Implementation requirements from spec
- [ ] Add `PathParams` class stub for `:providerId` (path parameter)
- [ ] Add `UrlParams` class stub for query parameters (code, state, error, error_description)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting spec lacks response details - check Better Auth types
  - Note: May return redirect response instead of JSON
- [ ] Add `Contract` export with complete JSDoc, using both `.setPath(PathParams)` and `.setUrlParams(UrlParams)`
- [ ] Update `index.ts` barrel export

#### `register.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/register.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `Payload` class stub with providerId, issuer, domain, oidcConfig, samlConfig, organizationId, overrideUserInfo fields
- [ ] Add `Success` class stub with issuer, domain, domainVerified, domainVerificationToken, oidcConfig, organizationId, userId, providerId, redirectURI fields
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `saml2-callback.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/saml2-callback.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `PathParams` class stub for `:providerId` (path parameter)
- [ ] Add `Payload` class stub with SAMLResponse, RelayState fields
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting spec lacks response details - likely returns redirect
- [ ] Add `Contract` export with complete JSDoc, using both `.setPath(PathParams)` and `.setPayload(Payload)`
- [ ] Update `index.ts` barrel export

#### `saml2-sp-acs.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/saml2-sp-acs.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `PathParams` class stub for `:providerId` (path parameter)
- [ ] Add `Payload` class stub with SAMLResponse, RelayState fields
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting spec lacks response details - likely returns redirect
- [ ] Add `Contract` export with complete JSDoc, using both `.setPath(PathParams)` and `.setPayload(Payload)`
- [ ] Update `index.ts` barrel export

#### `saml2-sp-metadata.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/saml2-sp-metadata.ts`
- [ ] Fill module-level JSDoc
- [ ] Add `UrlParams` class stub with providerId, format fields
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting XML response format
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-domain.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/verify-domain.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method
  - Spec reference: "Not in OpenAPI spec - from Better Auth SSO docs"
  - Better Auth method name: `auth.api.verifyDomain()`
  - Purpose: Validates domain ownership via DNS TXT record
- [ ] Add `Payload` class stub with providerId field
- [ ] Add `Success` class stub with:
  - success: boolean
  - message: string
  - Complete JSDoc (@category, @example, @since)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `request-domain-verification.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/sso/request-domain-verification.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method
  - Spec reference: "Not in OpenAPI spec - from Better Auth SSO docs"
  - Better Auth method name: `auth.api.requestDomainVerification()`
  - Purpose: Generates new verification token when previous one expires (default: 1 week)
- [ ] Add `Payload` class stub with providerId field
- [ ] Add `Success` class stub with:
  - verificationToken: string
  - tokenPrefix: string
  - expiresAt: epoch milliseconds (number) - Better Auth uses epoch millis for all expiresAt fields
  - Complete JSDoc (@category, @example, @since)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Create Group Files

- [ ] Create `packages/iam/domain/src/api/v1/sso/_group.ts`
- [ ] Import all endpoint contracts
- [ ] Create Group class extending HttpApiGroup.make("iam.sso")
- [ ] Add all contracts with `.add()` calls
- [ ] Add `.prefix("/sso")` to Group
- [ ] Export all endpoint namespaces
- [ ] Create `packages/iam/domain/src/api/v1/sso/index.ts` barrel export

#### Update Parent V1 API

- [ ] Import SSO group in `packages/iam/domain/src/api/v1/api.ts`
- [ ] Add SSO.Group to the V1 Api class
- [ ] Export SSO namespace from `packages/iam/domain/src/api/v1/index.ts`

### Boilerplate Infra Handlers

#### `callback.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/callback.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses PathParams + UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `register.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/register.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `saml2-callback.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/saml2-callback.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses PathParams + Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `saml2-sp-acs.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/saml2-sp-acs.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses PathParams + Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `saml2-sp-metadata.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/saml2-sp-metadata.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (uses UrlParams)
- [ ] Add `Handler` stub with TODO and placeholder noting XML response
- [ ] Update `index.ts` barrel export

#### `verify-domain.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/verify-domain.ts`
- [ ] Fill module-level JSDoc with:
  - Better Auth method: `auth.api.verifyDomain()`
  - Note: Requires active session (authentication headers)
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### `request-domain-verification.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/sso/request-domain-verification.ts`
- [ ] Fill module-level JSDoc with:
  - Better Auth method: `auth.api.requestDomainVerification()`
  - Note: Requires active session (authentication headers)
- [ ] Add `HandlerEffect` type with JSDoc (uses Payload)
- [ ] Add `Handler` stub with TODO and placeholder
- [ ] Update `index.ts` barrel export

#### Create Group Files

- [ ] Create `packages/iam/server/src/api/v1/sso/_group.ts`
- [ ] Import all endpoint handlers
- [ ] Define Service, ServiceError, ServiceDependencies types
- [ ] Create Routes layer with HttpApiBuilder.group()
- [ ] Register all handlers with `.handle()` calls
- [ ] Create `packages/iam/server/src/api/v1/sso/index.ts` barrel export

#### Update Parent V1 API

- [ ] Import SSO routes in `packages/iam/server/src/api/v1/api.ts`
- [ ] Add SSO.Routes to V1.ApiLive layer
- [ ] Export SSO namespace from `packages/iam/server/src/api/v1/index.ts`

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

#### `callback.ts`

- [ ] Implement `PathParams` class:
  - `providerId: S.String` (maps to `:providerId` in path)
- [ ] Implement `UrlParams` class:
  - `code: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `state: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `error: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `error_description: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class (check Better Auth types - may be empty if endpoint redirects)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `register.ts`

- [ ] Implement `Payload` class (use `SsoProvider.Model.jsonCreate` for guidance):
  - `providerId: S.String`
  - `issuer: BS.URLString` (issuer URL)
  - `domain: S.String`
  - `oidcConfig: S.optionalWith(S.Unknown, { as: "Option", nullable: true })` (OIDC configuration object)
  - `samlConfig: S.optionalWith(S.Unknown, { as: "Option", nullable: true })` (SAML configuration object)
  - `organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", nullable: true })`
  - `overrideUserInfo: S.optionalWith(S.Unknown, { as: "Option", nullable: true })` (callback function or config)
- [ ] Implement `Success` class (use `SsoProvider.Model.json` for guidance):
  - `issuer: BS.URLString`
  - `domain: S.String`
  - `domainVerified: S.optionalWith(S.Boolean, { as: "Option", nullable: true })`
  - `domainVerificationToken: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `oidcConfig: S.Unknown`
  - `organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", nullable: true })`
  - `userId: SharedEntityIds.UserId`
  - `providerId: S.String`
  - `redirectURI: BS.URLString`
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `saml2-callback.ts`

- [ ] Implement `PathParams` class:
  - `providerId: S.String` (maps to `:providerId` in path)
- [ ] Implement `Payload` class:
  - `SAMLResponse: S.String` (Base64-encoded SAML assertion)
  - `RelayState: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class (check Better Auth types - likely empty if endpoint redirects)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `saml2-sp-acs.ts`

- [ ] Implement `PathParams` class:
  - `providerId: S.String` (maps to `:providerId` in path)
- [ ] Implement `Payload` class:
  - `SAMLResponse: S.String` (Base64-encoded SAML assertion)
  - `RelayState: S.optionalWith(S.String, { as: "Option", nullable: true })`
- [ ] Implement `Success` class (check Better Auth types - likely empty if endpoint redirects)
- [ ] Update JSDoc @example
- [ ] Remove TODO comments

#### `saml2-sp-metadata.ts`

- [ ] Implement `UrlParams` class:
  - `providerId: S.optionalWith(S.String, { as: "Option", nullable: true })`
  - `format: S.optionalWith(S.String, { as: "Option", nullable: true })` (likely "xml" or similar)
- [ ] Implement `Success` class:
  - `S.String` for XML content (the handler will use HttpServerResponse.text, not json)
  - Add JSDoc annotation: `@remarks Returns SAML metadata in XML format`
- [ ] Update JSDoc @example (note: returns XML string, not JSON object)
- [ ] Remove TODO comments

#### `verify-domain.ts`

- [ ] Implement `Payload` class:
  - `providerId: S.String` (the provider ID to verify)
- [ ] Implement `Success` class:
  - `success: S.Boolean` (verification result)
  - `message: S.String` (human-readable result message)
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `request-domain-verification.ts`

- [ ] Implement `Payload` class:
  - `providerId: S.String` (the provider ID to get new token for)
- [ ] Implement `Success` class:
  - `verificationToken: S.String` (new token for DNS TXT record)
  - `tokenPrefix: S.String` (DNS record prefix, default: "better-auth-token-")
  - `expiresAt: BS.EpochMillisFromAllAcceptable` (epoch millis timestamp, 1 week from now)
- [ ] Update JSDoc @example with:
  - Example DNS record format: `better-auth-token-{providerId}`
  - Example verification token and expiry
- [ ] Remove TODO comments

### 2. Infra Handlers

**Helper Selection**: SSO endpoints use a **mixed pattern** - some have explicit API methods, others are plugin-managed.

Import:
```typescript
import { runAuthEndpoint, forwardCookieResponse } from "../../common/schema-helpers";
```

#### `callback.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse` (plugin-managed endpoint)
  - Extract `providerId` from path params
  - **IMPORTANT**: SSO callback is auto-handled by Better Auth `sso()` plugin
  - Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward all query params and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `register.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns SSO provider object
  - Call `auth.api.registerSSOProvider()` with payload (correct method name)
  - Decode response with `V1.SSO.Register.Success`
  - Forward `set-cookie` header
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `saml2-callback.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse` (plugin-managed endpoint)
  - Extract `providerId` from path params
  - **IMPORTANT**: SAML callback is auto-handled by Better Auth `sso()` plugin
  - Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload (SAMLResponse, RelayState) and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `saml2-sp-acs.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual proxying with `forwardCookieResponse` (plugin-managed endpoint)
  - Extract `providerId` from path params
  - **IMPORTANT**: SAML ACS is auto-handled by Better Auth `sso()` plugin
  - Proxy request to Better Auth's internal handler (no explicit API method)
  - Forward payload (SAMLResponse, RelayState) and headers to Better Auth
  - Forward `set-cookie` header from Better Auth response
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `saml2-sp-metadata.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: Manual handling - returns XML, not JSON (use `HttpServerResponse.text()`)
  - Call `auth.api.spMetadata()` with query params (correct method name)
  - Better Auth returns XML string directly
  - Use `HttpServerResponse.text()` for XML content (not JSON)
  - Set `Content-Type: application/xml` header explicitly
  - Example pattern:
    ```typescript
    const xmlContent = yield* Effect.tryPromise(() =>
      auth.api.spMetadata({ query: { providerId, format }, headers: request.headers })
    );
    return yield* F.pipe(
      HttpServerResponse.text(xmlContent),
      HttpServerResponse.setHeader("Content-Type", "application/xml")
    );
    ```
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `verify-domain.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns success/message object
  - Extract `providerId` from payload
  - Call `auth.api.verifyDomain()` with payload and headers (requires session)
  - Decode response with `V1.SSO.VerifyDomain.Success`
  - Return JSON response with success/message
- [ ] Remove placeholder
- [ ] Update JSDoc

#### `request-domain-verification.ts`

- [ ] Implement `Handler` logic:
  - **Helper**: `runAuthEndpoint` - POST with body, returns verification token object
  - Extract `providerId` from payload
  - Call `auth.api.requestDomainVerification()` with payload and headers (requires session)
  - Decode response with `V1.SSO.RequestDomainVerification.Success`
  - Return JSON response with verificationToken, tokenPrefix, expiresAt
- [ ] Remove placeholder
- [ ] Update JSDoc

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### CRITICAL: SSO Endpoint Architecture

Better Auth SSO endpoints follow a **mixed pattern**:

**Auto-handled endpoints (proxy pattern):**
- `/sso/callback/:providerId` - Auto-handled by `sso()` plugin
- `/sso/saml2/callback/:providerId` - Auto-handled by `sso()` plugin
- `/sso/saml2/sp/acs/:providerId` - Auto-handled by `sso()` plugin

These endpoints do **NOT** have explicit `auth.api.*` methods. Handlers should proxy/forward requests to Better Auth's internal handler.

**Explicit API methods:**
- `/sso/register` → `auth.api.registerSSOProvider()`
- `/sso/saml2/sp/metadata` → `auth.api.spMetadata()`

These endpoints have explicit API methods you can call.

**Use these explicit API methods:**
- ✅ `auth.api.registerSSOProvider()` - Register OIDC/SAML providers
- ✅ `auth.api.spMetadata()` - Get SAML SP metadata
- ✅ `auth.api.verifyDomain()` - Verify domain ownership
- ✅ `auth.api.requestDomainVerification()` - Request new verification token

**Do NOT use (these don't exist):**
- ❌ `auth.api.sso.callback()`
- ❌ `auth.api.sso.register()` (use `registerSSOProvider` instead)
- ❌ `auth.api.sso.saml2Callback()`
- ❌ `auth.api.sso.saml2SpAcs()`
- ❌ `auth.api.sso.saml2SpMetadata()` (use `spMetadata` instead)
- ❌ `auth.api.sso.verifyDomain()` (use `verifyDomain` at top level)
- ❌ `auth.api.sso.requestDomainVerification()` (use `requestDomainVerification` at top level)

### SSO Sign-In Initiation vs Callbacks

Better Auth provides separate methods for **initiating** SSO sign-in vs **handling** SSO callbacks:

**Sign-In Initiation** (NOT in this milestone):
- `auth.api.signInSSO()` - Server-side method to **initiate** SSO sign-in
- Redirects user to identity provider authorization page
- Supports email, domain, providerId, or organizationSlug matching
- This is typically handled by a separate `/sign-in/sso` endpoint (see M3/M4)

**Callback Handling** (THIS milestone):
- `/sso/callback/:providerId` - Handles OIDC authorization code exchange
- `/sso/saml2/callback/:providerId` - Handles SAML assertions
- `/sso/saml2/sp/acs/:providerId` - SAML Assertion Consumer Service
- These are **auto-handled** by Better Auth's `sso()` plugin
- No explicit API methods - handlers should proxy to Better Auth's internal handler

**Key Distinction:**
- `signInSSO()` = **Start** the SSO flow (user clicks "Sign in with SSO")
- Callback endpoints = **Complete** the SSO flow (IdP redirects back with auth code/assertion)

### OIDC vs SAML

This milestone handles both OIDC and SAML SSO flows:
- `/sso/callback` and `/sso/register` support OIDC SSO
- `/sso/saml2/*` endpoints handle SAML 2.0 protocol

### Path Parameters

Multiple endpoints use `:providerId` path parameter. Ensure consistent `PathParams` class definitions.

### XML Response Handling

The `/sso/saml2/sp/metadata` endpoint returns XML (SAML metadata), not JSON. The handler implementation must:
1. Set `Content-Type: application/xml` header
2. Use `HttpServerResponse.text()` or equivalent for XML content
3. Ensure the Success schema accepts string content

### SAML Response Fields

The spec lacks detailed response schemas for SAML callback and ACS endpoints. During implementation:
1. Check Better Auth TypeScript types for `sso.saml2Callback` and `sso.saml2SpAcs` return types
2. Review SAML 2.0 specification if needed
3. **Important**: These endpoints likely return redirect responses (3xx status codes with Location header) rather than JSON responses
4. The handler may need to use `HttpServerResponse.empty()` with redirect headers instead of `HttpServerResponse.json()`
5. If Better Auth performs the redirect internally, the handler may need to detect and forward the redirect response

### Organization Plugin Integration

The `/sso/register` endpoint supports optional `organizationId` field when the organization plugin is enabled. This links the SSO provider to a specific organization for multi-tenant scenarios.

**Organization Linking via `organizationId`:**

When registering an SSO provider, you can link it to a specific organization:

```typescript
await auth.api.registerSSOProvider({
  body: {
    providerId: "acme-corp-saml",
    issuer: "https://acme-corp.okta.com",
    domain: "acmecorp.com",
    organizationId: "org_acme_corp_id",  // Links provider to organization
    samlConfig: { /* ... */ },
  },
  headers,
});
```

**Organization Provisioning Flow:**

When a user authenticates through a linked provider:
1. User is authenticated and located or created in the database
2. Organization membership is verified
3. Role is assigned using `defaultRole` or custom `getRole` logic
4. User is added to the organization with the determined role

**Configuration:**

```typescript
sso({
  organizationProvisioning: {
    disabled: false,
    defaultRole: "member",
    getRole: async ({ user, userInfo, provider }) => {
      // Custom role assignment based on SSO attributes
      return "member";
    },
  },
})
```

**Benefits:**
- Automatic organization membership for SSO users
- Custom role assignment based on SSO attributes
- Multi-tenant support with provider-per-organization
- Email domain matching for automatic provisioning

### Domain Verification

The `/sso/register` endpoint returns a `domainVerificationToken` that can be used to prove ownership of the SSO domain. This is typically used for security verification before enabling SSO for an organization.

### Config Objects

The `oidcConfig` and `samlConfig` fields in `/sso/register` are typed as `object` in the spec:
1. Use `S.Unknown` for flexibility (as Better Auth types may vary)
2. Document expected structure in JSDoc examples based on Better Auth documentation
3. Consider creating branded schemas if configuration structures are well-defined in Better Auth
4. Note that only one of `oidcConfig` or `samlConfig` should be provided (mutually exclusive)

### Domain Verification Workflow

Better Auth SSO supports domain verification to automatically trust providers by validating domain ownership. This is a **critical security feature** for enterprise SSO.

**Complete Workflow:**

1. **Provider Registration** (`POST /sso/register`):
   - Register SSO provider with `providerId`, `issuer`, `domain`
   - Response includes `domainVerificationToken` if domain verification is enabled
   - Token expires after 1 week by default

2. **DNS Configuration** (performed by customer):
   - Create TXT record at: `better-auth-token-{providerId}.{domain}`
   - Record value: `{verificationToken}` from registration response
   - Example: For provider `acme-corp` on `acme.com`:
     - Host: `better-auth-token-acme-corp.acme.com`
     - Value: `abc123xyz789...`

3. **Domain Verification** (`POST /sso/verify-domain`):
   - Submit `providerId` to verify DNS record
   - Better Auth checks for TXT record via DNS query
   - If valid, provider domain is marked as verified
   - Response: `{ success: true/false, message: "..." }`

4. **Token Refresh** (`POST /sso/request-domain-verification`):
   - If token expires before verification (>1 week), request new token
   - Response: `{ verificationToken, tokenPrefix, expiresAt }`
   - Customer updates DNS record with new token
   - Retry verification

**Security Benefits:**
- Proves domain ownership before enabling SSO
- Prevents unauthorized SSO provider registration
- Enables automatic account linking for verified domains
- Required for production enterprise SSO deployments

**Configuration:**
```typescript
// Enable domain verification in better-auth config
sso({
  domainVerification: {
    enabled: true  // Required for verify-domain endpoints
  }
})
```

**Implementation Notes:**
- Both `/sso/verify-domain` and `/sso/request-domain-verification` require **authenticated sessions**
- Pass session headers from request to `auth.api.*` calls
- These endpoints are **NOT** in the OpenAPI spec but are required for complete SSO implementation
- Consider adding custom error handling for DNS propagation delays (can take minutes to hours)

# Milestone 5: Session Management

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/CORE.md](../better-auth-specs/CORE.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ✅ Exist (get-session already implemented in M0)
- Infra handlers: ❌ Need creation (except get-session)

**Next Action**: Start with Boilerplating Checklist → Domain Contracts (skip get-session)

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (7 endpoints, 1 already complete)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements session management capabilities including listing active sessions, revoking specific sessions, revoking all sessions, revoking other sessions, refreshing tokens, and obtaining access tokens. The `get-session` endpoint was completed in M0. These endpoints are critical for security and multi-device session management.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method | Status |
|--------|------|-------------|------------|-------------------|--------|
| GET | /get-session | `v1/core/get-session.ts` | `v1/core/get-session.ts` | `getSession` | ✅ COMPLETE (M0) |
| GET | /list-sessions | `v1/core/list-sessions.ts` | `v1/core/list-sessions.ts` | `listUserSessions` | ❌ TODO |
| POST | /revoke-session | `v1/core/revoke-session.ts` | `v1/core/revoke-session.ts` | `revokeSession` | ❌ TODO |
| POST | /revoke-sessions | `v1/core/revoke-sessions.ts` | `v1/core/revoke-sessions.ts` | `revokeSessions` | ❌ TODO |
| POST | /revoke-other-sessions | `v1/core/revoke-other-sessions.ts` | `v1/core/revoke-other-sessions.ts` | `revokeOtherSessions` | ❌ TODO |
| POST | /refresh-token | `v1/core/refresh-token.ts` | `v1/core/refresh-token.ts` | `refreshToken` | ❌ TODO |
| POST | /get-access-token | `v1/core/get-access-token.ts` | `v1/core/get-access-token.ts` | `getAccessToken` | ❌ TODO |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.
> **Note**: Skip `get-session.ts` as it was completed in M0.

### Boilerplate Domain Contracts

#### `list-sessions.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/list-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (GET /list-sessions)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#get-list-sessions)
  - Better Auth method name (`listUserSessions`)
  - Implementation requirements: return all active sessions for the user
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting response is an array of Session objects
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `revoke-session.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/revoke-session.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /revoke-session)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-revoke-session)
  - Better Auth method name (`revokeSession`)
  - Implementation requirements: revoke a specific session by token
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: token
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `revoke-sessions.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/revoke-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /revoke-sessions)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-revoke-sessions)
  - Better Auth method name (`revokeSessions`)
  - Implementation requirements: revoke all sessions for the user
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting this endpoint has an empty payload
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `revoke-other-sessions.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/revoke-other-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /revoke-other-sessions)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-revoke-other-sessions)
  - Better Auth method name (`revokeOtherSessions`)
  - Implementation requirements: revoke all sessions except the current one
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment noting this endpoint has an empty payload
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `refresh-token.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/refresh-token.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /refresh-token)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-refresh-token)
  - Better Auth method name (`refreshToken`)
  - Implementation requirements: refresh OAuth access token using refresh token
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: providerId, accountId (optional), userId (optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: tokenType, idToken, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `get-access-token.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/get-access-token.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /get-access-token)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-get-access-token)
  - Better Auth method name (`getAccessToken`)
  - Implementation requirements: get valid access token, refreshing if needed
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: providerId, accountId (optional), userId (optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: tokenType, idToken, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ListSessions from "./list-sessions.ts"`
- [ ] Import `* as RevokeSession from "./revoke-session.ts"`
- [ ] Import `* as RevokeSessions from "./revoke-sessions.ts"`
- [ ] Import `* as RevokeOtherSessions from "./revoke-other-sessions.ts"`
- [ ] Import `* as RefreshToken from "./refresh-token.ts"`
- [ ] Import `* as GetAccessToken from "./get-access-token.ts"`
- [ ] Add `.add(ListSessions.Contract)` to Group class
- [ ] Add `.add(RevokeSession.Contract)` to Group class
- [ ] Add `.add(RevokeSessions.Contract)` to Group class
- [ ] Add `.add(RevokeOtherSessions.Contract)` to Group class
- [ ] Add `.add(RefreshToken.Contract)` to Group class
- [ ] Add `.add(GetAccessToken.Contract)` to Group class
- [ ] Add exports to barrel export list

### Boilerplate Infra Handlers

#### `list-sessions.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/list-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: no payload or urlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.listUserSessions()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `revoke-session.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/revoke-session.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.revokeSession()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `revoke-sessions.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/revoke-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.revokeSessions()`
  - Note: empty payload, but must still forward headers
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `revoke-other-sessions.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/revoke-other-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.revokeOtherSessions()`
  - Note: empty payload, but must still forward headers
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `refresh-token.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/refresh-token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.refreshToken()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `get-access-token.ts`

- [ ] Create stub file `packages/iam/infra/src/api/v1/core/get-access-token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.getAccessToken()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ListSessions from "./list-sessions.ts"`
- [ ] Import `* as RevokeSession from "./revoke-session.ts"`
- [ ] Import `* as RevokeSessions from "./revoke-sessions.ts"`
- [ ] Import `* as RevokeOtherSessions from "./revoke-other-sessions.ts"`
- [ ] Import `* as RefreshToken from "./refresh-token.ts"`
- [ ] Import `* as GetAccessToken from "./get-access-token.ts"`
- [ ] Add `.handle("list-sessions", ListSessions.Handler)` to Routes
- [ ] Add `.handle("revoke-session", RevokeSession.Handler)` to Routes
- [ ] Add `.handle("revoke-sessions", RevokeSessions.Handler)` to Routes
- [ ] Add `.handle("revoke-other-sessions", RevokeOtherSessions.Handler)` to Routes
- [ ] Add `.handle("refresh-token", RefreshToken.Handler)` to Routes
- [ ] Add `.handle("get-access-token", GetAccessToken.Handler)` to Routes

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc (6 new files)
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Infra Handler Helpers Reference

> **See**: PATTERNS.md § "Infra Handler Patterns" for detailed usage examples

All handlers in this milestone should use the standard schema-driven helpers from `../../common/schema-helpers`:

| Helper | Use Case | Has Payload | Response Handling |
|--------|----------|-------------|-------------------|
| `runAuthEndpoint` | POST with request body + schema-decoded response | ✅ Yes | Schema decoded via `S.decodeUnknown()` |
| `runAuthQuery` | GET endpoints with schema-decoded response | ❌ No | Schema decoded via `S.decodeUnknown()` |
| `runAuthCommand` | POST/DELETE with fixed success value (no decoding) | ❌ No | Fixed value (e.g., `{ success: true }`) |
| `forwardCookieResponse` | Manual handling for custom response construction | Manual | Manual |

**Import Statement**:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

**Key Decisions for M5**:
- `list-sessions` → `runAuthQuery` (GET endpoint)
- `revoke-session` → `runAuthEndpoint` (POST with request body containing token field)
- `revoke-sessions`, `revoke-other-sessions` → `runAuthCommand` (POST with empty body, fixed `{ status: true }` response)
- `refresh-token`, `get-access-token` → `runAuthEndpoint` (POST with request body and schema-decoded response)

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `list-sessions.ts`

- [ ] Implement `Success` class fields:
  - Return type should be an array: `S.Array(Session.Model)` or similar structure
  - Check actual Better Auth response format
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `revoke-session.ts`

- [ ] Implement `Payload` class fields:
  - `token: S.String` - session token to revoke
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `revoke-sessions.ts`

- [ ] Implement `Payload` class fields:
  - Empty struct: `S.Struct({})`
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `revoke-other-sessions.ts`

- [ ] Implement `Payload` class fields:
  - Empty struct: `S.Struct({})`
- [ ] Implement `Success` class fields:
  - `status: S.Boolean`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `refresh-token.ts`

- [ ] Implement `Payload` class fields:
  - `providerId: S.String` - OAuth provider ID (required)
  - `accountId: S.optionalWith(IamEntityIds.AccountId, { nullable: true })` - account ID
  - `userId: S.optionalWith(SharedEntityIds.UserId, { nullable: true })` - user ID
- [ ] Implement `Success` class fields:
  - `tokenType: S.optionalWith(S.String, { nullable: true })`
  - `idToken: S.optionalWith(S.String, { nullable: true })`
  - `accessToken: S.optionalWith(S.String, { nullable: true })`
  - `refreshToken: S.optionalWith(S.String, { nullable: true })`
  - `accessTokenExpiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true })` - ⚠️ CRITICAL: Use EpochMillisFromAllAcceptable (NOT DateTimeUtcFromAllAcceptable) - Better Auth expects epoch millis (number), not Date objects
  - `refreshTokenExpiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true })` - ⚠️ CRITICAL: Use EpochMillisFromAllAcceptable (NOT DateTimeUtcFromAllAcceptable) - Better Auth expects epoch millis (number), not Date objects
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `get-access-token.ts`

- [ ] Implement `Payload` class fields:
  - `providerId: S.String` - OAuth provider ID (required)
  - `accountId: S.optionalWith(IamEntityIds.AccountId, { nullable: true })` - account ID
  - `userId: S.optionalWith(SharedEntityIds.UserId, { nullable: true })` - user ID
- [ ] Implement `Success` class fields:
  - `tokenType: S.optionalWith(S.String, { nullable: true })`
  - `idToken: S.optionalWith(S.String, { nullable: true })`
  - `accessToken: S.optionalWith(S.String, { nullable: true })`
  - `refreshToken: S.optionalWith(S.String, { nullable: true })`
  - `accessTokenExpiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true })` - ⚠️ CRITICAL: Use EpochMillisFromAllAcceptable (NOT DateTimeUtcFromAllAcceptable) - Better Auth expects epoch millis (number), not Date objects
  - `refreshTokenExpiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true })` - ⚠️ CRITICAL: Use EpochMillisFromAllAcceptable (NOT DateTimeUtcFromAllAcceptable) - Better Auth expects epoch millis (number), not Date objects
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

#### `list-sessions.ts`

**Recommended Helper**: `runAuthQuery` - GET endpoint with schema-decoded response

- [ ] Implement `Handler` logic using `runAuthQuery`:
  ```typescript
  return yield* runAuthQuery({
    successSchema: V1.Core.ListSessions.Success,
    headers: request.headers,
    authHandler: ({ headers }) =>
      Effect.tryPromise(() =>
        auth.api.listUserSessions({ headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `revoke-session.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing token, but returns fixed success response

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.RevokeSession.Payload,
    successSchema: V1.Core.RevokeSession.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.revokeSession({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Use `runAuthEndpoint` (not `runAuthCommand`) because this endpoint has a payload with `token` field
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `revoke-sessions.ts`

**Recommended Helper**: `runAuthCommand` - POST with empty body and fixed `{ status: true }` success value

- [ ] Implement `Handler` logic using `runAuthCommand`:
  ```typescript
  return yield* runAuthCommand({
    successValue: { status: true },
    headers: request.headers,
    authHandler: ({ headers }) =>
      Effect.tryPromise(() =>
        auth.api.revokeSessions({ body: {}, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `revoke-other-sessions.ts`

**Recommended Helper**: `runAuthCommand` - POST with empty body and fixed `{ status: true }` success value

- [ ] Implement `Handler` logic using `runAuthCommand`:
  ```typescript
  return yield* runAuthCommand({
    successValue: { status: true },
    headers: request.headers,
    authHandler: ({ headers }) =>
      Effect.tryPromise(() =>
        auth.api.revokeOtherSessions({ body: {}, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `refresh-token.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body and schema-decoded OAuth token response

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.RefreshToken.Payload,
    successSchema: V1.Core.RefreshToken.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.refreshToken({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `get-access-token.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body and schema-decoded OAuth token response

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.GetAccessToken.Payload,
    successSchema: V1.Core.GetAccessToken.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.getAccessToken({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-infra` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Better Auth Method Mapping

- `/get-session` → `auth.api.getSession` (✅ COMPLETE in M0)
- `/list-sessions` → `auth.api.listUserSessions` (confirmed by OpenAPI `operationId`)
- `/revoke-session` → `auth.api.revokeSession`
- `/revoke-sessions` → `auth.api.revokeSessions`
- `/revoke-other-sessions` → `auth.api.revokeOtherSessions`
- `/refresh-token` → `auth.api.refreshToken`
- `/get-access-token` → `auth.api.getAccessToken`

**Note**: The session revocation and token management endpoints (`revoke-session`, `revoke-sessions`, `revoke-other-sessions`, `refresh-token`, `get-access-token`) do not have `operationId` fields in the OpenAPI spec. However, these method names are confirmed by the Better Auth documentation and the orchestration prompt's method reference table. Verify these method names exist on the Better Auth client during implementation.

**IMPORTANT - Method Name Clarification**:
- **Core API**: `auth.api.listUserSessions()` - Lists sessions for the CURRENT authenticated user (GET /list-sessions, operationId: "listUserSessions")
- **Admin API**: `auth.api.admin.listUserSessions({ userId })` - Admin method to list sessions for ANY user by ID (POST /admin/list-user-sessions)
- These are TWO DIFFERENT methods. The core endpoint uses `listUserSessions` as confirmed by the OpenAPI specification.

### Special Considerations

1. **Empty Payloads**: The `revoke-sessions` and `revoke-other-sessions` endpoints have empty request bodies. You still need to forward headers for authentication.

2. **Session Revocation**:
   - `revoke-session`: Revokes a specific session by token
   - `revoke-sessions`: Revokes ALL sessions for the user (including current)
   - `revoke-other-sessions`: Revokes all sessions EXCEPT the current one

3. **OAuth Token Management**:
   - `refresh-token`: Explicitly refreshes an OAuth access token using the refresh token
   - `get-access-token`: Gets a valid access token, automatically refreshing if needed
   - Both require `providerId` (e.g., "google", "github")
   - Optional `accountId` and `userId` for multi-account scenarios
   - **EntityId Imports**: Use `SharedEntityIds.UserId` from `@beep/shared-domain` and `IamEntityIds.AccountId` from `@beep/iam-domain` for type-safe ID fields

4. **GET Endpoint**: The `list-sessions` endpoint is a GET request with no parameters. The handler should extract the current user from the session cookie.

5. **Session Cookies**: All session management endpoints should forward the `set-cookie` header from Better Auth to update the client's session state.

6. **Token Expiry Fields (CRITICAL)**: The token endpoints return `accessTokenExpiresAt` and `refreshTokenExpiresAt` as **epoch milliseconds** (number), NOT ISO datetime strings.
   - ✅ **CORRECT**: Use `BS.EpochMillisFromAllAcceptable` - encodes to `number`
   - ❌ **WRONG**: Do NOT use `BS.DateTimeUtcFromAllAcceptable` - encodes to `Date` object, causing type errors
   - Better Auth expects numeric timestamps (milliseconds since Unix epoch) for OAuth token expiry
   - When using `S.encode()`, `EpochMillisFromAllAcceptable` produces `number`, matching Better Auth's TypeScript signature
   - See PATTERNS.md § "DateTime Schema Selection" for more details

7. **Security**: Session revocation endpoints are sensitive operations. Ensure proper authentication is enforced (user must be logged in to revoke their sessions).

8. **Multi-Device Support**: The `list-sessions` endpoint is useful for showing users their active sessions across devices. Consider including device metadata if available from Better Auth.

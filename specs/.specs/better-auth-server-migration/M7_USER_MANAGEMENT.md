# Milestone 7: User Management

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
- [ ] Verify endpoint count matches spec (3 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements user profile management and account deletion functionality. Users can update their profile information (name, image) and delete their accounts with optional email verification for security. The deletion flow supports both immediate deletion and a two-step verification process.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /update-user | `v1/core/update-user.ts` | `v1/core/update-user.ts` | `updateUser` |
| POST | /delete-user | `v1/core/delete-user.ts` | `v1/core/delete-user.ts` | `deleteUser` |
| GET | /delete-user/callback | `v1/core/delete-user.ts` | `v1/core/delete-user.ts` | `deleteUser` (same method handles callback) |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `update-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/update-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method: `POST /update-user`
  - Spec reference anchor: `.specs/better-auth-specs/CORE.md#post-update-user`
  - Better Auth method name: `updateUser`
  - Implementation requirements from spec:
    - Update user profile information
    - Return updated user object
    - Handle partial updates (all fields optional)
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `name: S.optionalWith(S.String, { as: "Option" })` - User's name
    - `image: S.optionalWith(BS.URLString, { as: "Option" })` - User's profile image URL
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `user: S.optionalWith(User.Model.json, { as: "Option" })` - Updated user object
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `delete-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/delete-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint paths and methods:
    - `POST /delete-user` - Initiate deletion
    - `GET /delete-user/callback` - Complete deletion with token
  - Spec reference anchors:
    - `.specs/better-auth-specs/CORE.md#post-delete-user`
    - `.specs/better-auth-specs/CORE.md#get-delete-usercallback`
  - Better Auth method name: `deleteUser` (handles both endpoints)
  - Implementation requirements from spec:
    - Support immediate deletion (with password if session not fresh)
    - Support two-step deletion with email verification token
    - Handle callback redirect after email verification
- [ ] Add `Payload` class stub (for POST) with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option" })` - Redirect URL after deletion
    - `password: S.optionalWith(S.Redacted(S.String), { as: "Option" })` - Required if session not fresh
    - `token: S.optionalWith(S.String, { as: "Option" })` - Deletion verification token
- [ ] Add `UrlParams` class stub (for GET callback) with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `token: S.optionalWith(S.String, { as: "Option" })` - Verification token from email
    - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option" })` - Final redirect URL
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields from spec:
    - `success: S.Boolean` (required) - Deletion success indicator
    - `message: S.String` - Status message (e.g., "User deleted" or "Verification email sent")
- [ ] Add two `Contract` exports with complete JSDoc:
  - `DeleteContract` - POST endpoint
  - `CallbackContract` - GET endpoint
- [ ] Update `index.ts` barrel export

### Implementation Note for delete-user.ts

This endpoint is unique because it handles two different HTTP methods:
1. **POST /delete-user**: Initiates deletion (with optional password or token)
2. **GET /delete-user/callback**: Completes deletion via email verification link

Both use the same Better Auth method (`deleteUser`) but with different parameters. The domain file should export two separate contracts that the infra layer can handle appropriately.

#### Update `_group.ts`

- [ ] Import `* as UpdateUser from "./update-user.ts"`
- [ ] Import `* as DeleteUser from "./delete-user.ts"`
- [ ] Add `.add(UpdateUser.Contract)` to Group class
- [ ] Add `.add(DeleteUser.DeleteContract)` to Group class
- [ ] Add `.add(DeleteUser.CallbackContract)` to Group class

### Boilerplate Infra Handlers

**Helper Selection**: See PATTERNS.md 'Infra Handler Helpers' section for detailed usage.

#### `update-user.ts`

**Recommended Helper**: `runAuthEndpoint` - POST endpoint with payload (name/image, no Redacted fields) and decoded response

- [ ] Create stub file `packages/iam/server/src/api/v1/core/update-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type: `Common.HandlerEffect<V1.Core.UpdateUser.Payload>`
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.updateUser()` with mapped payload
    - Handle optional fields (name, image)
    - Forward `set-cookie` header
    - Decode response with `V1.Core.UpdateUser.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `delete-user.ts`

**Recommended Helper**: `forwardCookieResponse` - Payload contains Redacted password field requiring manual encoding

- [ ] Create stub file `packages/iam/server/src/api/v1/core/delete-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add two `HandlerEffect` types:
  - `DeleteHandlerEffect = Common.HandlerEffect<V1.Core.DeleteUser.Payload>`
  - `CallbackHandlerEffect = Common.HandlerEffect<V1.Core.DeleteUser.UrlParams>`
- [ ] Add `DeleteHandler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Manually encode payload with `S.encode(V1.Core.DeleteUser.Payload)(payload)`
    - Call `auth.api.deleteUser()` with body containing encoded payload fields
    - Forward `set-cookie` header using `forwardCookieResponse`
    - Decode response with `V1.Core.DeleteUser.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Add `CallbackHandler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template:
    - Call `auth.api.deleteUser()` with query params containing `token`, `callbackURL`
    - Forward `set-cookie` header using `forwardCookieResponse`
    - Decode response with `V1.Core.DeleteUser.Success`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as UpdateUser from "./update-user.ts"`
- [ ] Import `* as DeleteUser from "./delete-user.ts"`
- [ ] Add `.handle("update-user", UpdateUser.Handler)` to Routes
- [ ] Add `.handle("delete-user", DeleteUser.DeleteHandler)` to Routes
- [ ] Add `.handle("delete-user-callback", DeleteUser.CallbackHandler)` to Routes

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `update-user.ts`

- [ ] Implement `Payload` class fields:
  - `name: S.optionalWith(S.String, { as: "Option" })`
  - `image: S.optionalWith(BS.URLString, { as: "Option" })`
- [ ] Implement `Success` class fields:
  - `user: S.optionalWith(User.Model.json, { as: "Option" })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `delete-user.ts`

- [ ] Implement `Payload` class fields (for POST):
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option" })`
  - `password: S.optionalWith(S.Redacted(S.String), { as: "Option" })`
  - `token: S.optionalWith(S.String, { as: "Option" })`
- [ ] Implement `UrlParams` class fields (for GET callback):
  - `token: S.optionalWith(S.String, { as: "Option" })`
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option" })`
- [ ] Implement `Success` class fields:
  - `success: S.Boolean`
  - `message: S.String` (e.g., "User deleted" or "Verification email sent")
- [ ] Implement two contracts:
  - `DeleteContract` using `setPayload(Payload)`
  - `CallbackContract` using `setUrlParams(UrlParams)`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

#### `update-user.ts`

**Helper**: `runAuthEndpoint` - Handles payload encoding, response decoding, and cookie forwarding

- [ ] Implement `Handler` logic:
  - Use `runAuthEndpoint` with:
    - `payloadSchema: V1.Core.UpdateUser.Payload`
    - `successSchema: V1.Core.UpdateUser.Success`
    - `authHandler` calling `auth.api.updateUser()` with encoded body
  - Optional fields (name, image) are handled automatically by encoding
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `delete-user.ts`

**Helper**: `forwardCookieResponse` - Manual encoding required due to Redacted password field

- [ ] Implement `DeleteHandler` logic:
  - Manually encode payload with `S.encode(V1.Core.DeleteUser.Payload)(payload)`
  - Call `auth.api.deleteUser()` with body containing encoded payload fields
  - Use `forwardCookieResponse(headers, decodedResponse)` for cookie forwarding
  - Decode response with `S.decodeUnknown(V1.Core.DeleteUser.Success)(response)`
- [ ] Implement `CallbackHandler` logic:
  - Call `auth.api.deleteUser()` with query params `token`, `callbackURL`
  - Use `forwardCookieResponse(headers, decodedResponse)` for cookie forwarding
  - Decode response with `S.decodeUnknown(V1.Core.DeleteUser.Success)(response)`
  - Consider handling redirect behavior for callback
- [ ] Remove placeholder `Effect.fail(...)` from both handlers
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Special Considerations

1. **update-user endpoint**: All fields are optional. The handler should only send fields that are present in the request to avoid clearing existing values.

2. **delete-user endpoint complexity**:
   - **Fresh session**: User can delete immediately without password
   - **Stale session**: Requires password confirmation
   - **Two-step verification**: If configured, sends verification email instead of immediate deletion
   - **Callback handling**: The GET callback completes deletion after email verification

3. **Security concerns**:
   - Password should always use `S.Redacted` schema
   - Verify session before allowing deletion
   - Consider rate limiting for deletion requests
   - Ensure tokens expire after reasonable time

4. **User experience**:
   - The `message` field in the response indicates whether deletion was immediate or requires email verification
   - The callback URL should handle both success and error cases
   - Consider logging deletion events for audit purposes

5. **Better Auth method mapping**: Both POST and GET /delete-user/* endpoints call the same `auth.api.deleteUser()` method. The method determines behavior based on whether `token` is present in the request (callback mode) or not (initiation mode).

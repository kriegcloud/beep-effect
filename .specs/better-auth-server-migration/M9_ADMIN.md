# Milestone 9: Admin

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/ADMIN.md](../better-auth-specs/ADMIN.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (15 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

Administrative user management endpoints providing privileged operations for user management, role assignment, session control, and user impersonation. These endpoints require admin-level permissions and are critical for platform administration.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /admin/ban-user | `v1/admin/ban-user.ts` | `v1/admin/ban-user.ts` | `admin.banUser` |
| POST | /admin/create-user | `v1/admin/create-user.ts` | `v1/admin/create-user.ts` | `admin.createUser` |
| GET | /admin/get-user | `v1/admin/get-user.ts` | `v1/admin/get-user.ts` | `admin.getUser` |
| POST | /admin/has-permission | `v1/admin/has-permission.ts` | `v1/admin/has-permission.ts` | `admin.hasPermission` |
| POST | /admin/impersonate-user | `v1/admin/impersonate-user.ts` | `v1/admin/impersonate-user.ts` | `admin.impersonateUser` |
| POST | /admin/list-user-sessions | `v1/admin/list-user-sessions.ts` | `v1/admin/list-user-sessions.ts` | `admin.listUserSessions` |
| GET | /admin/list-users | `v1/admin/list-users.ts` | `v1/admin/list-users.ts` | `admin.listUsers` |
| POST | /admin/remove-user | `v1/admin/remove-user.ts` | `v1/admin/remove-user.ts` | `admin.removeUser` |
| POST | /admin/revoke-user-session | `v1/admin/revoke-user-session.ts` | `v1/admin/revoke-user-session.ts` | `admin.revokeUserSession` |
| POST | /admin/revoke-user-sessions | `v1/admin/revoke-user-sessions.ts` | `v1/admin/revoke-user-sessions.ts` | `admin.revokeUserSessions` |
| POST | /admin/set-role | `v1/admin/set-role.ts` | `v1/admin/set-role.ts` | `admin.setRole` |
| POST | /admin/set-user-password | `v1/admin/set-user-password.ts` | `v1/admin/set-user-password.ts` | `admin.setUserPassword` |
| POST | /admin/stop-impersonating | `v1/admin/stop-impersonating.ts` | `v1/admin/stop-impersonating.ts` | `admin.stopImpersonating` |
| POST | /admin/unban-user | `v1/admin/unban-user.ts` | `v1/admin/unban-user.ts` | `admin.unbanUser` |
| POST | /admin/update-user | `v1/admin/update-user.ts` | `v1/admin/update-user.ts` | `admin.updateUser` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `ban-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/ban-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/ban-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminban-user)
  - Better Auth method name (`admin.banUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required), banReason (S.optionalWith(S.String, { nullable: true }), optional), banExpiresIn (S.optionalWith(S.Number, { nullable: true }), optional - duration in milliseconds or seconds; verify Better Auth actual type)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `create-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/create-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/create-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-admincreate-user)
  - Better Auth method name (`admin.createUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: email (CommonFields.UserEmail, required), password (CommonFields.UserPassword, required), name (CommonFields.UserName, required), role (S.optionalWith(S.String, { nullable: true }), optional), data (S.optionalWith(S.String, { nullable: true }), optional)
  - NOTE: Use User.Model.jsonCreate variant for creation schemas
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `get-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/get-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (GET /admin/get-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#get-adminget-user)
  - Better Auth method name (`admin.getUser`)
  - Implementation requirements from spec
- [ ] Add `UrlParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: id (S.optionalWith(SharedEntityIds.UserId, { nullable: true }), optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `has-permission.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/has-permission.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/has-permission)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminhas-permission)
  - Better Auth method name (`admin.hasPermission`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields:
    - permission: S.optionalWith(S.Unknown, { nullable: true }) - single permission object (MUTUALLY EXCLUSIVE with permissions)
    - permissions: S.Unknown - array of permission objects (MUTUALLY EXCLUSIVE with permission)
    - NOTE: API accepts EITHER permission OR permissions, never both. Handler must use conditional spreading pattern (see PATTERNS.md)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: error (S.optionalWith(S.String, { nullable: true }), optional), success (S.Boolean, required)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `impersonate-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/impersonate-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/impersonate-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminimpersonate-user)
  - Better Auth method name (`admin.impersonateUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: session (S.optionalWith(Session.Model.json, { nullable: true }), optional), user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `list-user-sessions.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/list-user-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/list-user-sessions)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminlist-user-sessions)
  - Better Auth method name (`admin.listUserSessions`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: sessions (S.optionalWith(S.Array(Session.Model.json), { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `list-users.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/list-users.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (GET /admin/list-users)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#get-adminlist-users)
  - Better Auth method name (`admin.listUsers`)
  - Implementation requirements from spec
- [ ] Add `UrlParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: searchValue (S.optionalWith(S.String, { nullable: true })), searchField (S.optionalWith(S.String, { nullable: true })), searchOperator (S.optionalWith(S.String, { nullable: true })), limit (S.optionalWith(S.Number, { nullable: true })), offset (S.optionalWith(S.Number, { nullable: true })), sortBy (S.optionalWith(S.String, { nullable: true })), sortDirection (S.optionalWith(S.String, { nullable: true })), filterField (S.optionalWith(S.String, { nullable: true })), filterValue (S.optionalWith(S.String, { nullable: true })), filterOperator (S.optionalWith(S.String, { nullable: true }))
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: users (S.Array(User.Model.json), required), total (S.Number, required), limit (S.optionalWith(S.Number, { nullable: true }), optional), offset (S.optionalWith(S.Number, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `remove-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/remove-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/remove-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminremove-user)
  - Better Auth method name (`admin.removeUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: success (S.optionalWith(S.Boolean, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `revoke-user-session.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/revoke-user-session.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/revoke-user-session)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminrevoke-user-session)
  - Better Auth method name (`admin.revokeUserSession`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: sessionToken (S.String, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: success (S.optionalWith(S.Boolean, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `revoke-user-sessions.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/revoke-user-sessions.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/revoke-user-sessions)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminrevoke-user-sessions)
  - Better Auth method name (`admin.revokeUserSessions`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: success (S.optionalWith(S.Boolean, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `set-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/set-role.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/set-role)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminset-role)
  - Better Auth method name (`admin.setRole`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields:
    - userId: SharedEntityIds.UserId (required)
    - role: S.String (required) - Better Auth admin only accepts "user" or "admin" literal values
    - NOTE: Handler must validate role with type guard and use type narrowing pattern (see PATTERNS.md)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `set-user-password.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/set-user-password.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/set-user-password)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminset-user-password)
  - Better Auth method name (`admin.setUserPassword`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: newPassword (CommonFields.UserPassword, required), userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status (S.optionalWith(S.Boolean, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `stop-impersonating.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/stop-impersonating.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/stop-impersonating)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminstop-impersonating)
  - Better Auth method name (`admin.stopImpersonating`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub (if needed - spec shows no request body)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment - spec shows no documented response schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `unban-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/unban-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/unban-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminunban-user)
  - Better Auth method name (`admin.unbanUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `update-user.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/update-user.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /admin/update-user)
  - Spec reference anchor (.specs/better-auth-specs/ADMIN.md#post-adminupdate-user)
  - Better Auth method name (`admin.updateUser`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: userId (SharedEntityIds.UserId, required), data (S.Unknown, required - arbitrary update data)
  - NOTE: Use User.Model.jsonUpdate variant for update schemas
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (S.optionalWith(User.Model.json, { nullable: true }), optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Create Group File `_group.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/admin/_group.ts`
- [ ] Import all admin endpoint contracts
- [ ] Create Group class extending `HttpApiGroup.make("iam.admin")`
- [ ] Add all contracts to group using `.add()` chain
- [ ] Add `.prefix("/admin")` to group
- [ ] Export all endpoints as namespaces

#### Update Parent Index

- [ ] Update `packages/iam/domain/src/api/v1/index.ts` to export Admin group

### Boilerplate Infra Handlers

#### `ban-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/ban-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `create-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/create-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `get-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/get-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (using UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `has-permission.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/has-permission.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `impersonate-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/impersonate-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template (note: may need cookie handling for session)
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `list-user-sessions.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/list-user-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `list-users.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/list-users.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (using UrlParams)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template (note: complex query params)
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `remove-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/remove-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `revoke-user-session.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/revoke-user-session.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `revoke-user-sessions.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/revoke-user-sessions.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `set-role.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/set-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `set-user-password.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/set-user-password.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template (note: sensitive password field)
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `stop-impersonating.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/stop-impersonating.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template (note: may need cookie handling)
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `unban-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/unban-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `update-user.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/update-user.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Create Group File `_group.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/admin/_group.ts`
- [ ] Import all admin endpoint handlers
- [ ] Create Service, ServiceError, ServiceDependencies types
- [ ] Create Routes layer with `HttpApiBuilder.group(IamApi, "iam.admin", ...)`
- [ ] Chain all handlers using `.handle()` method

#### Update Parent Index

- [ ] Update `packages/iam/server/src/api/v1/index.ts` to export Admin routes

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

For each endpoint, implement the schema fields based on the spec:

- [ ] `ban-user.ts` - userId (SharedEntityIds.UserId), banReason (S.optionalWith(S.String, { nullable: true })), banExpiresIn (S.optionalWith(S.Number, { nullable: true }) - duration in milliseconds or seconds; verify Better Auth actual type)
- [ ] `create-user.ts` - email (CommonFields.UserEmail), password (CommonFields.UserPassword), name (CommonFields.UserName), role (S.optionalWith(S.String, { nullable: true })), data (S.optionalWith(S.Unknown, { nullable: true })) - Use User.Model.jsonCreate variant
- [ ] `get-user.ts` - id query param (S.optionalWith(SharedEntityIds.UserId, { nullable: true }))
- [ ] `has-permission.ts` - permission (S.optionalWith(S.Unknown, { nullable: true })), permissions (S.Unknown) object fields
- [ ] `impersonate-user.ts` - userId (SharedEntityIds.UserId) field
- [ ] `list-user-sessions.ts` - userId (SharedEntityIds.UserId) field
- [ ] `list-users.ts` - All query params use S.optionalWith(S.String or S.Number, { nullable: true }) pattern
- [ ] `remove-user.ts` - userId (SharedEntityIds.UserId) field
- [ ] `revoke-user-session.ts` - sessionToken (S.String) field
- [ ] `revoke-user-sessions.ts` - userId (SharedEntityIds.UserId) field
- [ ] `set-role.ts` - userId (SharedEntityIds.UserId), role (S.Union(S.String, S.Array(S.String))) fields
- [ ] `set-user-password.ts` - newPassword (CommonFields.UserPassword), userId (SharedEntityIds.UserId) fields
- [ ] `stop-impersonating.ts` - response schema (check actual Better Auth behavior)
- [ ] `unban-user.ts` - userId (SharedEntityIds.UserId) field
- [ ] `update-user.ts` - userId (SharedEntityIds.UserId), data (S.Unknown) - Use User.Model.jsonUpdate variant

### 2. Infra Handlers

**Helper Selection**: See `packages/iam/server/src/api/common/schema-helpers.ts` for available helpers. Import:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

For each endpoint, implement the handler logic:

- [ ] `ban-user.ts` - Call `auth.api.admin.banUser()`
  - **Helper**: `runAuthEndpoint` - POST with body, returns decoded user object
- [ ] `create-user.ts` - Call `auth.api.admin.createUser()`
  - **Helper**: `forwardCookieResponse` - Password in payload (Redacted field)
- [ ] `get-user.ts` - Call `auth.api.admin.getUser()`
  - **Helper**: `runAuthQuery` - GET with query params, returns user object
- [ ] `has-permission.ts` - Call `auth.api.hasPermission()`
  - **Helper**: Manual handling required (mutually exclusive fields)
  - **IMPORTANT**: Use conditional spreading pattern for permission/permissions:
    ```typescript
    const body = singlePermission != null
      ? { permission: singlePermission }
      : { permissions: multiplePermissions };
    ```
  - Do NOT use `any` type or spread `undefined` values
- [ ] `impersonate-user.ts` - Call `auth.api.admin.impersonateUser()`, handle session cookie
  - **Helper**: `runAuthEndpoint` - POST with body, returns session/user
- [ ] `list-user-sessions.ts` - Call `auth.api.admin.listUserSessions()`
  - **Helper**: `runAuthEndpoint` - POST with userId, returns sessions array
- [ ] `list-users.ts` - Call `auth.api.admin.listUsers()`, map query params
  - **Helper**: `runAuthQuery` - GET with complex query params, returns users array
- [ ] `remove-user.ts` - Call `auth.api.admin.removeUser()`
  - **Helper**: `runAuthCommand` - POST returning `{ success: true }`
- [ ] `revoke-user-session.ts` - Call `auth.api.admin.revokeUserSession()`
  - **Helper**: `runAuthCommand` - POST returning `{ success: true }`
- [ ] `revoke-user-sessions.ts` - Call `auth.api.admin.revokeUserSessions()`
  - **Helper**: `runAuthCommand` - POST returning `{ success: true }`
- [ ] `set-role.ts` - Call `auth.api.setRole()`
  - **Helper**: `runAuthEndpoint` - POST with body, returns user object
  - **IMPORTANT**: Better Auth only accepts "user" or "admin" roles. Validate with type guard:
    ```typescript
    const isValidRole = (role: string): role is "user" | "admin" =>
      role === "user" || role === "admin";

    if (!isValidRole(payload.role)) {
      return yield* Effect.fail(new IamAuthError({ message: "Invalid role" }));
    }
    const validatedRole: "user" | "admin" = payload.role;
    ```
  - Do NOT use type assertions after validation
- [ ] `set-user-password.ts` - Call `auth.api.admin.setUserPassword()`, unwrap redacted password
  - **Helper**: `forwardCookieResponse` - Password in payload (Redacted field)
- [ ] `stop-impersonating.ts` - Call `auth.api.admin.stopImpersonating()`, handle session cookie
  - **Helper**: `runAuthCommand` - POST with no body, fixed response
- [ ] `unban-user.ts` - Call `auth.api.admin.unbanUser()`
  - **Helper**: `runAuthEndpoint` - POST with body, returns user object
- [ ] `update-user.ts` - Call `auth.api.admin.updateUser()`
  - **Helper**: `runAuthEndpoint` - POST with body, returns user object

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Special Considerations

1. **Permission Checking**: The `has-permission` endpoint uses object types for permissions - these may need custom schemas
2. **User Impersonation**: The `impersonate-user` and `stop-impersonating` endpoints likely modify session cookies - ensure proper cookie forwarding
3. **Sensitive Data**: `set-user-password` and `create-user` handle passwords - use `CommonFields.UserPassword` (redacted)
4. **Pagination**: `list-users` has extensive query parameters for search/filter/sort - validate all parameters are properly mapped
5. **Destructive Operations**: `remove-user` is irreversible - consider adding confirmation patterns at the UI layer
6. **Role Management**: `set-role` accepts string or array of strings - schema should handle both cases (use `S.Union(S.String, S.Array(S.String))`)
7. **Admin Permissions**: All endpoints require admin-level authorization - verify authentication middleware is applied

### Schema Pattern Requirements

8. **DateTime Fields**: All timestamp fields must use `BS.DateTimeUtcFromAllAcceptable` from `@beep/schema` instead of `S.DateTimeUtc`
   - Example: `banExpiresIn` should accept numbers (Unix timestamps) and convert to DateTime
   - Import: `import * as BS from "@beep/schema";`

9. **Model Variants**: Use appropriate Model variants for CRUD operations:
   - **Create endpoints** (`create-user`): Use `User.Model.jsonCreate` for payload schemas
   - **Update endpoints** (`update-user`): Use `User.Model.jsonUpdate` for payload schemas
   - **Response schemas**: Always use `User.Model.json`, `Session.Model.json` for response bodies
   - Never use bare `User.Model` or `Session.Model` - always specify the variant

10. **Optional Fields**: All optional fields MUST use `S.optionalWith(X, { nullable: true })` pattern instead of `S.optional(X)`
    - This ensures proper nullable handling for JSON serialization
    - Example: `S.optionalWith(S.String, { nullable: true })` not `S.optional(S.String)`

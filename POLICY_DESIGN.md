# Policy System Design: Effect + Better-Auth Integration

## Executive Summary

This document outlines the design for integrating the Effect-based policy system in `@beep/shared-domain/Policy` with better-auth's access control (AC) system. The goal is to create a unified authorization layer that:

1. Leverages Effect's composable, type-safe policy primitives
2. Integrates seamlessly with better-auth's organization and role-based access control
3. Supports multi-tenant authorization scoped to organizations
4. Enables entity-level policies co-located with domain models

---

## Current State Analysis

### Existing Effect Policy System

**Location:** `packages/shared/domain/src/Policy.ts`

The current system provides:

```typescript
// Permission string format: "tableName:action"
// Example: "knowledge_page:read", "document:manage"

// Core types
type Policy<E, R> = Effect<void, BeepError.Forbidden | E, CurrentUser | R>

// Policy combinators
policy()      // Create from predicate
withPolicy()  // Apply policy to an effect
all()         // AND semantics - all must pass
any()         // OR semantics - at least one passes
permission()  // Check specific permission
```

**Current Permission Definition** (`Policy.ts:32-60`):
```typescript
const Permissions = internal.makePermissions({
  [SharedEntityIds.OrganizationId.tableName]: commonPermissions,
  [IamEntityIds.AccountId.tableName]: commonPermissions,
  // ... other IAM entities
});

export const Permission = Schema.Literal(...Permissions);
```

**Current Context Tags:**
- `AuthContext` - Contains `user` and `session` from better-auth
- `CurrentUser` - Contains `user` and `permissions: Set<Permission>`

### Existing Better-Auth Configuration

**Location:** `packages/iam/infra/src/adapters/better-auth/Auth.service.ts`

Current setup:
- Organization plugin enabled with dynamic access control
- Three default roles: `owner`, `admin`, `member`
- Session enriched with `activeOrganizationId` and `organizationContext`
- No custom access control statements defined yet

**Organization Plugin Config** (`organization.plugin.ts`):
```typescript
dynamicAccessControl: {
  enabled: true,
}
```

### Gap Analysis

| Feature | Current State | Needed |
|---------|--------------|--------|
| Permission definition | IAM entities only | Knowledge-management entities |
| better-auth AC integration | Not connected | Unified permission source |
| Organization-scoped policies | Not implemented | Required for multi-tenancy |
| Entity-level policies | Empty `KnowledgePage.policy.ts` | Full implementation |
| CurrentUser.permissions | Not populated from better-auth | Sync with organization roles |

---

## Proposed Architecture

### 1. Permission Statement Structure

Define a unified permission statement that works with both Effect policies and better-auth AC:

```typescript
// packages/shared/domain/src/access-control/statements.ts

import { createAccessControl } from "better-auth/plugins/access";
import { DocumentsEntityIds, IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

/**
 * Unified permission actions for all entities
 */
export const PermissionActions = ["read", "create", "update", "delete", "manage"] as const;
export type PermissionAction = typeof PermissionActions[number];

/**
 * Access control statement for better-auth
 * Maps entity table names to allowed actions
 */
export const accessControlStatement = {
  // Shared entities
  [SharedEntityIds.OrganizationId.tableName]: PermissionActions,
  [SharedEntityIds.TeamId.tableName]: PermissionActions,
  [SharedEntityIds.FileId.tableName]: PermissionActions,

  // IAM entities
  [IamEntityIds.MemberId.tableName]: PermissionActions,
  [IamEntityIds.InvitationId.tableName]: ["create", "cancel"] as const,

  // Knowledge Management entities
  [DocumentsEntityIds.DocumentId.tableName]: PermissionActions,
  [DocumentsEntityIds.DocumentVersionId.tableName]: ["read", "create"] as const,
  [DocumentsEntityIds.DiscussionId.tableName]: PermissionActions,
  [DocumentsEntityIds.CommentId.tableName]: PermissionActions,
  [DocumentsEntityIds.DocumentFileId.tableName]: PermissionActions,
  [DocumentsEntityIds.KnowledgePageId.tableName]: PermissionActions,
  [DocumentsEntityIds.KnowledgeBlockId.tableName]: PermissionActions,
  [DocumentsEntityIds.KnowledgeSpaceId.tableName]: PermissionActions,
  [DocumentsEntityIds.PageLinkId.tableName]: ["read", "create", "delete"] as const,
} as const;

export type AccessControlStatement = typeof accessControlStatement;

/**
 * Create the better-auth access controller
 */
export const ac = createAccessControl(accessControlStatement);
```

### 2. Role Definitions

```typescript
// packages/shared/domain/src/access-control/roles.ts

import { ac } from "./statements";
import { DocumentsEntityIds } from "@beep/shared-domain";

const km = DocumentsEntityIds;

/**
 * Organization roles with documents permissions
 */
export const organizationRoles = {
  owner: ac.newRole({
    // Full access to all documents entities
    [km.DocumentId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.DocumentVersionId.tableName]: ["read", "create"],
    [km.DiscussionId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.CommentId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.DocumentFileId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.KnowledgePageId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.KnowledgeBlockId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.KnowledgeSpaceId.tableName]: ["read", "create", "update", "delete", "manage"],
    [km.PageLinkId.tableName]: ["read", "create", "delete"],
  }),

  admin: ac.newRole({
    // Admin can manage content but not delete spaces
    [km.DocumentId.tableName]: ["read", "create", "update", "delete"],
    [km.DocumentVersionId.tableName]: ["read", "create"],
    [km.DiscussionId.tableName]: ["read", "create", "update", "delete"],
    [km.CommentId.tableName]: ["read", "create", "update", "delete"],
    [km.DocumentFileId.tableName]: ["read", "create", "update", "delete"],
    [km.KnowledgePageId.tableName]: ["read", "create", "update", "delete"],
    [km.KnowledgeBlockId.tableName]: ["read", "create", "update", "delete"],
    [km.KnowledgeSpaceId.tableName]: ["read", "create", "update"],
    [km.PageLinkId.tableName]: ["read", "create", "delete"],
  }),

  member: ac.newRole({
    // Members can read and create, limited update
    [km.DocumentId.tableName]: ["read", "create", "update"],
    [km.DocumentVersionId.tableName]: ["read", "create"],
    [km.DiscussionId.tableName]: ["read", "create"],
    [km.CommentId.tableName]: ["read", "create", "update"],
    [km.DocumentFileId.tableName]: ["read", "create"],
    [km.KnowledgePageId.tableName]: ["read", "create"],
    [km.KnowledgeBlockId.tableName]: ["read", "create", "update"],
    [km.KnowledgeSpaceId.tableName]: ["read"],
    [km.PageLinkId.tableName]: ["read", "create"],
  }),

  viewer: ac.newRole({
    // Read-only access
    [km.DocumentId.tableName]: ["read"],
    [km.DocumentVersionId.tableName]: ["read"],
    [km.DiscussionId.tableName]: ["read"],
    [km.CommentId.tableName]: ["read"],
    [km.DocumentFileId.tableName]: ["read"],
    [km.KnowledgePageId.tableName]: ["read"],
    [km.KnowledgeBlockId.tableName]: ["read"],
    [km.KnowledgeSpaceId.tableName]: ["read"],
    [km.PageLinkId.tableName]: ["read"],
  }),
} as const;
```

### 3. Better-Auth Integration

Update the organization plugin to use the unified AC:

```typescript
// packages/iam/infra/src/adapters/better-auth/plugins/organization/organization.plugin.ts

import { ac, organizationRoles } from "@beep/shared-domain/access-control";

export const organizationPluginOptions = Effect.gen(function* () {
  // ... existing setup

  const orgOpts: OrgOpts = {
    // ... existing options
    ac,
    roles: organizationRoles,
    dynamicAccessControl: {
      enabled: true,
      maximumRolesPerOrganization: 10,
    },
  };

  return orgOpts;
});
```

### 4. CurrentUser Permission Hydration

Update the auth middleware to populate `CurrentUser.permissions` from better-auth:

```typescript
// packages/iam/infra/src/api/api.ts (modified middleware)

const UserAuthMiddlewareLive = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;

    return Effect.gen(function* () {
      const session = yield* getSessionOrFail(auth);
      const currentUser = yield* decodeUser(session.user);
      const currentSession = yield* decodeSession(session.session);

      // Hydrate permissions from organization role
      const permissions = yield* getPermissionsFromRole(
        auth,
        currentSession.activeOrganizationId,
        session.user.id
      );

      return AuthContext.of({
        user: currentUser,
        session: currentSession,
      });
    });
  })
);

// Separate service for CurrentUser with permissions
const CurrentUserLive = Layer.effect(
  CurrentUser,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;
    const authContext = yield* AuthContext;

    // Get member's role in active organization
    const memberRole = yield* getMemberRole(
      auth,
      authContext.session.activeOrganizationId,
      authContext.user.id
    );

    // Resolve permissions from role
    const permissions = resolvePermissionsFromRole(memberRole);

    return {
      user: authContext.user,
      permissions: new Set(permissions),
    };
  })
);
```

### 5. Entity-Level Policy Pattern

Each entity should have a co-located `.policy.ts` file:

```typescript
// packages/documents/domain/src/entities/Document/Document.policy.ts

import { permission, policy, all, any, withPolicy } from "@beep/shared-domain/Policy";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const tableName = DocumentsEntityIds.DocumentId.tableName;

/**
 * Permission-based policies for Document entity
 */
export const canRead = permission(`${tableName}:read`);
export const canCreate = permission(`${tableName}:create`);
export const canUpdate = permission(`${tableName}:update`);
export const canDelete = permission(`${tableName}:delete`);
export const canManage = permission(`${tableName}:manage`);

/**
 * Ownership-based policy - user can modify their own documents
 */
export const isOwner = (documentUserId: SharedEntityIds.UserId.Type) =>
  policy(
    (currentUser) => Effect.succeed(currentUser.user.id === documentUserId),
    "Only document owner can perform this action"
  );

/**
 * Organization-scoped policy - user must belong to document's org
 */
export const inOrganization = (documentOrgId: SharedEntityIds.OrganizationId.Type) =>
  policy(
    (currentUser) =>
      Effect.succeed(currentUser.session.activeOrganizationId === documentOrgId),
    "User must be in the document's organization"
  );

/**
 * Published document policy - anyone with read can access published docs
 */
export const isPublished = (doc: { isPublished: boolean }) =>
  policy(() => Effect.succeed(doc.isPublished), "Document is not published");

/**
 * Composite policies
 */
export const canReadDocument = (doc: {
  userId: SharedEntityIds.UserId.Type;
  organizationId: SharedEntityIds.OrganizationId.Type;
  isPublished: boolean;
}) =>
  any(
    isPublished(doc),
    all(inOrganization(doc.organizationId), canRead)
  );

export const canUpdateDocument = (doc: {
  userId: SharedEntityIds.UserId.Type;
  organizationId: SharedEntityIds.OrganizationId.Type;
}) =>
  all(
    inOrganization(doc.organizationId),
    any(
      canManage,
      all(canUpdate, isOwner(doc.userId))
    )
  );

export const canDeleteDocument = (doc: {
  userId: SharedEntityIds.UserId.Type;
  organizationId: SharedEntityIds.OrganizationId.Type;
}) =>
  all(
    inOrganization(doc.organizationId),
    any(canManage, canDelete)
  );
```

### 6. Policy Usage in Routes

```typescript
// packages/documents/infra/src/routes/Document.router.ts

import * as DocumentPolicy from "@beep/documents-domain/entities/Document/Document.policy";
import { withPolicy } from "@beep/shared-domain/Policy";

export const DocumentRouterLive = HttpApiBuilder.group(
  Api,
  "document",
  Effect.fnUntraced(function* (handlers) {
    const documentRepo = yield* DocumentRepo;

    return handlers
      .handle("get", ({ urlParams }) =>
        Effect.gen(function* () {
          const doc = yield* documentRepo.findById(urlParams);
          // Apply read policy after fetching
          yield* DocumentPolicy.canReadDocument(doc);
          return doc;
        })
      )
      .handle("update", ({ urlParams, payload }) =>
        Effect.gen(function* () {
          const doc = yield* documentRepo.findById(urlParams);
          // Apply update policy before modification
          yield* DocumentPolicy.canUpdateDocument(doc);
          return yield* documentRepo.update({ ...payload, id: urlParams.id });
        })
      )
      .handle("delete", ({ urlParams }) =>
        Effect.gen(function* () {
          const doc = yield* documentRepo.findById(urlParams);
          yield* DocumentPolicy.canDeleteDocument(doc);
          return yield* documentRepo.delete(urlParams);
        })
      );
  })
);
```

---

## Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HTTP Request                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      UserAuthMiddleware                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  1. Get session from better-auth                                   │ │
│  │  2. Decode User and Session models                                 │ │
│  │  3. Provide AuthContext to downstream                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CurrentUserProvider                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  1. Get member role from better-auth organization                  │ │
│  │  2. Resolve permissions from role using AC statement               │ │
│  │  3. Provide CurrentUser { user, permissions } to downstream        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Route Handler                                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  1. Fetch entity from repository                                   │ │
│  │  2. Apply entity policy (Effect-based)                             │ │
│  │     - Checks CurrentUser.permissions                               │ │
│  │     - Checks ownership, organization scope                         │ │
│  │  3. Execute business logic                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            Response                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Permission Resolution Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   better-auth    │     │   Effect Policy  │     │   Route Handler  │
│   Organization   │────▶│     System       │────▶│                  │
│   Plugin         │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        │ 1. User's role in      │ 2. Role → Permissions  │ 3. Check
        │    active org          │    Set<Permission>     │    permission()
        │    ("admin")           │    ("doc:read", ...)   │    or policy()
        ▼                        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ member.role =    │     │ CurrentUser {    │     │ canRead →        │
│ "admin"          │     │   permissions:   │     │ Effect.succeed() │
│                  │     │   Set<"doc:read",│     │ or               │
│ org.id =         │     │       "doc:write"│     │ BeepError.       │
│ "org_xxx"        │     │       ...>       │     │ Forbidden        │
│                  │     │ }                │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## File Structure

```
packages/
├── shared/
│   └── domain/
│       └── src/
│           ├── access-control/
│           │   ├── index.ts
│           │   ├── statements.ts      # AC statement definition
│           │   ├── roles.ts           # Role definitions
│           │   └── utils.ts           # Permission resolution utils
│           ├── Policy.ts              # Existing (updated)
│           └── _internal/
│               ├── policy.ts          # Existing
│               └── policy-builder.ts  # Existing
│
├── documents/
│   └── domain/
│       └── src/
│           └── entities/
│               ├── Document/
│               │   ├── Document.model.ts
│               │   ├── Document.policy.ts    # NEW
│               │   └── index.ts
│               ├── DocumentVersion/
│               │   ├── DocumentVersion.model.ts
│               │   ├── DocumentVersion.policy.ts  # NEW
│               │   └── index.ts
│               ├── Discussion/
│               │   ├── Discussion.model.ts
│               │   ├── Discussion.policy.ts  # NEW
│               │   └── index.ts
│               ├── Comment/
│               │   ├── Comment.model.ts
│               │   ├── Comment.policy.ts     # NEW
│               │   └── index.ts
│               ├── DocumentFile/
│               │   ├── DocumentFile.model.ts
│               │   ├── DocumentFile.policy.ts  # NEW
│               │   └── index.ts
│               ├── KnowledgePage/
│               │   ├── KnowledgePage.model.ts
│               │   ├── KnowledgePage.policy.ts  # EXISTS (update)
│               │   └── index.ts
│               ├── KnowledgeBlock/
│               │   ├── KnowledgeBlock.model.ts
│               │   ├── KnowledgeBlock.policy.ts  # NEW
│               │   └── index.ts
│               └── KnowledgeSpace/
│                   ├── KnowledgeSpace.model.ts
│                   ├── KnowledgeSpace.policy.ts  # NEW
│                   └── index.ts
│
└── iam/
    └── infra/
        └── src/
            ├── adapters/
            │   └── better-auth/
            │       ├── Auth.service.ts          # Update with AC
            │       └── plugins/
            │           └── organization/
            │               └── organization.plugin.ts  # Update with roles
            └── api/
                └── api.ts                       # Update middleware
```

---

## Implementation Phases

### Phase 1: Access Control Foundation
1. Create `packages/shared/domain/src/access-control/` directory
2. Implement `statements.ts` with unified AC statement
3. Implement `roles.ts` with organization roles
4. Export from `@beep/shared-domain/access-control`

### Phase 2: Better-Auth Integration
1. Update organization plugin to use custom AC and roles
2. Implement permission resolution utility functions
3. Update `UserAuthMiddleware` to populate permissions

### Phase 3: Entity Policies
1. Create `.policy.ts` files for each documents entity
2. Define permission-based policies (`canRead`, `canCreate`, etc.)
3. Define ownership and organization-scoped policies
4. Define composite policies for common use cases

### Phase 4: Route Integration
1. Update route handlers to use entity policies
2. Apply policies in appropriate lifecycle points
3. Handle policy failures gracefully

### Phase 5: Testing
1. Unit tests for permission resolution
2. Unit tests for entity policies
3. Integration tests for auth middleware
4. E2E tests for protected routes

---

## Key Design Decisions

### 1. Single Source of Truth
The `accessControlStatement` object serves as the single source of truth for:
- better-auth AC configuration
- Effect permission string literals
- TypeScript type inference

### 2. Organization-Scoped Authorization
All authorization is scoped to the user's `activeOrganizationId`:
- Permissions are derived from the user's role in the active org
- Entity-level policies verify organization membership
- Cross-org access requires switching active organization

### 3. Policy Composition
Policies compose using Effect's combinators:
- `all()` for AND logic
- `any()` for OR logic
- `withPolicy()` to apply to effects
- Custom predicates for ownership/attribute checks

### 4. Fail Closed
All policies fail with `BeepError.Forbidden` by default:
- No access unless explicitly granted
- Clear audit trail of authorization decisions
- Consistent error handling

### 5. Co-location
Policies live alongside domain models:
- Clear ownership and discoverability
- Entity-specific business rules stay with entity
- Import path mirrors model import path

---

## Security Considerations

1. **Server-Side Authority**: Never trust client-side permission checks for security decisions
2. **Organization Isolation**: Always verify organization membership before entity access
3. **Role Propagation**: Permission changes via better-auth propagate on next request
4. **Audit Logging**: Consider logging policy decisions for compliance
5. **Rate Limiting**: Protect permission check endpoints from abuse

---

## References

- [Better Auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Better Auth Access Control Blog Post](https://www.premieroctet.com/blog/en/better-auth-structure-and-permissions-with-the-organization-plugin)
- [Effect Service Pattern](https://effect.website/docs/guides/context-management/services)
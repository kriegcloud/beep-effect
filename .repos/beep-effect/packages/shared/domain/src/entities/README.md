# Shared Domain Entities

Canonical domain entity models shared across all vertical slices.

## Purpose

This directory contains domain entities that are **cross-cutting** and referenced by multiple vertical slices:

| Entity | Purpose | Used By Slices |
|--------|---------|----------------|
| **User** | Authentication, identity, profile data | IAM, Documents, Calendar, Knowledge |
| **Organization** | Multi-tenant organization structure | IAM, Documents, Calendar, Knowledge |
| **Team** | Sub-organizational groupings | IAM, Documents |
| **Session** | User authentication sessions | IAM |
| **File** | Uploaded file metadata | Documents, Knowledge |
| **Folder** | File organization structure | Documents |
| **UploadSession** | Multi-part upload tracking | Documents |
| **AuditLog** | Cross-entity audit trail | All slices |

## Architecture

### Entity Structure

Each entity directory follows this structure:

```
user/
├── user.model.ts         # M.Class domain model
├── user.constants.ts     # Entity-specific constants (if needed)
├── schemas/              # Additional schema variants
│   ├── user-role.schema.ts
│   └── index.ts
└── index.ts              # Re-exports
```

### Import Patterns

**Vertical slices MUST import these entities** rather than redefining them:

```typescript
// REQUIRED - Import from shared
import { User } from "@beep/shared-domain/entities";
import { SharedEntityIds } from "@beep/shared-domain";

// Use in domain model
export class Document extends M.Class<Document>("Document")({
  ...makeFields(DocumentsEntityIds.DocumentId, {
    ownerId: SharedEntityIds.UserId,  // Reference to shared entity
    // ...
  }),
}) {}
```

```typescript
// FORBIDDEN - Redefining in vertical slice
export class User extends M.Class<User>("User")({ ... }) {}  // Don't do this!
```

## Entity IDs

Entity IDs for shared entities are defined in `packages/shared/domain/src/entity-ids/shared/ids.ts`:

```typescript
import { SharedEntityIds } from "@beep/shared-domain";

// Available IDs
SharedEntityIds.UserId
SharedEntityIds.OrganizationId
SharedEntityIds.TeamId
SharedEntityIds.SessionId
SharedEntityIds.FileId
SharedEntityIds.FolderId
SharedEntityIds.UploadSessionId
SharedEntityIds.AuditLogId
```

### Slice-Specific Entity IDs

Each vertical slice defines its own EntityIds for slice-specific entities:

| Slice | Import | Example IDs |
|-------|--------|-------------|
| IAM | `IamEntityIds` from `@beep/shared-domain` | `MemberId`, `RoleId`, `InvitationId` |
| Documents | `DocumentsEntityIds` from `@beep/shared-domain` | `DocumentId`, `CommentId` |
| Knowledge | `KnowledgeEntityIds` from `@beep/knowledge-domain` | `EntityId`, `OntologyId`, `RelationId` |
| Calendar | `CalendarEntityIds` from `@beep/shared-domain` | `EventId`, `AvailabilityId` |

## When to Use Shared Entities

### Use shared entities when:

- Entity is referenced by 2+ vertical slices
- Entity represents core platform concept (user, org, team)
- Entity is part of authentication/authorization flow
- Entity tracks cross-cutting concerns (audit logs)

### Create slice-specific entities when:

- Entity is only used within one vertical slice
- Entity represents slice-specific domain concept (Document → documents, Event → calendar)
- Entity extends shared concepts with slice-specific fields (use composition, not inheritance)

## Cross-Slice References

Vertical slices ALWAYS reference shared entities through branded EntityIds:

```typescript
// In documents/domain/src/entities/Document/Document.model.ts
import { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "../entity-ids";
import { makeFields } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";

export class Document extends M.Class<Document>("Document")({
  ...makeFields(DocumentsEntityIds.DocumentId, {
    ownerId: SharedEntityIds.UserId,              // Cross-slice reference to User
    organizationId: SharedEntityIds.OrganizationId,  // Cross-slice reference to Org
    folderId: SharedEntityIds.FolderId,           // Cross-slice reference to Folder
    // ... document-specific fields
  }),
}) {}
```

## Verification

### Check no slice redefines shared entities

```bash
# Should return empty (no User class defined outside shared)
grep -r "class User extends" packages/*/domain/src/entities/ | grep -v "packages/shared"

# Should return empty (no Organization class defined outside shared)
grep -r "class Organization extends" packages/*/domain/src/entities/ | grep -v "packages/shared"
```

### Check all ID references use EntityIds

```bash
# Look for plain S.String on ID fields (should be 0)
grep -r ": S.String" packages/*/domain/src/entities/ | grep -iE "(id|Id):"
```

### Verify type compilation

```bash
# All domain packages should compile
bun run check --filter @beep/shared-domain
bun run check --filter @beep/iam-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/knowledge-domain
```

## Related Documentation

- [Entity IDs](../entity-ids/README.md) - Branded ID types
- [Effect Patterns](../../../../.claude/rules/effect-patterns.md) - Effect Schema patterns
- [Database Patterns](../../../../documentation/patterns/database-patterns.md) - Table creation workflow

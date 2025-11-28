# RPC Design Document for Knowledge Management Domain

## Overview

This document outlines the design for implementing `@effect/rpc` contracts for the Knowledge Management domain entities: **Comment**, **Discussion**, **Document**, **DocumentFile**, and **DocumentVersion**.

The design follows the existing patterns established in `KnowledgePage.contract.ts` but adapted for the RPC paradigm, leveraging Model variants from `@effect/sql/Model` and streaming capabilities from `@effect/rpc`.

**Reference Implementation:** This design mirrors the features in `tmp/potion` (Notion clone) which uses Prisma + tRPC. We are implementing equivalent functionality using Effect + Drizzle.

---

## Potion Feature Alignment

### Prisma Schema Mapping

| Potion (Prisma) | beep-effect (Drizzle/Effect) |
|-----------------|------------------------------|
| `Document` | `@beep/knowledge-management-tables/document` |
| `DocumentVersion` | `@beep/knowledge-management-tables/documentVersion` |
| `Discussion` | `@beep/knowledge-management-tables/discussion` |
| `Comment` | `@beep/knowledge-management-tables/comment` |
| `File` | `@beep/knowledge-management-tables/documentFile` |

### Key Differences

1. **Multi-tenancy**: Our schema adds `organizationId` for multi-tenant support (Potion is single-tenant)
2. **Audit columns**: We include `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `version` via `OrgTable.make`
3. **Soft deletes**: We support soft deletes via `deletedAt` column (Potion uses hard deletes)

---

## Architecture Overview

### File Structure

Each entity will have the following files collocated in its domain module:

```
packages/knowledge-management/domain/src/entities/{EntityName}/
├── {EntityName}.model.ts      # Existing - Model class with variants
├── {EntityName}.errors.ts     # NEW - Error schemas as TaggedErrors
├── {EntityName}.rpc.ts        # NEW - Rpc definitions using Rpc.make
└── index.ts                   # Updated - Export all modules
```

### Key Technologies

1. **@effect/rpc** - For RPC definitions (`Rpc.make`, `RpcGroup.make`)
2. **@effect/sql/Model** - For Model variants (`select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`)
3. **effect/Schema** - For payload and response schemas
4. **RpcMiddleware** - For authentication via `UserAuthMiddleware` pattern

---

## Model Variant Usage

Each Model class inherits from `@effect/sql/Model.Class` which provides the following variants:

| Variant | Purpose | Use Case |
|---------|---------|----------|
| `Model` (default/select) | Full entity with all fields | GET responses, read operations |
| `Model.insert` | Fields for creation (auto-generates ID, timestamps) | CREATE payloads |
| `Model.update` | Fields for updates (requires ID) | UPDATE payloads |
| `Model.json` | JSON-safe representation | API responses |
| `Model.jsonCreate` | JSON-safe creation input | Client-side create forms |
| `Model.jsonUpdate` | JSON-safe update input | Client-side update forms |

---

## Error Design Patterns

### Error Union Pattern

Each entity defines errors as a Union of TaggedErrors, following the pattern:

```typescript
// {EntityName}.errors.ts
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";
import { EntityIds } from "@beep/shared-domain";

export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>(
  "@beep/knowledge-management-domain/entities/{EntityName}/{EntityName}NotFoundError"
)(
  "{EntityName}NotFoundError",
  { id: EntityIds.{EntityName}Id },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class EntityPermissionDeniedError extends S.TaggedError<EntityPermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/{EntityName}/{EntityName}PermissionDeniedError"
)(
  "{EntityName}PermissionDeniedError",
  { id: EntityIds.{EntityName}Id },
  HttpApiSchema.annotations({ status: 403 })
) {}

// Union for RPC error schema
export const Errors = S.Union(
  EntityNotFoundError,
  EntityPermissionDeniedError,
  // ... other entity-specific errors
);
```

### Common Error Patterns Per Entity

| Entity | Common Errors |
|--------|---------------|
| Comment | NotFound, PermissionDenied, DiscussionClosed |
| Discussion | NotFound, PermissionDenied, AlreadyResolved |
| Document | NotFound, PermissionDenied, Archived, Locked |
| DocumentFile | NotFound, PermissionDenied, SizeLimitExceeded |
| DocumentVersion | NotFound, PermissionDenied, VersionConflict |

---

## RPC Design Patterns

### Basic RPC Structure

```typescript
// {EntityName}.rpc.ts
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { Model } from "./{EntityName}.model.ts";
import * as Errors from "./{EntityName}.errors.ts";
import { EntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Rpcs extends RpcGroup.make(
  // GET single entity
  Rpc.make("get", {
    payload: { id: EntityIds.{EntityName}Id },
    success: Model.json,
    error: Errors.EntityNotFoundError,
  }),

  // LIST with pagination (streamable)
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      limit: Schema.optional(Schema.Int.pipe(Schema.positive())),
      offset: Schema.optional(Schema.Int.pipe(Schema.nonNegative())),
    },
    success: Model.json,
    stream: true,
  }),

  // CREATE
  Rpc.make("create", {
    payload: Model.jsonCreate.fields,
    success: Model.json,
    error: Errors.Errors,
  }),

  // UPDATE
  Rpc.make("update", {
    payload: Model.jsonUpdate.fields,
    success: Model.json,
    error: Errors.Errors,
  }),

  // DELETE
  Rpc.make("delete", {
    payload: { id: EntityIds.{EntityName}Id },
    success: Schema.Void,
    error: Errors.EntityNotFoundError,
  }),
).middleware(UserAuthMiddleware) {}
```

### Streaming RPC Pattern

For list operations that may return large datasets, use the `stream: true` option:

```typescript
Rpc.make("list", {
  payload: {
    parentId: EntityIds.ParentId,
    // Pagination is handled by streaming, but you can include filters
  },
  success: Model.json,
  error: Errors.Errors,
  stream: true, // Returns Stream<Model.json["Type"]> instead of Effect
})
```

**Handler Implementation for Streams:**

```typescript
// In router/handler
list: ({ parentId }) =>
  Stream.fromIterableEffect(repo.listByParent({ parentId }))
```

---

## Entity-Specific Designs

### 1. Comment Entity

**Purpose:** Individual comments within discussions.

**Potion tRPC Reference:** `src/server/api/routers/comment.ts`
- `createComment` - Create comment in discussion
- `updateComment` - Update comment content (sets isEdited)
- `deleteComment` - Delete comment

**RPCs:**

| RPC | Payload | Success | Error | Stream | Potion Equiv |
|-----|---------|---------|-------|--------|--------------|
| `get` | `{ id: CommentId }` | `Model.json` | `CommentNotFoundError` | No | - |
| `listByDiscussion` | `{ discussionId: DiscussionId }` | `Model.json` | - | Yes | via `discussions` |
| `create` | `{ discussionId, content, contentRich? }` | `Model.json` | `Errors` | No | `createComment` |
| `update` | `{ id, discussionId, content?, contentRich?, isEdited? }` | `Model.json` | `Errors` | No | `updateComment` |
| `delete` | `{ id: CommentId, discussionId }` | `Void` | `CommentNotFoundError` | No | `deleteComment` |

**Errors:**
- `CommentNotFoundError` - Comment with given ID doesn't exist
- `CommentPermissionDeniedError` - User lacks permission to modify
- `CommentTooLongError` - Comment exceeds MAX_COMMENT_LENGTH (50KB)

**Validation Rules (from Potion):**
- `content` max length: 50,000 characters (50KB for rich content)

---

### 2. Discussion Entity

**Purpose:** Discussion threads attached to documents with highlighted content.

**Potion tRPC Reference:** `src/server/api/routers/comment.ts`
- `createDiscussion` - Create discussion on document
- `createDiscussionWithComment` - Create discussion with initial comment (atomic)
- `resolveDiscussion` - Mark discussion as resolved
- `removeDiscussion` - Delete discussion
- `discussions` - List discussions for document with nested comments

**RPCs:**

| RPC | Payload | Success | Error | Stream | Potion Equiv |
|-----|---------|---------|-------|--------|--------------|
| `get` | `{ id: DiscussionId }` | `DiscussionWithComments` | `DiscussionNotFoundError` | No | - |
| `listByDocument` | `{ documentId: DocumentId }` | `DiscussionWithComments` | - | Yes | `discussions` |
| `create` | `{ documentId, documentContent }` | `Model.json` | `Errors` | No | `createDiscussion` |
| `createWithComment` | `{ documentId, documentContent, contentRich?, discussionId? }` | `Model.json` | `Errors` | No | `createDiscussionWithComment` |
| `resolve` | `{ id: DiscussionId }` | `Model.json` | `Errors` | No | `resolveDiscussion` |
| `delete` | `{ id: DiscussionId }` | `Void` | `DiscussionNotFoundError` | No | `removeDiscussion` |

**Response Includes (from Potion `discussions` query):**
- Discussion fields: `id`, `documentContent`, `isResolved`, `createdAt`, `userId`
- User info: `id`, `name`, `profileImageUrl`
- Nested comments with user info

**Errors:**
- `DiscussionNotFoundError` - Discussion with given ID doesn't exist
- `DiscussionPermissionDeniedError` - User lacks permission
- `DocumentContentTooLongError` - Highlighted text exceeds 1000 chars

**Validation Rules (from Potion):**
- `documentContent` min: 1, max: 1000 characters

---

### 3. Document Entity

**Purpose:** Rich-text documents with collaborative editing support.

**Potion tRPC Reference:** `src/server/api/routers/document.ts`
- `document` - Get single document (supports templateId lookup)
- `documents` - List documents with cursor pagination
- `trash` - List archived documents
- `create` - Create new document
- `update` - Update document (many fields)
- `archive` - Soft delete (set isArchived=true)
- `restore` - Unarchive (set isArchived=false)
- `delete` - Hard delete

**RPCs:**

| RPC | Payload | Success | Error | Stream | Potion Equiv |
|-----|---------|---------|-------|--------|--------------|
| `get` | `{ id: DocumentId }` | `Model.json` | `DocumentNotFoundError` | No | `document` |
| `getByTemplate` | `{ templateId: string }` | `Model.json` | `DocumentNotFoundError` | No | `document` (templateId) |
| `list` | `{ parentDocumentId?, search?, cursor?, limit? }` | `DocumentListItem` | - | Yes | `documents` |
| `listTrash` | `{ search? }` | `DocumentListItem` | - | Yes | `trash` |
| `listChildren` | `{ parentDocumentId }` | `DocumentListItem` | - | Yes | `documents` |
| `search` | `{ query, organizationId, ...options }` | `SearchResult` | - | Yes | full-text search |
| `create` | `{ title?, contentRich?, parentDocumentId? }` | `{ id }` | `Errors` | No | `create` |
| `update` | `{ id, title?, content?, contentRich?, ...settings }` | `Void` | `Errors` | No | `update` |
| `archive` | `{ id: DocumentId }` | `Void` | `Errors` | No | `archive` |
| `restore` | `{ id: DocumentId }` | `Void` | `Errors` | No | `restore` |
| `delete` | `{ id: DocumentId }` | `Void` | `DocumentNotFoundError` | No | `delete` |

**Document Settings (from Potion `update`):**
- `coverImage` - Cover image URL (max 500 chars)
- `fullWidth` - Full width layout
- `icon` - Emoji/icon (max 100 chars)
- `isPublished` - Public visibility
- `lockPage` - Lock editing
- `smallText` - Small text mode
- `textStyle` - DEFAULT | SERIF | MONO
- `toc` - Show table of contents

**Response Schemas:**
- `DocumentListItem`: `{ id, title, icon, coverImage, createdAt, updatedAt }`
- `SearchResult`: `{ id, title, content, rank }`

**Errors:**
- `DocumentNotFoundError` - Document with given ID doesn't exist
- `DocumentPermissionDeniedError` - User lacks permission
- `ContentTooLongError` - Content exceeds 1MB limit

**Validation Rules (from Potion):**
- `title` max: 256 characters
- `content` max: 1,000,000 characters (1MB)
- `icon` max: 100 characters
- `coverImage` max: 500 characters

---

### 4. DocumentFile Entity

**Purpose:** Files attached to documents (images, attachments).

**Potion tRPC Reference:** `src/server/api/routers/file.ts`
- `createFile` - Create file record (after upload)

**RPCs:**

| RPC | Payload | Success | Error | Stream | Potion Equiv |
|-----|---------|---------|-------|--------|--------------|
| `get` | `{ id: DocumentFileId }` | `Model.json` | `DocumentFileNotFoundError` | No | - |
| `listByDocument` | `{ documentId: DocumentId }` | `Model.json` | - | Yes | - |
| `create` | `{ id, documentId, size, url, appUrl, type }` | `Model.json` | `Errors` | No | `createFile` |
| `delete` | `{ id: DocumentFileId }` | `Void` | `DocumentFileNotFoundError` | No | - |

**Errors:**
- `DocumentFileNotFoundError` - File with given ID doesn't exist
- `DocumentFilePermissionDeniedError` - User lacks permission

**Note:** File upload itself is handled via UploadThing integration, this RPC only creates the database record.

---

### 5. DocumentVersion Entity

**Purpose:** Version history for documents.

**Potion tRPC Reference:** `src/server/api/routers/version.ts`
- `documentVersion` - Get single version with user info
- `documentVersions` - List versions for document
- `createVersion` - Snapshot current document
- `restoreVersion` - Restore document from version
- `deleteVersion` - Delete version

**RPCs:**

| RPC | Payload | Success | Error | Stream | Potion Equiv |
|-----|---------|---------|-------|--------|--------------|
| `get` | `{ id: DocumentVersionId }` | `VersionWithUser` | `DocumentVersionNotFoundError` | No | `documentVersion` |
| `listByDocument` | `{ documentId: DocumentId }` | `VersionWithUser` | - | Yes | `documentVersions` |
| `create` | `{ documentId: DocumentId }` | `{ id }` | `Errors` | No | `createVersion` |
| `restore` | `{ id: DocumentVersionId }` | `Document.Model.json` | `Errors` | No | `restoreVersion` |
| `delete` | `{ id: DocumentVersionId }` | `Void` | `DocumentVersionNotFoundError` | No | `deleteVersion` |

**Response Includes (from Potion):**
- Version fields: `id`, `title`, `contentRich`, `createdAt`, `documentId`
- User info: `id`, `username`, `profileImageUrl`

**Response Schemas:**
- `VersionWithUser`: `{ id, title, contentRich, createdAt, documentId, userId, username, profileImageUrl? }`

**Errors:**
- `DocumentVersionNotFoundError` - Version with given ID doesn't exist
- `DocumentVersionPermissionDeniedError` - User lacks permission

**Note:** `createVersion` automatically snapshots the current document content. If document uses a template and has no content, it uses the template content.

---

## Middleware Integration

### Authentication Middleware

All RPCs should use the `UserAuthMiddleware` pattern for authentication:

```typescript
import { RpcMiddleware } from "@effect/rpc";
import { AuthContext } from "@beep/shared-domain/Policy";

export class RpcAuthMiddleware extends RpcMiddleware.Tag<RpcAuthMiddleware>()(
  "RpcAuthMiddleware",
  {
    provides: AuthContext,
    requiredForClient: true,
  }
) {}
```

Apply to entire group:

```typescript
export class Rpcs extends RpcGroup.make(
  // ... RPCs
).middleware(RpcAuthMiddleware) {}
```

### Authorization in Handlers

Authorization checks happen in the handler implementation:

```typescript
// In router implementation
const handlers = {
  update: ({ id, ...data }) =>
    Effect.gen(function* () {
      const { user } = yield* AuthContext;
      const entity = yield* repo.findById(id);

      // Authorization check
      if (entity.userId !== user.id) {
        return yield* new EntityPermissionDeniedError({ id });
      }

      return yield* repo.update({ id, ...data });
    }),
};
```

---

## Implementation Recommendations

### 1. Payload Schema Extraction

Use `Model.jsonCreate.fields` and `Model.jsonUpdate.fields` directly for payload schemas to maintain consistency with Model definitions.

### 2. Error Composition

Use `Schema.Union` to compose all entity errors into a single error type for the RPC:

```typescript
export const Errors = S.Union(
  NotFoundError,
  PermissionDeniedError,
  SpecificError1,
  SpecificError2,
);
```

### 3. Stream vs Effect

Use `stream: true` for:
- List operations that may return many items
- Real-time subscription-style updates
- Search results

Use regular Effect for:
- Single entity operations (get, create, update, delete)
- Operations with a known bounded result set

### 4. RPC Naming Conventions

- Use descriptive action names: `get`, `create`, `update`, `delete`
- For specialized operations: `archive`, `restore`, `publish`, `resolve`
- For list operations with filters: `listByDocument`, `listByUser`, `listChildren`

---

## Testing Strategy

### Unit Tests for Error Schemas

```typescript
describe("CommentErrors", () => {
  it("should encode/decode CommentNotFoundError correctly", () => {
    const error = new CommentNotFoundError({ id: "comment__123" });
    const encoded = S.encodeSync(CommentNotFoundError)(error);
    expect(encoded._tag).toBe("CommentNotFoundError");
  });
});
```

### Integration Tests for RPCs

```typescript
describe("Comment.Rpcs", () => {
  it("should create a comment", async () => {
    const client = yield* RpcClient.make(Comment.Rpcs);
    const result = yield* client.create({
      discussionId: "discussion__123",
      content: "Test comment",
    });
    expect(result.content).toBe("Test comment");
  });
});
```

---

## File Reference Index

### Domain Layer (`@beep/knowledge-management-domain`)

| File | Absolute Path | Exports |
|------|---------------|---------|
| Comment.model.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.model.ts` | `Model` |
| Comment.errors.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.errors.ts` | `CommentNotFoundError`, `CommentPermissionDeniedError`, `CommentTooLongError`, `Errors` |
| Comment.rpc.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.rpc.ts` | `Rpcs` |
| Comment/index.ts | `packages/knowledge-management/domain/src/entities/Comment/index.ts` | Re-exports all |
| Discussion.model.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.model.ts` | `Model` |
| Discussion.errors.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.errors.ts` | `DiscussionNotFoundError`, `DiscussionPermissionDeniedError`, `DiscussionAlreadyResolvedError`, `DiscussionNotResolvedError`, `DocumentContentTooLongError`, `Errors` |
| Discussion.rpc.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.rpc.ts` | `Rpcs`, `DiscussionWithComments` |
| Discussion/index.ts | `packages/knowledge-management/domain/src/entities/Discussion/index.ts` | Re-exports all |
| Document.model.ts | `packages/knowledge-management/domain/src/entities/Document/Document.model.ts` | `Model` |
| Document.errors.ts | `packages/knowledge-management/domain/src/entities/Document/Document.errors.ts` | `DocumentNotFoundError`, `DocumentPermissionDeniedError`, `DocumentArchivedError`, `DocumentLockedError`, `ContentTooLongError`, `Errors` |
| Document.rpc.ts | `packages/knowledge-management/domain/src/entities/Document/Document.rpc.ts` | `Rpcs`, `DocumentListItem`, `SearchResult` |
| Document/index.ts | `packages/knowledge-management/domain/src/entities/Document/index.ts` | Re-exports all |
| DocumentFile.model.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.model.ts` | `Model` |
| DocumentFile.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.errors.ts` | `DocumentFileNotFoundError`, `DocumentFilePermissionDeniedError`, `DocumentFileSizeLimitExceededError`, `DocumentFileInvalidTypeError`, `Errors` |
| DocumentFile.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.rpc.ts` | `Rpcs` |
| DocumentFile/index.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/index.ts` | Re-exports all |
| DocumentVersion.model.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.model.ts` | `Model` |
| DocumentVersion.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.errors.ts` | `DocumentVersionNotFoundError`, `DocumentVersionPermissionDeniedError`, `DocumentVersionConflictError`, `Errors` |
| DocumentVersion.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.rpc.ts` | `Rpcs`, `VersionWithUser` |
| DocumentVersion/index.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/index.ts` | Re-exports all |

### Tables Layer (`@beep/knowledge-management-tables`)

| File | Absolute Path | Exports |
|------|---------------|---------|
| comment.table.ts | `packages/knowledge-management/tables/src/tables/comment.table.ts` | `comment` |
| discussion.table.ts | `packages/knowledge-management/tables/src/tables/discussion.table.ts` | `discussion` |
| document.table.ts | `packages/knowledge-management/tables/src/tables/document.table.ts` | `document` |
| documentFile.table.ts | `packages/knowledge-management/tables/src/tables/documentFile.table.ts` | `documentFile` |
| documentVersion.table.ts | `packages/knowledge-management/tables/src/tables/documentVersion.table.ts` | `documentVersion` |

### Infrastructure Layer (`@beep/knowledge-management-infra`)

| File | Absolute Path | Exports |
|------|---------------|---------|
| Comment.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Comment.repo.ts` | `CommentRepo` |
| Discussion.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Discussion.repo.ts` | `DiscussionRepo` |
| Document.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Document.repo.ts` | `DocumentRepo` |
| DocumentFile.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/DocumentFile.repo.ts` | `DocumentFileRepo` |
| DocumentVersion.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/DocumentVersion.repo.ts` | `DocumentVersionRepo` |
| Comment.router.ts | `packages/knowledge-management/infra/src/routes/Comment.router.ts` | `CommentRpcLive` |
| Discussion.router.ts | `packages/knowledge-management/infra/src/routes/Discussion.router.ts` | `DiscussionRpcLive` |
| Document.router.ts | `packages/knowledge-management/infra/src/routes/Document.router.ts` | `DocumentRpcLive` |
| DocumentFile.router.ts | `packages/knowledge-management/infra/src/routes/DocumentFile.router.ts` | `DocumentFileRpcLive` |
| DocumentVersion.router.ts | `packages/knowledge-management/infra/src/routes/DocumentVersion.router.ts` | `DocumentVersionRpcLive` |

### Shared Domain (`@beep/shared-domain`)

| File | Absolute Path | Exports |
|------|---------------|---------|
| knowledge-management.ts | `packages/shared/domain/src/entity-ids/knowledge-management.ts` | `CommentId`, `DiscussionId`, `DocumentId`, `DocumentFileId`, `DocumentVersionId`, `KnowledgePageId`, `KnowledgeBlockId`, `PageLinkId`, `KnowledgeSpaceId` |
| Policy.ts | `packages/shared/domain/src/Policy.ts` | `AuthContext`, `CurrentUser`, `UserAuthMiddleware`, `policy`, `withPolicy`, `all`, `any`, `permission` |
| common.ts | `packages/shared/domain/src/common.ts` | `auditColumns`, `userTrackingColumns`, `globalColumns`, `makeFields` |

---

## Next Steps

See `RPC_PLAN.md` for the detailed implementation plan with step-by-step instructions.
See `RPC_VALIDATION.md` for the validation report and issues found.
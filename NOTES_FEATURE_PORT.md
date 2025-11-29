# Documents Slice: Design Document

## About This Document

This design document describes the Effect-based implementation of a Notion-style document editor with real-time collaboration. The goal is to implement the complete feature set of `apps/notes` (the POC app) using Effect patterns, `@effect/rpc`, and the vertical slice architecture established in beep-effect.

**Reference Implementation:** `apps/notes/` - A working Prisma/tRPC-based notes app that this design translates to Effect patterns.

---

## 1. Overview

### Purpose

The `documents` slice implements a rich document editor with:
- **Hierarchical Documents**: Parent-child document trees (like Notion pages)
- **Rich Text Editing**: Plate editor with paragraphs, headings, code blocks, tables, images
- **Real-Time Collaboration**: Yjs + Hocuspocus for live multi-user editing
- **Discussions & Comments**: Inline commenting on document content
- **Version History**: Snapshots with restore capability
- **File Attachments**: Image and file uploads
- **AI Integration**: Content generation, editing suggestions, and AI comments
- **Publishing**: Public/private document access

### Technology Comparison

| Feature | apps/notes (POC) | packages/documents (Effect) |
|---------|-----------------|----------------------------|
| Database | Prisma | Drizzle + @effect/sql-drizzle |
| API | tRPC + Hono | @effect/rpc + @effect/platform |
| State | Jotai | @effect-atom/atom-react |
| Editor | Plate | Plate |
| Collaboration | Yjs + Hocuspocus | Yjs + Hocuspocus |
| Auth | Lucia + better-auth | better-auth via IAM slice |
| File Upload | UploadThing | @beep/files slice |
| AI | Vercel AI SDK | Effect-wrapped AI services |

---

## 2. Architecture

### 2.1 Vertical Slice Structure

Following the [Monorepo Structure](https://deepwiki.com/kriegcloud/beep-effect/2.1-monorepo-structure):

```
packages/documents/
├── domain/                     # @beep/documents-domain
│   ├── src/
│   │   ├── entities/
│   │   │   ├── Document/
│   │   │   │   ├── Document.model.ts
│   │   │   │   ├── Document.rpc.ts
│   │   │   │   ├── Document.errors.ts
│   │   │   │   └── index.ts
│   │   │   ├── Discussion/
│   │   │   ├── Comment/
│   │   │   ├── DocumentVersion/
│   │   │   ├── DocumentFile/
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── TextStyle.ts
│   │   │   └── index.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   └── package.json
├── tables/                     # @beep/documents-tables
│   ├── src/
│   │   ├── tables/
│   │   │   ├── document.table.ts
│   │   │   ├── discussion.table.ts
│   │   │   ├── comment.table.ts
│   │   │   ├── documentVersion.table.ts
│   │   │   ├── documentFile.table.ts
│   │   │   └── index.ts
│   │   ├── relations.ts
│   │   ├── schema.ts
│   │   └── index.ts
│   └── package.json
├── infra/                      # @beep/documents-infra
│   ├── src/
│   │   ├── adapters/repos/
│   │   │   ├── Document.repo.ts
│   │   │   ├── Discussion.repo.ts
│   │   │   ├── Comment.repo.ts
│   │   │   ├── DocumentVersion.repo.ts
│   │   │   ├── DocumentFile.repo.ts
│   │   │   └── index.ts
│   │   ├── handlers/
│   │   │   ├── Document.handlers.ts
│   │   │   ├── Discussion.handlers.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── YjsService.ts
│   │   │   ├── AIService.ts
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   └── Db/Db.ts
│   │   └── index.ts
│   └── package.json
├── sdk/                        # @beep/documents-sdk
│   ├── src/
│   │   ├── client.ts           # RPC client bindings
│   │   ├── hooks/              # React hooks for documents
│   │   └── index.ts
│   └── package.json
└── ui/                         # @beep/documents-ui
    ├── src/
    │   ├── components/
    │   │   ├── Editor/
    │   │   ├── DocumentTree/
    │   │   ├── DiscussionPanel/
    │   │   └── index.ts
    │   └── index.ts
    └── package.json
```

### 2.2 Dependency Flow

```
apps/web (Next.js)
    ↓ [uses SDK hooks]
@beep/documents-sdk
    ↓ [@effect/rpc client]
@beep/documents-infra (handlers)
    ↓ [implements RPCs]
@beep/documents-domain (models, RPCs)
    ↓ [uses tables]
@beep/documents-tables (Drizzle)
    ↓
PostgreSQL + Yjs WebSocket Server
```

---

## 3. Domain Entities

All entities are implemented using `@effect/sql/Model` with `makeFields` from `@beep/shared-domain/common`.

### 3.1 Document

The primary entity representing a rich-text document with collaboration support.

**File:** `packages/documents/domain/src/entities/Document/Document.model.ts`

```typescript
import { TextStyle } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`DocumentModel`)(
  makeFields(DocumentsEntityIds.DocumentId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    templateId: BS.FieldOptionOmittable(S.String),
    parentDocumentId: BS.FieldOptionOmittable(DocumentsEntityIds.DocumentId),
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    content: BS.FieldOptionOmittable(S.String),              // Plain text extraction
    contentRich: BS.FieldOptionOmittable(S.Unknown),         // Plate JSON
    yjsSnapshot: BS.FieldOptionOmittable(S.Uint8ArrayFromBase64), // Yjs binary state
    coverImage: BS.FieldOptionOmittable(S.String),
    icon: BS.FieldOptionOmittable(S.String),
    isPublished: BS.toOptionalWithDefault(S.Boolean)(false),
    isArchived: BS.toOptionalWithDefault(S.Boolean)(false),
    textStyle: BS.toOptionalWithDefault(TextStyle)("default"),
    smallText: BS.toOptionalWithDefault(S.Boolean)(false),
    fullWidth: BS.toOptionalWithDefault(S.Boolean)(false),
    lockPage: BS.toOptionalWithDefault(S.Boolean)(false),
    toc: BS.toOptionalWithDefault(S.Boolean)(true),
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Key Fields:**
- `contentRich` - Plate editor JSON content
- `yjsSnapshot` - Binary Yjs document state for collaboration
- `content` - Plain text extraction for full-text search
- `templateId` - References template documents for "Use Template" feature
- `parentDocumentId` - Enables nested document hierarchy

**Mapping from apps/notes Prisma:**
| Prisma Field | Effect Model Field | Notes |
|--------------|-------------------|-------|
| `id` | `id` | Via `DocumentId` EntityId |
| `userId` | `userId` | Owner |
| `parentDocumentId` | `parentDocumentId` | Nullable self-reference |
| `title` | `title` | Nullable, max 500 chars |
| `content` | `content` | Plain text for search |
| `contentRich` | `contentRich` | Plate JSON |
| `yjsSnapshot` | `yjsSnapshot` | Base64-encoded binary |
| `coverImage` | `coverImage` | URL or data URI |
| `icon` | `icon` | Emoji or icon key |
| `isPublished` | `isPublished` | Public access flag |
| `isArchived` | `isArchived` | Soft delete flag |
| `textStyle` | `textStyle` | DEFAULT/SERIF/MONO |
| `smallText` | `smallText` | Font size toggle |
| `fullWidth` | `fullWidth` | Layout toggle |
| `lockPage` | `lockPage` | Read-only toggle |
| `toc` | `toc` | Table of contents |

---

### 3.2 Discussion

A discussion thread attached to specific document content.

**File:** `packages/documents/domain/src/entities/Discussion/Discussion.model.ts`

```typescript
export class Model extends M.Class<Model>(`DiscussionModel`)(
  makeFields(DocumentsEntityIds.DiscussionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    documentContent: S.String,                    // Highlighted text
    documentContentRich: BS.FieldOptionOmittable(S.Unknown), // Plate JSON
    isResolved: BS.toOptionalWithDefault(S.Boolean)(false),
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Purpose:** Captures inline comments on document content (like Google Docs comments).

---

### 3.3 Comment

Individual comments within a discussion thread.

**File:** `packages/documents/domain/src/entities/Comment/Comment.model.ts`

```typescript
export class Model extends M.Class<Model>(`CommentModel`)(
  makeFields(DocumentsEntityIds.CommentId, {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: DocumentsEntityIds.DiscussionId,
    userId: SharedEntityIds.UserId,
    content: S.String,
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    isEdited: BS.toOptionalWithDefault(S.Boolean)(false),
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### 3.4 DocumentVersion

Immutable snapshots for version history.

**File:** `packages/documents/domain/src/entities/DocumentVersion/DocumentVersion.model.ts`

```typescript
export class Model extends M.Class<Model>(`DocumentVersionModel`)(
  makeFields(DocumentsEntityIds.DocumentVersionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    title: BS.FieldOptionOmittable(S.String),
    contentRich: BS.FieldOptionOmittable(S.Unknown),
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Usage:** Created on-demand when user triggers "Save Version" or periodically via background job.

---

### 3.5 DocumentFile

File attachments linked to documents.

**File:** `packages/documents/domain/src/entities/DocumentFile/DocumentFile.model.ts`

```typescript
export class Model extends M.Class<Model>(`DocumentFileModel`)(
  makeFields(DocumentsEntityIds.DocumentFileId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: BS.FieldOptionOmittable(DocumentsEntityIds.DocumentId),
    userId: SharedEntityIds.UserId,
    url: S.String,
    appUrl: S.String,
    size: S.Int,
    type: S.String,
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### 3.6 Value Objects

**TextStyle** - Document text styling enum:

```typescript
// packages/documents/domain/src/value-objects/TextStyle.ts
import { stringLiteralKit } from "@beep/schema/kits";

export const TextStyle = stringLiteralKit({
  literals: ["default", "serif", "mono"] as const,
  annotations: { identifier: "TextStyle" },
}).Schema;

export type TextStyle = typeof TextStyle.Type;
```

---

## 4. Database Tables

All tables use `OrgTable.make()` for multi-tenancy support.

### 4.1 document

**File:** `packages/documents/tables/src/tables/document.table.ts`

```typescript
import { TextStyle } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const textStylePgEnum = BS.toPgEnum(TextStyle)("text_style_enum");

export const document = OrgTable.make(DocumentsEntityIds.DocumentId)(
  {
    userId: pg.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    templateId: pg.text("template_id"),
    parentDocumentId: pg.text("parent_document_id"),
    title: pg.text("title"),
    content: pg.text("content"),
    contentRich: pg.jsonb("content_rich"),
    yjsSnapshot: pg.text("yjs_snapshot"),  // Base64-encoded binary
    coverImage: pg.text("cover_image"),
    icon: pg.text("icon"),
    isPublished: pg.boolean("is_published").notNull().default(false),
    isArchived: pg.boolean("is_archived").notNull().default(false),
    textStyle: textStylePgEnum("text_style").notNull().default("default"),
    smallText: pg.boolean("small_text").notNull().default(false),
    fullWidth: pg.boolean("full_width").notNull().default(false),
    lockPage: pg.boolean("lock_page").notNull().default(false),
    toc: pg.boolean("toc").notNull().default(true),
  },
  (t) => [
    pg.uniqueIndex("document_user_template_idx").on(t.userId, t.templateId),
    pg.index("document_user_idx").on(t.userId),
    pg.index("document_parent_idx").on(t.parentDocumentId),
    pg.index("document_is_published_idx").on(t.isPublished),
    pg.index("document_is_archived_idx").on(t.isArchived),
    // Full-text search GIN index
    pg.index("document_search_idx").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', coalesce(${t.title}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${t.content}, '')), 'B')
      )`
    ),
  ]
);
```

**Global Columns (via OrgTable.make):**
- `id` - DocumentId (text, primary key)
- `_row_id` - Serial for internal use
- `organization_id` - Tenant isolation
- `created_at`, `updated_at`, `deleted_at` - Timestamps
- `created_by`, `updated_by`, `deleted_by` - User tracking
- `version` - Optimistic locking
- `source` - Traceability

---

### 4.2 Table Relations

**File:** `packages/documents/tables/src/relations.ts`

```typescript
import * as d from "drizzle-orm";
import { document, discussion, comment, documentVersion, documentFile } from "./tables";
import { user, organization } from "@beep/shared-tables";

export const documentRelations = d.relations(document, ({ one, many }) => ({
  organization: one(organization, {
    fields: [document.organizationId],
    references: [organization.id],
  }),
  owner: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
  parentDocument: one(document, {
    fields: [document.parentDocumentId],
    references: [document.id],
    relationName: "documentHierarchy",
  }),
  childDocuments: many(document, { relationName: "documentHierarchy" }),
  versions: many(documentVersion),
  discussions: many(discussion),
  files: many(documentFile),
}));

export const discussionRelations = d.relations(discussion, ({ one, many }) => ({
  document: one(document, {
    fields: [discussion.documentId],
    references: [document.id],
  }),
  author: one(user, {
    fields: [discussion.userId],
    references: [user.id],
  }),
  comments: many(comment),
}));

export const commentRelations = d.relations(comment, ({ one }) => ({
  discussion: one(discussion, {
    fields: [comment.discussionId],
    references: [discussion.id],
  }),
  author: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));
```

---

## 5. RPC Definitions

All RPC contracts use `@effect/rpc` with `RpcGroup.make()`.

### 5.1 Document RPCs

**File:** `packages/documents/domain/src/entities/Document/Document.rpc.ts`

```typescript
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Errors from "./Document.errors";
import { Model } from "./Document.model";

export const SearchResult = S.Struct({
  ...Model.select.pick("id", "_rowId", "title", "content").fields,
  rank: S.Number,
});

export class Rpcs extends RpcGroup.make(
  // Get single document
  Rpc.make("get", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  // Stream documents by user
  Rpc.make("listByUser", {
    payload: {
      userId: SharedEntityIds.UserId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  // Stream documents with filtering
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      parentDocumentId: S.optional(DocumentsEntityIds.DocumentId),
      search: S.optional(S.String),
      cursor: S.optional(DocumentsEntityIds.DocumentId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  // Stream archived documents
  Rpc.make("Document.listTrash", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      search: S.optional(S.String),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  // Stream child documents
  Rpc.make("listChildren", {
    payload: { parentDocumentId: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  // Full-text search
  Rpc.make("search", {
    payload: {
      query: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      userId: S.optional(SharedEntityIds.UserId),
      includeArchived: S.optional(S.Boolean),
      limit: S.optional(S.Int.pipe(S.positive())),
      offset: S.optional(S.Int.pipe(S.nonNegative())),
    },
    success: SearchResult,
    error: S.Never,
    stream: true,
  }),

  // Create document
  Rpc.make("create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      templateId: S.optional(S.String),
      parentDocumentId: S.optional(DocumentsEntityIds.DocumentId),
      title: S.optional(S.String.pipe(S.maxLength(500))),
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Update document
  Rpc.make("update", {
    payload: Model.update,
    success: Model.json,
    error: Errors.Errors,
  }),

  // Archive document
  Rpc.make("archive", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Restore document
  Rpc.make("restore", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Publish document
  Rpc.make("publish", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Unpublish document
  Rpc.make("unpublish", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Lock document
  Rpc.make("lock", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Unlock document
  Rpc.make("unlock", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  // Delete document permanently
  Rpc.make("delete", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: S.Void,
    error: Errors.DocumentNotFoundError,
  })
) {}
```

### 5.2 Discussion RPCs

**File:** `packages/documents/domain/src/entities/Discussion/Discussion.rpc.ts`

```typescript
export class Rpcs extends RpcGroup.make(
  // Create discussion with initial comment
  Rpc.make("Discussion.createWithComment", {
    payload: {
      documentId: DocumentsEntityIds.DocumentId,
      documentContent: S.String,
      documentContentRich: S.optional(S.Unknown),
      commentContent: S.String,
      commentContentRich: S.optional(S.Unknown),
    },
    success: S.Struct({
      discussion: Discussion.Model.json,
      comment: Comment.Model.json,
    }),
    error: Errors.Errors,
  }),

  // List discussions for document
  Rpc.make("Discussion.list", {
    payload: { documentId: DocumentsEntityIds.DocumentId },
    success: Discussion.Model.json,
    error: S.Never,
    stream: true,
  }),

  // Resolve discussion
  Rpc.make("Discussion.resolve", {
    payload: { id: DocumentsEntityIds.DiscussionId },
    success: Discussion.Model.json,
    error: Errors.DiscussionNotFoundError,
  }),

  // Delete discussion
  Rpc.make("Discussion.delete", {
    payload: { id: DocumentsEntityIds.DiscussionId },
    success: S.Void,
    error: Errors.DiscussionNotFoundError,
  })
) {}
```

### 5.3 Comment RPCs

**File:** `packages/documents/domain/src/entities/Comment/Comment.rpc.ts`

```typescript
export class Rpcs extends RpcGroup.make(
  // Create comment
  Rpc.make("Comment.create", {
    payload: {
      discussionId: DocumentsEntityIds.DiscussionId,
      content: S.String,
      contentRich: S.optional(S.Unknown),
    },
    success: Comment.Model.json,
    error: Errors.Errors,
  }),

  // Update comment
  Rpc.make("Comment.update", {
    payload: {
      id: DocumentsEntityIds.CommentId,
      content: S.String,
      contentRich: S.optional(S.Unknown),
    },
    success: Comment.Model.json,
    error: Errors.CommentNotFoundError,
  }),

  // Delete comment
  Rpc.make("Comment.delete", {
    payload: { id: DocumentsEntityIds.CommentId },
    success: S.Void,
    error: Errors.CommentNotFoundError,
  }),

  // List comments for discussion
  Rpc.make("Comment.list", {
    payload: { discussionId: DocumentsEntityIds.DiscussionId },
    success: Comment.Model.json,
    error: S.Never,
    stream: true,
  })
) {}
```

### 5.4 DocumentVersion RPCs

**File:** `packages/documents/domain/src/entities/DocumentVersion/DocumentVersion.rpc.ts`

```typescript
export class Rpcs extends RpcGroup.make(
  // Create version snapshot
  Rpc.make("Version.create", {
    payload: { documentId: DocumentsEntityIds.DocumentId },
    success: DocumentVersion.Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  // List versions for document
  Rpc.make("Version.list", {
    payload: { documentId: DocumentsEntityIds.DocumentId },
    success: DocumentVersion.Model.json,
    error: S.Never,
    stream: true,
  }),

  // Get specific version
  Rpc.make("Version.get", {
    payload: { id: DocumentsEntityIds.DocumentVersionId },
    success: DocumentVersion.Model.json,
    error: Errors.VersionNotFoundError,
  }),

  // Restore version (copies version content to document)
  Rpc.make("Version.restore", {
    payload: { id: DocumentsEntityIds.DocumentVersionId },
    success: Document.Model.json,
    error: Errors.Errors,
  }),

  // Delete version
  Rpc.make("Version.delete", {
    payload: { id: DocumentsEntityIds.DocumentVersionId },
    success: S.Void,
    error: Errors.VersionNotFoundError,
  })
) {}
```

---

## 6. RPC Handlers (Infra Layer)

Handlers implement the RPC contracts by composing repositories.

### 6.1 Document Handlers

**File:** `packages/documents/infra/src/handlers/Document.handlers.ts`

```typescript
import { Document } from "@beep/documents-domain/entities";
import { DocumentRepo } from "@beep/documents-infra/adapters/repos";
import { DocumentsDb } from "@beep/documents-infra/db";
import * as RpcHandler from "@effect/rpc/RpcHandler";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const DocumentHandlers = RpcHandler.make(Document.Rpcs, {
  get: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.findById(payload.id);
  }),

  listByUser: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return repo.streamByUser(payload.userId, payload.organizationId);
  }),

  list: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return repo.stream({
      organizationId: payload.organizationId,
      parentDocumentId: payload.parentDocumentId,
      search: payload.search,
      cursor: payload.cursor,
      limit: payload.limit ?? 50,
    });
  }),

  "Document.listTrash": Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return repo.streamArchived(payload.organizationId, payload.search);
  }),

  listChildren: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return repo.streamChildren(payload.parentDocumentId);
  }),

  search: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return repo.search({
      query: payload.query,
      organizationId: payload.organizationId,
      userId: payload.userId,
      includeArchived: payload.includeArchived ?? false,
      limit: payload.limit ?? 20,
      offset: payload.offset ?? 0,
    });
  }),

  create: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    const { currentUser } = yield* AuthContext;

    return yield* repo.insert({
      ...payload,
      userId: currentUser.id,
    });
  }),

  update: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update(payload);
  }),

  archive: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      isArchived: true,
    });
  }),

  restore: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      isArchived: false,
    });
  }),

  publish: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      isPublished: true,
    });
  }),

  unpublish: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      isPublished: false,
    });
  }),

  lock: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      lockPage: true,
    });
  }),

  unlock: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    return yield* repo.update({
      id: payload.id,
      lockPage: false,
    });
  }),

  delete: Effect.fn(function* (payload) {
    const repo = yield* DocumentRepo;
    yield* repo.hardDelete(payload.id);
  }),
});
```

---

## 7. Real-Time Collaboration

### 7.1 Yjs + Hocuspocus Architecture

apps/notes uses Yjs for CRDT-based collaborative editing with Hocuspocus as the WebSocket server.

```
┌─────────────────────────────────────────┐
│  Plate Editor (Client)                   │
│  ├─ YJS Document (Y.Doc)                 │
│  └─ Hocuspocus Provider (WebSocket)      │
└────────────────┬────────────────────────┘
                 │ WebSocket
                 ▼
┌─────────────────────────────────────────┐
│  Hocuspocus Server                       │
│  ├─ Y.Doc sync (CRDT merging)            │
│  ├─ Redis extension (distributed state)  │
│  └─ Database extension (persistence)     │
└────────────────┬────────────────────────┘
                 │ onStoreDocument callback
                 ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (via @effect/sql)            │
│  └─ document.yjs_snapshot (binary)       │
└─────────────────────────────────────────┘
```

### 7.2 Yjs Service (Effect-Wrapped)

**File:** `packages/documents/infra/src/services/YjsService.ts`

```typescript
import { Effect, Context, Layer } from "effect";
import * as Y from "yjs";

export class YjsService extends Context.Tag("YjsService")<
  YjsService,
  {
    // Create new Y.Doc from Plate content
    readonly createFromPlate: (
      content: unknown
    ) => Effect.Effect<Uint8Array, YjsError>;

    // Load existing Y.Doc from binary snapshot
    readonly loadSnapshot: (
      snapshot: Uint8Array
    ) => Effect.Effect<Y.Doc, YjsError>;

    // Extract plain text for search indexing
    readonly extractText: (
      doc: Y.Doc
    ) => Effect.Effect<string>;

    // Convert Y.Doc to Plate JSON
    readonly toPlateContent: (
      doc: Y.Doc
    ) => Effect.Effect<unknown>;
  }
>() {}

export const YjsServiceLive = Layer.succeed(
  YjsService,
  YjsService.of({
    createFromPlate: (content) =>
      Effect.try({
        try: () => {
          const doc = new Y.Doc();
          // Convert Plate JSON to Yjs structure
          const sharedType = doc.getXmlFragment("content");
          // Use yjs-slate to convert
          slateNodesToInsertDelta(content).forEach((delta) => {
            sharedType.insert(0, delta);
          });
          return Y.encodeStateAsUpdate(doc);
        },
        catch: (e) => new YjsError({ cause: e }),
      }),

    loadSnapshot: (snapshot) =>
      Effect.try({
        try: () => {
          const doc = new Y.Doc();
          Y.applyUpdate(doc, snapshot);
          return doc;
        },
        catch: (e) => new YjsError({ cause: e }),
      }),

    extractText: (doc) =>
      Effect.sync(() => {
        const sharedType = doc.getXmlFragment("content");
        return yTextToSlateElement(sharedType)
          .map((node) => Node.string(node))
          .join(" ");
      }),

    toPlateContent: (doc) =>
      Effect.sync(() => {
        const sharedType = doc.getXmlFragment("content");
        return yTextToSlateElement(sharedType);
      }),
  })
);
```

### 7.3 Hocuspocus Server Integration

The Yjs WebSocket server runs as a separate process (like apps/notes `src/server/yjs/server.ts`):

**File:** `apps/server/src/yjs/server.ts`

```typescript
import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Redis } from "@hocuspocus/extension-redis";
import { Effect, Layer, Runtime } from "effect";
import { DocumentRepo } from "@beep/documents-infra/adapters/repos";
import { YjsService } from "@beep/documents-infra/services";

const server = new Hocuspocus({
  port: Number(process.env.YJS_PORT ?? 4444),

  extensions: [
    // Redis for distributed state across server instances
    new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
    }),

    // PostgreSQL persistence
    new Database({
      fetch: async ({ documentName }) => {
        const documentId = documentName as DocumentId;

        const program = Effect.gen(function* () {
          const repo = yield* DocumentRepo;
          const doc = yield* repo.findById(documentId);

          if (doc.yjsSnapshot) {
            return Buffer.from(doc.yjsSnapshot, "base64");
          }

          // Fallback to contentRich if no Yjs snapshot
          if (doc.contentRich) {
            const yjsService = yield* YjsService;
            return yield* yjsService.createFromPlate(doc.contentRich);
          }

          return null;
        });

        return await Runtime.runPromise(runtime)(program);
      },

      store: async ({ documentName, state }) => {
        const documentId = documentName as DocumentId;

        const program = Effect.gen(function* () {
          const repo = yield* DocumentRepo;
          const yjsService = yield* YjsService;

          // Extract plain text for search
          const doc = yield* yjsService.loadSnapshot(state);
          const plainText = yield* yjsService.extractText(doc);
          const plateContent = yield* yjsService.toPlateContent(doc);

          yield* repo.update({
            id: documentId,
            yjsSnapshot: Buffer.from(state).toString("base64"),
            content: plainText,
            contentRich: plateContent,
          });
        });

        await Runtime.runPromise(runtime)(program);
      },
    }),
  ],

  // Authentication
  onAuthenticate: async ({ token, documentName }) => {
    // Validate JWT and check document access
    const program = Effect.gen(function* () {
      const auth = yield* AuthService;
      const user = yield* auth.validateToken(token);

      const repo = yield* DocumentRepo;
      const doc = yield* repo.findById(documentName as DocumentId);

      // Check ownership or published status
      const canAccess = doc.userId === user.id || doc.isPublished;
      if (!canAccess) {
        return yield* Effect.fail(new UnauthorizedError());
      }

      return { user, document: doc };
    });

    const result = await Runtime.runPromise(runtime)(program);
    return result;
  },
});

server.listen();
```

---

## 8. AI Integration

### 8.1 AI Service

**File:** `packages/documents/infra/src/services/AIService.ts`

```typescript
import { Effect, Context, Layer, Stream } from "effect";
import { OpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";

export class AIService extends Context.Tag("AIService")<
  AIService,
  {
    // Generate content from prompt
    readonly generate: (params: {
      prompt: string;
      context?: string;
    }) => Stream.Stream<string, AIError>;

    // Edit existing content
    readonly edit: (params: {
      content: string;
      instruction: string;
    }) => Stream.Stream<string, AIError>;

    // Generate comment/suggestion
    readonly comment: (params: {
      content: string;
      instruction?: string;
    }) => Effect.Effect<string, AIError>;

    // Copilot suggestions
    readonly copilot: (params: {
      content: string;
      cursorPosition: number;
    }) => Stream.Stream<string, AIError>;
  }
>() {}

export const AIServiceLive = Layer.effect(
  AIService,
  Effect.gen(function* () {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    return AIService.of({
      generate: ({ prompt, context }) =>
        Stream.async<string, AIError>((emit) => {
          const run = async () => {
            const { textStream } = await streamText({
              model: openai("gpt-4o"),
              system: context
                ? `Context: ${context}\n\nGenerate content based on the user's request.`
                : "Generate content based on the user's request.",
              prompt,
            });

            for await (const chunk of textStream) {
              emit.single(chunk);
            }
            emit.end();
          };

          run().catch((e) => emit.fail(new AIError({ cause: e })));
        }),

      edit: ({ content, instruction }) =>
        Stream.async<string, AIError>((emit) => {
          const run = async () => {
            const { textStream } = await streamText({
              model: openai("gpt-4o"),
              system: "Edit the provided content according to the instruction. Return only the edited content.",
              prompt: `Content:\n${content}\n\nInstruction: ${instruction}`,
            });

            for await (const chunk of textStream) {
              emit.single(chunk);
            }
            emit.end();
          };

          run().catch((e) => emit.fail(new AIError({ cause: e })));
        }),

      comment: ({ content, instruction }) =>
        Effect.tryPromise({
          try: async () => {
            const { text } = await generateText({
              model: openai("gpt-4o"),
              system: instruction ?? "Provide helpful feedback on the content.",
              prompt: content,
            });
            return text;
          },
          catch: (e) => new AIError({ cause: e }),
        }),

      copilot: ({ content, cursorPosition }) =>
        Stream.async<string, AIError>((emit) => {
          const run = async () => {
            const beforeCursor = content.slice(0, cursorPosition);
            const afterCursor = content.slice(cursorPosition);

            const { textStream } = await streamText({
              model: openai("gpt-4o"),
              system: "Complete the text naturally. Only return the completion, not the original text.",
              prompt: `${beforeCursor}[CURSOR]${afterCursor}`,
            });

            for await (const chunk of textStream) {
              emit.single(chunk);
            }
            emit.end();
          };

          run().catch((e) => emit.fail(new AIError({ cause: e })));
        }),
    });
  })
);
```

### 8.2 AI RPCs

**File:** `packages/documents/domain/src/entities/AI/AI.rpc.ts`

```typescript
export class Rpcs extends RpcGroup.make(
  // Generate content
  Rpc.make("AI.generate", {
    payload: {
      prompt: S.String,
      context: S.optional(S.String),
    },
    success: S.String,
    error: AIError,
    stream: true,
  }),

  // Edit content
  Rpc.make("AI.edit", {
    payload: {
      content: S.String,
      instruction: S.String,
    },
    success: S.String,
    error: AIError,
    stream: true,
  }),

  // Comment on content
  Rpc.make("AI.comment", {
    payload: {
      content: S.String,
      instruction: S.optional(S.String),
    },
    success: S.String,
    error: AIError,
  }),

  // Copilot suggestion
  Rpc.make("AI.copilot", {
    payload: {
      content: S.String,
      cursorPosition: S.Int,
    },
    success: S.String,
    error: AIError,
    stream: true,
  })
) {}
```

---

## 9. SDK & Client

### 9.1 RPC Client

**File:** `packages/documents/sdk/src/client.ts`

```typescript
import { Document, Discussion, Comment, DocumentVersion, AI } from "@beep/documents-domain/entities";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as HttpRpcClient from "@effect/rpc-http/HttpRpcClient";
import { Effect, Layer } from "effect";

// Merge all RPC groups
export const DocumentsRpcs = RpcGroup.merge(
  Document.Rpcs,
  Discussion.Rpcs,
  Comment.Rpcs,
  DocumentVersion.Rpcs,
  AI.Rpcs
);

// Create client layer
export const DocumentsClientLive = HttpRpcClient.layer(DocumentsRpcs, {
  url: process.env.NEXT_PUBLIC_API_URL + "/rpc/documents",
});

// Type-safe client accessor
export const DocumentsClient = RpcClient.make(DocumentsRpcs);
```

### 9.2 React Hooks

**File:** `packages/documents/sdk/src/hooks/useDocuments.ts`

```typescript
import { DocumentsClient } from "@beep/documents-sdk/client";
import { useRpcQuery, useRpcMutation, useRpcStream } from "@beep/runtime-client";
import { Document } from "@beep/documents-domain/entities";

// List documents with streaming
export const useDocuments = (params: {
  organizationId: string;
  parentDocumentId?: string;
}) => {
  return useRpcStream(
    DocumentsClient.list,
    params,
    { refetchInterval: 30_000 }
  );
};

// Get single document
export const useDocument = (id: string) => {
  return useRpcQuery(
    DocumentsClient.get,
    { id: id as Document.Model.Type["id"] }
  );
};

// Create document mutation
export const useCreateDocument = () => {
  return useRpcMutation(DocumentsClient.create);
};

// Update document mutation
export const useUpdateDocument = () => {
  return useRpcMutation(DocumentsClient.update);
};

// Archive/restore mutations
export const useArchiveDocument = () => useRpcMutation(DocumentsClient.archive);
export const useRestoreDocument = () => useRpcMutation(DocumentsClient.restore);

// Search with streaming results
export const useDocumentSearch = (query: string, organizationId: string) => {
  return useRpcStream(
    DocumentsClient.search,
    { query, organizationId },
    { enabled: query.length > 2 }
  );
};
```

---

## 10. Feature Mapping: apps/notes → Effect

| apps/notes Feature | tRPC/Prisma | Effect Implementation |
|--------------------|-------------|----------------------|
| **Document CRUD** | `document.create`, `document.update` | `Document.Rpcs.create`, `Document.Rpcs.update` |
| **Hierarchical Docs** | `parentDocumentId` FK | Same, with `listChildren` RPC stream |
| **Full-Text Search** | Prisma `search` | PostgreSQL GIN index + `Document.Rpcs.search` |
| **Trash/Archive** | `isArchived` flag | `Document.Rpcs.archive/restore` |
| **Version History** | `DocumentVersion` model | `DocumentVersion.Rpcs.*` |
| **Discussions** | tRPC `comment.*` | `Discussion.Rpcs.*`, `Comment.Rpcs.*` |
| **Publishing** | `isPublished` flag | `Document.Rpcs.publish/unpublish` |
| **Lock Page** | `lockPage` flag | `Document.Rpcs.lock/unlock` |
| **Templates** | `templateId` reference | Same, template redirect in UI |
| **Real-Time** | Yjs + Hocuspocus | Same, Effect-wrapped persistence |
| **File Upload** | UploadThing | `@beep/files` slice integration |
| **AI Features** | Vercel AI SDK | `AI.Rpcs.*` with streaming |

---

## 11. Implementation Status

### Completed
- [x] Domain models (Document, Discussion, Comment, DocumentVersion, DocumentFile)
- [x] Drizzle tables with full-text search index
- [x] Table relations
- [x] Document.Rpcs definitions
- [x] Basic repository structure

### In Progress
- [ ] RPC handlers implementation
- [ ] Yjs service integration
- [ ] SDK client bindings

### TODO
- [ ] AI service implementation
- [ ] React hooks for SDK
- [ ] Plate editor components
- [ ] Discussion/Comment UI
- [ ] Version history UI

---

## 12. Migration from apps/notes

To migrate apps/notes to use the Effect-based documents slice:

1. **Database Migration**
   - Run Drizzle migrations to create Effect-compatible tables
   - Migrate existing Prisma data to new schema

2. **API Migration**
   - Replace tRPC routers with @effect/rpc handlers
   - Update Hocuspocus to use Effect-wrapped persistence

3. **Frontend Migration**
   - Replace tRPC hooks with documents-sdk hooks
   - Keep Plate editor components (no change needed)

4. **Authentication**
   - Replace Lucia auth with IAM slice integration
   - Update Yjs auth to use better-auth tokens

---

## Appendix: Reference Files

**apps/notes Implementation:**
- `apps/notes/prisma/schema.prisma` - Prisma schema
- `apps/notes/src/server/api/routers/document.ts` - Document tRPC router
- `apps/notes/src/server/api/routers/comment.ts` - Comment/Discussion tRPC router
- `apps/notes/src/server/api/routers/version.ts` - Version tRPC router
- `apps/notes/src/server/yjs/server.ts` - Hocuspocus server
- `apps/notes/src/server/hono/routes/ai.ts` - AI endpoints

**Effect Implementation:**
- `packages/documents/domain/src/entities/Document/Document.model.ts`
- `packages/documents/domain/src/entities/Document/Document.rpc.ts`
- `packages/documents/tables/src/tables/document.table.ts`
- `packages/documents/tables/src/relations.ts`
- `packages/documents/infra/src/adapters/repos/Document.repo.ts`

---

**Document Status:** Draft v2.0
**Updated:** 2025-11-28
**Reason for Update:** Refactored to align with apps/notes feature set using @effect/rpc patterns
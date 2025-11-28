# RPC Implementation Plan for Knowledge Management Domain

## Overview

This document provides step-by-step implementation instructions for creating `@effect/rpc` contracts for the Knowledge Management domain entities. Follow these steps in order to implement, review, and validate each entity's RPC system.

**Reference Implementation:** This plan mirrors the Potion tRPC routers in `tmp/potion/src/server/api/routers/`. Compare implementations against Potion for functional parity.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `@effect/rpc` is installed in `packages/knowledge-management/domain/package.json`
- [ ] Existing Model classes have proper variants (check `@effect/sql/Model.Class` inheritance)
- [ ] EntityIds are properly exported from `@beep/shared-domain`
- [ ] `AuthContext` is available from `@beep/shared-domain/Policy`

**Note:** See `RPC_VALIDATION.md` for full validation report and issues found.

---

## Required Dependencies

Add to `packages/knowledge-management/domain/package.json`:
```json
{
  "dependencies": {
    "@effect/rpc": "catalog:"
  }
}
```

---

## Phase 1: Comment Entity

**Potion Reference:** `tmp/potion/src/server/api/routers/comment.ts` (commentMutations section)

### Step 1.1: Create Comment.errors.ts

**File:** `packages/knowledge-management/domain/src/entities/Comment/Comment.errors.ts`

```typescript
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

/**
 * Error when a comment with the specified ID cannot be found.
 */
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>(
  "@beep/knowledge-management-domain/entities/Comment/CommentNotFoundError"
)(
  "CommentNotFoundError",
  {
    id: KnowledgeManagementEntityIds.CommentId,
  },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Error when user lacks permission to perform action on comment.
 */
export class CommentPermissionDeniedError extends S.TaggedError<CommentPermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/Comment/CommentPermissionDeniedError"
)(
  "CommentPermissionDeniedError",
  {
    id: KnowledgeManagementEntityIds.CommentId,
  },
  HttpApiSchema.annotations({ status: 403 })
) {}

/**
 * Error when comment content exceeds maximum length.
 * Potion limit: 50,000 characters (50KB for rich content)
 */
export class CommentTooLongError extends S.TaggedError<CommentTooLongError>(
  "@beep/knowledge-management-domain/entities/Comment/CommentTooLongError"
)(
  "CommentTooLongError",
  {
    length: S.Int,
    maxLength: S.Int,
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Union of all Comment errors for RPC definitions.
 */
export const Errors = S.Union(
  CommentNotFoundError,
  CommentPermissionDeniedError,
  CommentTooLongError
);

export type Errors = typeof Errors.Type;
```

### Step 1.2: Create Comment.rpc.ts

**File:** `packages/knowledge-management/domain/src/entities/Comment/Comment.rpc.ts`

```typescript
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";
import * as Errors from "./Comment.errors.ts";
import { Model } from "./Comment.model.ts";

/**
 * RPC contract for Comment entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 */
export class Rpcs extends RpcGroup.make(
  Rpc.make("Comment.get", {
    payload: {
      id: KnowledgeManagementEntityIds.CommentId,
    },
    success: Model.json,
    error: Errors.CommentNotFoundError,
  }).annotations({
    identifier: "Comment.get",
    title: "Get Comment",
    description: "Retrieve a single comment by its unique identifier.",
    examples: [{ id: "comment__01JTEST1234567890ABCDEF" }],
  }),

  Rpc.make("Comment.listByDiscussion", {
    payload: {
      discussionId: KnowledgeManagementEntityIds.DiscussionId,
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Comment.listByDiscussion",
    title: "List Comments by Discussion",
    description: "Stream all comments belonging to a specific discussion, ordered by creation time.",
  }),

  Rpc.make("Comment.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      discussionId: KnowledgeManagementEntityIds.DiscussionId,
      content: S.String,
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Comment.create",
    title: "Create Comment",
    description: "Create a new comment within a discussion. The comment will be attributed to the authenticated user.",
  }),

  Rpc.make("Comment.update", {
    payload: {
      id: KnowledgeManagementEntityIds.CommentId,
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Comment.update",
    title: "Update Comment",
    description: "Update an existing comment's content. Only the comment author can perform this operation. The comment will be marked as edited.",
  }),

  Rpc.make("Comment.delete", {
    payload: {
      id: KnowledgeManagementEntityIds.CommentId,
    },
    success: S.Void,
    error: Errors.CommentNotFoundError,
  }).annotations({
    identifier: "Comment.delete",
    title: "Delete Comment",
    description: "Permanently delete a comment. Only the comment author can perform this operation.",
  })
) {}
```

### Step 1.3: Update Comment/index.ts

**File:** `packages/knowledge-management/domain/src/entities/Comment/index.ts`

```typescript
export * from "./Comment.model.ts";
export * as CommentErrors from "./Comment.errors.ts";
export * as CommentRpcs from "./Comment.rpc.ts";
```

### Step 1.4: Implement Comment Repository Extensions

**File:** `packages/knowledge-management/infra/src/adapters/repos/Comment.repo.ts`

Add the following methods to the existing `CommentRepo`:

```typescript
// Add to existing repo
const listByDiscussion = makeQuery(
  (execute, params: { discussionId: DiscussionId.Type }) =>
    execute((client) =>
      client.query.comment.findMany({
        where: (table, { eq, isNull, and }) =>
          and(
            eq(table.discussionId, params.discussionId),
            isNull(table.deletedAt)
          ),
        orderBy: (table, { asc }) => asc(table.createdAt),
      })
    ).pipe(Effect.flatMap(S.decodeUnknown(S.Array(Entities.Comment.Model))))
);
```

### Step 1.5: Create Comment Router (RPC Handler)

**File:** `packages/knowledge-management/infra/src/routes/Comment.router.ts`

```typescript
import { CommentRepo } from "@beep/knowledge-management-infra/adapters";
import { Entities } from "@beep/knowledge-management-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const CommentRpcLive = Entities.Comment.CommentRpcs.Rpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* CommentRepo;

    return {
      get: ({ id }) =>
        repo.findById({ id }),

      listByDiscussion: ({ discussionId }) =>
        Stream.fromIterableEffect(repo.listByDiscussion({ discussionId })),

      create: (payload) =>
        Effect.gen(function* () {
          const { user } = yield* AuthContext;
          return yield* repo.insert({
            ...payload,
            userId: user.id,
          });
        }),

      update: ({ id, ...data }) =>
        Effect.gen(function* () {
          const { user } = yield* AuthContext;
          const comment = yield* repo.findById({ id });

          if (comment.userId !== user.id) {
            return yield* new Entities.Comment.CommentErrors.CommentPermissionDeniedError({ id });
          }

          return yield* repo.update({
            id,
            ...data,
            isEdited: true,
          });
        }),

      delete: ({ id }) =>
        Effect.gen(function* () {
          const { user } = yield* AuthContext;
          const comment = yield* repo.findById({ id });

          if (comment.userId !== user.id) {
            return yield* new Entities.Comment.CommentErrors.CommentPermissionDeniedError({ id });
          }

          return yield* repo.delete({ id });
        }),
    };
  })
);
```

### Step 1.6: Phase 1 Verification (REQUIRED)

**Run these commands before proceeding to Phase 2:**

```bash
# Build the domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain

# Run tests if available
bun run test --filter=@beep/knowledge-management-domain
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] All exports are accessible

**Do NOT proceed to Phase 2 until all checks pass.**

---

## Phase 2: Discussion Entity

### Step 2.1: Create Discussion.errors.ts

**File:** `packages/knowledge-management/domain/src/entities/Discussion/Discussion.errors.ts`

```typescript
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class DiscussionNotFoundError extends S.TaggedError<DiscussionNotFoundError>(
  "@beep/knowledge-management-domain/entities/Discussion/DiscussionNotFoundError"
)(
  "DiscussionNotFoundError",
  { id: KnowledgeManagementEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DiscussionPermissionDeniedError extends S.TaggedError<DiscussionPermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/Discussion/DiscussionPermissionDeniedError"
)(
  "DiscussionPermissionDeniedError",
  { id: KnowledgeManagementEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 403 })
) {}

export class DiscussionAlreadyResolvedError extends S.TaggedError<DiscussionAlreadyResolvedError>(
  "@beep/knowledge-management-domain/entities/Discussion/DiscussionAlreadyResolvedError"
)(
  "DiscussionAlreadyResolvedError",
  { id: KnowledgeManagementEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class DiscussionNotResolvedError extends S.TaggedError<DiscussionNotResolvedError>(
  "@beep/knowledge-management-domain/entities/Discussion/DiscussionNotResolvedError"
)(
  "DiscussionNotResolvedError",
  { id: KnowledgeManagementEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 400 })
) {}

export const Errors = S.Union(
  DiscussionNotFoundError,
  DiscussionPermissionDeniedError,
  DiscussionAlreadyResolvedError,
  DiscussionNotResolvedError
);

export type Errors = typeof Errors.Type;
```

### Step 2.2: Create Discussion.rpc.ts

**File:** `packages/knowledge-management/domain/src/entities/Discussion/Discussion.rpc.ts`

**Potion Reference:** `createDiscussion`, `createDiscussionWithComment`, `resolveDiscussion`, `removeDiscussion`, `discussions`

```typescript
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";
import * as Errors from "./Discussion.errors.ts";
import { Model } from "./Discussion.model.ts";

// Validation constants (from Potion)
const MAX_DOCUMENT_CONTENT_LENGTH = 1000;

// Schema for discussion with nested comments (matches Potion discussions query response)
const DiscussionWithComments = S.Struct({
  ...Model.json.fields,
  user: S.Struct({
    id: SharedEntityIds.UserId,
    name: S.NullOr(S.String),
    profileImageUrl: S.NullOr(S.String),
  }),
  comments: S.Array(S.Struct({
    id: KnowledgeManagementEntityIds.CommentId,
    contentRich: S.NullOr(S.Unknown),
    createdAt: S.DateTimeUtc,
    discussionId: KnowledgeManagementEntityIds.DiscussionId,
    isEdited: S.Boolean,
    updatedAt: S.DateTimeUtc,
    user: S.Struct({
      id: SharedEntityIds.UserId,
      name: S.NullOr(S.String),
      profileImageUrl: S.NullOr(S.String),
    }),
  })),
});

export class Rpcs extends RpcGroup.make(
  Rpc.make("Discussion.get", {
    payload: { id: KnowledgeManagementEntityIds.DiscussionId },
    success: DiscussionWithComments,
    error: Errors.DiscussionNotFoundError,
  }).annotations({
    identifier: "Discussion.get",
    title: "Get Discussion",
    description: "Retrieve a discussion with all its comments and user information.",
  }),

  Rpc.make("Discussion.listByDocument", {
    payload: { documentId: KnowledgeManagementEntityIds.DocumentId },
    success: DiscussionWithComments,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Discussion.listByDocument",
    title: "List Discussions by Document",
    description: "Stream all discussions for a document, including nested comments and user information. Matches Potion `discussions` query.",
  }),

  Rpc.make("Discussion.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: KnowledgeManagementEntityIds.DocumentId,
      documentContent: S.String.pipe(
        S.minLength(1),
        S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)
      ),
    },
    success: S.Struct({ id: KnowledgeManagementEntityIds.DiscussionId }),
    error: Errors.Errors,
  }).annotations({
    identifier: "Discussion.create",
    title: "Create Discussion",
    description: "Create a new discussion on a document without an initial comment. The documentContent is the highlighted text from the document.",
  }),

  Rpc.make("Discussion.createWithComment", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: KnowledgeManagementEntityIds.DocumentId,
      documentContent: S.String.pipe(
        S.minLength(1),
        S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)
      ),
      contentRich: S.optional(S.Array(S.Unknown)),
      discussionId: S.optional(KnowledgeManagementEntityIds.DiscussionId),
    },
    success: S.Struct({ id: KnowledgeManagementEntityIds.DiscussionId }),
    error: Errors.Errors,
  }).annotations({
    identifier: "Discussion.createWithComment",
    title: "Create Discussion with Comment",
    description: "Atomically create a discussion with an initial comment. Use this for the common case where a user highlights text and adds a comment in one action.",
  }),

  Rpc.make("Discussion.resolve", {
    payload: { id: KnowledgeManagementEntityIds.DiscussionId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Discussion.resolve",
    title: "Resolve Discussion",
    description: "Mark a discussion as resolved. Resolved discussions are typically hidden from the main view but remain accessible.",
  }),

  Rpc.make("Discussion.delete", {
    payload: { id: KnowledgeManagementEntityIds.DiscussionId },
    success: S.Void,
    error: Errors.DiscussionNotFoundError,
  }).annotations({
    identifier: "Discussion.delete",
    title: "Delete Discussion",
    description: "Permanently delete a discussion and all its comments. This is a hard delete operation.",
  })
) {}

export { DiscussionWithComments };
```

### Step 2.3: Update Discussion/index.ts

```typescript
export * from "./Discussion.model.ts";
export * as DiscussionErrors from "./Discussion.errors.ts";
export * as DiscussionRpcs from "./Discussion.rpc.ts";
```

### Step 2.4: Phase 2 Verification (REQUIRED)

**Run these commands before proceeding to Phase 3:**

```bash
# Build the domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] Discussion RPC exports are accessible

**Do NOT proceed to Phase 3 until all checks pass.**

---

## Phase 3: Document Entity

### Step 3.1: Create Document.errors.ts

**File:** `packages/knowledge-management/domain/src/entities/Document/Document.errors.ts`

```typescript
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class DocumentNotFoundError extends S.TaggedError<DocumentNotFoundError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentNotFoundError"
)(
  "DocumentNotFoundError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DocumentPermissionDeniedError extends S.TaggedError<DocumentPermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentPermissionDeniedError"
)(
  "DocumentPermissionDeniedError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 403 })
) {}

export class DocumentArchivedError extends S.TaggedError<DocumentArchivedError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentArchivedError"
)(
  "DocumentArchivedError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class DocumentLockedError extends S.TaggedError<DocumentLockedError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentLockedError"
)(
  "DocumentLockedError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 423 })
) {}

export class DocumentAlreadyPublishedError extends S.TaggedError<DocumentAlreadyPublishedError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentAlreadyPublishedError"
)(
  "DocumentAlreadyPublishedError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class DocumentNotPublishedError extends S.TaggedError<DocumentNotPublishedError>(
  "@beep/knowledge-management-domain/entities/Document/DocumentNotPublishedError"
)(
  "DocumentNotPublishedError",
  { id: KnowledgeManagementEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

export const Errors = S.Union(
  DocumentNotFoundError,
  DocumentPermissionDeniedError,
  DocumentArchivedError,
  DocumentLockedError,
  DocumentAlreadyPublishedError,
  DocumentNotPublishedError
);

export type Errors = typeof Errors.Type;
```

### Step 3.2: Create Document.rpc.ts

**File:** `packages/knowledge-management/domain/src/entities/Document/Document.rpc.ts`

```typescript
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";
import * as Errors from "./Document.errors.ts";
import { Model } from "./Document.model.ts";
import { TextStyle } from "../../value-objects/TextStyle.ts";

// Search result schema
const SearchResult = S.Struct({
  id: KnowledgeManagementEntityIds.DocumentId,
  title: S.NullOr(S.String),
  content: S.NullOr(S.String),
  rank: S.Number,
});

export class Rpcs extends RpcGroup.make(
  Rpc.make("Document.get", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }).annotations({
    identifier: "Document.get",
    title: "Get Document",
    description: "Retrieve a document by its unique identifier, including all content and settings.",
  }),

  Rpc.make("Document.listByUser", {
    payload: {
      userId: SharedEntityIds.UserId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Document.listByUser",
    title: "List Documents by User",
    description: "Stream all documents owned by a specific user within an organization.",
  }),

  Rpc.make("Document.list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      parentDocumentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
      search: S.optional(S.String),
      cursor: S.optional(KnowledgeManagementEntityIds.DocumentId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Document.list",
    title: "List Documents",
    description: "Stream documents with cursor-based pagination. Optionally filter by parent document or search query. Matches Potion `documents` query.",
  }),

  Rpc.make("Document.listTrash", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      search: S.optional(S.String),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Document.listTrash",
    title: "List Trashed Documents",
    description: "Stream all archived/trashed documents within an organization. Matches Potion `trash` query.",
  }),

  Rpc.make("Document.listChildren", {
    payload: { parentDocumentId: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "Document.listChildren",
    title: "List Child Documents",
    description: "Stream all direct child documents of a parent document. Used for building document tree views.",
  }),

  Rpc.make("Document.search", {
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
  }).annotations({
    identifier: "Document.search",
    title: "Search Documents",
    description: "Full-text search across document titles and content. Returns ranked results with relevance scores.",
  }),

  Rpc.make("Document.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      templateId: S.optional(S.String),
      parentDocumentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
      title: S.optional(S.String.pipe(S.maxLength(500))),
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.create",
    title: "Create Document",
    description: "Create a new document. Optionally create from a template or as a child of another document.",
  }),

  Rpc.make("Document.update", {
    payload: {
      id: KnowledgeManagementEntityIds.DocumentId,
      // Content fields
      title: S.optional(S.String.pipe(S.maxLength(256))), // Potion limit: 256
      content: S.optional(S.String.pipe(S.maxLength(1_000_000))), // 1MB limit
      contentRich: S.optional(S.Unknown),
      yjsSnapshot: S.optional(S.Uint8ArrayFromBase64),
      // Display settings (from Potion)
      coverImage: S.optional(S.NullOr(S.String.pipe(S.maxLength(500)))),
      icon: S.optional(S.NullOr(S.String.pipe(S.maxLength(100)))),
      fullWidth: S.optional(S.Boolean),
      smallText: S.optional(S.Boolean),
      textStyle: S.optional(TextStyle),
      toc: S.optional(S.Boolean),
      // State flags (from Potion)
      lockPage: S.optional(S.Boolean),
      isPublished: S.optional(S.Boolean),
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.update",
    title: "Update Document",
    description: "Update document content and settings. Supports partial updates - only provided fields are modified. Includes display settings (fullWidth, smallText, textStyle, toc) and state flags (lockPage, isPublished).",
  }),

  Rpc.make("Document.archive", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.archive",
    title: "Archive Document",
    description: "Move a document to trash. The document can be restored later or permanently deleted.",
  }),

  Rpc.make("Document.restore", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.restore",
    title: "Restore Document",
    description: "Restore a previously archived document from trash back to active status.",
  }),

  Rpc.make("Document.publish", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.publish",
    title: "Publish Document",
    description: "Make a document publicly accessible. Published documents can be viewed without authentication.",
  }),

  Rpc.make("Document.unpublish", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.unpublish",
    title: "Unpublish Document",
    description: "Remove public access from a document. The document will only be accessible to authenticated users.",
  }),

  Rpc.make("Document.lock", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.lock",
    title: "Lock Document",
    description: "Lock a document to prevent editing. Locked documents can only be modified by users with appropriate permissions.",
  }),

  Rpc.make("Document.unlock", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "Document.unlock",
    title: "Unlock Document",
    description: "Unlock a previously locked document to allow editing.",
  }),

  Rpc.make("Document.delete", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: S.Void,
    error: Errors.DocumentNotFoundError,
  }).annotations({
    identifier: "Document.delete",
    title: "Delete Document",
    description: "Permanently delete a document. This action cannot be undone. Use archive for recoverable deletion.",
  })
) {}
```

### Step 3.3: Update Document/index.ts

```typescript
export * from "./Document.model.ts";
export * as DocumentErrors from "./Document.errors.ts";
export * as DocumentRpcs from "./Document.rpc.ts";
```

### Step 3.4: Phase 3 Verification (REQUIRED)

**Run these commands before proceeding to Phase 4:**

```bash
# Build the domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] Document RPC exports are accessible
- [ ] TextStyle import resolves correctly

**Do NOT proceed to Phase 4 until all checks pass.**

---

## Phase 4: DocumentFile Entity

### Step 4.1: Create DocumentFile.errors.ts

**File:** `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.errors.ts`

```typescript
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class DocumentFileNotFoundError extends S.TaggedError<DocumentFileNotFoundError>(
  "@beep/knowledge-management-domain/entities/DocumentFile/DocumentFileNotFoundError"
)(
  "DocumentFileNotFoundError",
  { id: KnowledgeManagementEntityIds.DocumentFileId },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DocumentFilePermissionDeniedError extends S.TaggedError<DocumentFilePermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/DocumentFile/DocumentFilePermissionDeniedError"
)(
  "DocumentFilePermissionDeniedError",
  { id: KnowledgeManagementEntityIds.DocumentFileId },
  HttpApiSchema.annotations({ status: 403 })
) {}

export class DocumentFileSizeLimitExceededError extends S.TaggedError<DocumentFileSizeLimitExceededError>(
  "@beep/knowledge-management-domain/entities/DocumentFile/DocumentFileSizeLimitExceededError"
)(
  "DocumentFileSizeLimitExceededError",
  {
    size: S.Int,
    maxSize: S.Int,
  },
  HttpApiSchema.annotations({ status: 413 })
) {}

export class DocumentFileInvalidTypeError extends S.TaggedError<DocumentFileInvalidTypeError>(
  "@beep/knowledge-management-domain/entities/DocumentFile/DocumentFileInvalidTypeError"
)(
  "DocumentFileInvalidTypeError",
  {
    type: S.String,
    allowedTypes: S.Array(S.String),
  },
  HttpApiSchema.annotations({ status: 415 })
) {}

export const Errors = S.Union(
  DocumentFileNotFoundError,
  DocumentFilePermissionDeniedError,
  DocumentFileSizeLimitExceededError,
  DocumentFileInvalidTypeError
);

export type Errors = typeof Errors.Type;
```

### Step 4.2: Create DocumentFile.rpc.ts

**File:** `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.rpc.ts`

```typescript
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";
import * as Errors from "./DocumentFile.errors.ts";
import { Model } from "./DocumentFile.model.ts";

export class Rpcs extends RpcGroup.make(
  Rpc.make("DocumentFile.get", {
    payload: { id: KnowledgeManagementEntityIds.DocumentFileId },
    success: Model.json,
    error: Errors.DocumentFileNotFoundError,
  }).annotations({
    identifier: "DocumentFile.get",
    title: "Get Document File",
    description: "Retrieve metadata for a file attachment by its unique identifier.",
  }),

  Rpc.make("DocumentFile.listByDocument", {
    payload: { documentId: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "DocumentFile.listByDocument",
    title: "List Files by Document",
    description: "Stream all file attachments for a specific document.",
  }),

  Rpc.make("DocumentFile.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
      size: S.Int,
      url: S.String,
      appUrl: S.String,
      type: S.String,
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "DocumentFile.create",
    title: "Create Document File",
    description: "Register a new file attachment. The file should be uploaded to storage separately; this creates the metadata record linking it to a document.",
  }),

  Rpc.make("DocumentFile.delete", {
    payload: { id: KnowledgeManagementEntityIds.DocumentFileId },
    success: S.Void,
    error: Errors.DocumentFileNotFoundError,
  }).annotations({
    identifier: "DocumentFile.delete",
    title: "Delete Document File",
    description: "Remove a file attachment. The underlying file in storage should be cleaned up separately.",
  })
) {}
```

### Step 4.3: Update DocumentFile/index.ts

```typescript
export * from "./DocumentFile.model.ts";
export * as DocumentFileErrors from "./DocumentFile.errors.ts";
export * as DocumentFileRpcs from "./DocumentFile.rpc.ts";
```

### Step 4.4: Phase 4 Verification (REQUIRED)

**Run these commands before proceeding to Phase 5:**

```bash
# Build the domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] DocumentFile RPC exports are accessible

**Do NOT proceed to Phase 5 until all checks pass.**

---

## Phase 5: DocumentVersion Entity

### Step 5.1: Create DocumentVersion.errors.ts

**File:** `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.errors.ts`

```typescript
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class DocumentVersionNotFoundError extends S.TaggedError<DocumentVersionNotFoundError>(
  "@beep/knowledge-management-domain/entities/DocumentVersion/DocumentVersionNotFoundError"
)(
  "DocumentVersionNotFoundError",
  { id: KnowledgeManagementEntityIds.DocumentVersionId },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DocumentVersionPermissionDeniedError extends S.TaggedError<DocumentVersionPermissionDeniedError>(
  "@beep/knowledge-management-domain/entities/DocumentVersion/DocumentVersionPermissionDeniedError"
)(
  "DocumentVersionPermissionDeniedError",
  { id: KnowledgeManagementEntityIds.DocumentVersionId },
  HttpApiSchema.annotations({ status: 403 })
) {}

export class DocumentVersionConflictError extends S.TaggedError<DocumentVersionConflictError>(
  "@beep/knowledge-management-domain/entities/DocumentVersion/DocumentVersionConflictError"
)(
  "DocumentVersionConflictError",
  {
    versionId: KnowledgeManagementEntityIds.DocumentVersionId,
    documentId: KnowledgeManagementEntityIds.DocumentId,
    message: S.String,
  },
  HttpApiSchema.annotations({ status: 409 })
) {}

export const Errors = S.Union(
  DocumentVersionNotFoundError,
  DocumentVersionPermissionDeniedError,
  DocumentVersionConflictError
);

export type Errors = typeof Errors.Type;
```

### Step 5.2: Create DocumentVersion.rpc.ts

**File:** `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.rpc.ts`

```typescript
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";
import * as Errors from "./DocumentVersion.errors.ts";
import { Model } from "./DocumentVersion.model.ts";
import { Model as DocumentModel } from "../Document/Document.model.ts";

// Comparison result schema
const ComparisonResult = S.Struct({
  versionA: Model.json,
  versionB: Model.json,
  diff: S.Unknown, // Rich diff structure
});

export class Rpcs extends RpcGroup.make(
  Rpc.make("DocumentVersion.get", {
    payload: { id: KnowledgeManagementEntityIds.DocumentVersionId },
    success: Model.json,
    error: Errors.DocumentVersionNotFoundError,
  }).annotations({
    identifier: "DocumentVersion.get",
    title: "Get Document Version",
    description: "Retrieve a specific version snapshot of a document by its unique identifier.",
  }),

  Rpc.make("DocumentVersion.listByDocument", {
    payload: {
      documentId: KnowledgeManagementEntityIds.DocumentId,
      limit: S.optional(S.Int.pipe(S.positive())),
      offset: S.optional(S.Int.pipe(S.nonNegative())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }).annotations({
    identifier: "DocumentVersion.listByDocument",
    title: "List Document Versions",
    description: "Stream all version snapshots for a document, ordered by creation time (newest first).",
  }),

  Rpc.make("DocumentVersion.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: KnowledgeManagementEntityIds.DocumentId,
      title: S.optional(S.String.pipe(S.maxLength(500))),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "DocumentVersion.create",
    title: "Create Document Version",
    description: "Create a new version snapshot of the current document state. Use this to save checkpoints that users can restore to later.",
  }),

  Rpc.make("DocumentVersion.restore", {
    payload: { id: KnowledgeManagementEntityIds.DocumentVersionId },
    success: DocumentModel.json,
    error: Errors.Errors,
  }).annotations({
    identifier: "DocumentVersion.restore",
    title: "Restore Document Version",
    description: "Restore a document to a previous version snapshot. This replaces the current document content with the version's content.",
  }),

  Rpc.make("DocumentVersion.compare", {
    payload: {
      versionA: KnowledgeManagementEntityIds.DocumentVersionId,
      versionB: KnowledgeManagementEntityIds.DocumentVersionId,
    },
    success: ComparisonResult,
    error: Errors.Errors,
  }).annotations({
    identifier: "DocumentVersion.compare",
    title: "Compare Document Versions",
    description: "Compare two version snapshots and return their differences. Useful for showing what changed between versions.",
  }),

  Rpc.make("DocumentVersion.delete", {
    payload: { id: KnowledgeManagementEntityIds.DocumentVersionId },
    success: S.Void,
    error: Errors.DocumentVersionNotFoundError,
  }).annotations({
    identifier: "DocumentVersion.delete",
    title: "Delete Document Version",
    description: "Permanently delete a version snapshot. This action cannot be undone.",
  })
) {}
```

### Step 5.3: Update DocumentVersion/index.ts

```typescript
export * from "./DocumentVersion.model.ts";
export * as DocumentVersionErrors from "./DocumentVersion.errors.ts";
export * as DocumentVersionRpcs from "./DocumentVersion.rpc.ts";
```

### Step 5.4: Phase 5 Verification (REQUIRED)

**Run these commands before proceeding to Phase 6:**

```bash
# Build the domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] DocumentVersion RPC exports are accessible
- [ ] Document Model import for restore response works

**Do NOT proceed to Phase 6 until all checks pass.**

---

## Phase 6: Integration & Aggregation

### Step 6.1: Update entities/index.ts

**File:** `packages/knowledge-management/domain/src/entities/index.ts`

```typescript
export * as Comment from "./Comment/index.ts";
export * as Discussion from "./Discussion/index.ts";
export * as Document from "./Document/index.ts";
export * as DocumentFile from "./DocumentFile/index.ts";
export * as DocumentVersion from "./DocumentVersion/index.ts";
export * as KnowledgeBlock from "./KnowledgeBlock/index.ts";
export * as KnowledgePage from "./KnowledgePage/index.ts";
export * as KnowledgeSpace from "./KnowledgeSpace/index.ts";
export * as PageLink from "./PageLink/index.ts";
```

### Step 6.2: Create RpcMiddleware for Authentication

**File:** `packages/knowledge-management/domain/src/middleware/RpcAuthMiddleware.ts`

```typescript
import { AuthContext } from "@beep/shared-domain/Policy";
import { RpcMiddleware } from "@effect/rpc";

/**
 * RPC Middleware that provides authentication context.
 * Must be applied to all RPCs requiring authentication.
 */
export class RpcAuthMiddleware extends RpcMiddleware.Tag<RpcAuthMiddleware>()(
  "RpcAuthMiddleware",
  {
    provides: AuthContext,
    requiredForClient: true,
  }
) {}
```

### Step 6.3: Create Combined RpcGroup (Optional)

**File:** `packages/knowledge-management/domain/src/rpc/KnowledgeManagement.rpc.ts`

```typescript
import { RpcGroup } from "@effect/rpc";
import { Entities } from "@beep/knowledge-management-domain";
import { RpcAuthMiddleware } from "../middleware/RpcAuthMiddleware.ts";

/**
 * Combined RPC group for all Knowledge Management entities.
 * All RPCs require authentication.
 */
export class KnowledgeManagementRpcs extends RpcGroup.make(
  ...Entities.Comment.CommentRpcs.Rpcs.requests.values(),
  ...Entities.Discussion.DiscussionRpcs.Rpcs.requests.values(),
  ...Entities.Document.DocumentRpcs.Rpcs.requests.values(),
  ...Entities.DocumentFile.DocumentFileRpcs.Rpcs.requests.values(),
  ...Entities.DocumentVersion.DocumentVersionRpcs.Rpcs.requests.values(),
).middleware(RpcAuthMiddleware) {}
```

### Step 6.4: Phase 6 Verification (REQUIRED)

**Run these commands before proceeding to Phase 7:**

```bash
# Build the entire domain package
bun run build --filter=@beep/knowledge-management-domain

# Type check
bun run check --filter=@beep/knowledge-management-domain

# Auto-fix lint issues
bun run lint:fix --filter=@beep/knowledge-management-domain

# Check for circular dependencies
bun run lint:circular
```

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] Type check passes
- [ ] Lint passes (after auto-fix)
- [ ] No circular dependencies
- [ ] All entity RPC exports are accessible from entities/index.ts
- [ ] RpcAuthMiddleware is properly exported
- [ ] Combined KnowledgeManagementRpcs compiles correctly

**Do NOT proceed to Phase 7 until all checks pass.**

---

## Phase 7: Final Verification & Testing

### Step 7.1: Type Check All Packages

```bash
# Check domain package
bun run check --filter=@beep/knowledge-management-domain

# Check infra package
bun run check --filter=@beep/knowledge-management-infra

# Check entire monorepo
bun run check
```

### Step 7.2: Lint Check

```bash
bun run lint --filter=@beep/knowledge-management-domain
bun run lint:circular
```

### Step 7.3: Run Tests

```bash
bun run test --filter=@beep/knowledge-management-domain
bun run test --filter=@beep/knowledge-management-infra
```

### Step 7.4: Documentation Review

1. Verify all exports are properly documented
2. Check that JSDoc comments describe the purpose of each RPC
3. Ensure error messages are clear and actionable

---

## Checklist Summary

### For Each Entity (Comment, Discussion, Document, DocumentFile, DocumentVersion):

- [ ] Create `{Entity}.errors.ts` with TaggedError classes
- [ ] Create `{Entity}.rpc.ts` with RpcGroup class
- [ ] Update `{Entity}/index.ts` to export new modules
- [ ] Add repository methods for streaming operations
- [ ] Create router/handler implementation
- [ ] Type check passes
- [ ] Lint check passes
- [ ] Tests pass (if applicable)

### Integration:

- [ ] Update `entities/index.ts`
- [ ] Create RpcAuthMiddleware
- [ ] Create combined RpcGroup (optional)
- [ ] Full monorepo type check passes
- [ ] No circular dependencies

---

## Notes for Reviewer

1. **Model Variants**: Ensure `Model.json`, `Model.jsonCreate`, `Model.jsonUpdate` are being used correctly based on the operation type.

2. **Streaming**: All list operations use `stream: true` for efficiency with large datasets.

3. **Error Composition**: Each entity has a `Errors` union type that combines all possible errors.

4. **Authorization**: Authorization logic should live in handlers, not in RPC definitions. Use `AuthContext` to access the current user.

5. **HttpApiSchema**: Error annotations with HTTP status codes enable proper HTTP transport mapping if needed.
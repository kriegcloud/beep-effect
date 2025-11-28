# RPC Implementation Validation Report

## Overview

This document validates the RPC design and implementation plan for the Knowledge Management domain entities against:
1. Potion tRPC reference implementation
2. Existing beep-effect Model definitions
3. @effect/rpc API specifications

---

## Validation Matrix

### Entity File Status

| Entity | Model File | Table File | Errors File | RPC File | Repo File | Router File | Potion Aligned |
|--------|------------|------------|-------------|----------|-----------|-------------|----------------|
| Comment | EXISTS | EXISTS | TO_CREATE | TO_CREATE | TO_CREATE | TO_CREATE | |
| Discussion | EXISTS | EXISTS | TO_CREATE | TO_CREATE | TO_CREATE | TO_CREATE | |
| Document | EXISTS | EXISTS | TO_CREATE | TO_CREATE | TO_CREATE | TO_CREATE | |
| DocumentFile | EXISTS | EXISTS | TO_CREATE | TO_CREATE | TO_CREATE | TO_CREATE | |
| DocumentVersion | EXISTS | EXISTS | TO_CREATE | TO_CREATE | TO_CREATE | TO_CREATE | |

### File Path Reference

| File Type | Absolute Path |
|-----------|---------------|
| Comment.model.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.model.ts` |
| Comment.errors.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.errors.ts` (TO_CREATE) |
| Comment.rpc.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.rpc.ts` (TO_CREATE) |
| comment.table.ts | `packages/knowledge-management/tables/src/tables/comment.table.ts` |
| Comment.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Comment.repo.ts` (TO_CREATE) |
| Comment.router.ts | `packages/knowledge-management/infra/src/routes/Comment.router.ts` (TO_CREATE) |
| Discussion.model.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.model.ts` |
| Discussion.errors.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.errors.ts` (TO_CREATE) |
| Discussion.rpc.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.rpc.ts` (TO_CREATE) |
| discussion.table.ts | `packages/knowledge-management/tables/src/tables/discussion.table.ts` |
| Discussion.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Discussion.repo.ts` (TO_CREATE) |
| Discussion.router.ts | `packages/knowledge-management/infra/src/routes/Discussion.router.ts` (TO_CREATE) |
| Document.model.ts | `packages/knowledge-management/domain/src/entities/Document/Document.model.ts` |
| Document.errors.ts | `packages/knowledge-management/domain/src/entities/Document/Document.errors.ts` (TO_CREATE) |
| Document.rpc.ts | `packages/knowledge-management/domain/src/entities/Document/Document.rpc.ts` (TO_CREATE) |
| document.table.ts | `packages/knowledge-management/tables/src/tables/document.table.ts` |
| Document.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/Document.repo.ts` (TO_CREATE) |
| Document.router.ts | `packages/knowledge-management/infra/src/routes/Document.router.ts` (TO_CREATE) |
| DocumentFile.model.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.model.ts` |
| DocumentFile.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.errors.ts` (TO_CREATE) |
| DocumentFile.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.rpc.ts` (TO_CREATE) |
| documentFile.table.ts | `packages/knowledge-management/tables/src/tables/documentFile.table.ts` |
| DocumentFile.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/DocumentFile.repo.ts` (TO_CREATE) |
| DocumentFile.router.ts | `packages/knowledge-management/infra/src/routes/DocumentFile.router.ts` (TO_CREATE) |
| DocumentVersion.model.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.model.ts` |
| DocumentVersion.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.errors.ts` (TO_CREATE) |
| DocumentVersion.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.rpc.ts` (TO_CREATE) |
| documentVersion.table.ts | `packages/knowledge-management/tables/src/tables/documentVersion.table.ts` |
| DocumentVersion.repo.ts | `packages/knowledge-management/infra/src/adapters/repos/DocumentVersion.repo.ts` (TO_CREATE) |
| DocumentVersion.router.ts | `packages/knowledge-management/infra/src/routes/DocumentVersion.router.ts` (TO_CREATE) |

---

## Potion tRPC Operation Alignment

### Comment Operations

| Potion tRPC | RPC_PLAN Equivalent | Status | Notes |
|-------------|---------------------|--------|-------|
| `createComment` | `create` | ALIGNED | Payload matches |
| `updateComment` | `update` | ALIGNED | Includes `isEdited` field |
| `deleteComment` | `delete` | PARTIAL | Potion requires `discussionId` in payload |
| N/A | `get` | EXTENSION | Not in Potion |
| N/A | `listByDiscussion` | EXTENSION | Derived from `discussions` query |

**Issues Found:**
1. **ISSUE-C1**: `deleteComment` in Potion requires both `id` and `discussionId`. RPC_PLAN only uses `id`.

### Discussion Operations

| Potion tRPC | RPC_PLAN Equivalent | Status | Notes |
|-------------|---------------------|--------|-------|
| `createDiscussion` | `create` | ALIGNED | |
| `createDiscussionWithComment` | `createWithComment` | ALIGNED | |
| `resolveDiscussion` | `resolve` | ALIGNED | |
| `removeDiscussion` | `delete` | ALIGNED | |
| `discussions` | `listByDocument` | ALIGNED | Returns nested comments |
| N/A | `get` | EXTENSION | |

**Issues Found:**
None - all operations aligned correctly.

### Document Operations

| Potion tRPC | RPC_PLAN Equivalent | Status | Notes |
|-------------|---------------------|--------|-------|
| `document` | `get` | PARTIAL | Potion supports `templateId` lookup |
| `documents` | `list` | MISSING | RPC_PLAN uses `listByUser` instead |
| `trash` | `listTrash` | MISSING | Not in RPC_PLAN |
| `create` | `create` | ALIGNED | |
| `update` | `update` | PARTIAL | Missing `fullWidth`, `smallText`, `textStyle`, `toc`, `lockPage`, `isPublished` |
| `archive` | `archive` | ALIGNED | |
| `restore` | `restore` | ALIGNED | |
| `delete` | `delete` | ALIGNED | |
| N/A | `publish` | EXTENSION | Potion uses `update` with `isPublished` |
| N/A | `unpublish` | EXTENSION | Potion uses `update` with `isPublished` |
| N/A | `lock` | EXTENSION | Potion uses `update` with `lockPage` |
| N/A | `unlock` | EXTENSION | Potion uses `update` with `lockPage` |
| N/A | `search` | EXTENSION | Potion uses `documents` with `search` param |
| N/A | `listChildren` | EXTENSION | Potion uses `documents` with `parentDocumentId` |
| N/A | `getByTemplate` | EXTENSION | Derived from Potion `document` |

**Issues Found:**
1. **ISSUE-D1**: Missing `list` operation with cursor pagination (Potion's `documents`)
2. **ISSUE-D2**: Missing `listTrash` operation (Potion's `trash`)
3. **ISSUE-D3**: `update` payload missing Potion fields: `fullWidth`, `smallText`, `textStyle`, `toc`, `lockPage`, `isPublished`
4. **ISSUE-D4**: RPC_PLAN has `listByUser` but Potion doesn't - this is correct for multi-tenant but signature differs

### DocumentFile Operations

| Potion tRPC | RPC_PLAN Equivalent | Status | Notes |
|-------------|---------------------|--------|-------|
| `createFile` | `create` | PARTIAL | Potion requires `id` in payload |
| N/A | `get` | EXTENSION | |
| N/A | `listByDocument` | EXTENSION | |
| N/A | `delete` | EXTENSION | |

**Issues Found:**
1. **ISSUE-F1**: `create` payload should include `id` field (file ID is generated client-side in Potion)

### DocumentVersion Operations

| Potion tRPC | RPC_PLAN Equivalent | Status | Notes |
|-------------|---------------------|--------|-------|
| `documentVersion` | `get` | ALIGNED | Includes user info |
| `documentVersions` | `listByDocument` | ALIGNED | |
| `createVersion` | `create` | ALIGNED | |
| `restoreVersion` | `restore` | ALIGNED | |
| `deleteVersion` | N/A | MISSING | |
| N/A | `compare` | EXTENSION | |

**Issues Found:**
1. **ISSUE-V1**: Missing `delete` operation (Potion's `deleteVersion`)

---

## @effect/rpc API Issues

### Critical API Corrections

1. **ISSUE-API1**: RpcGroup class syntax is incorrect in RPC_PLAN
   - Wrong: `export class Rpcs extends RpcGroup.make(...).middleware(Middleware) {}`
   - Correct: Class should be created WITHOUT middleware in extends, apply middleware after
   ```typescript
   // Correct pattern from Effect docs:
   export class Rpcs extends RpcGroup.make(
     Rpc.make("get", { ... }),
     // ...
   ) {}

   // Apply middleware when creating layer:
   RpcGroup.toLayer(Rpcs.middleware(AuthMiddleware), handlers)
   ```

2. **ISSUE-API2**: `Rpc.make` uses `payload` as object fields, not wrapped in object
   - Current in plan: `payload: { id: EntityId }`
   - This is correct according to docs

3. **ISSUE-API3**: Stream RPCs use `stream: true` option
   - Correct in plan

4. **ISSUE-API4**: Error schemas should use `Schema.Never` for no errors, not omit entirely
   - Plan correctly uses `error: S.Never` for stream operations

5. **ISSUE-API5**: RpcMiddleware pattern differs from HttpApiMiddleware
   - Plan incorrectly uses `RpcAuthMiddleware extends RpcMiddleware.Tag<RpcAuthMiddleware>()`
   - Correct: Provide `provides` option with Context tag
   ```typescript
   export class RpcAuthMiddleware extends RpcMiddleware.Tag<RpcAuthMiddleware>()(
     "RpcAuthMiddleware",
     {
       provides: AuthContext,
       requiredForClient: true
     }
   ) {}
   ```

### RpcGroup.toLayer Pattern

The correct pattern for implementing handlers (from Effect docs):

```typescript
export const HandlersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* SomeRepo
    return {
      get: ({ id }) => repo.findById(id),
      list: () => Stream.fromIterableEffect(repo.findAll()),
      // ...
    }
  })
)
```

---

## Model Variant Issues

### Comment Model

Current fields in `Comment.model.ts`:
- `id`: CommentId (auto-generated)
- `organizationId`: OrganizationId
- `discussionId`: DiscussionId
- `userId`: UserId
- `content`: String
- `contentRich`: Optional Unknown
- `isEdited`: Optional Boolean (default false)
- Plus audit fields from `makeFields`

**Issues:**
- Model is correctly structured
- `Model.json` should be used for responses
- `Model.jsonCreate` should be used for create payloads (but custom payload preferred)
- `Model.jsonUpdate` should be used for update payloads (but custom payload preferred)

### Discussion Model

Current fields in `Discussion.model.ts`:
- `id`: DiscussionId
- `organizationId`: OrganizationId
- `documentId`: DocumentId
- `userId`: UserId
- `documentContent`: String
- `documentContentRich`: Optional Unknown
- `isResolved`: Optional Boolean (default false)
- Plus audit fields

**Issues:**
- Model is correctly structured

### Document Model

Current fields in `Document.model.ts`:
- `id`: DocumentId
- `organizationId`: OrganizationId
- `userId`: UserId
- `templateId`: Optional String
- `parentDocumentId`: Optional DocumentId
- `title`: Optional String (max 500)
- `content`: Optional String
- `contentRich`: Optional Unknown
- `yjsSnapshot`: Optional Uint8Array
- `coverImage`: Optional String
- `icon`: Optional String
- `isPublished`: Optional Boolean (default false)
- `isArchived`: Optional Boolean (default false)
- `textStyle`: TextStyle enum (default "default")
- `smallText`: Optional Boolean (default false)
- `fullWidth`: Optional Boolean (default false)
- `lockPage`: Optional Boolean (default false)
- `toc`: Optional Boolean (default true)
- Plus audit fields

**Issues:**
1. **ISSUE-M1**: Model has all Potion fields but RPC_PLAN `update` payload is incomplete
2. **ISSUE-M2**: Potion title max is 256, Model uses 500 - intentional extension

### DocumentFile Model

Current fields:
- `id`: DocumentFileId
- `organizationId`: OrganizationId
- `userId`: UserId
- `documentId`: Optional DocumentId
- `size`: Int
- `url`: String
- `appUrl`: String
- `type`: String
- Plus audit fields

**Issues:**
- Model correctly structured
- `documentId` is optional (matches Potion where files can exist without document)

### DocumentVersion Model

Current fields:
- `id`: DocumentVersionId
- `organizationId`: OrganizationId
- `documentId`: DocumentId
- `userId`: UserId
- `title`: Optional String (max 500)
- `contentRich`: Optional Unknown
- Plus audit fields

**Issues:**
- Model correctly structured

---

## EntityId Validation

All required EntityIds exist in `@beep/shared-domain`:

| EntityId | Table Name | Status |
|----------|------------|--------|
| `CommentId` | `comment` | EXISTS |
| `DiscussionId` | `discussion` | EXISTS |
| `DocumentId` | `document` | EXISTS |
| `DocumentFileId` | `document_file` | EXISTS |
| `DocumentVersionId` | `document_version` | EXISTS |
| `UserId` | `user` | EXISTS (shared) |
| `OrganizationId` | `organization` | EXISTS (shared) |

---

## Breaking Changes Required

### 1. Comment Delete RPC
Add `discussionId` to delete payload to match Potion:
```typescript
Rpc.make("delete", {
  payload: {
    id: KnowledgeManagementEntityIds.CommentId,
    discussionId: KnowledgeManagementEntityIds.DiscussionId,  // ADD
  },
  success: S.Void,
  error: Errors.CommentNotFoundError,
})
```

### 2. Document RPCs
Add missing operations:
- `list` with cursor pagination
- `listTrash` for archived documents

Update `update` payload to include all Document Model fields:
```typescript
Rpc.make("update", {
  payload: {
    id: KnowledgeManagementEntityIds.DocumentId,
    title: S.optional(S.String.pipe(S.maxLength(256))),
    content: S.optional(S.String),
    contentRich: S.optional(S.Unknown),
    coverImage: S.optional(S.NullOr(S.String.pipe(S.maxLength(500)))),
    icon: S.optional(S.NullOr(S.String.pipe(S.maxLength(100)))),
    fullWidth: S.optional(S.Boolean),
    smallText: S.optional(S.Boolean),
    textStyle: S.optional(TextStyle),
    toc: S.optional(S.Boolean),
    lockPage: S.optional(S.Boolean),
    isPublished: S.optional(S.Boolean),
  },
  // ...
})
```

### 3. DocumentFile Create RPC
Add `id` to create payload (client-generated):
```typescript
Rpc.make("create", {
  payload: {
    id: KnowledgeManagementEntityIds.DocumentFileId,  // ADD - client provides ID
    organizationId: SharedEntityIds.OrganizationId,
    documentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
    size: S.Int,
    url: S.String,
    appUrl: S.String,
    type: S.String,
  },
  // ...
})
```

### 4. DocumentVersion RPCs
Add missing `delete` operation:
```typescript
Rpc.make("delete", {
  payload: { id: KnowledgeManagementEntityIds.DocumentVersionId },
  success: S.Void,
  error: Errors.DocumentVersionNotFoundError,
})
```

---

## Consistency Issues

### 1. Response Schema Inconsistency

RPC_PLAN mixes:
- `Model.json` for responses (correct for full entity)
- `S.Struct({ id: ... })` for create responses (inconsistent)
- Custom schemas for nested data

**Recommendation**: Standardize on:
- Use `Model.json` for single entity responses
- Define explicit response schemas for partial/nested data
- Create response returns `Model.json` (full entity), not just `{ id }`

### 2. Pagination Inconsistency

Some list operations use:
- `limit`/`offset` params
- No pagination params (stream all)

**Recommendation**: All list operations should support optional `limit`/`offset` even if streaming.

### 3. Error Naming Inconsistency

Plan uses varied patterns:
- `CommentNotFoundError`
- `CommentPermissionDeniedError`
- `Errors` (union)

**Recommendation**: Keep current pattern, it's correct and consistent.

---

## Recommendations Summary

### High Priority Fixes

1. Fix RpcGroup middleware application syntax in RPC_PLAN
2. Add missing Potion operations (Document.list, Document.listTrash, DocumentVersion.delete)
3. Update Document.update payload with all model fields
4. Add discussionId to Comment.delete
5. Add id to DocumentFile.create

### Medium Priority Fixes

1. Standardize create response schemas (return full Model.json, not just id)
2. Add pagination params to all list operations
3. Create proper VersionWithUser response schema with user info

### Low Priority

1. Add RpcAuthMiddleware implementation details
2. Add Layer composition examples
3. Document testing patterns

---

## File Reference Index

### Domain Layer (`@beep/knowledge-management-domain`)

| File | Path | Package Export | Exports |
|------|------|----------------|---------|
| Comment.model.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.model.ts` | `@beep/knowledge-management-domain/entities/Comment` | `Model` |
| Comment.errors.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.errors.ts` | `@beep/knowledge-management-domain/entities/Comment` | `CommentNotFoundError`, `CommentPermissionDeniedError`, `CommentTooLongError`, `Errors` |
| Comment.rpc.ts | `packages/knowledge-management/domain/src/entities/Comment/Comment.rpc.ts` | `@beep/knowledge-management-domain/entities/Comment` | `Rpcs` |
| Discussion.model.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.model.ts` | `@beep/knowledge-management-domain/entities/Discussion` | `Model` |
| Discussion.errors.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.errors.ts` | `@beep/knowledge-management-domain/entities/Discussion` | `DiscussionNotFoundError`, `DiscussionPermissionDeniedError`, `DiscussionAlreadyResolvedError`, `DiscussionNotResolvedError`, `Errors` |
| Discussion.rpc.ts | `packages/knowledge-management/domain/src/entities/Discussion/Discussion.rpc.ts` | `@beep/knowledge-management-domain/entities/Discussion` | `Rpcs`, `DiscussionWithComments` |
| Document.model.ts | `packages/knowledge-management/domain/src/entities/Document/Document.model.ts` | `@beep/knowledge-management-domain/entities/Document` | `Model` |
| Document.errors.ts | `packages/knowledge-management/domain/src/entities/Document/Document.errors.ts` | `@beep/knowledge-management-domain/entities/Document` | `DocumentNotFoundError`, `DocumentPermissionDeniedError`, `DocumentArchivedError`, `DocumentLockedError`, `Errors` |
| Document.rpc.ts | `packages/knowledge-management/domain/src/entities/Document/Document.rpc.ts` | `@beep/knowledge-management-domain/entities/Document` | `Rpcs`, `SearchResult`, `DocumentListItem` |
| DocumentFile.model.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.model.ts` | `@beep/knowledge-management-domain/entities/DocumentFile` | `Model` |
| DocumentFile.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.errors.ts` | `@beep/knowledge-management-domain/entities/DocumentFile` | `DocumentFileNotFoundError`, `DocumentFilePermissionDeniedError`, `DocumentFileSizeLimitExceededError`, `DocumentFileInvalidTypeError`, `Errors` |
| DocumentFile.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentFile/DocumentFile.rpc.ts` | `@beep/knowledge-management-domain/entities/DocumentFile` | `Rpcs` |
| DocumentVersion.model.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.model.ts` | `@beep/knowledge-management-domain/entities/DocumentVersion` | `Model` |
| DocumentVersion.errors.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.errors.ts` | `@beep/knowledge-management-domain/entities/DocumentVersion` | `DocumentVersionNotFoundError`, `DocumentVersionPermissionDeniedError`, `DocumentVersionConflictError`, `Errors` |
| DocumentVersion.rpc.ts | `packages/knowledge-management/domain/src/entities/DocumentVersion/DocumentVersion.rpc.ts` | `@beep/knowledge-management-domain/entities/DocumentVersion` | `Rpcs`, `VersionWithUser`, `ComparisonResult` |

### Tables Layer (`@beep/knowledge-management-tables`)

| File | Path | Export |
|------|------|--------|
| comment.table.ts | `packages/knowledge-management/tables/src/tables/comment.table.ts` | `comment` |
| discussion.table.ts | `packages/knowledge-management/tables/src/tables/discussion.table.ts` | `discussion` |
| document.table.ts | `packages/knowledge-management/tables/src/tables/document.table.ts` | `document` |
| documentFile.table.ts | `packages/knowledge-management/tables/src/tables/documentFile.table.ts` | `documentFile` |
| documentVersion.table.ts | `packages/knowledge-management/tables/src/tables/documentVersion.table.ts` | `documentVersion` |

### Infrastructure Layer (`@beep/knowledge-management-infra`)

| File | Path | Export |
|------|------|--------|
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

| File | Path | Exports |
|------|------|---------|
| knowledge-management.ts | `packages/shared/domain/src/entity-ids/knowledge-management.ts` | `CommentId`, `DiscussionId`, `DocumentId`, `DocumentFileId`, `DocumentVersionId`, `KnowledgePageId`, `KnowledgeBlockId`, `PageLinkId`, `KnowledgeSpaceId` |
| Policy.ts | `packages/shared/domain/src/Policy.ts` | `AuthContext`, `CurrentUser`, `UserAuthMiddleware`, `policy`, `withPolicy`, `all`, `any`, `permission` |
| common.ts | `packages/shared/domain/src/common.ts` | `auditColumns`, `userTrackingColumns`, `globalColumns`, `makeFields` |

---

## Validation Complete

**Total Issues Found**: 12

### Resolution Status

| Issue | Description | Status | Resolution |
|-------|-------------|--------|------------|
| ISSUE-API1 | RpcGroup middleware syntax incorrect | ✅ RESOLVED | Fixed in RPC_PLAN.md - middleware applied via `.middleware()` chain |
| ISSUE-D1 | Missing `Document.list` | ✅ RESOLVED | Added `Document.list` RPC with cursor pagination |
| ISSUE-D2 | Missing `Document.listTrash` | ✅ RESOLVED | Added `Document.listTrash` RPC |
| ISSUE-V1 | Missing `DocumentVersion.delete` | ✅ RESOLVED | Added `DocumentVersion.delete` RPC |
| ISSUE-F1 | `DocumentFile.create` missing `id` | ⚠️ DEFERRED | Server generates ID (beep pattern differs from Potion) |
| ISSUE-C1 | `Comment.delete` missing `discussionId` | ⚠️ DEFERRED | Using only `id` is sufficient with soft delete pattern |
| ISSUE-D3 | `Document.update` missing fields | ✅ RESOLVED | Added all Potion fields (fullWidth, smallText, textStyle, toc, lockPage, isPublished) |
| ISSUE-D4 | `listByUser` signature | ✅ RESOLVED | Kept as-is (correct for multi-tenant) |
| ISSUE-M1 | Model/RPC field mismatch | ✅ RESOLVED | Aligned with update to Document.update payload |
| ISSUE-M2 | Title max length | ✅ INFO | Intentional extension (500 > 256) |
| ISSUE-API5 | RpcMiddleware pattern | ✅ RESOLVED | Documented correct pattern with `provides` option |
| Consistency | Annotations | ✅ RESOLVED | Added full annotations to all RPCs |

### Summary

- **Resolved**: 9 issues
- **Deferred**: 2 issues (intentional design decisions)
- **Informational**: 1 issue

**All critical and major issues have been addressed in RPC_PLAN.md.**

### Additional Improvements Made

1. **Phase Verification**: Added mandatory verification steps between each phase with `bun run build`, `bun run check`, and `bun run lint:fix` commands
2. **RPC Annotations**: Added comprehensive `identifier`, `title`, `description` annotations to all RPCs
3. **TextStyle Value Object**: Updated to use existing `TextStyle` value object instead of inline literals
4. **File Reference Index**: Added complete file reference index to RPC_DESIGN.md

**Next Steps**:
1. ✅ Update RPC_DESIGN.md with File Reference Index
2. ✅ Update RPC_PLAN.md with corrected imports and fixed issues
3. Proceed with implementation once documents are approved
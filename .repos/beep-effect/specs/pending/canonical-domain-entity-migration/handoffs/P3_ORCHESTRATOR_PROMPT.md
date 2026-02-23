# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the canonical-domain-entity-migration spec: Wave 2 Shared + Documents Entity Migration.

### Context

Phase 2 migrated 23 simple CRUD entities (IAM + Calendar + Comms + Customization) to the canonical pattern. All pass type checks.

Key Phase 2 learnings:
- MCP refactor tools were unreliable for directory renames -- prefer direct file creation in PascalCase directories + old directory deletion
- Downstream import paths break on rename (case-sensitive on Linux) -- must grep for remaining kebab-case imports after each wave
- Post-migration import sweep is mandatory: `grep -r 'from "@beep/<pkg>/entities/[a-z]' packages/`

### Your Mission

Orchestrate a swarm of 4 parallel agents to migrate 14 entities (8 Shared + 6 Documents) to the canonical domain entity pattern.

**Batch assignments**:
- Batch 1 (simple-shared): AuditLog, Organization, Session, Team, User, PageShare (6 entities -- CRUD-only or no repo)
- Batch 2 (custom-shared): File, Folder, UploadSession (3 entities -- have custom repo methods)
- Batch 3 (docs-bare): DocumentFile, DocumentSource (2 entities -- bare models with custom repo methods)
- Batch 4 (docs-legacy): Discussion, DocumentVersion, Document (3 entities -- legacy RPC dismantle + custom methods)

### Critical Patterns

Read these files before spawning agents:
- `.claude/skills/canonical-domain-entity.md` -- Authoritative pattern document
- `packages/documents/domain/src/entities/Comment/` -- Fully canonical reference (custom repo methods + 5 contracts)
- `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P3.md` -- Full Wave 2 context

---

### Batch 1: Simple Shared + PageShare (6 entities)

**Entities**: AuditLog, Organization, Session, Team, User (Shared), PageShare (Documents)

**Characteristics**: All CRUD-only or no server repo. Same pattern as Wave 1.

**Special cases**:
- AuditLog has NO server repo -- still create full module with empty repo extensions
- Organization has `schemas/` with 3 enum schemas (OrganizationType, SubscriptionTier, SubscriptionStatus) -- preserve
- User has `schemas/user-role.schema.ts` + `user.constants.ts` -- preserve both
- Team has empty `team.policy.ts` -- DELETE, do not preserve
- PageShare is already PascalCase in Documents domain -- no rename needed, just add canonical files

**Identity builders**:
- Shared entities: `$SharedDomainId` from `@beep/identity/packages`
- PageShare: `$DocumentsDomainId` from `@beep/identity/packages`

**Entity ID schemas**:
```typescript
// Shared
SharedEntityIds.AuditLogId     // Verify exists!
SharedEntityIds.OrganizationId
SharedEntityIds.SessionId
SharedEntityIds.TeamId
SharedEntityIds.UserId

// Documents
DocumentsEntityIds.PageShareId  // Verify exists!
```

---

### Batch 2: Custom Shared Entities (3 entities)

**Entities**: File, Folder, UploadSession

**Characteristics**: Each has custom server repo methods. Repo extensions must be typed.

#### File Entity -- 4 custom methods

```typescript
// File.repo.ts extensions:
{
  readonly listPaginated: DbRepo.Method<{
    payload: {
      readonly userId: SharedEntityIds.UserId.Type;
      readonly offset: number;
      readonly limit: number;
    };
    success: {
      readonly rootFiles: ReadonlyArray<File.Model.Type>;
      readonly folders: ReadonlyArray<Folder.WithUploadedFiles.Type>;
      readonly total: number;
      readonly offset: number;
      readonly limit: number;
      readonly hasNext: boolean;
    };
  }>;
  readonly moveFiles: DbRepo.Method<{
    payload: {
      readonly fileIds: ReadonlyArray<SharedEntityIds.FileId.Type>;
      readonly folderId: SharedEntityIds.FolderId.Type | null;
      readonly userId: SharedEntityIds.UserId.Type;
    };
    success: void;
  }>;
  readonly deleteFiles: DbRepo.Method<{
    payload: {
      readonly fileIds: ReadonlyArray<SharedEntityIds.FileId.Type>;
      readonly userId: SharedEntityIds.UserId.Type;
    };
    success: ReadonlyArray<File.UploadKey.Type>;
  }>;
  readonly getFilesByKeys: DbRepo.Method<{
    payload: {
      readonly keys: ReadonlyArray<File.Model.fields["key"]["Type"]>;
      readonly userId: SharedEntityIds.UserId.Type;
    };
    success: ReadonlyArray<File.Model.Type | null>;
  }>;
}
```

**Contracts to create**: Get, Delete, ListPaginated, MoveFiles, DeleteFiles, GetFilesByKeys

#### Folder Entity -- 1 custom method

```typescript
// Folder.repo.ts extensions:
{
  readonly deleteFolders: DbRepo.Method<{
    payload: {
      readonly folderIds: ReadonlyArray<SharedEntityIds.FolderId.Type>;
    };
    success: void;
  }>;
}
```

**Contracts to create**: Get, Delete, DeleteFolders

#### UploadSession Entity -- 5 custom methods

```typescript
// UploadSession.repo.ts extensions:
{
  readonly store: DbRepo.Method<{
    payload: {
      readonly fileKey: UploadSession.Model.fields["fileKey"]["Type"];
      readonly signature: string; // HmacSignature
      readonly metadata: UploadSessionMetadata.Type;
      readonly expiresAt: DateTime.Utc;
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly userId: SharedEntityIds.UserId.Type;
    };
    success: SharedEntityIds.UploadSessionId.Type;
    failure: UploadSessionErrors.UploadSessionRepoError;
  }>;
  readonly findByFileKey: DbRepo.Method<{
    payload: { readonly fileKey: File.UploadKey.Type };
    success: Option<UploadSession.Model.Type>;
    failure: UploadSessionErrors.UploadSessionRepoError;
  }>;
  readonly deleteByFileKey: DbRepo.Method<{
    payload: { readonly fileKey: File.UploadKey.Type };
    success: void;
    failure: UploadSessionErrors.UploadSessionRepoError;
  }>;
  readonly deleteExpired: DbRepo.Method<{
    payload: void;
    success: number;
    failure: UploadSessionErrors.UploadSessionRepoError;
  }>;
  readonly isValid: DbRepo.Method<{
    payload: { readonly fileKey: File.UploadKey.Type };
    success: boolean;
    failure: UploadSessionErrors.UploadSessionRepoError;
  }>;
}
```

**Contracts to create**: Get, Delete, Store, FindByFileKey, DeleteByFileKey, DeleteExpired, IsValid

**Note**: UploadSession defines a custom `UploadSessionRepoError` in the server repo. The domain error schema should define this type (as `S.TaggedError`) so the repo contract can reference it.

---

### Batch 3: Documents Bare Entities (2 entities)

**Entities**: DocumentFile, DocumentSource

#### DocumentFile -- 5 custom methods

```typescript
// DocumentFile.repo.ts extensions:
{
  readonly findByIdOrFail: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentFileId.Type };
    success: DocumentFile.Model.Type;
    failure: DocumentFileErrors.FileNotFoundError;
  }>;
  readonly listByDocument: DbRepo.Method<{
    payload: { readonly documentId: DocumentsEntityIds.DocumentId.Type };
    success: ReadonlyArray<DocumentFile.Model.Type>;
  }>;
  readonly listByUser: DbRepo.Method<{
    payload: {
      readonly userId: SharedEntityIds.UserId.Type;
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
    };
    success: ReadonlyArray<DocumentFile.Model.Type>;
  }>;
  readonly create: DbRepo.Method<{
    payload: DocumentFile.Model.insert.Type;
    success: { readonly data: DocumentFile.Model.Type };
  }>;
  readonly hardDelete: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentFileId.Type };
    success: void;
  }>;
}
```

**Contracts to create**: Get, Delete, ListByDocument, ListByUser, Create, HardDelete

**Error types**: FileNotFoundError (currently `Data.TaggedError` in server repo -- migrate to `S.TaggedError` with `$I.annotationsHttp`)

#### DocumentSource -- 1 custom method

```typescript
// DocumentSource.repo.ts extensions:
{
  readonly findByMappingKey: DbRepo.Method<{
    payload: {
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly providerAccountId: IamEntityIds.AccountId.Type;
      readonly sourceType: string;
      readonly sourceId: string;
      readonly includeDeleted?: boolean;
    };
    success: Option<DocumentSource.Model.Type>;
  }>;
}
```

**Contracts to create**: Get, Delete, FindByMappingKey

---

### Batch 4: Documents Legacy RPC Dismantle (3 entities)

**Entities**: Discussion, DocumentVersion, Document

These entities have existing `{entity}.errors.ts` and `{entity}.rpc.ts` files with inline schemas. The migration must:
1. Preserve and migrate error schemas from `HttpApiSchema.annotations({ status: N })` to `$I.annotationsHttp(...)`
2. Extract inline response types to contract Success schemas
3. Replace inline RPC definitions with contract-derived RpcGroup
4. Add missing canonical files (repo, http, tool, entity, contracts/)

#### Discussion -- 7 custom methods, legacy RPC

**Existing errors** (preserve and migrate annotations):
- DiscussionNotFoundError (404)
- DiscussionPermissionDeniedError (403)
- DiscussionAlreadyResolvedError (400)
- DiscussionNotResolvedError (400)

**Inline type to extract**: `DiscussionWithComments` schema (Discussion + author + comments[] with authors)

**Contracts to create**: Get (returns DiscussionWithComments), ListByDocument (stream, returns DiscussionWithComments), Create, CreateWithComment, Resolve, Delete

```typescript
// Discussion.repo.ts extensions:
{
  readonly findByIdOrFail: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DiscussionId.Type };
    success: Discussion.Model.Type;
    failure: DiscussionErrors.DiscussionNotFoundError;
  }>;
  readonly getWithComments: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DiscussionId.Type };
    success: DiscussionWithComments.Type; // Extract inline type
    failure: DiscussionErrors.DiscussionNotFoundError;
  }>;
  readonly listByDocument: DbRepo.Method<{
    payload: { readonly documentId: DocumentsEntityIds.DocumentId.Type };
    success: ReadonlyArray<DiscussionWithComments.Type>;
  }>;
  readonly create: DbRepo.Method<{
    payload: Discussion.Model.insert.Type;
    success: { readonly data: Discussion.Model.Type };
  }>;
  readonly resolve: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DiscussionId.Type };
    success: Discussion.Model.Type;
    failure: DiscussionErrors.DiscussionNotFoundError;
  }>;
  readonly unresolve: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DiscussionId.Type };
    success: Discussion.Model.Type;
    failure: DiscussionErrors.DiscussionNotFoundError;
  }>;
  readonly hardDelete: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DiscussionId.Type };
    success: void;
  }>;
}
```

#### DocumentVersion -- 5 custom methods, legacy RPC

**Existing errors**: DocumentVersionNotFoundError (404), DocumentVersionPermissionDeniedError (403)

**Inline type to extract**: `VersionWithAuthorSchema` (DocumentVersion + author{id, _rowId, name, image})

**Contracts to create**: Get (returns VersionWithAuthor), ListByDocument (returns VersionWithAuthor[]), CreateSnapshot, HardDelete

```typescript
// DocumentVersion.repo.ts extensions:
{
  readonly findByIdOrFail: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentVersionId.Type };
    success: DocumentVersion.Model.Type;
    failure: DocumentVersionErrors.DocumentVersionNotFoundError;
  }>;
  readonly getWithAuthor: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentVersionId.Type };
    success: VersionWithAuthor.Type;
    failure: DocumentVersionErrors.DocumentVersionNotFoundError;
  }>;
  readonly listByDocument: DbRepo.Method<{
    payload: { readonly documentId: DocumentsEntityIds.DocumentId.Type };
    success: ReadonlyArray<VersionWithAuthor.Type>;
  }>;
  readonly createSnapshot: DbRepo.Method<{
    payload: DocumentVersion.Model.insert.Type;
    success: { readonly data: DocumentVersion.Model.Type };
  }>;
  readonly hardDelete: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentVersionId.Type };
    success: void;
  }>;
}
```

#### Document -- 13 custom methods, legacy RPC (MOST COMPLEX)

**Existing errors**: DocumentNotFoundError (404), DocumentPermissionDeniedError (403), DocumentLockedError (423), DocumentArchivedError (400)

**Inline type to extract**: `SearchResult` schema (id, _rowId, title, content, rank)

**Contracts to create**: Get, Create, Update, Delete, Search (returns SearchResult[]), ListByUser (stream), List (stream, cursor-paginated), ListArchived, ListChildren (stream), Archive, Restore, Publish, Unpublish, Lock, Unlock, HardDelete

```typescript
// Document.repo.ts extensions (13 custom methods):
{
  readonly findByIdOrFail: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly search: DbRepo.Method<{
    payload: {
      readonly query: string;
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly userId?: SharedEntityIds.UserId.Type;
      readonly includeArchived?: boolean;
      readonly limit?: number;
      readonly offset?: number;
    };
    success: ReadonlyArray<SearchResult.Type>;
  }>;
  readonly listByUser: DbRepo.Method<{
    payload: {
      readonly userId: SharedEntityIds.UserId.Type;
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly cursor?: DocumentsEntityIds.DocumentId.Type;
      readonly limit?: number;
    };
    success: ReadonlyArray<Document.Model.Type>;
  }>;
  readonly list: DbRepo.Method<{
    payload: {
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly parentDocumentId?: DocumentsEntityIds.DocumentId.Type | null;
      readonly search?: string;
      readonly cursor?: DocumentsEntityIds.DocumentId.Type;
      readonly limit?: number;
    };
    success: ReadonlyArray<Document.Model.Type>;
  }>;
  readonly listArchived: DbRepo.Method<{
    payload: {
      readonly organizationId: SharedEntityIds.OrganizationId.Type;
      readonly userId: SharedEntityIds.UserId.Type;
      readonly search?: string;
    };
    success: ReadonlyArray<Document.Model.Type>;
  }>;
  readonly listChildren: DbRepo.Method<{
    payload: { readonly parentDocumentId: DocumentsEntityIds.DocumentId.Type };
    success: ReadonlyArray<Document.Model.Type>;
  }>;
  readonly archive: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly restore: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly publish: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly unpublish: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly lock: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly unlock: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: Document.Model.Type;
    failure: DocumentErrors.DocumentNotFoundError;
  }>;
  readonly hardDelete: DbRepo.Method<{
    payload: { readonly id: DocumentsEntityIds.DocumentId.Type };
    success: void;
  }>;
}
```

---

### Error Annotation Migration Pattern

**Before (legacy)**:
```typescript
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";

export class DiscussionNotFoundError extends S.TaggedError<DiscussionNotFoundError>()(
  $I`DiscussionNotFoundError`,
  { id: DocumentsEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 404 })
) {}
```

**After (canonical)**:
```typescript
export class DiscussionNotFoundError extends S.TaggedError<DiscussionNotFoundError>()(
  $I`DiscussionNotFoundError`,
  { id: DocumentsEntityIds.DiscussionId },
  $I.annotationsHttp("DiscussionNotFoundError", {
    status: 404,
    description: "Error when a discussion with the specified ID cannot be found.",
  })
) {}
```

---

### Swarm Execution Steps

**Step 1: Create Team**
```
TeamCreate:
  team_name: "entity-migration-wave2"
  description: "Wave 2: Migrate Shared + Documents entities to canonical pattern"
```

**Step 2: Create Tasks (4 tasks, one per batch)**

Task 1 (simple-shared):
```
TaskCreate:
  subject: "Migrate AuditLog, Organization, Session, Team, User, PageShare to canonical pattern"
  description: "Migrate 6 simple entities (5 Shared + 1 Documents) with CRUD-only repos to canonical domain entity pattern. Organization/User have schemas/ to preserve. Team has empty team.policy.ts to delete. PageShare already PascalCase."
  activeForm: "Migrating simple shared entities"
```

Task 2 (custom-shared):
```
TaskCreate:
  subject: "Migrate File, Folder, UploadSession to canonical pattern with custom repo methods"
  description: "Migrate 3 Shared entities with custom server repo methods. File has 4 custom methods, Folder has 1, UploadSession has 5 with custom error type. Define typed repo extensions using DbRepo.Method."
  activeForm: "Migrating shared entities with custom repos"
```

Task 3 (docs-bare):
```
TaskCreate:
  subject: "Migrate DocumentFile, DocumentSource to canonical pattern"
  description: "Migrate 2 Documents bare entities with custom repo methods. DocumentFile has 5 custom methods + FileNotFoundError. DocumentSource has 1 custom method (findByMappingKey)."
  activeForm: "Migrating documents bare entities"
```

Task 4 (docs-legacy):
```
TaskCreate:
  subject: "Migrate Discussion, DocumentVersion, Document with legacy RPC dismantle"
  description: "Most complex batch: 3 Documents entities with existing error files + inline RPC definitions. Must migrate error annotations from HttpApiSchema.annotations to $I.annotationsHttp, extract inline response types to contract Success schemas, and rebuild RPC from contracts. Discussion has 7 methods, DocumentVersion has 5, Document has 13."
  activeForm: "Migrating documents entities with legacy RPC"
```

**Step 3: Spawn Teammates (4 agents)**

Agent 1 (simple-shared):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave2"
  name: "simple-shared"
  prompt: |
    You are migrating 6 simple entities to the canonical domain entity pattern.

    Read these files first:
    - `.claude/skills/canonical-domain-entity.md` (authoritative pattern)
    - `packages/documents/domain/src/entities/Comment/` (reference implementation)
    - `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P3.md` (full context)

    Entities to migrate:
    1. AuditLog (shared, `audit-log/` -> `AuditLog/`, no server repo, $SharedDomainId)
    2. Organization (shared, `organization/` -> `Organization/`, CRUD-only, has schemas/ with 3 enum schemas, $SharedDomainId)
    3. Session (shared, `session/` -> `Session/`, CRUD-only, $SharedDomainId)
    4. Team (shared, `team/` -> `Team/`, CRUD-only, DELETE empty team.policy.ts, $SharedDomainId)
    5. User (shared, `user/` -> `User/`, CRUD-only, has schemas/ + user.constants.ts, $SharedDomainId)
    6. PageShare (documents, already PascalCase, no repo, $DocumentsDomainId)

    For each entity:
    1. Create new PascalCase directory with all canonical files
    2. Move model to new directory with PascalCase name
    3. Preserve schemas/ subdirectories and extra files
    4. Create error schemas (NotFound + PermissionDenied) with $I.annotationsHttp
    5. Create repo contract with empty extensions (DbRepo.DbRepoSuccess<typeof Model, {}>)
    6. Create Get + Delete contracts
    7. Create RPC, HTTP, Tool, Entity infrastructure files
    8. Create barrel index.ts
    9. Update parent barrel export (entities/index.ts)
    10. Delete old kebab-case directory

    After ALL entities migrated:
    - Update `packages/shared/domain/src/entities/index.ts` to use PascalCase paths
    - Update `packages/documents/domain/src/entities/index.ts` if needed
    - Grep for remaining kebab-case imports: `grep -r 'from "@beep/shared-domain/entities/[a-z]' packages/`
```

Agent 2 (custom-shared):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave2"
  name: "custom-shared"
  prompt: |
    You are migrating 3 Shared entities with custom server repo methods to the canonical pattern.

    Read these files first:
    - `.claude/skills/canonical-domain-entity.md` (authoritative pattern)
    - `packages/documents/domain/src/entities/Comment/Comment.repo.ts` (reference for custom repo extensions)
    - `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P3.md` (full context)
    - `packages/shared/server/src/db/repos/File.repo.ts` (actual File repo implementation)
    - `packages/shared/server/src/db/repos/Folder.repo.ts` (actual Folder repo implementation)
    - `packages/shared/server/src/db/repos/UploadSession.repo.ts` (actual UploadSession repo implementation)

    Entities to migrate:
    1. File (shared, `file/` -> `File/`, 4 custom methods, has schemas/upload-key.schema.ts, $SharedDomainId)
    2. Folder (shared, `folder/` -> `Folder/`, 1 custom method, has schemas/with-uploaded-files.schema.ts, $SharedDomainId)
    3. UploadSession (shared, `upload-session/` -> `UploadSession/`, 5 custom methods with custom error, has schemas/upload-session-metadata.schema.ts, $SharedDomainId)

    IMPORTANT: Read the actual server repo implementations to get EXACT method signatures.
    Define repo extensions with DbRepo.Method<{payload, success, failure?}> for each custom method.
    Create contracts for EACH custom method (not just Get + Delete).

    After migration, update barrel exports and grep for remaining kebab-case imports.
```

Agent 3 (docs-bare):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave2"
  name: "docs-bare"
  prompt: |
    You are migrating 2 Documents bare entities with custom repo methods to the canonical pattern.

    Read these files first:
    - `.claude/skills/canonical-domain-entity.md` (authoritative pattern)
    - `packages/documents/domain/src/entities/Comment/` (reference implementation)
    - `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P3.md` (full context)
    - `packages/documents/server/src/db/repos/DocumentFile.repo.ts` (actual repo)
    - `packages/documents/server/src/db/repos/DocumentSource.repo.ts` (actual repo)

    Entities to migrate:
    1. DocumentFile (documents, `document-file/` -> `DocumentFile/`, 5 custom methods + FileNotFoundError, $DocumentsDomainId)
    2. DocumentSource (documents, `document-source/` -> `DocumentSource/`, 1 custom method findByMappingKey, $DocumentsDomainId)

    DocumentFile server repo has a custom `FileNotFoundError` (Data.TaggedError). Migrate to `S.TaggedError` with `$I.annotationsHttp` in the domain error file.

    Create contracts for each custom method. Read actual server repo implementations for exact signatures.
    Update `packages/documents/domain/src/entities/index.ts` barrel exports.
```

Agent 4 (docs-legacy):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave2"
  name: "docs-legacy"
  prompt: |
    You are migrating 3 Documents entities that have LEGACY INLINE RPC definitions. This is the most complex batch.

    Read these files first:
    - `.claude/skills/canonical-domain-entity.md` (authoritative pattern)
    - `packages/documents/domain/src/entities/Comment/` (canonical reference)
    - `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P3.md` (full context)
    - `packages/documents/domain/src/entities/discussion/discussion.rpc.ts` (legacy RPC to dismantle)
    - `packages/documents/domain/src/entities/discussion/discussion.errors.ts` (errors to migrate)
    - `packages/documents/domain/src/entities/document/document.rpc.ts` (legacy RPC to dismantle)
    - `packages/documents/domain/src/entities/document/document.errors.ts` (errors to migrate)
    - `packages/documents/domain/src/entities/document-version/document-version.rpc.ts` (legacy RPC)
    - `packages/documents/domain/src/entities/document-version/document-version.errors.ts` (errors)
    - `packages/documents/server/src/db/repos/Discussion.repo.ts` (actual repo)
    - `packages/documents/server/src/db/repos/Document.repo.ts` (actual repo)
    - `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` (actual repo)

    Entities to migrate:
    1. Discussion (`discussion/` -> `Discussion/`, 7 custom methods, has DiscussionWithComments inline type, $DocumentsDomainId)
    2. DocumentVersion (`document-version/` -> `DocumentVersion/`, 5 custom methods, has VersionWithAuthor inline type, $DocumentsDomainId)
    3. Document (`document/` -> `Document/`, 13 custom methods, has SearchResult inline type, $DocumentsDomainId)

    CRITICAL MIGRATION STEPS:
    1. Migrate existing error files: Change `HttpApiSchema.annotations({ status: N })` to `$I.annotationsHttp("ErrorName", { status: N, description: "..." })`
    2. Extract inline response types from RPC files to contract Success types or value schemas
    3. Create contracts/ directory with per-operation contracts derived from the inline RPC definitions
    4. Replace legacy RpcGroup.make(Rpc.make(...)) with contract-derived RpcGroup.make().pipe(RpcGroup.add(Contract.Rpc), ...)
    5. Create repo contracts with typed extensions matching server implementations
    6. Add missing HTTP, Tool, Entity infrastructure files

    The legacy `discussion.rpc.ts` defines `DiscussionWithComments` inline. Extract this to a value schema or directly into the Get contract's Success type.

    The legacy `document.rpc.ts` defines `SearchResult` inline. Extract to the Search contract's Success type.

    The legacy `document-version.rpc.ts` likely defines `VersionWithAuthor` inline (check the actual file). Extract to the GetWithAuthor contract's Success type.

    After migration, update barrel exports and grep for remaining kebab-case imports.
```

**Step 4: Assign Tasks**
```
TaskUpdate: taskId: <task-1-id>, owner: "simple-shared"
TaskUpdate: taskId: <task-2-id>, owner: "custom-shared"
TaskUpdate: taskId: <task-3-id>, owner: "docs-bare"
TaskUpdate: taskId: <task-4-id>, owner: "docs-legacy"
```

**Step 5: Monitor via TaskList**

Check periodically. If agents encounter issues, create follow-up tasks.

**Step 6: Verify Results**

After all agents complete:

```bash
# Domain packages
bun run check --filter @beep/shared-domain
bun run check --filter @beep/documents-domain

# Downstream consumers
bun run check --filter @beep/shared-tables
bun run check --filter @beep/shared-server
bun run check --filter @beep/iam-server      # Uses User, Org, Session, Team
bun run check --filter @beep/documents-tables
bun run check --filter @beep/documents-server

# Import path sweep
grep -r 'from "@beep/shared-domain/entities/[a-z]' packages/
grep -r 'from "@beep/documents-domain/entities/[a-z]' packages/
```

If errors, use `package-error-fixer` agent per package.

---

### Success Criteria

Phase 3 is complete when:
- [ ] All 14 entities have full canonical module structure
- [ ] All directories renamed to PascalCase
- [ ] Error schemas use `$I.annotationsHttp` (not legacy `HttpApiSchema.annotations`)
- [ ] Simple entities (6) have empty repo extensions + Get + Delete contracts
- [ ] Custom method entities (8) have typed repo extensions + full contract sets
- [ ] Legacy RPC files (Discussion, Document, DocumentVersion) dismantled and rebuilt from contracts
- [ ] Inline types extracted to contract Success schemas
- [ ] All domain packages pass type checks
- [ ] All downstream consumers pass type checks
- [ ] Import path sweep confirms zero remaining kebab-case subpath imports
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` + `P4_ORCHESTRATOR_PROMPT.md` created for Wave 3 (Knowledge)

### Next Phase

After completing Phase 3, create handoff for Wave 3 (Knowledge slice):
- Knowledge entities already use PascalCase (no renaming needed)
- Knowledge repos have the most complex custom methods (36 total)
- Knowledge uses older `Context.Tag` + `Layer.effect` pattern for server implementations

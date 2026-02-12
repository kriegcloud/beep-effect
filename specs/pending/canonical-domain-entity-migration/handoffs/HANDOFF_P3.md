# Phase 3 Handoff: Wave 2 — Shared + Documents Entity Migration

## Phase 2 Summary

Phase 2 migrated 23 simple CRUD entities (20 IAM + CalendarEvent + EmailTemplate + UserHotkey) to the canonical pattern:

- All 23 entities now have: PascalCase directories, error schemas (NotFound + PermissionDenied), repo contracts (empty extensions), Get + Delete contracts, RPC/HTTP/Tool/Entity infrastructure, barrel exports
- All 4 domain packages pass type checks: `@beep/iam-domain`, `@beep/calendar-domain`, `@beep/comms-domain`, `@beep/customization-domain`
- Downstream consumers fixed: 5 IAM client import paths + 1 IAM server import path updated from kebab-case to PascalCase

### Key Phase 2 Learnings

1. **MCP refactor tools were unreliable for directory renames** -- agents fell back to manual file creation. For Wave 2, prefer direct file creation in new PascalCase directories + old directory deletion.
2. **Downstream import paths break on rename** -- TypeScript path aliases with wildcards are case-sensitive on Linux. Must grep for remaining kebab-case imports after rename.
3. **Barrel re-exports mask issues** -- `import { Entities } from "@beep/shared-domain"` works regardless of directory naming, but direct subpath imports like `@beep/shared-domain/entities/user` break when renamed to `User`.
4. **Post-migration import sweep is mandatory** -- after every rename wave, run: `grep -r 'from "@beep/<pkg>/entities/[a-z]' packages/` to catch ALL downstream breakage.

---

## Wave 2 Scope

### Entity Inventory

**14 entities to migrate** across 2 slices:

#### Shared Domain (8 entities — all bare, kebab-case)

| Entity | Current Dir | Has schemas/ | Has Extra Files | Server Repo Location | Custom Methods |
|--------|-----------|-------------|----------------|---------------------|---------------|
| AuditLog | `audit-log/` | No | No | **None** | N/A |
| File | `file/` | Yes (`upload-key.schema.ts`) | No | `@beep/shared-server` | **4**: listPaginated, moveFiles, deleteFiles, getFilesByKeys |
| Folder | `folder/` | Yes (`with-uploaded-files.schema.ts`) | No | `@beep/shared-server` | **1**: deleteFolders |
| Organization | `organization/` | Yes (3 enum schemas) | No | `@beep/iam-server` (cross-slice) | CRUD only |
| Session | `session/` | No | No | `@beep/iam-server` (cross-slice) | CRUD only |
| Team | `team/` | No | `team.policy.ts` (empty) | `@beep/iam-server` (cross-slice) | CRUD only |
| UploadSession | `upload-session/` | Yes (`upload-session-metadata.schema.ts`) | No | `@beep/shared-server` | **5**: store, findByFileKey, deleteByFileKey, deleteExpired, isValid |
| User | `user/` | Yes (`user-role.schema.ts`) | `user.constants.ts` | `@beep/iam-server` (cross-slice) | CRUD only |

#### Documents Domain (6 entities — 3 partial, 3 bare)

| Entity | Current Dir | Naming | Status | Custom Methods | Legacy RPC? |
|--------|-----------|--------|--------|---------------|-------------|
| Discussion | `discussion/` | kebab | Partial (has errors + rpc) | **7**: findByIdOrFail, getWithComments, listByDocument, create, resolve, unresolve, hardDelete | Yes |
| Document | `document/` | kebab | Partial (has errors + rpc) | **13**: findByIdOrFail, search, listByUser, list, listArchived, listChildren, archive, restore, publish, unpublish, lock, unlock, hardDelete | Yes |
| DocumentFile | `document-file/` | kebab | Bare | **5**: findByIdOrFail, listByDocument, listByUser, create, hardDelete | No |
| DocumentSource | `document-source/` | kebab | Bare | **1**: findByMappingKey | No |
| DocumentVersion | `document-version/` | kebab | Partial (has errors + rpc) | **5**: findByIdOrFail, getWithAuthor, listByDocument, createSnapshot, hardDelete | Yes |
| PageShare | `PageShare/` | PascalCase | Bare | **None** (no repo) | No |

**Already canonical (no work needed):** Comment (5 contracts), Page (15 contracts)

---

## Batching Strategy

### Batch 1: Simple Shared Entities (CRUD-only or no repo)

**Entities**: AuditLog, Organization, Session, Team, User, PageShare (6 entities)

**Characteristics**:
- All CRUD-only or no server repo
- Follow exact Wave 1 pattern: error schemas, empty repo extensions, Get + Delete contracts
- User/Organization/Session/Team repos live in `@beep/iam-server` (cross-slice) -- repo contract still goes in domain
- AuditLog has no server repo at all
- PageShare already PascalCase (no rename needed)
- Team has empty `team.policy.ts` -- delete during migration
- User has `user.constants.ts` to preserve

**Identity builder**: `$SharedDomainId` for all except PageShare which uses `$DocumentsDomainId`

### Batch 2: Shared Entities with Custom Methods

**Entities**: File, Folder, UploadSession (3 entities)

**Characteristics**:
- Each has custom server repo methods requiring typed contracts
- File: 4 custom methods (listPaginated, moveFiles, deleteFiles, getFilesByKeys)
- Folder: 1 custom method (deleteFolders)
- UploadSession: 5 custom methods (store, findByFileKey, deleteByFileKey, deleteExpired, isValid)
- Repo extensions must match server implementations using `DbRepo.Method<{...}>`
- Has schemas/ subdirectories to preserve

**Identity builder**: `$SharedDomainId`

### Batch 3: Documents Bare + Simple Entities

**Entities**: DocumentFile, DocumentSource (2 entities)

**Characteristics**:
- DocumentFile: 5 custom methods, bare model (no existing errors/rpc)
- DocumentSource: 1 custom method (findByMappingKey), bare model
- Rename from kebab-case to PascalCase
- Create full canonical structure from scratch

**Identity builder**: `$DocumentsDomainId`

### Batch 4: Documents Partial Entities (Legacy RPC Dismantle)

**Entities**: Discussion, DocumentVersion, Document (3 entities)

**Characteristics**:
- **Most complex batch** -- legacy inline RPC definitions must be dismantled and rebuilt as contracts
- Discussion: 7 custom methods, has `DiscussionWithComments` inline type
- DocumentVersion: 5 custom methods, has `VersionWithAuthorSchema` inline type
- Document: 13 custom methods (most complex entity), has `SearchResultSchema` inline type
- Existing error schemas need migration from `HttpApiSchema.annotations({ status: N })` to `$I.annotationsHttp(...)`
- Existing RPC files must be replaced with contract-derived RpcGroup
- Custom return types must be extracted to dedicated schema files or contract Success types

**Identity builder**: `$DocumentsDomainId`

---

## Critical Patterns for Wave 2

### Identity Builders

```typescript
// Shared entities
import { $SharedDomainId } from "@beep/identity/packages";
const $I = $SharedDomainId.create("entities/User/User.model");

// Documents entities
import { $DocumentsDomainId } from "@beep/identity/packages";
const $I = $DocumentsDomainId.create("entities/Discussion/Discussion.model");
```

### Repo Contract with Custom Extensions (NEW for Wave 2)

```typescript
import { DbRepo } from "@beep/shared-server/factories";
import * as Context from "effect/Context";

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof File.Model,
  {
    readonly listPaginated: DbRepo.Method<{
      payload: { readonly folderId: SharedEntityIds.FolderId.Type; readonly offset: number; readonly limit: number };
      success: { readonly rootFiles: ReadonlyArray<File.Model.Type>; readonly folders: ReadonlyArray<Folder.Model.Type>; readonly total: number; readonly offset: number; readonly limit: number; readonly hasNext: boolean };
    }>;
    readonly moveFiles: DbRepo.Method<{
      payload: { readonly fileIds: ReadonlyArray<SharedEntityIds.FileId.Type>; readonly targetFolderId: SharedEntityIds.FolderId.Type };
      success: void;
    }>;
    // ... other custom methods
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

### Legacy RPC Dismantle Pattern (Discussion, Document, DocumentVersion)

**Before (legacy inline RPC in discussion.rpc.ts)**:
```typescript
// This entire file gets replaced by contracts + contract-derived RpcGroup
export const DiscussionWithComments = S.Struct({...});
export const DiscussionRpcs = RpcGroup.make("Discussion").pipe(
  RpcGroup.add(GetDiscussion),
  RpcGroup.add(CreateDiscussion),
  // ... inline definitions
);
```

**After (canonical contract-derived RpcGroup in Discussion.rpc.ts)**:
```typescript
import * as GetContract from "./contracts/Get.contract";
import * as CreateContract from "./contracts/Create.contract";
import * as ListByDocumentContract from "./contracts/ListByDocument.contract";
// ...
import * as RpcGroup from "@effect/rpc/RpcGroup";

export const Rpcs = RpcGroup.make("Discussion").pipe(
  RpcGroup.add(GetContract.Contract.Rpc),
  RpcGroup.add(CreateContract.Contract.Rpc),
  RpcGroup.add(ListByDocumentContract.Contract.Rpc),
  // ... all contracts
);
```

### Custom Return Type Extraction

Inline types in legacy RPC files must be extracted to contract Success types:

| Inline Type | Extract To | Description |
|------------|------------|-------------|
| `DiscussionWithComments` | `Get.contract.ts` Success | Discussion + author + comments[] with authors |
| `SearchResultSchema` | `Search.contract.ts` Success | Search result with id, title, content, rank |
| `VersionWithAuthorSchema` | `Get.contract.ts` Success (DocumentVersion) | Version + author details |
| `ListPaginatedOutput` | `ListPaginated.contract.ts` Success (File) | rootFiles, folders, total, offset, limit, hasNext |

### Downstream Consumer Verification

After migration, verify ALL consumers (not just domain packages):

```bash
# Shared domain + all consumers
bun run check --filter @beep/shared-domain
bun run check --filter @beep/shared-tables
bun run check --filter @beep/shared-server
bun run check --filter @beep/iam-server  # Uses User, Org, Session, Team repos

# Documents domain + consumers
bun run check --filter @beep/documents-domain
bun run check --filter @beep/documents-tables
bun run check --filter @beep/documents-server

# Import path sweep
grep -r 'from "@beep/shared-domain/entities/[a-z]' packages/
grep -r 'from "@beep/documents-domain/entities/[a-z]' packages/
```

---

## Cross-Slice Repo Mapping

These entities have domain models in one package but server repos in another:

| Entity | Domain Package | Server Repo Package | Repo File |
|--------|---------------|--------------------|-----------|
| User | `@beep/shared-domain` | `@beep/iam-server` | `src/db/repos/User.repo.ts` |
| Organization | `@beep/shared-domain` | `@beep/iam-server` | `src/db/repos/Organization.repo.ts` |
| Session | `@beep/shared-domain` | `@beep/iam-server` | `src/db/repos/Session.repo.ts` |
| Team | `@beep/shared-domain` | `@beep/iam-server` | `src/db/repos/Team.repo.ts` |

**Impact**: The repo *contract* (Context.Tag + type) goes in the domain package. The repo *implementation* stays in the server package. Agents must not move server implementations.

---

## EntityId Reference for Wave 2

### Shared EntityIds (from `@beep/shared-domain`)

```typescript
import { SharedEntityIds } from "@beep/shared-domain";

SharedEntityIds.UserId
SharedEntityIds.OrganizationId
SharedEntityIds.TeamId
SharedEntityIds.SessionId
SharedEntityIds.FileId
SharedEntityIds.FolderId
SharedEntityIds.AuditLogId  // Verify existence
SharedEntityIds.UploadSessionId  // Verify existence
```

### Documents EntityIds (from `@beep/shared-domain`)

```typescript
import { DocumentsEntityIds } from "@beep/shared-domain";

DocumentsEntityIds.DocumentId
DocumentsEntityIds.DocumentVersionId
DocumentsEntityIds.CommentId
DocumentsEntityIds.DiscussionId
DocumentsEntityIds.DocumentFileId  // Verify existence
DocumentsEntityIds.DocumentSourceId  // Verify existence
DocumentsEntityIds.PageShareId  // Verify existence
```

**IMPORTANT**: Verify all EntityIds exist before coding. If any are missing, create them in the EntityIds file first.

---

## Known Gotchas

1. **team.policy.ts is empty** -- Delete it during Team migration, don't preserve it.
2. **user.constants.ts exists** -- Preserve and re-export during User migration.
3. **Organization has 3 enum schemas** -- OrganizationType, SubscriptionTier, SubscriptionStatus must be preserved in schemas/.
4. **PageShare is already PascalCase** -- No rename needed, just add canonical files.
5. **Discussion/Document/DocumentVersion have existing error files** -- Must be migrated from `HttpApiSchema.annotations` to `$I.annotationsHttp` pattern, not just renamed.
6. **Custom return types are inline in RPC files** -- Must be extracted to contracts before RPC files can be replaced.
7. **Cross-slice repos** -- User/Org/Session/Team repo implementations are in `@beep/iam-server`. The domain repo contract type goes in `@beep/shared-domain`, but don't touch server implementations.
8. **File/Folder/UploadSession have complex custom methods** -- Read actual server repo implementations to understand exact method signatures before defining contracts.

---

## Success Criteria

Phase 3 is complete when:
- [ ] All 14 entities have full canonical module structure
- [ ] All directories renamed to PascalCase (except PageShare which is already PascalCase)
- [ ] All entities have error schemas with correct HTTP status annotations via `$I.annotationsHttp`
- [ ] Simple entities (6) have repo contracts with empty extensions + Get + Delete contracts
- [ ] Custom method entities (8) have repo contracts with typed extensions + full contract set
- [ ] Legacy RPC definitions (Discussion, Document, DocumentVersion) dismantled and rebuilt from contracts
- [ ] Custom return types extracted to contract Success schemas
- [ ] All entities have RPC, HTTP, Tool, Entity infrastructure files
- [ ] All entities have correct barrel exports
- [ ] `bun run check` passes for `@beep/shared-domain` and `@beep/documents-domain`
- [ ] Downstream consumers verified: `@beep/shared-tables`, `@beep/shared-server`, `@beep/iam-server`, `@beep/documents-tables`, `@beep/documents-server`
- [ ] Import path sweep confirms zero remaining kebab-case subpath imports
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created for Wave 3 (Knowledge slice)
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

---

## Reference Files

- **Canonical entity**: `packages/documents/domain/src/entities/Comment/` (5 contracts with custom repo methods)
- **Complex canonical entity**: `packages/documents/domain/src/entities/Page/` (15 contracts)
- **Skill reference**: `.claude/skills/canonical-domain-entity.md`
- **Server repos (Shared)**: `packages/shared/server/src/db/repos/`
- **Server repos (Documents)**: `packages/documents/server/src/db/repos/`
- **Server repos (IAM cross-slice)**: `packages/iam/server/src/db/repos/`
- **Verified inventory**: `specs/pending/canonical-domain-entity-migration/outputs/verified-inventory.md`
- **Phase 2 reflection**: `specs/pending/canonical-domain-entity-migration/REFLECTION_LOG.md`

---

*Created: 2026-02-11*
*Spec: canonical-domain-entity-migration*
*Phase: 3 (Wave 2: Shared + Documents)*

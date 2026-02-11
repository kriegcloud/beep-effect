# DbRepo Standardization: Dependency Inventory

> Complete inventory of all files affected by the BaseRepo interface refactoring.

---

## 1. Core Factory Files (2 files being modified)

| File | Purpose | Layer |
|------|---------|-------|
| `packages/shared/domain/src/factories/db-repo.ts` | Type-level `BaseRepo`, `DbRepoSuccess`, `DbRepo`, `Method`, `MethodSpec` contracts | domain |
| `packages/shared/server/src/factories/db-repo.ts` | Runtime `make()` factory + re-exported type aliases | server |

### Barrel/Index Files

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/factories/index.ts` | Re-exports `DbRepo` as type namespace |
| `packages/shared/server/src/factories/index.ts` | Re-exports `DbRepo` as runtime namespace |

---

## 2. Domain Repo Contracts

| File | Types Referenced | Slice | Impact |
|------|-----------------|-------|--------|
| `packages/documents/domain/src/entities/Comment/Comment.repo.ts` | `DbRepo.DbRepoSuccess`, `DbRepo.Method` (3 custom methods) | documents | **HIGH** -- uses `DbRepoSuccess<Model, { listByDiscussion, updateContent, hardDelete }>`. Auto-updates when `BaseRepo` changes, but `DbRepo.Method` custom methods must be reviewed. |
| `packages/comms/domain/src/repos/email-template.repo.ts` | `DbRepo.DbRepo` (commented out) | comms | **NONE** -- entire file is commented out |

---

## 3. Server Repo Implementations (46 files calling `DbRepo.make`)

### 3a. Shared Slice (3 repos)

| File | Internal baseRepo Calls | Custom Methods |
|------|------------------------|----------------|
| `packages/shared/server/src/db/repos/File.repo.ts` | `...baseRepo` spread (exposes all CRUD) | `listPaginated`, `moveFiles`, `deleteFiles`, `getFilesByKeys` |
| `packages/shared/server/src/db/repos/Folder.repo.ts` | `...baseRepo` spread | `deleteFolders` |
| `packages/shared/server/src/db/repos/UploadSession.repo.ts` | `...baseRepo` spread | `store`, `findByFileKey`, `deleteByFileKey`, `deleteExpired`, `isValid` |

### 3b. IAM Slice (20 repos)

All IAM repos use `DbRepo.make` with no internal `baseRepo.*` calls. They either `return yield* DbRepo.make(...)` directly or use `effect: DbRepo.make(...)` as the service effect. The base CRUD methods are exposed as-is to consumers.

| File | Pattern |
|------|---------|
| `packages/iam/server/src/db/repos/Account.repo.ts` | `return yield* DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/ApiKey.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/DeviceCode.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Invitation.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Jwks.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Member.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Organization.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/OrganizationRole.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Passkey.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/RateLimit.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/ScimProvider.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Session.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/SsoProvider.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Subscription.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Team.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/TeamMember.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/TwoFactor.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/User.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/Verification.repo.ts` | `effect: DbRepo.make(...)` |
| `packages/iam/server/src/db/repos/WalletAddress.repo.ts` | `effect: DbRepo.make(...)` |

### 3c. Documents Slice (6 repos)

| File | baseRepo Methods Called Internally | Custom Methods |
|------|-----------------------------------|----------------|
| `packages/documents/server/src/db/repos/Comment.repo.ts` | `findById`, `insert` (via `flow`), `update`, `delete` | `findByIdOrFail`, `listByDiscussion`, `create`, `updateContent`, `hardDelete` |
| `packages/documents/server/src/db/repos/Document.repo.ts` | `findById`, `update` (6 calls), `delete` | `findByIdOrFail`, `search`, `listByUser`, `list`, `listArchived`, `listChildren`, `archive`, `restore`, `publish`, `unpublish`, `lock`, `unlock`, `hardDelete` |
| `packages/documents/server/src/db/repos/Discussion.repo.ts` | `findById`, `insert`, `update` (2 calls), `delete` | `findByIdOrFail`, `getWithComments`, `listByDocument`, `create`, `resolve`, `unresolve`, `hardDelete` |
| `packages/documents/server/src/db/repos/DocumentFile.repo.ts` | `findById`, `insert`, `delete` | `findByIdOrFail`, `listByDocument`, `listByUser`, `create`, `hardDelete` |
| `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` | `findById`, `insert`, `delete` | `findByIdOrFail`, `getWithAuthor`, `listByDocument`, `createSnapshot`, `hardDelete` |
| `packages/documents/server/src/db/repos/DocumentSource.repo.ts` | `...baseRepo` spread only | `findByMappingKey` |

### 3d. Knowledge Slice (14 repos)

All Knowledge repos use `DbRepo.make` with custom extensions via a `maker` Effect. Custom extensions contain their own SQL queries and do NOT call `baseRepo.*` internally. Base CRUD is spread via the `DbRepo.make` return value.

| File |
|------|
| `packages/knowledge/server/src/db/repos/ClassDefinition.repo.ts` |
| `packages/knowledge/server/src/db/repos/Embedding.repo.ts` |
| `packages/knowledge/server/src/db/repos/Entity.repo.ts` |
| `packages/knowledge/server/src/db/repos/EntityCluster.repo.ts` |
| `packages/knowledge/server/src/db/repos/MeetingPrepBullet.repo.ts` |
| `packages/knowledge/server/src/db/repos/MeetingPrepEvidence.repo.ts` |
| `packages/knowledge/server/src/db/repos/Mention.repo.ts` |
| `packages/knowledge/server/src/db/repos/MentionRecord.repo.ts` |
| `packages/knowledge/server/src/db/repos/MergeHistory.repo.ts` |
| `packages/knowledge/server/src/db/repos/Ontology.repo.ts` |
| `packages/knowledge/server/src/db/repos/PropertyDefinition.repo.ts` |
| `packages/knowledge/server/src/db/repos/Relation.repo.ts` |
| `packages/knowledge/server/src/db/repos/RelationEvidence.repo.ts` |
| `packages/knowledge/server/src/db/repos/SameAsLink.repo.ts` |

### 3e. Calendar Slice (1 repo)

| File | Pattern |
|------|---------|
| `packages/calendar/server/src/db/repos/CalendarEvent.repo.ts` | `return yield* DbRepo.make(...)` -- no internal calls |

### 3f. Customization Slice (1 repo)

| File | Pattern |
|------|---------|
| `packages/customization/server/src/db/repos/UserHotkey.repo.ts` | `return yield* DbRepo.make(...)` -- no internal calls |

### 3g. Comms Slice (1 repo)

| File | Pattern |
|------|---------|
| `packages/comms/server/src/db/repos/Placeholder.repo.ts` | `return yield* DbRepo.make(...)` -- no internal calls |

---

## 4. Service/Handler Call Sites (runtime method calls needing manual update)

### 4a. Documents Handlers

| File | Methods Called |
|------|--------------|
| `packages/documents/server/src/handlers/Document.handlers.ts` | `repo.insert(insertData)`, `repo.update(payload)`, `repo.hardDelete(payload.id)` |
| `packages/documents/server/src/handlers/Comment.handlers.ts` | `repo.create(insertData)`, `repo.hardDelete(payload.id)` |
| `packages/documents/server/src/handlers/Discussion.handlers.ts` | `discussionRepo.create(insertData)`, `commentRepo.create(commentInsertData)`, `discussionRepo.hardDelete(payload.id)` |

### 4b. Knowledge Services

| File | Methods Called |
|------|--------------|
| `packages/knowledge/server/src/EntityResolution/SplitService.ts` | `entityRepo.findById(params.entityId)` (3x), `entityRepo.insert({...})` (2x), `mergeHistoryRepo.findById(mergeHistoryId)` |
| `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` | `repo.insert({...})` |
| `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts` | `entityRepo.insert({...})` |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | `repo.insertVoid({...})` |
| `packages/knowledge/server/src/rpc/v1/meetingprep/generate.ts` | `bulletRepo.insert(bulletInsert)`, `evidenceRepo.insertVoid(evidenceInsert)` |

### 4c. Shared Services

| File | Methods Called |
|------|--------------|
| `packages/shared/server/src/rpc/v1/files/create-folder.ts` | `folderRepo.insert({...})` |

### 4d. Doc-Only References (no code changes needed)

| File | Nature |
|------|--------|
| `packages/shared/domain/src/audit/AuditLogService.ts` | JSDoc examples only |

---

## 5. Test Files

| File | Methods Used | Slice | Impact |
|------|-------------|-------|--------|
| `packages/_internal/db-admin/test/AccountRepo.test.ts` | All 7 CRUD methods (100+ direct calls) | _internal | **CRITICAL** |
| `packages/_internal/db-admin/test/DatabaseError.test.ts` | `insert` (~15 calls testing constraint violations) | _internal | Medium |
| `packages/_internal/db-admin/test/hardening/DemoCriticalPathHardening.test.ts` | `insert` (commented out only) | _internal | None |
| `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` | Stubs: all 7 CRUD methods (mock BaseRepo interface) | knowledge | **HIGH** -- mock stubs must match new interface |
| `packages/knowledge/server/test/_shared/TestLayers.ts` | Repo type references for test layer construction | knowledge | Type-level |

---

## 6. Tooling Files

| File | Reference | Impact |
|------|-----------|--------|
| `tooling/cli/src/commands/create-slice/utils/file-generator.ts` | Template string containing `DbRepo.make` boilerplate | Template needs update for new patterns |
| `tooling/testkit/src/rls/helpers.ts` | `repo.insert` in JSDoc example | Doc-only |

---

## 7. Summary Statistics

### By Category

| Category | File Count |
|----------|-----------|
| Core Factory Files | 2 |
| Barrel/Index Files | 2 |
| Domain Repo Contracts (active) | 1 |
| Server Repo Implementations | 46 |
| Service/Handler Call Sites | 8 |
| Test Files (active calls) | 4 |
| Tooling Templates | 1 |
| Doc-only References | 2 |
| **Total Unique Source Files** | **66** |

### By Slice

| Slice | Repos | Call Sites | Tests | Total |
|-------|-------|------------|-------|-------|
| shared | 3 | 1 | 0 | 4 |
| iam | 20 | 0 | 0 | 20 |
| documents | 6 | 3 | 0 | 9 |
| knowledge | 14 | 5 | 2 | 21 |
| calendar | 1 | 0 | 0 | 1 |
| customization | 1 | 0 | 0 | 1 |
| comms | 1 | 0 | 0 | 1 |
| _internal | 0 | 0 | 3 | 3 |
| tooling | 0 | 0 | 0 | 1 |

### By Impact Level

**Auto-update (type flows through, no manual code changes):**
- 38 repos (IAM 20, Knowledge 14, Calendar 1, Customization 1, Comms 1, Shared 1 DocumentSource) that use `DbRepo.make` and expose base CRUD unmodified via spread

**Manual update required (runtime call site changes):**
- 5 Documents server repos with internal `baseRepo.*` calls
- 3 Documents handler files
- 5 Knowledge service files
- 1 Shared server handler
- 2 Test files with 115+ direct calls
- 1 Test file with mock stubs implementing full `BaseRepo` interface

**Special attention:**
- `packages/documents/domain/src/entities/Comment/Comment.repo.ts` -- uses `DbRepo.Method` for 3 custom methods. The `Method` type is NOT being changed, but `DbRepoSuccess` includes `BaseRepo`, so `RepoShape` auto-updates.
- `packages/documents/server/src/db/repos/Comment.repo.ts` -- uses `flow(baseRepo.insert, ...)` pattern that needs adjustment for new return shape.

---

## 8. Import Graph

```
@beep/shared-domain/factories/db-repo
  Imported by (type-only):
    -> @beep/shared-server/factories/db-repo (re-exports types)
    -> @beep/documents-domain (Comment.repo.ts uses DbRepoSuccess, Method)

@beep/shared-server/factories/db-repo
  Imported by (runtime):
    -> packages/shared/server/src/db/repos/*.repo.ts (3 files)
    -> packages/iam/server/src/db/repos/*.repo.ts (20 files)
    -> packages/documents/server/src/db/repos/*.repo.ts (6 files)
    -> packages/knowledge/server/src/db/repos/*.repo.ts (14 files)
    -> packages/calendar/server/src/db/repos/*.repo.ts (1 file)
    -> packages/customization/server/src/db/repos/*.repo.ts (1 file)
    -> packages/comms/server/src/db/repos/*.repo.ts (1 file)
    -> tooling/cli (template string)
```

---

## 9. Migration Recommendations

1. **Change core, let types flow**: Modify `BaseRepo` interface and `makeBaseRepo` implementation. The 38 "simple" repos auto-expose new signatures.

2. **Prioritize Documents repos**: 5 repos with internal `baseRepo.*` calls need surgical updates.

3. **Knowledge service call sites**: `SplitService.ts` is the most complex with 6 calls to `findById`/`insert`.

4. **Test files first**: Update `AccountRepo.test.ts` (115+ calls) and `CrossBatchEntityResolver.test.ts` (mock stubs) early to validate the new interface.

5. **Do NOT change `DbRepo.Method`**: Independent from `BaseRepo`, should not be modified.

6. **Do NOT modify commented-out files**: `comms/domain/src/repos/email-template.repo.ts` is dead code.
